import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SCENES, VIDEO_CONFIG } from "../theme";

// Cut points between the 6 scenes (in frames @ 60fps)
const CUT_FRAMES = [
  SCENES.scene2.startFrame, // 540 (9s)
  SCENES.scene3.startFrame, // 960 (16s)
  SCENES.scene4.startFrame, // 1440 (24s)
  SCENES.scene5.startFrame, // 1860 (31s)
  SCENES.scene6.startFrame, // 2100 (35s)
];

export const TransitionFlare: React.FC = () => {
  const frame = useCurrentFrame();

  // Compute nearest transition optical sweep
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
          : i === 3
          ? COLORS.emeraldBright
          : COLORS.cyanBright;
      break;
    }
  }

  // Ultra-subtle 2.5px brand progress hairline along the bottom edge
  const progressPct = (frame / VIDEO_CONFIG.totalFrames) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Anamorphic light sweep across scene transitions */}
      {flareStrength > 0.01 && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweepProgress}%`,
              width: 340,
              transform: "translateX(-50%) skewX(-12deg)",
              background: `linear-gradient(90deg, transparent 0%, ${flareColor}26 42%, rgba(255,255,255,0.45) 50%, ${flareColor}26 58%, transparent 100%)`,
              opacity: flareStrength * 0.85,
              filter: "blur(16px)",
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
              filter: "blur(6px)",
            }}
          />
        </>
      )}

      {/* Subtle cinema progress hairline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: "rgba(148, 163, 184, 0.10)",
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
