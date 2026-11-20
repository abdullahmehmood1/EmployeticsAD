#!/usr/bin/env python3
"""
True-GPU Remotion + NVIDIA NVENC Render Orchestrator (Google Colab & Local)
---------------------------------------------------------------------------
1. Guarantees voiceover + soundtrack (`public/audio/master_audio.wav`) exists and is audible.
2. Enables real NVIDIA GPU rendering in Chromium on Linux/Colab:
   - Registers NVIDIA GLVND EGL ICD (`10_nvidia.json`) when `libEGL_nvidia.so.0` is present
   - Uses `--chrome-mode=chrome-for-testing` (required on Linux for real NVIDIA GPU, unlike headless-shell)
   - Probes `remotion gpu` across `angle-egl` (direct & xvfb), `egl`, and `vulkan` to pick true HW acceleration
3. Renders frame sequence on Chrome GPU (no CPU x264 bottleneck), then encodes directly with
   NVIDIA NVENC (`h264_nvenc`) while explicitly muxing `public/audio/master_audio.wav` into AAC 256kbps.
4. Monitors live `nvidia-smi` GPU utilization & verifies final MP4 has audible stereo audio via ffprobe.
"""

from __future__ import annotations

import argparse
import glob
import json
import math
import os
import platform
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

from scipy.io import wavfile
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT_DIR / "out"
AUDIO_WAV = ROOT_DIR / "public" / "audio" / "master_audio.wav"
MANIFEST_PATH = ROOT_DIR / "src" / "data" / "audioManifest.json"


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


def ensure_nvidia_egl_icd() -> None:
    """Register NVIDIA GLVND EGL ICD on Linux containers (like Colab) so EGL uses NVIDIA instead of Mesa CPU."""
    if platform.system().lower() != "linux":
        return

    egl_vendor_dir = Path("/usr/share/glvnd/egl_vendor.d")
    nvidia_json = egl_vendor_dir / "10_nvidia.json"
    if nvidia_json.exists():
        return

    search_dirs = [
        "/usr/lib/x86_64-linux-gnu",
        "/usr/local/nvidia/lib64",
        "/usr/lib64",
        "/lib/x86_64-linux-gnu",
    ]
    lib_path: str | None = None
    for d in search_dirs:
        candidate = Path(d) / "libEGL_nvidia.so.0"
        if candidate.exists():
            lib_path = str(candidate)
            break

    if not lib_path:
        return

    try:
        egl_vendor_dir.mkdir(parents=True, exist_ok=True)
        payload = {
            "file_format_version": "1.0.0",
            "ICD": {"library_path": lib_path},
        }
        nvidia_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"[GPU] Registered NVIDIA EGL ICD -> {nvidia_json} ({lib_path})")
    except PermissionError:
        pass


def ensure_audio_ready() -> Path:
    """Verify master_audio.wav exists and is audible; auto-generate if missing."""
    if not AUDIO_WAV.exists() or AUDIO_WAV.stat().st_size < 100_000:
        print("[Audio] master_audio.wav missing -> running scripts/generate_audio.py --engine auto...")
        res = subprocess.run(
            [sys.executable, str(ROOT_DIR / "scripts" / "generate_audio.py"), "--engine", "auto"],
            cwd=ROOT_DIR,
        )
        if res.returncode != 0:
            raise RuntimeError("Failed to generate voiceover/soundtrack audio.")

    if not AUDIO_WAV.exists():
        raise RuntimeError(f"Expected audio file not found: {AUDIO_WAV}")

    sr, data = wavfile.read(str(AUDIO_WAV))
    arr = data.astype(np.float32) / 32768.0 if np.issubdtype(data.dtype, np.integer) else data.astype(np.float32)
    rms = float(np.sqrt(np.mean(arr**2)))
    rms_db = 20.0 * math.log10(rms + 1e-12)
    dur_s = len(arr) / float(sr)
    print(f"[Audio] Verified {AUDIO_WAV.name}: {dur_s:.2f}s @ {sr}Hz | RMS={rms_db:.1f} dBFS")
    if rms_db < -55.0:
        raise RuntimeError(f"Audio track {AUDIO_WAV} appears silent ({rms_db:.1f} dBFS)!")
    return AUDIO_WAV


