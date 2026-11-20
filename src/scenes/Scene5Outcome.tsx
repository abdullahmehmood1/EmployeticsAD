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
import { CheckCircle2, FileX2, TrendingDown, Users } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

export const Scene5Outcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const exitProgress = interpolate(frame, [328, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });

  const prog = interpolate(frame, [16, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const riskVal = Math.round(interpolate(prog, [0, 1], [91, 22]));
  const riskCol = interpolateColors(prog, [0, 0.45, 1], [COLORS.crimson, COLORS.amber, COLORS.emeraldBright]);

  const card1 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 125 } });
  const card2 = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 14, stiffness: 125 } });
  const card3 = spring({ frame: Math.max(0, frame - 72), fps, config: { damping: 14, stiffness: 125 } });
  const headline = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 14, stiffness: 125 } });

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
      {/* Top Live Transformation Pill */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "14px 32px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.85)",
            border: `1.5px solid ${riskCol}66`,
            boxShadow: `0 0 36px ${riskCol}2A`,
          }}
        >
          <span style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: COLORS.textSecondary }}>
            ALEX RIVERA • BURNOUT RISK
          </span>
          <span style={{ fontFamily: FONTS.display, fontSize: 36, fontWeight: 800, color: riskCol }}>
            {riskVal}%
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: riskCol, background: `${riskCol}1E`, padding: "6px 14px", borderRadius: 999 }}>
            {prog > 0.72 ? "HEALTHY & RETAINED" : "RECOVERING..."}
          </span>
        </div>
      </div>

      {/* 3 Big Impact Outcome Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 34 }}>
        <div style={{ opacity: card1, transform: `translateY(${interpolate(card1, [0, 1], [40, 0])}px)` }}>
          <GlassCard accentColor={COLORS.emeraldBright} glow padding={34} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.emeraldBright }}>6 WEEKS EARLY</span>
              <TrendingDown color={COLORS.emeraldBright} size={26} />
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 64, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>
              91% → 22%
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.textSecondary, lineHeight: 1.45 }}>
              Burnout risk caught and resolved weeks before disengagement sets in.
            </div>
          </GlassCard>
        </div>

        <div style={{ opacity: card2, transform: `translateY(${interpolate(card2, [0, 1], [40, 0])}px)` }}>
          <GlassCard accentColor={COLORS.cyanBright} glow padding={34} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.cyanBright }}>TEAM RETENTION</span>
              <Users color={COLORS.cyanBright} size={26} />
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 64, fontWeight: 800, color: COLORS.cyanBright, lineHeight: 1 }}>
              +34%
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.textSecondary, lineHeight: 1.45 }}>
              Higher retention across engineering & product teams with balanced sprints.
            </div>
          </GlassCard>
        </div>

        <div style={{ opacity: card3, transform: `translateY(${interpolate(card3, [0, 1], [40, 0])}px)` }}>
          <GlassCard accentColor={COLORS.emeraldBright} glow padding={34} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.emeraldBright }}>OUTCOME</span>
              <CheckCircle2 color={COLORS.emeraldBright} size={26} />
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 36, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.1 }}>
              Resignation Prevented
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(52,211,153,0.35)", fontFamily: FONTS.mono, fontSize: 14, color: COLORS.emeraldBright, width: "fit-content" }}>
              <FileX2 size={16} />
              <span style={{ textDecoration: "line-through", opacity: 0.75 }}>Notice of Resignation</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Headline */}
      <div style={{ textAlign: "center", opacity: headline, transform: `translateY(${interpolate(headline, [0, 1], [28, 0])}px)` }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em", color: COLORS.textPrimary }}>
          Act weeks before{" "}
          <span style={{ background: "linear-gradient(90deg, #22D3EE, #34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            the resignation letter.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
