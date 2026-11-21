import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText, SoftPop } from "../lib/FitText";
import { ISO_TILE_SIZE, WORKER_SLOTS, iso } from "../lib/iso";
import { DustPuffSpec, FlyingBlockSpec, IsometricOffice } from "../lib/IsometricOffice";

const BLOCK_ACCENTS: readonly ("white" | "amber" | "coral" | "sky")[] = [
  "coral",
  "amber",
  "coral",
  "white",
  "amber",
];

// Deterministic confetti & sparkle particle seeds (strictly palette colors!)
const CONFETTI = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.14;
  const dist = 175 + ((i * 53) % 210);
  const colors = [PALETTE.GREEN, PALETTE.AMBER, PALETTE.CORAL, PALETTE.SKY_DEEP, PALETTE.NAVY_LIGHT];
  return {
    id: i,
    angle,
    dist,
    color: colors[i % colors.length],
    isStar: i % 3 === 0,
    size: 7 + (i % 4) * 2.5,
    delay: (i % 5) * 2,
  };
});

const SPARKLES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  angle: (i / 12) * Math.PI * 2,
  dist: 34 + (i % 3) * 18,
  color: i % 2 === 0 ? PALETTE.GREEN : PALETTE.AMBER,
  size: i % 2 === 0 ? 7 : 5,
}));

/**
 * S5 THE FIX (f660-1019): Warm SAND office returns at full size.
 * f680-760: small paper blocks lift off desk #3, fly along parabolic arcs & land on desk #5 with dust puffs.
 * f760-840: heart #3 refills CORAL -> AMBER -> GREEN with a sparkle burst.
 * f850-900: all 6 workers bounce happily together with stars & pastel confetti circles.
 * f700: "BALANCE THE WORK." then f780: "BEFORE BURNOUT." with a GREEN underline sweeping in.
 * f1000-1019: whole scene shrinks smoothly into a rounded square at the center over SKY.
 */
