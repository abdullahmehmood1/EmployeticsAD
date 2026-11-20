# Employetics — `AdOne` (40s Kinetic Motion-Graphics Ad)

Remotion v4 (React + TypeScript) kinetic typography ad for **Employetics** — AI that spots employee burnout before people quit.

## Technical Spec
- **Composition ID:** `AdOne`
- **Resolution & Timing:** `1920x1080`, `30 fps`, exactly `1200` frames (`40.0 s`)
- **Typography:** Poppins (`400`, `500`, `700`, `800`, `900`) via `@remotion/google-fonts/Poppins`
- **Strict 4-Color Palette:** Navy `#0F2A52`, White `#FFFFFF`, Black `#000000`, Amber `#F2A93B` (no neon, no gradients)
- **Safe Margin:** `150 px` (`1620 px` max text width enforced automatically via `<FitText>`)

## Project Structure
- `src/timeline.ts` — **Single source of truth** for every text string, color, safe margin, and frame number
- `src/Root.tsx` & `src/AdOne.tsx` — Remotion root & master composition orchestrating all 6 scenes + audio
- `src/scenes/` — `Scene1Hook.tsx`, `Scene2Problem.tsx`, `Scene3Reveal.tsx`, `Scene4App.tsx`, `Scene5Solution.tsx`, `Scene6EndCard.tsx`
- `src/lib/` — `Slam.tsx`, `FitText.tsx`, `Shake.tsx`, `Battery.tsx`, `LogoMark.tsx`, `Laptop.tsx`, `Callout.tsx`, `DotGrid.tsx`, `fonts.ts`
- `scripts/` — `make_sfx.py`, `make_voiceover.py`, `make_attrition_screen.py`, `sync_assets.mjs`, `package_for_colab.sh`
- `colab/render_ad.ipynb` — 5-cell Google Colab renderer

## Optional Media Drop-Ins
- **App Screen:** Place `public/app_demo.mp4` to play real video via `<OffthreadVideo>` inside the laptop (otherwise renders `public/attrition_screen.png` with Ken Burns zoom).
- **Voice-Over:** Run `npm run vo` (`edge-tts`, voice `en-US-GuyNeural`) or place a custom `audio/voiceover.mp3`.
- **Music:** Place `audio/music.mp3` (auto-played at 20% volume with a 1-second fade-out at the end).

## Commands
```bash
npm install
npm run dev       # Launch Remotion Studio
npm run still     # Render preview still: npm run still -- out/still.png --frame=120
npm run render    # Render full 1080p H.264 video -> out/ad1.mp4
npm run build     # TypeScript check (tsc --noEmit)
```

## Google Colab Rendering
1. Run `bash scripts/package_for_colab.sh` to create `employetics_ad_colab.zip` (excludes `node_modules`).
2. Open [`colab/render_ad.ipynb`](colab/render_ad.ipynb) in Google Colab and run Cells 1–5.
