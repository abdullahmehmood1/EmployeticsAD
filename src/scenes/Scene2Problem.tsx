import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FlatBattery } from "../components/FlatBattery";
import { COLORS, FONTS, getImpactShake } from "../theme";

interface BeatConfig {
  id: string;
  start: number;
  end: number;
  line1: string;
  line2?: string;
  tag: string;
  shakeAmp: number;
}

const BEATS: BeatConfig[] = [
  { id: "b1", start: 6, end: 156, line1: "LATE", line2: "NIGHTS.", tag: "SIGNAL 01", shakeAmp: 16 },
  { id: "b2", start: 156, end: 306, line1: "LOST", line2: "WEEKENDS.", tag: "SIGNAL 02", shakeAmp: 18 },
  { id: "b3", start: 306, end: 480, line1: "NOBODY", line2: "NOTICED.", tag: "TOO LATE", shakeAmp: 24 },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Battery drains step-by-step from 100% Green -> 65% -> 32% Amber -> 8% Empty Red
  const batteryLevel = interpolate(
    frame,
    [0, 12, 42, 156, 188, 306, 338, 480],
    [100, 100, 65, 65, 32, 32, 8, 8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  // Active beat
  const activeBeat = BEATS.find((b) => frame >= b.start && frame < b.end) ?? BEATS[BEATS.length - 1];
  const localF = Math.max(0, frame - activeBeat.start);

  const slam = spring({
    frame: localF,
    fps,
    config: { damping: 11, stiffness: 300, mass: 0.72 },
  });

  const shake = getImpactShake(frame, activeBeat.start, activeBeat.shakeAmp, 18);

  // Crisp fast horizontal wipe between beats
  const wipe1 = interpolate(frame, [148, 160], [-100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wipe2 = interpolate(frame, [298, 310], [-100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fast bright wipe to white at very end (frames 466-480) leading into Scene 3
  const whiteWipe = interpolate(frame, [466, 480], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const isFinalBeat = activeBeat.id === "b3";

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy, overflow: "hidden" }}>
      {/* Crisp minimal graphic framing geometry (strictly flat navy/white/amber, zero neon) */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect x="64" y="56" width="1792" height="968" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
        <line x1="64" y1="168" x2="1856" y2="168" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      </svg>

      {/* Top Bar: Left Signal Counter | Right Draining Flat Battery Icon */}
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 100,
          right: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontFamily: FONTS.mono,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: COLORS.amber,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: isFinalBeat ? COLORS.batteryRed : COLORS.amber,
              display: "inline-block",
            }}
          />
          {activeBeat.tag}
        </div>

        {/* Flat Draining Battery Icon in the Top-Right Corner */}
        <FlatBattery level={batteryLevel} scale={1.08} showPercent pulsePhase={frame} />
      </div>

      {/* Main Giant Kinetic Slam Typography */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 70,
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heavy,
              fontSize: 186,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: COLORS.white,
              lineHeight: 0.92,
              transform: `scale(${interpolate(slam, [0, 1], [1.75, 1])})`,
              opacity: Math.min(1, slam * 2.4),
            }}
          >
            {activeBeat.line1}
          </div>

          {activeBeat.line2 && (
            <div
              style={{
                fontFamily: FONTS.heavy,
                fontSize: 186,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                color: isFinalBeat ? COLORS.amber : COLORS.white,
                lineHeight: 0.94,
                transform: `scale(${interpolate(slam, [0, 1], [1.95, 1])})`,
                opacity: Math.min(1, slam * 2.4),
              }}
            >
              {activeBeat.line2.slice(0, -1)}
              <span style={{ color: isFinalBeat ? COLORS.white : COLORS.amber }}>.</span>
            </div>
          )}

          {/* Hard bold Amber accent underline snapping in */}
          <div
            style={{
              width: interpolate(localF, [0, 14], [0, 620], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.exp),
              }),
              height: 12,
              backgroundColor: isFinalBeat ? COLORS.batteryRed : COLORS.amber,
              marginTop: 28,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Quick Kinetic Amber Slash Wipes Between Problem Lines */}
      {frame >= 148 && frame <= 160 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: COLORS.amber,
            transform: `translateX(${wipe1}%) skewX(-10deg)`,
            pointerEvents: "none",
          }}
        />
      )}
      {frame >= 298 && frame <= 310 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: COLORS.amber,
            transform: `translateX(${wipe2}%) skewX(-10deg)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Fast Bright Wipe to Pure White (leading into 11-14s Reveal) */}
      {whiteWipe > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.amber,
              transform: `translateX(${100 - Math.min(100, whiteWipe * 1.18)}%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.white,
              transform: `translateX(${100 - whiteWipe}%)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
