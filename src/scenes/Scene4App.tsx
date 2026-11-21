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
import { AppWindow } from "../lib/AppWindow";
import { FitText } from "../lib/FitText";
import { INTER_FONT } from "../lib/fonts";
import { COPY, HR_SCREEN_TARGETS, PALETTE, TIMELINE, VIDEO } from "../timeline";

const WIN_W = 940;
const WIN_CONTENT_H = 840;
const IMG_BASE = 940; // 1080x1080 UI screens displayed in 940x940 inner box

/**
 * S4 THE APP (f420-689): Rounded 3-dot AppWindow (width 940, r=28) rises from bottom to center.
 * - f440-535: public/cv_screening.png — slow zoom to AI-ranked shortlist cards; pulsing GOLD ring
 *   around top-ranked candidate (#1 Maya Chen 97%); serif "CVs ranked in seconds." at top (f450).
 * - f535-669: crossfades cleanly inside the same window to public/hr_chatbot.png (or public/app_demo.mp4
 *   via <OffthreadVideo> if present); gentle pan to prompt & instant AI answer; serif "Ask your own HR data." (f550).
 * - f610: CREAM chat-spark SVG icon + "CUSTOMIZED HR CHATBOT." (Inter 800, caps, 3px tracking);
 *   soft zoom toward the chatbot's instant reply panel.
 * - Tiny "DEMO DATA" (40% opacity) bottom-right. f670-689: window glides back down.
 */
