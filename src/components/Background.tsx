import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  phase: number;
  opacity: number;
}

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Smooth narrative color mood evolution across 2400 frames (40s)
  // 0-540: Crimson/Dark tension -> 540-960: Indigo/Cyan reveal -> 960-1440: Indigo/Amber focus
  // -> 1440-1860: Cyan/Violet AI -> 1860-2100: Emerald transformation -> 2100-2400: Brand Indigo/Cyan bloom
  const primaryGlow = interpolateColors(
    frame,
    [0, 480, 600, 960, 1440, 1860, 2020, 2140, 2400],
    [
      "rgba(244, 63, 94, 0.20)",
      "rgba(244, 63, 94, 0.24)",
      "rgba(99, 102, 241, 0.28)",
      "rgba(99, 102, 241, 0.26)",
      "rgba(6, 182, 212, 0.26)",
      "rgba(16, 185, 129, 0.25)",
      "rgba(16, 185, 129, 0.28)",
      "rgba(99, 102, 241, 0.34)",
      "rgba(99, 102, 241, 0.26)",
    ]
  );

  const secondaryGlow = interpolateColors(
    frame,
    [0, 520, 620, 1000, 1440, 1860, 2100, 2400],
    [
      "rgba(99, 102, 241, 0.10)",
      "rgba(245, 158, 11, 0.14)",
      "rgba(6, 182, 212, 0.22)",
      "rgba(244, 63, 94, 0.16)",
      "rgba(139, 92, 246, 0.24)",
      "rgba(6, 182, 212, 0.22)",
      "rgba(6, 182, 212, 0.28)",
      "rgba(139, 92, 246, 0.22)",
    ]
  );

  // Subtle organic aurora drift
  const orb1X = 28 + Math.sin(frame * 0.006) * 10;
  const orb1Y = 26 + Math.cos(frame * 0.005) * 8;
  const orb2X = 74 + Math.cos(frame * 0.0055) * 10;
  const orb2Y = 72 + Math.sin(frame * 0.0065) * 9;

  // Parallax grid motion
  const gridOffsetX = (frame * 0.35) % 48;
  const gridOffsetY = (frame * 0.2) % 48;

  // Deterministic floating particles
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 36; i++) {
      const seed = (i + 1) * 137.508;
      list.push({
        id: i,
        x: (Math.sin(seed) * 0.5 + 0.5) * 1920,
        y: (Math.cos(seed * 1.7) * 0.5 + 0.5) * 1080,
        size: 1.5 + (i % 4) * 0.9,
        speedY: -0.25 - (i % 5) * 0.12,
        speedX: ((i % 3) - 1) * 0.12,
        phase: i * 0.7,
        opacity: 0.14 + (i % 4) * 0.09,
      });
    }
    return list;
  }, []);

  const gridOpacity = interpolate(frame, [0, 60, 2100, 2220], [0.22, 0.3, 0.28, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        overflow: "hidden",
      }}
    >
      {/* Deep vertical tone base */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 110% 85% at 50% 0%, #0F172A 0%, #060916 58%, #03050C 100%)",
        }}
      />

      {/* Primary dynamic aurora */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 760px at ${orb1X}% ${orb1Y}%, ${primaryGlow} 0%, transparent 72%)`,
          filter: "blur(30px)",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      {/* Secondary dynamic aurora */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 700px at ${orb2X}% ${orb2Y}%, ${secondaryGlow} 0%, transparent 72%)`,
          filter: "blur(36px)",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      {/* Fine precision technical dot-grid */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "radial-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
          maskImage:
            "radial-gradient(ellipse 80% 75% at 50% 50%, black 25%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 75% at 50% 50%, black 25%, transparent 95%)",
        }}
      />

      {/* Floating ambient telemetry motes */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {particles.map((p) => {
          const px = (((p.x + frame * p.speedX) % 1920) + 1920) % 1920;
          const py = (((p.y + frame * p.speedY) % 1080) + 1080) % 1080;
          const twinkle = 0.65 + 0.35 * Math.sin(frame * 0.04 + p.phase);
          return (
            <circle
              key={p.id}
              cx={px}
              cy={py}
              r={p.size}
              fill={p.id % 3 === 0 ? "#22D3EE" : "#A5B4FC"}
              opacity={p.opacity * twinkle}
            />
          );
        })}
      </svg>

      {/* Subtle cinematic vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 82% 82% at 50% 50%, transparent 52%, rgba(2, 4, 10, 0.72) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
