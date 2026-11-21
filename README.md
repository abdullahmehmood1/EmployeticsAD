# Employetics — `AdThree` (40s Vertical 9:16 Night-to-Dawn Ad)

Remotion v4 (React + TypeScript) intimate first-person vertical motion-graphics ad for **Employetics** — showing how burnout hides behind *"I'm fine."* and how Employetics' private self-awareness dashboard spots it before you do.

## Technical Spec
- **Composition ID:** `AdThree`
- **Resolution & Timing:** `1080x1920` (vertical 9:16), `30 fps`, exactly `1200` frames (`40.0 s`)
- **Social-Safe Zone:** All key text inside `x = 110..970` (`860 px`) and `y = 250..1500`
- **Typography (`@remotion/google-fonts`):** `DM Serif Display` (emotional serif lines), `Inter` (`400, 600, 800` for phone/UI text), `Poppins` (`400, 500, 800` for End Card only)
- **Night-to-Dawn Palette (NO neon):** Midnight `#0B1B33`, Deep `#14284A`, Bubble `#263A5C`, Cream `#FFF4E0`, Teal `#5FA8A0`, Gold `#F0B65A`, Navy `#0F2A52`, Amber `#E3A64B` (low battery only)
- **Audio:** NO voice-over — sparse felt-piano score over `Am – F – C – G` (`public/sfx/music.wav`, or drop in `audio/music.mp3` at 25% volume) + delicate UI sounds (`msg_pop`, `msg_sent`, `typing_tick`, `whoosh_soft`, `chime`, `heartbeat`)

## Project Structure
- `src/timeline.ts` — **Single source of truth** for all text strings, colors, landmarks, and frame timing
- `src/Root.tsx` & `src/AdThree.tsx` — Remotion root & master composition orchestrating all 6 scenes + audio
- `src/scenes/` — `Scene1Hook.tsx`, `Scene2Week.tsx`, `Scene3Turn.tsx`, `Scene4App.tsx`, `Scene5Change.tsx`, `Scene6EndCard.tsx`
- `src/lib/` — `ChatBubble.tsx`, `TypingDots.tsx`, `StatusBar.tsx`, `DayChip.tsx`, `Battery.tsx`, `AppWindow.tsx`, `FitText.tsx`, `LogoMark.tsx`, `Moon.tsx`, `Sun.tsx`, `fonts.ts`
- `scripts/` — `make_sfx.py`, `make_self_awareness.py`, `sync_assets.mjs`, `package_for_colab.sh`
- `colab/render_ad.ipynb` — 5-cell Google Colab renderer

## Commands
```bash
npm install
npm run dev       # Launch Remotion Studio
npm run still     # Render preview still: npm run still -- out/still.png --frame=380
npm run render    # Render full 1080x1920 H.264 video -> out/ad3.mp4
npm run build     # TypeScript check (tsc --noEmit)
```

## Google Colab Rendering
1. Run `bash scripts/package_for_colab.sh` to create `employetics_ad_colab.zip` (excludes `node_modules`).
2. Open [`colab/render_ad.ipynb`](colab/render_ad.ipynb) in Google Colab and run Cells 1–5.
