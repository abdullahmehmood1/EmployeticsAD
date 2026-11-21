#!/usr/bin/env python3
"""
Generate warm, friendly voice-over clips for Employetics AdTwo using edge-tts
(voice: en-US-JennyNeural, warm, smiling, medium pace).
Outputs into public/audio/vo/ and updates src/lib/assets.json.
"""

from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
VO_DIR = ROOT_DIR / "public" / "audio" / "vo"

VOICE = "en-US-JennyNeural"
RATE = "+0%"
PITCH = "+2Hz"

CLIPS = [
    ("vo_12.mp3", "One of them is about to burn out."),
    ("vo_110.mp3", "Can you tell which one?"),
    ("vo_310.mp3", "Employetics can. It sees burnout before you do."),
    ("vo_410.mp3", "Red means someone needs help."),
    ("vo_540.mp3", "One click balances the work."),
    ("vo_720.mp3", "Fair work. Happy team."),
    ("vo_1030.mp3", "Employetics. Predict burnout. Keep your people."),
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
