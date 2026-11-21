import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VIDEO } from "../timeline";
import { POPPINS_FONT } from "./fonts";

export interface FitTextProps {
  text: string;
  children?: React.ReactNode;
  fontSize: number;
  fontWeight?: 400 | 500 | 700 | 800 | 900;
  color: string;
  /** Maximum allowed line width in px (defaults to square safe width 900 px). */
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
      return ctx.measureText(text).width + extraTracking;
    }
  }

  return text.length * fontSize * 0.62 + extraTracking;
}

/**
 * Single-line typography helper that auto-shrinks fontSize so any line fits cleanly
 * inside `maxWidth` (default 900 px for 1080x1080 square with 90 px safe margin).
 */
export const FitText: React.FC<FitTextProps> = ({
  text,
  children,
  fontSize,
  fontWeight = 900,
  color,
  maxWidth = VIDEO.maxTextWidth,
  letterSpacing = 0,
  lineHeight = 1.06,
  align = "center",
  style,
}) => {
  const fittedSize = useMemo(() => {
    const measured = measureLineWidthPx(text, fontSize, fontWeight, letterSpacing);
    const budget = maxWidth * 0.985;
    if (measured <= budget || measured <= 0) {
      return fontSize;
    }
    return Math.floor(fontSize * (budget / measured) * 10) / 10;
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

export interface SoftPopProps {
  /** Local frame when line gently pops in (scale 0.6 -> 1.05 -> 1, soft bouncy spring). */
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Friendly bouncy pop entrance (NO slams, NO shake): soft spring with subtle overshoot
 * (scale 0.6 -> ~1.05 -> 1).
 */
export const SoftPop: React.FC<SoftPopProps> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - delay;

  if (rel < 0) {
    return <div style={{ opacity: 0, ...style }}>{children}</div>;
  }

  const spr = spring({
    frame: rel,
    fps,
    config: { damping: 11, stiffness: 165, mass: 0.85 },
  });
  const scale = interpolate(spr, [0, 1], [0.6, 1]);
  const translateY = interpolate(spr, [0, 1], [18, 0]);
  const opacity = interpolate(rel, [0, 4], [0.45, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(4)})`,
        transformOrigin: "center center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
