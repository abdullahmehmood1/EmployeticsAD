import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AlertOctagon, Clock, Flame, Layers, Sparkles } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const OVERLOAD_TASKS = [
  { title: "Core API Migration", hours: "12h", tag: "URGENT" },
  { title: "Production Auth Hotfix", hours: "8h", tag: "BLOCKER" },
  { title: "Enterprise Client Escalation", hours: "10h", tag: "P0" },
  { title: "Database Failover Audit", hours: "9h", tag: "OVERDUE" },
  { title: "Sprint 24 Release Review", hours: "7h", tag: "HIGH" },
];

const SPARE_TASKS = [
  { title: "Docs & Schema Cleanup", hours: "11h", tag: "NORMAL" },
  { title: "QA Test Coverage", hours: "10h", tag: "NORMAL" },
];

export const Scene1Imbalance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left card enters first ("One teammate is drowning in tasks." 0-3s)
  const leftSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 115 },
  });

  // Alex capacity surges 0 -> 115%
  const alexCap = Math.round(
    interpolate(frame, [18, 135], [0, 115], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })
  );

  // Right card enters at ~2.8s ("Another has hours to spare.")
  const rightSpring = spring({
    frame: Math.max(0, frame - 165),
    fps,
    config: { damping: 14, stiffness: 115 },
  });

  const samiraCap = Math.round(
    interpolate(frame, [178, 255], [0, 54], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Center imbalance tilt badge enters when both are visible
  const gapSpring = spring({
    frame: Math.max(0, frame - 235),
    fps,
    config: { damping: 13, stiffness: 135 },
  });

  // Phase 3: "You only notice when someone burns out." (~5.7s -> frame 342)
  const burnoutPhase = interpolate(frame, [338, 375], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const headlineSpring = spring({
    frame: Math.max(0, frame - 352),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Smooth zoom exit into Scene 2 (frames 510-540)
  const exitProgress = interpolate(frame, [508, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.22);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitProgress,
        transform: `scale(${1 + exitProgress * 0.12})`,
        padding: "70px 96px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Context Pill */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(244, 63, 94, 0.14)",
            border: "1px solid rgba(244, 63, 94, 0.42)",
            fontFamily: FONTS.mono,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: "#FDA4AF",
          }}
        >
          <Flame size={16} />
          HIDDEN WORKLOAD IMBALANCE • THIS WEEK
        </div>
      </div>

      {/* Main Split-Screen Comparison */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 160px 1fr",
          alignItems: "center",
          gap: 12,
          flex: 1,
          marginTop: 22,
          marginBottom: 22,
        }}
      >
        {/* LEFT CARD: DROWNING IN TASKS (115%) */}
        <div
          style={{
            opacity: leftSpring,
            transform: `translateX(${interpolate(leftSpring, [0, 1], [-80, 0])}px) scale(${
              1 + burnoutPhase * 0.025
            })`,
          }}
        >
          <GlassCard
            accentColor={COLORS.crimson}
            glow
            padding={32}
            sheenDelay={15}
            style={{
              height: 610,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #F43F5E 0%, #9F1239 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.display,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    boxShadow: "0 0 24px rgba(244, 63, 94, 0.48)",
                  }}
                >
                  AR
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 27,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                    }}
                  >
                    Alex Rivera
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
                    Staff Engineer • 46 hrs assigned / 40h week
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 52,
                    fontWeight: 800,
                    color: COLORS.crimson,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    textShadow: "0 0 24px rgba(244, 63, 94, 0.55)",
                  }}
                >
                  {alexCap}%
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FDA4AF",
                    marginTop: 4,
                  }}
                >
                  OVERLOADED
                </div>
              </div>
            </div>

            {/* Capacity Overflow Bar */}
            <div>
              <div
                style={{
                  position: "relative",
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(148, 163, 184, 0.14)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (alexCap / 120) * 100)}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #F59E0B 0%, #F43F5E 65%, #E11D48 100%)",
                    boxShadow: "0 0 18px rgba(244, 63, 94, 0.65)",
                  }}
                />
                {/* 100% Limit tick */}
                <div
                  style={{
                    position: "absolute",
                    left: "83.3%",
                    top: 0,
                    bottom: 0,
                    width: 2.5,
                    background: "#FFFFFF",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: COLORS.textMuted,
                  marginTop: 6,
                }}
              >
                <span>0%</span>
                <span style={{ color: "#FDA4AF" }}>100% LIMIT EXCEEDED (+15%)</span>
              </div>
            </div>

            {/* Rapidly Piling Task Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {OVERLOAD_TASKS.map((task, idx) => {
                const taskIn = spring({
                  frame: Math.max(0, frame - 26 - idx * 16),
                  fps,
                  config: { damping: 14, stiffness: 145 },
                });
                return (
                  <div
                    key={task.title}
                    style={{
                      opacity: taskIn,
                      transform: `translateY(${interpolate(taskIn, [0, 1], [-22, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 18px",
                      borderRadius: 13,
                      background: "rgba(244, 63, 94, 0.10)",
                      border: "1px solid rgba(244, 63, 94, 0.34)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Layers size={17} color="#FDA4AF" />
                      <span
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 18,
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#FDA4AF",
                          background: "rgba(244, 63, 94, 0.20)",
                          padding: "4px 9px",
                          borderRadius: 6,
                        }}
                      >
                        {task.tag}
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: COLORS.textPrimary,
                          width: 36,
                          textAlign: "right",
                        }}
                      >
                        {task.hours}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Burnout Alert Overlay Banner on Alex's card */}
            {burnoutPhase > 0.02 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `rgba(15, 6, 16, ${0.42 * burnoutPhase})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    opacity: burnoutPhase,
                    transform: `scale(${interpolate(burnoutPhase, [0, 1], [0.84, 1])})`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "18px 32px",
                    borderRadius: 18,
                    background: "rgba(159, 18, 57, 0.92)",
                    border: "2px solid #FB7185",
                    boxShadow: `0 0 ${32 + pulse * 24}px rgba(244, 63, 94, 0.75)`,
                    fontFamily: FONTS.display,
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}
                >
                  <AlertOctagon size={30} />
                  BURNOUT THRESHOLD HIT
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* CENTER GAP BADGE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: gapSpring * (1 - burnoutPhase * 0.4),
            transform: `scale(${gapSpring})`,
          }}
        >
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.90)",
              border: "2px solid rgba(245, 158, 11, 0.65)",
              boxShadow: "0 0 32px rgba(245, 158, 11, 0.30)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 30,
                fontWeight: 800,
                color: COLORS.amber,
                lineHeight: 1,
              }}
            >
              61%
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                fontWeight: 700,
                color: "#FCD34D",
                marginTop: 4,
              }}
            >
              GAP
            </span>
          </div>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: COLORS.textSecondary,
              letterSpacing: "0.08em",
            }}
          >
            SAME TEAM
          </span>
        </div>

        {/* RIGHT CARD: HOURS TO SPARE (54%) */}
        <div
          style={{
            opacity: rightSpring * (1 - burnoutPhase * 0.35),
            transform: `translateX(${interpolate(rightSpring, [0, 1], [80, 0])}px)`,
          }}
        >
          <GlassCard
            accentColor={COLORS.cyanBright}
            glow
            padding={32}
            sheenDelay={95}
            style={{
              height: 610,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.display,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    boxShadow: "0 0 24px rgba(6, 182, 212, 0.42)",
                  }}
                >
                  SP
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 27,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                    }}
                  >
                    Samira Patel
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
                    Backend Engineer • 21 hrs assigned / 40h week
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 52,
                    fontWeight: 800,
                    color: COLORS.cyanBright,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {samiraCap}%
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.emeraldBright,
                    marginTop: 4,
                  }}
                >
                  HOURS TO SPARE
                </div>
              </div>
            </div>

            {/* Underutilized Capacity Bar */}
            <div>
              <div
                style={{
                  position: "relative",
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(148, 163, 184, 0.14)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(samiraCap / 120) * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #06B6D4 0%, #34D399 100%)",
                    boxShadow: "0 0 16px rgba(34, 211, 238, 0.50)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "83.3%",
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: "rgba(255,255,255,0.45)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: COLORS.textMuted,
                  marginTop: 6,
                }}
              >
                <span>0%</span>
                <span style={{ color: COLORS.cyanBright }}>19 HRS OPEN BANDWIDTH</span>
              </div>
            </div>

            {/* Light Task List + Open Capacity Zone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SPARE_TASKS.map((task, idx) => {
                const tIn = spring({
                  frame: Math.max(0, frame - 185 - idx * 14),
                  fps,
                  config: { damping: 14, stiffness: 140 },
                });
                return (
                  <div
                    key={task.title}
                    style={{
                      opacity: tIn,
                      transform: `translateY(${interpolate(tIn, [0, 1], [20, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 18px",
                      borderRadius: 13,
                      background: "rgba(6, 182, 212, 0.09)",
                      border: "1px solid rgba(34, 211, 238, 0.28)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Clock size={17} color={COLORS.cyanBright} />
                      <span
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 18,
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: COLORS.cyanBright,
                      }}
                    >
                      {task.hours}
                    </span>
                  </div>
                );
              })}

              {/* Big Open Spare Capacity Slot */}
              <div
                style={{
                  height: 176,
                  borderRadius: 16,
                  border: "2px dashed rgba(34, 211, 238, 0.38)",
                  background: "rgba(6, 182, 212, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Sparkles color={COLORS.cyanBright} size={28} />
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: 800,
                    color: COLORS.cyanBright,
                  }}
                >
                  +19 Hours Available
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
                  Ready to absorb sprint tasks immediately
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Kinetic Punchline */}
      <div
        style={{
          textAlign: "center",
          minHeight: 74,
          opacity: headlineSpring,
          transform: `translateY(${interpolate(headlineSpring, [0, 1], [34, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: COLORS.textPrimary,
          }}
        >
          You only notice when someone{" "}
          <span style={{ color: COLORS.crimson }}>burns out.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
