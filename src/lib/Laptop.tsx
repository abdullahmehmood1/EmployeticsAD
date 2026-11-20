import React from "react";
import { PALETTE } from "../timeline";

export const LAPTOP_METRICS = {
  screenWidth: 980,
  screenHeight: 551, // 16:9
  bezelX: 24,
  bezelTop: 26,
  bezelBottom: 24,
  baseWidth: 1148,
  baseHeight: 26,
} as const;

export const LAPTOP_LID_W = LAPTOP_METRICS.screenWidth + LAPTOP_METRICS.bezelX * 2; // 1028
export const LAPTOP_LID_H =
  LAPTOP_METRICS.screenHeight + LAPTOP_METRICS.bezelTop + LAPTOP_METRICS.bezelBottom; // 601

export interface LaptopProps {
  /** Y-axis rotation in degrees (35 -> 0 during slide-in). */
  rotateYDeg?: number;
  children: React.ReactNode;
}

/**
 * Clean flat vector laptop (rounded dark bezel, simple flat base, zero brand marks).
 * Uses ONLY PALETTE colors (BLACK, WHITE, NAVY) with subtle opacity trim.
 */
export const Laptop: React.FC<LaptopProps> = ({ rotateYDeg = 0, children }) => {
  const { screenWidth, screenHeight, bezelX, bezelTop, bezelBottom, baseWidth, baseHeight } =
    LAPTOP_METRICS;

  return (
    <div
      style={{
        perspective: 1800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `rotateY(${rotateYDeg.toFixed(2)}deg)`,
          transformStyle: "preserve-3d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Lid / rounded dark bezel */}
        <div
          style={{
            width: LAPTOP_LID_W,
            height: LAPTOP_LID_H,
            backgroundColor: PALETTE.BLACK,
            borderRadius: "24px 24px 8px 8px",
            border: "3px solid rgba(255, 255, 255, 0.22)",
            boxSizing: "border-box",
            padding: `${bezelTop}px ${bezelX}px ${bezelBottom}px ${bezelX}px`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Minimal webcam dot */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.26)",
            }}
          />

          {/* 16:9 Screen viewport */}
          <div
            style={{
              width: screenWidth,
              height: screenHeight,
              borderRadius: 6,
              overflow: "hidden",
              position: "relative",
              backgroundColor: PALETTE.NAVY,
            }}
          >
            {children}
          </div>
        </div>

        {/* Simple flat base deck */}
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            backgroundColor: PALETTE.WHITE,
            borderRadius: "3px 3px 16px 16px",
            position: "relative",
            marginTop: -1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Subtle lid-lift notch */}
          <div
            style={{
              width: 136,
              height: 8,
              backgroundColor: PALETTE.NAVY,
              borderRadius: "0 0 8px 8px",
              opacity: 0.35,
            }}
          />
        </div>
      </div>
    </div>
  );
};
