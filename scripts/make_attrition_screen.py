#!/usr/bin/env python3
"""
Generate a crisp, strict-palette Employetics Attrition Dashboard screenshot
at public/attrition_screen.png (1280x720) if one is not already supplied.
Uses ONLY the 4 strict palette colors (and pure NAVY/WHITE alpha blends):
  NAVY  #0F2A52
  WHITE #FFFFFF
  BLACK #000000
  AMBER #F2A93B
No neon, no gradients. Clean top risk card with percentage (89%) and "SHAP Explain" button.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT_DIR / "public" / "attrition_screen.png"

NAVY = (15, 42, 82)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
AMBER = (242, 169, 59)
NAVY_SOFT = (240, 243, 248)  # 6% NAVY over WHITE
BORDER = (214, 221, 232)     # 16% NAVY over WHITE


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/segoeuib.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
        if bold
        else [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    )
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def draw_sidebar_mark(d: ImageDraw.ImageDraw, x0: int, y0: int, size: int) -> None:
    """Mini simplified Employetics brand emblem in sidebar (AMBER + NAVY cutout)."""
    s = size / 512.0
    d.rounded_rectangle([x0, y0, x0 + size, y0 + size], radius=int(118 * s), fill=AMBER)
    # Head cutout
    cx, cy, r = x0 + 256 * s, y0 + 160 * s, 68 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=NAVY)
    # Shoulders cutout
    d.pieslice([x0 + 62 * s, y0 + 268 * s, x0 + 450 * s, y0 + 660 * s], 180, 360, fill=NAVY)
    # Trend arrow
    pts = [
        (x0 + 116 * s, y0 + 470 * s),
        (x0 + 190 * s, y0 + 396 * s),
        (x0 + 240 * s, y0 + 448 * s),
        (x0 + 332 * s, y0 + 356 * s),
    ]
    d.line(pts, fill=AMBER, width=max(3, int(44 * s)))


def main() -> None:
    W, H = 1280, 720
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    # Left sidebar (NAVY)
    d.rectangle([0, 0, 232, H], fill=NAVY)
    draw_sidebar_mark(d, 24, 24, 42)
    d.text((78, 45), "Employetics", fill=WHITE, font=load_font(23, bold=True), anchor="lm")

    nav_items = ["Attrition Risk", "Team Capacity", "SHAP Drivers", "Check-Ins", "HR Assistant"]
    for idx, label in enumerate(nav_items):
        y = 124 + idx * 54
        if idx == 0:
            d.rounded_rectangle([16, y - 20, 216, y + 20], radius=8, fill=AMBER)
            d.text((34, y), label, fill=NAVY, font=load_font(17, bold=True), anchor="lm")
        else:
            d.text((34, y), label, fill=WHITE, font=load_font(17, bold=False), anchor="lm")

    # Top header bar
    d.line([(232, 84), (W, 84)], fill=BORDER, width=2)
    d.text((266, 44), "Attrition Risk Monitor", fill=NAVY, font=load_font(28, bold=True), anchor="lm")
    d.rounded_rectangle([1084, 24, 1244, 62], radius=19, fill=NAVY)
    d.text((1164, 43), "LIVE MODEL", fill=WHITE, font=load_font(14, bold=True), anchor="mm")

    # TOP RISK CARD (x=266..1244, y=108..296)
    d.rounded_rectangle([266, 108, 1244, 296], radius=16, fill=WHITE, outline=NAVY, width=3)
    d.rounded_rectangle([278, 122, 290, 282], radius=6, fill=AMBER)

    # Top card avatar & identity (plenty of breathing room before 89% box at x=778)
    d.rounded_rectangle([310, 134, 374, 198], radius=14, fill=NAVY)
    d.text((342, 166), "AR", fill=WHITE, font=load_font(24, bold=True), anchor="mm")
    d.text((394, 152), "Alex Rivera", fill=NAVY, font=load_font(28, bold=True), anchor="lm")
    d.text((394, 184), "Staff Engineer  •  +14h/wk  •  3 Weekends", fill=BLACK, font=load_font(16, bold=False), anchor="lm")

    # Risk progress bar inside top card
    d.rounded_rectangle([310, 224, 738, 242], radius=9, fill=NAVY_SOFT)
    d.rounded_rectangle([310, 224, 692, 242], radius=9, fill=AMBER)
    d.text((310, 266), "Drivers: Late Nights (+38%)  •  Lost Weekends (+29%)", fill=NAVY, font=load_font(15, bold=True), anchor="lm")

    # TOP CARD PERCENTAGE BADGE (exact center: x=858, y=202) -> Target for "WHO'S AT RISK?" arrow!
    d.rounded_rectangle([778, 138, 938, 266], radius=14, fill=NAVY)
    d.text((858, 186), "89%", fill=AMBER, font=load_font(48, bold=True), anchor="mm")
    d.text((858, 234), "HIGH RISK", fill=WHITE, font=load_font(14, bold=True), anchor="mm")

    # TOP CARD "SHAP Explain" BUTTON (exact center: x=1092, y=202) -> Target for "AND WHY." arrow!
    d.rounded_rectangle([974, 170, 1210, 234], radius=12, fill=AMBER, outline=NAVY, width=3)
    d.text((1092, 202), "SHAP Explain", fill=NAVY, font=load_font(22, bold=True), anchor="mm")

    # Secondary team rows below
    rows = [
        ("ML", "Maya Lin", "Product Designer  •  4 Weekend Logins", "74%"),
        ("DB", "Devon Brooks", "Backend Lead  •  Sprint Overload", "61%"),
        ("PN", "Priya Nair", "Data Engineer  •  Balanced Workload", "18%"),
    ]
    for i, (init, name, meta, pct) in enumerate(rows):
        ry = 324 + i * 120
        d.rounded_rectangle([266, ry, 1244, ry + 100], radius=14, fill=NAVY_SOFT, outline=BORDER, width=2)
        d.rounded_rectangle([296, ry + 22, 352, ry + 78], radius=12, fill=NAVY)
        d.text((324, ry + 50), init, fill=WHITE, font=load_font(20, bold=True), anchor="mm")
        d.text((376, ry + 36), name, fill=NAVY, font=load_font(22, bold=True), anchor="lm")
        d.text((376, ry + 68), meta, fill=BLACK, font=load_font(16, bold=False), anchor="lm")
        d.text((858, ry + 50), pct, fill=NAVY, font=load_font(34, bold=True), anchor="mm")
        d.rounded_rectangle([974, ry + 28, 1210, ry + 72], radius=10, fill=WHITE, outline=NAVY, width=2)
        d.text((1092, ry + 50), "SHAP Explain", fill=NAVY, font=load_font(17, bold=True), anchor="mm")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(OUT_PATH), "PNG")
    print(f"[Asset] Wrote crisp Employetics dashboard screenshot -> {OUT_PATH} ({W}x{H})")


if __name__ == "__main__":
    main()
