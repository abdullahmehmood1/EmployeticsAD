import React from "react";
import { PALETTE } from "../timeline";
import { ISO_TILE_SIZE, isoPoints } from "./iso";

export interface IsoBoxProps {
  /** Back corner (x, y) and bottom height z in isometric units (z in px). */
  x: number;
  y: number;
  z: number;
  /** Box width along x (tiles), depth along y (tiles), height along z (px). */
  dx: number;
  dy: number;
  dz: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  T?: number;
}

/**
 * Clean 3-face isometric rectangular prism (top, front-left, front-right) shaded in 3 flat tints.
 */
export const IsoBox: React.FC<IsoBoxProps> = ({
  x,
  y,
  z,
  dx,
  dy,
  dz,
  topColor,
  leftColor,
  rightColor,
  strokeColor = "rgba(15, 42, 82, 0.13)",
  strokeWidth = 1.1,
  T = ISO_TILE_SIZE,
}) => {
  // Top face at z + dz
  const topPts = isoPoints(
    [
      [x, y, z + dz],
      [x + dx, y, z + dz],
      [x + dx, y + dy, z + dz],
      [x, y + dy, z + dz],
    ],
    T
  );

  // Front-left face along y + dy
  const leftPts = isoPoints(
    [
      [x, y + dy, z + dz],
      [x + dx, y + dy, z + dz],
      [x + dx, y + dy, z],
      [x, y + dy, z],
    ],
    T
  );

  // Front-right face along x + dx
  const rightPts = isoPoints(
    [
      [x + dx, y, z + dz],
      [x + dx, y + dy, z + dz],
      [x + dx, y + dy, z],
      [x + dx, y, z],
    ],
    T
  );

  return (
    <g>
      <polygon
        points={leftPts}
        fill={leftColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <polygon
        points={rightPts}
        fill={rightColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <polygon
        points={topPts}
        fill={topColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </g>
  );
};

/** Helper to draw a small stacked pastel paper block at exact world coordinates. */
export const PaperBlock: React.FC<{
  x: number;
  y: number;
  z: number;
  accent?: "white" | "amber" | "coral" | "sky";
  T?: number;
}> = ({ x, y, z, accent = "white", T = ISO_TILE_SIZE }) => {
  const paletteMap = {
    white: { top: PALETTE.WHITE, left: PALETTE.SKY_LIGHT, right: PALETTE.SLATE_PALE },
    amber: { top: PALETTE.AMBER_SOFT, left: PALETTE.AMBER_LIGHT, right: PALETTE.AMBER },
    coral: { top: PALETTE.CORAL_SOFT, left: PALETTE.CORAL_LIGHT, right: PALETTE.CORAL },
    sky: { top: PALETTE.SKY_LIGHT, left: PALETTE.SKY, right: PALETTE.SKY_DEEP },
  }[accent];

  return (
    <IsoBox
      x={x}
      y={y}
      z={z}
      dx={0.28}
      dy={0.24}
      dz={9}
      topColor={paletteMap.top}
      leftColor={paletteMap.left}
      rightColor={paletteMap.right}
      strokeColor="rgba(15, 42, 82, 0.22)"
      strokeWidth={1.0}
      T={T}
    />
  );
};
