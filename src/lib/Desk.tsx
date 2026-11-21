import React from "react";
import { PALETTE } from "../timeline";
import { ISO_TILE_SIZE, iso, isoPoints } from "./iso";
import { IsoBox, PaperBlock } from "./IsoBox";

export interface DeskProps {
  /** Center tile coordinates (x, y) for this desk station. */
  x: number;
  y: number;
  /** Number of paper blocks currently sitting on the desk stack. */
  paperCount: number;
  /** Entrance spring scale (0..1+). */
  popScale?: number;
  /** True for worker #5's nearly-empty desk (clean, airy, free capacity). */
  isSpareDesk?: boolean;
  /** Highlight paper tint when overloaded (e.g. coral/amber mix on worker #3). */
  overloadTint?: boolean;
  T?: number;
}

const PAPER_ACCENTS: readonly ("white" | "amber" | "coral" | "sky")[] = [
  "white",
  "sky",
  "amber",
  "white",
  "coral",
  "amber",
  "coral",
  "white",
];

/**
 * Isometric office desk: soft shadow, 4 slim legs, pastel wooden tabletop,
 * small flat angled laptop, and dynamic paper block stack.
 */
export const Desk: React.FC<DeskProps> = ({
  x,
  y,
  paperCount,
  popScale = 1,
  isSpareDesk = false,
  overloadTint = false,
  T = ISO_TILE_SIZE,
}) => {
  if (popScale <= 0.01) return null;

  // Desk footprint centered at (x, y): dx = 1.05, dy = 0.62
  const dx = 1.05;
  const dy = 0.62;
  const x0 = x - dx / 2;
  const y0 = y - dy / 2;
  const legH = 26;
  const topDz = 8;

  const [cx, cy] = iso(x, y, 0, T);

  // Soft floor contact shadow polygon
  const shadowPts = isoPoints(
    [
      [x0 - 0.04, y0 + 0.04, 0.5],
      [x0 + dx + 0.06, y0 + 0.04, 0.5],
      [x0 + dx + 0.06, y0 + dy + 0.08, 0.5],
      [x0 - 0.04, y0 + dy + 0.08, 0.5],
    ],
    T
  );

  // Laptop sits neatly on center-right; paper stack sits on front-left corner so tall stacks NEVER hide worker's face!
  const lapX = x0 + 0.44;
  const lapY = y0 + 0.14;
  const topZ = legH + topDz;
  const screenBackPts = isoPoints(
    [
      [lapX, lapY, topZ + 3],
      [lapX + 0.34, lapY, topZ + 3],
      [lapX + 0.34, lapY - 0.08, topZ + 22],
      [lapX, lapY - 0.08, topZ + 22],
    ],
    T
  );
  const screenGlowPts = isoPoints(
    [
      [lapX + 0.03, lapY + 0.01, topZ + 5],
      [lapX + 0.31, lapY + 0.01, topZ + 5],
      [lapX + 0.31, lapY - 0.06, topZ + 20],
      [lapX + 0.03, lapY - 0.06, topZ + 20],
    ],
    T
  );

  // Paper stack sits cleanly on left edge of desk (projects left of worker's head!)
  const stackX = x0 + 0.06;
  const stackY = y0 + 0.24;

  // Tiny cheerful desk plant on right edge of spare desk #5 to accent its calm airy space
  const [plantX, plantY] = iso(x0 + 0.90, y0 + 0.34, topZ + 1, T);

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
      {/* Soft pastel contact shadow (translucent NAVY — zero black) */}
      <polygon points={shadowPts} fill="rgba(15, 42, 82, 0.09)" />

      {/* 4 slim legs (back-to-front) */}
      <IsoBox
        x={x0 + 0.05}
        y={y0 + 0.05}
        z={0}
        dx={0.07}
        dy={0.07}
        dz={legH}
        topColor={PALETTE.SLATE_LIGHT}
        leftColor={PALETTE.SLATE}
        rightColor={PALETTE.SLATE_DARK}
        T={T}
      />
      <IsoBox
        x={x0 + dx - 0.12}
        y={y0 + 0.05}
        z={0}
        dx={0.07}
        dy={0.07}
        dz={legH}
        topColor={PALETTE.SLATE_LIGHT}
        leftColor={PALETTE.SLATE}
        rightColor={PALETTE.SLATE_DARK}
        T={T}
      />
      <IsoBox
        x={x0 + 0.05}
        y={y0 + dy - 0.12}
        z={0}
        dx={0.07}
        dy={0.07}
        dz={legH}
        topColor={PALETTE.SLATE_LIGHT}
        leftColor={PALETTE.SLATE}
        rightColor={PALETTE.SLATE_DARK}
        T={T}
      />
      <IsoBox
        x={x0 + dx - 0.12}
        y={y0 + dy - 0.12}
        z={0}
        dx={0.07}
        dy={0.07}
        dz={legH}
        topColor={PALETTE.SLATE_LIGHT}
        leftColor={PALETTE.SLATE}
        rightColor={PALETTE.SLATE_DARK}
        T={T}
      />

      {/* Tabletop */}
      <IsoBox
        x={x0}
        y={y0}
        z={legH}
        dx={dx}
        dy={dy}
        dz={topDz}
        topColor={PALETTE.WHITE}
        leftColor={PALETTE.SAND_TILE_B}
        rightColor={PALETTE.SAND_SHADE_L}
        strokeColor="rgba(15, 42, 82, 0.18)"
        strokeWidth={1.2}
        T={T}
      />

      {/* Small flat laptop base */}
      <IsoBox
        x={lapX}
        y={lapY}
        z={topZ}
        dx={0.34}
        dy={0.24}
        dz={3}
        topColor={PALETTE.SLATE_PALE}
        leftColor={PALETTE.SLATE_LIGHT}
        rightColor={PALETTE.SLATE}
        strokeColor="rgba(15, 42, 82, 0.2)"
        strokeWidth={0.9}
        T={T}
      />
      {/* Laptop lid & glowing pastel screen */}
      <polygon
        points={screenBackPts}
        fill={PALETTE.SLATE}
        stroke={PALETTE.NAVY_MID}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <polygon points={screenGlowPts} fill={PALETTE.SKY} />

      {/* Cute tiny potted sprout on spare desk #5 */}
      {isSpareDesk && (
        <g transform={`translate(${plantX.toFixed(1)}, ${plantY.toFixed(1)})`}>
          <ellipse cx={0} cy={0} rx={7} ry={4} fill={PALETTE.CORAL_LIGHT} />
          <path d="M-6,0 L-5,7 Q0,10 5,7 L6,0 Z" fill={PALETTE.CORAL} />
          <ellipse cx={-4} cy={-5} rx={5} ry={3} transform="rotate(-24 -4 -5)" fill={PALETTE.GREEN} />
          <ellipse cx={4} cy={-6} rx={5} ry={3} transform="rotate(24 4 -6)" fill={PALETTE.GREEN_LIGHT} />
        </g>
      )}

      {/* Dynamic stack of small paper blocks */}
      {Array.from({ length: Math.max(0, Math.floor(paperCount)) }).map((_, idx) => {
        const accent =
          overloadTint && idx >= 2
            ? idx % 2 === 0
              ? "coral"
              : "amber"
            : isSpareDesk
            ? idx % 2 === 0
              ? "white"
              : "sky"
            : PAPER_ACCENTS[idx % PAPER_ACCENTS.length];
        const jitterX = ((idx % 3) - 1) * 0.014;
        const jitterY = (((idx + 1) % 3) - 1) * 0.012;
        return (
          <PaperBlock
            key={idx}
            x={stackX + jitterX}
            y={stackY + jitterY}
            z={topZ + idx * 7.8}
            accent={accent}
            T={T}
          />
        );
      })}
    </g>
  );
};
