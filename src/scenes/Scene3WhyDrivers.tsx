import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CheckCircle2,
  Clock,
  Layers,
  LucideIcon,
  MessageSquareWarning,
  Sparkles,
  Wrench,
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

interface DriverItem {
  id: string;
  label: string;
  impact: string;
  detail: string;
  fillPercent: number;
  color: string;
  gradient: string;
  delay: number;
  highlightStart: number;
  highlightEnd: number;
  icon: LucideIcon;
}

const DRIVERS: DriverItem[] = [
  {
    id: "overtime",
    label: "Overtime Hours",
    impact: "+38% RISK",
    detail: "58 hrs/wk average • 14.5h logged after 9 PM",
    fillPercent: 92,
    color: COLORS.crimson,
    gradient: "linear-gradient(90deg, #E11D48 0%, #FB7185 100%)",
    delay: 90,
    highlightStart: 95,
    highlightEnd: 195,
    icon: Clock,
  },
  {
    id: "feedback",
    label: "Falling Peer Feedback",
    impact: "+29% RISK",
    detail: "Team review sentiment dropped 34% in 6 weeks",
    fillPercent: 78,
    color: COLORS.amber,
    gradient: "linear-gradient(90deg, #D97706 0%, #FBBF24 100%)",
    delay: 190,
    highlightStart: 195,
    highlightEnd: 305,
    icon: MessageSquareWarning,
  },
  {
    id: "workload",
    label: "Sprint Task Overload",
    impact: "+18% RISK",
    detail: "14 critical tickets assigned • 2.4× team median",
    fillPercent: 62,
    color: COLORS.indigoBright,
    gradient: "linear-gradient(90deg, #4F46E5 0%, #818CF8 100%)",
    delay: 260,
    highlightStart: 265,
    highlightEnd: 330,
    icon: Layers,
  },
];

