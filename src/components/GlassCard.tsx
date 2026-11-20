import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  glow?: boolean;
  padding?: number | string;
  sheenDelay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  accentColor = COLORS.indigo,
  glow = false,
  padding = 28,
  sheenDelay = 20,
}) => {
  const frame = useCurrentFrame();

  // Periodic subtle studio specular sheen gliding across frosted glass
  const cycleFrame = Math.max(0, (frame - sheenDelay) % 240);
  const sheenX = interpolate(cycleFrame, [0, 75], [-60, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenOpacity = interpolate(cycleFrame, [0, 18, 58, 75], [0, 0.14, 0.14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(155deg, rgba(20, 30, 56, 0.84) 0%, rgba(9, 15, 30, 0.91) 100%)",
        borderRadius: 24,
        border: `1px solid ${glow ? `${accentColor}6E` : COLORS.borderSubtle}`,
        boxShadow: glow
          ? `0 28px 72px rgba(2, 6, 23, 0.72), 0 0 46px ${accentColor}2E, inset 0 1px 0 rgba(255,255,255,0.16)`
          : "0 24px 60px rgba(2, 6, 23, 0.60), inset 0 1px 0 rgba(255,255,255,0.11)",
        padding,
        overflow: "hidden",
        transform: "translateZ(0)",
        ...style,
      }}
    >
      {/* Specular top edge highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${accentColor}CC, transparent)`,
          opacity: glow ? 0.95 : 0.45,
          pointerEvents: "none",
        }}
      />

      {/* Animated studio glass light sheen */}
      <div
        style={{
          position: "absolute",
          top: "-25%",
          bottom: "-25%",
          left: `${sheenX}%`,
          width: "34%",
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
          transform: "skewX(-18deg)",
          opacity: sheenOpacity,
          pointerEvents: "none",
        }}
      />

      {children}
    </div>
  );
};
