import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { Battery } from "../lib/Battery";
import { DotGrid } from "../lib/DotGrid";
import { FitText } from "../lib/FitText";
import { Shake } from "../lib/Shake";
import { Slam } from "../lib/Slam";

const BURST_COUNT = 16;

/**
 * S5 SOLUTION (f780-1034): NAVY background.
 * Huge battery returns in center and CHARGES 8% -> 100% (WHITE fill, f790-860) with flat glow pulse.
 * f860: radial burst of small circles + chime.
 * f870: "ACT EARLY." slams in (WHITE).
 * f925: "KEEP YOUR PEOPLE." slams in (AMBER).
 * f1000-1034: everything scales to zero toward center, ending in a WHITE flash.
 */
export const Scene5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s5 = TIMELINE.S5;

  const chargeStart = s5.chargeStart - s5.start; // 10
  const chargeEnd = s5.chargeEnd - s5.start; // 80
  const burstAt = s5.burstAt - s5.start; // 80
  const line1At = s5.line1Slam - s5.start; // 90
  const line2At = s5.line2Slam - s5.start; // 145
  const collapseStart = s5.collapseStart - s5.start; // 220
  const flashStart = s5.flashStart - s5.start; // 242
  const collapseEnd = s5.collapseEnd - s5.start; // 254

  // Battery enters huge in center
  const enterSpr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 175, mass: 0.85 },
  });
  const enterScale = interpolate(enterSpr, [0, 1], [0.5, 1]);

  // Charge 8% -> 100% smoothly across f790-860 (linear + subtle ease so f850 visibly shows ~87% mid-charge)
  const chargeLevel = interpolate(frame, [chargeStart, chargeEnd], [0.08, 1.0], {
    easing: Easing.bezier(0.25, 0.1, 0.75, 0.9),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flat concentric glow pulse while charging & softly after full
  const chargePulse =
    frame >= chargeStart && frame <= chargeEnd + 8
      ? 0.5 + 0.5 * Math.sin(((frame - chargeStart) / 14) * Math.PI * 2)
      : frame > chargeEnd + 8
      ? 0.28 + 0.22 * Math.sin(((frame - chargeEnd) / 22) * Math.PI * 2)
      : 0;

  // After full-charge burst (f860), battery docks smoothly upward so headlines command center stage
  const dockSpr =
    frame < burstAt + 2
      ? 0
      : spring({
          frame: frame - (burstAt + 2),
          fps,
          config: { damping: 14, stiffness: 160, mass: 0.85 },
        });
  const batteryScale = enterScale * interpolate(dockSpr, [0, 1], [1.0, 0.42]);
  const batteryOffsetY = interpolate(dockSpr, [0, 1], [0, -280]);

  // Radial burst of small circles at f860 (strictly WHITE & AMBER, flat)
  const burstRel = frame - burstAt;
  const burstProgress = interpolate(burstRel, [0, 26], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstOpacity = interpolate(burstRel, [0, 3, 18, 26], [0, 1, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Collapse everything smoothly to zero toward center (f1000-1026), ending in solid WHITE flash
  const collapseScale = interpolate(frame, [collapseStart, flashStart + 6], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flashOpacity = interpolate(frame, [flashStart, collapseEnd], [0, 1], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.NAVY, overflow: "hidden" }}>
      <DotGrid color={PALETTE.WHITE} opacity={0.1} spacing={62} speedX={-0.5} speedY={-0.32} />

      <Shake
        hits={[
          { at: burstAt, amplitude: 6, duration: 8 },
          { at: line1At, amplitude: 9, duration: 10 },
          { at: line2At, amplitude: 13, duration: 12 },
        ]}
      >
        <AbsoluteFill
          style={{
            transform: `scale(${collapseScale.toFixed(4)})`,
            transformOrigin: "center center",
          }}
        >
          {/* Radial burst of small circles at f860 */}
          {burstRel >= 0 && burstOpacity > 0.005 && (
            <svg
              width={VIDEO.width}
              height={VIDEO.height}
              viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              {/* Crisp expanding burst ring */}
              <circle
                cx={VIDEO.width / 2}
                cy={VIDEO.height / 2}
                r={120 + burstProgress * 430}
                fill="none"
                stroke={PALETTE.WHITE}
                strokeWidth={5}
                strokeOpacity={burstOpacity * 0.55}
              />
              {Array.from({ length: BURST_COUNT }).map((_, i) => {
                const angle = (i / BURST_COUNT) * Math.PI * 2;
                const dist = 120 + burstProgress * (i % 2 === 0 ? 390 : 300);
                const cx = VIDEO.width / 2 + Math.cos(angle) * dist;
                const cy = VIDEO.height / 2 + Math.sin(angle) * dist;
                const r = (i % 2 === 0 ? 15 : 10) * (1 - burstProgress * 0.55);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={i % 2 === 0 ? PALETTE.AMBER : PALETTE.WHITE}
                    fillOpacity={burstOpacity}
                  />
                );
              })}
            </svg>
          )}

          {/* Huge centered charging battery -> docks neatly above headlines */}
          <AbsoluteFill
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                transform: `translateY(${batteryOffsetY.toFixed(2)}px) scale(${batteryScale.toFixed(4)})`,
              }}
            >
              <Battery
                level={chargeLevel}
                width={290}
                height={500}
                outlineColor={PALETTE.WHITE}
                fillColor={PALETTE.WHITE}
                chargePulse={chargePulse}
              />
            </div>
          </AbsoluteFill>

          {/* Bold kinetic solution headlines */}
          <AbsoluteFill
            style={{
              padding: VIDEO.safeMargin,
              paddingTop: 390,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <Slam delay={line1At} fromScale={1.7} damping={12} stiffness={180}>
              <FitText
                text={COPY.s5Line1}
                fontSize={148}
                fontWeight={900}
                color={PALETTE.WHITE}
                maxWidth={VIDEO.maxTextWidth}
                letterSpacing={-2}
              />
            </Slam>

            <Slam delay={line2At} fromScale={1.8} damping={11} stiffness={190}>
              <FitText
                text={COPY.s5Line2}
                fontSize={154}
                fontWeight={900}
                color={PALETTE.AMBER}
                maxWidth={VIDEO.maxTextWidth}
                letterSpacing={-2}
              />
            </Slam>
          </AbsoluteFill>
        </AbsoluteFill>
      </Shake>

      {/* Solid WHITE flash handoff into End Card */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: PALETTE.WHITE,
            opacity: flashOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
