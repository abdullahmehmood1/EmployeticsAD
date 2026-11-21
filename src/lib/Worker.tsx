import React from "react";
import { PALETTE } from "../timeline";
import { DeskSlot, ISO_TILE_SIZE, iso } from "./iso";

export interface WorkerProps {
  slot: DeskSlot;
  /** Global/scene frame for continuous idle bob = sin(frame / 10 + index). */
  frame: number;
  /** Squash-and-stretch entrance scale X & Y (1, 1 at rest). */
  scaleX?: number;
  scaleY?: number;
  /** Celebratory bounce height in px (S5 f850-900). */
  bounceY?: number;
  /** Optional small coral "!" marker above head (S3 reveal on worker #3). */
  showAlertBadge?: boolean;
  alertScale?: number;
  T?: number;
}

/**
 * Friendly isometric office worker sitting behind their desk:
 * rounded capsule body, soft circle head, cheerful dot eyes & small smile,
 * continuous gentle idle bob = sin(frame / 10 + index).
 */
export const Worker: React.FC<WorkerProps> = ({
  slot,
  frame,
  scaleX = 1,
  scaleY = 1,
  bounceY = 0,
  showAlertBadge = false,
  alertScale = 1,
  T = ISO_TILE_SIZE,
}) => {
  if (scaleX <= 0.01 || scaleY <= 0.01) return null;

  // Positioned just behind the desk (y - 0.42) so the desk sits cleanly in front of their lap
  const [wx, wy] = iso(slot.x - 0.04, slot.y - 0.42, 20, T);
  const idleBob = Math.sin(frame / 10 + slot.index) * 3.4;
  const totalY = wy + idleBob - bounceY;

  return (
    <g
      transform={`translate(${wx.toFixed(1)}, ${totalY.toFixed(1)}) scale(${scaleX.toFixed(
        4
      )}, ${scaleY.toFixed(4)})`}
    >
      {/* Subtle pastel chair backrest peeking softly behind shoulders */}
      <rect
        x={-21}
        y={-22}
        width={42}
        height={32}
        rx={12}
        fill={PALETTE.SLATE_PALE}
        stroke={PALETTE.SLATE_LIGHT}
        strokeWidth={1.5}
      />

      {/* Rounded capsule torso */}
      <rect
        x={-18}
        y={-18}
        width={36}
        height={40}
        rx={17}
        fill={slot.shirt}
        stroke={PALETTE.NAVY_MID}
        strokeOpacity={0.28}
        strokeWidth={1.6}
      />
      {/* Subtle sunlit left-shoulder highlight stripe */}
      <path
        d="M -12 -12 C -14 -4, -14 6, -12 14"
        fill="none"
        stroke={slot.shirtLight}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Friendly rounded arms resting forward toward desk */}
      <ellipse cx={-16} cy={4} rx={6.5} ry={10} fill={slot.shirtShade} />
      <ellipse cx={16} cy={4} rx={6.5} ry={10} fill={slot.shirt} />

      {/* Circular head */}
      <circle
        cx={0}
        cy={-34}
        r={16.5}
        fill={slot.skin}
        stroke={PALETTE.NAVY_MID}
        strokeOpacity={0.24}
        strokeWidth={1.5}
      />

      {/* Cute rounded hair cap (varied subtly per worker index) */}
      <path
        d={
          slot.index % 2 === 0
            ? "M -16 -36 C -16 -52, 16 -52, 16 -36 C 12 -43, -8 -43, -16 -36 Z"
            : "M -16.5 -35 C -17 -53, 17 -53, 16.5 -35 C 9 -40, 2 -44, -6 -41 C -11 -39, -14 -37, -16.5 -35 Z"
        }
        fill={slot.hair}
      />

      {/* Friendly dot eyes + warm rosy cheeks + small smile (even worker #3 keeps smiling!) */}
      <circle cx={-5.5} cy={-34.5} r={2} fill={PALETTE.NAVY} />
      <circle cx={5.5} cy={-34.5} r={2} fill={PALETTE.NAVY} />
      <circle cx={-9.5} cy={-31} r={2.4} fill={PALETTE.CORAL_LIGHT} opacity={0.55} />
      <circle cx={9.5} cy={-31} r={2.4} fill={PALETTE.CORAL_LIGHT} opacity={0.55} />
      <path
        d="M -4.8 -29.2 Q 0 -25.2 4.8 -29.2"
        fill="none"
        stroke={PALETTE.NAVY}
        strokeWidth={1.9}
        strokeLinecap="round"
      />

      {/* S3 Alert "!" badge popping cleanly beside/above worker #3's head */}
      {showAlertBadge && alertScale > 0.01 && (
        <g transform={`translate(28, -56) scale(${alertScale.toFixed(4)})`}>
          <circle cx={0} cy={0} r={14} fill={PALETTE.CORAL} stroke={PALETTE.WHITE} strokeWidth={2.5} />
          <text
            x={0}
            y={5.5}
            textAnchor="middle"
            fontSize={18}
            fontWeight={900}
            fill={PALETTE.WHITE}
            fontFamily="Poppins, sans-serif"
          >
            !
          </text>
        </g>
      )}
    </g>
  );
};
