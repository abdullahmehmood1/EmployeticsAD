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
import { POPPINS_FONT } from "../lib/fonts";
import { WORKER_SLOTS } from "../lib/iso";
import { IsometricOffice } from "../lib/IsometricOffice";
import { COPY, PALETTE, SCREEN_TARGETS, TIMELINE, VIDEO } from "../timeline";

const WIN_W = 860;
const WIN_HEADER_H = 42;
const WIN_CONTENT_H = 538; // 860 x 538 matches 1200 x 750 (1.60:1) cleanly
const WIN_LEFT = 128; // x = 128..988 (inside 90..990 safe box)
const WIN_TOP = 200; // y = 200..780

/**
 * S4 THE APP (f390-659): SKY background.
 * Isometric office shrinks smoothly to bottom-left corner.
 * Floating browser window rises in:
 * - f390-519: public/team_burnout.png, slow Ken Burns zoom (f400-500) onto CORAL risk card;
 *   coral pulsing highlight ring + callout arrow "RED = NEEDS HELP." at f440.
 * - f520-639: swaps to public/workload_optimizer.png (or public/app_demo.mp4 via <OffthreadVideo>);
 *   zooms into utilisation chart & "Optimise Workload" button;
 *   callout "ONE CLICK TO BALANCE." at f560; click ripple pulse on button at f600.
 * - Tiny "DEMO DATA" (40% opacity) bottom-right.
 * - f640-659: browser window slides smoothly away.
 */
