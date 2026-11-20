import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CheckCircle2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const BALANCED_TEAM = [
  { name: "Alex Rivera", initials: "AR", pct: 88, color: COLORS.emeraldBright },
  { name: "Jordan Lee", initials: "JL", pct: 85, color: COLORS.emeraldBright },
  { name: "Maya Lin", initials: "ML", pct: 82, color: COLORS.cyanBright },
  { name: "Devon Brooks", initials: "DB", pct: 82, color: COLORS.cyanBright },
  { name: "Samira Patel", initials: "SP", pct: 79, color: COLORS.emeraldBright },
];

export const Scene4BalancedTeam: React.FC = () => {
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

  const badgeSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Two-beat headline ("A balanced team." -> "Before burnout, not after.")
  const line1Spring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const line2Spring = spring({
    frame: Math.max(0, frame - 78),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const radius = 58;
  const circ = 2 * Math.PI * radius;

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.08})`,
        padding: "88px 104px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Top Healthy Badge */}
      <div
        style={{
          opacity: badgeSpring,
          transform: `translateY(${interpolate(badgeSpring, [0, 1], [-20, 0])}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 28px",
          borderRadius: 999,
          background: "rgba(16, 185, 129, 0.16)",
          border: "1.5px solid rgba(52, 211, 153, 0.55)",
          boxShadow: "0 0 34px rgba(16, 185, 129, 0.30)",
          fontFamily: FONTS.mono,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: COLORS.emeraldBright,
        }}
      >
        <CheckCircle2 size={20} />
        100% TEAM SUSTAINABLE • 0 OVERLOADED
      </div>

      {/* 5 Balanced Radial Capacity Cards */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 26,
        }}
      >
        {BALANCED_TEAM.map((member, idx) => {
          const cardSpring = spring({
            frame: Math.max(0, frame - 12 - idx * 8),
            fps,
            config: { damping: 14, stiffness: 125 },
          });
          const fillProg = interpolate(frame, [18 + idx * 8, 72 + idx * 8], [0, member.pct / 100], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const dashOffset = circ * (1 - fillProg);

          return (
            <div
              key={member.name}
              style={{
                opacity: cardSpring,
                transform: `translateY(${interpolate(cardSpring, [0, 1], [42, 0])}px)`,
              }}
            >
              <GlassCard
                accentColor={member.color}
                glow
                padding="28px 20px"
                sheenDelay={idx * 18}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div style={{ position: "relative", width: 142, height: 142 }}>
                  <svg width="142" height="142" viewBox="0 0 142 142">
                    <circle
                      cx="71"
                      cy="71"
                      r={radius}
                      stroke="rgba(148, 163, 184, 0.14)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="71"
                      cy="71"
                      r={radius}
                      stroke={member.color}
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={circ}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 71 71)"
                      style={{ filter: `drop-shadow(0 0 10px ${member.color})` }}
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
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 34,
                        fontWeight: 800,
                        color: COLORS.textPrimary,
                        lineHeight: 1,
                      }}
                    >
                      {Math.round(fillProg * 100)}%
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        fontWeight: 700,
                        color: member.color,
                        marginTop: 4,
                      }}
                    >
                      HEALTHY
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 21,
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 13,
                      color: COLORS.emeraldBright,
                      marginTop: 4,
                    }}
                  >
                    BALANCED
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Two-Beat Kinetic Headline */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.12,
          }}
        >
          <span
            style={{
              color: COLORS.textPrimary,
              opacity: line1Spring,
              transform: `translateY(${interpolate(line1Spring, [0, 1], [30, 0])}px)`,
              display: "inline-block",
              marginRight: 22,
            }}
          >
            A balanced team.
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #22D3EE 0%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: line2Spring,
              transform: `translateY(${interpolate(line2Spring, [0, 1], [30, 0])}px)`,
              display: "inline-block",
            }}
          >
            Before burnout, not after.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
