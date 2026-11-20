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

interface BackgroundProps {
  transparent?: boolean;
}

/**
 * 100% Pure Deterministic SVG + CSS Background (ZERO WebGL canvas / ZERO useEffect races / ZERO blinking).
 * When `transparent` is true, the NVIDIA CUDA GPU Shader & Bloom Compositor supplies the liquid aurora
 * background on GPU while this component renders only the crisp vector telemetry particles & dot-grid!
 */
export const Background: React.FC<BackgroundProps> = ({ transparent = false }) => {
  const frame = useCurrentFrame();

  const primaryGlow = interpolateColors(
    frame,
    [0, 480, 600, 1140, 1500, 1860, 2060, 2140, 2400],
    [
      "rgba(244, 63, 94, 0.22)",
      "rgba(244, 63, 94, 0.26)",
      "rgba(99, 102, 241, 0.28)",
      "rgba(6, 182, 212, 0.28)",
      "rgba(16, 185, 129, 0.26)",
      "rgba(16, 185, 129, 0.30)",
      "rgba(52, 211, 153, 0.26)",
      "rgba(99, 102, 241, 0.32)",
      "rgba(99, 102, 241, 0.26)",
    ]
  );

  const secondaryGlow = interpolateColors(
    frame,
    [0, 520, 620, 1140, 1560, 1860, 2120, 2400],
    [
      "rgba(6, 182, 212, 0.14)",
      "rgba(245, 158, 11, 0.16)",
      "rgba(6, 182, 212, 0.22)",
      "rgba(99, 102, 241, 0.22)",
      "rgba(6, 182, 212, 0.24)",
      "rgba(6, 182, 212, 0.22)",
      "rgba(34, 211, 238, 0.28)",
      "rgba(139, 92, 246, 0.22)",
    ]
  );

  const orb1X = 28 + Math.sin(frame * 0.006) * 10;
  const orb1Y = 26 + Math.cos(frame * 0.005) * 8;
  const orb2X = 74 + Math.cos(frame * 0.0055) * 10;
  const orb2Y = 72 + Math.sin(frame * 0.0065) * 9;

  const gridOffsetX = (frame * 0.4) % 48;
  const gridOffsetY = (frame * 0.22) % 48;

  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 42; i++) {
      const seed = (i + 1) * 137.508;
      list.push({
        id: i,
        x: (Math.sin(seed) * 0.5 + 0.5) * 1920,
        y: (Math.cos(seed * 1.7) * 0.5 + 0.5) * 1080,
        size: 1.4 + (i % 4) * 0.85,
        speedY: -0.3 - (i % 5) * 0.14,
        speedX: ((i % 3) - 1) * 0.14,
        phase: i * 0.7,
        opacity: 0.14 + (i % 4) * 0.08,
      });
    }
    return list;
  }, []);

  const gridOpacity = interpolate(frame, [0, 60, 2100, 2220], [0.22, 0.3, 0.26, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : COLORS.bgDeep,
        overflow: "hidden",
      }}
    >
      {!transparent && (
        <>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 110% 85% at 50% 0%, #0F172A 0%, #060916 58%, #03050C 100%)",
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle 760px at ${orb1X}% ${orb1Y}%, ${primaryGlow} 0%, transparent 72%)`,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle 700px at ${orb2X}% ${orb2Y}%, ${secondaryGlow} 0%, transparent 72%)`,
            }}
          />
        </>
      )}

      {/* Precision technical dot-grid with smooth parallax */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "radial-gradient(rgba(148, 163, 184, 0.30) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
          maskImage:
            "radial-gradient(ellipse 82% 78% at 50% 50%, black 22%, transparent 94%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 82% 78% at 50% 50%, black 22%, transparent 94%)",
        }}
      />

      {/* Deterministic vector floating telemetry particles */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {particles.map((p) => {
          const px = (((p.x + frame * p.speedX) % 1920) + 1920) % 1920;
          const py = (((p.y + frame * p.speedY) % 1080) + 1080) % 1080;
          const twinkle = 0.65 + 0.35 * Math.sin(frame * 0.045 + p.phase);
          return (
            <circle
              key={p.id}
              cx={px}
              cy={py}
              r={p.size}
              fill={p.id % 3 === 0 ? "#22D3EE" : p.id % 3 === 1 ? "#A5B4FC" : "#F8FAFC"}
              opacity={p.opacity * twinkle}
            />
          );
        })}
      </svg>

      {!transparent && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 82% 82% at 50% 50%, transparent 52%, rgba(2, 4, 10, 0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
