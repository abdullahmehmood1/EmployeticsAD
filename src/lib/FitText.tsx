import React, { useMemo } from "react";
import { VIDEO } from "../timeline";
import { POPPINS_FONT } from "./fonts";

export interface FitTextProps {
  /** Text string to measure (and render if children is omitted). */
  text: string;
  /** Optional custom inline content (e.g. highlighted word or typed substring) sized using `text`. */
  children?: React.ReactNode;
  /** Target font size in px; auto-shrunk if `text` exceeds `maxWidth`. */
  fontSize: number;
  fontWeight?: 400 | 500 | 700 | 800 | 900;
  color: string;
  /** Maximum allowed line width in px (defaults to safe box width 1620 px). */
  maxWidth?: number;
  letterSpacing?: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

let measureCanvas: HTMLCanvasElement | null = null;

function measureLineWidthPx(
  text: string,
  fontSize: number,
  fontWeight: number,
  letterSpacing: number
): number {
  if (!text) return 0;
  const extraTracking = Math.max(0, text.length - 1) * letterSpacing;

  if (typeof document !== "undefined") {
    if (!measureCanvas) {
      measureCanvas = document.createElement("canvas");
    }
    const ctx = measureCanvas.getContext("2d");
    if (ctx) {
      ctx.font = `${fontWeight} ${fontSize}px ${POPPINS_FONT}`;
      const metrics = ctx.measureText(text);
      return metrics.width + extraTracking;
    }
  }

  // Deterministic fallback heuristic when canvas is unavailable
  return text.length * fontSize * 0.62 + extraTracking;
}

/**
 * Single-line kinetic typography primitive that deterministically shrinks fontSize
 * so any headline or tagline is guaranteed to fit inside `maxWidth` (default 1620 px).
 */
export const FitText: React.FC<FitTextProps> = ({
  text,
  children,
  fontSize,
  fontWeight = 900,
  color,
  maxWidth = VIDEO.maxTextWidth,
  letterSpacing = 0,
  lineHeight = 1.04,
  align = "center",
  style,
}) => {
  const fittedSize = useMemo(() => {
    const measured = measureLineWidthPx(text, fontSize, fontWeight, letterSpacing);
    const budget = maxWidth * 0.985;
    if (measured <= budget || measured <= 0) {
      return fontSize;
    }
    return Math.floor((fontSize * (budget / measured)) * 10) / 10;
  }, [text, fontSize, fontWeight, letterSpacing, maxWidth]);

  return (
    <div
      style={{
        fontFamily: POPPINS_FONT,
        fontSize: fittedSize,
        fontWeight,
        color,
        letterSpacing: `${letterSpacing}px`,
        lineHeight,
        textAlign: align,
        whiteSpace: "nowrap",
        maxWidth,
        ...style,
      }}
    >
      {children ?? text}
    </div>
  );
};
