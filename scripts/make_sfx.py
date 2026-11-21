#!/usr/bin/env python3
"""
Procedurally generate quiet, intimate, emotional audio for Employetics AdThree
using numpy + scipy.io.wavfile (48 kHz, 16-bit stereo WAV):
  - msg_pop.wav      (soft two-note incoming message blip)
  - msg_sent.wav     (gentle muted outgoing message pop)
  - typing_tick.wav  (delicate soft phone keyboard tick)
  - whoosh_soft.wav  (soft breathy transition air)
  - chime.wav        (warm peaceful harmonic chime, ~1.0 s decay)
  - heartbeat.wav    (two soft low thumps for S3 emotional turn)
  - music.wav        (40.0 s felt-piano slow arpeggios over Am - F - C - G with light
                      feedback-delay reverb, sparse + quiet room tone in S1-S3,
                      blooming fuller & warmer at dawn S5-S6, gentle 1.5 s fade-out)
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "sfx"


def save_wav(path: Path, data: np.ndarray, ceiling: float = 0.88) -> None:
    peak = float(np.max(np.abs(data))) + 1e-9
    scale = min(1.0, ceiling / peak) if peak > ceiling else 1.0
    pcm16 = (np.clip(data * scale, -1.0, 1.0) * 32767.0).astype(np.int16)
    wavfile.write(str(path), SR, pcm16)


def make_msg_pop() -> np.ndarray:
    """Soft two-note incoming chat blip (A4 -> D5)."""
    dur = 0.16
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    n1 = np.sin(2.0 * np.pi * 493.88 * t) * np.minimum(1.0, t / 0.004) * np.exp(-t * 36.0)
    t2 = np.maximum(0.0, t - 0.048)
    n2 = (t >= 0.048) * np.sin(2.0 * np.pi * 659.25 * t2) * np.minimum(1.0, t2 / 0.004) * np.exp(-t2 * 30.0)
    mono = (n1 * 0.55 + n2 * 0.65) * 0.82
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_msg_sent() -> np.ndarray:
    """Quiet warm upward swipe-pop when Sara sends a message."""
    dur = 0.11
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    u = t / dur
    freq = 360.0 + 220.0 * (u ** 0.8)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    mono = np.sin(phase) * np.minimum(1.0, t / 0.005) * np.exp(-t * 38.0) * 0.65
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_typing_tick() -> np.ndarray:
    """Ultra-subtle muffled phone keyboard tick."""
    dur = 0.032
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    rng = np.random.default_rng(19)
    noise = rng.standard_normal(n) * np.exp(-t * 180.0)
    sos = signal.butter(2, [600.0, 2200.0], btype="bandpass", fs=SR, output="sos")
    filt = signal.sosfilt(sos, noise)
    filt = filt / (np.max(np.abs(filt)) + 1e-9) * 0.35
    body = np.sin(2.0 * np.pi * 780.0 * t) * np.exp(-t * 165.0) * 0.25
    mono = (filt + body) * 0.72
    return np.stack([mono, mono], axis=1).astype(np.float32)


def make_whoosh_soft() -> np.ndarray:
    """Delicate low-passed breathy air transition."""
    dur = 0.55
    n = int(dur * SR)
    rng = np.random.default_rng(88)
    noise = rng.standard_normal(n)
    t = np.linspace(0.0, 1.0, n)
    sos = signal.butter(2, [180.0, 950.0], btype="bandpass", fs=SR, output="sos")
    filt = signal.sosfilt(sos, noise)
    env = (np.sin(np.pi * t) ** 1.9) * 0.50
    mono = filt / (np.max(np.abs(filt)) + 1e-9) * env
    right = np.roll(mono, int(0.003 * SR))
    return np.stack([mono, right], axis=1).astype(np.float32)


def make_chime() -> np.ndarray:
    """Warm, serene dawn chime (1.0 s decay) when battery hits 100%."""
    dur = 1.35
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    notes = [523.25, 659.25, 783.99, 1046.50]  # C5 E5 G5 C6 warm dawn chord
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)
    for i, hz in enumerate(notes):
        delay = int(i * 0.055 * SR)
        m = n - delay
        tt = np.arange(m, dtype=np.float64) / SR
        bell = (
            0.78 * np.sin(2.0 * np.pi * hz * tt) * np.exp(-tt * 2.9)
            + 0.18 * np.sin(2.0 * np.pi * hz * 2.0 * tt) * np.exp(-tt * 6.5)
        ) * np.minimum(1.0, tt / 0.012) * 0.34
        pan = (i - 1.5) * 0.22
        left[delay:] += bell * math.sqrt(0.5 * (1.0 - pan))
        right[delay:] += bell * math.sqrt(0.5 * (1.0 + pan))
    return np.stack([left, right], axis=1).astype(np.float32)


def make_heartbeat() -> np.ndarray:
    """Two soft deep low thumps (lub-dub) for quiet vulnerability."""
    dur = 0.85
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR

    def thump(offset_s: float, base_hz: float, amp: float) -> np.ndarray:
        tt = np.maximum(0.0, t - offset_s)
        mask = (t >= offset_s).astype(np.float64)
        freq = base_hz + 32.0 * np.exp(-tt * 26.0)
        ph = 2.0 * np.pi * np.cumsum(freq) / SR
        return mask * np.sin(ph) * np.minimum(1.0, tt / 0.014) * np.exp(-tt * 14.0) * amp

    mono = thump(0.02, 54.0, 0.78) + thump(0.28, 48.0, 0.56)
    return np.stack([mono, mono], axis=1).astype(np.float32)


def add_felt_piano_note(
    left: np.ndarray,
    right: np.ndarray,
    start_s: float,
    hz: float,
    amp: float,
    decay: float = 1.65,
    pan: float = 0.0,
) -> None:
    """Additive felt-piano tone: warm fundamental + gentle upper harmonics with soft hammer attack."""
    n = len(left)
    start = int(start_s * SR)
    if start >= n:
        return
    dur_s = min(4.2, (n - start) / SR)
    m = int(dur_s * SR)
    tt = np.arange(m, dtype=np.float64) / SR

    attack = np.minimum(1.0, tt / 0.018)
    # Soft felt-hammer harmonic profile (warm, never harsh)
    tone = (
        1.00 * np.sin(2.0 * np.pi * hz * tt) * np.exp(-tt * decay)
        + 0.34 * np.sin(2.0 * np.pi * hz * 2.0 * tt) * np.exp(-tt * (decay * 1.9))
        + 0.11 * np.sin(2.0 * np.pi * hz * 3.0 * tt) * np.exp(-tt * (decay * 3.1))
        + 0.035 * np.sin(2.0 * np.pi * hz * 4.0 * tt) * np.exp(-tt * (decay * 4.5))
    ) * attack * amp

    left[start : start + m] += tone * math.sqrt(0.5 * (1.0 - pan))
    right[start : start + m] += tone * math.sqrt(0.5 * (1.0 + pan))


def apply_light_reverb(stereo: np.ndarray) -> np.ndarray:
    """Light stereo feedback-delay reverb for intimate room space."""
    n = stereo.shape[0]
    wet = np.zeros_like(stereo)
    taps = [
        (int(0.083 * SR), 0.28, 0.16),
        (int(0.149 * SR), 0.14, 0.25),
        (int(0.231 * SR), 0.19, 0.13),
        (int(0.357 * SR), 0.11, 0.16),
        (int(0.512 * SR), 0.08, 0.09),
    ]
    for d, gL, gR in taps:
        if d < n:
            wet[d:, 0] += stereo[:-d, 0] * gL + stereo[:-d, 1] * (gR * 0.4)
            wet[d:, 1] += stereo[:-d, 1] * gR + stereo[:-d, 0] * (gL * 0.4)
    # Gently soften high frequencies in the reverb tail
    sos = signal.butter(2, 2400.0, btype="lowpass", fs=SR, output="sos")
    wet[:, 0] = signal.sosfilt(sos, wet[:, 0])
    wet[:, 1] = signal.sosfilt(sos, wet[:, 1])
    return stereo * 0.82 + wet * 0.45


def make_music() -> np.ndarray:
    """
    40.0 s emotional felt-piano score over Am - F - C - G:
      - S1-S3 (0-14 s): very sparse, hushed, gentle arpeggio notes + very quiet low room tone
      - S3 turn (~11.3 s): warm resonant low Am chord swell under "But are you?"
      - S4 (14-23 s): steady intimate reflection
      - S5-S6 (23-40 s): room tone disappears; piano blooms warmer & fuller through dawn,
        resolving peacefully on Cmaj9 with a gentle 1.5 s fade-out.
    """
    dur = 40.0
    n = int(dur * SR)
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    # Note frequencies
    A2, C3, D3, E3, F2, G2, G3 = 110.00, 130.81, 146.83, 164.81, 87.31, 98.00, 196.00
    A3, B3, C4, D4, E4, F4, G4 = 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00
    A4, B4, C5, D5, E5, G5 = 440.00, 493.88, 523.25, 587.33, 659.25, 783.99

    # Progression bars (each bar = 2.5 seconds -> 16 bars = 40.0 s)
    # Am - F - C - G repeated 4 times across 40 seconds
    chords = [
        {"root": A2, "mid": [E3, A3, C4, E4, A4, C5]},  # Am
        {"root": F2, "mid": [C3, F4, A3, C4, E4, A4]},  # Fmaj7
        {"root": C3, "mid": [G3, C4, E4, G4, C5, E5]},  # C
        {"root": G2, "mid": [D3, G3, B3, D4, G4, B4]},  # G
    ]

    bar_len = 2.5
    for bar_idx in range(16):
        t_bar = bar_idx * bar_len
        ch = chords[bar_idx % 4]

        if bar_idx <= 4:
            # S1-S3 (0.0 - 12.5 s): Very sparse, hushed, vulnerable
            add_felt_piano_note(left, right, t_bar + 0.05, ch["root"] * 2.0, 0.22, decay=1.25, pan=-0.12)
            add_felt_piano_note(left, right, t_bar + 0.72, ch["mid"][2], 0.19, decay=1.55, pan=0.14)
            add_felt_piano_note(left, right, t_bar + 1.52, ch["mid"][3], 0.16, decay=1.70, pan=-0.08)
            if bar_idx == 4:
                # S3 "But are you?" (f340 = 11.33 s): gentle low resonant chord swell
                add_felt_piano_note(left, right, 11.25, A2, 0.36, decay=0.85, pan=0.0)
                add_felt_piano_note(left, right, 11.30, E3, 0.25, decay=0.95, pan=-0.15)
                add_felt_piano_note(left, right, 11.36, C4, 0.22, decay=1.05, pan=0.15)
        elif bar_idx <= 8:
            # S4 (12.5 - 22.5 s): Steady intimate arpeggios during self-awareness reveal
            add_felt_piano_note(left, right, t_bar + 0.02, ch["root"], 0.26, decay=1.1, pan=-0.18)
            add_felt_piano_note(left, right, t_bar + 0.45, ch["mid"][0], 0.18, decay=1.45, pan=-0.06)
            add_felt_piano_note(left, right, t_bar + 0.92, ch["mid"][2], 0.21, decay=1.55, pan=0.12)
            add_felt_piano_note(left, right, t_bar + 1.42, ch["mid"][3], 0.19, decay=1.60, pan=0.22)
            add_felt_piano_note(left, right, t_bar + 1.92, ch["mid"][4], 0.15, decay=1.75, pan=-0.10)
        elif bar_idx <= 14:
            # S5-S6 (22.5 - 37.5 s): Dawn blooms — fuller, warmer, hopeful arpeggios
            warm_gain = 1.0 + min(0.28, (bar_idx - 9) * 0.07)
            add_felt_piano_note(left, right, t_bar + 0.00, ch["root"], 0.34 * warm_gain, decay=0.95, pan=-0.20)
            add_felt_piano_note(left, right, t_bar + 0.03, ch["root"] * 2.0, 0.22 * warm_gain, decay=1.10, pan=-0.05)
            steps = [0.34, 0.68, 1.04, 1.40, 1.76, 2.12]
            notes_seq = [ch["mid"][0], ch["mid"][1], ch["mid"][2], ch["mid"][3], ch["mid"][4], ch["mid"][5]]
            for s_idx, (dt, nhz) in enumerate(zip(steps, notes_seq)):
                add_felt_piano_note(
                    left,
                    right,
                    t_bar + dt,
                    nhz,
                    (0.21 if s_idx % 2 == 0 else 0.17) * warm_gain,
                    decay=1.35,
                    pan=-0.25 + s_idx * 0.10,
                )
        else:
            # Final bar (37.5 - 40.0 s): Resolve peacefully on warm Cmaj9
            add_felt_piano_note(left, right, t_bar + 0.00, C3, 0.34, decay=0.80, pan=-0.15)
            add_felt_piano_note(left, right, t_bar + 0.06, G3, 0.24, decay=0.88, pan=0.05)
            add_felt_piano_note(left, right, t_bar + 0.14, D4, 0.22, decay=0.95, pan=-0.10)
            add_felt_piano_note(left, right, t_bar + 0.22, E4, 0.23, decay=0.98, pan=0.16)
            add_felt_piano_note(left, right, t_bar + 0.34, C5, 0.20, decay=1.05, pan=0.24)
            add_felt_piano_note(left, right, t_bar + 0.48, G5, 0.14, decay=1.15, pan=-0.18)

    stereo = apply_light_reverb(np.stack([left, right], axis=1))

    # Very quiet low nocturnal room tone during S1-S3 (0-14 s), gently disappearing before S5 (by 23 s)
    t_all = np.arange(n, dtype=np.float64) / SR
    rng = np.random.default_rng(707)
    room_noise = rng.standard_normal(n)
    sos_room = signal.butter(2, [42.0, 180.0], btype="bandpass", fs=SR, output="sos")
    room = signal.sosfilt(sos_room, room_noise)
    room = room / (np.max(np.abs(room)) + 1e-9)
    # Envelope: gentle 0.032 in S1-S3 (0..14 s), fading down to 0 by S5 start (23.0 s)
    room_env = np.clip(1.0 - np.maximum(0.0, (t_all - 14.0) / 9.0), 0.0, 1.0) * 0.032
    stereo[:, 0] += room * room_env
    stereo[:, 1] += np.roll(room, int(0.008 * SR)) * room_env

    # Smooth 0.25 s fade-in and gentle 1.5 s fade-out at end
    fade_in = int(0.25 * SR)
    fade_out = int(1.5 * SR)
    stereo[:fade_in] *= np.linspace(0.0, 1.0, fade_in)[:, None]
    stereo[-fade_out:] *= np.linspace(1.0, 0.0, fade_out)[:, None]

    peak = float(np.max(np.abs(stereo))) + 1e-9
    stereo = stereo / peak * 0.80
    return stereo.astype(np.float32)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    save_wav(OUT_DIR / "msg_pop.wav", make_msg_pop())
    save_wav(OUT_DIR / "msg_sent.wav", make_msg_sent())
    save_wav(OUT_DIR / "typing_tick.wav", make_typing_tick())
    save_wav(OUT_DIR / "whoosh_soft.wav", make_whoosh_soft())
    save_wav(OUT_DIR / "chime.wav", make_chime())
    save_wav(OUT_DIR / "heartbeat.wav", make_heartbeat())
    save_wav(OUT_DIR / "music.wav", make_music())
    print(f"[SFX] Generated 6 intimate UI SFX + 40s felt-piano music.wav in {OUT_DIR}")


if __name__ == "__main__":
    main()