export const Scene3WhyDrivers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [448, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Left radial gauge sweep (0 -> 91%)
  const gaugeProgress = interpolate(frame, [16, 95], [0, 0.91], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const gaugeRadius = 112;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeDashOffset = gaugeCirc * (1 - gaugeProgress);

  // Recommended Root-Cause Fix Card ("So you fix the real cause.")
  const fixCardSpring = spring({
    frame: Math.max(0, frame - 320),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.94, 1]) + exitProgress * 0.1})`,
        padding: "70px 92px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
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
              color: COLORS.amber,
              marginBottom: 10,
            }}
          >
            <Sparkles size={16} />
            EXPLAINABLE ATTRITION ATTRIBUTION
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: COLORS.textPrimary,
            }}
          >
            Know exactly <span style={{ color: COLORS.cyanBright }}>why</span> — not just who.
          </div>
        </div>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            color: COLORS.textSecondary,
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          MODEL CONFIDENCE: <strong style={{ color: COLORS.emeraldBright }}>96.4%</strong>
        </div>
      </div>

      {/* Main Split Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "460px 1fr",
          gap: 36,
          flex: 1,
          marginTop: 32,
          alignItems: "stretch",
        }}
      >
        {/* LEFT PANEL: Alex Rivera Risk Gauge */}
        <GlassCard
          accentColor={COLORS.crimson}
          glow
          padding={34}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Profile header */}
          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: "linear-gradient(135deg, rgba(244,63,94,0.3), rgba(99,102,241,0.3))",
                border: "1.5px solid rgba(244, 63, 94, 0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONTS.display,
                fontSize: 22,
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
                  fontSize: 26,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                }}
              >
                Alex Rivera
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
                Staff Software Engineer • Core Platform
              </div>
            </div>
          </div>

          {/* Large Glowing Radial Risk Gauge */}
          <div style={{ position: "relative", width: 270, height: 270 }}>
            <svg width="270" height="270" viewBox="0 0 270 270">
              <defs>
                <linearGradient id="riskArc" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="55%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>
              <circle
                cx="135"
                cy="135"
                r={gaugeRadius}
                stroke="rgba(148, 163, 184, 0.14)"
                strokeWidth="18"
                fill="none"
              />
              <circle
                cx="135"
                cy="135"
                r={gaugeRadius}
                stroke="url(#riskArc)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={gaugeCirc}
                strokeDashoffset={gaugeDashOffset}
                transform="rotate(-90 135 135)"
                style={{ filter: "drop-shadow(0 0 14px rgba(244, 63, 94, 0.55))" }}
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
                  fontSize: 68,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {Math.round(gaugeProgress * 100)}%
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#FDA4AF",
                  letterSpacing: "0.1em",
                  marginTop: 8,
                }}
              >
                CRITICAL RISK
              </div>
            </div>
          </div>

          {/* Mini baseline stats */}
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "rgba(5, 8, 20, 0.55)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted }}>
                30-DAY CHANGE
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 26,
                  fontWeight: 800,
                  color: COLORS.crimson,
                  marginTop: 4,
                }}
              >
                +48 pts
              </div>
            </div>
            <div
              style={{
                background: "rgba(5, 8, 20, 0.55)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted }}>
                EST. WINDOW
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 26,
                  fontWeight: 800,
                  color: COLORS.amber,
                  marginTop: 4,
                }}
              >
                4–6 wks
              </div>
            </div>
          </div>
        </GlassCard>

        {/* RIGHT PANEL: Top Root-Cause Drivers + Action Plan */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}>
          <GlassCard accentColor={COLORS.indigo} padding={32} style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.textPrimary,
                marginBottom: 24,
              }}
            >
              Top Burnout Drivers
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {DRIVERS.map((driver) => {
                const enterSpring = spring({
                  frame: Math.max(0, frame - driver.delay),
                  fps,
                  config: { damping: 14, stiffness: 125 },
                });

                const barFill = interpolate(
                  frame,
                  [driver.delay + 8, driver.delay + 52],
                  [0, driver.fillPercent],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.cubic),
                  }
                );

                const isHighlighted =
                  frame >= driver.highlightStart && frame <= driver.highlightEnd;
                const Icon = driver.icon;

                return (
                  <div
                    key={driver.id}
                    style={{
                      opacity: enterSpring,
                      transform: `translateX(${interpolate(enterSpring, [0, 1], [45, 0])}px) scale(${
                        isHighlighted ? 1.018 : 1
                      })`,
                      padding: "18px 22px",
                      borderRadius: 18,
                      background: isHighlighted
                        ? `${driver.color}18`
                        : "rgba(8, 13, 28, 0.55)",
                      border: isHighlighted
                        ? `1.5px solid ${driver.color}88`
                        : "1px solid rgba(148, 163, 184, 0.14)",
                      boxShadow: isHighlighted ? `0 0 28px ${driver.color}2A` : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 11,
                            background: `${driver.color}22`,
                            border: `1px solid ${driver.color}55`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon color={driver.color} size={20} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: FONTS.display,
                              fontSize: 22,
                              fontWeight: 700,
                              color: COLORS.textPrimary,
                            }}
                          >
                            {driver.label}
                          </div>
                          <div
                            style={{
                              fontFamily: FONTS.body,
                              fontSize: 15,
                              color: COLORS.textSecondary,
                            }}
                          >
                            {driver.detail}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 16,
                          fontWeight: 800,
                          color: driver.color,
                          background: `${driver.color}1C`,
                          border: `1px solid ${driver.color}48`,
                          padding: "6px 14px",
                          borderRadius: 999,
                        }}
                      >
                        {driver.impact}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div
                      style={{
                        width: "100%",
                        height: 12,
                        borderRadius: 999,
                        background: "rgba(148, 163, 184, 0.14)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${barFill}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: driver.gradient,
                          boxShadow: `0 0 16px ${driver.color}88`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Bottom Root-Cause Fix Banner ("So you fix the real cause.") */}
          <div
            style={{
              opacity: fixCardSpring,
              transform: `translateY(${interpolate(fixCardSpring, [0, 1], [36, 0])}px)`,
            }}
          >
            <GlassCard accentColor={COLORS.emerald} glow padding="22px 28px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: "rgba(16, 185, 129, 0.20)",
                      border: "1px solid rgba(52, 211, 153, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Wrench color={COLORS.emeraldBright} size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: COLORS.emeraldBright,
                        letterSpacing: "0.08em",
                      }}
                    >
                      FIX THE REAL CAUSE
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 22,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                        marginTop: 3,
                      }}
                    >
                      Rebalance sprint load & schedule 1:1 manager coaching
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.16)",
                    border: "1px solid rgba(52, 211, 153, 0.45)",
                    fontFamily: FONTS.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: COLORS.emeraldBright,
                    whiteSpace: "nowrap",
                  }}
                >
                  <CheckCircle2 size={18} />
                  EST. RISK → 26%
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
