#!/usr/bin/env python3
"""
Employetics 40s Commercial Audio Engine
---------------------------------------
Generates broadcast-ready audio completely programmatically:
1. Studio Neural Voiceover with automatic multi-engine cascade:
   - Primary (GPU/Colab): Kokoro-82M (`kokoro`) — open-weight studio neural TTS on GPU
   - Secondary: Microsoft Edge Neural TTS (`edge-tts`)
   - Tertiary fallback: Google TTS (`gTTS`)
2. Automatic slot alignment (keeps exact 0-9, 9-16, 16-24, 24-31, 31-35, 35-40s beats)
3. Lush procedural modern-SaaS soundtrack + synchronized UI motion-graphics SFX
4. Smooth RMS sidechain ducking + soft-clipping broadcast mastering
5. Outputs WAV stems, SRT subtitles, and src/data/audioManifest.json for Remotion
"""

from __future__ import annotations

import argparse
import asyncio
import glob
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
from scipy import signal
from scipy.io import wavfile

SAMPLE_RATE = 48000
TOTAL_DURATION = 40.0
TOTAL_SAMPLES = int(TOTAL_DURATION * SAMPLE_RATE)

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_OUT_DIR = ROOT_DIR / "public" / "audio"
MANIFEST_PATH = ROOT_DIR / "src" / "data" / "audioManifest.json"

SCENES = [
    {
        "id": "scene1",
        "startSec": 0.0,
        "endSec": 9.0,
        "leadIn": 0.15,
        "tailPad": 0.20,
        "text": (
            "Your best developer just resigned. No warning. "
            "But the signs were there: late nights, lost weekends, "
            "falling feedback. Hidden in the data."
        ),
    },
    {
        "id": "scene2",
        "startSec": 9.0,
        "endSec": 16.0,
        "leadIn": 0.25,
        "tailPad": 0.25,
        "text": (
            "Employetics reads daily attendance, tasks and feedback, "
            "and ranks who is likely to leave."
        ),
    },
    {
        "id": "scene3",
        "startSec": 16.0,
        "endSec": 24.0,
        "leadIn": 0.25,
        "tailPad": 0.25,
        "text": (
            "It also tells you why. Overtime. Falling peer feedback. "
            "So you fix the real cause."
        ),
    },
    {
        "id": "scene4",
        "startSec": 24.0,
        "endSec": 31.0,
        "leadIn": 0.25,
        "tailPad": 0.25,
        "text": (
            "Or just ask the HR assistant. "
            "It answers in seconds, from your own data."
        ),
    },
    {
        "id": "scene5",
        "startSec": 31.0,
        "endSec": 35.0,
        "leadIn": 0.25,
        "tailPad": 0.25,
        "text": "Act weeks before the resignation letter.",
    },
    {
        "id": "scene6",
        "startSec": 35.0,
        "endSec": 40.0,
        "leadIn": 0.30,
        "tailPad": 0.45,
        "text": "Employetics. Predict burnout. Keep your people.",
    },
]


def read_wav_float32(path: Path) -> tuple[np.ndarray, int]:
    sr, data = wavfile.read(str(path))
    if np.issubdtype(data.dtype, np.integer):
        max_val = float(np.iinfo(data.dtype).max)
        audio = data.astype(np.float32) / max_val
    else:
        audio = data.astype(np.float32)
    return audio, sr


def write_wav_pcm16(path: Path, audio: np.ndarray, sr: int) -> None:
    clipped = np.clip(audio, -1.0, 1.0)
    pcm16 = (clipped * 32767.0).astype(np.int16)
    wavfile.write(str(path), sr, pcm16)


def find_ffmpeg() -> str:
    """Locate ffmpeg in PATH or bundled inside Remotion's node_modules."""
    found = shutil.which("ffmpeg")
    if found:
        return found

    patterns = [
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / "ffmpeg"),
        str(ROOT_DIR / "node_modules" / "@remotion" / "compositor-*" / "ffmpeg.exe"),
    ]
    for pattern in patterns:
        matches = glob.glob(pattern)
        if matches:
            return matches[0]

    raise RuntimeError(
        "FFmpeg was not found in PATH or node_modules/@remotion/compositor-*. "
        "Please run `npm install` or install ffmpeg."
    )


