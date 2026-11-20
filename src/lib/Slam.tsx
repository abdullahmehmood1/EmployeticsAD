import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface SlamProps {
  /** Frame (local to current Sequence) at which the slam begins. */
  delay?: number;
  /** Starting scale (spec: 1.7 -> 1). */
  fromScale?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
  /** Optional transformOrigin (e.g. "left center" for left-aligned stacks). */
  origin?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Bold kinetic slam: scale 1.7 -> 1 with spring (damping ~12, stiffness ~180),
 * opacity 0 -> 1 over 3 frames.
 */
export const Slam: React.FC<SlamProps> = ({
  delay = 0,
  fromScale = 1.7,
  damping = 12,
  stiffness = 180,
  mass = 0.85,
  origin = "center center",
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - delay;

  if (rel < 0) {
    return (
      <div style={{ opacity: 0, ...style }}>
        {children}
      </div>
    );
  }

  const spr = spring({
    frame: rel,
    fps,
    config: { damping, stiffness, mass },
  });

  const scale = interpolate(spr, [0, 1], [fromScale, 1]);
  const opacity = interpolate(rel, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: origin,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
