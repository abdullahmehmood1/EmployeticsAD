import React, { useId } from "react";
import { PALETTE, VIDEO } from "../timeline";

export interface SunProps {
  /** Dawn rise progress 0..1 (rises slowly from low horizon up behind the phone UI). */
  progress: number;
  /** Subtle breathing pulse (0..1). */
  pulse?: number;
}

/**
 * Smooth cinematic dawn sun orb rising slowly behind the phone UI in S5.
 * Interpolates seamlessly between CREAM and GOLD palette colors.
 */
export const Sun: React.FC<SunProps> = ({ progress, pulse = 0 }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `dawn-sun-${uid}`;

  if (progress <= 0.005) return null;

  const cy = 1860 - progress * 680; // rises gently from y=1860 to y=1180
  const outerR = 460 + progress * 220 + pulse * 18;
  const opacity = Math.min(1, progress * 1.35);

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={PALETTE.CREAM} stopOpacity={0.85 * opacity} />
          <stop offset="28%" stopColor={PALETTE.GOLD} stopOpacity={0.58 * opacity} />
          <stop offset="62%" stopColor={PALETTE.GOLD} stopOpacity={0.22 * opacity} />
          <stop offset="100%" stopColor={PALETTE.GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={VIDEO.width / 2} cy={cy} r={outerR} fill={`url(#${gradId})`} />
    </svg>
  );
};
