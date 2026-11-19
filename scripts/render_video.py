#!/usr/bin/env python3
"""
GPU-Aware Remotion Video Render Orchestrator (Google Colab & Local)
-------------------------------------------------------------------
1. Detects NVIDIA GPU (T4 / L4 / A100 / RTX) and FFmpeg NVENC support.
2. Tests Chrome GPU GL backend (`angle-egl` on Linux GPU) with safe fallback to `swangle`.
3. Renders the 40-second 1080p 60fps Employetics motion graphics commercial.
4. Optionally runs a final hardware-accelerated NVENC H.264 mastering pass (`+faststart`)
   for crisp social/web playback (LinkedIn, YouTube, X, landing page hero).
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import platform
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT_DIR / "out"


def find_ffmpeg() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for pattern in [
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / "ffmpeg"),
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / "ffmpeg.exe"),
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


def choose_gl_backend(gpu_name: str | None, forced_gl: str | None) -> str:
    if forced_gl:
        return forced_gl

    is_linux = platform.system().lower() == "linux"
    if not is_linux or not gpu_name:
        return "angle"

    # Quick 1-frame smoke test with angle-egl on Linux GPU (Colab)
    probe_png = OUT_DIR / ".gl_probe.png"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    npx_bin = "npx.cmd" if os.name == "nt" else "npx"
    probe_cmd = [
        npx_bin,
        "remotion",
        "still",
        "src/index.ts",
        "EmployeticsAd",
        str(probe_png),
        "--frame=0",
        "--gl=angle-egl",
        "--log=error",
    ]
    print("[Render] Probing Chrome GPU hardware acceleration (--gl=angle-egl)...")
    res = subprocess.run(probe_cmd, cwd=ROOT_DIR, capture_output=True, text=True)
    if probe_png.exists():
        probe_png.unlink(missing_ok=True)

    if res.returncode == 0:
        print("[Render] Chrome GPU EGL acceleration is ACTIVE (--gl=angle-egl)!")
        return "angle-egl"

    print("[Render] GPU EGL unavailable in this container; falling back cleanly to --gl=swangle.")
    return "swangle"


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Employetics 40s Motion Graphics Ad")
    parser.add_argument("--output", default=str(OUT_DIR / "employetics-ad-1080p60.mp4"))
    parser.add_argument("--captions", action="store_true", help="Burn synchronized captions into the video")
    parser.add_argument("--scale", type=float, default=1.0, help="Resolution scale (1.0=1080p, 2.0=4K)")
    parser.add_argument("--crf", type=int, default=16, help="Quality CRF (lower = sharper, default 16)")
    parser.add_argument("--concurrency", type=int, default=0, help="Worker count (0 = auto)")
    parser.add_argument("--gl", default=None, help="Force Remotion GL backend (angle-egl, swangle, angle)")
    parser.add_argument("--skip-nvenc", action="store_true", help="Skip NVENC GPU final mastering pass")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = Path(args.output).resolve()
    raw_path = output_path.with_name(f"{output_path.stem}_raw.mp4")

    gpu_name = detect_nvidia_gpu()
    ffmpeg_bin = find_ffmpeg()
    nvenc_available = bool(gpu_name and has_nvenc(ffmpeg_bin) and not args.skip_nvenc)

    print("=" * 64)
    print("  EMPLOYETICS 40s MOTION GRAPHICS RENDER PIPELINE")
    print("=" * 64)
    print(f"  GPU Detected : {gpu_name or 'None (CPU mode)'}")
    print(f"  NVENC Encode : {'Enabled (h264_nvenc)' if nvenc_available else 'Disabled (libx264)'}")
    print(f"  Captions     : {'Burned-in ON' if args.captions else 'Clean (OFF, .srt generated)'}")
    print(f"  Scale        : {args.scale}x ({int(1920 * args.scale)}x{int(1080 * args.scale)} @ 60fps)")
    print("=" * 64)

    gl_backend = choose_gl_backend(gpu_name, args.gl)

    props = {
        "showCaptions": bool(args.captions),
        "includeAudio": True,
        "audioVolume": 1.0,
    }
    props_file = OUT_DIR / ".render_props.json"
    props_file.write_text(json.dumps(props), encoding="utf-8")

    npx_bin = "npx.cmd" if os.name == "nt" else "npx"
    target_remotion_out = raw_path if nvenc_available else output_path

    render_cmd = [
        npx_bin,
        "remotion",
        "render",
        "src/index.ts",
        "EmployeticsAd",
        str(target_remotion_out),
        f"--props={props_file}",
        "--codec=h264",
        f"--crf={args.crf}",
        "--pixel-format=yuv420p",
        f"--scale={args.scale}",
        f"--gl={gl_backend}",
        "--overwrite",
    ]
    if args.concurrency > 0:
        render_cmd.append(f"--concurrency={args.concurrency}")

    t0 = time.time()
    print(f"[Render] Running: {' '.join(render_cmd)}")
    res = subprocess.run(render_cmd, cwd=ROOT_DIR)
    props_file.unlink(missing_ok=True)

    if res.returncode != 0:
        sys.exit(res.returncode)

    if nvenc_available and ffmpeg_bin:
        print("[Render] Running NVIDIA NVENC GPU mastering pass (H.264 High Profile + faststart)...")
        nvenc_cmd = [
            ffmpeg_bin,
            "-y",
            "-i",
            str(raw_path),
            "-c:v",
            "h264_nvenc",
            "-preset",
            "p7",
            "-tune",
            "hq",
            "-rc",
            "vbr",
            "-cq",
            "17",
            "-b:v",
            "0",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "256k",
            "-movflags",
            "+faststart",
            str(output_path),
        ]
        nv_res = subprocess.run(nvenc_cmd)
        if nv_res.returncode == 0:
            raw_path.unlink(missing_ok=True)
        else:
            print("[Render] NVENC pass failed; keeping Remotion's high-quality H.264 output.")
            shutil.move(str(raw_path), str(output_path))

    elapsed = time.time() - t0
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\n[Render] SUCCESS in {elapsed:.1f}s -> {output_path} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
