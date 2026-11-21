import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { PALETTE } from "../timeline";
import { INTER_FONT } from "./fonts";

export interface DayChipProps {
  /** Strictly one of "MON" | "WED" | "SAT" | "SUN". */
  label: string;
  /** Local frame when this day chip fades in. */
  appearAt: number;
  bgColor?: string;
  textColor?: string;
}

/** Quiet centered day divider pill inside the chat thread. */
export const DayChip: React.FC<DayChipProps> = ({
  label,
  appearAt,
  bgColor = "rgba(38, 58, 92, 0.55)",
  textColor = PALETTE.CREAM,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - appearAt;
  if (rel < 0) return null;

  const opacity = interpolate(rel, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(rel, [0, 12], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        alignSelf: "center",
        opacity,
        transform: `translateY(${translateY.toFixed(1)}px)`,
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: INTER_FONT,
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: "3px",
        padding: "8px 24px",
        borderRadius: 999,
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
  );
};
