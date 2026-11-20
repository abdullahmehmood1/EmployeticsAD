import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

const SUBTITLE = "AI THAT SPOTS BURNOUT BEFORE PEOPLE QUIT.";

export const Scene3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Elastic scale-pop bounce for "MEET EMPLOYETICS."
  const bounce = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.85 },
  });

  // Amber accent bar snaps in below
  const ruleW = interpolate(frame, [26, 48], [0, 440], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  // Fast crisp typewriter for subtitle (frames 44 -> 132)
  const chars = Math.floor(
    interpolate(frame, [44, 132], [0, SUBTITLE.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typed = SUBTITLE.slice(0, chars);
  const showCursor = frame >= 40 && Math.floor(frame / 8) % 2 === 0;

  // Quick slide-left exit at frames 168-180 to make way for laptop sliding from right
  const exitX = interpolate(frame, [168, 180], [0, -1920], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white, overflow: "hidden" }}>
      {/* Clean geometric architectural border frame */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect x="64" y="56" width="1792" height="968" stroke="rgba(15, 42, 82, 0.12)" strokeWidth="2.5" fill="none" />
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${exitX}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 28,
          }}
        >
          {/* Giant Navy Elastic Bounce Headline */}
          <div
            style={{
              fontFamily: FONTS.heavy,
              fontSize: 146,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: COLORS.navy,
              lineHeight: 0.98,
              transform: `scale(${interpolate(bounce, [0, 1], [0.45, 1])})`,
              opacity: Math.min(1, bounce * 2.2),
            }}
          >
            MEET EMPLOYETICS<span style={{ color: COLORS.amber }}>.</span>
          </div>

          {/* Crisp Amber Accent Rule */}
          <div
            style={{
              width: ruleW,
              height: 10,
              backgroundColor: COLORS.amber,
            }}
          />

          {/* Rapidly Typed Subheadline */}
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: COLORS.navy,
              minHeight: 54,
              marginTop: 10,
            }}
          >
            {typed}
            {showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 38,
                  backgroundColor: COLORS.amber,
                  marginLeft: 6,
                  verticalAlign: "middle",
                }}
              />
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