export const Scene5Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s5 = TIMELINE.S5;
  const globalFrame = s5.start + frame;

  const line1At = s5.line1In - s5.start; // 40
  const refillStart = s5.refillStart - s5.start; // 100
  const refillEnd = s5.refillEnd - s5.start; // 180
  const line2At = s5.line2In - s5.start; // 120
  const underlineStart = s5.underlineStart - s5.start; // 132
  const underlineEnd = s5.underlineEnd - s5.start; // 162
  const celebStart = s5.celebrateStart - s5.start; // 190
  const celebEnd = s5.celebrateEnd - s5.start; // 240
  const shrinkStart = s5.shrinkStart - s5.start; // 340
  const shrinkEnd = s5.shrinkEnd - s5.start; // 359

  // Smooth spring return of office to full size from bottom-left
  const returnSpr = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 155, mass: 0.85 },
  });
  const officeScale = interpolate(returnSpr, [0, 1], [0.46, 1.0]);
  const officeOriginX = interpolate(returnSpr, [0, 1], [255, 462]);
  const officeOriginY = interpolate(returnSpr, [0, 1], [760, 472]);

  // Compute flying paper blocks, desk stack counts, and landing dust puffs
  const flyingBlocks: FlyingBlockSpec[] = [];
  const dustPuffs: DustPuffSpec[] = [];
  let departedCount = 0;
  let landedCount = 0;

  s5.blockFlights.forEach((flight, idx) => {
    const dep = flight.depart - s5.start;
    const land = flight.land - s5.start;
    if (frame >= dep) departedCount++;
    if (frame >= land) {
      landedCount++;
      const puffRel = frame - land;
      if (puffRel >= 0 && puffRel < 16) {
        dustPuffs.push({
          id: idx,
          progress: puffRel / 16,
          stackIdx: idx,
        });
      }
    } else if (frame >= dep && frame < land) {
      const p = interpolate(frame, [dep, land], [0, 1], {
        easing: Easing.inOut(Easing.sin),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      flyingBlocks.push({
        id: idx,
        progress: p,
        targetStackIdx: idx,
        accent: BLOCK_ACCENTS[idx % BLOCK_ACCENTS.length],
      });
    }
  });

  // Desk #3 drops from 7 -> 3; Desk #5 rises smoothly from 0 -> 3 (visually calm, balanced stacks!)
  const paperCounts = WORKER_SLOTS.map((w) => {
    if (w.index === 3) return Math.max(3, 7 - departedCount);
    if (w.index === 5) return Math.min(3, landedCount);
    return w.basePapers;
  });

  // Heart #3 refills smoothly 0.24 -> 1.0 (CORAL -> AMBER -> GREEN) across f760-840
  const heart3Level = interpolate(frame, [refillStart, refillEnd], [0.24, 1.0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heartLevels = [1, 1, 1, heart3Level, 1, 1];

  // Sparkle burst around Heart #3 as it finishes refilling (f795-855)
  const [h3x, h3y] = iso(WORKER_SLOTS[3].x - 0.04, WORKER_SLOTS[3].y - 0.42, 102, ISO_TILE_SIZE);
  const sparkleRel = frame - (refillEnd - 22); // starts slightly before full & peaks right at 100%
  const sparkleProgress = interpolate(sparkleRel, [0, 38], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sparkleOpacity = interpolate(sparkleRel, [0, 6, 26, 38], [0, 1, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Celebratory synchronized team bounces (f850-900) with gentle residual happy hop
  const workerBounces = WORKER_SLOTS.map((slot) => {
    const waveStart = celebStart + slot.index * 3;
    const rel = frame - waveStart;
    if (rel < 0 || frame > celebEnd + 22) return 0;
    const damp = interpolate(frame, [celebEnd, celebEnd + 22], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.abs(Math.sin(rel * 0.32)) * 22 * damp;
  });

  // Confetti & small stars popping across office at f850-930
  const confRel = frame - celebStart;
  const confOpacity = interpolate(confRel, [0, 6, 65, 92], [0, 1, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // GREEN underline sweep beneath "BEFORE BURNOUT."
  const underlineScaleX = interpolate(frame, [underlineStart, underlineEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle camera float
  const driftY = Math.sin(frame / 24) * 3.5;

  // f1000-1019: Whole scene shrinks cleanly into a rounded square at the center over SKY
  const shrinkP = interpolate(frame, [shrinkStart, shrinkEnd], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const containerScale = interpolate(shrinkP, [0, 1], [1, 0.16]);
  const containerRadius = interpolate(shrinkP, [0, 1], [0, 150]);
  const containerOpacity = interpolate(shrinkP, [0.75, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SKY, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundColor: PALETTE.SAND,
          transform: `scale(${containerScale.toFixed(4)})`,
          borderRadius: `${containerRadius.toFixed(1)}px`,
          opacity: containerOpacity,
          overflow: "hidden",
          boxShadow: shrinkP > 0.01 ? "0 20px 50px rgba(15, 42, 82, 0.14)" : undefined,
        }}
      >
        {/* Warm daytime background pastel accents */}
        <svg
          width={VIDEO.width}
          height={VIDEO.height}
          viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle cx={155} cy={325 + driftY} r={90} fill={PALETTE.SAND_LIGHT} opacity={0.78} />
          <circle cx={925} cy={830 - driftY} r={115} fill={PALETTE.SAND_LIGHT} opacity={0.72} />
          <circle cx={890} cy={300} r={56} fill={PALETTE.GREEN_SOFT} opacity={0.65} />
        </svg>

        {/* Full-size isometric office with flying blocks, dust puffs, refilling heart & sparkles */}
        <IsometricOffice
          frame={globalFrame}
          originX={officeOriginX}
          originY={officeOriginY + driftY}
          scale={officeScale}
          heartLevels={heartLevels}
          paperCounts={paperCounts}
          workerBounces={workerBounces}
          flyingBlocks={flyingBlocks}
          dustPuffs={dustPuffs}
          overlay={
            <>
              {/* Sparkle burst around Heart #3 */}
              {sparkleOpacity > 0.01 && (
                <g transform={`translate(${h3x.toFixed(1)}, ${h3y.toFixed(1)})`} opacity={sparkleOpacity}>
                  <circle
                    cx={0}
                    cy={0}
                    r={22 + sparkleProgress * 46}
                    fill="none"
                    stroke={PALETTE.GREEN}
                    strokeWidth={3.5}
                    strokeOpacity={1 - sparkleProgress}
                  />
                  {SPARKLES.map((sp) => {
                    const r = 18 + sparkleProgress * sp.dist;
                    const sx = Math.cos(sp.angle) * r;
                    const sy = Math.sin(sp.angle) * r;
                    const sz = sp.size * (1 - sparkleProgress * 0.45);
                    return (
                      <path
                        key={sp.id}
                        d={`M ${sx} ${sy - sz} L ${sx + sz * 0.35} ${sy - sz * 0.35} L ${sx + sz} ${sy} L ${
                          sx + sz * 0.35
                        } ${sy + sz * 0.35} L ${sx} ${sy + sz} L ${sx - sz * 0.35} ${sy + sz * 0.35} L ${
                          sx - sz
                        } ${sy} L ${sx - sz * 0.35} ${sy - sz * 0.35} Z`}
                        fill={sp.color}
                      />
                    );
                  })}
                </g>
              )}

              {/* Celebratory stars & pastel confetti circles around the whole happy team */}
              {confRel >= 0 && confOpacity > 0.01 && (
                <g transform="translate(80, 175)" opacity={confOpacity}>
                  {CONFETTI.map((c) => {
                    const p = interpolate(confRel - c.delay, [0, 32], [0, 1], {
                      easing: Easing.out(Easing.cubic),
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const driftDown = Math.max(0, confRel - c.delay - 22) * 0.7;
                    const cx = Math.cos(c.angle) * c.dist * p;
                    const cy = Math.sin(c.angle) * c.dist * 0.68 * p - 55 * p + driftDown;
                    const sz = c.size;
                    return c.isStar ? (
                      <path
                        key={c.id}
                        d={`M ${cx} ${cy - sz} L ${cx + sz * 0.36} ${cy - sz * 0.36} L ${cx + sz} ${cy} L ${
                          cx + sz * 0.36
                        } ${cy + sz * 0.36} L ${cx} ${cy + sz} L ${cx - sz * 0.36} ${cy + sz * 0.36} L ${
                          cx - sz
                        } ${cy} L ${cx - sz * 0.36} ${cy - sz * 0.36} Z`}
                        fill={c.color}
                      />
                    ) : (
                      <circle key={c.id} cx={cx} cy={cy} r={sz * 0.62} fill={c.color} />
                    );
                  })}
                </g>
              )}
            </>
          }
        />

        {/* Top headlines: "BALANCE THE WORK." + "BEFORE BURNOUT." with sweeping GREEN underline */}
        <div
          style={{
            position: "absolute",
            top: VIDEO.safeMargin,
            left: VIDEO.safeMargin,
            right: VIDEO.safeMargin,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <SoftPop delay={line1At}>
            <FitText
              text={COPY.s5Line1}
              fontSize={86}
              fontWeight={900}
              color={PALETTE.NAVY}
              maxWidth={VIDEO.maxTextWidth}
              letterSpacing={-1.2}
            />
          </SoftPop>

          <SoftPop delay={line2At}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <FitText
                text={COPY.s5Line2}
                fontSize={86}
                fontWeight={900}
                color={PALETTE.GREEN_DARK}
                maxWidth={VIDEO.maxTextWidth}
                letterSpacing={-1.2}
              />
              {underlineScaleX > 0.005 && (
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    right: 6,
                    bottom: -8,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: PALETTE.GREEN,
                    transformOrigin: "left center",
                    transform: `scaleX(${underlineScaleX.toFixed(4)})`,
                  }}
                />
              )}
            </div>
          </SoftPop>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
