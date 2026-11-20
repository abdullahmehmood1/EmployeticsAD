import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import assets from "../lib/assets.json";
import { Callout } from "../lib/Callout";
import { DotGrid } from "../lib/DotGrid";
import { LAPTOP_LID_H, LAPTOP_LID_W, LAPTOP_METRICS, Laptop } from "../lib/Laptop";
import { COPY, PALETTE, SCREEN_TARGETS, TIMELINE, VIDEO } from "../timeline";
import { POPPINS_FONT } from "../lib/fonts";

/**
 * S4 THE APP (f420-779): NAVY background.
 * Flat vector laptop slides in from right and rotates rotateY 35 deg -> 0 (f420-450, spring).
 * Screen shows public/app_demo.mp4 via <OffthreadVideo> if present, else public/attrition_screen.png
 * with slow Ken Burns zoom into top risk card (f450-540).
 * f500: hand-drawn arrow + "WHO'S AT RISK?" pointing to top card's percentage (89%) + pulsing highlight ring.
 * f610: second arrow + "AND WHY." pointing to "SHAP Explain" button, which pulses.
 * "DEMO DATA" tiny (40% opacity) bottom-right.
 * f720-779: laptop slides out left while scaling down.
 */
export const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = TIMELINE.S4;

  const kbStart = s4.kenBurnsStart - s4.start; // 30
  const kbEnd = s4.kenBurnsEnd - s4.start; // 120
  const callout1At = s4.callout1Start - s4.start; // 80
  const callout2At = s4.callout2Start - s4.start; // 190
  const outStart = s4.laptopOutStart - s4.start; // 300
  const outEnd = s4.laptopOutEnd - s4.start; // 359

  // Slide-in from right + rotateY 35 deg -> 0 (spring over f420-450)
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });
  const enterX = interpolate(enterSpring, [0, 1], [1150, 0]);
  const rotateY = interpolate(enterSpring, [0, 1], [35, 0]);

  // Slide-out left + scale down (f720-779)
  const exitProgress = interpolate(frame, [outStart, outEnd], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(exitProgress, [0, 1], [0, -1580]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.62]);

  // Slow Ken Burns zoom into top risk card (f450-540), plus ultra-gentle continuous breathing
  const mainZoom = interpolate(frame, [kbStart, kbEnd], [1, SCREEN_TARGETS.kenBurnsMaxScale], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const microBreath =
    frame > kbEnd
      ? interpolate(frame, [kbEnd, outStart], [0, 0.015], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const zoomScale = assets.hasAppDemoVideo ? 1 : mainZoom + microBreath;

  // Laptop resting center coordinates on 1920x1080 canvas (leaves clean margins for both callouts)
  const laptopCx = 820;
  const laptopCy = 576;
  const lidLeft = laptopCx - LAPTOP_LID_W / 2;
  const lidTop = laptopCy - LAPTOP_LID_H / 2;
  const screenLeft = lidLeft + LAPTOP_METRICS.bezelX;
  const screenTop = lidTop + LAPTOP_METRICS.bezelTop;

  // Map normalized screenshot coordinates (u, v) through active Ken Burns zoom to exact canvas (x, y)
  const { ox, oy } = SCREEN_TARGETS.kenBurnsOrigin;
  const mapTarget = (u: number, v: number) => {
    const uPrime = ox + (u - ox) * zoomScale;
    const vPrime = oy + (v - oy) * zoomScale;
    return {
      x: screenLeft + uPrime * LAPTOP_METRICS.screenWidth,
      y: screenTop + vPrime * LAPTOP_METRICS.screenHeight,
    };
  };

  const riskPos = mapTarget(SCREEN_TARGETS.riskPercent.u, SCREEN_TARGETS.riskPercent.v);
  const shapPos = mapTarget(SCREEN_TARGETS.shapButton.u, SCREEN_TARGETS.shapButton.v);
  const shapCanvasW = SCREEN_TARGETS.shapButton.w * LAPTOP_METRICS.screenWidth * zoomScale;

  // Pulsing highlight on the "SHAP Explain" button from f610 onward
  const shapRel = frame - callout2At;
  const shapPulseActive = shapRel >= 0;
  const shapPulse = shapPulseActive ? 0.5 + 0.5 * Math.sin((shapRel / 18) * Math.PI * 2) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.NAVY, overflow: "hidden" }}>
      <DotGrid color={PALETTE.WHITE} opacity={0.085} spacing={66} speedX={0.42} speedY={-0.25} />

      {/* Unified stage container: laptop + callouts exit left together cleanly */}
      <AbsoluteFill
        style={{
          transform: `translate3d(${exitX.toFixed(2)}px, 0, 0) scale(${exitScale.toFixed(4)})`,
          transformOrigin: "center center",
        }}
      >
        {/* Flat vector laptop */}
        <div
          style={{
            position: "absolute",
            left: laptopCx,
            top: lidTop,
            transform: `translate3d(calc(-50% + ${enterX.toFixed(2)}px), 0, 0)`,
          }}
        >
          <Laptop rotateYDeg={rotateY}>
            {assets.hasAppDemoVideo ? (
              <OffthreadVideo
                src={staticFile("app_demo.mp4")}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transform: `scale(${zoomScale.toFixed(4)})`,
                  transformOrigin: `${(ox * 100).toFixed(1)}% ${(oy * 100).toFixed(1)}%`,
                }}
              >
                <Img
                  src={staticFile("attrition_screen.png")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />

                {/* Pulsing highlight outline directly locked to the "SHAP Explain" button */}
                {shapPulseActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${(
                        (SCREEN_TARGETS.shapButton.u - SCREEN_TARGETS.shapButton.w / 2) *
                        100
                      ).toFixed(3)}%`,
                      top: `${(
                        (SCREEN_TARGETS.shapButton.v - SCREEN_TARGETS.shapButton.h / 2) *
                        100
                      ).toFixed(3)}%`,
                      width: `${(SCREEN_TARGETS.shapButton.w * 100).toFixed(3)}%`,
                      height: `${(SCREEN_TARGETS.shapButton.h * 100).toFixed(3)}%`,
                      borderRadius: 10,
                      border: `4px solid ${PALETTE.NAVY}`,
                      boxShadow: `0 0 0 ${(4 + shapPulse * 7).toFixed(1)}px ${PALETTE.AMBER}`,
                      transform: `scale(${(1 + shapPulse * 0.065).toFixed(4)})`,
                      pointerEvents: "none",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            )}
          </Laptop>
        </div>

        {/* Callout 1 (f500): "WHO'S AT RISK?" -> top card 89% badge + pulsing highlight ring */}
        <Callout
          startFrame={callout1At}
          label={COPY.s4Callout1}
          labelX={845}
          labelY={184}
          labelMaxWidth={620}
          labelFontSize={56}
          labelColor={PALETTE.WHITE}
          labelAlign="center"
          fromX={868}
          fromY={228}
          ctrlX={898}
          ctrlY={304}
          toX={riskPos.x - 6}
          toY={riskPos.y - 72}
          ring={{
            cx: riskPos.x,
            cy: riskPos.y,
            rx: 80,
            ry: 65,
          }}
        />

        {/* Callout 2 (f610): "AND WHY." -> pulsing "SHAP Explain" button */}
        <Callout
          startFrame={callout2At}
          label={COPY.s4Callout2}
          labelX={1428}
          labelY={466}
          labelMaxWidth={335}
          labelFontSize={60}
          labelColor={PALETTE.AMBER}
          labelAlign="left"
          fromX={1412}
          fromY={464}
          ctrlX={1346}
          ctrlY={430}
          toX={shapPos.x + shapCanvasW / 2 + 12}
          toY={shapPos.y}
        />
      </AbsoluteFill>

      {/* Tiny "DEMO DATA" bottom-right (40% opacity, inside 150 px safe margin) */}
      <div
        style={{
          position: "absolute",
          right: VIDEO.safeMargin,
          bottom: VIDEO.safeMargin,
          fontFamily: POPPINS_FONT,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "2.5px",
          color: PALETTE.WHITE,
          opacity: 0.4,
        }}
      >
        {COPY.s4DemoData}
      </div>
    </AbsoluteFill>
  );
};
