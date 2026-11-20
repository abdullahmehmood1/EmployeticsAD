#!/usr/bin/env python3
"""
Employetics 40s Commercial Audio Engine (Studio Human Voiceover Edition)
------------------------------------------------------------------------
Generates natural, studio-quality human voiceover + subtle cinematic soundtrack & UI SFX:
- Engines supported (NO robotic gTTS/espeak silent downgrades!):
  1. `edge`       : Microsoft Neural HD Multilingual voices (en-US-AndrewMultilingualNeural,
                    en-US-BrianMultilingualNeural, en-US-AvaMultilingualNeural, en-GB-RyanNeural)
  2. `chatterbox` : Resemble AI Chatterbox GPU (state-of-the-art expressive human TTS +
                    optional zero-shot voice cloning from any 5-15s WAV/MP3 reference!)
  3. `kokoro`     : Kokoro-82M CUDA GPU neural TTS (am_michael, am_adam, af_heart, bm_george)
  4. `elevenlabs` : ElevenLabs Studio API (eleven_multilingual_v2 / eleven_turbo_v2_5)
  5. `custom`     : Bring your own pre-recorded human voiceover WAV/MP3
- Uses clean studio FFmpeg broadcast EQ/compression (no metallic scipy distortion or clipping!)
- Mixes a warm, unobtrusive cinematic music bed + delicate UI SFX with smooth sidechain ducking
"""

from __future__ import annotations

import argparse
import asyncio
import glob
import json
import math
import os
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
        "leadIn": 0.20,
        "tailPad": 0.20,
        "displayText": (
            "One teammate is drowning in tasks. Another has hours to spare. "
            "You only notice when someone burns out."
        ),
        "ttsText": (
            "One teammate is drowning in tasks. Another has hours to spare. "
            "You only notice when someone burns out."
        ),
    },
    {
        "id": "scene2",
        "startSec": 9.0,
        "endSec": 19.0,
        "leadIn": 0.30,
        "tailPad": 0.30,
        "displayText": (
            "Employetics watches your team every day, and flags who is heading for burnout."
        ),
        "ttsText": (
            "Employetics watches your team every day — and flags who is heading for burnout."
        ),
    },
    {
        "id": "scene3",
        "startSec": 19.0,
        "endSec": 31.0,
        "leadIn": 0.25,
        "tailPad": 0.25,
        "displayText": (
            "One click gives a fairer split. In this demo, the most overloaded teammate "
            "drops from 115 percent to 88 percent capacity."
        ),
        "ttsText": (
            "One click gives a fairer split. In this demo, the most overloaded teammate "
            "drops from 115 percent to 88 percent capacity."
        ),
    },
    {
        "id": "scene4",
        "startSec": 31.0,
        "endSec": 35.0,
        "leadIn": 0.20,
        "tailPad": 0.20,
        "displayText": "A balanced team. Before burnout, not after.",
        "ttsText": "A balanced team. Before burnout, not after.",
    },
    {
        "id": "scene5",
        "startSec": 35.0,
        "endSec": 40.0,
        "leadIn": 0.30,
        "tailPad": 0.40,
        "displayText": "Employetics. Predict burnout. Keep your people.",
        "ttsText": "Employetics. Predict burnout. Keep your people.",
    },
]

# Built-in ElevenLabs popular commercial voice IDs
ELEVENLABS_VOICES = {
    "brian": "nPczCjzI2devNBz1zQrb",   # Deep, warm American commercial narrator
    "adam": "pNInz6obpgDQGcFmaJgB",    # Crisp modern tech male
    "chris": "iP95p4xoKVk53GoZ742B",   # Casual, natural conversational male
    "rachel": "21m00Tcm4TlvDq8ikWAM",  # Warm, polished female commercial narrator
    "sarah": "EXAVITQu4vr4xnSDxMaL",   # Soft, articulate studio female
}


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
    raise RuntimeError("FFmpeg not found in PATH or node_modules/@remotion/compositor-*.")


def run_ffmpeg(ffmpeg_bin: str, args: list[str]) -> None:
    cmd = [ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error", *args]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg failed ({' '.join(cmd)}):\n{res.stderr}")


