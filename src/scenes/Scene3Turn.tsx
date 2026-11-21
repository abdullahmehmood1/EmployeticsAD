import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText } from "../lib/FitText";
import { Scene2Week } from "./Scene2Week";

/**
 * S3 THE TURN (f330-419): The late-night chat smoothly dims to 25%.
 * f340: slow emotional fade-in of "But are you?" in DM Serif Display (CREAM, ~120 px), centered.
 * Patient hold while a low piano chord swells.
 * f405-419: fades softly out.
 */
export const Scene3Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const s3 = TIMELINE.S3;

  const textIn = s3.textFadeIn - s3.start; // 10 (global f340)
  const textFull = s3.textFull - s3.start; // 34 (global f364)
  const fadeOutS = s3.fadeOutStart - s3.start; // 75 (global f405)
  const fadeOutE = s3.fadeOutEnd - s3.start; // 89 (global f419)

  // Chat dims gently from 1.0 -> 0.25 over first 14 frames, then settles to 0.14 on exit
  const chatDim = interpolate(frame, [0, 14, fadeOutS, fadeOutE], [0.85, 0.25, 0.25, 0.12], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "But are you?" slow luminous fade-in starting at f340 (soft 0.35 arrival right on f340 -> 1.0 by f364)
  const inOp =
    frame < textIn
      ? 0
      : interpolate(frame, [textIn, textFull], [0.32, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const outOp = interpolate(frame, [fadeOutS, fadeOutE], [1, 0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = inOp * outOp;

  // Ultra-gentle breathing scale & upward drift (patient, calm)
  const textY = interpolate(frame, [textIn, textFull], [16, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textScale = interpolate(frame, [textIn, fadeOutE], [0.97, 1.025], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.NIGHT_DARK, overflow: "hidden" }}>
      {/* Dimmed Saturday chat background (25% opacity) */}
      <Scene2Week frozenEnd dimOpacity={chatDim} />

      {/* Centered emotional serif question inside vertical safe zone */}
      <AbsoluteFill
        style={{
          paddingLeft: VIDEO.safeLeft,
          paddingRight: VIDEO.width - VIDEO.safeRight,
          paddingTop: VIDEO.safeTop,
          paddingBottom: VIDEO.height - VIDEO.safeBottom,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY.toFixed(1)}px) scale(${textScale.toFixed(4)})`,
          }}
        >
          <FitText
            text={COPY.s3Question}
            font="serif"
            fontSize={124}
            color={PALETTE.CREAM}
            maxWidth={VIDEO.maxTextWidth}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
