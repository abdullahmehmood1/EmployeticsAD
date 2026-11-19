# Employetics — 40s Complete Motion Graphics Video Ad

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/abdullahmehmood1/EmployeticsAD/blob/main/colab/render_employetics_ad.ipynb)

A broadcast-grade **40-second, 1080p 60fps** SaaS motion-graphics commercial for **Employetics**, built with **Remotion (React + TypeScript + SVG + Spring Physics)**, **Kokoro-82M GPU Neural Voiceover**, **procedural soundtrack & UI sound effects**, and a **one-click Google Colab GPU rendering notebook**.

---

## Script & Storyboard Timeline (40s @ 60fps = 2,400 frames)

| Time | Scene | Voiceover | Visual Motion Graphics |
| :--- | :--- | :--- | :--- |
| **0–9 s** | `Scene1Resignation` | *"Your best developer just resigned. No warning. But the signs were there: late nights, lost weekends, falling feedback. Hidden in the data."* | 3D resignation email notification + shockwave ring → kinetic *"No warning."* + data scanner sweep → staggered telemetry cards (after-hours commit chart, weekend heatmap, falling feedback sparkline) |
| **9–16 s** | `Scene2RiskRanking` | *"Employetics reads daily attendance, tasks and feedback, and ranks who is likely to leave."* | Animated glowing data streams converging into the Employetics Engine hub → live **Attrition Risk Ranking** leaderboard with animated circular risk gauges |
| **16–24 s** | `Scene3WhyDrivers` | *"It also tells you why. Overtime. Falling peer feedback. So you fix the real cause."* | Explainable AI breakdown panel with 91% radial gauge, animated SHAP driver bars (*Overtime Hours*, *Falling Peer Feedback*, *Sprint Task Overload*), and *Fix the Real Cause* action banner |
| **24–31 s** | `Scene4HRAssistant` | *"Or just ask the HR assistant. It answers in seconds, from your own data."* | Sleek dark-glass AI HR Copilot with live character-by-character prompt typing, instant grounded response (`⚡ 1.2s`), and one-click action chips |
| **31–35 s** | `Scene5ActBefore` | *"Act weeks before the resignation letter."* | Animated proactive retention timeline dropping risk live from **91% → 24% Healthy & Retained**, crossing out the resignation letter |
| **35–40 s** | `Scene6BrandOutro` | *"Employetics. Predict burnout. Keep your people."* | Custom animated Employetics vector logo reveal, radiant aurora halo, two-beat kinetic tagline, and `employetics.ai` CTA |

---

## Render on Google Colab (GPU Accelerated)

1. Open [`colab/render_employetics_ad.ipynb`](colab/render_employetics_ad.ipynb) in **Google Colab**.
2. Go to **Runtime → Change runtime type** and select **T4 GPU** (or **L4 / A100 GPU**).
3. In **Step 1 (Configuration)**, verify `GITHUB_REPO_URL` and pick your preferred voice, captions setting, and resolution (`1080p` or `4K`).
4. Click **Runtime → Run all**.
5. Colab will automatically:
   - Install Node.js 22, Chromium GPU libraries, `espeak-ng`, and Kokoro-82M neural TTS
   - Generate studio-grade neural voiceover + custom modern SaaS soundtrack + synchronized UI SFX + `.srt` captions
   - Render the 40-second 60fps motion graphics video with GPU hardware acceleration (`--gl=angle-egl` + NVIDIA `h264_nvenc` mastering)
   - Preview and download `employetics-ad-1080p60.mp4` and `captions.srt`

---

## Run & Preview Locally

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Python audio dependencies
pip install -r requirements.txt

# 3. Generate voiceover, soundtrack, SFX, and synchronized captions manifest
python scripts/generate_audio.py

# 4. Preview interactively in Remotion Studio
npm run dev

# 5. Render final 1080p 60fps MP4
python scripts/render_video.py
```

Add `--captions` to `python scripts/render_video.py --captions` to burn synchronized kinetic captions directly into the video.
