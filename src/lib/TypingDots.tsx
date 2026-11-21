import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { PALETTE } from "../timeline";

export interface TypingDotsProps {
  /** Local start and end frame while the typing indicator is visible. */
  startAt: number;
  endAt: number;
  side?: "sara" | "friend";
}

/** Soft, hesitant 3-dot typing indicator bubble. */
export const TypingDots: React.FC<TypingDotsProps> = ({
  startAt,
  endAt,
  side = "sara",
}) => {
  const frame = useCurrentFrame();
  if (frame < startAt || frame > endAt) return null;

  const fadeIn = interpolate(frame, [startAt, startAt + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [endAt - 3, endAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const isSara = side === "sara";

  return (
    <div
      style={{
        alignSelf: isSara ? "flex-end" : "flex-start",
        opacity,
        backgroundColor: isSara ? "rgba(95, 168, 160, 0.28)" : PALETTE.BUBBLE,
        border: isSara ? `2px solid rgba(95, 168, 160, 0.55)` : undefined,
        borderRadius: isSara ? "28px 28px 8px 28px" : "28px 28px 28px 8px",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {[0, 1, 2].map((i) => {
        const wave = Math.sin((frame - startAt) * 0.28 - i * 1.05);
        const y = wave * -5;
        const dotOp = 0.45 + 0.55 * (0.5 + 0.5 * wave);
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: isSara ? PALETTE.TEAL : PALETTE.CREAM,
              opacity: dotOp,
              transform: `translateY(${y.toFixed(1)}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
