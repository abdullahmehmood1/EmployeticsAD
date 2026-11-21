import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText, SoftPop } from "../lib/FitText";
import { ISO_TILE_SIZE, WORKER_SLOTS, iso } from "../lib/iso";
import { IsometricOffice } from "../lib/IsometricOffice";
import { Magnifier } from "../lib/Magnifier";

/**
 * S2 THE PUZZLE (f90-299): SAND background.
 * All 6 workers bob and smile. 5 hearts stay green.
 * Heart #3 slowly drains GREEN -> AMBER -> CORAL (f120-260) while paper blocks stack on desk #3.
 * f100: "CAN YOU TELL WHO?" with a bouncing "?".
 * Cartoon magnifying glass wanders across healthy workers, pauses & shrugs with "?" bubbles.
 * f285-299: quick smooth pastel SKY sweep transition.
 */
export const Scene2Puzzle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s2 = TIMELINE.S2;
  const globalFrame = s2.start + frame;

  const titleAt = s2.titleIn - s2.start; // 10
  const drainStart = s2.drainStart - s2.start; // 30
  const drainEnd = s2.drainEnd - s2.start; // 170
  const sweepStart = s2.sweepStart - s2.start; // 195
  const sweepEnd = s2.sweepEnd - s2.start; // 209

  // Heart #3 slowly drains 1.0 -> 0.24 across f120-260 (GREEN -> AMBER -> clearly visible CORAL!)
  const heart3Level = interpolate(frame, [drainStart, drainEnd], [1.0, 0.24], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heartLevels = [1, 1, 1, heart3Level, 1, 1];

  // Small paper blocks accumulate on Desk #3 as Heart #3 drains
  const extraBlocks = s2.paperStackFrames.filter((f) => globalFrame >= f).length;
  const paperCounts = WORKER_SLOTS.map((w) =>
    w.index === 3 ? w.basePapers + extraBlocks : w.basePapers
  );

  // Compute screen positions of smiling workers (in isometric office space) for the wandering Magnifier
  const workerHead = (idx: number): [number, number] => {
    const s = WORKER_SLOTS[idx];
    return iso(s.x - 0.04, s.y - 0.42, 48, ISO_TILE_SIZE);
  };
  const [w0x, w0y] = workerHead(0);
  const [w1x, w1y] = workerHead(1);
  const [w4x, w4y] = workerHead(4);
  const [w2x, w2y] = workerHead(2);

  // Magnifier glides: offscreen-top-right -> #0 (pause+shrug) -> #1 (pause+shrug) -> #4 (pause+shrug) -> #2
  // Local frames: 20..50 enter->#0, 50..82 inspect #0, 82..105 move->#1, 105..138 inspect #1,
  // 138..160 move->#4, 160..192 inspect #4, 192..209 drift->#2
  const magFrames = [18, 46, 80, 104, 136, 158, 188, 209];
  const magX = interpolate(
    frame,
    magFrames,
    [w0x + 260, w0x, w0x, w1x, w1x, w4x, w4x, w2x + 70],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const magY = interpolate(
    frame,
    magFrames,
    [w0y - 160, w0y, w0y, w1y, w1y, w4y, w4y, w2y - 40],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const magScale =
    frame < 16
      ? 0
      : spring({
          frame: frame - 16,
          fps,
          config: { damping: 12, stiffness: 170, mass: 0.8 },
        });

  // Shrug tilt & "?" bubble when pausing over wrong smiling workers (#0 at 52, #1 at 106, #4 at 160)
  let shrugRel = -1;
  let tiltDeg = Math.sin(frame / 14) * 4;
  if (frame >= 50 && frame < 84) {
    shrugRel = frame - 50;
    tiltDeg = Math.sin(shrugRel * 0.45) * 14;
  } else if (frame >= 104 && frame < 138) {
    shrugRel = frame - 104;
    tiltDeg = Math.sin(shrugRel * 0.45) * 14;
  } else if (frame >= 158 && frame < 192) {
    shrugRel = frame - 158;
    tiltDeg = Math.sin(shrugRel * 0.45) * 14;
  }

  // Playful bouncing "?" on the end of "CAN YOU TELL WHO?"
  const qBounce = Math.abs(Math.sin(frame * 0.22)) * -16;
  const qRot = Math.sin(frame * 0.22) * 8;

  // Gentle camera drift
  const driftX = Math.sin(frame / 32) * 5;
  const driftY = Math.cos(frame / 28) * 4;

  // Quick pastel SKY sweep transition (f285-299)
  const sweepProgress = interpolate(frame, [sweepStart, sweepEnd], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SAND, overflow: "hidden" }}>
      {/* Soft warm background accents */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle cx={160 + driftX} cy={315} r={88} fill={PALETTE.SAND_LIGHT} opacity={0.75} />
        <circle cx={920 - driftX} cy={835} r={115} fill={PALETTE.SAND_LIGHT} opacity={0.7} />
        <circle cx={885} cy={295 + driftY} r={54} fill={PALETTE.SKY_LIGHT} opacity={0.55} />
      </svg>

      {/* Isometric Office + Cartoon Magnifier overlay */}
      <IsometricOffice
        frame={globalFrame}
        originX={462 + driftX}
        originY={472 + driftY}
        scale={1.0}
        heartLevels={heartLevels}
        paperCounts={paperCounts}
        overlay={
          <Magnifier
            x={magX}
            y={magY}
            tiltDeg={tiltDeg}
            scale={magScale}
            shrugRelFrame={shrugRel}
          />
        }
      />

      {/* Top riddle headline: "CAN YOU TELL WHO?" with playful bouncing "?" */}
      <div
        style={{
          position: "absolute",
          top: VIDEO.safeMargin + 22,
          left: VIDEO.safeMargin,
          right: VIDEO.safeMargin,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SoftPop delay={titleAt}>
          <FitText
            text={COPY.s2PromptFull}
            fontSize={86}
            fontWeight={900}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={-1.2}
          >
            <span>{COPY.s2PromptStem}</span>
            <span
              style={{
                display: "inline-block",
                color: PALETTE.CORAL,
                marginLeft: 3,
                transform: `translateY(${qBounce.toFixed(1)}px) rotate(${qRot.toFixed(1)}deg)`,
              }}
            >
              {COPY.s2QuestionMark}
            </span>
          </FitText>
        </SoftPop>
      </div>

      {/* Quick smooth SKY sweep transition into S3 Reveal (f285-299) */}
      {sweepProgress > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${(sweepProgress * 100).toFixed(2)}%`,
            backgroundColor: PALETTE.SKY,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
