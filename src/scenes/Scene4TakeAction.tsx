import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Bot, CheckCircle2, Send, Sparkles, Wand2, Zap } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const COPILOT_Q = "Who needs workload relief this week?";

const TEAM = [
  { name: "Alex Rivera", initials: "AR", before: 115, after: 86, highlight: true },
  { name: "Maya Lin", initials: "ML", before: 94, after: 84 },
  { name: "Jordan Lee", initials: "JL", before: 82, after: 82 },
  { name: "Samira Patel", initials: "SP", before: 54, after: 78 },
];

export const Scene4TakeAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [568, 600], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Left Side: 1-Click Workload Rebalance clicks at frame 84 (1.4s into scene)
  const clickedRebalance = frame >= 84;
  const splitProg = interpolate(frame, [96, 235], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Flying task pills from Alex (row 0) -> Samira (row 3)
  const pill1 = interpolate(frame, [100, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pill2 = interpolate(frame, [130, 205], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Right Side: AI HR Copilot typing (frames 255 -> 365), Send click at 376, instant answer at 398
  const typedLen = Math.floor(
    interpolate(frame, [255, 365], [0, COPILOT_Q.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedText = COPILOT_Q.slice(0, typedLen);
  const showCaret = frame >= 245 && frame < 378 && Math.floor(frame / 12) % 2 === 0;
  const sentChat = frame >= 378;
  const aiAnswerSpring = spring({
    frame: Math.max(0, frame - 398),
    fps,
    config: { damping: 14, stiffness: 125 },
  });

  // Automated Pointer Cursor glides: Click Rebalance (f=84) -> Click Copilot Send (f=378) -> fades out cleanly
  const cursorOp = interpolate(frame, [28, 42, 392, 412], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(
    frame,
    [28, 78, 220, 370],
    [420, 740, 1180, 1742],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) }
  );
  const cursorY = interpolate(
    frame,
    [28, 78, 220, 370],
    [480, 292, 420, 366],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) }
  );
  const cursorScale = (frame >= 80 && frame <= 90) || (frame >= 374 && frame <= 384) ? 0.85 : 1;

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.08})`,
        padding: "64px 88px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.cyanBright, marginBottom: 10 }}>
          FROM INSIGHT TO INSTANT ACTION
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 50, fontWeight: 800, letterSpacing: "-0.03em", color: COLORS.textPrimary }}>
          Rebalance in one click. Or ask your AI HR Copilot.
        </div>
      </div>

      {/* Twin Feature Showcase Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, flex: 1, marginTop: 26 }}>
        {/* LEFT MODULE: 1-CLICK SMART WORKLOAD REBALANCE */}
        <GlassCard accentColor={clickedRebalance ? COLORS.emeraldBright : COLORS.indigo} glow padding={30} style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: "1px solid rgba(148,163,184,0.14)" }}>
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.cyanBright }}>FEATURE 01</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.textPrimary }}>Smart Workload Split</div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "12px 20px",
                borderRadius: 12,
                background: clickedRebalance
                  ? "linear-gradient(135deg, #10B981, #059669)"
                  : "linear-gradient(135deg, #6366F1, #06B6D4)",
                boxShadow: clickedRebalance
                  ? "0 0 24px rgba(16,185,129,0.5)"
                  : "0 0 24px rgba(6,182,212,0.45)",
                fontFamily: FONTS.display,
                fontSize: 16,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {clickedRebalance ? <CheckCircle2 size={18} /> : <Wand2 size={18} />}
              {clickedRebalance ? "Fairer Split Applied" : "1-Click Rebalance"}
            </div>
          </div>

          {/* 4 Live Capacity Bars */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "center" }}>
            {TEAM.map((m) => {
              const live = Math.round(interpolate(splitProg, [0, 1], [m.before, m.after]));
              const col = live > 100 ? COLORS.crimson : live > 90 ? COLORS.amber : m.highlight ? COLORS.emeraldBright : COLORS.cyanBright;
              return (
                <div key={m.name} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(8,13,28,0.55)", border: `1px solid ${m.highlight ? `${col}66` : "rgba(148,163,184,0.12)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${col}24`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.display, fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>
                        {m.initials}
                      </div>
                      <span style={{ fontFamily: FONTS.display, fontSize: 19, fontWeight: 700, color: COLORS.textPrimary }}>{m.name}</span>
                    </div>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: col }}>{live}%</span>
                  </div>
                  <div style={{ height: 11, borderRadius: 999, background: "rgba(148,163,184,0.14)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (live / 120) * 100)}%`, height: "100%", borderRadius: 999, background: col }} />
                  </div>
                </div>
              );
            })}

            {/* Flying Task Pills arcing from Alex -> Samira */}
            {[
              { prog: pill1, label: "API Migration (5h) → Samira" },
              { prog: pill2, label: "Auth Review (4h) → Samira" },
            ].map((p, i) => {
              if (p.prog <= 0.01 || p.prog >= 0.99) return null;
              const y = interpolate(p.prog, [0, 1], [68, 345]);
              const x = 160 + Math.sin(p.prog * Math.PI) * 120;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                    border: "1px solid #A5F3FC",
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    boxShadow: "0 10px 24px rgba(6,182,212,0.55)",
                    pointerEvents: "none",
                  }}
                >
                  ✦ {p.label}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textSecondary, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.12)" }}>
            <span>ALEX: 115% → 86%</span>
            <span style={{ color: COLORS.emeraldBright }}>{splitProg > 0.8 ? "✓ TEAM BALANCED" : "REBALANCING..."}</span>
          </div>
        </GlassCard>

        {/* RIGHT MODULE: AI HR COPILOT */}
        <GlassCard accentColor={COLORS.cyanBright} glow padding={30} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: "1px solid rgba(148,163,184,0.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6,182,212,0.18)", border: "1px solid rgba(34,211,238,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot color={COLORS.cyanBright} size={23} />
              </div>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.cyanBright }}>FEATURE 02</div>
                <div style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.textPrimary }}>AI HR Copilot</div>
              </div>
            </div>
            <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.emeraldBright, background: "rgba(16,185,129,0.14)", padding: "6px 12px", borderRadius: 999 }}>
              LIVE DATA CONNECTED
            </span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, paddingTop: 22 }}>
            {/* Prompt Input / Sent Bubble */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "16px 20px",
                borderRadius: 16,
                background: sentChat ? "rgba(99,102,241,0.20)" : "rgba(5,8,20,0.75)",
                border: sentChat ? "1.5px solid rgba(129,140,248,0.55)" : "1.5px solid rgba(34,211,238,0.45)",
              }}
            >
              <div style={{ fontFamily: FONTS.body, fontSize: 20, color: COLORS.textPrimary, minHeight: 28 }}>
                {typedText || <span style={{ color: COLORS.textMuted }}>Ask anything about your team...</span>}
                {showCaret && <span style={{ display: "inline-block", width: 2.5, height: 22, background: COLORS.cyanBright, marginLeft: 4, verticalAlign: "middle" }} />}
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #6366F1, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Send color="#FFFFFF" size={18} />
              </div>
            </div>

            {/* Instant Grounded Answer */}
            {frame >= 398 && (
              <div
                style={{
                  opacity: aiAnswerSpring,
                  transform: `translateY(${interpolate(aiAnswerSpring, [0, 1], [24, 0])}px)`,
                  padding: "22px 24px",
                  borderRadius: 18,
                  background: "rgba(7,12,26,0.82)",
                  border: "1px solid rgba(34,211,238,0.34)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONTS.display, fontSize: 19, fontWeight: 700, color: COLORS.textPrimary }}>
                    <Zap color={COLORS.cyanBright} size={18} /> Instant Live Summary:
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.emeraldBright }}>⚡ 1.1s • YOUR DATA</span>
                </div>

                <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(52,211,153,0.35)", fontFamily: FONTS.body, fontSize: 17, color: "#E2E8F0", lineHeight: 1.45 }}>
                  <strong style={{ color: COLORS.emeraldBright }}>Alex Rivera</strong> dropped from <strong>115% → 86%</strong> after 2 tasks moved to Samira Patel.
                </div>
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(129,140,248,0.32)", fontFamily: FONTS.body, fontSize: 17, color: "#E2E8F0", lineHeight: 1.45 }}>
                  <strong style={{ color: "#FCD34D" }}>Maya Lin (84%)</strong> — recommend canceling 2 recurring syncs this week.
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #06B6D4)", fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: "#FFFFFF", width: "fit-content" }}>
                  <Sparkles size={16} /> Apply Suggested Relief Plan
                </div>
              </div>
            )}
          </div>

          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textSecondary, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.12)" }}>
            ANSWERED IN SECONDS FROM ATTENDANCE, TASKS & FEEDBACK
          </div>
        </GlassCard>
      </div>

      {/* Animated Pointer Cursor */}
      {cursorOp > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            opacity: cursorOp,
            transform: `scale(${cursorScale})`,
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
            <path d="M5 3L23 13.5L14.5 16L11.5 24.5L5 3Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
