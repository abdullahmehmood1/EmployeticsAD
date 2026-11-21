import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COPY, PALETTE, SELF_AWARENESS_TARGETS, TIMELINE, VIDEO } from "../timeline";
import { AppWindow } from "../lib/AppWindow";
import { FitText } from "../lib/FitText";
import { INTER_FONT } from "../lib/fonts";

const WIN_W = 940;
const WIN_CONTENT_H = 840;
const IMG_BASE = 940; // 1080x1080 PNG displayed in 940x940 inner box

/**
 * S4 THE APP (f420-689): Calm private self-awareness app window (width 940, r=28, 3 dots)
 * rises smoothly from bottom to center.
 * - f440: slow zoom to "Pattern Alerts" weekend-work card + pulsing GOLD ring + "It noticed." (f450)
 * - f540: smooth pan to "Personal Risk Level" gauge + "Before you did." (f550)
 * - f610: CREAM padlock + "ONLY YOU CAN SEE THIS." (Inter 800, caps, 3px tracking) + zoom toward
 *         "Visible only to you" subtitle.
 * - Tiny "DEMO DATA" (40% opacity) bottom-right inside safe area.
 * - f670-689: window glides calmly back down.
 */
export const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = TIMELINE.S4;

  const zPattern = s4.zoomPatternStart - s4.start; // 20 (f440)
  const line1At = s4.line1At - s4.start; // 30 (f450)
  const panGauge = s4.panGaugeStart - s4.start; // 120 (f540)
  const line2At = s4.line2At - s4.start; // 130 (f550)
  const privAt = s4.privateAt - s4.start; // 190 (f610)
  const downS = s4.windowDownStart - s4.start; // 250 (f670)
  const downE = s4.windowDownEnd - s4.start; // 269 (f689)

  // Window gentle spring rise from bottom & calm slide-down exit
  const riseSpr = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110, mass: 1.0 },
  });
  const riseY = interpolate(riseSpr, [0, 1], [620, 0]);
  const exitP = interpolate(frame, [downS, downE], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(exitP, [0, 1], [0, 960]);
  const winOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }) * (1 - exitP * 0.9);

  // Smooth 3-stop camera choreography on public/self_awareness.png (zero text edge clipping!):
  // Stop 1 (f440..535): Pattern Alerts card (scale 1.0 -> 1.08, ty = -30)
  // Stop 2 (f540..605): Personal Risk Level gauge (scale 1.08 -> 1.09, ty = -184)
  // Stop 3 (f610..670): "Visible only to you" privacy header (scale 1.09 -> 1.24, ty = 0)
  const p1 = interpolate(frame, [zPattern - 5, zPattern + 24], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2 = interpolate(frame, [panGauge - 6, panGauge + 22], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3 = interpolate(frame, [privAt - 6, privAt + 22], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sequential piecewise blend of scale and vertical pan offset (transformOrigin: "50% 0%")
  let imgScale = 1.0 + p1 * 0.08;
  let imgTy = -30 * p1;
  if (p2 > 0) {
    imgScale = 1.08 + p2 * 0.01;
    imgTy = -30 + p2 * (-184 - -30);
  }
  if (p3 > 0) {
    imgScale = 1.09 + p3 * 0.15;
    imgTy = -184 + p3 * (0 - -184);
  }

  // Pulsing GOLD ring around Pattern Alerts weekend-work alert box during Stop 1
  const goldActive = frame >= zPattern && frame < panGauge + 14;
  const goldFade =
    interpolate(frame, [zPattern, zPattern + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [panGauge - 4, panGauge + 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const goldPulse = 0.5 + 0.5 * Math.sin(((frame - zPattern) / 20) * Math.PI * 2);

  // Subtle TEAL highlight around "Visible only to you" privacy pill during Stop 3
  const privHighlightOp = interpolate(frame, [privAt + 4, privAt + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const privPulse = 0.5 + 0.5 * Math.sin(((frame - privAt) / 18) * Math.PI * 2);

  // Three top caption beats cleanly inside y = 255..430 (never overlapping each other!)
  const op1 =
    (frame < line1At - 10
      ? 0
      : interpolate(frame, [line1At - 10, line1At + 2], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    interpolate(frame, [panGauge - 10, panGauge + 4], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const op2 =
    (frame < line2At - 6
      ? 0
      : interpolate(frame, [line2At - 6, line2At + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    interpolate(frame, [privAt - 10, privAt + 4], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const op3 =
    (frame < privAt - 4
      ? 0
      : interpolate(frame, [privAt - 4, privAt + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    (1 - exitP);

  const lockScale =
    frame < privAt - 4
      ? 0.7
      : spring({
          frame: frame - (privAt - 4),
          fps,
          config: { damping: 13, stiffness: 165, mass: 0.85 },
        });

  const { patternAlert, privacyBadge } = SELF_AWARENESS_TARGETS;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.MIDNIGHT, overflow: "hidden" }}>
      {/* Top headline stage strictly inside safe area (y = 265..435, x = 110..970) */}
      <div
        style={{
          position: "absolute",
          top: VIDEO.safeTop + 18,
          left: VIDEO.safeLeft,
          right: VIDEO.width - VIDEO.safeRight,
          height: 170,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Beat 1 (f450): "It noticed." */}
        {op1 > 0.01 && (
          <div style={{ position: "absolute", opacity: op1 }}>
            <FitText
              text={COPY.s4Line1}
              font="serif"
              fontSize={106}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
            />
          </div>
        )}

        {/* Beat 2 (f550): "Before you did." */}
        {op2 > 0.01 && (
          <div style={{ position: "absolute", opacity: op2 }}>
            <FitText
              text={COPY.s4Line2}
              font="serif"
              fontSize={100}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
            />
          </div>
        )}

        {/* Beat 3 (f610): Simple SVG padlock (CREAM) + "ONLY YOU CAN SEE THIS." (Inter 800, caps, 3px tracking) */}
        {op3 > 0.01 && (
          <div
            style={{
              position: "absolute",
              opacity: op3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <svg
              width={58}
              height={58}
              viewBox="0 0 64 64"
              style={{ transform: `scale(${lockScale.toFixed(4)})`, display: "block" }}
            >
              <path
                d="M 20 28 V 20 C 20 12.8 25.4 8 32 8 C 38.6 8 44 12.8 44 20 V 28"
                fill="none"
                stroke={PALETTE.CREAM}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <rect x={13} y={27} width={38} height={29} rx={8} fill={PALETTE.CREAM} />
              <circle cx={32} cy={40} r={4} fill={PALETTE.MIDNIGHT} />
              <rect x={30.3} y={42} width={3.4} height={7} rx={1.5} fill={PALETTE.MIDNIGHT} />
            </svg>
            <FitText
              text={COPY.s4Private}
              font="sans"
              fontSize={44}
              fontWeight={800}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
              letterSpacing={3}
            />
          </div>
        )}
      </div>

      {/* Centered Rounded App Window (width 940, y = 472..1356, well inside safe zone!) */}
      <div
        style={{
          position: "absolute",
          top: 472,
          left: (VIDEO.width - WIN_W) / 2,
          opacity: winOpacity,
          transform: `translate3d(0, ${(riseY + exitY).toFixed(1)}px, 0)`,
        }}
      >
        <AppWindow width={WIN_W} contentHeight={WIN_CONTENT_H}>
          <div
            style={{
              width: IMG_BASE,
              height: IMG_BASE,
              position: "relative",
              transform: `translate3d(0, ${imgTy.toFixed(1)}px, 0) scale(${imgScale.toFixed(4)})`,
              transformOrigin: "50% 0%",
            }}
          >
            <Img
              src={staticFile("self_awareness.png")}
              style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
            />

            {/* Pulsing GOLD highlight ring around "Pattern Alerts" weekend-work alert */}
            {goldActive && goldFade > 0.01 && (
              <div
                style={{
                  position: "absolute",
                  left: `${((patternAlert.u - patternAlert.w / 2) * 100).toFixed(2)}%`,
                  top: `${((patternAlert.v - patternAlert.h / 2) * 100).toFixed(2)}%`,
                  width: `${(patternAlert.w * 100).toFixed(2)}%`,
                  height: `${(patternAlert.h * 100).toFixed(2)}%`,
                  borderRadius: 18,
                  border: `4px solid ${PALETTE.GOLD}`,
                  boxShadow: `0 0 0 ${(5 + goldPulse * 11).toFixed(1)}px rgba(240, 182, 90, ${(
                    (0.42 - goldPulse * 0.2) *
                    goldFade
                  ).toFixed(2)})`,
                  opacity: goldFade,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Pulsing soft CREAM/TEAL ring around "Visible only to you" subtitle pill */}
            {privHighlightOp > 0.01 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: `${((privacyBadge.u - privacyBadge.w / 2) * 100).toFixed(2)}%`,
                    top: `${((privacyBadge.v - privacyBadge.h / 2) * 100).toFixed(2)}%`,
                    width: `${(privacyBadge.w * 100).toFixed(2)}%`,
                    height: `${(privacyBadge.h * 100).toFixed(2)}%`,
                    borderRadius: 999,
                    border: `3.5px solid ${PALETTE.CREAM}`,
                    boxShadow: `0 0 0 ${(4 + privPulse * 8).toFixed(1)}px rgba(95, 168, 160, ${(
                      (0.5 - privPulse * 0.22) *
                      privHighlightOp
                    ).toFixed(2)})`,
                    opacity: privHighlightOp,
                    boxSizing: "border-box",
                    pointerEvents: "none",
                  }}
                />
                {/* Soft midnight focus veil over lower cards during privacy zoom */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "18%",
                    bottom: 0,
                    background: `linear-gradient(180deg, rgba(11,27,51,0) 0%, rgba(11,27,51,${(
                      0.62 * privHighlightOp
                    ).toFixed(2)}) 45%, rgba(11,27,51,${(0.82 * privHighlightOp).toFixed(2)}) 100%)`,
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        </AppWindow>
      </div>

      {/* Tiny "DEMO DATA" (40% opacity) bottom-right inside social-safe area (y<=1500, x<=970) */}
      <div
        style={{
          position: "absolute",
          right: VIDEO.width - VIDEO.safeRight,
          top: VIDEO.safeBottom - 36,
          fontFamily: INTER_FONT,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "2.5px",
          color: PALETTE.CREAM,
          opacity: 0.4 * (1 - exitP),
        }}
      >
        {COPY.s4DemoData}
      </div>
    </AbsoluteFill>
  );
};
