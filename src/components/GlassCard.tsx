import React from "react";
import { COLORS } from "../theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  glow?: boolean;
  padding?: number | string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  accentColor = COLORS.indigo,
  glow = false,
  padding = 28,
}) => {
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(155deg, rgba(20, 30, 54, 0.84) 0%, rgba(10, 16, 32, 0.90) 100%)",
        borderRadius: 24,
        border: `1px solid ${glow ? `${accentColor}66` : COLORS.borderSubtle}`,
        boxShadow: glow
          ? `0 24px 64px rgba(2, 6, 23, 0.68), 0 0 42px ${accentColor}28, inset 0 1px 0 rgba(255,255,255,0.14)`
          : "0 24px 60px rgba(2, 6, 23, 0.58), inset 0 1px 0 rgba(255,255,255,0.10)",
        padding,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Specular top edge highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "12%",
          right: "12%",
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${accentColor}AA, transparent)`,
          opacity: glow ? 0.95 : 0.45,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};
