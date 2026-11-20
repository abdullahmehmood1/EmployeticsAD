#!/usr/bin/env python3
"""
Generate separate voice-over clips for Employetics AdOne using Microsoft edge-tts
(voice: en-US-GuyNeural, slightly slow, deep, confident).
Outputs clips into public/audio/vo/ and updates src/lib/assets.json via sync_assets.mjs.
"""

from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
VO_DIR = ROOT_DIR / "public" / "audio" / "vo"

VOICE = "en-US-GuyNeural"
RATE = "-6%"
PITCH = "-4Hz"

CLIPS = [
    ("vo_10.mp3", "Your best employee just quit."),
    ("vo_100.mp3", "Late nights. Lost weekends. Nobody noticed."),
    ("vo_345.mp3", "Meet Employetics. AI that spots burnout before people quit."),
    ("vo_495.mp3", "See who's at risk. And exactly why."),
    ("vo_875.mp3", "Act early. Keep your people."),
    ("vo_1045.mp3", "Employetics."),
]


async def generate_all() -> None:
    VO_DIR.mkdir(parents=True, exist_ok=True)
    for filename, text in CLIPS:
        out_path = VO_DIR / filename
        print(f"[VO] Generating {filename}: {text}")
        comm = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE, pitch=PITCH)
        await comm.save(str(out_path))
    print(f"[VO] Saved {len(CLIPS)} voiceover clips to {VO_DIR}")


def main() -> None:
    asyncio.run(generate_all())
    sync_script = ROOT_DIR / "scripts" / "sync_assets.mjs"
    if sync_script.exists():
        subprocess.run(["node", str(sync_script)], check=False)


if __name__ == "__main__":
    main()
