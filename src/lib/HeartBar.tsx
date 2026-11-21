import React, { useId } from "react";
import { PALETTE } from "../timeline";
import { DeskSlot, ISO_TILE_SIZE, heartColorForLevel, iso } from "./iso";

export interface HeartBarProps {
  slot: DeskSlot;
  /** Fill level 0..1 (1 = full GREEN, 0.5 = AMBER, 0.14 = CORAL). */
  level: number;
  frame: number;
  /** Entrance spring scale (0..1+). */
  popScale?: number;
  /** Optional extra lift when worker bounces. */
  bounceY?: number;
  /** Pulsing coral beacon ring around heart (S3 scan-line reveal on worker #3). */
  coralRingPulse?: number;
  T?: number;
}

/**
 * Floating heart icon above each worker's head, filled bottom-to-top via SVG clipPath
 * with smooth GREEN -> AMBER -> CORAL color interpolation and gentle soft pulse.
 */
export const HeartBar: React.FC<HeartBarProps> = ({
  slot,
  level,
  frame,
  popScale = 1,
  bounceY = 0,
  coralRingPulse = 0,
  T = ISO_TILE_SIZE,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `heart-clip-${slot.index}-${uid}`;

  if (popScale <= 0.01) return null;

  const clamped = Math.max(0.06, Math.min(1, level));
  const fillColor = heartColorForLevel(clamped);

  // Position cleanly above the worker's head
  const [hx, hy] = iso(slot.x - 0.04, slot.y - 0.42, 102, T);
  const floatY = Math.sin(frame / 10 + slot.index) * 3.0;
  const softPulse = 1 + Math.sin(frame / 11 + slot.index * 1.2) * 0.045;
  const finalScale = popScale * softPulse;

  // Recessed track inside heart (soft coral blush when critically low so low heart reads clearly coral!)
  const trackColor = clamped <= 0.34 ? PALETTE.CORAL_SOFT : PALETTE.SLATE_PALE;

  // Heart vector in local 44x40 box centered at (0, 0): top=-18, bottom=+18 (height=36)
  const heartPath =
    "M 0 16 C -1 15 -18 4 -18 -6 C -18 -13.5 -12 -18 -6.2 -18 C -2.8 -18 0 -15.8 0 -13.4 C 0 -15.8 2.8 -18 6.2 -18 C 12 -18 18 -13.5 18 -6 C 18 4 1 15 0 16 Z";

  // Map 0.28 -> ~38% visual vertical height so the narrow lower heart tip shows rich visible coral fill
  const visualFrac = Math.max(0.18, Math.min(1, clamped * 0.85 + 0.15));
  const fillHeight = 36 * visualFrac;
  const fillY = 17 - fillHeight;

  return (
    <g
      transform={`translate(${hx.toFixed(1)}, ${(hy + floatY - bounceY).toFixed(
        1
      )}) scale(${finalScale.toFixed(4)})`}
    >
      {/* Pulsing CORAL ring highlight when S3 scan detects worker #3 */}
      {coralRingPulse > 0 && (
        <>
          <circle
            cx={0}
            cy={-1}
            r={24 + coralRingPulse * 14}
            fill="none"
            stroke={PALETTE.CORAL}
            strokeWidth={3.5}
            strokeOpacity={0.85 * (1 - coralRingPulse * 0.55)}
          />
          <circle
            cx={0}
            cy={-1}
            r={21}
            fill={PALETTE.CORAL_SOFT}
            fillOpacity={0.45}
            stroke={PALETTE.CORAL}
            strokeWidth={2.5}
          />
        </>
      )}

      {/* Soft white pill halo behind heart for crisp contrast over SAND or SKY */}
      <circle cx={0} cy={-1} r={21} fill={PALETTE.WHITE} fillOpacity={0.92} />

      <defs>
        <clipPath id={clipId}>
          <path d={heartPath} />
        </clipPath>
      </defs>

      {/* Recessed track inside heart */}
      <path d={heartPath} fill={trackColor} />

      {/* Bottom-to-top clipped fill */}
      <rect
        x={-22}
        y={fillY}
        width={44}
        height={fillHeight + 2}
        fill={fillColor}
        clipPath={`url(#${clipId})`}
      />

      {/* Crisp specular tiny shine dot on upper-left lobe */}
      <circle cx={-7} cy={-9} r={2.3} fill={PALETTE.WHITE} fillOpacity={0.75} />

      {/* Clean outer heart outline */}
      <path
        d={heartPath}
        fill="none"
        stroke={PALETTE.NAVY}
        strokeWidth={2.1}
        strokeLinejoin="round"
        strokeOpacity={0.75}
      />
    </g>
  );
};
