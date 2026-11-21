#!/usr/bin/env python3
"""
Procedurally generate warm, upbeat, playful SFX and a 40-second 112 bpm
C-major pentatonic marimba/pluck + soft sine bass loop into public/sfx/
using numpy + scipy.io.wavfile (48 kHz, 16-bit stereo WAV).
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "sfx"


def save_wav(path: Path, data: np.ndarray, ceiling: float = 0.90) -> None:
    peak = float(np.max(np.abs(data))) + 1e-9
    scale = min(1.0, ceiling / peak) if peak > ceiling else 1.0
    pcm16 = (np.clip(data * scale, -1.0, 1.0) * 32767.0).astype(np.int16)
    wavfile.write(str(path), SR, pcm16)


def make_pop() -> np.ndarray:
    """Cute bouncy pop: sine 600 -> 300 Hz, 80 ms."""
    dur = 0.08
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    u = t / dur
    freq = 600.0 - 300.0 * (u ** 0.7)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    env = np.minimum(1.0, t / 0.004) * np.exp(-t * 36.0)
    mono = np.sin(phase) * env * 0.85
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_whoosh() -> np.ndarray:
    """Soft airy pastel sweep for smooth scene wipes & window slides."""
    dur = 0.42
    n = int(dur * SR)
    rng = np.random.default_rng(314)
    noise = rng.standard_normal(n)
    t = np.linspace(0.0, 1.0, n)

    sos_lo = signal.butter(2, [280.0, 900.0], btype="bandpass", fs=SR, output="sos")
    sos_hi = signal.butter(2, [900.0, 2600.0], btype="bandpass", fs=SR, output="sos")
    lo = signal.sosfilt(sos_lo, noise)
    hi = signal.sosfilt(sos_hi, noise)
    swept = lo * (1.0 - t) + hi * t
    env = (np.sin(np.pi * t) ** 1.7) * 0.55
    mono = swept / (np.max(np.abs(swept)) + 1e-9) * env
    right = np.roll(mono, int(0.0025 * SR))
    return np.stack([mono, right], axis=1).astype(np.float32)


def make_ding() -> np.ndarray:
    """Warm friendly ding: 880 Hz + 1320 Hz with soft bell decay."""
    dur = 0.85
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    attack = np.minimum(1.0, t / 0.006)
    s1 = np.sin(2.0 * np.pi * 880.0 * t) * np.exp(-t * 4.8)
    s2 = np.sin(2.0 * np.pi * 1320.0 * t) * np.exp(-t * 6.5) * 0.55
    s3 = np.sin(2.0 * np.pi * 1760.0 * t) * np.exp(-t * 10.5) * 0.18
    mono = (s1 + s2 + s3) * attack * 0.48
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_thud() -> np.ndarray:
    """Soft cozy wooden-desk tap when paper blocks land."""
    dur = 0.14
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    freq = 165.0 + 110.0 * np.exp(-t * 48.0)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.minimum(1.0, t / 0.003) * np.exp(-t * 28.0)
    rng = np.random.default_rng(77)
    tap = rng.standard_normal(n) * np.exp(-t * 85.0)
    sos = signal.butter(2, [300.0, 1200.0], btype="bandpass", fs=SR, output="sos")
    tap = signal.sosfilt(sos, tap)
    tap = tap / (np.max(np.abs(tap)) + 1e-9) * 0.22
    mono = (body * 0.72 + tap) * 0.80
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_sparkle() -> np.ndarray:
    """Twinkling high-sine sparkle cascade for heart refill & celebration."""
    dur = 1.05
    n = int(dur * SR)
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)
    rng = np.random.default_rng(42)

    # C major pentatonic upper twinkle notes
    pentatonic_hi = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0, 2349.32, 2637.02]
    for i in range(14):
        start_s = i * 0.052 + float(rng.uniform(0.0, 0.015))
        start = int(start_s * SR)
        if start >= n:
            break
        hz = pentatonic_hi[int(rng.integers(0, len(pentatonic_hi)))]
        m = min(int(0.28 * SR), n - start)
        tt = np.arange(m, dtype=np.float64) / SR
        grain = np.sin(2.0 * np.pi * hz * tt) * np.minimum(1.0, tt / 0.004) * np.exp(-tt * 15.0) * 0.24
        pan = float(rng.uniform(-0.65, 0.65))
        left[start : start + m] += grain * math.sqrt(0.5 * (1.0 - pan))
        right[start : start + m] += grain * math.sqrt(0.5 * (1.0 + pan))

    return np.stack([left, right], axis=1).astype(np.float32)


def make_click() -> np.ndarray:
    """Crisp friendly UI button click for 'Optimise Workload' at f600."""
    dur = 0.065
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    click1 = np.sin(2.0 * np.pi * 1600.0 * t) * np.exp(-t * 130.0) * 0.55
    click2 = np.sin(2.0 * np.pi * 2400.0 * np.maximum(0.0, t - 0.012)) * (t >= 0.012) * np.exp(-np.maximum(0.0, t - 0.012) * 140.0) * 0.35
    mono = (click1 + click2) * 0.85
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_music_loop() -> np.ndarray:
    """
    112 bpm upbeat minimal marimba/pluck arpeggio on C major pentatonic
    + soft warm sine bass, exact 40.0 s duration with a smooth 1.0 s fade-out.
    """
    dur = 40.0
    n = int(dur * SR)
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    bpm = 112.0
    beat_s = 60.0 / bpm
    eighth_s = beat_s / 2.0

    # C major pentatonic notes (C4..C6)
    C4, D4, E4, G4, A4 = 261.63, 293.66, 329.63, 392.00, 440.00
    C5, D5, E5, G5, A5, C6 = 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50

    # 4-bar upbeat friendly progression: C -> Am -> F(add9/C-pent) -> G
    # Strictly C major pentatonic melody notes on every eighth-note grid
    arp_bars = [
        [C5, E5, G5, E5, A5, G5, E5, D5],
        [A4, C5, E5, G5, A5, E5, D5, C5],
        [C5, D5, G5, A5, C6, A5, G5, E5],
        [D5, G5, A5, G5, E5, D5, E5, G5],
    ]
    # Warm gentle root bass (C3, A2, F2-soft -> C3/G2/A2/G2 pentatonic-friendly warm roots)
    bass_roots = [130.81, 110.00, 146.83, 98.00]  # C3, A2, D3, G2 (all pure C-pentatonic!)

    step_idx = 0
    while True:
        t0 = step_idx * eighth_s
        if t0 >= dur - 0.15:
            break

        bar = (step_idx // 8) % 4
        pos = step_idx % 8
        start = int(t0 * SR)

        # Marimba / soft pluck note (fundamental + gentle woody 4th-harmonic click)
        hz = arp_bars[bar][pos]
        note_len = min(int(0.36 * SR), n - start)
        tt = np.arange(note_len, dtype=np.float64) / SR
        accent = 1.0 if pos in (0, 3, 6) else 0.72
        pluck = (
            0.80 * np.sin(2.0 * np.pi * hz * tt) * np.exp(-tt * 9.5)
            + 0.16 * np.sin(2.0 * np.pi * hz * 4.0 * tt) * np.exp(-tt * 42.0)
        ) * np.minimum(1.0, tt / 0.004) * 0.24 * accent

        pan = math.sin(step_idx * 0.75) * 0.32
        left[start : start + note_len] += pluck * math.sqrt(0.5 * (1.0 - pan))
        right[start : start + note_len] += pluck * math.sqrt(0.5 * (1.0 + pan))

        # Soft sine bass on beats 1 and 3 (pos 0 and 4)
        if pos in (0, 4):
            b_hz = bass_roots[bar] if pos == 0 else bass_roots[bar] * (1.5 if bar != 3 else 1.0)
            b_len = min(int(beat_s * 1.45 * SR), n - start)
            bt = np.arange(b_len, dtype=np.float64) / SR
            bass = (
                np.sin(2.0 * np.pi * b_hz * bt)
                * np.minimum(1.0, bt / 0.025)
                * np.exp(-bt * 2.4)
                * (0.28 if pos == 0 else 0.18)
            )
            left[start : start + b_len] += bass
            right[start : start + b_len] += bass

        # Light muted wooden shaker pulse on off-beats (pos 2, 6)
        if pos in (2, 6):
            s_len = min(int(0.035 * SR), n - start)
            st = np.arange(s_len, dtype=np.float64) / SR
            tap = np.sin(2.0 * np.pi * 1950.0 * st) * np.exp(-st * 130.0) * 0.045
            left[start : start + s_len] += tap
            right[start : start + s_len] += tap

        step_idx += 1

    stereo = np.stack([left, right], axis=1)

    # Smooth 0.15 s fade-in and exact 1.0 s fade-out at end
    fade_in = int(0.15 * SR)
    fade_out = int(1.0 * SR)
    stereo[:fade_in] *= np.linspace(0.0, 1.0, fade_in)[:, None]
    stereo[-fade_out:] *= np.linspace(1.0, 0.0, fade_out)[:, None]

    # Normalize gently so it sits cleanly at 18% playback volume
    peak = float(np.max(np.abs(stereo))) + 1e-9
    stereo = stereo / peak * 0.78
    return stereo.astype(np.float32)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    save_wav(OUT_DIR / "pop.wav", make_pop())
    save_wav(OUT_DIR / "whoosh.wav", make_whoosh())
    save_wav(OUT_DIR / "ding.wav", make_ding())
    save_wav(OUT_DIR / "thud.wav", make_thud())
    save_wav(OUT_DIR / "sparkle.wav", make_sparkle())
    save_wav(OUT_DIR / "click.wav", make_click())
    save_wav(OUT_DIR / "music_loop.wav", make_music_loop())
    print(f"[SFX] Generated 6 playful SFX + 40s 112bpm music_loop.wav in {OUT_DIR}")


if __name__ == "__main__":
    main()
