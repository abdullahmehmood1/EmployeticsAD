#!/usr/bin/env python3
"""
Generate two crisp, calm, strict-palette Employetics HR UI screens (1080x1080)
for AdThree Scene 4:
  - public/cv_screening.png : AI CV Screening shortlist with ranked match scores
  - public/hr_chatbot.png   : Customized HR Chatbot answering from company data
Uses ONLY the AdThree palette (no neon):
  MIDNIGHT #0B1B33, DEEP #14284A, BUBBLE #263A5C, CREAM #FFF4E0,
  TEAL #5FA8A0, GOLD #F0B65A, NAVY #0F2A52.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"

MIDNIGHT = (11, 27, 51)
DEEP = (20, 40, 74)
BUBBLE = (38, 58, 92)
BORDER = (56, 80, 118)
CREAM = (255, 244, 224)
CREAM_MUTED = (196, 204, 216)
TEAL = (95, 168, 160)
TEAL_DARK = (26, 62, 78)
GOLD = (240, 182, 90)
GOLD_DARK = (58, 52, 48)


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


def make_cv_screening() -> None:
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), MIDNIGHT)
    d = ImageDraw.Draw(img)

    # Header bar (y=0..168)
    d.rectangle([0, 0, W, 168], fill=DEEP)
    d.line([(0, 168), (W, 168)], fill=BORDER, width=2)
    d.text((64, 62), "AI CV Screening", fill=CREAM, font=font(38, bold=True), anchor="lm")
    d.text((64, 112), "Senior Product Engineer  •  400 resumes analyzed", fill=CREAM_MUTED, font=font(21, bold=False), anchor="lm")
    d.rounded_rectangle([724, 56, 1018, 112], radius=28, fill=TEAL_DARK, outline=TEAL, width=2)
    d.text((871, 84), "RANKED IN 4.2s", fill=TEAL, font=font(20, bold=True), anchor="mm")

    # TOP-RANKED CANDIDATE CARD #1 (x=60..1020, y=204..468) -> exact center (540, 336) u=0.50, v=0.3111
    d.rounded_rectangle([60, 204, 1020, 468], radius=24, fill=GOLD_DARK, outline=GOLD, width=3)
    d.rounded_rectangle([90, 232, 160, 274], radius=12, fill=GOLD)
    d.text((125, 253), "#1", fill=MIDNIGHT, font=font(24, bold=True), anchor="mm")
    d.text((184, 246), "Maya Chen", fill=CREAM, font=font(34, bold=True), anchor="lm")
    d.text((184, 286), "8 yrs  •  Distributed Systems & Applied AI", fill=CREAM_MUTED, font=font(20, bold=False), anchor="lm")

    # Big 97% MATCH score badge top-right inside Card #1
    d.rounded_rectangle([802, 230, 990, 344], radius=18, fill=MIDNIGHT, outline=GOLD, width=2)
    d.text((896, 272), "97%", fill=GOLD, font=font(46, bold=True), anchor="mm")
    d.text((896, 318), "MATCH SCORE", fill=CREAM, font=font(14, bold=True), anchor="mm")

    # Skill pills
    skills = ["Python", "TypeScript", "ML Ops", "Tech Lead"]
    sx = 90
    for sk in skills:
        pw = 136 if len(sk) > 7 else 112
        d.rounded_rectangle([sx, 330, sx + pw, 370], radius=18, fill=TEAL_DARK, outline=TEAL, width=2)
        d.text((sx + pw // 2, 350), sk, fill=CREAM, font=font(17, bold=True), anchor="mm")
        sx += pw + 14

    # Explainable match bar
    d.rounded_rectangle([90, 396, 990, 442], radius=14, fill=MIDNIGHT)
    d.text((116, 419), "AI Fit Summary: Exceeds core stack + architecture rubric (9.7 / 10)", fill=GOLD, font=font(19, bold=True), anchor="lm")

    # Secondary shortlisted cards #2 and #3
    candidates = [
        ("#2", "Omar Farooq", "7 yrs  •  Full-Stack & Cloud Infra", "93%", ["React", "Node.js", "AWS", "Scale"]),
        ("#3", "Elena Rostova", "6 yrs  •  Backend & Data Pipelines", "89%", ["Python", "SQL", "FastAPI", "ETL"]),
        ("#4", "Daniel Park", "5 yrs  •  Product Engineering", "84%", ["TypeScript", "GraphQL", "CI/CD"]),
    ]

    for idx, (rank, name, sub, pct, tags) in enumerate(candidates):
        y0 = 496 + idx * 184
        y1 = y0 + 160
        d.rounded_rectangle([60, y0, 1020, y1], radius=22, fill=DEEP, outline=BORDER, width=2)
        d.rounded_rectangle([90, y0 + 26, 152, y0 + 64], radius=10, fill=BUBBLE)
        d.text((121, y0 + 45), rank, fill=TEAL, font=font(21, bold=True), anchor="mm")
        d.text((174, y0 + 40), name, fill=CREAM, font=font(28, bold=True), anchor="lm")
        d.text((174, y0 + 74), sub, fill=CREAM_MUTED, font=font(18, bold=False), anchor="lm")

        # Progress bar + score
        d.rounded_rectangle([830, y0 + 28, 990, y0 + 112], radius=16, fill=MIDNIGHT, outline=TEAL, width=2)
        d.text((910, y0 + 58), pct, fill=TEAL, font=font(36, bold=True), anchor="mm")
        d.text((910, y0 + 92), "MATCH", fill=CREAM_MUTED, font=font(13, bold=True), anchor="mm")

        tx = 90
        for tg in tags:
            tw = 112 if len(tg) > 5 else 94
            d.rounded_rectangle([tx, y0 + 104, tx + tw, y0 + 138], radius=16, fill=BUBBLE)
            d.text((tx + tw // 2, y0 + 121), tg, fill=CREAM, font=font(15, bold=False), anchor="mm")
            tx += tw + 12

    out = PUBLIC_DIR / "cv_screening.png"
    img.save(str(out), "PNG")
    print(f"[Asset] Wrote {out} ({W}x{H}) — Top Candidate Card #1 center=(540, 336)")


def make_hr_chatbot() -> None:
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), MIDNIGHT)
    d = ImageDraw.Draw(img)

    # Header bar (y=0..168)
    d.rectangle([0, 0, W, 168], fill=DEEP)
    d.line([(0, 168), (W, 168)], fill=BORDER, width=2)
    d.text((64, 62), "Customized HR Chatbot", fill=CREAM, font=font(38, bold=True), anchor="lm")
    d.text((64, 112), "Trained securely on your policies, ATS & org data", fill=CREAM_MUTED, font=font(20, bold=False), anchor="lm")
    d.rounded_rectangle([760, 56, 1018, 112], radius=28, fill=TEAL_DARK, outline=TEAL, width=2)
    d.text((889, 84), "COMPANY DATA", fill=TEAL, font=font(19, bold=True), anchor="mm")

    # User Prompt Bubble (right-aligned, y=206..342)
    d.rounded_rectangle([188, 206, 1018, 342], radius=24, fill=TEAL)
    d.text((224, 250), "Which shortlisted engineers fit our Q4", fill=MIDNIGHT, font=font(26, bold=True), anchor="lm")
    d.text((224, 294), "salary band and can start within 30 days?", fill=MIDNIGHT, font=font(26, bold=True), anchor="lm")

    # AI Instant Reply Panel (left/full card, x=60..1018, y=378..914) -> center (539, 646) u=0.50, v=0.598
    d.rounded_rectangle([60, 378, 1018, 914], radius=26, fill=DEEP, outline=TEAL, width=3)

    # Top AI badge row inside reply panel
    d.rounded_rectangle([92, 408, 398, 452], radius=22, fill=GOLD_DARK, outline=GOLD, width=2)
    d.text((245, 430), "INSTANT ANSWER  •  0.8s", fill=GOLD, font=font(18, bold=True), anchor="mm")
    d.text((984, 430), "Verified from ATS + HRIS", fill=TEAL, font=font(18, bold=True), anchor="rm")

    # Answer summary headline
    d.text((92, 496), "2 top-ranked candidates match both criteria:", fill=CREAM, font=font(28, bold=True), anchor="lm")

    # Candidate answer card 1
    d.rounded_rectangle([92, 536, 986, 650], radius=18, fill=MIDNIGHT, outline=GOLD, width=2)
    d.text((122, 574), "1. Maya Chen  (97% CV Match)", fill=GOLD, font=font(26, bold=True), anchor="lm")
    d.text((122, 616), "Comp: Within Band L5  •  Notice: 14 days  •  Ready Nov 1", fill=CREAM, font=font(20, bold=False), anchor="lm")

    # Candidate answer card 2
    d.rounded_rectangle([92, 672, 986, 786], radius=18, fill=MIDNIGHT, outline=BORDER, width=2)
    d.text((122, 710), "2. Omar Farooq  (93% CV Match)", fill=TEAL, font=font(26, bold=True), anchor="lm")
    d.text((122, 752), "Comp: Within Band L5  •  Notice: Immediate  •  Zero blockers", fill=CREAM, font=font(20, bold=False), anchor="lm")

    # Bottom grounded-source pills inside reply panel
    d.text((92, 838), "Sources:", fill=CREAM_MUTED, font=font(18, bold=True), anchor="lm")
    sources = ["ATS Shortlist (400 CVs)", "Q4 Comp Bands", "Offer Policy"]
    sx = 186
    for src in sources:
        sw = 250 if len(src) > 16 else 188
        d.rounded_rectangle([sx, 816, sx + sw, 860], radius=20, fill=BUBBLE)
        d.text((sx + sw // 2, 838), src, fill=CREAM, font=font(17, bold=True), anchor="mm")
        sx += sw + 14

    # Bottom chat input bar (pure visual grounding)
    d.rounded_rectangle([60, 948, 1018, 1024], radius=24, fill=DEEP, outline=BORDER, width=2)
    d.text((96, 986), "Ask anything about candidates, policies, or team data...", fill=CREAM_MUTED, font=font(20, bold=False), anchor="lm")
    d.rounded_rectangle([910, 962, 1002, 1010], radius=18, fill=TEAL)
    d.text((956, 986), "Ask", fill=MIDNIGHT, font=font(20, bold=True), anchor="mm")

    out = PUBLIC_DIR / "hr_chatbot.png"
    img.save(str(out), "PNG")
    print(f"[Asset] Wrote {out} ({W}x{H}) — AI Reply Panel center=(539, 646)")


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    make_cv_screening()
    make_hr_chatbot()


if __name__ == "__main__":
    main()
