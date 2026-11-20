import React from "react";
import { COLORS } from "../theme";

interface PaperCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  showTopRibbon?: boolean;
  padding?: number | string;
  radius?: number;
}

/**
 * Tactile Warm Editorial Ceramic/Paper Card — completely distinct from dark neon glassmorphism.
 */
export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  style,
  accentColor = COLORS.sage,
  showTopRibbon = false,
  padding = 32,
  radius = 28,
}) => {
  return (
    <div
      style={{
        position: "relative",
        backgroundColor: COLORS.paperCard,
        borderRadius: radius,
        border: `1.5px solid ${COLORS.borderHairline}`,
        boxShadow:
          "0 28px 64px rgba(28, 25, 23, 0.085), 0 4px 14px rgba(28, 25, 23, 0.04)",
        padding,
        overflow: "hidden",
        ...style,
      }}
    >
      {showTopRibbon && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: accentColor,
          }}
        />
      )}
      {children}
    </div>
  );
};
