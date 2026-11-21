import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText, SoftPop } from "../lib/FitText";
import { WORKER_SLOTS } from "../lib/iso";
import { IsometricOffice } from "../lib/IsometricOffice";
import { LogoMark } from "../lib/LogoMark";

/**
 * S3 REVEAL (f300-389): SKY background tint.
 * White rounded glass-style card slides smoothly to upper-center with soft shadow,
 * showing <LogoMark> + "EMPLOYETICS".
 * f340: "SEES BURNOUT FIRST." pops softly underneath.
 * Soft vertical scan-line sweeps across the office; worker #3's heart flashes with a CORAL ring
 * and a small "!" marker pops above worker #3's head.
 */
export const Scene3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s3 = TIMELINE.S3;
  const globalFrame = s3.start + frame;

  const cardAt = s3.cardStart - s3.start; // 4
  const scanStart = s3.scanStart - s3.start; // 22
  const scanHit = s3.scanHitWorker3 - s3.start; // 42
  const scanEnd = s3.scanEnd - s3.start; // 68
  const subAt = s3.subIn - s3.start; // 40

  // White rounded glass card slides smoothly down into center-top
  const cardSpr =
    frame < cardAt
      ? 0
      : spring({
          frame: frame - cardAt,
          fps,
          config: { damping: 12, stiffness: 165, mass: 0.85 },
        });
  const cardY = interpolate(cardSpr, [0, 1], [-160, 0]);
  const cardOpacity =
    frame < cardAt ? 0 : interpolate(frame - cardAt, [0, 7], [0, 1], { extrapolateRight: "clamp" });

  // Soft vertical scan-line sweeping left-to-right across the isometric office (x = -340 .. +490 in office space)
  const scanActive = frame >= scanStart && frame <= scanEnd;
  const scanX = interpolate(frame, [scanStart, scanEnd], [-360, 500], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanOpacity = scanActive
    ? interpolate(frame, [scanStart, scanStart + 6, scanEnd - 8, scanEnd], [0, 0.85, 0.85, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Once scan-line hits Worker #3 (f342), heart #3 flashes with pulsing CORAL ring + "!" pops up!
  const alertRel = frame - scanHit;
  const worker3CoralRing =
    alertRel >= 0 ? 0.5 + 0.5 * Math.sin((alertRel / 14) * Math.PI * 2) : 0;
  const worker3AlertScale =
    alertRel < 0
      ? 0
      : spring({
          frame: alertRel,
          fps,
          config: { damping: 9.5, stiffness: 220, mass: 0.7 },
        });

  // Heart #3 sits low & coral (0.24); Desk #3 holds its 7 stacked paper blocks
  const heartLevels = [1, 1, 1, 0.24, 1, 1];
  const paperCounts = WORKER_SLOTS.map((w) => (w.index === 3 ? w.basePapers + 5 : w.basePapers));

  const driftY = Math.sin(frame / 22) * 3.5;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SKY, overflow: "hidden" }}>
      {/* Soft pastel sky circles */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle cx={155} cy={220 + driftY} r={110} fill={PALETTE.SKY_LIGHT} opacity={0.85} />
        <circle cx={930} cy={880 - driftY} r={130} fill={PALETTE.SKY_LIGHT} opacity={0.8} />
      </svg>

      {/* Isometric Office cleanly framed in lower half with soft scan-line sweep */}
      <IsometricOffice
        frame={globalFrame}
        originX={476}
        originY={548 + driftY}
        scale={0.82}
        heartLevels={heartLevels}
        paperCounts={paperCounts}
        worker3CoralRing={worker3CoralRing}
        worker3AlertScale={worker3AlertScale}
        overlay={
          scanOpacity > 0.01 ? (
            <g opacity={scanOpacity}>
              {/* Soft translucent scan band */}
              <rect
                x={scanX - 28}
                y={-95}
                width={56}
                height={590}
                rx={24}
                fill={PALETTE.GREEN_SOFT}
                fillOpacity={0.45}
              />
              {/* Crisp center scan beam */}
              <line
                x1={scanX}
                y1={-95}
                x2={scanX}
                y2={495}
                stroke={PALETTE.GREEN}
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
          ) : undefined
        }
      />

      {/* Upper-center white rounded glass-style brand card + "SEES BURNOUT FIRST." */}
      <div
        style={{
          position: "absolute",
          top: VIDEO.safeMargin + 8,
          left: VIDEO.safeMargin,
          right: VIDEO.safeMargin,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardY.toFixed(1)}px)`,
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            border: `3px solid ${PALETTE.WHITE}`,
            borderRadius: 32,
            padding: "24px 44px",
            boxShadow: "0 18px 42px rgba(15, 42, 82, 0.12)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 24,
            maxWidth: VIDEO.maxTextWidth,
          }}
        >
          <LogoMark size={78} color={PALETTE.NAVY} />
          <FitText
            text={COPY.s3Brand}
            fontSize={74}
            fontWeight={900}
            color={PALETTE.NAVY}
            maxWidth={680}
            letterSpacing={-1}
          />
        </div>

        <SoftPop delay={subAt}>
          <FitText
            text={COPY.s3Sub}
            fontSize={74}
            fontWeight={900}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={-1}
          />
        </SoftPop>
      </div>
    </AbsoluteFill>
  );
};
