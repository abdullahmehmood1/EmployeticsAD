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
import { ArrowRight, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

interface RebalanceMember {
  name: string;
  role: string;
  initials: string;
  before: number;
  after: number;
  highlight?: boolean;
}

const MEMBERS: RebalanceMember[] = [
  { name: "Alex Rivera", role: "Staff Engineer", initials: "AR", before: 115, after: 88, highlight: true },
  { name: "Jordan Lee", role: "Frontend Architect", initials: "JL", before: 96, after: 85 },
  { name: "Maya Lin", role: "Product Designer", initials: "ML", before: 82, after: 82 },
  { name: "Devon Brooks", role: "Platform Engineer", initials: "DB", before: 71, after: 82 },
  { name: "Samira Patel", role: "Backend Engineer", initials: "SP", before: 54, after: 79 },
];

const FLYING_TASKS = [
  { label: "Core API Migration (4h)", toName: "Samira Patel", startFrame: 125, endFrame: 230, targetRow: 4 },
  { label: "Auth Hotfix Review (4h)", toName: "Samira Patel", startFrame: 155, endFrame: 265, targetRow: 4 },
  { label: "Database Audit (3h)", toName: "Devon Brooks", startFrame: 185, endFrame: 295, targetRow: 3 },
];

export const Scene3OneClickSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [688, 720], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Pointer cursor glides onto "Rebalance Team Workload" button and clicks at frame 108 (~20.8s)
  const clicked = frame >= 108;
  const cursorOpacity = interpolate(frame, [28, 45, 165, 195], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [28, 98], [1340, 1645], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [28, 98], [260, 114], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorPress = frame >= 104 && frame <= 116 ? 0.84 : 1.0;

  // Expanding click shockwave ring on button
  const clickRipple = interpolate(frame, [108, 152], [0.5, 2.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const clickRippleOp = interpolate(frame, [108, 118, 152], [0, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rebalance transition sweep (frames 130 -> 395, ~21.2s -> 25.6s, timed right with "115% to 88%")
  const splitProgress = interpolate(frame, [135, 395], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Hero Alex Rivera live numbers
  const alexLive = Math.round(interpolate(splitProgress, [0, 1], [115, 88]));
  const alexColor = interpolateColors(
    splitProgress,
    [0, 0.45, 1],
    [COLORS.crimson, COLORS.amber, COLORS.emeraldBright]
  );

  // Radial gauge math (maps 0..120% -> 0..100% arc)
  const radius = 114;
  const circ = 2 * Math.PI * radius;
  const gaugeFill = Math.min(1, alexLive / 120);
  const gaugeOffset = circ * (1 - gaugeFill);

  // Delta callout pill springs in after drop finishes (~25.5s -> frame 390)
  const deltaSpring = spring({
    frame: Math.max(0, frame - 375),
    fps,
    config: { damping: 13, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.1})`,
        padding: "66px 92px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Header + Interactive One-Click Rebalance Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: clicked ? COLORS.emeraldBright : COLORS.cyanBright,
              marginBottom: 10,
            }}
          >
            <Sparkles size={16} />
            LIVE SMART REBALANCE DEMO
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 50,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: COLORS.textPrimary,
            }}
          >
            One click. A fairer split.
          </div>
        </div>

        {/* One-Click Rebalance CTA Button */}
        <div style={{ position: "relative" }}>
          {clickRippleOp > 0.01 && (
            <div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: 22,
                border: "2.5px solid #22D3EE",
                opacity: clickRippleOp,
                transform: `scale(${clickRipple})`,
                pointerEvents: "none",
              }}
            />
          )}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "18px 30px",
              borderRadius: 16,
              background: clicked
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
              boxShadow: clicked
                ? "0 0 36px rgba(16, 185, 129, 0.60)"
                : "0 0 34px rgba(6, 182, 212, 0.55)",
              fontFamily: FONTS.display,
              fontSize: 21,
              fontWeight: 800,
              color: "#FFFFFF",
              transform: `scale(${frame >= 104 && frame <= 116 ? 0.94 : 1})`,
            }}
          >
            {clicked ? <CheckCircle2 size={24} /> : <Wand2 size={24} />}
            {clicked ? "Fairer Split Applied" : "Rebalance Team Workload"}
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Left Hero 115% -> 88% Gauge | Right Live Team Rebalance Bars */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "470px 1fr",
          gap: 36,
          flex: 1,
          marginTop: 28,
          alignItems: "stretch",
        }}
      >
        {/* LEFT PANEL: Most Overloaded Teammate Drop (115% -> 88%) */}
        <GlassCard
          accentColor={alexColor}
          glow
          padding={34}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `${alexColor}28`,
                  border: `1.5px solid ${alexColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.display,
                  fontSize: 20,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                }}
              >
                AR
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 25,
                    fontWeight: 800,
                    color: COLORS.textPrimary,
                  }}
                >
                  Alex Rivera
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary }}>
                  Most Overloaded Teammate
                </div>
              </div>
            </div>
          </div>

          {/* Giant Animated Radial Capacity Gauge */}
          <div style={{ position: "relative", width: 276, height: 276 }}>
            <svg width="276" height="276" viewBox="0 0 276 276">
              <circle
                cx="138"
                cy="138"
                r={radius}
                stroke="rgba(148, 163, 184, 0.14)"
                strokeWidth="18"
                fill="none"
              />
              <circle
                cx="138"
                cy="138"
                r={radius}
                stroke={alexColor}
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circ}
                strokeDashoffset={gaugeOffset}
                transform="rotate(-90 138 138)"
                style={{ filter: `drop-shadow(0 0 14px ${alexColor})` }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 72,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {alexLive}%
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: alexColor,
                  letterSpacing: "0.07em",
                  marginTop: 8,
                }}
              >
                {splitProgress > 0.7 ? "SUSTAINABLE CAPACITY" : "CRITICAL OVERLOAD"}
              </div>
            </div>
          </div>

          {/* Before -> After Proof Pill ("115% -> 88%") */}
          <div
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: 16,
              background: "rgba(5, 8, 20, 0.62)",
              border: `1.5px solid ${splitProgress > 0.7 ? "rgba(52, 211, 153, 0.50)" : "rgba(244, 63, 94, 0.35)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 30,
                  fontWeight: 800,
                  color: COLORS.crimson,
                  textDecoration: splitProgress > 0.75 ? "line-through" : "none",
                  opacity: splitProgress > 0.75 ? 0.65 : 1,
                }}
              >
                115%
              </span>
              <ArrowRight color={COLORS.cyanBright} size={24} />
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 34,
                  fontWeight: 800,
                  color: COLORS.emeraldBright,
                }}
              >
                88%
              </span>
            </div>

            <div
              style={{
                opacity: deltaSpring,
                transform: `scale(${interpolate(deltaSpring, [0, 1], [0.85, 1])})`,
                padding: "7px 14px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.18)",
                border: "1px solid rgba(52, 211, 153, 0.5)",
                fontFamily: FONTS.mono,
                fontSize: 14,
                fontWeight: 800,
                color: COLORS.emeraldBright,
              }}
            >
              -27% LOAD
            </div>
          </div>
        </GlassCard>

        {/* RIGHT PANEL: Live Team Rebalance Bars */}
        <GlassCard
          accentColor={clicked ? COLORS.emeraldBright : COLORS.indigo}
          glow
          padding={32}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 18,
              borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              Live Team Workload Split
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                fontWeight: 700,
                color: splitProgress > 0.8 ? COLORS.emeraldBright : COLORS.textSecondary,
                background:
                  splitProgress > 0.8 ? "rgba(16, 185, 129, 0.16)" : "rgba(148, 163, 184, 0.12)",
                border:
                  splitProgress > 0.8
                    ? "1px solid rgba(52, 211, 153, 0.45)"
                    : "1px solid rgba(148, 163, 184, 0.20)",
                padding: "6px 14px",
                borderRadius: 999,
              }}
            >
              {splitProgress > 0.8 ? "✓ ALL TEAMMATES UNDER 90%" : "REBALANCING 3 TASKS..."}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 20,
              paddingTop: 14,
            }}
          >
            {MEMBERS.map((m) => {
              const livePct = Math.round(interpolate(splitProgress, [0, 1], [m.before, m.after]));
              const delta = m.after - m.before;
              const barColor =
                livePct > 100
                  ? COLORS.crimson
                  : livePct > 92
                  ? COLORS.amber
                  : m.highlight
                  ? COLORS.emeraldBright
                  : COLORS.cyanBright;

              return (
                <div
                  key={m.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "235px 1fr 165px",
                    alignItems: "center",
                    gap: 20,
                    padding: "14px 18px",
                    borderRadius: 15,
                    background: m.highlight
                      ? `rgba(16, 185, 129, ${0.06 + splitProgress * 0.08})`
                      : "rgba(15, 23, 42, 0.50)",
                    border: m.highlight
                      ? `1.5px solid ${barColor}66`
                      : "1px solid rgba(148, 163, 184, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: `${barColor}24`,
                        border: `1px solid ${barColor}66`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONTS.display,
                        fontSize: 15,
                        fontWeight: 800,
                        color: COLORS.textPrimary,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 19,
                          fontWeight: 700,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {m.name}
                      </div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textSecondary }}>
                        {m.role}
                      </div>
                    </div>
                  </div>

                  {/* Animated Bar with 100% Limit Guideline */}
                  <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: 15,
                        borderRadius: 999,
                        background: "rgba(148, 163, 184, 0.14)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (livePct / 125) * 100)}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: barColor,
                          boxShadow: `0 0 14px ${barColor}77`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: "80%",
                        top: -4,
                        bottom: -4,
                        width: 2,
                        borderLeft: "2px dashed rgba(248, 250, 252, 0.45)",
                      }}
                    />
                  </div>

                  {/* Live % + Delta Tag */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                    {delta !== 0 && splitProgress > 0.2 && (
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: delta < 0 ? COLORS.emeraldBright : COLORS.cyanBright,
                          opacity: Math.min(1, splitProgress * 1.4),
                        }}
                      >
                        {delta > 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 26,
                        fontWeight: 800,
                        color: barColor,
                        minWidth: 70,
                        textAlign: "right",
                      }}
                    >
                      {livePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.textSecondary,
              paddingTop: 10,
              borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <span>TEAM SPREAD: {Math.round(interpolate(splitProgress, [0, 1], [61, 9]))}% GAP</span>
            <span style={{ color: COLORS.emeraldBright }}>100% LIMIT RESPECTED ACROSS ALL ROLES</span>
          </div>
        </GlassCard>

        {/* FLYING ANIMATED TASK PILLS ARCING FROM ALEX TO TEAMMATES */}
        {FLYING_TASKS.map((task) => {
          if (frame < task.startFrame || frame > task.endFrame) return null;
          const p = interpolate(frame, [task.startFrame, task.endFrame], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          });
          // Smooth parabolic arc from Left Alex card -> Right target teammate row
          const x = interpolate(p, [0, 1], [210, 960]);
          const targetY = task.targetRow === 4 ? 545 : 445;
          const y = interpolate(p, [0, 1], [230, targetY]) - Math.sin(p * Math.PI) * 140;
          const op = interpolate(p, [0, 0.12, 0.86, 1], [0, 1, 1, 0]);
          return (
            <div
              key={task.label}
              style={{
                position: "absolute",
                left: x,
                top: y,
                opacity: op,
                transform: `scale(${0.92 + 0.12 * Math.sin(p * Math.PI)})`,
                padding: "12px 20px",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.94), rgba(6, 182, 212, 0.94))",
                border: "1.5px solid #A5F3FC",
                boxShadow: "0 14px 36px rgba(6, 182, 212, 0.55)",
                fontFamily: FONTS.display,
                fontSize: 17,
                fontWeight: 700,
                color: "#FFFFFF",
                zIndex: 15,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              ✦ {task.label} → {task.toName}
            </div>
          );
        })}
      </div>

      {/* Animated Precision Pointer Cursor clicking the Rebalance Button */}
      {cursorOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            opacity: cursorOpacity,
            transform: `scale(${cursorPress})`,
            pointerEvents: "none",
            zIndex: 25,
            filter: "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.65))",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 3L23 13.5L14.5 16L11.5 24.5L5 3Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
