import React from "react";
import { PALETTE, VIDEO } from "../timeline";
import { Desk } from "./Desk";
import { HeartBar } from "./HeartBar";
import {
  FLOOR_COLS,
  FLOOR_ROWS,
  ISO_TILE_SIZE,
  WORKER_SLOTS,
  WORKER_SLOTS_DEPTH_SORTED,
  iso,
} from "./iso";
import { PaperBlock } from "./IsoBox";
import { IsoTile } from "./IsoTile";
import { Worker } from "./Worker";

export interface FlyingBlockSpec {
  id: number;
  /** Progress 0..1 along parabolic arc from Desk #3 to Desk #5. */
  progress: number;
  /** Height at landing stack on Desk #5. */
  targetStackIdx: number;
  accent: "white" | "amber" | "coral" | "sky";
}

export interface DustPuffSpec {
  id: number;
  /** 0..1 expansion progress after landing on Desk #5. */
  progress: number;
  stackIdx: number;
}

export interface IsometricOfficeProps {
  /** Active frame driving continuous tile breathing, worker bobbing, and heart pulsing. */
  frame: number;
  /** Screen position for iso(0, 0, 0) anchor inside the 1080x1080 canvas. */
  originX?: number;
  originY?: number;
  scale?: number;
  /** Optional per-tile entrance scale callback (defaults to 1). */
  getTileScale?: (tx: number, ty: number) => number;
  /** Optional per-desk entrance scale callback (defaults to 1). */
  getDeskScale?: (index: number) => number;
  /** Optional per-worker squash-and-stretch entrance callback (defaults to {sx:1, sy:1}). */
  getWorkerSquash?: (index: number) => { sx: number; sy: number };
  /** Optional per-heart entrance scale callback (defaults to 1). */
  getHeartScale?: (index: number) => number;
  /** Heart level (0..1) per worker index 0..5. */
  heartLevels: readonly number[];
  /** Paper block count on each desk index 0..5. */
  paperCounts: readonly number[];
  /** Optional celebration bounce Y (px) per worker index 0..5. */
  workerBounces?: readonly number[];
  /** Optional pulsing coral beacon ring on worker #3 (0 = off, >0 = pulse phase). */
  worker3CoralRing?: number;
  /** Optional small "!" badge above worker #3's head (S3). */
  worker3AlertScale?: number;
  /** Optional flying paper blocks (S5 f680-760). */
  flyingBlocks?: readonly FlyingBlockSpec[];
  /** Optional dust puffs on Desk #5 landings (S5). */
  dustPuffs?: readonly DustPuffSpec[];
  /** Optional extra overlay rendered inside the office coordinate space (e.g. Magnifier, scan-line, sparkles). */
  overlay?: React.ReactNode;
}

/**
 * Complete 3x2 isometric office diorama on a 6x4 breathing SAND tile island.
 * Draws tiles, desks, workers, and HeartBars strictly back-to-front by (x + y).
 */
