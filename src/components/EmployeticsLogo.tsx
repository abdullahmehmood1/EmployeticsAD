import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../theme";

interface EmployeticsLogoProps {
  size?: number;
  showWordmark?: boolean;
  animateIn?: boolean;
  delayFrames?: number;
}

export const EmployeticsLogo: React.FC<EmployeticsLogoProps> = ({
  size = 64,
  showWordmark = true,
  animateIn = false,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delayFrames);

  const iconSpring = animateIn
    ? spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } })
    : 1;
  const bar1 = animateIn
    ? spring({ frame: Math.max(0, localFrame - 3), fps, config: { damping: 15, stiffness: 140 } })
    : 1;
  const bar2 = animateIn
    ? spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 15, stiffness: 140 } })
    : 1;
  const bar3 = animateIn
    ? spring({ frame: Math.max(0, localFrame - 13), fps, config: { damping: 15, stiffness: 140 } })
    : 1;
  const sparkScale = animateIn
    ? spring({ frame: Math.max(0, localFrame - 18), fps, config: { damping: 11, stiffness: 180 } })
    : 1;

  const textOpacity = animateIn
    ? interpolate(localFrame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const textSlide = animateIn
    ? interpolate(localFrame, [10, 32], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.26,
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.24) 0%, rgba(6, 182, 212, 0.18) 100%)",
          border: "1.5px solid rgba(129, 140, 248, 0.50)",
          boxShadow:
            "0 0 36px rgba(99, 102, 241, 0.38), inset 0 1px 0 rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${iconSpring})`,
        }}
      >
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="empGrad1" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="55%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="empGrad2" x1="8" y1="10" x2="42" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          <rect x="7" y={40 - 15 * bar1} width="8" height={15 * bar1} rx="4" fill="url(#empGrad1)" opacity={0.75} />
          <rect x="20" y={40 - 24 * bar2} width="8" height={24 * bar2} rx="4" fill="url(#empGrad1)" opacity={0.92} />
          <rect x="33" y={40 - 32 * bar3} width="8" height={32 * bar3} rx="4" fill="url(#empGrad1)" />

          <path
            d="M11 21 C 17 17, 21 12, 24 13 C 28 14, 31 8, 37 6"
            stroke="url(#empGrad2)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="48"
            strokeDashoffset={48 * (1 - sparkScale)}
          />
          <circle cx="37" cy="6" r={3.5 * sparkScale} fill="#34D399" />
        </svg>
      </div>

      {showWordmark && (
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: size * 0.66,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: COLORS.textPrimary,
            opacity: textOpacity,
            transform: `translateX(${textSlide}px)`,
            lineHeight: 1,
          }}
        >
          Employ<span style={{ color: COLORS.cyanBright }}>etics</span>
        </div>
      )}
    </div>
  );
};
