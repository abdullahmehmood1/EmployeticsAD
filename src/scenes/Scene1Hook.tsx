import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText } from "../lib/FitText";
import { Shake } from "../lib/Shake";
import { Slam } from "../lib/Slam";

/**
 * S1 HOOK (f0-89): Pure black.
 * f6: "YOUR BEST EMPLOYEE" slams in (white, Poppins 900, ~130 px) with shake.
 * f36: "JUST QUIT." slams below in AMBER, bigger, stronger shake.
 * f80-89: hard cut to black.
 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = TIMELINE.S1;

  const line1At = s1.line1Slam - s1.start; // 6
  const line2At = s1.line2Slam - s1.start; // 36
  const hardCutAt = s1.hardCut - s1.start; // 80

  const isHardCut = frame >= hardCutAt;

  // Continuous subtle push-in drift so no frame is ever static
  const driftScale = interpolate(frame, [0, hardCutAt], [0.99, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Expanding flat impact shockwave ring on "JUST QUIT." (strictly AMBER, no gradients)
  const hit2Rel = frame - line2At;
  const shockScale = interpolate(hit2Rel, [0, 20], [0.35, 1.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockOpacity = interpolate(hit2Rel, [0, 3, 20], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle ambient flat geometric pulse behind hook
  const ambientR = 310 + Math.sin(frame * 0.14) * 14;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.BLACK, overflow: "hidden" }}>
      {!isHardCut && (
        <Shake
          hits={[
            { at: line1At, amplitude: 8, duration: 10 },
            { at: line2At, amplitude: 16, duration: 12 },
          ]}
        >
          {/* Minimal flat ambient geometric ring for subtle living motion */}
          <svg
            width={VIDEO.width}
            height={VIDEO.height}
            viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <circle
              cx={VIDEO.width / 2}
              cy={VIDEO.height / 2}
              r={ambientR}
              fill="none"
              stroke={PALETTE.WHITE}
              strokeWidth={1.5}
              strokeOpacity={0.07}
            />
            {hit2Rel >= 0 && shockOpacity > 0.005 && (
              <circle
                cx={VIDEO.width / 2}
                cy={VIDEO.height / 2 + 95}
                r={320 * shockScale}
                fill="none"
                stroke={PALETTE.AMBER}
                strokeWidth={5}
                strokeOpacity={shockOpacity}
              />
            )}
          </svg>

          {/* Safe-area centered kinetic headline stack */}
          <AbsoluteFill
            style={{
              padding: VIDEO.safeMargin,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              transform: `scale(${driftScale.toFixed(4)})`,
            }}
          >
            <Slam delay={line1At} fromScale={1.7} damping={12} stiffness={180}>
              <FitText
                text={COPY.s1Line1}
                fontSize={128}
                fontWeight={900}
                color={PALETTE.WHITE}
                maxWidth={VIDEO.maxTextWidth}
                letterSpacing={-1.5}
              />
            </Slam>

            <Slam delay={line2At} fromScale={1.85} damping={11} stiffness={195}>
              <FitText
                text={COPY.s1Line2}
                fontSize={202}
                fontWeight={900}
                color={PALETTE.AMBER}
                maxWidth={VIDEO.maxTextWidth}
                letterSpacing={-2.5}
              />
            </Slam>
          </AbsoluteFill>
        </Shake>
      )}
    </AbsoluteFill>
  );
};
