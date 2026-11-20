import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Leaf } from "lucide-react";
import { COLORS, FONTS } from "../theme";

export const Scene4SlowDown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [212, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Calm breathing inhale expansion across the 4-second scene
  const breathe = interpolate(frame, [0, 180], [0.78, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const textSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 16, stiffness: 105 },
  });

  const italicSpring = spring({
    frame: Math.max(0, frame - 52),
    fps,
    config: { damping: 15, stiffness: 105 },
  });

  const pillSpring = spring({
    frame: Math.max(0, frame - 72),
    fps,
    config: { damping: 15, stiffness: 115 },
  });

  // Animated strain-to-calm wave draw progress
  const waveDraw = interpolate(frame, [10, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.96, 1]) + exitProgress * 0.05})`,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        padding: "80px 140px",
      }}
    >
      {/* Organic Apple-Watch-Breathe Style Botanical Concentric Petals */}
      <svg
        width="760"
        height="760"
        viewBox="0 0 760 760"
        style={{
          position: "absolute",
          transform: `scale(${breathe}) rotate(${frame * 0.14}deg)`,
          pointerEvents: "none",
        }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 380 + Math.cos(rad) * 115;
          const cy = 380 + Math.sin(rad) * 115;
          return (
            <circle
              key={deg}
              cx={cx}
              cy={cy}
              r="160"
              fill={idx % 2 === 0 ? "rgba(21, 128, 61, 0.085)" : "rgba(217, 119, 6, 0.075)"}
              stroke={idx % 2 === 0 ? "rgba(21, 128, 61, 0.16)" : "rgba(217, 119, 6, 0.14)"}
              strokeWidth="1.2"
            />
          );
        })}
      </svg>

      {/* Center Editorial Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: pillSpring,
            transform: `translateY(${interpolate(pillSpring, [0, 1], [-18, 0])}px)`,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(255, 253, 249, 0.90)",
            border: "1.5px solid rgba(21, 128, 61, 0.30)",
            boxShadow: "0 12px 30px rgba(20, 83, 45, 0.10)",
            fontFamily: FONTS.mono,
            fontSize: 15,
            color: COLORS.forest,
            letterSpacing: "0.08em",
          }}
        >
          <Leaf size={17} color={COLORS.sage} />
          RECOVERY MODE • PROTECT YOUR WEEKEND
        </div>

        {/* Giant Sculptural Editorial Serif Headline */}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: COLORS.ink,
            lineHeight: 1.05,
            opacity: textSpring,
            transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          Know when to{" "}
          <span
            style={{
              fontFamily: FONTS.serifItalic,
              color: COLORS.forest,
              opacity: italicSpring,
              display: "inline-block",
              transform: `translateY(${interpolate(italicSpring, [0, 1], [16, 0])}px)`,
            }}
          >
            slow down.
          </span>
        </div>

        {/* Organic Strain -> Calm Wave Illustration */}
        <svg width="860" height="120" viewBox="0 0 860 120" fill="none">
          <defs>
            <linearGradient id="calmWaveGrad" x1="0" y1="60" x2="860" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D94826" />
              <stop offset="42%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
          </defs>
          {/* High strain jitter on left smoothly flattening into calm sine wave on right */}
          <path
            d="M 20 62 C 55 12, 85 108, 120 26 C 155 104, 190 22, 235 88 C 280 34, 330 82, 390 56 C 460 44, 540 70, 630 58 C 720 52, 785 60, 840 58"
            stroke="url(#calmWaveGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="1150"
            strokeDashoffset={1150 * (1 - waveDraw)}
          />
          {waveDraw > 0.92 && (
            <circle cx="840" cy="58" r="9" fill={COLORS.sage} />
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