export const IsometricOffice: React.FC<IsometricOfficeProps> = ({
  frame,
  originX = 462,
  originY = 468,
  scale = 1,
  getTileScale,
  getDeskScale,
  getWorkerSquash,
  getHeartScale,
  heartLevels,
  paperCounts,
  workerBounces,
  worker3CoralRing = 0,
  worker3AlertScale = 0,
  flyingBlocks = [],
  dustPuffs = [],
  overlay,
}) => {
  // Build tile list sorted back-to-front by (tx + ty)
  const tiles: { tx: number; ty: number }[] = [];
  for (let tx = 0; tx < FLOOR_COLS; tx++) {
    for (let ty = 0; ty < FLOOR_ROWS; ty++) {
      tiles.push({ tx, ty });
    }
  }
  tiles.sort((a, b) => a.tx + a.ty - (b.tx + b.ty) || a.tx - b.tx);

  // Desk #3 and Desk #5 left-edge stack anchor points for S5 flying paper blocks
  const slot3 = WORKER_SLOTS[3];
  const slot5 = WORKER_SLOTS[5];
  const startX = slot3.x - 1.05 / 2 + 0.06;
  const startY = slot3.y - 0.62 / 2 + 0.24;
  const endX = slot5.x - 1.05 / 2 + 0.06;
  const endY = slot5.y - 0.62 / 2 + 0.24;
  const deskTopZ = 34;

  // Soft island shadow under entire 6x4 floor
  const [s0x, s0y] = iso(0, 0, -24, ISO_TILE_SIZE);
  const [s1x, s1y] = iso(FLOOR_COLS, 0, -24, ISO_TILE_SIZE);
  const [s2x, s2y] = iso(FLOOR_COLS, FLOOR_ROWS, -24, ISO_TILE_SIZE);
  const [s3x, s3y] = iso(0, FLOOR_ROWS, -24, ISO_TILE_SIZE);

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <g
        transform={`translate(${originX.toFixed(1)}, ${originY.toFixed(1)}) scale(${scale.toFixed(
          4
        )})`}
      >
        {/* Subtle floating island shadow (translucent NAVY, never black) */}
        <polygon
          points={`${s0x.toFixed(1)},${s0y.toFixed(1)} ${s1x.toFixed(1)},${s1y.toFixed(
            1
          )} ${s2x.toFixed(1)},${s2y.toFixed(1)} ${s3x.toFixed(1)},${s3y.toFixed(1)}`}
          fill="rgba(15, 42, 82, 0.08)"
        />

        {/* Layer 1: Breathing alternating SAND floor tiles */}
        {tiles.map(({ tx, ty }) => {
          const breatheZ = Math.sin(frame / 18 + (tx + ty) * 0.65) * 1.9;
          const tilePop = getTileScale ? getTileScale(tx, ty) : 1;
          return (
            <IsoTile
              key={`tile-${tx}-${ty}`}
              x={tx}
              y={ty}
              z={breatheZ}
              isAlt={(tx + ty) % 2 === 1}
              popScale={tilePop}
              showFrontLeftEdge={ty === FLOOR_ROWS - 1}
              showFrontRightEdge={tx === FLOOR_COLS - 1}
            />
          );
        })}

        {/* Layer 2: Desks + Workers drawn back-to-front by (x + y).
            At each station, Worker sits behind the Desk so Desk naturally occludes their lap. */}
        {WORKER_SLOTS_DEPTH_SORTED.map((slot) => {
          const dScale = getDeskScale ? getDeskScale(slot.index) : 1;
          const wSquash = getWorkerSquash ? getWorkerSquash(slot.index) : { sx: 1, sy: 1 };
          const bounceY = workerBounces ? workerBounces[slot.index] ?? 0 : 0;
          const papers = paperCounts[slot.index] ?? slot.basePapers;

          return (
            <g key={`station-${slot.index}`}>
              <Worker
                slot={slot}
                frame={frame}
                scaleX={wSquash.sx}
                scaleY={wSquash.sy}
                bounceY={bounceY}
                showAlertBadge={slot.index === 3 && worker3AlertScale > 0.01}
                alertScale={worker3AlertScale}
              />
              <Desk
                x={slot.x}
                y={slot.y}
                paperCount={papers}
                popScale={dScale}
                isSpareDesk={slot.index === 5}
                overloadTint={slot.index === 3}
              />
            </g>
          );
        })}

        {/* Layer 3: Dust puffs on Desk #5 landings */}
        {dustPuffs.map((puff) => {
          const [px, py] = iso(endX + 0.14, endY + 0.12, deskTopZ + puff.stackIdx * 8.5, ISO_TILE_SIZE);
          const rBase = 5 + puff.progress * 26;
          const op = Math.max(0, 1 - puff.progress);
          return (
            <g key={`puff-${puff.id}`} transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)})`}>
              {[0, 1, 2, 3, 4, 5].map((k) => {
                const ang = (k / 6) * Math.PI * 2 + puff.id * 0.4;
                return (
                  <circle
                    key={k}
                    cx={Math.cos(ang) * rBase}
                    cy={Math.sin(ang) * rBase * 0.6}
                    r={Math.max(1.5, 6.5 * (1 - puff.progress * 0.7))}
                    fill={PALETTE.WHITE}
                    fillOpacity={op * 0.85}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Layer 4: Flying paper blocks soaring along high parabolic arcs from Desk #3 -> Desk #5 */}
        {flyingBlocks.map((blk) => {
          const p = blk.progress;
          const bx = startX + (endX - startX) * p;
          const by = startY + (endY - startY) * p;
          const zStart = deskTopZ + (6 - blk.id) * 7.8;
          const zEnd = deskTopZ + blk.targetStackIdx * 7.8;
          const arcLift = Math.sin(p * Math.PI) * 190;
          const bz = zStart + (zEnd - zStart) * p + arcLift;
          // Playful dotted arc trail right behind each flying block
          const trailDots = [0.07, 0.14, 0.21]
            .map((dt) => p - dt)
            .filter((tp) => tp > 0.02);
          return (
            <g key={`fly-${blk.id}`}>
              {trailDots.map((tp, idx) => {
                const tx = startX + (endX - startX) * tp + 0.14;
                const ty = startY + (endY - startY) * tp + 0.12;
                const tz = zStart + (zEnd - zStart) * tp + Math.sin(tp * Math.PI) * 190 + 4;
                const [sx, sy] = iso(tx, ty, tz, ISO_TILE_SIZE);
                return (
                  <circle
                    key={idx}
                    cx={sx}
                    cy={sy}
                    r={4.2 - idx * 0.9}
                    fill={PALETTE.AMBER}
                    fillOpacity={0.72 - idx * 0.2}
                  />
                );
              })}
              <PaperBlock x={bx} y={by} z={bz} accent={blk.accent} />
            </g>
          );
        })}

        {/* Layer 5: Floating HeartBars above every worker's head */}
        {WORKER_SLOTS_DEPTH_SORTED.map((slot) => {
          const hScale = getHeartScale ? getHeartScale(slot.index) : 1;
          const bounceY = workerBounces ? workerBounces[slot.index] ?? 0 : 0;
          return (
            <HeartBar
              key={`heart-${slot.index}`}
              slot={slot}
              level={heartLevels[slot.index] ?? 1}
              frame={frame}
              popScale={hScale}
              bounceY={bounceY}
              coralRingPulse={slot.index === 3 ? worker3CoralRing : 0}
            />
          );
        })}

        {/* Optional scene-specific isometric overlay (Magnifier, scan-line, sparkles) */}
        {overlay}
      </g>
    </svg>
  );
};