def ffmpeg_supports_filter(ffmpeg_bin: str, filter_name: str) -> bool:
    try:
        res = subprocess.run(
            [ffmpeg_bin, "-hide_banner", "-filters"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return f" {filter_name} " in res.stdout
    except Exception:
        return False


def build_atempo_filter(speed: float) -> str:
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
    raw_words = text.split()
    weights: list[float] = []
    for w in raw_words:
        base = max(2.0, float(len(w.strip(".,:;!?—"))))
        if w.endswith((".", "!", "?")):
            base += 4.5
        elif w.endswith((",", ":", "—")):
            base += 2.2
        weights.append(base)
    total_w = sum(weights) or 1.0
    cursor = 0.0
    timings: list[dict[str, Any]] = []
    for w, wt in zip(raw_words, weights):
        seg = duration * (wt / total_w)
        timings.append({"word": w, "startSec": cursor, "endSec": cursor + seg})
        cursor += seg
    return timings


# ---------------------------------------------------------------------------
# STUDIO HUMAN TTS ENGINES
# ---------------------------------------------------------------------------

async def synthesize_edge_tts(
    text: str,
    voice: str,
    speed: float,
    ffmpeg_bin: str,
    tmp_dir: Path,
    sid: str,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    import edge_tts  # type: ignore

    rate_pct = int(round((speed - 1.0) * 100))
    rate_str = f"{rate_pct:+d}%"
    raw_mp3 = tmp_dir / f"{sid}_edge.mp3"
    raw_wav = tmp_dir / f"{sid}_edge.wav"

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate_str,
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
                words.append({"word": chunk["text"], "startSec": start_s, "endSec": start_s + dur_s})

    run_ffmpeg(ffmpeg_bin, ["-i", str(raw_mp3), "-ar", str(SAMPLE_RATE), "-ac", "1", str(raw_wav)])
    data, _ = read_wav_float32(raw_wav)
    if not words:
        words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
    return data, words


class ChatterboxEngine:
    """Resemble AI Chatterbox GPU — hyper-realistic human studio TTS + optional voice cloning."""

    def __init__(
        self,
        exaggeration: float = 0.48,
        cfg_weight: float = 0.45,
        reference_audio: str | None = None,
    ) -> None:
        import torch  # type: ignore
        from chatterbox.tts import ChatterboxTTS  # type: ignore

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Audio] Loading Resemble AI Chatterbox TTS on {device.upper()}...")
        self.model = ChatterboxTTS.from_pretrained(device=device)
        self.sr = int(self.model.sr)
        self.exaggeration = exaggeration
        self.cfg_weight = cfg_weight
        self.reference_audio = reference_audio if (reference_audio and Path(reference_audio).exists()) else None
        if self.reference_audio:
            print(f"[Audio] Voice cloning reference active: {self.reference_audio}")

    def synthesize(self, text: str, ffmpeg_bin: str, tmp_dir: Path, sid: str) -> tuple[np.ndarray, list[dict[str, Any]]]:
        wav_tensor = self.model.generate(
            text=text,
            audio_prompt_path=self.reference_audio,
            exaggeration=self.exaggeration,
            cfg_weight=self.cfg_weight,
        )
        arr = wav_tensor.squeeze().detach().cpu().numpy().astype(np.float32)
        raw_wav = tmp_dir / f"{sid}_cb_raw.wav"
        out_wav = tmp_dir / f"{sid}_cb_48k.wav"
        write_wav_pcm16(raw_wav, arr, self.sr)
        run_ffmpeg(ffmpeg_bin, ["-i", str(raw_wav), "-ar", str(SAMPLE_RATE), "-ac", "1", str(out_wav)])
        data, _ = read_wav_float32(out_wav)
        words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
        return data, words


class KokoroEngine:
    """Kokoro-82M CUDA GPU neural TTS."""

    def __init__(self, voice: str, speed: float = 0.98) -> None:
        import torch  # type: ignore
        from kokoro import KPipeline  # type: ignore

        lang_code = "b" if voice.startswith(("bm_", "bf_")) else "a"
        self.voice = voice
        self.speed = speed
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Audio] Loading Kokoro-82M Neural TTS on {device.upper()} (voice='{voice}')...")
        try:
            self.pipeline = KPipeline(lang_code=lang_code, device=device)
        except TypeError:
            self.pipeline = KPipeline(lang_code=lang_code)

    def synthesize(self, text: str, ffmpeg_bin: str, tmp_dir: Path, sid: str) -> tuple[np.ndarray, list[dict[str, Any]]]:
        chunks: list[np.ndarray] = []
        for _, _, audio in self.pipeline(text, voice=self.voice, speed=self.speed):
            chunks.append(np.asarray(audio, dtype=np.float32))
        if not chunks:
            raise RuntimeError("Kokoro returned empty audio.")
        audio_24k = np.concatenate(chunks)
        raw_wav = tmp_dir / f"{sid}_kokoro_24k.wav"
        out_wav = tmp_dir / f"{sid}_kokoro_48k.wav"
        write_wav_pcm16(raw_wav, audio_24k, 24000)
        run_ffmpeg(ffmpeg_bin, ["-i", str(raw_wav), "-ar", str(SAMPLE_RATE), "-ac", "1", str(out_wav)])
        data, _ = read_wav_float32(out_wav)
        words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
        return data, words


def synthesize_elevenlabs(
    text: str,
    api_key: str,
    voice_name_or_id: str,
    ffmpeg_bin: str,
    tmp_dir: Path,
    sid: str,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    import requests  # type: ignore

    voice_id = ELEVENLABS_VOICES.get(voice_name_or_id.lower(), voice_name_or_id)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.52,
            "similarity_boost": 0.78,
            "style": 0.28,
            "use_speaker_boost": True,
        },
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=45)
    if resp.status_code != 200:
        raise RuntimeError(f"ElevenLabs API error {resp.status_code}: {resp.text[:250]}")

    raw_mp3 = tmp_dir / f"{sid}_el.mp3"
    raw_wav = tmp_dir / f"{sid}_el.wav"
    raw_mp3.write_bytes(resp.content)
    run_ffmpeg(ffmpeg_bin, ["-i", str(raw_mp3), "-ar", str(SAMPLE_RATE), "-ac", "1", str(raw_wav)])
    data, _ = read_wav_float32(raw_wav)
    words = estimate_word_timings(text, len(data) / SAMPLE_RATE)
    return data, words


