import React, { useMemo } from "react";
import { VIDEO } from "../timeline";
import { INTER_FONT, POPPINS_FONT, SERIF_FONT } from "./fonts";

export type FontKind = "serif" | "sans" | "brand";

export interface FitTextProps {
  text: string;
  children?: React.ReactNode;
  font?: FontKind;
  fontSize: number;
  fontWeight?: 400 | 500 | 600 | 800;
  color: string;
  /** Maximum width in px (defaults to vertical social-safe width 860 px). */
  maxWidth?: number;
  letterSpacing?: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

const FONT_MAP: Record<FontKind, string> = {
  serif: SERIF_FONT,
  sans: INTER_FONT,
  brand: POPPINS_FONT,
};

let measureCanvas: HTMLCanvasElement | null = null;

function measureWidth(
  text: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: number,
  letterSpacing: number
): number {
  if (!text) return 0;
  const tracking = Math.max(0, text.length - 1) * letterSpacing;
  if (typeof document !== "undefined") {
    if (!measureCanvas) {
      measureCanvas = document.createElement("canvas");
    }
    const ctx = measureCanvas.getContext("2d");
    if (ctx) {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      return ctx.measureText(text).width + tracking;
    }
  }
  return text.length * fontSize * 0.56 + tracking;
}

/**
 * Single-line text helper that deterministically shrinks fontSize so any line stays
 * cleanly inside the vertical 9:16 social-safe width (860 px: x = 110..970).
 */
export const FitText: React.FC<FitTextProps> = ({
  text,
  children,
  font = "serif",
  fontSize,
  fontWeight = 400,
  color,
  maxWidth = VIDEO.maxTextWidth,
  letterSpacing = 0,
  lineHeight = 1.12,
  align = "center",
  style,
}) => {
  const fontFamily = FONT_MAP[font];

  const fittedSize = useMemo(() => {
    const measured = measureWidth(text, fontFamily, fontSize, fontWeight, letterSpacing);
    const budget = maxWidth * 0.985;
    if (measured <= budget || measured <= 0) {
      return fontSize;
    }
    return Math.floor(fontSize * (budget / measured) * 10) / 10;
  }, [text, fontFamily, fontSize, fontWeight, letterSpacing, maxWidth]);

  return (
    <div
      style={{
        fontFamily,
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
