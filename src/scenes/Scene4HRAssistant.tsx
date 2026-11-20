import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Bot, Database, Send, Sparkles, Zap } from "lucide-react";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const USER_PROMPT = "Who on Engineering is showing early burnout signs this week?";

export const Scene4HRAssistant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [388, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const modalSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 15, stiffness: 115 },
  });

  // Live typing animation (frames 22 -> 130)
  const typedChars = Math.floor(
    interpolate(frame, [22, 130], [0, USER_PROMPT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const displayedPrompt = USER_PROMPT.slice(0, typedChars);
  const showCursor = frame >= 16 && frame < 142 && Math.floor(frame / 14) % 2 === 0;

  // Send button click press (frame 138-152)
  const sendPress = interpolate(frame, [138, 144, 152], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Thinking shimmer (frames 148-182)
  const isThinking = frame >= 148 && frame < 184;

  // AI Response card enters cleanly at frame 180 (~27.0s)
  const responseSpring = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const item1Spring = spring({
    frame: Math.max(0, frame - 208),
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  const item2Spring = spring({
    frame: Math.max(0, frame - 242),
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  const actionsSpring = spring({
    frame: Math.max(0, frame - 285),
    fps,
    config: { damping: 14, stiffness: 135 },
  });

  // Active pulse + live automated cursor click on primary action button
  const actionPulse = frame >= 315 ? 0.5 + 0.5 * Math.sin((frame - 315) * 0.22) : 0;
  const actionClicked = frame >= 352;

  // Animated pointer cursor choreography: enters -> clicks Send (f=142) -> clicks Action chip (f=352)
  const cursorOpacity = interpolate(frame, [95, 112, 385, 405], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(
    frame,
    [95, 134, 165, 315, 348],
    [1360, 1665, 1665, 620, 355],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );
  const cursorY = interpolate(
    frame,
    [95, 134, 165, 315, 348],
    [540, 442, 442, 740, 780],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );
  const cursorScale =
    (frame >= 138 && frame <= 148) || (frame >= 349 && frame <= 359) ? 0.86 : 1.0;

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.08})`,
        padding: "66px 140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Heading */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 999,
            background: "rgba(6, 182, 212, 0.14)",
            border: "1px solid rgba(34, 211, 238, 0.38)",
            fontFamily: FONTS.mono,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: COLORS.cyanBright,
            marginBottom: 14,
          }}
        >
          <Sparkles size={16} />
          EMPLOYETICS AI HR ASSISTANT
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: COLORS.textPrimary,
          }}
        >
          Ask anything. Answered in seconds.
        </div>
      </div>

      {/* Main Glass AI Chat Window */}
      <div
        style={{
          flex: 1,
          marginTop: 26,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateY(${interpolate(modalSpring, [0, 1], [44, 0])}px) scale(${interpolate(
            modalSpring,
            [0, 1],
            [0.96, 1]
          )})`,
        }}
      >
        <GlassCard
          accentColor={COLORS.cyanBright}
          glow
          padding={36}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            minHeight: 650,
            justifyContent: "space-between",
          }}
        >
          {/* Window Chrome Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 18,
              borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <EmployeticsLogo size={38} showWordmark={false} />
              <div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 21,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                  }}
                >
                  HR Copilot
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    color: COLORS.emeraldBright,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: COLORS.emeraldBright,
                    }}
                  />
                  Connected to HRIS, Jira & Feedback
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {["Attendance", "Tasks", "Peer Reviews"].map((src, idx) => {
                const scanLit = isThinking && Math.floor((frame - 148) / 11) >= idx;
                return (
                  <span
                    key={src}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 13px",
                      borderRadius: 999,
                      background: scanLit
                        ? "rgba(34, 211, 238, 0.28)"
                        : "rgba(99, 102, 241, 0.14)",
                      border: scanLit
                        ? "1px solid rgba(34, 211, 238, 0.85)"
                        : "1px solid rgba(129, 140, 248, 0.30)",
                      boxShadow: scanLit ? "0 0 18px rgba(34, 211, 238, 0.45)" : "none",
                      fontFamily: FONTS.mono,
                      fontSize: 13,
                      color: scanLit ? "#FFFFFF" : "#C7D2FE",
                    }}
                  >
                    <Database size={13} />
                    {src}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Chat Thread Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Prompt Input / Sent User Message */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                padding: "18px 24px",
                borderRadius: 18,
                background:
                  frame >= 145
                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(6, 182, 212, 0.16))"
                    : "rgba(5, 8, 20, 0.72)",
                border:
                  frame >= 145
                    ? "1.5px solid rgba(129, 140, 248, 0.55)"
                    : "1.5px solid rgba(34, 211, 238, 0.45)",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 24,
                  fontWeight: 500,
                  color: COLORS.textPrimary,
                  minHeight: 34,
                }}
              >
                {displayedPrompt}
                {showCursor && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 3,
                      height: 26,
                      background: COLORS.cyanBright,
                      marginLeft: 4,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${sendPress})`,
                  boxShadow: "0 0 22px rgba(6, 182, 212, 0.45)",
                  flexShrink: 0,
                }}
              >
                <Send color="#FFFFFF" size={21} />
              </div>
            </div>

            {/* Thinking Shimmer Pill */}
            {isThinking && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 22px",
                  borderRadius: 14,
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  width: "fit-content",
                }}
              >
                <Bot color={COLORS.cyanBright} size={22} />
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: COLORS.cyanBright,
                  }}
                >
                  Scanning live engineering attendance, sprint load & feedback...
                </span>
              </div>
            )}

            {/* Grounded AI Response Card */}
            {frame >= 180 && (
              <div
                style={{
                  opacity: responseSpring,
                  transform: `translateY(${interpolate(responseSpring, [0, 1], [28, 0])}px)`,
                  background: "rgba(7, 12, 26, 0.78)",
                  border: "1px solid rgba(34, 211, 238, 0.30)",
                  borderRadius: 20,
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {/* Grounded speed badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Zap color={COLORS.cyanBright} size={20} />
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 22,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                      }}
                    >
                      2 engineers show elevated burnout signals this week:
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.emeraldBright,
                      background: "rgba(16, 185, 129, 0.14)",
                      border: "1px solid rgba(52, 211, 153, 0.35)",
                      padding: "6px 14px",
                      borderRadius: 999,
                    }}
                  >
                    ⚡ 1.2s • YOUR LIVE DATA
                  </span>
                </div>

                {/* Result 1 */}
                <div
                  style={{
                    opacity: item1Spring,
                    transform: `translateX(${interpolate(item1Spring, [0, 1], [24, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: "rgba(244, 63, 94, 0.10)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 20,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                      }}
                    >
                      1. Alex Rivera
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 18,
                        color: "#CBD5E1",
                        marginLeft: 12,
                      }}
                    >
                      — +14.5h late-night overtime & 34% drop in peer feedback.
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#FDA4AF",
                    }}
                  >
                    91% RISK
                  </span>
                </div>

                {/* Result 2 */}
                <div
                  style={{
                    opacity: item2Spring,
                    transform: `translateX(${interpolate(item2Spring, [0, 1], [24, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: "rgba(245, 158, 11, 0.10)",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 20,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                      }}
                    >
                      2. Maya Lin
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 18,
                        color: "#CBD5E1",
                        marginLeft: 12,
                      }}
                    >
                      — 5 consecutive weekend logins & 2 missed 1:1 check-ins.
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#FCD34D",
                    }}
                  >
                    78% RISK
                  </span>
                </div>

                {/* One-click Action Chips */}
                <div
                  style={{
                    opacity: actionsSpring,
                    transform: `translateY(${interpolate(actionsSpring, [0, 1], [16, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      padding: "11px 22px",
                      borderRadius: 12,
                      background: actionClicked
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
                      fontFamily: FONTS.display,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      boxShadow: actionClicked
                        ? "0 0 28px rgba(16, 185, 129, 0.65)"
                        : `0 0 ${18 + actionPulse * 20}px rgba(6, 182, 212, ${
                            0.45 + actionPulse * 0.35
                          })`,
                    }}
                  >
                    {actionClicked ? "✓ 1:1 Check-In Agenda Drafted" : "✦ Draft 1:1 Check-In Agenda"}
                  </div>
                  <div
                    style={{
                      padding: "11px 20px",
                      borderRadius: 12,
                      background: "rgba(148, 163, 184, 0.12)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                      fontFamily: FONTS.body,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#E2E8F0",
                    }}
                  >
                    Rebalance Sprint Tasks
                  </div>
                  <div
                    style={{
                      padding: "11px 20px",
                      borderRadius: 12,
                      background: "rgba(148, 163, 184, 0.12)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                      fontFamily: FONTS.body,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#E2E8F0",
                    }}
                  >
                    Notify Engineering Lead
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Animated Precision UI Pointer Cursor */}
      {cursorOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            opacity: cursorOpacity,
            transform: `scale(${cursorScale})`,
            pointerEvents: "none",
            zIndex: 20,
            filter: "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.65))",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 3L23 13.5L14.5 16L11.5 24.5L5 3Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
