import React, { useMemo } from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

interface BackgroundProps {
  transparent?: boolean;
}

/**
 * Warm Sunlit Editorial Background (100% pure deterministic SVG/CSS — zero blinking!).
 * When `transparent` is true, the NVIDIA CUDA GPU Sunlit Watercolor Shader composites underneath,
 * while this layer supplies delicate organic editorial botanical arcs & floating sun-motes.
 */
export const Background: React.FC<BackgroundProps> = ({ transparent = false }) => {
  const frame = useCurrentFrame();

  const warmWash1 = interpolateColors(
    frame,
    [0, 500, 620, 1200, 1860, 2120, 2400],
    [
      "rgba(234, 88, 12, 0.14)",   // Scene 1: Warm Terracotta Dusk
      "rgba(217, 72, 38, 0.18)",
      "rgba(217, 119, 6, 0.14)",   // Scene 2: Sunlit Amber Clarity
      "rgba(21, 128, 61, 0.14)",   // Scene 3: Private Botanical Sage
      "rgba(22, 163, 74, 0.17)",   // Scene 4: Breathing Sanctuary Mint
      "rgba(217, 119, 6, 0.15)",   // Scene 5: Golden Editorial Resolve
      "rgba(21, 128, 61, 0.14)",
    ]
  );

  const warmWash2 = interpolateColors(
    frame,
    [0, 540, 1200, 1860, 2100, 2400],
    [
      "rgba(251, 191, 36, 0.14)",
      "rgba(21, 128, 61, 0.11)",
      "rgba(20, 83, 45, 0.12)",
      "rgba(253, 230, 138, 0.22)",
      "rgba(21, 128, 61, 0.15)",
      "rgba(251, 191, 36, 0.16)",
    ]
  );

  const orb1X = 22 + Math.sin(frame * 0.005) * 9;
  const orb1Y = 20 + Math.cos(frame * 0.0045) * 8;
  const orb2X = 80 + Math.cos(frame * 0.005) * 9;
  const orb2Y = 78 + Math.sin(frame * 0.0055) * 8;

  const motes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      const seed = (i + 3) * 97.31;
      arr.push({
        id: i,
        x: (Math.sin(seed) * 0.5 + 0.5) * 1920,
        y: (Math.cos(seed * 1.4) * 0.5 + 0.5) * 1080,
        r: 2 + (i % 4) * 1.1,
        vy: -0.22 - (i % 4) * 0.09,
        vx: ((i % 3) - 1) * 0.1,
        phase: i * 0.85,
      });
    }
    return arr;
  }, []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : COLORS.canvasLight,
        overflow: "hidden",
      }}
    >
      {!transparent && (
        <>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(155deg, #FCF9F4 0%, #F6EFE4 55%, #EFE6D8 100%)",
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle 820px at ${orb1X}% ${orb1Y}%, ${warmWash1} 0%, transparent 72%)`,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle 780px at ${orb2X}% ${orb2Y}%, ${warmWash2} 0%, transparent 72%)`,
            }}
          />
        </>
      )}

      {/* Subtle architectural editorial hairlines & sweeping organic ribbon curves */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        fill="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Soft flowing botanical wave lines */}
        <path
          d={`M -80 ${220 + Math.sin(frame * 0.015) * 28} C 480 ${120 - Math.cos(frame * 0.012) * 35}, 1260 ${340 + Math.sin(frame * 0.014) * 30}, 2000 ${190 + Math.cos(frame * 0.011) * 24}`}
          stroke="rgba(28, 25, 23, 0.055)"
          strokeWidth="1.5"
        />
        <path
          d={`M -80 ${860 - Math.cos(frame * 0.013) * 26} C 560 ${960 + Math.sin(frame * 0.015) * 32}, 1340 ${740 - Math.cos(frame * 0.012) * 28}, 2000 ${880 + Math.sin(frame * 0.014) * 22}`}
          stroke="rgba(21, 128, 61, 0.075)"
          strokeWidth="1.5"
        />

        {/* Delicate editorial margin frame ticks */}
        <line x1="64" y1="48" x2="96" y2="48" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="64" y1="48" x2="64" y2="80" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="1856" y1="48" x2="1824" y2="48" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="1856" y1="48" x2="1856" y2="80" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="64" y1="1032" x2="96" y2="1032" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="64" y1="1032" x2="64" y2="1000" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="1856" y1="1032" x2="1824" y2="1032" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />
        <line x1="1856" y1="1032" x2="1856" y2="1000" stroke="rgba(28, 25, 23, 0.16)" strokeWidth="1.5" />

        {/* Warm floating dust motes */}
        {motes.map((m) => {
          const x = (((m.x + frame * m.vx) % 1920) + 1920) % 1920;
          const y = (((m.y + frame * m.vy) % 1080) + 1080) % 1080;
          const op = (0.14 + 0.12 * Math.sin(frame * 0.04 + m.phase)) * 0.85;
          return (
            <circle
              key={m.id}
              cx={x}
              cy={y}
              r={m.r}
              fill={m.id % 2 === 0 ? "#D97706" : "#15803D"}
              opacity={op}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