def run_ffmpeg(ffmpeg_bin: str, args: list[str]) -> None:
    cmd = [ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error", *args]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg failed ({' '.join(cmd)}):\n{res.stderr}")


def build_atempo_filter(speed: float) -> str:
    """Chain atempo filters cleanly for any positive speed factor."""
    factors: list[float] = []
    remaining = speed
    while remaining > 2.0:
        factors.append(2.0)
        remaining /= 2.0
    while remaining < 0.5:
        factors.append(0.5)
        remaining /= 0.5
    factors.append(remaining)
    return ",".join(f"atempo={f:.5f}" for f in factors)


def estimate_word_timings(text: str, duration: float) -> list[dict[str, Any]]:
    """Estimate smooth punctuation-weighted word timestamps when engine doesn't emit them."""
    raw_words = text.split()
    weights: list[float] = []
    for w in raw_words:
        base = max(2.0, float(len(w.strip(".,:;!?"))))
        if w.endswith((".", "!", "?")):
            base += 4.5
        elif w.endswith((",", ":")):
            base += 2.2
        weights.append(base)
    total_w = sum(weights) or 1.0
    cursor = 0.0
    timings: list[dict[str, Any]] = []
    for w, wt in zip(raw_words, weights):
        seg = duration * (wt / total_w)
        timings.append(
            {
                "word": w,
                "startSec": cursor,
                "endSec": cursor + seg,
            }
        )
        cursor += seg
    return timings


class KokoroEngine:
    """GPU-accelerated open-weight Kokoro-82M neural TTS engine."""

    def __init__(self, voice: str, speed: float = 1.0) -> None:
        import torch  # type: ignore
        from kokoro import KPipeline  # type: ignore

        lang_code = "b" if voice.startswith(("bm_", "bf_")) else "a"
        self.voice = voice
        self.speed = speed
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Audio] Kokoro-82M running on PyTorch device: {device.upper()}")
        try:
            self.pipeline = KPipeline(lang_code=lang_code, device=device)
        except TypeError:
            self.pipeline = KPipeline(lang_code=lang_code)

    def synthesize(self, text: str) -> tuple[np.ndarray, list[dict[str, Any]]]:
        chunks: list[np.ndarray] = []
        for _, _, audio in self.pipeline(text, voice=self.voice, speed=self.speed):
            arr = np.asarray(audio, dtype=np.float32)
            chunks.append(arr)
        if not chunks:
            raise RuntimeError("Kokoro returned empty audio.")
        audio_24k = np.concatenate(chunks)
        # Upsample cleanly 24kHz -> 48kHz (exact 2x polyphase)
        audio_48k = signal.resample_poly(audio_24k, 2, 1).astype(np.float32)
        words = estimate_word_timings(text, len(audio_48k) / SAMPLE_RATE)
        return audio_48k, words


