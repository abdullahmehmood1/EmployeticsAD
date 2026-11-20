#!/usr/bin/env python3
"""
Zero-Blink True-NVIDIA-GPU Product Commercial Pipeline (Colab & Local)
----------------------------------------------------------------------
1. Verifies studio voiceover + soundtrack (`public/audio/master_audio.wav`) is present & loud.
2. Renders 100% deterministic, zero-flicker transparent RGBA UI layers via Remotion.
3. On NVIDIA CUDA GPU (Google Colab L4 / T4 / A100):
   - Runs a real-time PyTorch CUDA GPU Liquid Aurora Shader + Physical Gaussian Optical Bloom
     + Alpha Compositing + Optical Vignette directly on GPU across all 2,700 frames (45s @ 60fps).
   - Pipes raw RGB24 frames straight from CUDA GPU into NVIDIA NVENC (`h264_nvenc`)
     while explicitly muxing `public/audio/master_audio.wav` into AAC 256kbps stereo!
4. Monitors live `nvidia-smi` GPU utilization + VRAM and verifies final MP4 streams & loudness.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import glob
import json
import math
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.io import wavfile

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT_DIR / "out"
AUDIO_WAV = ROOT_DIR / "public" / "audio" / "master_audio.wav"


def find_binary(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found
    for pattern in [
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / name),
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / f"{name}.exe"),
    ]:
        matches = glob.glob(pattern)
        if matches:
            return matches[0]
    return None


def detect_nvidia_gpu() -> str | None:
    if not shutil.which("nvidia-smi"):
        return None
    try:
        res = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if res.returncode == 0 and res.stdout.strip():
            return res.stdout.strip().splitlines()[0]
    except Exception:
        pass
    return None


def has_nvenc(ffmpeg_bin: str | None) -> bool:
    if not ffmpeg_bin:
        return False
    try:
        res = subprocess.run(
            [ffmpeg_bin, "-hide_banner", "-encoders"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return "h264_nvenc" in res.stdout
    except Exception:
        return False


def has_torch_cuda() -> bool:
    try:
        import torch  # type: ignore

        return bool(torch.cuda.is_available())
    except Exception:
        return False


def ensure_audio_ready() -> Path:
    if not AUDIO_WAV.exists() or AUDIO_WAV.stat().st_size < 100_000:
        print("[Audio] master_audio.wav missing -> running scripts/generate_audio.py --engine edge...")
        res = subprocess.run(
            [sys.executable, str(ROOT_DIR / "scripts" / "generate_audio.py"), "--engine", "edge"],
            cwd=ROOT_DIR,
        )
        if res.returncode != 0:
            raise RuntimeError("Failed to generate voiceover/soundtrack audio.")

    sr, data = wavfile.read(str(AUDIO_WAV))
    arr = data.astype(np.float32) / 32768.0 if np.issubdtype(data.dtype, np.integer) else data.astype(np.float32)
    rms_db = 20.0 * math.log10(float(np.sqrt(np.mean(arr**2))) + 1e-12)
    dur_s = len(arr) / float(sr)
    print(f"[Audio] Verified {AUDIO_WAV.name}: {dur_s:.2f}s @ {sr}Hz | RMS={rms_db:.1f} dBFS")
    if rms_db < -55.0:
        raise RuntimeError(f"Audio track {AUDIO_WAV} appears silent ({rms_db:.1f} dBFS)!")
    return AUDIO_WAV


class GpuMonitor:
    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled and shutil.which("nvidia-smi") is not None
        self._stop = threading.Event()
        self.peak_util = 0
        self.peak_mem_mib = 0
        self.samples: list[int] = []
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if not self.enabled:
            return
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                res = subprocess.run(
                    [
                        "nvidia-smi",
                        "--query-gpu=utilization.gpu,memory.used",
                        "--format=csv,noheader,nounits",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=3,
                )
                if res.returncode == 0 and res.stdout.strip():
                    parts = [p.strip() for p in res.stdout.strip().splitlines()[0].split(",")]
                    if len(parts) >= 2:
                        u = int(float(parts[0]))
                        m = int(float(parts[1]))
                        self.samples.append(u)
                        self.peak_util = max(self.peak_util, u)
                        self.peak_mem_mib = max(self.peak_mem_mib, m)
            except Exception:
                pass
            self._stop.wait(0.75)

    def stop(self) -> None:
        if not self.enabled:
            return
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=3)


def sorted_frame_files(frames_dir: Path, ext: str) -> list[Path]:
    files = list(frames_dir.glob(f"*.{ext}"))
    if not files:
        raise RuntimeError(f"No .{ext} frames found in {frames_dir}")

    def frame_num(p: Path) -> int:
        m = re.search(r"(\d+)(?=\.[^.]+$)", p.name)
        return int(m.group(1)) if m else 0

    return sorted(files, key=frame_num)


def interpolate_palette(frame_idx: int) -> tuple[tuple[float, float, float], tuple[float, float, float]]:
    """Narrative RGB aurora color evolution across all 2,700 frames (45s)."""
    keyframes = [
        (0, (0.95, 0.25, 0.37), (0.39, 0.40, 0.95)),     # 0-7s: Problem (Crimson + Indigo)
        (380, (0.92, 0.20, 0.34), (0.96, 0.62, 0.04)),   # Resignation impact
        (460, (0.39, 0.40, 0.95), (0.04, 0.71, 0.83)),   # 7-15s: Employetics Connect & Score
        (900, (0.96, 0.62, 0.04), (0.39, 0.40, 0.95)),   # 15-23s: Explainable Drivers & Privacy
        (1380, (0.04, 0.71, 0.83), (0.54, 0.36, 0.96)),  # 23-33s: 1-Click Rebalance & AI Copilot
        (1980, (0.06, 0.75, 0.52), (0.13, 0.83, 0.93)),  # 33-39s: Healthy Outcome & Retention
        (2340, (0.39, 0.40, 0.95), (0.13, 0.83, 0.93)),  # 39-45s: Employetics Brand Finale
        (2700, (0.39, 0.40, 0.95), (0.54, 0.36, 0.96)),
    ]
    for i in range(len(keyframes) - 1):
        f0, a0, b0 = keyframes[i]
        f1, a1, b1 = keyframes[i + 1]
        if f0 <= frame_idx <= f1:
            t = (frame_idx - f0) / max(1, f1 - f0)
            c1 = tuple(a0[k] + (a1[k] - a0[k]) * t for k in range(3))
            c2 = tuple(b0[k] + (b1[k] - b0[k]) * t for k in range(3))
            return c1, c2
    return keyframes[-1][1], keyframes[-1][2]


def load_rgba_png(path: Path) -> np.ndarray:
    with Image.open(path) as im:
        return np.asarray(im.convert("RGBA"), dtype=np.uint8)


def cuda_composite_and_nvenc(
    frame_files: list[Path],
    audio_wav: Path,
    output_path: Path,
    ffmpeg_bin: str,
    use_nvenc: bool,
    crf: int,
) -> None:
    """
    True NVIDIA CUDA GPU Compositor:
    - Generates smooth 60fps liquid aurora shader on CUDA GPU (zero flicker!)
    - Applies physical separable Gaussian optical bloom on bright UI elements on CUDA GPU
    - Alpha-composites transparent Remotion RGBA frames + optical vignette
    - Streams raw RGB24 frames straight into NVIDIA NVENC (`h264_nvenc`) + AAC 256k audio mux
    """
    import torch  # type: ignore
    import torch.nn.functional as F  # type: ignore

    device = torch.device("cuda")
    first = load_rgba_png(frame_files[0])
    H, W = first.shape[0], first.shape[1]

    print(f"[CUDA GPU] Initializing {W}x{H} Liquid Aurora + Optical Bloom Shader on {torch.cuda.get_device_name(0)}...")

    ys = torch.linspace(-1.0, 1.0, H, device=device, dtype=torch.float32)
    xs = torch.linspace(-1.0, 1.0, W, device=device, dtype=torch.float32)
    gy, gx = torch.meshgrid(ys, xs, indexing="ij")
    aspect = W / float(H)
    px = gx * aspect
    py = gy

    v_grad = (gy * 0.5 + 0.5).unsqueeze(0)
    base_top = torch.tensor([0.032, 0.052, 0.115], device=device).view(3, 1, 1)
    base_bot = torch.tensor([0.012, 0.020, 0.048], device=device).view(3, 1, 1)
    base_canvas = base_bot * v_grad + base_top * (1.0 - v_grad)

    rad = torch.sqrt(px * px * 0.52 + py * py * 0.90)
    vignette = torch.clamp(1.08 - rad * 0.44, 0.45, 1.0).unsqueeze(0)

    k_size = 21
    sigma = 5.5
    coords = torch.arange(k_size, device=device, dtype=torch.float32) - (k_size - 1) / 2.0
    g1d = torch.exp(-(coords * coords) / (2.0 * sigma * sigma))
    g1d = g1d / g1d.sum()
    k_h = g1d.view(1, 1, 1, k_size).repeat(3, 1, 1, 1)
    k_v = g1d.view(1, 1, k_size, 1).repeat(3, 1, 1, 1)

    if use_nvenc:
        vcodec_args = [
            "-c:v", "h264_nvenc",
            "-preset", "p6",
            "-tune", "hq",
            "-rc", "vbr",
            "-cq", str(crf),
            "-b:v", "0",
            "-pix_fmt", "yuv420p",
        ]
    else:
        vcodec_args = [
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", str(crf),
            "-pix_fmt", "yuv420p",
        ]

    ffmpeg_cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", "60", "-i", "pipe:0",
        "-i", str(audio_wav),
        "-map", "0:v:0", "-map", "1:a:0",
        *vcodec_args,
        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
        "-shortest", "-movflags", "+faststart", str(output_path),
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None

    total = len(frame_files)
    t_start = time.time()

    try:
        with ThreadPoolExecutor(max_workers=4) as pool, torch.no_grad():
            futures = [pool.submit(load_rgba_png, p) for p in frame_files[:8]]
            next_submit = 8

            for idx in range(total):
                rgba_np = futures[idx].result()
                futures[idx] = None
                if next_submit < total:
                    futures.append(pool.submit(load_rgba_png, frame_files[next_submit]))
                    next_submit += 1

                rgba = torch.from_numpy(rgba_np).to(device, non_blocking=True).float() / 255.0
                fg_rgb = rgba[..., :3].permute(2, 0, 1)
                fg_a = rgba[..., 3:4].permute(2, 0, 1)

                t = idx / 60.0
                c1_tup, c2_tup = interpolate_palette(idx)
                c1 = torch.tensor(c1_tup, device=device, dtype=torch.float32).view(3, 1, 1)
                c2 = torch.tensor(c2_tup, device=device, dtype=torch.float32).view(3, 1, 1)

                w1 = torch.sin(px * 1.65 + t * 0.42 + torch.cos(py * 1.4 - t * 0.31))
                w2 = torch.cos(py * 1.85 - t * 0.36 + torch.sin(px * 1.35 + t * 0.27))
                aurora1 = torch.clamp((w1 * 0.5 + 0.5) * torch.exp(-((px + 0.42 - 0.18 * math.sin(t * 0.25)) ** 2 * 0.55 + (py + 0.25) ** 2 * 0.9)), 0.0, 1.0)
                aurora2 = torch.clamp((w2 * 0.5 + 0.5) * torch.exp(-((px - 0.45 + 0.16 * math.cos(t * 0.22)) ** 2 * 0.55 + (py - 0.28) ** 2 * 0.9)), 0.0, 1.0)

                bg = base_canvas + c1 * (aurora1.unsqueeze(0) * 0.34) + c2 * (aurora2.unsqueeze(0) * 0.28)

                bright = torch.clamp((fg_rgb * fg_a) - 0.52, min=0.0) * 2.1
                small = F.interpolate(bright.unsqueeze(0), scale_factor=0.25, mode="bilinear", align_corners=False)
                blur = F.conv2d(small, k_h, padding=(0, k_size // 2), groups=3)
                blur = F.conv2d(blur, k_v, padding=(k_size // 2, 0), groups=3)
                bloom = F.interpolate(blur, size=(H, W), mode="bilinear", align_corners=False).squeeze(0)

                comp = (bg * (1.0 - fg_a) + fg_rgb * fg_a + bloom * 0.26) * vignette
                comp = torch.clamp(comp, 0.0, 1.0)
                out_u8 = (comp.permute(1, 2, 0) * 255.0).to(torch.uint8).cpu().numpy()
                proc.stdin.write(out_u8.tobytes())

                if (idx + 1) % 270 == 0 or (idx + 1) == total:
                    dt = time.time() - t_start
                    fps_now = (idx + 1) / max(0.01, dt)
                    print(f"[CUDA GPU + NVENC] Composited & encoded {idx + 1}/{total} frames ({fps_now:.1f} fps)")
    finally:
        proc.stdin.close()
        rc = proc.wait()
        if rc != 0:
            raise RuntimeError(f"FFmpeg NVENC pipe failed with exit code {rc}")


def verify_final_mp4(mp4_path: Path, ffmpeg_bin: str, ffprobe_bin: str | None) -> None:
    if ffprobe_bin:
        probe = subprocess.run(
            [
                ffprobe_bin, "-v", "error",
                "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
                "-of", "json", str(mp4_path),
            ],
            capture_output=True, text=True,
        )
        if probe.returncode == 0:
            info = json.loads(probe.stdout)
            streams = info.get("streams", [])
            v_streams = [s for s in streams if s.get("codec_type") == "video"]
            a_streams = [s for s in streams if s.get("codec_type") == "audio"]
            if not v_streams:
                raise RuntimeError("Final MP4 has NO video stream!")
            if not a_streams:
                raise RuntimeError("Final MP4 has NO audio stream!")
            v, a = v_streams[0], a_streams[0]
            print(f"[Verify] Video: {v.get('codec_name')} {v.get('width')}x{v.get('height')} @ {v.get('r_frame_rate')} fps")
            print(f"[Verify] Audio: {a.get('codec_name')} {a.get('sample_rate')}Hz ({a.get('channels')} ch)")

    vol = subprocess.run(
        [ffmpeg_bin, "-i", str(mp4_path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m_mean = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    m_max = re.search(r"max_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    if m_mean and m_max:
        mean_db, max_db = float(m_mean.group(1)), float(m_max.group(1))
        print(f"[Verify] Audio Loudness: mean={mean_db:.1f} dB | peak={max_db:.1f} dB")
        if max_db < -50.0:
            raise RuntimeError(f"Final MP4 audio appears silent (peak {max_db:.1f} dB)!")


def main() -> None:
    parser = argparse.ArgumentParser(description="Zero-Blink NVIDIA GPU Employetics 45s Commercial Renderer")
    parser.add_argument("--output", default=str(OUT_DIR / "employetics-ad-1080p60.mp4"))
    parser.add_argument("--captions", action="store_true", help="Burn synchronized captions into the video")
    parser.add_argument("--scale", type=float, default=1.0, help="Resolution scale (1.0=1080p, 2.0=4K)")
    parser.add_argument("--crf", type=int, default=16, help="Quality CRF/CQ (lower = sharper, default 16)")
    parser.add_argument("--concurrency", type=int, default=0, help="Remotion worker count (0 = auto)")
    parser.add_argument("--frames", default=None, help="Optional frame range for quick tests, e.g. '0-14'")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = Path(args.output).resolve()

    ffmpeg_bin = find_binary("ffmpeg")
    ffprobe_bin = find_binary("ffprobe")
    if not ffmpeg_bin:
        raise RuntimeError("FFmpeg not found in PATH or Remotion node_modules!")

    audio_wav = ensure_audio_ready()
    gpu_name = detect_nvidia_gpu()
    cuda_ok = has_torch_cuda()
    nvenc_ok = bool(gpu_name and has_nvenc(ffmpeg_bin))

    print("=" * 72)
    print("  EMPLOYETICS 45s PRODUCT AD — ZERO-BLINK NVIDIA GPU PIPELINE")
    print("=" * 72)
    print(f"  NVIDIA GPU       : {gpu_name or 'None (CPU mode)'}")
    print(f"  CUDA Shader/Bloom: {'ACTIVE (PyTorch CUDA GPU)' if cuda_ok else 'CPU Fallback'}")
    print(f"  Hardware Encoder : {'ACTIVE (NVIDIA h264_nvenc)' if nvenc_ok else 'libx264 (CPU)'}")
    print(f"  Audio Master     : {audio_wav.name} (explicitly muxed AAC 256kbps)")
    print(f"  Captions         : {'Burned-in ON' if args.captions else 'Clean (OFF, .srt generated)'}")
    print(f"  Resolution       : {int(1920 * args.scale)}x{int(1080 * args.scale)} @ 60fps")
    print("=" * 72)

    use_gpu_compositor = cuda_ok
    img_fmt = "png" if use_gpu_compositor else "jpeg"

    props = {
        "showCaptions": bool(args.captions),
        "includeAudio": False,
        "audioVolume": 1.0,
        "transparentBg": use_gpu_compositor,
    }
    props_file = OUT_DIR / ".render_props.json"
    props_file.write_text(json.dumps(props), encoding="utf-8")

    frames_dir = OUT_DIR / "frames_tmp"
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True, exist_ok=True)

    npx_bin = "npx.cmd" if os.name == "nt" else "npx"
    remotion_cmd = [
        npx_bin, "remotion", "render", "src/index.ts", "EmployeticsAd", str(frames_dir),
        "--sequence", f"--image-format={img_fmt}", "--muted",
        f"--props={props_file}", f"--scale={args.scale}", "--gl=swangle", "--overwrite",
    ]
    if img_fmt == "jpeg":
        remotion_cmd.append("--jpeg-quality=96")
    if args.frames:
        remotion_cmd.append(f"--frames={args.frames}")
    if args.concurrency > 0:
        remotion_cmd.append(f"--concurrency={args.concurrency}")

    monitor = GpuMonitor(enabled=bool(gpu_name))
    t0 = time.time()
    monitor.start()

    try:
        print(f"\n[Step 1/2] Rendering deterministic UI frames ({img_fmt.upper()})...")
        res = subprocess.run(remotion_cmd, cwd=ROOT_DIR)
        if res.returncode != 0:
            sys.exit(res.returncode)

        if use_gpu_compositor:
            frame_files = sorted_frame_files(frames_dir, "png")
            print(f"\n[Step 2/2] Running NVIDIA CUDA Shader + Optical Bloom + {'h264_nvenc' if nvenc_ok else 'libx264'} + Audio Mux...")
            cuda_composite_and_nvenc(
                frame_files=frame_files, audio_wav=audio_wav, output_path=output_path,
                ffmpeg_bin=ffmpeg_bin, use_nvenc=nvenc_ok, crf=args.crf,
            )
        else:
            frame_files = sorted_frame_files(frames_dir, "jpeg")
            sample = frame_files[0].name
            m = re.match(r"^(.*?)(\d+)(\.[a-zA-Z]+)$", sample)
            assert m is not None
            prefix, digits, ext = m.groups()
            pattern = (
                str(frames_dir / f"{prefix}%0{len(digits)}d{ext}")
                if (len(digits) > 1 and digits.startswith("0"))
                else str(frames_dir / f"{prefix}%d{ext}")
            )
            print("\n[Step 2/2] Encoding 60fps MP4 + muxing studio audio (CPU libx264)...")
            enc_cmd = [
                ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
                "-framerate", "60", "-start_number", "0", "-i", pattern, "-i", str(audio_wav),
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf), "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
                "-shortest", "-movflags", "+faststart", str(output_path),
            ]
            enc_res = subprocess.run(enc_cmd)
            if enc_res.returncode != 0:
                sys.exit(enc_res.returncode)
    finally:
        monitor.stop()
        props_file.unlink(missing_ok=True)
        shutil.rmtree(frames_dir, ignore_errors=True)

    verify_final_mp4(output_path, ffmpeg_bin, ffprobe_bin)

    elapsed = time.time() - t0
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 72)
    print(f"  RENDER COMPLETE in {elapsed:.1f}s -> {output_path} ({size_mb:.2f} MB)")
    if monitor.enabled and monitor.samples:
        avg_u = sum(monitor.samples) / len(monitor.samples)
        print(f"  NVIDIA GPU STATS: Peak Util={monitor.peak_util}% | Avg Util={avg_u:.1f}% | Peak VRAM={monitor.peak_mem_mib} MiB")
    print("=" * 72)


if __name__ == "__main__":
    main()
