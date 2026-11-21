import React from "react";
import { PALETTE } from "../timeline";

export interface AppWindowProps {
  width?: number;
  contentHeight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Calm rounded application window (corner radius 28, soft deep shadow, three subtle window dots).
 */
export const AppWindow: React.FC<AppWindowProps> = ({
  width = 940,
  contentHeight = 840,
  children,
  style,
}) => {
  return (
    <div
      style={{
        width,
        borderRadius: 28,
        backgroundColor: PALETTE.DEEP,
        border: "2px solid rgba(255, 244, 224, 0.14)",
        boxShadow: "0 32px 84px rgba(6, 15, 31, 0.62)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Subtle 3-dot window header bar */}
      <div
        style={{
          height: 44,
          backgroundColor: PALETTE.MIDNIGHT,
          borderBottom: "1px solid rgba(255, 244, 224, 0.09)",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          gap: 10,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: PALETTE.GOLD, opacity: 0.78 }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: PALETTE.CREAM, opacity: 0.45 }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: PALETTE.TEAL, opacity: 0.78 }} />
      </div>

      {/* Viewport */}
      <div
        style={{
          width,
          height: contentHeight,
          position: "relative",
          overflow: "hidden",
          backgroundColor: PALETTE.MIDNIGHT,
        }}
      >
        {children}
      </div>
    </div>
  );
};
