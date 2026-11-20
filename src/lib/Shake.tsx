import React from "react";
import { useCurrentFrame } from "remotion";

export interface ShakeHit {
  /** Local frame when impact shake starts. */
  at: number;
  /** Peak amplitude in px (spec default: 8 px). */
  amplitude?: number;
  /** Decay duration in frames (spec default: 10 frames). */
  duration?: number;
}

export interface ShakeProps {
  hits: ShakeHit[];
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Deterministic sin-based decaying screen-shake wrapper.
 * Sums active hits cleanly so multiple slams in one scene all shake reliably.
 */
export const Shake: React.FC<ShakeProps> = ({ hits, children, style }) => {
  const frame = useCurrentFrame();

  let dx = 0;
  let dy = 0;

  for (const hit of hits) {
    const rel = frame - hit.at;
    const dur = hit.duration ?? 10;
    const amp = hit.amplitude ?? 8;
    if (rel >= 0 && rel < dur) {
      const decay = 1 - rel / dur;
      const env = decay * decay;
      dx += Math.sin(rel * 2.85 + hit.at * 0.7) * amp * env;
      dy += Math.cos(rel * 3.45 + hit.at * 1.1) * amp * 0.72 * env;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: dx !== 0 || dy !== 0 ? `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