# ---------------------------------------------------------------------------
# CLEAN STUDIO VOICE MASTERING (ZERO SCIPY DISTORTION)
# ---------------------------------------------------------------------------

def trim_silence(audio: np.ndarray, sr: int, threshold_db: float = -44.0) -> tuple[np.ndarray, float]:
    mono = np.mean(np.abs(audio), axis=1) if audio.ndim == 2 else np.abs(audio)
    thresh = 10.0 ** (threshold_db / 20.0)
    idx = np.where(mono > thresh)[0]
    if len(idx) == 0:
        return audio, 0.0
    pad = int(0.035 * sr)
    start = max(0, int(idx[0]) - pad)
    end = min(len(audio), int(idx[-1]) + pad)
    return audio[start:end], start / sr


def studio_master_voice_track(
    vo_stereo: np.ndarray,
    ffmpeg_bin: str,
    tmp_dir: Path,
) -> np.ndarray:
    """
    Apply transparent broadcast studio vocal mastering via FFmpeg:
    - Clean 75Hz highpass (removes rumble)
    - Gentle warmth (+1.4 dB @ 175Hz) & air/clarity (+1.6 dB @ 3.2kHz)
    - Smooth studio compressor (ratio 2.2:1, 15ms attack, 160ms release)
    - Clean peak limiter (ceiling -1.0 dBFS, ZERO harsh clipping!)
    """
    raw_path = tmp_dir / "vo_pre_master.wav"
    out_path = tmp_dir / "vo_mastered.wav"
    write_wav_pcm16(raw_path, vo_stereo, SAMPLE_RATE)

    if ffmpeg_supports_filter(ffmpeg_bin, "acompressor") and ffmpeg_supports_filter(ffmpeg_bin, "equalizer"):
        af = (
            "highpass=f=75,"
            "equalizer=f=175:t=q:w=1.2:g=1.4,"
            "equalizer=f=3200:t=q:w=1.5:g=1.6,"
            "acompressor=threshold=-18dB:ratio=2.2:attack=15:release=160:makeup=2.0,"
            "alimiter=limit=0.89:attack=5:release=60"
        )
        run_ffmpeg(ffmpeg_bin, ["-i", str(raw_path), "-af", af, "-ar", str(SAMPLE_RATE), "-ac", "2", str(out_path)])
        mastered, _ = read_wav_float32(out_path)
        return mastered

    # Transparent linear peak normalization fallback (zero distortion!)
    peak = float(np.max(np.abs(vo_stereo))) + 1e-9
    return (vo_stereo * (0.86 / peak)).astype(np.float32)


# ---------------------------------------------------------------------------
# WARM SUBTLE CINEMATIC SOUNDTRACK + TASTEFUL UI SFX
# ---------------------------------------------------------------------------

