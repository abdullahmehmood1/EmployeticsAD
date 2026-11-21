#!/usr/bin/env python3
"""
Generate two crisp daytime-pastel Employetics UI screens for AdTwo Scene 4:
  - public/team_burnout.png (1200x750): Team Burnout Risk grid with prominent CORAL/RED high-risk card
  - public/workload_optimizer.png (1200x750): Team Utilisation chart + prominent "Optimise Workload" button
Strictly respects the AdTwo palette (no neon, no black):
  SKY #DCEBF7, SAND #F4EAD7, WHITE #FFFFFF, NAVY #0F2A52, SLATE #5B6B82,
  GREEN #4F9E7A, AMBER #E3A64B, CORAL #D9694F (and lighter/darker tints).
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"

SKY = (220, 235, 247)
SKY_LIGHT = (242, 247, 252)
SAND = (244, 234, 215)
WHITE = (255, 255, 255)
NAVY = (15, 42, 82)
SLATE = (91, 107, 130)
SLATE_LIGHT = (212, 222, 234)
GREEN = (79, 158, 122)
GREEN_SOFT = (226, 243, 235)
AMBER = (227, 166, 75)
AMBER_SOFT = (252, 242, 223)
CORAL = (217, 105, 79)
CORAL_SOFT = (251, 232, 227)


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


def draw_shell(d: ImageDraw.ImageDraw, W: int, H: int, active_idx: int, page_title: str) -> None:
    # Left sidebar (NAVY)
    d.rectangle([0, 0, 218, H], fill=NAVY)
    d.rounded_rectangle([24, 26, 62, 64], radius=10, fill=SKY)
    # Mini person + arrow hint inside badge
    d.ellipse([36, 33, 50, 47], fill=NAVY)
    d.pieslice([28, 48, 58, 76], 180, 360, fill=NAVY)
    d.text((74, 45), "Employetics", fill=WHITE, font=font(22, bold=True), anchor="lm")

    nav = ["Team Burnout", "Workload Split", "SHAP Drivers", "Check-Ins", "Reports"]
    for i, label in enumerate(nav):
        y = 122 + i * 54
        if i == active_idx:
            d.rounded_rectangle([16, y - 20, 202, y + 20], radius=10, fill=SKY)
            d.text((34, y), label, fill=NAVY, font=font(16, bold=True), anchor="lm")
        else:
            d.text((34, y), label, fill=SKY, font=font(16, bold=False), anchor="lm")

    # Top header
    d.rectangle([218, 0, W, 86], fill=WHITE)
    d.line([(218, 86), (W, 86)], fill=SLATE_LIGHT, width=2)
    d.text((254, 43), page_title, fill=NAVY, font=font(28, bold=True), anchor="lm")
    d.rounded_rectangle([1012, 24, 1164, 62], radius=19, fill=SKY)
    d.text((1088, 43), "6 ACTIVE", fill=NAVY, font=font(14, bold=True), anchor="mm")


def make_team_burnout() -> None:
    W, H = 1200, 750
    img = Image.new("RGB", (W, H), SKY_LIGHT)
    d = ImageDraw.Draw(img)
    draw_shell(d, W, H, active_idx=0, page_title="Team Burnout Overview")

    # Summary strip
    d.text((254, 116), "Engineering Pod  •  Daily Risk Signals", fill=SLATE, font=font(17, bold=False), anchor="lm")

    # 2x3 team cards (exact geometry so Card #0 / Top-Left CORAL high-risk card is huge & easy to target!)
    # Cols: x=254..544 (w=290), x=564..854 (w=290), x=874..1164 (w=290)
    # Rows: y=150..418 (h=268), y=442..710 (h=268)
    cards = [
        # (name, role, score, status, accent, soft_bg, bar_frac, note)
        ("Alex Rivera", "Staff Engineer", "89%", "NEEDS HELP", CORAL, CORAL_SOFT, 0.89, "115% load • 3 weekends"),
        ("Maya Lin", "Product Designer", "58%", "WATCH", AMBER, AMBER_SOFT, 0.58, "94% load • late logins"),
        ("Jordan Kim", "Frontend Dev", "24%", "HEALTHY", GREEN, GREEN_SOFT, 0.24, "76% load • balanced"),
        ("Priya Nair", "Data Engineer", "19%", "HEALTHY", GREEN, GREEN_SOFT, 0.19, "72% load • steady"),
        ("Devon Brooks", "QA Lead", "22%", "HEALTHY", GREEN, GREEN_SOFT, 0.22, "74% load • on track"),
        ("Sam Patel", "Backend Dev", "14%", "CAPACITY", GREEN, GREEN_SOFT, 0.14, "52% load • hours free"),
    ]

    for idx, (name, role, score, status, accent, soft_bg, frac, note) in enumerate(cards):
        col = idx % 3
        row = idx // 3
        x0 = 254 + col * 310
        y0 = 150 + row * 292
        x1 = x0 + 290
        y1 = y0 + 266

        # Card container (highlight Card 0 with CORAL border & soft coral tint!)
        fill_col = CORAL_SOFT if idx == 0 else WHITE
        border_col = CORAL if idx == 0 else SLATE_LIGHT
        border_w = 4 if idx == 0 else 2
        d.rounded_rectangle([x0, y0, x1, y1], radius=18, fill=fill_col, outline=border_col, width=border_w)

        # Status pill top-right
        d.rounded_rectangle([x1 - 122, y0 + 18, x1 - 16, y0 + 46], radius=14, fill=accent)
        d.text((x1 - 69, y0 + 32), status, fill=WHITE, font=font(12, bold=True), anchor="mm")

        # Initials circle
        initials = "".join(p[0] for p in name.split())
        d.ellipse([x0 + 18, y0 + 18, x0 + 66, y0 + 66], fill=NAVY if idx > 0 else CORAL)
        d.text((x0 + 42, y0 + 42), initials, fill=WHITE, font=font(18, bold=True), anchor="mm")

        # Name & role
        d.text((x0 + 20, y0 + 92), name, fill=NAVY, font=font(22, bold=True), anchor="lm")
        d.text((x0 + 20, y0 + 120), role, fill=SLATE, font=font(15, bold=False), anchor="lm")

        # Big risk percentage
        d.text((x0 + 20, y0 + 174), score, fill=accent, font=font(46, bold=True), anchor="lm")

        # Risk progress bar
        bx0, by0, bx1, by1 = x0 + 20, y0 + 212, x1 - 20, y0 + 226
        d.rounded_rectangle([bx0, by0, bx1, by1], radius=7, fill=SLATE_LIGHT if idx > 0 else WHITE)
        d.rounded_rectangle([bx0, by0, bx0 + int((bx1 - bx0) * frac), by1], radius=7, fill=accent)

        # Footer signal
        d.text((x0 + 20, y0 + 244), note, fill=NAVY if idx == 0 else SLATE, font=font(13, bold=(idx == 0)), anchor="lm")

    out = PUBLIC_DIR / "team_burnout.png"
    img.save(str(out), "PNG")
    # Card 0 center: x = (254+544)/2 = 399 (u=0.3325), y = (150+416)/2 = 283 (v=0.3773)
    print(f"[Asset] Wrote {out} ({W}x{H}) — Top Coral Risk Card center=(399, 283)")


def make_workload_optimizer() -> None:
    W, H = 1200, 750
    img = Image.new("RGB", (W, H), SKY_LIGHT)
    d = ImageDraw.Draw(img)
    draw_shell(d, W, H, active_idx=1, page_title="Workload Optimiser")

    # Main chart card: x=254..1164, y=116..560
    d.rounded_rectangle([254, 116, 1164, 560], radius=20, fill=WHITE, outline=SLATE_LIGHT, width=2)
    d.text((286, 154), "Team Capacity Utilisation (%)", fill=NAVY, font=font(22, bold=True), anchor="lm")
    d.text((286, 184), "Healthy target zone: 75% – 90%", fill=SLATE, font=font(15, bold=False), anchor="lm")

    # 100% dashed reference guide at x = 450 + 500 = 950
    bar_x0 = 460
    scale_100 = 490  # 100% = 490 px -> 115% = 563.5 px (ends at 1023.5)
    ref_x = bar_x0 + scale_100
    for yy in range(214, 526, 14):
        d.line([(ref_x, yy), (ref_x, min(yy + 8, 526))], fill=SLATE, width=2)
    d.text((ref_x, 202), "100%", fill=SLATE, font=font(13, bold=True), anchor="mm")

    members = [
        ("Alex Rivera", 115, CORAL),
        ("Maya Lin", 94, AMBER),
        ("Jordan Kim", 78, GREEN),
        ("Devon Brooks", 76, GREEN),
        ("Priya Nair", 72, GREEN),
        ("Sam Patel", 52, GREEN),
    ]

    for idx, (name, pct, col) in enumerate(members):
        cy = 240 + idx * 50
        d.text((286, cy), name, fill=NAVY, font=font(17, bold=(idx in (0, 5))), anchor="lm")
        # Track
        d.rounded_rectangle([bar_x0, cy - 13, bar_x0 + 590, cy + 13], radius=10, fill=SKY_LIGHT)
        # Fill
        fw = int(scale_100 * (pct / 100.0))
        d.rounded_rectangle([bar_x0, cy - 13, bar_x0 + fw, cy + 13], radius=10, fill=col)
        d.text((bar_x0 + 610, cy), f"{pct}%", fill=col if idx == 0 else NAVY, font=font(18, bold=True), anchor="lm")

    # Bottom Action Bar with prominent "Optimise Workload" button!
    # Card: x=254..1164, y=586..712
    d.rounded_rectangle([254, 586, 1164, 712], radius=20, fill=SAND, outline=AMBER, width=2)
    d.text((290, 632), "AI Rebalance Ready", fill=NAVY, font=font(22, bold=True), anchor="lm")
    d.text((290, 668), "Shift 3 tasks from Alex (115% → 86%) to Sam (52% → 78%)", fill=SLATE, font=font(16, bold=False), anchor="lm")

    # "Optimise Workload" BUTTON: x=852..1132 (w=280), y=616..684 (h=68)
    # Exact center: x=992 (u=0.8267), y=650 (v=0.8667)
    d.rounded_rectangle([852, 616, 1132, 684], radius=16, fill=GREEN, outline=NAVY, width=3)
    d.text((992, 650), "Optimise Workload", fill=WHITE, font=font(22, bold=True), anchor="mm")

    out = PUBLIC_DIR / "workload_optimizer.png"
    img.save(str(out), "PNG")
    print(f"[Asset] Wrote {out} ({W}x{H}) — Optimise Workload button center=(992, 650)")


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    make_team_burnout()
    make_workload_optimizer()


if __name__ == "__main__":
    main()
