import React from "react";
import { useCurrentFrame } from "remotion";
import { PALETTE, VIDEO } from "../timeline";

export interface DotGridProps {
  /** Dot color — strictly from PALETTE (WHITE on NAVY, NAVY on WHITE). */
  color?: string;
  opacity?: number;
  spacing?: number;
  radius?: number;
  speedX?: number;
  speedY?: number;
}

/**
 * Subtle continuously drifting dot grid so no active scene ever feels static.
 * Pure deterministic SVG pattern — zero canvas blinking, zero gradients.
 */
export const DotGrid: React.FC<DotGridProps> = ({
  color = PALETTE.WHITE,
  opacity = 0.1,
  spacing = 64,
  radius = 2.4,
  speedX = 0.55,
  speedY = 0.3,
}) => {
  const frame = useCurrentFrame();
  const offsetX = (frame * speedX) % spacing;
  const offsetY = (frame * speedY) % spacing;

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <defs>
        <pattern
          id={`dot-grid-${color.replace("#", "")}`}
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)})`}
        >
          <circle cx={spacing / 2} cy={spacing / 2} r={radius} fill={color} fillOpacity={opacity} />
        </pattern>
      </defs>
      <rect width={VIDEO.width} height={VIDEO.height} fill={`url(#dot-grid-${color.replace("#", "")})`} />
    </svg>
  );
};
