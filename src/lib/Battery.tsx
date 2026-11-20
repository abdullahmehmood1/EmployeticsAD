import React from "react";
import { COPY, PALETTE } from "../timeline";
import { POPPINS_FONT } from "./fonts";

export interface BatteryProps {
  /** Charge fraction from 0 to 1 (e.g. 1.0 = 100%, 0.08 = 8%). */
  level: number;
  width?: number;
  height?: number;
  /** Outline stroke color (WHITE or AMBER). */
  outlineColor?: string;
  /** Inner fill color (AMBER in S2, WHITE in S5). */
  fillColor?: string;
  /** Show pulsing small "!" warning icon to the right of the battery (S2 from f240). */
  showAlert?: boolean;
  /** 0..1 pulse factor for alert / outline emphasis. */
  alertPulse?: number;
  /** 0..1 flat concentric glow pulse intensity during charging (S5). No gradients. */
  chargePulse?: number;
}

/**
 * Bold flat vector vertical battery icon.
 * Strictly flat solid strokes & fills from PALETTE — zero gradients, zero neon.
 */
export const Battery: React.FC<BatteryProps> = ({
  level,
  width = 250,
  height = 440,
  outlineColor = PALETTE.WHITE,
  fillColor = PALETTE.AMBER,
  showAlert = false,
  alertPulse = 0,
  chargePulse = 0,
}) => {
  const clamped = Math.max(0.03, Math.min(1, level));
  const strokeW = Math.round(width * 0.048);
  const capW = Math.round(width * 0.42);
  const capH = Math.round(height * 0.068);
  const capX = (width - capW) / 2;

  const bodyY = capH + strokeW * 0.7;
  const bodyH = height - bodyY;
  const bodyRx = Math.round(width * 0.11);

  const innerPad = strokeW * 1.65;
  const innerX = innerPad;
  const innerW = width - innerPad * 2;
  const innerTop = bodyY + innerPad;
  const innerMaxH = bodyH - innerPad * 2;
  const fillH = Math.max(14, innerMaxH * clamped);
  const fillY = innerTop + (innerMaxH - fillH);
  const fillRx = Math.max(6, Math.round(bodyRx * 0.48));

  const alertOffsetX = width + 36;
  const svgW = showAlert ? width + 115 : width + 80;
  const padX = 40;
  const padY = 40;

  return (
    <svg
      width={svgW + padX}
      height={height + padY * 2}
      viewBox={`${-padX} ${-padY} ${svgW + padX} ${height + padY * 2}`}
      style={{ overflow: "visible", display: "block" }}
    >
      {/* Flat concentric pulse rings during S5 charge (strictly solid color + low opacity, zero gradient) */}
      {chargePulse > 0 && (
        <>
          <rect
            x={-16 - chargePulse * 14}
            y={bodyY - 16 - chargePulse * 14}
            width={width + 32 + chargePulse * 28}
            height={bodyH + 32 + chargePulse * 28}
            rx={bodyRx + 14}
            fill="none"
            stroke={PALETTE.WHITE}
            strokeWidth={4.5}
            strokeOpacity={0.38 * (1 - chargePulse * 0.4)}
          />
          <rect
            x={-36 - chargePulse * 28}
            y={bodyY - 36 - chargePulse * 28}
            width={width + 72 + chargePulse * 56}
            height={bodyH + 72 + chargePulse * 56}
            rx={bodyRx + 24}
            fill="none"
            stroke={PALETTE.WHITE}
            strokeWidth={3}
            strokeOpacity={0.2 * (1 - chargePulse * 0.45)}
          />
        </>
      )}

      {/* Low-battery amber outer pulse ring when alert is active */}
      {showAlert && (
        <rect
          x={-12 - alertPulse * 10}
          y={bodyY - 12 - alertPulse * 10}
          width={width + 24 + alertPulse * 20}
          height={bodyH + 24 + alertPulse * 20}
          rx={bodyRx + 10}
          fill="none"
          stroke={PALETTE.AMBER}
          strokeWidth={5}
          strokeOpacity={0.15 + alertPulse * 0.55}
        />
      )}

      {/* Top terminal cap */}
      <rect
        x={capX}
        y={0}
        width={capW}
        height={capH + 4}
        rx={Math.round(capH * 0.35)}
        fill={outlineColor}
      />

      {/* Battery body outline */}
      <rect
        x={strokeW / 2}
        y={bodyY}
        width={width - strokeW}
        height={bodyH}
        rx={bodyRx}
        fill="none"
        stroke={outlineColor}
        strokeWidth={strokeW}
      />

      {/* Charge level fill bar */}
      <rect
        x={innerX}
        y={fillY}
        width={innerW}
        height={fillH}
        rx={fillRx}
        fill={fillColor}
      />

      {/* Subtle flat horizontal tick lines etched into empty area for crisp mechanical scale */}
      {[0.25, 0.5, 0.75].map((mark) => {
        const my = innerTop + innerMaxH * (1 - mark);
        return (
          <line
            key={mark}
            x1={innerX + 10}
            y1={my}
            x2={innerX + innerW - 10}
            y2={my}
            stroke={PALETTE.NAVY}
            strokeWidth={4}
            strokeOpacity={0.28}
          />
        );
      })}

      {/* Small pulsing "!" beside battery from f240 */}
      {showAlert && (
        <g
          transform={`translate(${alertOffsetX}, ${bodyY + bodyH * 0.24}) scale(${(
            0.94 +
            alertPulse * 0.14
          ).toFixed(3)})`}
        >
          <circle
            cx={0}
            cy={0}
            r={34}
            fill={PALETTE.AMBER}
            fillOpacity={0.85 + alertPulse * 0.15}
          />
          <text
            x={0}
            y={16}
            textAnchor="middle"
            fontFamily={POPPINS_FONT}
            fontWeight={900}
            fontSize={48}
            fill={PALETTE.NAVY}
          >
            {COPY.s2Alert}
          </text>
        </g>
      )}
    </svg>
  );
};