def synthesize_espeak(
    text: str,
    ffmpeg_bin: str,
    tmp_dir: Path,
    sid: str,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    """Offline emergency fallback using espeak-ng so audio is never silent."""
    espeak_bin = shutil.which("espeak-ng") or shutil.which("espeak")
    if not espeak_bin:
        raise RuntimeError("espeak-ng not installed.")
    raw_wav = tmp_dir / f"{sid}_espeak_raw.wav"
    out_wav = tmp_dir / f"{sid}_espeak.wav"
    subprocess.run(
        [espeak_bin, "-v", "en-us", "-s", "158", "-w", str(raw_wav), text],
        check=True,
        capture_output=True,
    )
    run_ffmpeg(
        ffmpeg_bin,
        ["-i", str(raw_wav), "-ar", str(SAMPLE_RATE), "-ac", "1", str(out_wav)],
    )
    data, _ = read_wav_float32(out_wav)
    words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
    return data, words


async def synthesize_edge_tts(
    text: str,
    voice: str,
    rate: str,
    ffmpeg_bin: str,
    tmp_dir: Path,
    sid: str,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    import edge_tts  # type: ignore

    raw_mp3 = tmp_dir / f"{sid}_edge.mp3"
    raw_wav = tmp_dir / f"{sid}_edge.wav"
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        boundary="WordBoundary",
    )
    words: list[dict[str, Any]] = []
    with open(raw_mp3, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_s = chunk["offset"] / 10_000_000.0
                dur_s = chunk["duration"] / 10_000_000.0
                words.append(
                    {
                        "word": chunk["text"],
                        "startSec": start_s,
                        "endSec": start_s + dur_s,
                    }
                )
    run_ffmpeg(
        ffmpeg_bin,
        ["-i", str(raw_mp3), "-ar", str(SAMPLE_RATE), "-ac", "1", str(raw_wav)],
    )
    data, _ = read_wav_float32(raw_wav)
    if not words:
        words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
    return data, words


def synthesize_gtts(
    text: str,
    ffmpeg_bin: str,
    tmp_dir: Path,
    sid: str,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    from gtts import gTTS  # type: ignore

    raw_mp3 = tmp_dir / f"{sid}_gtts.mp3"
    raw_wav = tmp_dir / f"{sid}_gtts.wav"
    gTTS(text=text, lang="en", tld="com").save(str(raw_mp3))
    run_ffmpeg(
        ffmpeg_bin,
        ["-i", str(raw_mp3), "-ar", str(SAMPLE_RATE), "-ac", "1", str(raw_wav)],
    )
    data, _ = read_wav_float32(raw_wav)
    words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
    return data, words


def trim_silence(audio: np.ndarray, sr: int, threshold_db: float = -42.0) -> tuple[np.ndarray, float]:
    """Trim leading and trailing silence, returning trimmed audio and trimmed lead seconds."""
    mono = np.mean(np.abs(audio), axis=1) if audio.ndim == 2 else np.abs(audio)
    thresh = 10.0 ** (threshold_db / 20.0)
    idx = np.where(mono > thresh)[0]
    if len(idx) == 0:
        return audio, 0.0
    pad = int(0.03 * sr)
    start = max(0, int(idx[0]) - pad)
    end = min(len(audio), int(idx[-1]) + pad)
    return audio[start:end], start / sr


def polish_voice(mono: np.ndarray, sr: int) -> np.ndarray:
    """Apply clean broadcast voice EQ (HPF 80Hz + subtle presence lift) and gentle compression."""
    sos_hp = signal.butter(2, 80.0, btype="highpass", fs=sr, output="sos")
    y = signal.sosfilt(sos_hp, mono)

    b_peak, a_peak = signal.iirpeak(3200.0 / (sr / 2.0), Q=1.4)
    presence = signal.lfilter(b_peak, a_peak, y)
    y = y + 0.16 * presence

    win = int(0.015 * sr)
    env = np.sqrt(signal.lfilter([1.0 / win] * win, [1.0], y * y) + 1e-9)
    threshold = 0.16
    gain = np.where(env > threshold, (threshold / env) ** 0.45, 1.0)
    y = y * gain

    peak = np.max(np.abs(y)) + 1e-9
    y = y * (0.84 / peak)
    return y.astype(np.float32)


def midi_to_hz(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def synthesize_pad_chord(
    notes_midi: list[float],
    duration: float,
    sr: int,
    brightness: float = 1200.0,
    attack: float = 0.45,
    release: float = 0.65,
) -> np.ndarray:
    """Generate a lush stereo detuned analog synth pad chord."""
    n = int(duration * sr)
    t = np.arange(n, dtype=np.float64) / sr
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    for idx, m in enumerate(notes_midi):
        f = midi_to_hz(m)
        v_l = (
            0.55 * np.sin(2 * np.pi * (f * 0.997) * t + idx)
            + 0.25 * np.sin(2 * np.pi * (f * 2.001) * t)
            + 0.12 * np.sin(2 * np.pi * (f * 3.0) * t)
        )
        v_r = (
            0.55 * np.sin(2 * np.pi * (f * 1.003) * t + idx * 1.7)
            + 0.25 * np.sin(2 * np.pi * (f * 1.999) * t)
            + 0.12 * np.sin(2 * np.pi * (f * 3.002) * t)
        )
        left += v_l
        right += v_r

    scale = 1.0 / max(1, len(notes_midi))
    stereo = np.stack([left * scale, right * scale], axis=1)

    sos = signal.butter(2, min(brightness, sr * 0.42), btype="lowpass", fs=sr, output="sos")
    stereo[:, 0] = signal.sosfilt(sos, stereo[:, 0])
    stereo[:, 1] = signal.sosfilt(sos, stereo[:, 1])

    env = np.ones(n, dtype=np.float64)
    a_s = min(int(attack * sr), n // 2)
    r_s = min(int(release * sr), n // 2)
    if a_s > 0:
        env[:a_s] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a_s))
    if r_s > 0:
        env[-r_s:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r_s))

    return (stereo * env[:, None]).astype(np.float32)


def add_stereo(dest: np.ndarray, src: np.ndarray, start_sec: float, gain: float = 1.0) -> None:
    idx = int(start_sec * SAMPLE_RATE)
    if idx >= len(dest):
        return
    if src.ndim == 1:
        src = np.stack([src, src], axis=1)
    end = min(len(dest), idx + len(src))
    if end <= idx:
        return
    dest[idx:end] += src[: end - idx] * gain


def make_whoosh(duration: float, f_start: float, f_end: float, sr: int) -> np.ndarray:
    rng = np.random.default_rng(42)
    n = int(duration * sr)
    noise = rng.standard_normal(n)
    t = np.linspace(0.0, 1.0, n)
    sos1 = signal.butter(
        2,
        [max(60, f_start * 0.6), min(sr * 0.4, f_start * 1.6)],
        btype="bandpass",
        fs=sr,
        output="sos",
    )
    sos2 = signal.butter(
        2,
        [max(60, f_end * 0.6), min(sr * 0.4, f_end * 1.6)],
        btype="bandpass",
        fs=sr,
        output="sos",
    )
    b1 = signal.sosfilt(sos1, noise)
    b2 = signal.sosfilt(sos2, noise)
    blended = b1 * (1.0 - t) + b2 * t
    env = np.sin(np.pi * t) ** 1.7
    out = blended * env
    out = out / (np.max(np.abs(out)) + 1e-9)
    delay = int(0.004 * sr)
    right = np.roll(out, delay)
    return np.stack([out, right], axis=1).astype(np.float32)


def make_chime(freq_hz: float, duration: float, sr: int, pan: float = 0.0) -> np.ndarray:
    n = int(duration * sr)
    t = np.arange(n) / sr
    tone = (
        0.65 * np.sin(2 * np.pi * freq_hz * t)
        + 0.25 * np.sin(2 * np.pi * freq_hz * 2.0 * t) * np.exp(-t * 6.5)
        + 0.10 * np.sin(2 * np.pi * freq_hz * 3.0 * t) * np.exp(-t * 11.0)
    )
    attack = np.minimum(1.0, t / 0.008)
    decay = np.exp(-t * (4.5 / max(0.25, duration)))
    mono = tone * attack * decay
    l_gain = math.sqrt(0.5 * (1.0 - pan))
    r_gain = math.sqrt(0.5 * (1.0 + pan))
    return np.stack([mono * l_gain, mono * r_gain], axis=1).astype(np.float32)


def make_sub_impact(duration: float, sr: int) -> np.ndarray:
    n = int(duration * sr)
    t = np.arange(n) / sr
    freq = 92.0 * np.exp(-t * 2.8) + 38.0
    phase = 2 * np.pi * np.cumsum(freq) / sr
    wave = np.sin(phase) * np.minimum(1.0, t / 0.012) * np.exp(-t * 2.4)
    return np.stack([wave, wave], axis=1).astype(np.float32)


def make_soft_click(sr: int, pitch: float = 1600.0) -> np.ndarray:
    n = int(0.032 * sr)
    t = np.arange(n) / sr
    click = np.sin(2 * np.pi * pitch * t) * np.exp(-t * 150.0)
    return np.stack([click, click], axis=1).astype(np.float32)


def generate_music_and_sfx(sr: int) -> np.ndarray:
    """Compose the full 40-second modern tech soundtrack + frame-synced UI SFX."""
    bed = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)

    chords = [
        (0.0, 4.6, [45, 57, 60, 64, 71], 750.0, 0.20),
        (4.2, 5.1, [45, 53, 60, 64, 69], 950.0, 0.22),
        (8.9, 3.8, [53, 60, 64, 69, 72], 1450.0, 0.25),
        (12.4, 3.9, [55, 62, 64, 67, 71], 1600.0, 0.26),
        (15.9, 4.2, [50, 57, 60, 64, 69], 1500.0, 0.25),
        (19.8, 4.4, [48, 55, 60, 64, 71], 1650.0, 0.26),
        (23.9, 3.8, [53, 60, 64, 69, 76], 1800.0, 0.24),
        (27.4, 3.9, [55, 62, 67, 71, 74], 1900.0, 0.25),
        (30.9, 4.3, [53, 60, 64, 67, 74], 2100.0, 0.28),
        (34.9, 5.1, [48, 55, 60, 64, 67, 74], 2200.0, 0.30),
    ]
    for start, dur, notes, bright, gain in chords:
        pad = synthesize_pad_chord(notes, dur, sr, brightness=bright, attack=0.55, release=0.85)
        add_stereo(bed, pad, start, gain=gain)

    # Subtle Modern Tech Pulse / Pluck Groove (9.0s -> 35.0s at 116 BPM)
    beat_sec = 60.0 / 116.0
    arp_notes = [69, 72, 76, 79, 76, 72, 74, 71]
    t_cursor = 9.0
    step = 0
    while t_cursor < 34.8:
        note_hz = midi_to_hz(arp_notes[step % len(arp_notes)])
        pan = -0.35 if step % 2 == 0 else 0.35
        pluck = make_chime(note_hz, 0.24, sr, pan=pan)
        add_stereo(bed, pluck, t_cursor, gain=0.055)

        if step % 2 == 0:
            n_k = int(0.16 * sr)
            tk = np.arange(n_k) / sr
            kf = 105.0 * np.exp(-tk * 26.0) + 46.0
            kick = np.sin(2 * np.pi * np.cumsum(kf) / sr) * np.exp(-tk * 14.0)
            add_stereo(bed, kick, t_cursor, gain=0.14)

        t_cursor += beat_sec / 2.0
        step += 1

    # Tension heartbeat pulse during Scene 1
    for beat_t in np.arange(0.6, 8.4, 1.0):
        n_h = int(0.22 * sr)
        th = np.arange(n_h) / sr
        hb = np.sin(2 * np.pi * 55.0 * th) * np.minimum(1.0, th / 0.01) * np.exp(-th * 12.0)
        add_stereo(bed, hb, float(beat_t), gain=0.14)

    # Frame-Synchronized Motion Graphics UI SFX
    sfx = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)

    add_stereo(sfx, make_chime(880.0, 0.45, sr, pan=0.0), 0.15, gain=0.18)
    add_stereo(sfx, make_chime(659.25, 0.55, sr, pan=0.1), 0.28, gain=0.15)
    add_stereo(sfx, make_sub_impact(0.9, sr), 2.25, gain=0.22)
    add_stereo(sfx, make_whoosh(0.85, 320.0, 1800.0, sr), 3.35, gain=0.16)
    add_stereo(sfx, make_chime(523.25, 0.25, sr, pan=-0.4), 4.08, gain=0.10)
    add_stereo(sfx, make_chime(587.33, 0.25, sr, pan=0.0), 5.08, gain=0.10)
    add_stereo(sfx, make_chime(659.25, 0.25, sr, pan=0.4), 6.00, gain=0.10)
    add_stereo(sfx, make_whoosh(0.95, 250.0, 2400.0, sr), 8.45, gain=0.18)
    add_stereo(sfx, make_chime(523.25, 0.65, sr, pan=-0.2), 9.15, gain=0.14)
    add_stereo(sfx, make_chime(783.99, 0.75, sr, pan=0.2), 9.28, gain=0.14)
    add_stereo(sfx, make_whoosh(0.55, 450.0, 1500.0, sr), 11.35, gain=0.12)
    add_stereo(sfx, make_whoosh(0.60, 380.0, 1600.0, sr), 15.75, gain=0.13)
    add_stereo(sfx, make_chime(587.33, 0.28, sr, pan=0.2), 17.50, gain=0.11)
    add_stereo(sfx, make_chime(659.25, 0.28, sr, pan=0.2), 19.16, gain=0.11)
    add_stereo(sfx, make_chime(783.99, 0.50, sr, pan=0.0), 21.35, gain=0.14)

    for idx, click_t in enumerate(np.linspace(24.4, 26.1, 22)):
        pitch = 1550.0 + (idx % 5) * 140.0
        add_stereo(sfx, make_soft_click(sr, pitch=pitch), float(click_t), gain=0.075)

    add_stereo(sfx, make_chime(740.0, 0.22, sr, pan=0.3), 26.30, gain=0.12)
    add_stereo(sfx, make_chime(880.0, 0.45, sr, pan=-0.15), 27.00, gain=0.13)
    add_stereo(sfx, make_chime(1174.66, 0.55, sr, pan=0.15), 27.10, gain=0.11)
    add_stereo(sfx, make_whoosh(0.95, 300.0, 2200.0, sr), 31.10, gain=0.15)
    add_stereo(sfx, make_chime(659.25, 0.65, sr, pan=-0.2), 33.05, gain=0.14)
    add_stereo(sfx, make_chime(1046.50, 0.85, sr, pan=0.2), 33.18, gain=0.15)
    add_stereo(sfx, make_sub_impact(1.4, sr), 35.10, gain=0.20)
    add_stereo(sfx, make_chime(523.25, 1.4, sr, pan=-0.25), 35.12, gain=0.16)
    add_stereo(sfx, make_chime(783.99, 1.6, sr, pan=0.0), 35.24, gain=0.16)
    add_stereo(sfx, make_chime(1046.50, 1.9, sr, pan=0.25), 35.38, gain=0.14)

    combined = bed + sfx
    fade_n = int(1.2 * sr)
    fade = np.linspace(1.0, 0.0, fade_n) ** 1.5
    combined[-fade_n:] *= fade[:, None]
    return combined


def format_srt_time(seconds: float) -> str:
    ms = int(round(max(0.0, seconds) * 1000))
    hrs = ms // 3_600_000
    ms %= 3_600_000
    mins = ms // 60_000
    ms %= 60_000
    secs = ms // 1000
    ms %= 1000
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{ms:03d}"


def write_srt(segments: list[dict[str, Any]], srt_path: Path) -> None:
    lines: list[str] = []
    for i, seg in enumerate(segments, start=1):
        lines.append(str(i))
        lines.append(f"{format_srt_time(seg['startSec'])} --> {format_srt_time(seg['endSec'])}")
        lines.append(seg["text"])
        lines.append("")
    srt_path.write_text("\n".join(lines), encoding="utf-8")


async def build_all_audio(
    engine: str,
    voice: str,
    edge_voice: str,
    speed: float,
    music_volume: float,
) -> None:
    ffmpeg_bin = find_ffmpeg()
    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[Audio] Using FFmpeg: {ffmpeg_bin}")

    active_engine = engine
    kokoro_runner: KokoroEngine | None = None

    if engine in ("auto", "kokoro"):
        try:
            print(f"[Audio] Initializing Kokoro-82M Neural TTS (voice='{voice}', speed={speed})...")
            kokoro_runner = KokoroEngine(voice=voice, speed=speed)
            active_engine = "kokoro"
            print("[Audio] Kokoro-82M GPU/Neural engine loaded successfully!")
        except Exception as exc:
            print(f"[Audio] WARNING: Kokoro unavailable ({exc}); automatically falling back to Edge TTS / gTTS.")
            active_engine = "edge"

    vo_master = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    manifest_segments: list[dict[str, Any]] = []
    used_voice_label = voice if active_engine == "kokoro" else edge_voice

    with tempfile.TemporaryDirectory() as tmp_str:
        tmp_dir = Path(tmp_str)

        for scene in SCENES:
            sid = scene["id"]
            slot_start = float(scene["startSec"])
            slot_end = float(scene["endSec"])
            lead_in = float(scene["leadIn"])
            tail_pad = float(scene["tailPad"])
            max_dur = (slot_end - slot_start) - lead_in - tail_pad

            data: np.ndarray | None = None
            words: list[dict[str, Any]] = []

            # Resilient per-scene cascade so voiceover can NEVER fail silently
            if active_engine == "kokoro" and kokoro_runner is not None:
                try:
                    data, words = kokoro_runner.synthesize(scene["text"])
                except Exception as exc:
                    print(f"[Audio] WARNING: Kokoro synthesis failed ({exc}); switching to Edge TTS...")
                    active_engine = "edge"
                    used_voice_label = edge_voice

            if data is None and active_engine == "edge":
                try:
                    rate_pct = int(round((speed - 1.0) * 100))
                    rate_str = f"{rate_pct:+d}%"
                    data, words = await synthesize_edge_tts(
                        scene["text"], edge_voice, rate_str, ffmpeg_bin, tmp_dir, sid
                    )
                except Exception as exc:
                    print(f"[Audio] WARNING: Edge TTS failed ({exc}); switching to gTTS...")
                    active_engine = "gtts"
                    used_voice_label = "gTTS-en-US"

            if data is None and active_engine == "gtts":
                try:
                    used_voice_label = "gTTS-en-US"
                    data, words = synthesize_gtts(scene["text"], ffmpeg_bin, tmp_dir, sid)
                except Exception as exc:
                    print(f"[Audio] WARNING: gTTS failed ({exc}); switching to offline espeak-ng...")
                    active_engine = "espeak"
                    used_voice_label = "espeak-ng"

            if data is None:
                used_voice_label = "espeak-ng"
                data, words = synthesize_espeak(scene["text"], ffmpeg_bin, tmp_dir, sid)

            assert data is not None
            trimmed, lead_trimmed = trim_silence(data, SAMPLE_RATE)

            for w in words:
                w["startSec"] = max(0.0, w["startSec"] - lead_trimmed)
                w["endSec"] = max(w["startSec"] + 0.05, w["endSec"] - lead_trimmed)

            clip_dur = len(trimmed) / SAMPLE_RATE

            if clip_dur > max_dur:
                speed_factor = clip_dur / max_dur
                print(
                    f"  - {sid}: raw {clip_dur:.2f}s > slot {max_dur:.2f}s -> "
                    f"applying smooth atempo={speed_factor:.3f}x"
                )
                trimmed_wav = tmp_dir / f"{sid}_trim.wav"
                stretched_wav = tmp_dir / f"{sid}_stretch.wav"
                write_wav_pcm16(trimmed_wav, trimmed, SAMPLE_RATE)
                run_ffmpeg(
                    ffmpeg_bin,
                    [
                        "-i",
                        str(trimmed_wav),
                        "-filter:a",
                        build_atempo_filter(speed_factor),
                        "-ar",
                        str(SAMPLE_RATE),
                        "-ac",
                        "1",
                        str(stretched_wav),
                    ],
                )
                trimmed, _ = read_wav_float32(stretched_wav)
                clip_dur = len(trimmed) / SAMPLE_RATE
                for w in words:
                    w["startSec"] /= speed_factor
                    w["endSec"] /= speed_factor
            else:
                print(f"  - {sid}: {clip_dur:.2f}s (fits cleanly inside {max_dur:.2f}s slot)")

            polished = polish_voice(trimmed, SAMPLE_RATE)

            extra = max(0.0, max_dur - clip_dur)
            placement_start = slot_start + lead_in + min(0.18, extra * 0.25)
            add_stereo(vo_master, polished, placement_start, gain=1.0)

            placed_words = [
                {
                    "word": w["word"],
                    "startSec": round(placement_start + w["startSec"], 3),
                    "endSec": round(placement_start + w["endSec"], 3),
                }
                for w in words
            ]

            manifest_segments.append(
                {
                    "sceneId": sid,
                    "startSec": round(placement_start, 3),
                    "endSec": round(placement_start + clip_dur, 3),
                    "text": scene["text"],
                    "words": placed_words,
                }
            )

    print("[Audio] Composing cinematic tech soundtrack + synchronized UI sound effects...")
    music_sfx = generate_music_and_sfx(SAMPLE_RATE)

    # Smooth RMS sidechain ducking whenever narrator speaks
    vo_mono = np.mean(np.abs(vo_master), axis=1)
    win = int(0.18 * SAMPLE_RATE)
    kernel = np.ones(win, dtype=np.float32) / win
    vo_env = np.convolve(vo_mono, kernel, mode="same")
    duck_curve = 1.0 - 0.58 * np.clip(vo_env * 8.5, 0.0, 1.0)
    sos_duck = signal.butter(2, 4.0, btype="lowpass", fs=SAMPLE_RATE, output="sos")
    duck_curve = np.clip(signal.sosfiltfilt(sos_duck, duck_curve), 0.38, 1.0)

    mixed = vo_master * 0.92 + music_sfx * (music_volume * duck_curve[:, None])
    master = np.tanh(mixed * 1.08) * 0.91

    vo_path = AUDIO_OUT_DIR / "voiceover.wav"
    music_path = AUDIO_OUT_DIR / "music_sfx.wav"
    master_path = AUDIO_OUT_DIR / "master_audio.wav"
    srt_path = AUDIO_OUT_DIR / "captions.srt"

    write_wav_pcm16(vo_path, vo_master, SAMPLE_RATE)
    write_wav_pcm16(music_path, music_sfx, SAMPLE_RATE)
    write_wav_pcm16(master_path, master, SAMPLE_RATE)
    write_srt(manifest_segments, srt_path)

    manifest = {
        "voice": f"{active_engine}:{used_voice_label}",
        "durationSec": TOTAL_DURATION,
        "masterAudioFile": "audio/master_audio.wav",
        "hasGeneratedAudio": True,
        "segments": manifest_segments,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    vo_rms_db = 20.0 * math.log10(float(np.sqrt(np.mean(vo_master**2))) + 1e-12)
    master_rms_db = 20.0 * math.log10(float(np.sqrt(np.mean(master**2))) + 1e-12)
    if vo_rms_db < -60.0:
        raise RuntimeError(f"Voiceover track appears silent ({vo_rms_db:.1f} dBFS)!")

    print(f"[Audio] Engine used : {active_engine} ({used_voice_label})")
    print(f"[Audio] Loudness    : Voiceover={vo_rms_db:.1f} dBFS | Master={master_rms_db:.1f} dBFS")
    print(f"[Audio] Master WAV  : {master_path}")
    print(f"[Audio] Captions SRT: {srt_path}")
    print(f"[Audio] Manifest    : {MANIFEST_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate Employetics commercial voiceover, music, SFX & captions."
    )
    parser.add_argument(
        "--engine",
        choices=["auto", "kokoro", "edge", "gtts"],
        default="auto",
        help="TTS engine: auto (Kokoro GPU -> Edge -> gTTS), kokoro, edge, or gtts",
    )
    parser.add_argument(
        "--voice",
        default="am_michael",
        help="Kokoro voice (am_michael, am_fenrir, am_adam, af_heart, af_bella, bm_george)",
    )
    parser.add_argument(
        "--edge-voice",
        default="en-US-AndrewMultilingualNeural",
        help="Edge TTS fallback voice (default: en-US-AndrewMultilingualNeural)",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.02,
        help="Voiceover speed multiplier (default: 1.02)",
    )
    parser.add_argument(
        "--music-volume",
        type=float,
        default=0.72,
        help="Background music & SFX mix level relative to voiceover (default: 0.72)",
    )
    args = parser.parse_args()
    asyncio.run(
        build_all_audio(
            engine=args.engine,
            voice=args.voice,
            edge_voice=args.edge_voice,
            speed=args.speed,
            music_volume=args.music_volume,
        )
    )


if __name__ == "__main__":
    main()
