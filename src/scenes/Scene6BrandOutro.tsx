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

export const Scene6BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Expanding luminous halo behind logo
  const haloScale = interpolate(frame, [0, 90], [0.65, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const haloBreath = 1 + 0.04 * Math.sin(frame * 0.06);

  // Beat 1: "Predict burnout." (~36.2s -> local frame 72)
  const tag1Spring = spring({
    frame: Math.max(0, frame - 68),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Beat 2: "Keep your people." (~37.2s -> local frame 130)
  const tag2Spring = spring({
    frame: Math.max(0, frame - 122),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Subtle CTA / Website Pill (~38.0s -> local frame 175)
  const ctaSpring = spring({
    frame: Math.max(0, frame - 170),
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  // Subtle divider bar sweep
  const lineWidth = interpolate(frame, [45, 95], [0, 340], {
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
      {/* Radiant Signature Aura Halo */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(6, 182, 212, 0.16) 38%, transparent 70%)",
          filter: "blur(42px)",
          transform: `scale(${haloScale * haloBreath})`,
          pointerEvents: "none",
        }}
      />

      {/* Counter-Rotating Concentric Precision Orbital Rings */}
      <svg
        width="820"
        height="820"
        viewBox="0 0 820 820"
        style={{
          position: "absolute",
          opacity: 0.24 * sceneIn,
          transform: `rotate(${frame * 0.22}deg) scale(${haloScale})`,
          pointerEvents: "none",
        }}
      >
        <circle
          cx="410"
          cy="410"
          r="355"
          stroke="url(#outroRing)"
          strokeWidth="1.4"
          strokeDasharray="10 14"
          fill="none"
        />
        <defs>
          <linearGradient id="outroRing" x1="0" y1="0" x2="820" y2="820" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        width="640"
        height="640"
        viewBox="0 0 640 640"
        style={{
          position: "absolute",
          opacity: 0.16 * sceneIn,
          transform: `rotate(${-frame * 0.3}deg) scale(${haloScale})`,
          pointerEvents: "none",
        }}
      >
        <circle
          cx="320"
          cy="320"
          r="270"
          stroke="#22D3EE"
          strokeWidth="1"
          strokeDasharray="4 18"
          fill="none"
        />
      </svg>

      {/* Anamorphic light flare sweep across brand lockup */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: `${interpolate(frame, [16, 78], [-15, 115], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          })}%`,
          width: 420,
          height: 6,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.6) 35%, rgba(255,255,255,0.95) 50%, rgba(34,211,238,0.6) 65%, transparent 100%)",
          opacity: interpolate(frame, [16, 32, 62, 78], [0, 0.85, 0.85, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />

      {/* Center Lockup */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        {/* Hero Animated Brand Logo */}
        <EmployeticsLogo size={116} showWordmark animateIn delayFrames={8} />

        {/* Subtle Glowing Divider */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, transparent 0%, #6366F1 25%, #22D3EE 75%, transparent 100%)",
          }}
        />

        {/* Two-Beat Kinetic Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              color: COLORS.textPrimary,
              opacity: tag1Spring,
              transform: `translateY(${interpolate(tag1Spring, [0, 1], [32, 0])}px)`,
              display: "inline-block",
            }}
          >
            Predict burnout.
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #818CF8 0%, #22D3EE 55%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: tag2Spring,
              transform: `translateY(${interpolate(tag2Spring, [0, 1], [32, 0])}px)`,
              display: "inline-block",
              filter: "drop-shadow(0 0 28px rgba(34, 211, 238, 0.30))",
            }}
          >
            Keep your people.
          </span>
        </div>

        {/* Clean CTA Pill */}
        <div
          style={{
            opacity: ctaSpring,
            transform: `translateY(${interpolate(ctaSpring, [0, 1], [22, 0])}px)`,
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 32px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(129, 140, 248, 0.42)",
            boxShadow: "0 12px 38px rgba(2, 6, 23, 0.55), 0 0 28px rgba(99, 102, 241, 0.25)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.emeraldBright,
              boxShadow: `0 0 12px ${COLORS.emeraldBright}`,
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: COLORS.textPrimary,
            }}
          >
            employetics.ai
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
