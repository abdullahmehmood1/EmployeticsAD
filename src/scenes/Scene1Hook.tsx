import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS, getImpactShake } from "../theme";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1 slam at frame 10 (0.17s): "YOUR BEST EMPLOYEE"
  const line1Hit = 10;
  const line1In = spring({
    frame: Math.max(0, frame - line1Hit),
    fps,
    config: { damping: 12, stiffness: 280, mass: 0.7 },
  });
  const line1Scale = interpolate(line1In, [0, 1], [1.9, 1]);

  // Line 2 HEAVY slam at frame 82 (1.37s): "JUST QUIT."
  const line2Hit = 82;
  const line2In = spring({
    frame: Math.max(0, frame - line2Hit),
    fps,
    config: { damping: 11, stiffness: 320, mass: 0.75 },
  });
  const line2Scale = interpolate(line2In, [0, 1], [2.4, 1]);

  // Combine damped impact screen-shakes
  const shake1 = getImpactShake(frame, line1Hit, 12, 14);
  const shake2 = getImpactShake(frame, line2Hit, 26, 22);
  const sx = shake1.x + shake2.x;
  const sy = shake1.y + shake2.y;
  const srot = shake1.rot + shake2.rot;

  // Brief 2-frame impact flash on "JUST QUIT."
  const impactFlash = interpolate(frame, [line2Hit, line2Hit + 2, line2Hit + 9], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Amber kinetic accent bar snaps outward on heavy hit
  const barWidth = interpolate(frame, [line2Hit, line2Hit + 16], [0, 820], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  // Fast crisp geometric wipe to Deep Navy at end of Hook (frames 166-180)
  const wipePct = interpolate(frame, [166, 180], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, overflow: "hidden" }}>
      {/* Impact kinetic container with screen-shake */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${sx}px, ${sy}px) rotate(${srot}deg)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          {/* Line 1: YOUR BEST EMPLOYEE */}
          {frame >= line1Hit && (
            <div
              style={{
                fontFamily: FONTS.heavy,
                fontSize: 112,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: COLORS.white,
                lineHeight: 1.0,
                transform: `scale(${line1Scale})`,
                opacity: Math.min(1, line1In * 2.2),
              }}
            >
              YOUR BEST EMPLOYEE
            </div>
          )}

          {/* Line 2: JUST QUIT. */}
          {frame >= line2Hit && (
            <div
              style={{
                fontFamily: FONTS.heavy,
                fontSize: 210,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                color: COLORS.white,
                lineHeight: 0.94,
                transform: `scale(${line2Scale})`,
                opacity: Math.min(1, line2In * 2.5),
              }}
            >
              JUST QUIT<span style={{ color: COLORS.amber }}>.</span>
            </div>
          )}

          {/* Sharp Amber Accent Impact Bar */}
          {frame >= line2Hit && (
            <div
              style={{
                width: barWidth,
                height: 12,
                backgroundColor: COLORS.amber,
                marginTop: 14,
              }}
            />
          )}
        </div>
      </AbsoluteFill>

      {/* Brief punchy white/amber impact flash */}
      {impactFlash > 0.01 && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.amber,
            opacity: impactFlash,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Fast Amber-Edged Wipe into Scene 2 Deep Navy */}
      {wipePct > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.amber,
              transform: `translateX(${100 - Math.min(100, wipePct * 1.15)}%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.navy,
              transform: `translateX(${100 - wipePct}%)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
