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
    ? interpolate(localFrame, [10, 32], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      {/* Warm Botanical Forest & Gold Seal Mark */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: "linear-gradient(145deg, #14532D 0%, #166534 100%)",
          boxShadow: "0 14px 34px rgba(20, 83, 45, 0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${iconSpring})`,
        }}
      >
        <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="empWarmBar" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#FAF6F0" />
            </linearGradient>
          </defs>

          <rect x="7" y={40 - 15 * bar1} width="8" height={15 * bar1} rx="4" fill="url(#empWarmBar)" opacity={0.78} />
          <rect x="20" y={40 - 24 * bar2} width="8" height={24 * bar2} rx="4" fill="url(#empWarmBar)" opacity={0.92} />
          <rect x="33" y={40 - 32 * bar3} width="8" height={32 * bar3} rx="4" fill="url(#empWarmBar)" />

          <path
            d="M11 21 C 17 17, 21 12, 24 13 C 28 14, 31 8, 37 6"
            stroke="#FBBF24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="48"
            strokeDashoffset={48 * (1 - sparkScale)}
          />
          <circle cx="37" cy="6" r={3.6 * sparkScale} fill="#FBBF24" />
        </svg>
      </div>

      {showWordmark && (
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: size * 0.72,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: COLORS.ink,
            opacity: textOpacity,
            transform: `translateX(${textSlide}px)`,
            lineHeight: 1,
          }}
        >
          Employ<span style={{ color: COLORS.sage }}>etics</span>
        </div>
      )}
    </div>
  );
};