LINUX_GPU_CHROMIUM_FLAGS = (
    "--ignore-gpu-blocklist "
    "--enable-gpu-rasterization "
    "--enable-accelerated-2d-canvas "
    "--enable-webgl "
    "--no-sandbox"
)


def select_gpu_chrome_config(
    gpu_name: str | None,
    forced_gl: str | None,
) -> tuple[str, str, bool]:
    """
    Returns (chrome_mode, gl_backend, use_xvfb).
    On Linux with NVIDIA GPU, uses `chrome-for-testing` with `--ignore-gpu-blocklist`
    (required to unblock datacenter Tesla T4/L4/A100 GPUs in Chrome) and probes
    `remotion gpu` to find the backend that truly reports Hardware Acceleration.
    """
    is_linux = platform.system().lower() == "linux"
    if not is_linux or not gpu_name:
        return ("headless-shell", forced_gl or "angle", False)

    ensure_nvidia_egl_icd()
    chrome_mode = "chrome-for-testing"
    has_xvfb = shutil.which("xvfb-run") is not None

    if forced_gl:
        return (chrome_mode, forced_gl, False)

    candidates: list[tuple[str, bool]] = [("angle-egl", False)]
    if has_xvfb:
        candidates.append(("angle-egl", True))
    candidates.append(("egl", False))
    candidates.append(("vulkan", False))

    npx_bin = "npx.cmd" if os.name == "nt" else "npx"
    best_working: tuple[str, bool] | None = None

    for gl_opt, use_xvfb in candidates:
        base_cmd = [
            npx_bin,
            "remotion",
            "gpu",
            f"--chrome-mode={chrome_mode}",
            f"--gl={gl_opt}",
            f"--chromium-flags={LINUX_GPU_CHROMIUM_FLAGS}",
            "--enable-multiprocess-on-linux",
        ]
        cmd = (["xvfb-run", "-a", "--server-args=-screen 0 1920x1080x24", *base_cmd] if use_xvfb else base_cmd)
        label = f"gl={gl_opt}" + (" + xvfb" if use_xvfb else "")
        print(f"[GPU] Probing Chrome GPU acceleration ({chrome_mode}, {label})...")
        try:
            res = subprocess.run(cmd, cwd=ROOT_DIR, capture_output=True, text=True, timeout=180)
        except subprocess.TimeoutExpired:
            print(f"[GPU] Probe timed out for {label}")
            continue

        out = (res.stdout or "") + "\n" + (res.stderr or "")
        if res.returncode != 0:
            continue

        if best_working is None:
            best_working = (gl_opt, use_xvfb)

        hw_accel = "Hardware accelerated" in out
        is_software = ("SwiftShader" in out and "NVIDIA" not in out) or ("llvmpipe" in out and "NVIDIA" not in out)
        has_nvidia = "NVIDIA" in out.upper() or "TESLA" in out.upper() or "L4" in out.upper() or "A100" in out.upper()

        if hw_accel and not is_software:
            print(f"[GPU] CONFIRMED Hardware Acceleration via {chrome_mode} ({label})! NVIDIA detected={has_nvidia}")
            for line in out.splitlines():
                if any(k in line for k in ("WebGL", "Rasterization", "GL_RENDERER", "Video Decode", "GPU0")):
                    print("      ", line.strip())
            return (chrome_mode, gl_opt, use_xvfb)

    if best_working:
        gl_opt, use_xvfb = best_working
        print(f"[GPU] Using {chrome_mode} with gl={gl_opt} (xvfb={use_xvfb}).")
        return (chrome_mode, gl_opt, use_xvfb)

    print("[GPU] Falling back to swangle for Chrome; NVIDIA NVENC will still encode video on GPU.")
    return (chrome_mode, "swangle", False)


class GpuMonitor:
    """Background `nvidia-smi` sampler to report real GPU utilization during rendering."""

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
            self._stop.wait(1.0)

    def stop(self) -> None:
        if not self.enabled:
            return
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=3)


