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
import { CheckCircle2, FileX2, HeartHandshake, ShieldCheck } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

export const Scene5ActBefore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [212, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Timeline progress sweeps across 6 weeks (frames 22 -> 148)
  const timelineProgress = interpolate(frame, [22, 148], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Live risk drop: 91% -> 24%
  const riskValue = Math.round(
    interpolate(timelineProgress, [0, 1], [91, 24], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const riskColor = interpolateColors(
    timelineProgress,
    [0, 0.45, 1],
    [COLORS.crimson, COLORS.amber, COLORS.emeraldBright]
  );

  // Node springs
  const node1 = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 130 } });
  const node2 = spring({ frame: Math.max(0, frame - 64), fps, config: { damping: 14, stiffness: 130 } });
  const node3 = spring({ frame: Math.max(0, frame - 122), fps, config: { damping: 13, stiffness: 125 } });

  // Headline spring
  const headlineSpring = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.08})`,
        padding: "86px 110px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Metric Transformation Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "14px 30px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.82)",
            border: `1.5px solid ${riskColor}66`,
            boxShadow: `0 0 36px ${riskColor}2A`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.textSecondary,
              letterSpacing: "0.08em",
            }}
          >
            ALEX RIVERA • BURNOUT RISK
          </span>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 34,
              fontWeight: 800,
              color: riskColor,
              minWidth: 88,
              textAlign: "right",
            }}
          >
            {riskValue}%
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              fontWeight: 700,
              color: riskColor,
              background: `${riskColor}1E`,
              padding: "5px 12px",
              borderRadius: 999,
            }}
          >
            {timelineProgress > 0.72 ? "HEALTHY & RETAINED" : "INTERVENING..."}
          </span>
        </div>
      </div>

      {/* Center Proactive Timeline Motion Graphic */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 34 }}>
        {/* Animated Glowing Horizontal Connector Track with 3 Milestone Nodes */}
        <svg
          width="1700"
          height="64"
          viewBox="0 0 1700 64"
          fill="none"
          style={{ width: "100%", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="timelineGrad" x1="250" y1="32" x2="1450" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <line
            x1="250"
            y1="32"
            x2="1450"
            y2="32"
            stroke="rgba(148, 163, 184, 0.22)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="250"
            y1="32"
            x2={250 + (1450 - 250) * timelineProgress}
            y2="32"
            stroke="url(#timelineGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Milestone Nodes */}
          <circle cx="250" cy="32" r="11" fill="#F43F5E" opacity={node1} />
          <circle
            cx="850"
            cy="32"
            r="11"
            fill={timelineProgress >= 0.48 ? "#22D3EE" : "#334155"}
            opacity={node2}
          />
          <circle
            cx="1450"
            cy="32"
            r="13"
            fill={timelineProgress >= 0.94 ? "#34D399" : "#334155"}
            opacity={node3}
            style={{
              filter: timelineProgress >= 0.94 ? "drop-shadow(0 0 14px #34D399)" : "none",
            }}
          />
          {/* Traveling spark head */}
          <circle
            cx={250 + (1450 - 250) * timelineProgress}
            cy="32"
            r="9"
            fill={riskColor}
            style={{ filter: `drop-shadow(0 0 14px ${riskColor})` }}
          />
        </svg>

        {/* Three Milestone Cards */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 44,
            alignItems: "stretch",
          }}
        >
          {/* Milestone 1: 6 Weeks Earlier */}
          <div
            style={{
              opacity: node1,
              transform: `translateY(${interpolate(node1, [0, 1], [40, 0])}px)`,
              display: "flex",
            }}
          >
            <GlassCard accentColor={COLORS.crimson} glow padding={30} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FDA4AF",
                  }}
                >
                  6 WEEKS EARLIER
                </span>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(244, 63, 94, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck color={COLORS.crimson} size={22} />
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                }}
              >
                Early Signal Caught
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 17,
                  color: COLORS.textSecondary,
                  marginTop: 8,
                  lineHeight: 1.45,
                }}
              >
                Employetics flags 91% burnout risk automatically before disengagement sets in.
              </div>
            </GlassCard>
          </div>

          {/* Milestone 2: Proactive Fix */}
          <div
            style={{
              opacity: node2,
              transform: `translateY(${interpolate(node2, [0, 1], [40, 0])}px)`,
              display: "flex",
            }}
          >
            <GlassCard accentColor={COLORS.cyanBright} glow padding={30} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.cyanBright,
                  }}
                >
                  SAME WEEK ACTION
                </span>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(6, 182, 212, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HeartHandshake color={COLORS.cyanBright} size={22} />
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                }}
              >
                Real Cause Resolved
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 17,
                  color: COLORS.textSecondary,
                  marginTop: 8,
                  lineHeight: 1.45,
                }}
              >
                Manager rebalances sprint load, removes overtime, and resets team feedback loops.
              </div>
            </GlassCard>
          </div>

          {/* Milestone 3: Resignation Prevented */}
          <div
            style={{
              opacity: node3,
              transform: `translateY(${interpolate(node3, [0, 1], [40, 0])}px) scale(${interpolate(
                node3,
                [0, 1],
                [0.94, 1.03]
              )})`,
              display: "flex",
            }}
          >
            <GlassCard accentColor={COLORS.emerald} glow padding={30} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.emeraldBright,
                  }}
                >
                  RESIGNATION PREVENTED
                </span>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 color={COLORS.emeraldBright} size={22} />
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                }}
              >
                Retained & Thriving
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  padding: "7px 14px",
                  borderRadius: 10,
                  background: "rgba(16, 185, 129, 0.14)",
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  color: COLORS.emeraldBright,
                }}
              >
                <FileX2 size={16} />
                <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                  Notice of Resignation
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Bottom Kinetic Headline */}
      <div
        style={{
          textAlign: "center",
          opacity: headlineSpring,
          transform: `translateY(${interpolate(headlineSpring, [0, 1], [32, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: COLORS.textPrimary,
          }}
        >
          Act weeks before{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #22D3EE 0%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            the resignation letter.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
