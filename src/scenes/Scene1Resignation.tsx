import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AlertTriangle, Calendar, Clock, Mail, TrendingDown } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

export const Scene1Resignation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Resignation Email enters (0-140)
  const emailIn = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
  });

  // Email recedes upward cleanly when "No warning" & signs arrive
  const emailRecede = interpolate(frame, [130, 185], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const emailFadeOut = interpolate(frame, [215, 250], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const emailY = interpolate(emailIn, [0, 1], [90, 0]) - emailRecede * 200;
  const emailScale = interpolate(emailIn, [0, 1], [0.86, 1]) - emailRecede * 0.24;
  const emailRotateX = interpolate(emailIn, [0, 1], [14, 2]) + emailRecede * 10;

  // Shockwave rings behind resignation card
  const ring1 = interpolate(frame, [14, 95], [0.6, 1.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring1Op = interpolate(frame, [14, 30, 95], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ring2 = interpolate(frame, [30, 115], [0.6, 2.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring2Op = interpolate(frame, [30, 48, 115], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: "No warning." punch-in (frames 132-228)
  const noWarningSpring = spring({
    frame: Math.max(0, frame - 135),
    fps,
    config: { damping: 14, stiffness: 150 },
  });
  const noWarningExit = interpolate(frame, [205, 232], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Horizontal scanner sweep transitioning into data signals
  const scanX = interpolate(frame, [200, 265], [-25, 125], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const scanOpacity = interpolate(frame, [200, 215, 250, 265], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: "But the signs were there" header + 3 cards
  const signsHeaderIn = spring({
    frame: Math.max(0, frame - 222),
    fps,
    config: { damping: 16, stiffness: 130 },
  });

  const card1Spring = spring({
    frame: Math.max(0, frame - 245), // ~4.1s "late nights"
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const card2Spring = spring({
    frame: Math.max(0, frame - 305), // ~5.1s "lost weekends"
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const card3Spring = spring({
    frame: Math.max(0, frame - 360), // ~6.0s "falling feedback"
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Phase 4: "Hidden in the data." highlight (frames 430-540)
  const hiddenTagSpring = spring({
    frame: Math.max(0, frame - 432),
    fps,
    config: { damping: 15, stiffness: 135 },
  });

  // Scene exit zoom-through (frames 510-540)
  const exitProgress = interpolate(frame, [508, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const sceneScale = 1 + exitProgress * 0.16;
  const sceneOpacity = 1 - exitProgress;

  // Late night bar chart heights
  const lateBars = [
    { label: "9PM", val: 0.42 },
    { label: "10PM", val: 0.65 },
    { label: "11PM", val: 0.88 },
    { label: "12AM", val: 0.96 },
    { label: "1AM", val: 0.82 },
    { label: "2AM", val: 0.68 },
  ];

  // Falling feedback SVG path draw progress
  const feedbackDraw = interpolate(frame, [375, 435], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        perspective: 1400,
        opacity: sceneOpacity,
        transform: `scale(${sceneScale})`,
      }}
    >
      {/* Expanding crimson alert rings behind resignation notification */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: `2px solid ${COLORS.crimson}`,
            opacity: ring1Op * emailFadeOut,
            transform: `scale(${ring1})`,
            boxShadow: `0 0 40px ${COLORS.crimsonGlow}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: `1.5px solid ${COLORS.crimson}`,
            opacity: ring2Op * emailFadeOut,
            transform: `scale(${ring2})`,
          }}
        />
      </AbsoluteFill>

      {/* PHASE 1: Resignation Email Notification Card */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: emailIn * emailFadeOut,
          transform: `translateY(${emailY}px) scale(${emailScale}) rotateX(${emailRotateX}deg)`,
        }}
      >
        <GlassCard
          accentColor={COLORS.crimson}
          glow
          padding={38}
          style={{ width: 920 }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 26,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #F43F5E 0%, #9F1239 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 24px rgba(244, 63, 94, 0.45)",
                }}
              >
                <Mail color="#FFFFFF" size={28} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 24,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                  }}
                >
                  Alex Rivera
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 17,
                    color: COLORS.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 2,
                  }}
                >
                  <span>Staff Software Engineer</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span
                    style={{
                      color: COLORS.cyanBright,
                      fontWeight: 600,
                    }}
                  >
                    Top 1% Performer
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 999,
                background: "rgba(244, 63, 94, 0.16)",
                border: "1px solid rgba(244, 63, 94, 0.45)",
                fontFamily: FONTS.mono,
                fontSize: 15,
                fontWeight: 600,
                color: "#FDA4AF",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: COLORS.crimson,
                  boxShadow: `0 0 12px ${COLORS.crimson}`,
                  opacity: 0.55 + 0.45 * Math.sin(frame * 0.25),
                }}
              />
              JUST NOW • URGENT
            </div>
          </div>

          {/* Subject line */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: COLORS.textPrimary,
              marginBottom: 16,
            }}
          >
            Notice of Resignation
          </div>

          {/* Email snippet */}
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              lineHeight: 1.55,
              color: "#CBD5E1",
              background: "rgba(5, 8, 20, 0.55)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            “Hi team — after much thought, I’ve decided to resign from my position effective two weeks from today. Thank you for the opportunity...”
          </div>
        </GlassCard>
      </AbsoluteFill>

      {/* PHASE 2: "No warning." kinetic typography */}
      {frame >= 130 && frame <= 245 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 220,
            opacity: noWarningSpring * noWarningExit,
            transform: `translateY(${interpolate(noWarningSpring, [0, 1], [38, 0])}px) scale(${interpolate(
              noWarningSpring,
              [0, 1],
              [0.92, 1]
            )})`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: COLORS.textPrimary,
              textShadow: "0 12px 48px rgba(244, 63, 94, 0.35)",
            }}
          >
            No warning<span style={{ color: COLORS.crimson }}>.</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Luminous scanner beam sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${scanX}%`,
          width: 240,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.25) 45%, rgba(34, 211, 238, 0.65) 50%, rgba(99, 102, 241, 0.25) 55%, transparent 100%)",
          opacity: scanOpacity,
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />

      {/* PHASE 3 & 4: "But the signs were there" + 3 Telemetry Signal Cards */}
      {frame >= 218 && (
        <AbsoluteFill
          style={{
            padding: "88px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              textAlign: "center",
              opacity: signsHeaderIn,
              transform: `translateY(${interpolate(signsHeaderIn, [0, 1], [24, 0])}px)`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(244, 63, 94, 0.14)",
                border: "1px solid rgba(244, 63, 94, 0.38)",
                fontFamily: FONTS.mono,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#FDA4AF",
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={16} />
              HISTORICAL TELEMETRY • LAST 30 DAYS
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 58,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: COLORS.textPrimary,
              }}
            >
              But the signs were already there.
            </div>
          </div>

          {/* Three Staggered Telemetry Signal Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 32,
              alignItems: "stretch",
            }}
          >
            {/* CARD 1: LATE NIGHTS */}
            <div
              style={{
                opacity: card1Spring,
                transform: `translateY(${interpolate(card1Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
                  card1Spring,
                  [0, 1],
                  [12, 3]
                )}deg)`,
              }}
            >
              <GlassCard
                accentColor={COLORS.crimson}
                glow={frame >= 245}
                padding={30}
                style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(244, 63, 94, 0.16)",
                        border: "1px solid rgba(244, 63, 94, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock color={COLORS.crimson} size={24} />
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#FDA4AF",
                        background: "rgba(244, 63, 94, 0.14)",
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      +14.5h / wk
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 32,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      marginTop: 20,
                    }}
                  >
                    Late Nights
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 17, color: COLORS.textSecondary, marginTop: 6 }}>
                    Consistent after-hours commits & Slack pings
                  </div>
                </div>

                {/* Animated Night Activity Bar Chart */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: 155,
                    gap: 10,
                    paddingTop: 14,
                  }}
                >
                  {lateBars.map((bar, idx) => {
                    const barGrow = spring({
                      frame: Math.max(0, frame - 255 - idx * 5),
                      fps,
                      config: { damping: 14, stiffness: 120 },
                    });
                    const isPeak = idx >= 2;
                    return (
                      <div
                        key={bar.label}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${bar.val * 115 * barGrow}px`,
                            borderRadius: "8px 8px 4px 4px",
                            background: isPeak
                              ? "linear-gradient(180deg, #FB7185 0%, #E11D48 100%)"
                              : "linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)",
                            boxShadow: isPeak ? "0 0 18px rgba(244, 63, 94, 0.45)" : "none",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: 12,
                            color: isPeak ? "#FDA4AF" : COLORS.textMuted,
                          }}
                        >
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* CARD 2: LOST WEEKENDS */}
            <div
              style={{
                opacity: card2Spring,
                transform: `translateY(${interpolate(card2Spring, [0, 1], [60, 0])}px)`,
              }}
            >
              <GlassCard
                accentColor={COLORS.amber}
                glow={frame >= 305}
                padding={30}
                style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(245, 158, 11, 0.16)",
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Calendar color={COLORS.amber} size={24} />
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#FCD34D",
                        background: "rgba(245, 158, 11, 0.14)",
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      6 IN A ROW
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 32,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      marginTop: 20,
                    }}
                  >
                    Lost Weekends
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 17, color: COLORS.textSecondary, marginTop: 6 }}>
                    Active logins & PR merges every Saturday & Sunday
                  </div>
                </div>

                {/* Mini 4x7 Calendar Heatmap highlighting Sat & Sun */}
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 8,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 12,
                          fontWeight: 700,
                          color: i >= 5 ? "#FCD34D" : COLORS.textMuted,
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const col = idx % 7;
                      const row = Math.floor(idx / 7);
                      const isWeekend = col >= 5;
                      const lit = spring({
                        frame: Math.max(0, frame - 314 - row * 7 - (isWeekend ? 4 : 0)),
                        fps,
                        config: { damping: 16, stiffness: 160 },
                      });
                      return (
                        <div
                          key={idx}
                          style={{
                            height: 26,
                            borderRadius: 6,
                            background: isWeekend
                              ? `rgba(245, 158, 11, ${0.22 + 0.65 * lit})`
                              : "rgba(148, 163, 184, 0.14)",
                            border: isWeekend
                              ? `1px solid rgba(251, 191, 36, ${0.7 * lit})`
                              : "1px solid rgba(148, 163, 184, 0.1)",
                            boxShadow: isWeekend && lit > 0.5 ? "0 0 12px rgba(245, 158, 11, 0.45)" : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* CARD 3: FALLING FEEDBACK */}
            <div
              style={{
                opacity: card3Spring,
                transform: `translateY(${interpolate(card3Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
                  card3Spring,
                  [0, 1],
                  [-12, -3]
                )}deg)`,
              }}
            >
              <GlassCard
                accentColor={COLORS.indigoBright}
                glow={frame >= 360}
                padding={30}
                style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(99, 102, 241, 0.18)",
                        border: "1px solid rgba(129, 140, 248, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingDown color={COLORS.crimson} size={24} />
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#FDA4AF",
                        background: "rgba(244, 63, 94, 0.16)",
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      -37% SCORE
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 32,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      marginTop: 20,
                    }}
                  >
                    Falling Feedback
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 17, color: COLORS.textSecondary, marginTop: 6 }}>
                    Peer reviews & 1:1 check-in sentiment declining
                  </div>
                </div>

                {/* Animated Downward Bezier Sparkline */}
                <div style={{ position: "relative", height: 150 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: FONTS.mono,
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: COLORS.emeraldBright }}>4.9 ★ Q2</span>
                    <span style={{ color: COLORS.crimson, fontWeight: 700 }}>3.1 ★ NOW</span>
                  </div>
                  <svg width="100%" height="122" viewBox="0 0 380 120" fill="none">
                    <defs>
                      <linearGradient id="dropLineGrad" x1="0" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#F43F5E" />
                      </linearGradient>
                      <linearGradient id="dropAreaGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="rgba(244, 63, 94, 0.25)" />
                        <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 22 C 85 20, 120 34, 175 48 C 235 64, 285 92, 365 104 L 365 120 L 10 120 Z"
                      fill="url(#dropAreaGrad)"
                      opacity={feedbackDraw}
                    />
                    <path
                      d="M 10 22 C 85 20, 120 34, 175 48 C 235 64, 285 92, 365 104"
                      stroke="url(#dropLineGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="420"
                      strokeDashoffset={420 * (1 - feedbackDraw)}
                    />
                    {feedbackDraw > 0.9 && (
                      <circle cx="365" cy="104" r="7" fill="#F43F5E" />
                    )}
                  </svg>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Bottom Callout: "Hidden in the data." */}
          <div
            style={{
              textAlign: "center",
              opacity: hiddenTagSpring,
              transform: `translateY(${interpolate(hiddenTagSpring, [0, 1], [24, 0])}px)`,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 34px",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(99, 102, 241, 0.20) 0%, rgba(6, 182, 212, 0.20) 100%)",
                border: "1px solid rgba(129, 140, 248, 0.45)",
                boxShadow: "0 0 36px rgba(99, 102, 241, 0.30)",
                fontFamily: FONTS.display,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.textPrimary,
                letterSpacing: "-0.015em",
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: COLORS.cyanBright,
                  boxShadow: `0 0 14px ${COLORS.cyanBright}`,
                }}
              />
              Hidden in the data.
            </span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
