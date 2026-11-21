#!/usr/bin/env python3
"""
Generate a crisp, intimate, calm Employetics Private Self-Awareness dashboard mockup
at public/self_awareness.png (1080x1080) for AdThree Scene 4.
Strictly uses the AdThree palette (no neon):
  MIDNIGHT #0B1B33, DEEP #14284A, BUBBLE #263A5C, CREAM #FFF4E0,
  TEAL #5FA8A0, GOLD #F0B65A, NAVY #0F2A52.
Contains exact three landmarks targeted by S4 pans/zooms:
  1) Top privacy header with "Visible only to you" subtitle (center y=118)
  2) "Pattern Alerts" card showing the weekend-work alert (center y=355)
  3) "Personal Risk Level" semicircular gauge card (center y=760)
"""

from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT_DIR / "public" / "self_awareness.png"

MIDNIGHT = (11, 27, 51)
DEEP = (20, 40, 74)
BUBBLE = (38, 58, 92)
CARD_BORDER = (56, 80, 118)
CREAM = (255, 244, 224)
CREAM_MUTED = (198, 206, 218)
TEAL = (95, 168, 160)
TEAL_DARK = (32, 68, 84)
GOLD = (240, 182, 90)
GOLD_DARK = (64, 58, 54)
NAVY = (15, 42, 82)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
        if bold
        else [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    )
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def draw_lock(d: ImageDraw.ImageDraw, cx: int, cy: int, color: tuple[int, int, int]) -> None:
    d.arc([cx - 8, cy - 16, cx + 8, cy], 180, 360, fill=color, width=3)
    d.rounded_rectangle([cx - 11, cy - 5, cx + 11, cy + 12], radius=4, fill=color)
    d.ellipse([cx - 2, cy + 1, cx + 2, cy + 5], fill=MIDNIGHT)


def draw_gauge(d: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, thickness: int, pct: float) -> None:
    """Clean thick semicircular personal risk gauge arc (TEAL -> GOLD)."""
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    # Background track (180..360 deg in Pillow = left-to-right top arch)
    d.arc(bbox, start=180, end=360, fill=BUBBLE, width=thickness)

    # Smooth overlapping segmented arc from 180 deg to 180 + pct*180 (zero radial slits)
    total_steps = 160
    end_step = int(total_steps * pct)
    for i in range(end_step):
        u = i / max(1, total_steps - 1)
        a0 = 180.0 + u * 180.0 - 1.2
        a1 = 180.0 + (i + 1) / total_steps * 180.0 + 1.8
        r = int(TEAL[0] + (GOLD[0] - TEAL[0]) * u)
        g = int(TEAL[1] + (GOLD[1] - TEAL[1]) * u)
        b = int(TEAL[2] + (GOLD[2] - TEAL[2]) * u)
        d.arc(bbox, start=a0, end=a1, fill=(r, g, b), width=thickness)

    # Indicator dot right at gauge value
    ang_rad = math.radians(180.0 + pct * 180.0)
    r_mid = radius - thickness / 2.0
    px = cx + math.cos(ang_rad) * r_mid
    py = cy + math.sin(ang_rad) * r_mid
    d.ellipse([px - 16, py - 16, px + 16, py + 16], fill=CREAM, outline=GOLD, width=5)


def main() -> None:
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), MIDNIGHT)
    d = ImageDraw.Draw(img)

    # ================= 1. TOP PRIVACY HEADER (y=0..180) =================
    # Landmark 3: "Visible only to you" privacy pill centered at (540, 126) -> u=0.50, v=0.1167
    d.rectangle([0, 0, W, 176], fill=DEEP)
    d.line([(0, 176), (W, 176)], fill=CARD_BORDER, width=2)

    d.text((540, 62), "Personal Wellness Insights", fill=CREAM, font=font(36, bold=True), anchor="mm")

    # Prominent privacy subtitle pill ("Visible only to you")
    d.rounded_rectangle([326, 98, 754, 152], radius=27, fill=TEAL_DARK, outline=TEAL, width=2)
    draw_lock(d, 372, 125, TEAL)
    d.text((558, 125), "Visible only to you", fill=CREAM, font=font(25, bold=True), anchor="mm")

    # ================= 2. PATTERN ALERTS CARD (y=208..518) =================
    # Landmark 1: Pattern Alerts weekend-work card centered at (540, 363) -> u=0.50, v=0.3361
    d.rounded_rectangle([54, 208, 1026, 518], radius=26, fill=DEEP, outline=CARD_BORDER, width=2)
    d.text((92, 256), "Pattern Alerts", fill=CREAM, font=font(30, bold=True), anchor="lm")
    d.rounded_rectangle([820, 236, 988, 276], radius=20, fill=GOLD)
    d.text((904, 256), "NEW SIGNAL", fill=MIDNIGHT, font=font(17, bold=True), anchor="mm")

    # Highlighted weekend-work alert box inside Pattern Alerts (x=88..992, y=296..412)
    d.rounded_rectangle([88, 296, 992, 412], radius=18, fill=GOLD_DARK, outline=GOLD, width=3)
    d.ellipse([116, 330, 164, 378], fill=GOLD)
    d.text((140, 354), "!", fill=MIDNIGHT, font=font(30, bold=True), anchor="mm")
    d.text((188, 334), "Weekend Work Pattern Detected", fill=CREAM, font=font(26, bold=True), anchor="lm")
    d.text((188, 374), "3 consecutive weekends logged  •  Late sessions after 10 PM", fill=GOLD, font=font(20, bold=False), anchor="lm")

    # Secondary gentle signal row below
    d.rounded_rectangle([88, 432, 992, 492], radius=14, fill=BUBBLE)
    d.text((118, 462), "Recovery gap shrunk by 4.5 hrs this week", fill=CREAM_MUTED, font=font(20, bold=False), anchor="lm")
    d.text((958, 462), "Private", fill=TEAL, font=font(18, bold=True), anchor="rm")

    # ================= 3. PERSONAL RISK LEVEL GAUGE CARD (y=548..1026) =================
    # Landmark 2: Personal Risk Level gauge centered at (540, 787) -> u=0.50, v=0.7287
    d.rounded_rectangle([54, 548, 1026, 1026], radius=26, fill=DEEP, outline=CARD_BORDER, width=2)
    d.text((92, 598), "Personal Risk Level", fill=CREAM, font=font(30, bold=True), anchor="lm")
    d.text((988, 598), "Updated today", fill=CREAM_MUTED, font=font(19, bold=False), anchor="rm")

    # Semicircular gauge centered at (540, 868), radius 205
    draw_gauge(d, cx=540, cy=868, radius=205, thickness=34, pct=0.78)
    d.text((540, 796), "78%", fill=GOLD, font=font(74, bold=True), anchor="mm")
    d.text((540, 856), "ELEVATED BURNOUT RISK", fill=CREAM, font=font(22, bold=True), anchor="mm")

    # Calm supportive bottom note inside gauge card
    d.rounded_rectangle([120, 916, 960, 984], radius=16, fill=BUBBLE)
    d.text(
        (540, 950),
        "Never shared with HR or managers  •  Encrypted for your eyes only",
        fill=TEAL,
        font=font(21, bold=True),
        anchor="mm",
    )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(OUT_PATH), "PNG")
    print(f"[Asset] Wrote crisp private self-awareness screen -> {OUT_PATH} ({W}x{H})")


if __name__ == "__main__":
    main()
