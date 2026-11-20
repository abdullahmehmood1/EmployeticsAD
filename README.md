# Employetics — 40s Workload Rebalance Motion Graphics Ad

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/abdullahmehmood1/EmployeticsAD/blob/main/colab/render_employetics_ad.ipynb)

A broadcast-grade **40-second, 1080p / 4K @ 60fps** SaaS motion-graphics commercial for **Employetics**, built with a **Zero-Blink NVIDIA GPU Pipeline** (**Remotion transparent RGBA UI layers** + **PyTorch CUDA GPU Liquid Aurora Shader & Physical Optical Bloom** + **Direct NVIDIA NVENC `h264_nvenc` hardware encoding** + **Studio Broadcast `-14 LUFS` Voiceover & Soundtrack**).

---

## Script & Storyboard Timeline (40s @ 60fps = 2,400 frames)

| Time | Scene | Voiceover | Visual Motion Graphics |
| :--- | :--- | :--- | :--- |
| **0–9 s** | `Scene1Imbalance` | *"One teammate is drowning in tasks. Another has hours to spare. You only notice when someone burns out."* | Split comparison: **Alex Rivera (`115% OVERLOADED`)** with piling task stack vs **Samira Patel (`54% • +19 hrs available`)**, `61% GAP` badge, crimson burnout threshold hit & kinetic headline |
| **9–19 s** | `Scene2DailyMonitor` | *"Employetics watches your team every day, and flags who is heading for burnout."* | Live **Daily Capacity & Burnout Radar** sweeping Mon → Fri across all 5 teammates with dashed `100% Limit` line, flagging **Alex Rivera (`115% HEADING FOR BURNOUT`)** |
| **19–31 s** | `Scene3OneClickSplit` | *"One click gives a fairer split. In this demo, the most overloaded teammate drops from 115 percent to 88 percent capacity."* | Automated pointer cursor clicks **`Rebalance Team Workload`** → 3 task pills visibly arc across screen to teammates with spare capacity → hero radial gauge drops live **`115% → 88% (-27% LOAD)`** |
| **31–35 s** | `Scene4BalancedTeam` | *"A balanced team. Before burnout, not after."* | 5 harmonious emerald/cyan capacity rings (`88%`, `85%`, `82%`, `82%`, `79%`), `100% TEAM SUSTAINABLE • 0 OVERLOADED` badge, two-beat kinetic headline |
| **35–40 s** | `Scene5BrandOutro` | *"Employetics. Predict burnout. Keep your people."* | Counter-rotating orbital rings, animated Employetics logo mark, anamorphic light sweep, *"Predict burnout. Keep your people."* & `employetics.ai` |

---

## Render on Google Colab (Zero-Blink NVIDIA GPU)

1. Click the **Open In Colab** badge above (or open [`colab/render_employetics_ad.ipynb`](colab/render_employetics_ad.ipynb)).
2. Go to **Runtime → Change runtime type** and select **T4 GPU** (or **L4 / A100 GPU**).
3. In **Step 1**, choose your voiceover mode (`edge`, `upload_my_voiceover`, `chatterbox`, `elevenlabs`, or `kokoro`), `BURN_CAPTIONS`, and resolution (`1080p` or `4K`).
4. Click **Runtime → Run all**.
