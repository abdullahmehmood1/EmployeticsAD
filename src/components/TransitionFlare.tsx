import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SCENES, VIDEO_CONFIG } from "../theme";

// Exact scene transition points (9s, 20s, 31s, 35s)
const CUT_FRAMES = [
  SCENES.scene2.startFrame, // 540 (9s)
  SCENES.scene3.startFrame, // 1200 (20s)
  SCENES.scene4.startFrame, // 1860 (31s)
  SCENES.scene5.startFrame, // 2100 (35s)
];

export const TransitionFlare: React.FC = () => {
  const frame = useCurrentFrame();

  let washStrength = 0;
  let sweepX = 0;
  let accentColor: string = COLORS.sage;

  for (let i = 0; i < CUT_FRAMES.length; i++) {
    const dist = frame - CUT_FRAMES[i];
    if (dist >= -16 && dist <= 16) {
      washStrength = interpolate(Math.abs(dist), [0, 16], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      sweepX = interpolate(dist, [-16, 16], [-18, 118], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
      accentColor = i === 0 ? COLORS.amber : COLORS.sage;
      break;
    }
  }

  const progressPct = (frame / VIDEO_CONFIG.totalFrames) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Soft warm sunlit silk wipe between chapters */}
      {washStrength > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweepX}%`,
            width: 360,
            transform: "translateX(-50%) skewX(-10deg)",
            background: `linear-gradient(90deg, transparent 0%, rgba(250, 246, 240, 0.78) 46%, ${accentColor}30 52%, transparent 100%)`,
            opacity: washStrength,
          }}
        />
      )}

      {/* Warm Terracotta -> Sage editorial progress thread */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          background: "rgba(28, 25, 23, 0.08)",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #D94826 0%, #D97706 45%, #15803D 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
