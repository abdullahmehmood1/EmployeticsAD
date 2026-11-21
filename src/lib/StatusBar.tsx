import React from "react";
import { PALETTE, VIDEO } from "../timeline";
import { Battery } from "./Battery";
import { INTER_FONT } from "./fonts";

export interface StatusBarProps {
  /** Time string from allowed list: "9:02 PM", "11:48 PM", "10:15 PM", "9:00 AM". */
  time: string;
  /** Optional day label in status bar (e.g. "SUN" on Sunday morning). */
  dayPrefix?: string;
  /** Battery level 0..100. */
  batteryPercent: number;
  charging?: boolean;
  batteryPulse?: number;
  /** Ink color (CREAM at night, smoothly transitioning to NAVY in dawn). */
  inkColor?: string;
  opacity?: number;
}

/**
 * Clean first-person phone status bar nestled inside the social-safe top edge (y=250).
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  time,
  dayPrefix,
  batteryPercent,
  charging = false,
  batteryPulse = 0,
  inkColor = PALETTE.CREAM,
  opacity = 1,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: VIDEO.safeTop,
        left: VIDEO.safeLeft,
        right: VIDEO.width - VIDEO.safeRight,
        height: 56,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        opacity,
      }}
    >
      {/* Left: Time (plus optional SUN prefix) */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          fontFamily: INTER_FONT,
          fontWeight: 600,
          color: inkColor,
        }}
      >
        {dayPrefix && (
          <span style={{ fontSize: 24, letterSpacing: "2px", opacity: 0.8 }}>{dayPrefix}</span>
        )}
        <span style={{ fontSize: 30, letterSpacing: "-0.3px" }}>{time}</span>
      </div>

      {/* Right: Signal bars + Battery icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* Minimalist 4-bar signal graphic */}
        <svg width={28} height={22} viewBox="0 0 28 22" style={{ display: "block" }}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 7}
              y={14 - i * 4}
              width={4.5}
              height={8 + i * 4}
              rx={2}
              fill={inkColor}
              fillOpacity={i < 3 ? 0.88 : 0.35}
            />
          ))}
        </svg>

        <Battery
          percent={batteryPercent}
          outlineColor={inkColor}
          charging={charging}
          pulse={batteryPulse}
        />
      </div>
    </div>
  );
};