export const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = TIMELINE.S4;

  const zCvStart = s4.zoomCvStart - s4.start; // 20 (f440)
  const line1At = s4.line1At - s4.start; // 30 (f450)
  const swapAt = s4.crossfadeAt - s4.start; // 115 (f535)
  const line2At = s4.line2At - s4.start; // 130 (f550)
  const focusAt = s4.chatbotFocusAt - s4.start; // 190 (f610)
  const downS = s4.windowDownStart - s4.start; // 250 (f670)
  const downE = s4.windowDownEnd - s4.start; // 269 (f689)

  // Window gentle rise from bottom & calm slide-down exit
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
  const winOpacity =
    interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }) * (1 - exitP * 0.9);

  // Smooth crossfade from cv_screening.png -> hr_chatbot.png at f535 (over 14 frames)
  const swapP = interpolate(frame, [swapAt, swapAt + 14], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Screen 1 (cv_screening.png) slow zoom: 1.0 -> 1.08, ty: 0 -> -28 (keeps all cards unclipped!)
  const cvZoomP = interpolate(frame, [zCvStart - 4, zCvStart + 44], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cvScale = 1.0 + cvZoomP * 0.08;
  const cvTy = -28 * cvZoomP;

  // Pulsing GOLD ring around #1 top-ranked candidate card
  const goldFade =
    interpolate(frame, [zCvStart - 2, zCvStart + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    (1 - swapP);
  const goldPulse = 0.5 + 0.5 * Math.sin(((frame - zCvStart) / 20) * Math.PI * 2);

  // Screen 2 (hr_chatbot.png):
  // Phase A (f535..609): unclipped full view of header + user prompt + AI instant answer (scale 1.0 -> 1.02, ty = 0)
  // Phase B (f610..670): soft zoom smoothly past header directly onto the AI instant reply panel (scale 1.09, ty = -176)
  const chatPanA = interpolate(frame, [swapAt, swapAt + 34], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chatFocusB = interpolate(frame, [focusAt - 4, focusAt + 26], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chatScale = 1.0 + chatPanA * 0.02 + chatFocusB * 0.07;
  const chatTy = -176 * chatFocusB;

  const replyRingOp = interpolate(frame, [focusAt + 2, focusAt + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const replyPulse = 0.5 + 0.5 * Math.sin(((frame - focusAt) / 18) * Math.PI * 2);

  // Three top caption beats cleanly inside y = 265..440 (never overlapping each other!)
  const op1 =
    (frame < line1At - 10
      ? 0
      : interpolate(frame, [line1At - 10, line1At + 2], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    interpolate(frame, [swapAt - 6, swapAt + 6], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const op2 =
    (frame < line2At - 10
      ? 0
      : interpolate(frame, [line2At - 10, line2At + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    interpolate(frame, [focusAt - 10, focusAt + 4], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const op3 =
    (frame < focusAt - 4
      ? 0
      : interpolate(frame, [focusAt - 4, focusAt + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })) *
    (1 - exitP);

  const sparkScale =
    frame < focusAt - 4
      ? 0.7
      : spring({
          frame: frame - (focusAt - 4),
          fps,
          config: { damping: 13, stiffness: 165, mass: 0.85 },
        });

  const { topCandidate, chatbotReplyPanel } = HR_SCREEN_TARGETS;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.MIDNIGHT, overflow: "hidden" }}>
      {/* Top headline stage strictly inside safe area (y = 265..440, x = 110..970) */}
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
        {/* Beat 1 (f450): "CVs ranked in seconds." */}
        {op1 > 0.01 && (
          <div style={{ position: "absolute", opacity: op1 }}>
            <FitText
              text={COPY.s4Line1}
              font="serif"
              fontSize={92}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
            />
          </div>
        )}

        {/* Beat 2 (f550): "Ask your own HR data." */}
        {op2 > 0.01 && (
          <div style={{ position: "absolute", opacity: op2 }}>
            <FitText
              text={COPY.s4Line2}
              font="serif"
              fontSize={92}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
            />
          </div>
        )}

        {/* Beat 3 (f610): Clean chat-spark SVG icon (CREAM) + "CUSTOMIZED HR CHATBOT." (Inter 800, 3px tracking) */}
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
              width={60}
              height={60}
              viewBox="0 0 64 64"
              style={{ transform: `scale(${sparkScale.toFixed(4)})`, display: "block" }}
            >
              {/* Rounded speech bubble outline */}
              <path
                d="M 12 16 C 12 11.6 15.6 8 20 8 H 44 C 48.4 8 52 11.6 52 16 V 36 C 52 40.4 48.4 44 44 44 H 28 L 16 54 V 44 H 20 C 15.6 44 12 40.4 12 36 Z"
                fill="none"
                stroke={PALETTE.CREAM}
                strokeWidth={4.2}
                strokeLinejoin="round"
              />
              {/* Crisp 4-point AI spark centered inside chat bubble */}
              <path
                d="M 32 16 L 34.8 23.2 L 42 26 L 34.8 28.8 L 32 36 L 29.2 28.8 L 22 26 L 29.2 23.2 Z"
                fill={PALETTE.CREAM}
              />
            </svg>
            <FitText
              text={COPY.s4Badge}
              font="sans"
              fontSize={42}
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
          {/* SCREEN 1 (f420-549): public/cv_screening.png */}
          {swapP < 1 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: IMG_BASE,
                height: IMG_BASE,
                opacity: 1 - swapP,
                transform: `translate3d(0, ${cvTy.toFixed(1)}px, 0) scale(${cvScale.toFixed(4)})`,
                transformOrigin: "50% 0%",
              }}
            >
              <Img
                src={staticFile("cv_screening.png")}
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
              {/* Pulsing GOLD ring tightly framing top-ranked candidate (#1 Maya Chen 97%) */}
              {goldFade > 0.01 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${((topCandidate.u - topCandidate.w / 2) * 100).toFixed(2)}%`,
                    top: `${((topCandidate.v - topCandidate.h / 2) * 100).toFixed(2)}%`,
                    width: `${(topCandidate.w * 100).toFixed(2)}%`,
                    height: `${(topCandidate.h * 100).toFixed(2)}%`,
                    borderRadius: 22,
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
            </div>
          )}

          {/* SCREEN 2 (f535-689): public/hr_chatbot.png (or public/app_demo.mp4 via <OffthreadVideo>) */}
          {swapP > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: IMG_BASE,
                height: IMG_BASE,
                opacity: swapP,
                transform: assets.hasAppDemoVideo
                  ? undefined
                  : `translate3d(0, ${chatTy.toFixed(1)}px, 0) scale(${chatScale.toFixed(4)})`,
                transformOrigin: "50% 0%",
              }}
            >
              {assets.hasAppDemoVideo ? (
                <OffthreadVideo
                  src={staticFile("app_demo.mp4")}
                  muted
                  style={{ width: "100%", height: WIN_CONTENT_H, objectFit: "cover" }}
                />
              ) : (
                <>
                  <Img
                    src={staticFile("hr_chatbot.png")}
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                  />
                  {/* Soft pulsing highlight around the AI Instant Reply panel at f610+ */}
                  {replyRingOp > 0.01 && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${((chatbotReplyPanel.u - chatbotReplyPanel.w / 2) * 100).toFixed(2)}%`,
                        top: `${((chatbotReplyPanel.v - chatbotReplyPanel.h / 2) * 100).toFixed(2)}%`,
                        width: `${(chatbotReplyPanel.w * 100).toFixed(2)}%`,
                        height: `${(chatbotReplyPanel.h * 100).toFixed(2)}%`,
                        borderRadius: 24,
                        border: `4px solid ${PALETTE.TEAL}`,
                        boxShadow: `0 0 0 ${(4 + replyPulse * 9).toFixed(1)}px rgba(95, 168, 160, ${(
                          (0.44 - replyPulse * 0.2) *
                          replyRingOp
                        ).toFixed(2)})`,
                        opacity: replyRingOp,
                        boxSizing: "border-box",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </AppWindow>
      </div>

      {/* Tiny "DEMO DATA" (40% opacity) bottom-right inside social-safe area */}
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
