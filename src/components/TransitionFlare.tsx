import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SCENES, VIDEO_CONFIG } from "../theme";

// Exact scene transition points (9s, 19s, 31s, 35s)
const CUT_FRAMES = [
  SCENES.scene2.startFrame, // 540 (9s)
  SCENES.scene3.startFrame, // 1140 (19s)
  SCENES.scene4.startFrame, // 1860 (31s)
  SCENES.scene5.startFrame, // 2100 (35s)
];

export const TransitionFlare: React.FC = () => {
  const frame = useCurrentFrame();

  let flareStrength = 0;
  let sweepProgress = 0;
  let flareColor: string = COLORS.cyanBright;

  for (let i = 0; i < CUT_FRAMES.length; i++) {
    const cut = CUT_FRAMES[i];
    const dist = frame - cut;
    if (dist >= -18 && dist <= 18) {
      flareStrength = interpolate(Math.abs(dist), [0, 18], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      sweepProgress = interpolate(dist, [-18, 18], [-20, 120], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
      flareColor =
        i === 0
          ? COLORS.indigoBright
          : i === 2
          ? COLORS.emeraldBright
          : COLORS.cyanBright;
      break;
    }
  }

  const progressPct = (frame / VIDEO_CONFIG.totalFrames) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flareStrength > 0.01 && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweepProgress}%`,
              width: 320,
              transform: "translateX(-50%) skewX(-12deg)",
              background: `linear-gradient(90deg, transparent 0%, ${flareColor}28 42%, rgba(255,255,255,0.42) 50%, ${flareColor}28 58%, transparent 100%)`,
              opacity: flareStrength * 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 4,
              transform: "translateY(-50%)",
              background: `linear-gradient(90deg, transparent 0%, ${flareColor} 50%, transparent 100%)`,
              opacity: flareStrength * 0.55,
            }}
          />
        </>
      )}

      {/* Cinema timeline progress hairline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: "rgba(148, 163, 184, 0.12)",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366F1 0%, #22D3EE 60%, #34D399 100%)",
            boxShadow: "0 0 12px rgba(34, 211, 238, 0.65)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
