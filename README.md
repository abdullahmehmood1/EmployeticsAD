# Employetics — `AdTwo` (40s Isometric Pastel Square Ad)

Remotion v4 (React + TypeScript) isometric bird's-eye motion-graphics ad for **Employetics** — showing managers which teammate is heading for burnout and balancing the work in one click.

## Technical Spec
- **Composition ID:** `AdTwo`
- **Resolution & Timing:** `1080x1080` (square), `30 fps`, exactly `1200` frames (`40.0 s`)
- **Typography:** Poppins (`400`, `500`, `700`, `800`, `900`) via `@remotion/google-fonts/Poppins`
- **Daytime Pastel Palette (NO neon, NO black):** Sky `#DCEBF7`, Sand `#F4EAD7`, White `#FFFFFF`, Navy `#0F2A52`, Slate `#5B6B82`, Green `#4F9E7A`, Amber `#E3A64B`, Coral `#D9694F` (plus lighter/darker shading tints)
- **Safe Margin:** `90 px` (`900 px` max text width enforced automatically via `<FitText>`)

## Project Structure
- `src/timeline.ts` — **Single source of truth** for every text string, color, landmark, and frame number
- `src/Root.tsx` & `src/AdTwo.tsx` — Remotion root & master composition orchestrating all 6 scenes + audio
- `src/scenes/` — `Scene1Hook.tsx`, `Scene2Puzzle.tsx`, `Scene3Reveal.tsx`, `Scene4App.tsx`, `Scene5Fix.tsx`, `Scene6EndCard.tsx`
- `src/lib/` — `iso.ts`, `IsoTile.tsx`, `IsoBox.tsx`, `Desk.tsx`, `Worker.tsx`, `HeartBar.tsx`, `Magnifier.tsx`, `IsometricOffice.tsx`, `FitText.tsx`, `LogoMark.tsx`, `Callout.tsx`, `fonts.ts`
- `scripts/` — `make_sfx.py`, `make_voiceover.py`, `make_app_screens.py`, `sync_assets.mjs`, `package_for_colab.sh`
- `colab/render_ad.ipynb` — 5-cell Google Colab renderer

## Optional Media Drop-Ins
- **App Screens:** Replace `public/team_burnout.png` or `public/workload_optimizer.png`, or drop in `public/app_demo.mp4` (`<OffthreadVideo>`).
- **Voice-Over:** Run `npm run vo` (`edge-tts`, voice `en-US-JennyNeural`) or place a custom `audio/voiceover.mp3`.
- **Music:** Uses the generated 112 bpm C-major pentatonic marimba loop (`public/sfx/music_loop.wav`) at 18% volume, or place your own `audio/music.mp3`.

## Commands
```bash
npm install
npm run dev       # Launch Remotion Studio
npm run still     # Render preview still: npm run still -- out/still.png --frame=200
npm run render    # Render full 1080x1080 H.264 video -> out/ad2.mp4
npm run build     # TypeScript check (tsc --noEmit)
```

## Google Colab Rendering
1. Run `bash scripts/package_for_colab.sh` to create `employetics_ad_colab.zip` (excludes `node_modules`).
2. Open [`colab/render_ad.ipynb`](colab/render_ad.ipynb) in Google Colab and run Cells 1–5.