def verify_final_mp4(mp4_path: Path, ffmpeg_bin: str, ffprobe_bin: str | None) -> None:
    """Prove the final MP4 contains both video and audible stereo audio."""
    if ffprobe_bin:
        probe = subprocess.run(
            [
                ffprobe_bin,
                "-v",
                "error",
                "-show_entries",
                "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
                "-of",
                "json",
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
            v = v_streams[0]
            a = a_streams[0]
            print(
                f"[Verify] Video: {v.get('codec_name')} {v.get('width')}x{v.get('height')} "
                f"@ {v.get('r_frame_rate')} fps"
            )
            print(
                f"[Verify] Audio: {a.get('codec_name')} {a.get('sample_rate')}Hz "
                f"({a.get('channels')} ch)"
            )

    vol = subprocess.run(
        [ffmpeg_bin, "-i", str(mp4_path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    m_mean = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    m_max = re.search(r"max_volume:\s*([-\d.]+)\s*dB", vol.stderr)
    if m_mean and m_max:
        mean_db = float(m_mean.group(1))
        max_db = float(m_max.group(1))
        print(f"[Verify] Audio Loudness: mean={mean_db:.1f} dB | peak={max_db:.1f} dB")
        if max_db < -50.0:
            raise RuntimeError(f"Final MP4 audio appears silent (peak {max_db:.1f} dB)!")


def detect_sequence_pattern(frames_dir: Path) -> str:
    """Inspect rendered frames directory and return exact FFmpeg `%0Nd` pattern."""
    files = sorted(frames_dir.glob("element-*.jpeg"))
    if not files:
        files = sorted(frames_dir.glob("*.jpeg")) + sorted(frames_dir.glob("*.jpg"))
    if not files:
        raise RuntimeError(f"No rendered image frames found in {frames_dir}")

    sample_name = files[0].name
    m = re.match(r"^(.*?)(\d+)(\.[a-zA-Z]+)$", sample_name)
    if not m:
        raise RuntimeError(f"Unexpected frame filename format: {sample_name}")
    prefix, digits, ext = m.groups()
    if len(digits) > 1 and digits.startswith("0"):
        return str(frames_dir / f"{prefix}%0{len(digits)}d{ext}")
    return str(frames_dir / f"{prefix}%d{ext}")


def main() -> None:
    parser = argparse.ArgumentParser(description="GPU-Accelerated Employetics 40s Motion Graphics Renderer")
    parser.add_argument("--output", default=str(OUT_DIR / "employetics-ad-1080p60.mp4"))
    parser.add_argument("--captions", action="store_true", help="Burn synchronized captions into the video")
    parser.add_argument("--scale", type=float, default=1.0, help="Resolution scale (1.0=1080p, 2.0=4K)")
    parser.add_argument("--crf", type=int, default=16, help="Quality CRF/CQ (lower = sharper, default 16)")
    parser.add_argument("--concurrency", type=int, default=0, help="Worker count (0 = auto)")
    parser.add_argument("--gl", default=None, help="Force Remotion GL backend (angle-egl, egl, vulkan, swangle)")
    parser.add_argument("--frames", default=None, help="Optional frame range for quick tests, e.g. '0-119'")
    parser.add_argument("--skip-nvenc", action="store_true", help="Force CPU libx264 instead of NVIDIA NVENC")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = Path(args.output).resolve()

    ffmpeg_bin = find_binary("ffmpeg")
    ffprobe_bin = find_binary("ffprobe")
    if not ffmpeg_bin:
        raise RuntimeError("FFmpeg not found in PATH or Remotion node_modules!")

    # Step 1: Guarantee voiceover + soundtrack WAV exists and is loud & clear
    audio_wav = ensure_audio_ready()

    gpu_name = detect_nvidia_gpu()
    nvenc_available = bool(gpu_name and has_nvenc(ffmpeg_bin) and not args.skip_nvenc)

    print("=" * 70)
    print("  EMPLOYETICS 40s MOTION GRAPHICS — TRUE GPU RENDER PIPELINE")
    print("=" * 70)
    print(f"  NVIDIA GPU   : {gpu_name or 'None (CPU mode)'}")
    print(f"  NVENC Encode : {'ENABLED (h264_nvenc on GPU)' if nvenc_available else 'Disabled (libx264 CPU)'}")
    print(f"  Audio Master : {audio_wav.name} (explicitly muxed into MP4)")
    print(f"  Captions     : {'Burned-in ON' if args.captions else 'Clean (OFF, .srt generated)'}")
    print(f"  Resolution   : {int(1920 * args.scale)}x{int(1080 * args.scale)} @ 60fps")
    print("=" * 70)

    chrome_mode, gl_backend, use_xvfb = select_gpu_chrome_config(gpu_name, args.gl)

    # Render frames muted so Remotion skips CPU audio mixing; FFmpeg NVENC muxes our exact master WAV directly
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
        f"--chrome-mode={chrome_mode}",
        f"--gl={gl_backend}",
        "--hardware-acceleration=if-possible",
        "--overwrite",
    ]
    if platform.system().lower() == "linux":
        remotion_cmd.append("--enable-multiprocess-on-linux")
        if gpu_name:
            remotion_cmd.append(f"--chromium-flags={LINUX_GPU_CHROMIUM_FLAGS}")
    if args.frames:
        remotion_cmd.append(f"--frames={args.frames}")
    if args.concurrency > 0:
        remotion_cmd.append(f"--concurrency={args.concurrency}")

    if use_xvfb:
        remotion_cmd = ["xvfb-run", "-a", "--server-args=-screen 0 1920x1080x24", *remotion_cmd]

    monitor = GpuMonitor(enabled=bool(gpu_name))
    t0 = time.time()
    monitor.start()

    try:
        print(f"\n[Step 1/2] Rendering GPU-composited frames...\n  {' '.join(remotion_cmd)}")
        res = subprocess.run(remotion_cmd, cwd=ROOT_DIR)
        if res.returncode != 0:
            sys.exit(res.returncode)

        frame_pattern = detect_sequence_pattern(frames_dir)
        print(f"\n[Step 2/2] Encoding 60fps MP4 + muxing voiceover & soundtrack ({'NVIDIA h264_nvenc GPU' if nvenc_available else 'libx264 CPU'})...")

        if nvenc_available:
            encode_cmd = [
                ffmpeg_bin,
                "-y",
                "-framerate",
                "60",
                "-start_number",
                "0",
                "-i",
                frame_pattern,
                "-i",
                str(audio_wav),
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "h264_nvenc",
                "-preset",
                "p6",
                "-tune",
                "hq",
                "-rc",
                "vbr",
                "-cq",
                str(args.crf),
                "-b:v",
                "0",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "256k",
                "-ar",
                "48000",
                "-ac",
                "2",
                "-shortest",
                "-movflags",
                "+faststart",
                str(output_path),
            ]
        else:
            encode_cmd = [
                ffmpeg_bin,
                "-y",
                "-framerate",
                "60",
                "-start_number",
                "0",
                "-i",
                frame_pattern,
                "-i",
                str(audio_wav),
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                str(args.crf),
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "256k",
                "-ar",
                "48000",
                "-ac",
                "2",
                "-shortest",
                "-movflags",
                "+faststart",
                str(output_path),
            ]

        enc_res = subprocess.run(encode_cmd)
        if enc_res.returncode != 0 and nvenc_available:
            print("[Render] WARNING: h264_nvenc failed; falling back to libx264 while preserving full audio...")
            fallback_cmd = [
                ffmpeg_bin,
                "-y",
                "-framerate",
                "60",
                "-start_number",
                "0",
                "-i",
                frame_pattern,
                "-i",
                str(audio_wav),
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                str(args.crf),
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "256k",
                "-ar",
                "48000",
                "-ac",
                "2",
                "-shortest",
                "-movflags",
                "+faststart",
                str(output_path),
            ]
            enc_res = subprocess.run(fallback_cmd)
        if enc_res.returncode != 0:
            sys.exit(enc_res.returncode)
    finally:
        monitor.stop()
        props_file.unlink(missing_ok=True)
        shutil.rmtree(frames_dir, ignore_errors=True)

    # Step 3: Verify final MP4 streams + audio loudness
    verify_final_mp4(output_path, ffmpeg_bin, ffprobe_bin)

    elapsed = time.time() - t0
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 70)
    print(f"  RENDER COMPLETE in {elapsed:.1f}s -> {output_path} ({size_mb:.2f} MB)")
    if monitor.enabled and monitor.samples:
        avg_u = sum(monitor.samples) / len(monitor.samples)
        print(
            f"  NVIDIA GPU STATS: Peak Util={monitor.peak_util}% | "
            f"Avg Util={avg_u:.1f}% | Peak VRAM={monitor.peak_mem_mib} MiB"
        )
    print("=" * 70)


if __name__ == "__main__":
    main()
