import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText, SoftPop } from "../lib/FitText";
import { FLOOR_COLS, FLOOR_ROWS, WORKER_SLOTS } from "../lib/iso";
import { IsometricOffice } from "../lib/IsometricOffice";

/**
 * S1 HOOK (f0-89): Warm SAND background.
 * Office builds itself: floor tiles pop in with staggered springs, then desks,
 * then 6 workers squash-and-stretch in, then 6 green hearts pop above them.
 * f8: "ONE OF THEM" and f24: "IS ABOUT TO BURN OUT." appear softly at the top.
 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = TIMELINE.S1;

  // Gentle camera drift (soft breathing pan, NO shake)
  const driftY = Math.sin(frame / 26) * 4;

  const getTileScale = (tx: number, ty: number) => {
    const delay = s1.tilesStart + (tx + ty) * 2.2 + tx * 0.4;
    const rel = frame - delay;
    if (rel < 0) return 0;
    return spring({
      frame: rel,
      fps,
      config: { damping: 11, stiffness: 190, mass: 0.75 },
    });
  };

  const getDeskScale = (index: number) => {
    const delay = s1.desksStart + index * 3.5;
    const rel = frame - delay;
    if (rel < 0) return 0;
    return spring({
      frame: rel,
      fps,
      config: { damping: 10.5, stiffness: 185, mass: 0.8 },
    });
  };

  // Squash-and-stretch entrance for each worker (wide squash -> tall stretch -> settle)
  const getWorkerSquash = (index: number) => {
    const delay = s1.workersStart + index * 3.8;
    const rel = frame - delay;
    if (rel < 0) return { sx: 0, sy: 0 };
    const spr = spring({
      frame: rel,
      fps,
      config: { damping: 9.5, stiffness: 205, mass: 0.78 },
    });
    const squashWave = Math.sin(Math.min(rel, 18) * 0.42) * Math.exp(-rel * 0.16) * 0.22;
    return {
      sx: Math.max(0, spr * (1 - squashWave)),
      sy: Math.max(0, spr * (1 + squashWave * 1.15)),
    };
  };

  const getHeartScale = (index: number) => {
    const delay = s1.heartsStart + index * 3.5;
    const rel = frame - delay;
    if (rel < 0) return 0;
    return spring({
      frame: rel,
      fps,
      config: { damping: 10, stiffness: 210, mass: 0.7 },
    });
  };

  const heartLevels = [1, 1, 1, 1, 1, 1];
  const paperCounts = WORKER_SLOTS.map((w) => w.basePapers);

  // Subtle decorative pastel floating circles in background (strictly SAND/WHITE/SKY tints)
  const bgShift = interpolate(frame, [0, s1.duration], [0, 18]);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SAND, overflow: "hidden" }}>
      {/* Soft warm floating pastel background accents */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle cx={145 + bgShift} cy={320} r={88} fill={PALETTE.SAND_LIGHT} opacity={0.75} />
        <circle cx={930 - bgShift * 0.8} cy={830} r={115} fill={PALETTE.SAND_LIGHT} opacity={0.7} />
        <circle cx={885} cy={290 + bgShift * 0.5} r={54} fill={PALETTE.SKY_LIGHT} opacity={0.55} />
      </svg>

      {/* Isometric 3x2 Office building itself piece by piece */}
      <IsometricOffice
        frame={frame}
        originX={462}
        originY={472 + driftY}
        scale={1.0}
        getTileScale={getTileScale}
        getDeskScale={getDeskScale}
        getWorkerSquash={getWorkerSquash}
        getHeartScale={getHeartScale}
        heartLevels={heartLevels}
        paperCounts={paperCounts}
      />

      {/* Safe-margin top headlines (soft bouncy spring pop, NAVY Poppins 900) */}
      <div
        style={{
          position: "absolute",
          top: VIDEO.safeMargin,
          left: VIDEO.safeMargin,
          right: VIDEO.safeMargin,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <SoftPop delay={s1.line1In - s1.start}>
          <FitText
            text={COPY.s1Line1}
            fontSize={92}
            fontWeight={900}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={-1.5}
          />
        </SoftPop>

        <SoftPop delay={s1.line2In - s1.start}>
          <FitText
            text={COPY.s1Line2}
            fontSize={86}
            fontWeight={900}
            color={PALETTE.CORAL}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={-1.2}
          />
        </SoftPop>
      </div>
    </AbsoluteFill>
  );
};

// Keep FLOOR constants referenced cleanly if inspected
void FLOOR_COLS;
void FLOOR_ROWS;
