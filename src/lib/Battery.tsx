import React from "react";
import { PALETTE } from "../timeline";

export interface BatteryProps {
  /** Charge percentage 0..100 (e.g. 78, 41, 9, 100). */
  percent: number;
  /** Outline/shell color (CREAM at night, smoothly transitioning to NAVY at dawn). */
  outlineColor?: string;
  /** True during S5 morning recharge (uses TEAL fill). */
  charging?: boolean;
  /** Subtle pulse intensity (0..1) when battery reaches 100% or low-battery heartbeat. */
  pulse?: number;
  width?: number;
  height?: number;
}

/**
 * Minimal horizontal phone status-bar battery icon (pure graphic — zero unauthorized numeric text).
 * Turns AMBER (#E3A64B) below 20%, TEAL (#5FA8A0) when charging/full in dawn, otherwise matches ink.
 */
export const Battery: React.FC<BatteryProps> = ({
  percent,
  outlineColor = PALETTE.CREAM,
  charging = false,
  pulse = 0,
  width = 58,
  height = 28,
}) => {
  const clamped = Math.max(4, Math.min(100, percent));
  const isLow = clamped < 20 && !charging;
  const fillColor = charging ? PALETTE.TEAL : isLow ? PALETTE.AMBER : outlineColor;
  const strokeColor = isLow ? PALETTE.AMBER : outlineColor;

  const bodyW = width - 7;
  const pad = 4.5;
  const maxFillW = bodyW - pad * 2;
  const fillW = Math.max(4, (maxFillW * clamped) / 100);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: "block",
        overflow: "visible",
        transform: pulse > 0 ? `scale(${(1 + pulse * 0.08).toFixed(3)})` : undefined,
      }}
    >
      {/* Subtle charging aura ring at 100% */}
      {charging && pulse > 0.02 && (
        <rect
          x={-4 - pulse * 4}
          y={-4 - pulse * 4}
          width={bodyW + 8 + pulse * 8}
          height={height + 8 + pulse * 8}
          rx={10}
          fill="none"
          stroke={PALETTE.TEAL}
          strokeWidth={2}
          strokeOpacity={0.55 * (1 - pulse * 0.4)}
        />
      )}

      {/* Battery outline */}
      <rect
        x={1.5}
        y={1.5}
        width={bodyW - 3}
        height={height - 3}
        rx={7}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.4}
        strokeOpacity={0.9}
      />

      {/* Inner charge fill */}
      <rect
        x={pad}
        y={pad}
        width={fillW}
        height={height - pad * 2}
        rx={3.5}
        fill={fillColor}
      />

      {/* Positive terminal nub */}
      <rect
        x={bodyW + 1.5}
        y={height * 0.3}
        width={4.5}
        height={height * 0.4}
        rx={2}
        fill={strokeColor}
        fillOpacity={0.85}
      />
    </svg>
  );
};
