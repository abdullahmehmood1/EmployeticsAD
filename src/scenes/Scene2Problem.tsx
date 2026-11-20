import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { Battery } from "../lib/Battery";
import { DotGrid } from "../lib/DotGrid";
import { FitText } from "../lib/FitText";
import { Shake } from "../lib/Shake";
import { Slam } from "../lib/Slam";

/**
 * S2 PROBLEM (f90-329): NAVY background with faint drifting dot grid.
 * Right: flat battery (WHITE outline, AMBER fill) pops in at f90 (100%), drains in sync:
 *   70% by f130, 35% by f185, 8% by f240.
 *   From f240: outline pulses AMBER every 15 frames with a small "!" next to it.
 * Left: stacked left-aligned slams:
 *   f102 "LATE NIGHTS." (WHITE)
 *   f156 "LOST WEEKENDS." (WHITE)
 *   f210 "NOBODY NOTICED." (AMBER; earlier lines dim to 50%)
 * f315-329: WHITE wipe sweeps left-to-right.
 */
export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s2 = TIMELINE.S2;

  const line1At = s2.line1Slam - s2.start; // 12
  const drain1End = s2.drain1End - s2.start; // 40
  const line2At = s2.line2Slam - s2.start; // 66
  const drain2End = s2.drain2End - s2.start; // 95
  const line3At = s2.line3Slam - s2.start; // 120
  const drain3End = s2.drain3End - s2.start; // 150
  const wipeStart = s2.wipeStart - s2.start; // 225
  const wipeEnd = s2.wipeEnd - s2.start; // 239

  // Battery pop-in spring at f90 (local 0)
  const batteryPop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 185, mass: 0.85 },
  });
  const batteryScale = interpolate(batteryPop, [0, 1], [0.55, 1]);
  const batteryOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exact battery drain curve synchronized with each slam
  let batteryLevel = 1.0;
  if (frame < line1At) {
    batteryLevel = 1.0;
  } else if (frame <= drain1End) {
    batteryLevel = interpolate(frame, [line1At, drain1End], [1.0, 0.7], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < line2At) {
    batteryLevel = 0.7;
  } else if (frame <= drain2End) {
    batteryLevel = interpolate(frame, [line2At, drain2End], [0.7, 0.35], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < line3At) {
    batteryLevel = 0.35;
  } else if (frame <= drain3End) {
    batteryLevel = interpolate(frame, [line3At, drain3End], [0.35, 0.08], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    batteryLevel = 0.08;
  }

  // From f240 (local 150): outline pulses AMBER every 15 frames + small "!" beside battery
  const alertActive = frame >= drain3End;
  const alertCycle = alertActive ? ((frame - drain3End) % s2.pulsePeriod) / s2.pulsePeriod : 0;
  const alertPulse = alertActive ? 0.5 + 0.5 * Math.cos(alertCycle * Math.PI * 2) : 0;
  const outlineColor = alertActive && alertPulse > 0.45 ? PALETTE.AMBER : PALETTE.WHITE;

  // Earlier two lines dim cleanly to 50% when "NOBODY NOTICED." slams in at f210
  const dimFactor = interpolate(frame, [line3At, line3At + 8], [1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle vertical breathing on battery so right side stays alive even between drains
  const batteryFloatY = Math.sin(frame * 0.09) * 5;

  // Left-to-right WHITE wipe (f315-329)
  const wipeProgress = interpolate(frame, [wipeStart, wipeEnd], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.NAVY, overflow: "hidden" }}>
      <DotGrid color={PALETTE.WHITE} opacity={0.11} spacing={62} speedX={0.6} speedY={0.28} />

      <Shake
        hits={[
          { at: line1At, amplitude: 8, duration: 10 },
          { at: line2At, amplitude: 8, duration: 10 },
          { at: line3At, amplitude: 11, duration: 12 },
        ]}
      >
        <AbsoluteFill
          style={{
            padding: VIDEO.safeMargin,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left-aligned stacked kinetic lines (maxWidth 1060 px leaves clean room for battery) */}
          <div
            style={{
              width: 1060,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 44,
            }}
          >
            <div style={{ opacity: dimFactor }}>
              <Slam delay={line1At} fromScale={1.7} damping={12} stiffness={180} origin="left center">
                <FitText
                  text={COPY.s2Line1}
                  fontSize={114}
                  fontWeight={900}
                  color={PALETTE.WHITE}
                  maxWidth={1050}
                  letterSpacing={-1.5}
                  align="left"
                />
              </Slam>
            </div>

            <div style={{ opacity: dimFactor }}>
              <Slam delay={line2At} fromScale={1.7} damping={12} stiffness={180} origin="left center">
                <FitText
                  text={COPY.s2Line2}
                  fontSize={114}
                  fontWeight={900}
                  color={PALETTE.WHITE}
                  maxWidth={1050}
                  letterSpacing={-1.5}
                  align="left"
                />
              </Slam>
            </div>

            <Slam delay={line3At} fromScale={1.75} damping={11} stiffness={185} origin="left center">
              <FitText
                text={COPY.s2Line3}
                fontSize={116}
                fontWeight={900}
                color={PALETTE.AMBER}
                maxWidth={1050}
                letterSpacing={-1.5}
                align="left"
              />
            </Slam>
          </div>

          {/* Right side large flat battery icon + alert "!" */}
          <div
            style={{
              width: 440,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: batteryOpacity,
              transform: `translateY(${batteryFloatY.toFixed(2)}px) scale(${batteryScale.toFixed(4)})`,
            }}
          >
            <Battery
              level={batteryLevel}
              width={255}
              height={445}
              outlineColor={outlineColor}
              fillColor={PALETTE.AMBER}
              showAlert={alertActive}
              alertPulse={alertPulse}
            />
          </div>
        </AbsoluteFill>
      </Shake>

      {/* Fast bright WHITE wipe left-to-right (f315-329) */}
      {wipeProgress > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${(wipeProgress * 100).toFixed(2)}%`,
            backgroundColor: PALETTE.WHITE,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
