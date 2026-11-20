#!/usr/bin/env python3
"""
Procedurally generate crisp kinetic-ad sound effects into public/sfx/
using numpy + scipy.io.wavfile (48 kHz, 16-bit mono/stereo WAV).
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "sfx"


def save_wav(path: Path, data: np.ndarray) -> None:
    peak = float(np.max(np.abs(data))) + 1e-9
    norm = np.clip(data / max(1.0, peak / 0.92), -1.0, 1.0)
    pcm16 = (norm * 32767.0).astype(np.int16)
    wavfile.write(str(path), SR, pcm16)


def make_impact() -> np.ndarray:
    """Heavy 60 Hz decaying sine + short punchy filtered noise burst."""
    dur = 0.55
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR

    # 60 Hz decaying sine with slight pitch punch down from 115 Hz -> 60 Hz
    freq = 60.0 + 55.0 * np.exp(-t * 28.0)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    sine = np.sin(phase) * np.minimum(1.0, t / 0.003) * np.exp(-t * 6.2)

    # Short crisp noise burst for tactile slam attack
    rng = np.random.default_rng(101)
    noise = rng.standard_normal(n) * np.exp(-t * 42.0)
    sos = signal.butter(2, [140.0, 1400.0], btype="bandpass", fs=SR, output="sos")
    burst = signal.sosfilt(sos, noise)
    burst = burst / (np.max(np.abs(burst)) + 1e-9) * 0.42

    mono = (sine * 0.85 + burst) * 0.92
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_whoosh() -> np.ndarray:
    """Clean bandpass-filtered noise sweep for wipes and laptop motion."""
    dur = 0.48
    n = int(dur * SR)
    rng = np.random.default_rng(202)
    noise = rng.standard_normal(n)
    t = np.linspace(0.0, 1.0, n)

    sos_low = signal.butter(2, [220.0, 750.0], btype="bandpass", fs=SR, output="sos")
    sos_hi = signal.butter(2, [1100.0, 3200.0], btype="bandpass", fs=SR, output="sos")
    lo = signal.sosfilt(sos_low, noise)
    hi = signal.sosfilt(sos_hi, noise)
    swept = lo * (1.0 - t) + hi * t
    env = np.sin(np.pi * t) ** 1.5
    mono = swept * env
    mono = mono / (np.max(np.abs(mono)) + 1e-9) * 0.68

    right = np.roll(mono, int(0.003 * SR))
    return np.stack([mono, right], axis=1).astype(np.float32)


def make_tick() -> np.ndarray:
    """Short crisp high-precision mechanical tick for typing and charging steps."""
    dur = 0.045
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    tone = (
        0.70 * np.sin(2.0 * np.pi * 1850.0 * t)
        + 0.30 * np.sin(2.0 * np.pi * 3400.0 * t)
    ) * np.exp(-t * 115.0)
    return np.stack([tone, tone], axis=1).astype(np.float32) * 0.55


def make_charge() -> np.ndarray:
    """Rising sine sweep + subtle rhythmic charging ticks over 2.35 seconds (f790-860)."""
    dur = 2.35
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    u = t / dur

    # Rising pitch sweep 180 Hz -> 660 Hz
    freq = 180.0 * ((660.0 / 180.0) ** (u ** 1.15))
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    sweep = (
        0.65 * np.sin(phase)
        + 0.25 * np.sin(phase * 2.0) * 0.45
    ) * np.minimum(1.0, t / 0.04) * np.minimum(1.0, (dur - t) / 0.08) * (0.28 + 0.55 * u)

    # Embedded rising ticks every 0.18s
    ticks = np.zeros(n, dtype=np.float64)
    tick_t = 0.06
    idx = 0
    while tick_t < dur - 0.1:
        start = int(tick_t * SR)
        tn = min(int(0.04 * SR), n - start)
        tt = np.arange(tn) / SR
        f_tick = 820.0 + idx * 95.0
        ticks[start : start + tn] += np.sin(2.0 * np.pi * f_tick * tt) * np.exp(-tt * 95.0) * 0.32
        tick_t += 0.18
        idx += 1

    mono = (sweep * 0.55 + ticks * 0.65)
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_chime() -> np.ndarray:
    """Clean triumphant harmonic chime when battery hits 100% (f860)."""
    dur = 1.25
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    notes = [587.33, 880.00, 1174.66]  # D5, A5, D6 crisp bright fifth/octave
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    for idx, hz in enumerate(notes):
        delay = int(idx * 0.045 * SR)
        m = n - delay
        tt = np.arange(m) / SR
        bell = (
            0.72 * np.sin(2.0 * np.pi * hz * tt)
            + 0.22 * np.sin(2.0 * np.pi * hz * 2.0 * tt) * np.exp(-tt * 7.5)
        ) * np.minimum(1.0, tt / 0.006) * np.exp(-tt * 3.8)
        pan = (idx - 1) * 0.25
        left[delay:] += bell * math.sqrt(0.5 * (1.0 - pan))
        right[delay:] += bell * math.sqrt(0.5 * (1.0 + pan))

    stereo = np.stack([left, right], axis=1) * 0.45
    return stereo.astype(np.float32)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    save_wav(OUT_DIR / "impact.wav", make_impact())
    save_wav(OUT_DIR / "whoosh.wav", make_whoosh())
    save_wav(OUT_DIR / "tick.wav", make_tick())
    save_wav(OUT_DIR / "charge.wav", make_charge())
    save_wav(OUT_DIR / "chime.wav", make_chime())
    print(f"[SFX] Generated 5 procedural WAV effects in {OUT_DIR}")


if __name__ == "__main__":
    main()
