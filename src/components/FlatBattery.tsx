import React from "react";
import { interpolateColors } from "remotion";
import { COLORS, FONTS } from "../theme";

interface FlatBatteryProps {
  /** Battery charge level from 0 to 100 */
  level: number;
  /** Scale multiplier (1.0 = corner icon, 1.8 = hero icon) */
  scale?: number;
  /** Show lightning charging bolt */
  charging?: boolean;
  /** Show numeric percentage readout next to icon */
  showPercent?: boolean;
  /** Subtle pulse when critically low (<15%) */
  pulsePhase?: number;
}

/**
 * Crisp, flat geometric battery icon (NO neon, NO glass).
 * Transitions cleanly: Full Green (#16A34A) <-> Amber (#F59E0B) <-> Empty Red (#DC2626).
 */
export const FlatBattery: React.FC<FlatBatteryProps> = ({
  level,
  scale = 1,
  charging = false,
  showPercent = true,
  pulsePhase = 0,
}) => {
  const clamped = Math.max(0, Math.min(100, level));

  const fillColor = interpolateColors(
    clamped,
    [8, 35, 65, 100],
    [COLORS.batteryRed, COLORS.batteryAmber, COLORS.batteryAmber, COLORS.batteryGreen]
  );

  const isCritical = clamped <= 14 && !charging;
  const criticalAlpha = isCritical ? 0.55 + 0.45 * Math.sin(pulsePhase * 0.35) : 1;

  // 4 flat discrete/smooth energy bars inside crisp rectangular casing
  const innerWidth = 104;
  const fillWidth = (clamped / 100) * innerWidth;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16 * scale,
        opacity: criticalAlpha,
      }}
    >
      <svg
        width={136 * scale}
        height={64 * scale}
        viewBox="0 0 136 64"
        fill="none"
      >
        {/* Flat bold white outer casing */}
        <rect
          x="4"
          y="4"
          width="118"
          height="56"
          rx="10"
          stroke={isCritical ? COLORS.batteryRed : COLORS.white}
          strokeWidth="6"
          fill="rgba(15, 42, 82, 0.5)"
        />
        {/* Positive battery terminal nub */}
        <rect
          x="124"
          y="20"
          width="10"
          height="24"
          rx="4"
          fill={isCritical ? COLORS.batteryRed : COLORS.white}
        />

        {/* Dynamic flat fill bar */}
        <rect
          x="11"
          y="11"
          width={Math.max(6, fillWidth)}
          height="42"
          rx="5"
          fill={fillColor}
        />

        {/* Crisp flat segment dividers for graphic clarity */}
        <line x1="37" y1="11" x2="37" y2="53" stroke={COLORS.navy} strokeWidth="3.5" />
        <line x1="63" y1="11" x2="63" y2="53" stroke={COLORS.navy} strokeWidth="3.5" />
        <line x1="89" y1="11" x2="89" y2="53" stroke={COLORS.navy} strokeWidth="3.5" />

        {/* Flat bold charging bolt when recharging */}
        {charging && (
          <path
            d="M68 13 L50 35 H63 L58 51 L78 29 H65 L68 13 Z"
            fill={COLORS.white}
            stroke={COLORS.navy}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {showPercent && (
        <div
          style={{
            fontFamily: FONTS.heavy,
            fontSize: 34 * scale,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: isCritical ? COLORS.batteryRed : COLORS.white,
            minWidth: 96 * scale,
          }}
        >
          {Math.round(clamped)}%
        </div>
      )}
    </div>
  );
};
