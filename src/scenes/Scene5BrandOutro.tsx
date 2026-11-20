import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { COLORS, FONTS } from "../theme";

export const Scene5BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ringScale = interpolate(frame, [0, 90], [0.72, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const tag1Spring = spring({
    frame: Math.max(0, frame - 66),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const tag2Spring = spring({
    frame: Math.max(0, frame - 118),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const ctaSpring = spring({
    frame: Math.max(0, frame - 166),
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  const ruleWidth = interpolate(frame, [42, 92], [0, 320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Warm Sunlit Golden-Sage Editorial Compass Rings */}
      <svg
        width="860"
        height="860"
        viewBox="0 0 860 860"
        style={{
          position: "absolute",
          opacity: 0.28 * sceneIn,
          transform: `rotate(${frame * 0.16}deg) scale(${ringScale})`,
          pointerEvents: "none",
        }}
      >
        <circle
          cx="430"
          cy="430"
          r="370"
          stroke={COLORS.sage}
          strokeWidth="1.2"
          strokeDasharray="8 14"
          fill="none"
        />
      </svg>
      <svg
        width="680"
        height="680"
        viewBox="0 0 680 680"
        style={{
          position: "absolute",
          opacity: 0.24 * sceneIn,
          transform: `rotate(${-frame * 0.22}deg) scale(${ringScale})`,
          pointerEvents: "none",
        }}
      >
        <circle
          cx="340"
          cy="340"
          r="290"
          stroke={COLORS.amber}
          strokeWidth="1.2"
          strokeDasharray="4 16"
          fill="none"
        />
      </svg>

      {/* Editorial Brand Lockup */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <EmployeticsLogo size={118} showWordmark animateIn delayFrames={8} />

        {/* Warm Gold Editorial Hairline Divider */}
        <div
          style={{
            width: ruleWidth,
            height: 2,
            borderRadius: 999,
            background: "linear-gradient(90deg, transparent 0%, #D97706 30%, #15803D 70%, transparent 100%)",
          }}
        />

        {/* Sculptural Serif Two-Beat Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 22,
            fontFamily: FONTS.serif,
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              color: COLORS.ink,
              opacity: tag1Spring,
              transform: `translateY(${interpolate(tag1Spring, [0, 1], [28, 0])}px)`,
              display: "inline-block",
            }}
          >
            Predict burnout.
          </span>
          <span
            style={{
              fontFamily: FONTS.serifItalic,
              color: COLORS.forest,
              opacity: tag2Spring,
              transform: `translateY(${interpolate(tag2Spring, [0, 1], [28, 0])}px)`,
              display: "inline-block",
            }}
          >
            Keep your people.
          </span>
        </div>

        {/* Tactile Ceramic CTA Pill */}
        <div
          style={{
            opacity: ctaSpring,
            transform: `translateY(${interpolate(ctaSpring, [0, 1], [20, 0])}px)`,
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 34px",
            borderRadius: 999,
            background: COLORS.paperCard,
            border: "1.5px solid rgba(20, 83, 45, 0.24)",
            boxShadow: "0 16px 36px rgba(28, 25, 23, 0.08)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.sage,
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 20,
              letterSpacing: "0.04em",
              color: COLORS.ink,
            }}
          >
            employetics.ai
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