def midi_to_hz(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def synthesize_warm_pad(
    notes_midi: list[float],
    duration: float,
    sr: int,
    cutoff_hz: float = 920.0,
    attack: float = 0.65,
    release: float = 0.90,
) -> np.ndarray:
    """Warm, silky low-passed ambient chord pad designed to sit cleanly beneath human speech."""
    n = int(duration * sr)
    t = np.arange(n, dtype=np.float64) / sr
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    for idx, m in enumerate(notes_midi):
        f = midi_to_hz(m)
        # Gentle chorus detuning without harsh high harmonics
        left += 0.68 * np.sin(2 * np.pi * (f * 0.998) * t + idx) + 0.18 * np.sin(2 * np.pi * (f * 2.0) * t)
        right += 0.68 * np.sin(2 * np.pi * (f * 1.002) * t + idx * 1.5) + 0.18 * np.sin(2 * np.pi * (f * 2.001) * t)

    scale = 1.0 / max(1, len(notes_midi))
    stereo = np.stack([left * scale, right * scale], axis=1)

    sos = signal.butter(2, min(cutoff_hz, sr * 0.4), btype="lowpass", fs=sr, output="sos")
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


def make_air_whoosh(duration: float, f_start: float, f_end: float, sr: int) -> np.ndarray:
    rng = np.random.default_rng(42)
    n = int(duration * sr)
    noise = rng.standard_normal(n)
    t = np.linspace(0.0, 1.0, n)
    sos1 = signal.butter(2, [max(70, f_start * 0.65), min(sr * 0.35, f_start * 1.45)], btype="bandpass", fs=sr, output="sos")
    sos2 = signal.butter(2, [max(70, f_end * 0.65), min(sr * 0.35, f_end * 1.45)], btype="bandpass", fs=sr, output="sos")
    blended = signal.sosfilt(sos1, noise) * (1.0 - t) + signal.sosfilt(sos2, noise) * t
    env = np.sin(np.pi * t) ** 1.8
    out = blended * env
    out = out / (np.max(np.abs(out)) + 1e-9)
    right = np.roll(out, int(0.004 * sr))
    return np.stack([out, right], axis=1).astype(np.float32)


def make_soft_bell(freq_hz: float, duration: float, sr: int, pan: float = 0.0) -> np.ndarray:
    n = int(duration * sr)
    t = np.arange(n) / sr
    tone = 0.78 * np.sin(2 * np.pi * freq_hz * t) + 0.16 * np.sin(2 * np.pi * freq_hz * 2.0 * t) * np.exp(-t * 8.0)
    env = np.minimum(1.0, t / 0.012) * np.exp(-t * (4.8 / max(0.25, duration)))
    mono = tone * env
    l_g = math.sqrt(0.5 * (1.0 - pan))
    r_g = math.sqrt(0.5 * (1.0 + pan))
    return np.stack([mono * l_g, mono * r_g], axis=1).astype(np.float32)


def make_warm_sub(duration: float, sr: int) -> np.ndarray:
    n = int(duration * sr)
    t = np.arange(n) / sr
    freq = 82.0 * np.exp(-t * 2.6) + 40.0
    wave = np.sin(2 * np.pi * np.cumsum(freq) / sr) * np.minimum(1.0, t / 0.015) * np.exp(-t * 2.6)
    return np.stack([wave, wave], axis=1).astype(np.float32)


def apply_subtle_stereo_reverb(stereo: np.ndarray, sr: int, wet: float = 0.24) -> np.ndarray:
    """Add silky studio room ambience to music & UI chimes via multi-tap stereo feedback delays."""
    out = stereo.copy()
    taps = [
        (0.037, 0.32, 0.26),
        (0.061, 0.25, 0.30),
        (0.097, 0.19, 0.17),
        (0.143, 0.13, 0.15),
        (0.211, 0.08, 0.09),
    ]
    reverb = np.zeros_like(stereo)
    n = len(stereo)
    for delay_s, g_l, g_r in taps:
        d = int(delay_s * sr)
        if d < n:
            reverb[d:, 0] += stereo[: n - d, 1] * g_l
            reverb[d:, 1] += stereo[: n - d, 0] * g_r
    # Warm low-pass on reverb tail so it feels spacious and velvety
    sos = signal.butter(2, 2600.0, btype="lowpass", fs=sr, output="sos")
    reverb[:, 0] = signal.sosfilt(sos, reverb[:, 0])
    reverb[:, 1] = signal.sosfilt(sos, reverb[:, 1])
    return (out * (1.0 - wet * 0.35) + reverb * wet).astype(np.float32)


def generate_music_and_sfx(sr: int) -> np.ndarray:
    """Subtle, velvety Apple/Linear-style ambient soundtrack + delicate UI SFX."""
    bed = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)

    chords = [
        # Scene 1 (0-9s): Moody workload imbalance tension
        (0.0, 4.8, [45, 57, 60, 64, 71], 680.0, 0.22),
        (4.3, 5.1, [45, 53, 60, 64, 69], 780.0, 0.23),
        # Scene 2 (9-19s): Clean daily monitoring SaaS pulse
        (8.9, 5.2, [53, 60, 64, 69], 1020.0, 0.24),
        (13.8, 5.5, [55, 62, 64, 67], 1080.0, 0.24),
        # Scene 3 (19-31s): One-click rebalance & uplifting resolution
        (18.9, 6.2, [50, 57, 60, 64], 1080.0, 0.24),
        (24.7, 6.5, [48, 55, 60, 64, 71], 1220.0, 0.25),
        # Scene 4 (31-35s): Balanced team harmony
        (30.9, 4.3, [53, 60, 64, 67, 74], 1280.0, 0.26),
        # Scene 5 (35-40s): Clean warm brand resolve
        (34.9, 5.1, [48, 55, 60, 64, 67], 1350.0, 0.28),
    ]
    for start, dur, notes, cutoff, gain in chords:
        pad = synthesize_warm_pad(notes, dur, sr, cutoff_hz=cutoff)
        add_stereo(bed, pad, start, gain=gain)

    # Gentle deep rhythmic pulse (9.0s -> 35.0s at 112 BPM — stays below 160Hz, never clashes with voice!)
    beat_sec = 60.0 / 112.0
    t_cursor = 9.0
    while t_cursor < 34.8:
        n_k = int(0.18 * sr)
        tk = np.arange(n_k) / sr
        kf = 92.0 * np.exp(-tk * 24.0) + 46.0
        pulse = np.sin(2 * np.pi * np.cumsum(kf) / sr) * np.minimum(1.0, tk / 0.008) * np.exp(-tk * 13.0)
        add_stereo(bed, pulse, t_cursor, gain=0.13)
        t_cursor += beat_sec

    # Tasteful UI sound effects synced exactly to the new 5-scene beats
    sfx = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    # Scene 1 (0-9s): Overload card, Spare card, Burnout threshold hit
    add_stereo(sfx, make_soft_bell(587.33, 0.40, sr, pan=-0.3), 0.25, gain=0.10)
    add_stereo(sfx, make_soft_bell(659.25, 0.45, sr, pan=0.3), 2.80, gain=0.10)
    add_stereo(sfx, make_warm_sub(0.85, sr), 5.70, gain=0.17)
    add_stereo(sfx, make_air_whoosh(0.80, 240.0, 1500.0, sr), 8.55, gain=0.12)
    # Scene 2 (9-19s): Daily radar reveal + Burnout flag at 13.8s
    add_stereo(sfx, make_soft_bell(523.25, 0.65, sr, pan=-0.2), 9.15, gain=0.09)
    add_stereo(sfx, make_soft_bell(783.99, 0.75, sr, pan=0.2), 9.30, gain=0.09)
    add_stereo(sfx, make_soft_bell(880.0, 0.50, sr, pan=0.0), 13.80, gain=0.11)
    add_stereo(sfx, make_air_whoosh(0.60, 280.0, 1400.0, sr), 18.65, gain=0.11)
    # Scene 3 (19-31s): One-click rebalance button click at 20.8s + flying task arcs + 88% arrival
    add_stereo(sfx, make_soft_bell(987.77, 0.35, sr, pan=0.25), 20.80, gain=0.13)
    add_stereo(sfx, make_air_whoosh(0.75, 320.0, 1600.0, sr), 21.15, gain=0.10)
    add_stereo(sfx, make_air_whoosh(0.70, 360.0, 1700.0, sr), 21.65, gain=0.09)
    add_stereo(sfx, make_soft_bell(659.25, 0.60, sr, pan=-0.2), 25.30, gain=0.11)
    add_stereo(sfx, make_soft_bell(1046.50, 0.85, sr, pan=0.2), 25.44, gain=0.12)
    # Scene 4 (31-35s): Balanced team harmony shimmer
    add_stereo(sfx, make_air_whoosh(0.80, 260.0, 1500.0, sr), 30.75, gain=0.10)
    add_stereo(sfx, make_soft_bell(783.99, 0.80, sr, pan=0.0), 31.25, gain=0.10)
    # Scene 5 (35-40s): Clean Employetics brand sting
    add_stereo(sfx, make_warm_sub(1.3, sr), 35.10, gain=0.16)
    add_stereo(sfx, make_soft_bell(523.25, 1.3, sr, pan=-0.25), 35.12, gain=0.11)
    add_stereo(sfx, make_soft_bell(783.99, 1.6, sr, pan=0.25), 35.26, gain=0.11)

    combined = apply_subtle_stereo_reverb(bed + sfx, sr, wet=0.26)
    fade_n = int(1.3 * sr)
    fade = np.linspace(1.0, 0.0, fade_n) ** 1.6
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
    edge_voice: str,
    kokoro_voice: str,
    elevenlabs_key: str,
    elevenlabs_voice: str,
    reference_voice: str,
    custom_voiceover: str,
    speed: float,
    music_volume: float,
) -> None:
    ffmpeg_bin = find_ffmpeg()
    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[Audio] Using FFmpeg: {ffmpeg_bin}")

    vo_master = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    manifest_segments: list[dict[str, Any]] = []
    active_engine = engine
    used_voice_label = ""

    with tempfile.TemporaryDirectory() as tmp_str:
        tmp_dir = Path(tmp_str)

        # Special mode: User provided their own recorded/ElevenLabs voiceover WAV/MP3
        if engine == "custom" or (custom_voiceover and Path(custom_voiceover).exists()):
            src_path = Path(custom_voiceover)
            if not src_path.exists():
                raise RuntimeError(f"Custom voiceover file not found: {src_path}")
            norm_wav = tmp_dir / "custom_vo_48k.wav"
            run_ffmpeg(ffmpeg_bin, ["-i", str(src_path), "-ar", str(SAMPLE_RATE), "-ac", "2", str(norm_wav)])
            vo_data, _ = read_wav_float32(norm_wav)
            n_copy = min(TOTAL_SAMPLES, len(vo_data))
            vo_master[:n_copy] = vo_data[:n_copy]
            active_engine = "custom"
            used_voice_label = src_path.name
            for scene in SCENES:
                manifest_segments.append(
                    {
                        "sceneId": scene["id"],
                        "startSec": float(scene["startSec"]) + 0.2,
                        "endSec": float(scene["endSec"]) - 0.2,
                        "text": scene["displayText"],
                        "words": estimate_word_timings(
                            scene["displayText"],
                            (float(scene["endSec"]) - float(scene["startSec"])) - 0.4,
                        ),
                    }
                )
        else:
            # Initialize selected studio human engine (with clean human-only fallback chain:
            # chatterbox -> edge -> kokoro; NEVER silently drops to robotic gTTS/espeak!)
            cb_runner: ChatterboxEngine | None = None
            kokoro_runner: KokoroEngine | None = None

            if engine == "elevenlabs":
                if not elevenlabs_key.strip():
                    raise RuntimeError(
                        "VOICE_ENGINE='elevenlabs' selected, but ELEVENLABS_API_KEY is empty. "
                        "Paste your ElevenLabs API key or select 'edge', 'chatterbox', or 'kokoro'."
                    )
                used_voice_label = elevenlabs_voice
            elif engine == "chatterbox":
                try:
                    cb_runner = ChatterboxEngine(
                        exaggeration=0.46,
                        cfg_weight=0.45,
                        reference_audio=reference_voice or None,
                    )
                    used_voice_label = Path(reference_voice).name if reference_voice else "chatterbox-studio"
                except Exception as exc:
                    print(f"[Audio] WARNING: Chatterbox unavailable ({exc}); switching to Microsoft Neural HD (edge)...")
                    active_engine = "edge"
                    used_voice_label = edge_voice
            elif engine == "kokoro":
                try:
                    kokoro_runner = KokoroEngine(voice=kokoro_voice, speed=speed)
                    used_voice_label = kokoro_voice
                except Exception as exc:
                    print(f"[Audio] WARNING: Kokoro unavailable ({exc}); switching to Microsoft Neural HD (edge)...")
                    active_engine = "edge"
                    used_voice_label = edge_voice
            elif engine in ("edge", "auto"):
                active_engine = "edge"
                used_voice_label = edge_voice

            print(f"[Audio] Synthesizing 6 scenes using studio engine='{active_engine}' ({used_voice_label})...")

            for scene in SCENES:
                sid = scene["id"]
                slot_start = float(scene["startSec"])
                slot_end = float(scene["endSec"])
                lead_in = float(scene["leadIn"])
                tail_pad = float(scene["tailPad"])
                max_dur = (slot_end - slot_start) - lead_in - tail_pad

                data: np.ndarray | None = None
                words: list[dict[str, Any]] = []

                if active_engine == "elevenlabs":
                    data, words = synthesize_elevenlabs(
                        scene["ttsText"], elevenlabs_key.strip(), elevenlabs_voice, ffmpeg_bin, tmp_dir, sid
                    )
                elif active_engine == "chatterbox" and cb_runner is not None:
                    try:
                        data, words = cb_runner.synthesize(scene["ttsText"], ffmpeg_bin, tmp_dir, sid)
                    except Exception as exc:
                        print(f"[Audio] WARNING: Chatterbox error on {sid} ({exc}); switching to Microsoft Neural HD...")
                        active_engine = "edge"
                        used_voice_label = edge_voice

                if data is None and active_engine == "edge":
                    try:
                        data, words = await synthesize_edge_tts(
                            scene["ttsText"], edge_voice, speed, ffmpeg_bin, tmp_dir, sid
                        )
                    except Exception as exc:
                        print(f"[Audio] WARNING: Edge Neural TTS failed ({exc}); switching to Kokoro-82M GPU...")
                        active_engine = "kokoro"
                        used_voice_label = kokoro_voice
                        if kokoro_runner is None:
                            kokoro_runner = KokoroEngine(voice=kokoro_voice, speed=speed)

                if data is None and active_engine == "kokoro":
                    if kokoro_runner is None:
                        kokoro_runner = KokoroEngine(voice=kokoro_voice, speed=speed)
                    data, words = kokoro_runner.synthesize(scene["ttsText"], ffmpeg_bin, tmp_dir, sid)

                if data is None:
                    raise RuntimeError(
                        "No studio human TTS engine succeeded (chatterbox / edge / kokoro). "
                        "Refusing to fall back to robotic TTS. Check internet or GPU setup."
                    )

                trimmed, lead_trimmed = trim_silence(data, SAMPLE_RATE)
                for w in words:
                    w["startSec"] = max(0.0, w["startSec"] - lead_trimmed)
                    w["endSec"] = max(w["startSec"] + 0.05, w["endSec"] - lead_trimmed)

                clip_dur = len(trimmed) / SAMPLE_RATE

                # Gently fit inside exact scene window while keeping timbre 100% natural
                if clip_dur > max_dur:
                    speed_factor = clip_dur / max_dur
                    print(
                        f"  - {sid}: {clip_dur:.2f}s > {max_dur:.2f}s slot -> "
                        f"gentle pitch-preserving fit ({speed_factor:.3f}x)"
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

                # Clean linear per-clip level matching (ZERO nonlinear distortion!)
                clip_rms = float(np.sqrt(np.mean(trimmed**2))) + 1e-9
                target_rms = 0.14  # ~ -17 dBFS natural headroom
                norm_gain = min(target_rms / clip_rms, 0.88 / (float(np.max(np.abs(trimmed))) + 1e-9))
                leveled = (trimmed * norm_gain).astype(np.float32)

                extra = max(0.0, max_dur - clip_dur)
                placement_start = slot_start + lead_in + min(0.15, extra * 0.20)
                add_stereo(vo_master, leveled, placement_start, gain=1.0)

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
                        "text": scene["displayText"],
                        "words": placed_words,
                    }
                )

        print("[Audio] Applying transparent broadcast studio vocal mastering...")
        vo_mastered = studio_master_voice_track(vo_master, ffmpeg_bin, tmp_dir)

    print("[Audio] Composing subtle warm cinematic soundtrack + delicate UI SFX...")
    music_sfx = generate_music_and_sfx(SAMPLE_RATE)

    # Smooth sidechain ducking so the human voice sits completely clear in front
    vo_mono = np.mean(np.abs(vo_mastered), axis=1)
    win = int(0.22 * SAMPLE_RATE)
    vo_env = np.convolve(vo_mono, np.ones(win, dtype=np.float32) / win, mode="same")
    duck_curve = 1.0 - 0.68 * np.clip(vo_env * 10.0, 0.0, 1.0)
    sos_duck = signal.butter(2, 3.5, btype="lowpass", fs=SAMPLE_RATE, output="sos")
    duck_curve = np.clip(signal.sosfiltfilt(sos_duck, duck_curve), 0.28, 1.0)

    mixed = vo_mastered * 0.96 + music_sfx * (music_volume * duck_curve[:, None])

    # Clean linear peak protection (ZERO tanh distortion!)
    peak = float(np.max(np.abs(mixed))) + 1e-9
    if peak > 0.94:
        mixed = mixed * (0.94 / peak)
    master = mixed.astype(np.float32)

    vo_path = AUDIO_OUT_DIR / "voiceover.wav"
    music_path = AUDIO_OUT_DIR / "music_sfx.wav"
    master_path = AUDIO_OUT_DIR / "master_audio.wav"
    srt_path = AUDIO_OUT_DIR / "captions.srt"

    write_wav_pcm16(vo_path, vo_mastered, SAMPLE_RATE)
    write_wav_pcm16(music_path, music_sfx, SAMPLE_RATE)
    write_wav_pcm16(master_path, master, SAMPLE_RATE)

    # Final EBU R128 broadcast loudness polish (-14 LUFS, -1.5 dBTP) when supported by FFmpeg
    if ffmpeg_supports_filter(ffmpeg_bin, "loudnorm"):
        with tempfile.TemporaryDirectory() as norm_tmp:
            norm_out = Path(norm_tmp) / "master_lufs.wav"
            run_ffmpeg(
                ffmpeg_bin,
                [
                    "-i",
                    str(master_path),
                    "-af",
                    "loudnorm=I=-14:TP=-1.5:LRA=9",
                    "-ar",
                    str(SAMPLE_RATE),
                    "-ac",
                    "2",
                    str(norm_out),
                ],
            )
            master, _ = read_wav_float32(norm_out)
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

    vo_rms_db = 20.0 * math.log10(float(np.sqrt(np.mean(vo_mastered**2))) + 1e-12)
    master_rms_db = 20.0 * math.log10(float(np.sqrt(np.mean(master**2))) + 1e-12)
    if vo_rms_db < -60.0:
        raise RuntimeError(f"Voiceover track appears silent ({vo_rms_db:.1f} dBFS)!")

    print("=" * 68)
    print(f"  ACTIVE VOICE ENGINE : {active_engine.upper()} ({used_voice_label})")
    print(f"  STUDIO LOUDNESS     : Voiceover={vo_rms_db:.1f} dBFS | Master={master_rms_db:.1f} dBFS")
    print(f"  MASTER TRACK        : {master_path}")
    print(f"  CAPTIONS SRT        : {srt_path}")
    print("=" * 68)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate studio human voiceover, subtle cinematic music, UI SFX & SRT captions."
    )
    parser.add_argument(
        "--engine",
        choices=["edge", "chatterbox", "kokoro", "elevenlabs", "custom", "auto"],
        default="edge",
        help="Voice engine: edge (Microsoft Neural HD), chatterbox (Resemble AI GPU), kokoro (GPU), elevenlabs, custom",
    )
    parser.add_argument(
        "--edge-voice",
        default="en-US-AndrewMultilingualNeural",
        help="Microsoft Neural HD voice (default: en-US-AndrewMultilingualNeural)",
    )
    parser.add_argument(
        "--kokoro-voice",
        default="am_michael",
        help="Kokoro-82M voice (am_michael, am_adam, af_heart, bm_george)",
    )
    parser.add_argument(
        "--elevenlabs-key",
        default=os.environ.get("ELEVENLABS_API_KEY", ""),
        help="Optional ElevenLabs API key when --engine elevenlabs",
    )
    parser.add_argument(
        "--elevenlabs-voice",
        default="brian",
        help="ElevenLabs voice name (brian, adam, chris, rachel, sarah) or custom voice_id",
    )
    parser.add_argument(
        "--reference-voice",
        default="",
        help="Optional 5-15s WAV/MP3 path for Chatterbox zero-shot human voice cloning",
    )
    parser.add_argument(
        "--custom-voiceover",
        default="",
        help="Optional pre-recorded 40s human voiceover WAV/MP3 path when --engine custom",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=0.98,
        help="Natural commercial pacing multiplier (default: 0.98)",
    )
    parser.add_argument(
        "--music-volume",
        type=float,
        default=0.36,
        help="Subtle background music level relative to voiceover (default: 0.36)",
    )
    args = parser.parse_args()
    asyncio.run(
        build_all_audio(
            engine=args.engine,
            edge_voice=args.edge_voice,
            kokoro_voice=args.kokoro_voice,
            elevenlabs_key=args.elevenlabs_key,
            elevenlabs_voice=args.elevenlabs_voice,
            reference_voice=args.reference_voice,
            custom_voiceover=args.custom_voiceover,
            speed=args.speed,
            music_volume=args.music_volume,
        )
    )


if __name__ == "__main__":
    main()