export const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = TIMELINE.S4;
  const globalFrame = s4.start + frame;

  const winIn = s4.windowInStart - s4.start; // 2
  const z1Start = s4.zoom1Start - s4.start; // 10
  const z1End = s4.zoom1End - s4.start; // 110
  const c1At = s4.callout1At - s4.start; // 50
  const swapAt = s4.swapAt - s4.start; // 130
  const z2Start = s4.zoom2Start - s4.start; // 135
  const z2End = s4.zoom2End - s4.start; // 235
  const c2At = s4.callout2At - s4.start; // 170
  const clickAt = s4.clickRippleAt - s4.start; // 210
  const outStart = s4.windowOutStart - s4.start; // 250
  const outEnd = s4.windowOutEnd - s4.start; // 269

  // Isometric office shrinks smoothly from S3 position into cozy bottom-left corner (f390-415)
  const shrinkSpr = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 150, mass: 0.9 },
  });
  // Gently begins expanding slightly during exit (f645-659) to hand off smoothly to S5
  const growBack = interpolate(frame, [outStart + 6, outEnd], [0, 0.14], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const officeScale = interpolate(shrinkSpr, [0, 1], [0.82, 0.34]) + growBack;
  const officeOriginX = interpolate(shrinkSpr, [0, 1], [476, 224]);
  const officeOriginY = interpolate(shrinkSpr, [0, 1], [548, 816]);

  // Browser window rise-in (soft spring) and slide-away (f640-659)
  const winEnterSpr =
    frame < winIn
      ? 0
      : spring({
          frame: frame - winIn,
          fps,
          config: { damping: 13, stiffness: 150, mass: 0.85 },
        });
  const enterY = interpolate(winEnterSpr, [0, 1], [340, 0]);
  const exitProgress = interpolate(frame, [outStart, outEnd], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(exitProgress, [0, 1], [0, 980]);
  const exitY = interpolate(exitProgress, [0, 1], [0, -140]);
  const winOpacity =
    (frame < winIn ? 0 : interpolate(frame - winIn, [0, 7], [0, 1], { extrapolateRight: "clamp" })) *
    (1 - exitProgress * 0.85);

  // Screen 1: team_burnout.png Ken Burns zoom (f400-500)
  const { riskCard, zoomOrigin: z1Org, zoomScale: z1Max } = SCREEN_TARGETS.teamBurnout;
  const zoom1 = interpolate(frame, [z1Start, z1End], [1, z1Max], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Screen 2: workload_optimizer.png Ken Burns zoom (f525-625)
  const { optimiseBtn, zoomOrigin: z2Org, zoomScale: z2Max } = SCREEN_TARGETS.workloadOptimizer;
  const zoom2 = interpolate(frame, [z2Start, z2End], [1, z2Max], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Smooth cross-swap transition at f520 (over 12 frames)
  const swapProgress = interpolate(frame, [swapAt, swapAt + 12], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exact canvas coordinates of Screen 1 CORAL risk card (for Callout 1 arrow)
  const contentTop = WIN_TOP + WIN_HEADER_H + enterY + exitY;
  const contentLeft = WIN_LEFT + exitX;

  const cardUPrime = z1Org.ox + (riskCard.u - z1Org.ox) * zoom1;
  const cardVPrime = z1Org.oy + (riskCard.v - z1Org.oy) * zoom1;
  const cardCanvasX = contentLeft + cardUPrime * WIN_W;
  const cardCanvasY = contentTop + cardVPrime * WIN_CONTENT_H;
  const cardCanvasH = riskCard.h * WIN_CONTENT_H * zoom1;

  // Exact canvas coordinates of Screen 2 "Optimise Workload" button (for Callout 2 arrow)
  const btnUPrime = z2Org.ox + (optimiseBtn.u - z2Org.ox) * zoom2;
  const btnVPrime = z2Org.oy + (optimiseBtn.v - z2Org.oy) * zoom2;
  const btnCanvasX = contentLeft + btnUPrime * WIN_W;
  const btnCanvasY = contentTop + btnVPrime * WIN_CONTENT_H;
  const btnCanvasH = optimiseBtn.h * WIN_CONTENT_H * zoom2;

  // Pulsing coral highlight ring on Screen 1 risk card
  const coralPulse = frame >= c1At ? 0.5 + 0.5 * Math.sin(((frame - c1At) / 18) * Math.PI * 2) : 0;

  // Button pulse & click ripple at f600 on Screen 2 "Optimise Workload" button
  const btnPulse =
    frame >= c2At ? 0.5 + 0.5 * Math.sin(((frame - c2At) / 16) * Math.PI * 2) : 0;
  const clickRel = frame - clickAt;
  const rippleProgress = interpolate(clickRel, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleOpacity = interpolate(clickRel, [0, 4, 24], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonPressScale =
    clickRel >= 0 && clickRel < 12
      ? 1 - Math.sin((clickRel / 12) * Math.PI) * 0.08
      : 1 + btnPulse * 0.035;

  const heartLevels = [1, 1, 1, 0.24, 1, 1];
  const paperCounts = WORKER_SLOTS.map((w) => (w.index === 3 ? w.basePapers + 5 : w.basePapers));
  const coralBeacon = 0.5 + 0.5 * Math.sin((frame / 16) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SKY, overflow: "hidden" }}>
      {/* Soft background circles */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle cx={930} cy={170} r={120} fill={PALETTE.SKY_LIGHT} opacity={0.85} />
        <circle cx={140} cy={880} r={140} fill={PALETTE.SKY_LIGHT} opacity={0.8} />
      </svg>

      {/* Shrunken isometric office nestled gently in the bottom-left corner */}
      <IsometricOffice
        frame={globalFrame}
        originX={officeOriginX}
        originY={officeOriginY}
        scale={officeScale}
        heartLevels={heartLevels}
        paperCounts={paperCounts}
        worker3CoralRing={coralBeacon}
      />

      {/* Floating pastel browser-style window */}
      <div
        style={{
          position: "absolute",
          left: WIN_LEFT,
          top: WIN_TOP,
          width: WIN_W,
          height: WIN_HEADER_H + WIN_CONTENT_H,
          borderRadius: 24,
          backgroundColor: PALETTE.WHITE,
          border: `3px solid ${PALETTE.WHITE}`,
          boxShadow: "0 24px 54px rgba(15, 42, 82, 0.16)",
          overflow: "hidden",
          opacity: winOpacity,
          transform: `translate3d(${exitX.toFixed(1)}px, ${(enterY + exitY).toFixed(1)}px, 0)`,
        }}
      >
        {/* Browser window chrome bar with 3 flat pastel dots */}
        <div
          style={{
            height: WIN_HEADER_H,
            backgroundColor: PALETTE.SKY_LIGHT,
            borderBottom: `2px solid ${PALETTE.SKY}`,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 10,
          }}
        >
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: PALETTE.CORAL }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: PALETTE.AMBER }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: PALETTE.GREEN }} />
          <div
            style={{
              marginLeft: 18,
              height: 20,
              width: 340,
              borderRadius: 10,
              backgroundColor: PALETTE.WHITE,
              border: `1.5px solid ${PALETTE.SKY_DEEP}`,
            }}
          />
        </div>

        {/* Window viewport */}
        <div
          style={{
            width: WIN_W,
            height: WIN_CONTENT_H,
            position: "relative",
            overflow: "hidden",
            backgroundColor: PALETTE.SKY_LIGHT,
          }}
        >
          {/* SCREEN 1: public/team_burnout.png */}
          {swapProgress < 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 1 - swapProgress,
                transform: `scale(${zoom1.toFixed(4)})`,
                transformOrigin: `${(z1Org.ox * 100).toFixed(1)}% ${(z1Org.oy * 100).toFixed(1)}%`,
              }}
            >
              <Img
                src={staticFile("team_burnout.png")}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* Pulsing CORAL highlight ring tightly locked to Alex Rivera's risk card */}
              {frame >= c1At - 6 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${((riskCard.u - riskCard.w / 2) * 100).toFixed(3)}%`,
                    top: `${((riskCard.v - riskCard.h / 2) * 100).toFixed(3)}%`,
                    width: `${(riskCard.w * 100).toFixed(3)}%`,
                    height: `${(riskCard.h * 100).toFixed(3)}%`,
                    borderRadius: 16,
                    border: `4px solid ${PALETTE.CORAL}`,
                    boxShadow: `0 0 0 ${(4 + coralPulse * 9).toFixed(1)}px rgba(217, 105, 79, ${(
                      0.45 -
                      coralPulse * 0.25
                    ).toFixed(2)})`,
                    boxSizing: "border-box",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          )}

          {/* SCREEN 2: public/workload_optimizer.png (or public/app_demo.mp4 if supplied) */}
          {swapProgress > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: swapProgress,
                transform: assets.hasAppDemoVideo ? undefined : `scale(${zoom2.toFixed(4)})`,
                transformOrigin: `${(z2Org.ox * 100).toFixed(1)}% ${(z2Org.oy * 100).toFixed(1)}%`,
              }}
            >
              {assets.hasAppDemoVideo ? (
                <OffthreadVideo
                  src={staticFile("app_demo.mp4")}
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <>
                  <Img
                    src={staticFile("workload_optimizer.png")}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {/* Pulsing highlight & f600 click ripple locked onto "Optimise Workload" button */}
                  {frame >= c2At - 6 && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${((optimiseBtn.u - optimiseBtn.w / 2) * 100).toFixed(3)}%`,
                        top: `${((optimiseBtn.v - optimiseBtn.h / 2) * 100).toFixed(3)}%`,
                        width: `${(optimiseBtn.w * 100).toFixed(3)}%`,
                        height: `${(optimiseBtn.h * 100).toFixed(3)}%`,
                        borderRadius: 14,
                        border: `4px solid ${PALETTE.NAVY}`,
                        boxShadow: `0 0 0 ${(3 + btnPulse * 7).toFixed(1)}px rgba(79, 158, 122, 0.55)`,
                        transform: `scale(${buttonPressScale.toFixed(4)})`,
                        boxSizing: "border-box",
                        pointerEvents: "none",
                      }}
                    >
                      {/* Expanding concentric click ripple at f600 */}
                      {clickRel >= 0 && rippleOpacity > 0.01 && (
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 200 60"
                          style={{ position: "absolute", inset: 0, overflow: "visible" }}
                        >
                          <circle
                            cx={100}
                            cy={30}
                            r={14 + rippleProgress * 95}
                            fill="none"
                            stroke={PALETTE.WHITE}
                            strokeWidth={6}
                            strokeOpacity={rippleOpacity}
                          />
                          <circle
                            cx={100}
                            cy={30}
                            r={10 + rippleProgress * 62}
                            fill="none"
                            stroke={PALETTE.GREEN}
                            strokeWidth={4}
                            strokeOpacity={rippleOpacity}
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Callout 1 (f440): "RED = NEEDS HELP." pointing cleanly down at CORAL risk card */}
      <Callout
        startFrame={c1At}
        endFrame={swapAt + 4}
        label={COPY.s4Callout1}
        labelX={540}
        labelY={134}
        labelMaxWidth={620}
        labelFontSize={44}
        labelColor={PALETTE.NAVY}
        pillBg={PALETTE.WHITE}
        arrowColor={PALETTE.CORAL}
        fromX={485}
        fromY={172}
        ctrlX={445}
        ctrlY={235}
        toX={cardCanvasX + 8}
        toY={cardCanvasY - cardCanvasH / 2 - 6}
      />

      {/* Callout 2 (f560): "ONE CLICK TO BALANCE." pointing cleanly up at "Optimise Workload" button */}
      <Callout
        startFrame={c2At}
        endFrame={outStart + 6}
        label={COPY.s4Callout2}
        labelX={695}
        labelY={862}
        labelMaxWidth={540}
        labelFontSize={38}
        labelColor={PALETTE.NAVY}
        pillBg={PALETTE.WHITE}
        arrowColor={PALETTE.GREEN}
        fromX={770}
        fromY={826}
        ctrlX={818}
        ctrlY={796}
        toX={btnCanvasX - 10}
        toY={btnCanvasY + btnCanvasH / 2 + 6}
      />

      {/* Tiny "DEMO DATA" bottom-right (40% opacity, inside 90 px safe margin) */}
      <div
        style={{
          position: "absolute",
          right: VIDEO.safeMargin,
          bottom: VIDEO.safeMargin,
          fontFamily: POPPINS_FONT,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "2px",
          color: PALETTE.NAVY,
          opacity: 0.4,
        }}
      >
        {COPY.s4DemoData}
      </div>
    </AbsoluteFill>
  );
};
