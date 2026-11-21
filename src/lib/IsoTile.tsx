import React from "react";
import { PALETTE } from "../timeline";
import { ISO_TILE_SIZE, iso, isoPoints } from "./iso";

export interface IsoTileProps {
  x: number;
  y: number;
  z?: number;
  /** Alternating warm SAND checker shades. */
  isAlt?: boolean;
  /** Optional entrance pop scale (0..1+) around tile center. */
  popScale?: number;
  /** Draw 3D island edge skirt on front-left / front-right outer boundary tiles. */
  showFrontLeftEdge?: boolean;
  showFrontRightEdge?: boolean;
  thickness?: number;
  T?: number;
}

/**
 * Isometric floor diamond tile in alternating warm SAND shades with gentle 3D island rim.
 */
export const IsoTile: React.FC<IsoTileProps> = ({
  x,
  y,
  z = 0,
  isAlt = false,
  popScale = 1,
  showFrontLeftEdge = false,
  showFrontRightEdge = false,
  thickness = 14,
  T = ISO_TILE_SIZE,
}) => {
  if (popScale <= 0.01) return null;

  const [cx, cy] = iso(x + 0.5, y + 0.5, z, T);
  const topFill = isAlt ? PALETTE.SAND_TILE_B : PALETTE.SAND_TILE_A;

  const topPts = isoPoints(
    [
      [x, y, z],
      [x + 1, y, z],
      [x + 1, y + 1, z],
      [x, y + 1, z],
    ],
    T
  );

  // Front-left face along y+1 edge: (x, y+1) -> (x+1, y+1)
  const leftSkirtPts = showFrontLeftEdge
    ? isoPoints(
        [
          [x, y + 1, z],
          [x + 1, y + 1, z],
          [x + 1, y + 1, z - thickness],
          [x, y + 1, z - thickness],
        ],
        T
      )
    : "";

  // Front-right face along x+1 edge: (x+1, y) -> (x+1, y+1)
  const rightSkirtPts = showFrontRightEdge
    ? isoPoints(
        [
          [x + 1, y, z],
          [x + 1, y + 1, z],
          [x + 1, y + 1, z - thickness],
          [x + 1, y, z - thickness],
        ],
        T
      )
    : "";

  return (
    <g
      transform={
        Math.abs(popScale - 1) > 0.002
          ? `translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) scale(${popScale.toFixed(4)}) translate(${(-cx).toFixed(
              1
            )}, ${(-cy).toFixed(1)})`
          : undefined
      }
    >
      {showFrontLeftEdge && (
        <polygon
          points={leftSkirtPts}
          fill={PALETTE.SAND_SHADE_L}
          stroke={PALETTE.SAND_SHADE_R}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      )}
      {showFrontRightEdge && (
        <polygon
          points={rightSkirtPts}
          fill={PALETTE.SAND_SHADE_R}
          stroke={PALETTE.SAND_SHADE_R}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      )}
      <polygon
        points={topPts}
        fill={topFill}
        stroke={PALETTE.SAND_SHADE_L}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </g>
  );
};
