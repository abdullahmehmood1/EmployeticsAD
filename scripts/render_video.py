#!/usr/bin/env python3
"""
Zero-Blink True-NVIDIA-GPU Kinetic Trailer Render Pipeline (Colab & Local)
--------------------------------------------------------------------------
1. Verifies studio deep-male voiceover + trailer bass soundtrack (`public/audio/master_audio.wav`).
2. Renders 100% deterministic, zero-flicker kinetic typography frames via Remotion.
3. On NVIDIA CUDA GPU (Google Colab L4 / T4 / A100):
   - Runs a real-time PyTorch CUDA GPU Kinetic Motion-Blur & Mastering Pass directly on GPU:
     * Directional 1D kinetic motion-blur smear on fast impact wipes & text slams
     * Preserves 100% pure solid #0F2A52 laptop screen (14-26s) and 100% pure solid #FFFFFF outro (34-40s)
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

# Exact frame windows where fast kinetic horizontal wipes/slides benefit from GPU directional motion blur
KINETIC_BLUR_WINDOWS = [
    (166, 180),    # Hook -> Problem wipe
    (328, 340),    # LATE NIGHTS -> LOST WEEKENDS wipe
    (478, 490),    # LOST WEEKENDS -> NOBODY NOTICED wipe
    (646, 662),    # Problem -> Bright White Reveal wipe
    (828, 880),    # Reveal slide-out & Laptop slide-in from right
    (1544, 1562),  # App -> Solution wipe
    (1804, 1816),  # ACT EARLY -> KEEP YOUR PEOPLE wipe
    (2040, 2076),  # Solution -> Solid White collapse
]


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


def load_rgb_image(path: Path) -> np.ndarray:
    with Image.open(path) as im:
        return np.asarray(im.convert("RGB"), dtype=np.uint8)


def in_blur_window(frame_idx: int) -> float:
    for a, b in KINETIC_BLUR_WINDOWS:
        if a <= frame_idx <= b:
            mid = 0.5 * (a + b)
            half = max(1.0, 0.5 * (b - a))
            return max(0.0, 1.0 - abs(frame_idx - mid) / half)
    return 0.0


def cuda_postprocess_and_nvenc(
    frame_files: list[Path],
    audio_wav: Path,
    output_path: Path,
    ffmpeg_bin: str,
    use_nvenc: bool,
    crf: int,
) -> None:
    """
    PyTorch CUDA GPU Kinetic Motion-Blur & Broadcast Mastering Pass -> NVIDIA NVENC (`h264_nvenc`).
    Preserves 100% pure solid #0F2A52 laptop screen and 100% pure solid #FFFFFF 34-40s outro plate!
    """
    import torch  # type: ignore
    import torch.nn.functional as F  # type: ignore

    device = torch.device("cuda")
    first = load_rgb_image(frame_files[0])
    H, W = first.shape[0], first.shape[1]

    print(f"[CUDA GPU] Initializing {W}x{H} Kinetic Motion-Blur & NVENC Master on {torch.cuda.get_device_name(0)}...")

    # Horizontal directional kinetic motion-blur kernel on CUDA GPU
    k_len = 15
    x = torch.linspace(-1.0, 1.0, k_len, device=device, dtype=torch.float32)
    k_1d = torch.exp(-(x * x) * 2.4)
    k_1d = k_1d / k_1d.sum()
    motion_kernel = k_1d.view(1, 1, 1, k_len).repeat(3, 1, 1, 1)

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
        ffmpeg_bin,
        "-y",
        "-hide_banner",
        "-loglevel", "error",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}",
        "-r", "60",
        "-i", "pipe:0",
        "-i", str(audio_wav),
        "-map", "0:v:0",
        "-map", "1:a:0",
        *vcodec_args,
        "-c:a", "aac",
        "-b:a", "256k",
        "-ar", "48000",
        "-ac", "2",
        "-shortest",
        "-movflags", "+faststart",
        str(output_path),
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None

    total = len(frame_files)
    t_start = time.time()

    try:
        with ThreadPoolExecutor(max_workers=4) as pool, torch.no_grad():
            futures = [pool.submit(load_rgb_image, p) for p in frame_files[:8]]
            next_submit = 8

            for idx in range(total):
                rgb_np = futures[idx].result()
                futures[idx] = None
                if next_submit < total:
                    futures.append(pool.submit(load_rgb_image, frame_files[next_submit]))
                    next_submit += 1

                # Upload frame to CUDA GPU
                frame_t = torch.from_numpy(rgb_np).to(device, non_blocking=True).float() / 255.0
                chw = frame_t.permute(2, 0, 1).unsqueeze(0)  # (1, 3, H, W)

                # Apply directional GPU kinetic motion-blur during fast trailer wipes & slides
                blur_strength = in_blur_window(idx)
                if blur_strength > 0.05:
                    smeared = F.conv2d(chw, motion_kernel, padding=(0, k_len // 2), groups=3)
                    chw = chw * (1.0 - blur_strength * 0.65) + smeared * (blur_strength * 0.65)

                out_u8 = (torch.clamp(chw.squeeze(0), 0.0, 1.0).permute(1, 2, 0) * 255.0).to(torch.uint8).cpu().numpy()
                proc.stdin.write(out_u8.tobytes())

                if (idx + 1) % 240 == 0 or (idx + 1) == total:
                    dt = time.time() - t_start
                    fps_now = (idx + 1) / max(0.01, dt)
                    print(f"[CUDA GPU + NVENC] Processed & encoded {idx + 1}/{total} frames ({fps_now:.1f} fps)")
    finally:
        proc.stdin.close()
        rc = proc.wait()
        if rc != 0:
            raise RuntimeError(f"FFmpeg NVENC pipe failed with exit code {rc}")


def verify_final_mp4(mp4_path: Path, ffmpeg_bin: str, ffprobe_bin: str | None) -> None:
    if ffprobe_bin:
        probe = subprocess.run(
            [
                ffprobe_bin,
                "-v", "error",
                "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
                "-of", "json",
                str(mp4_path),
            ],
            capture_output=True,
            text=True,
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
        capture_output=True,
        text=True,
    )
    m_mean = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    m_max = re.search(r"max_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    if m_mean and m_max:
        mean_db, max_db = float(m_mean.group(1)), float(m_max.group(1))
        print(f"[Verify] Audio Loudness: mean={mean_db:.1f} dB | peak={max_db:.1f} dB")
        if max_db < -50.0:
            raise RuntimeError(f"Final MP4 audio appears silent (peak {max_db:.1f} dB)!")


def main() -> None:
    parser = argparse.ArgumentParser(description="Zero-Blink NVIDIA GPU Kinetic Typography Renderer")
    parser.add_argument("--output", default=str(OUT_DIR / "employetics-kinetic-ad-1080p60.mp4"))
    parser.add_argument("--captions", action="store_true", help="Burn optional captions into the video")
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
    print("  EMPLOYETICS 40s KINETIC TRAILER — ZERO-BLINK NVIDIA GPU PIPELINE")
    print("=" * 72)
    print(f"  NVIDIA GPU       : {gpu_name or 'None (CPU mode)'}")
    print(f"  CUDA Motion Blur : {'ACTIVE (PyTorch CUDA GPU)' if cuda_ok else 'CPU Fallback'}")
    print(f"  Hardware Encoder : {'ACTIVE (NVIDIA h264_nvenc)' if nvenc_ok else 'libx264 (CPU)'}")
    print(f"  Audio Master     : {audio_wav.name} (explicitly muxed AAC 256kbps)")
    print(f"  Resolution       : {int(1920 * args.scale)}x{int(1080 * args.scale)} @ 60fps")
    print("=" * 72)

    props = {
        "showCaptions": bool(args.captions),
        "includeAudio": False,
        "audioVolume": 1.0,
    }
    props_file = OUT_DIR / ".render_props.json"
    props_file.write_text(json.dumps(props), encoding="utf-8")

    frames_dir = OUT_DIR / "frames_tmp"
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True, exist_ok=True)

    npx_bin = "npx.cmd" if os.name == "nt" else "npx"
    remotion_cmd = [
        npx_bin,
        "remotion",
        "render",
        "src/index.ts",
        "EmployeticsAd",
        str(frames_dir),
        "--sequence",
        "--image-format=jpeg",
        "--jpeg-quality=96",
        "--muted",
        f"--props={props_file}",
        f"--scale={args.scale}",
        "--gl=swangle",
        "--overwrite",
    ]
    if args.frames:
        remotion_cmd.append(f"--frames={args.frames}")
    if args.concurrency > 0:
        remotion_cmd.append(f"--concurrency={args.concurrency}")

    monitor = GpuMonitor(enabled=bool(gpu_name))
    t0 = time.time()
    monitor.start()

    try:
        print("\n[Step 1/2] Rendering crisp zero-blink kinetic typography frames (60fps)...")
        res = subprocess.run(remotion_cmd, cwd=ROOT_DIR)
        if res.returncode != 0:
            sys.exit(res.returncode)

        frame_files = sorted_frame_files(frames_dir, "jpeg")

        if cuda_ok:
            print(f"\n[Step 2/2] Running PyTorch CUDA Kinetic Motion-Blur + {'NVIDIA h264_nvenc' if nvenc_ok else 'libx264'} + Audio Mux...")
            cuda_postprocess_and_nvenc(
                frame_files=frame_files,
                audio_wav=audio_wav,
                output_path=output_path,
                ffmpeg_bin=ffmpeg_bin,
                use_nvenc=nvenc_ok,
                crf=args.crf,
            )
        else:
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
                "-framerate", "60", "-start_number", "0", "-i", pattern,
                "-i", str(audio_wav),
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
        print(
            f"  NVIDIA GPU STATS: Peak Util={monitor.peak_util}% | "
            f"Avg Util={avg_u:.1f}% | Peak VRAM={monitor.peak_mem_mib} MiB"
        )
    print("=" * 72)


if __name__ == "__main__":
    main()
