import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CalendarOff, Compass, MoonStar, Sparkles, UserCheck } from "lucide-react";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { PaperCard } from "../components/PaperCard";
import { COLORS, FONTS } from "../theme";

const PATTERNS = [
  {
    title: "4 Consecutive Weekends",
    metric: "0 Full Rest Breaks",
    desc: "You logged in every Saturday & Sunday since Oct 4 — no 48-hour recovery window.",
    accent: COLORS.terracotta,
    softBg: COLORS.terracottaSoft,
    icon: CalendarOff,
    delay: 255,
  },
  {
    title: "Midnight Sign-Off Drift",
    metric: "+2.4 hrs Later",
    desc: "Your average final activity crept from 9:15 PM to 1:20 AM over four weeks.",
    accent: COLORS.amber,
    softBg: COLORS.amberSoft,
    icon: MoonStar,
    delay: 345,
  },
  {
    title: "Focus Recovery Dip",
    metric: "-31% Deep Work",
    desc: "Fragmented late-night sessions are quietly draining next-morning energy.",
    accent: COLORS.sage,
    softBg: COLORS.sageSoft,
    icon: Compass,
    delay: 430,
  },
];

export const Scene2PersonalRisk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [628, 660], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Personal Burnout Risk Dial sweeps smoothly 0 -> 74%
  const riskProg = interpolate(frame, [26, 150], [0, 0.74], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const outerR = 132;
  const outerC = 2 * Math.PI * outerR;
  const innerR = 104;
  const innerC = 2 * Math.PI * innerR;

  const breath = 1 + 0.025 * Math.sin(frame * 0.06);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.96, 1]) + exitProgress * 0.06})`,
        padding: "72px 104px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Editorial Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 16px",
              borderRadius: 999,
              background: COLORS.sageSoft,
              border: "1px solid rgba(21, 128, 61, 0.25)",
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.forest,
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            <UserCheck size={15} />
            PERSONAL WELLBEING VIEW • JUST FOR YOU
          </div>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: COLORS.ink,
              lineHeight: 1.05,
            }}
          >
            Your burnout risk.{" "}
            <span style={{ fontFamily: FONTS.serifItalic, color: COLORS.sage }}>
              Patterns you might miss.
            </span>
          </div>
        </div>
        <EmployeticsLogo size={54} showWordmark />
      </div>

      {/* Main Split: Left Personal Wellbeing Dial | Right Detected Quiet Patterns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "510px 1fr",
          gap: 40,
          flex: 1,
          marginTop: 30,
          alignItems: "stretch",
        }}
      >
        {/* LEFT: Oura/Apple-Health Inspired Personal Wellbeing Dial */}
        <PaperCard
          accentColor={COLORS.terracotta}
          showTopRibbon
          padding={38}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.inkMuted }}>
                YOUR PERSONAL SCORE
              </div>
              <div style={{ fontFamily: FONTS.serif, fontSize: 28, fontWeight: 700, color: COLORS.ink }}>
                Burnout Risk Index
              </div>
            </div>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                background: COLORS.terracottaSoft,
                color: COLORS.terracotta,
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              ELEVATED
            </span>
          </div>

          {/* Concentric Organic Multi-Ring Dial */}
          <div
            style={{
              position: "relative",
              width: 310,
              height: 310,
              transform: `scale(${breath})`,
            }}
          >
            <svg width="310" height="310" viewBox="0 0 310 310">
              <defs>
                <linearGradient id="warmRiskArc" x1="0" y1="0" x2="310" y2="310" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#D94826" />
                </linearGradient>
              </defs>
              {/* Outer Burnout Risk Track */}
              <circle cx="155" cy="155" r={outerR} stroke="rgba(28, 25, 23, 0.08)" strokeWidth="18" fill="none" />
              <circle
                cx="155"
                cy="155"
                r={outerR}
                stroke="url(#warmRiskArc)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={outerC}
                strokeDashoffset={outerC * (1 - riskProg)}
                transform="rotate(-90 155 155)"
              />
              {/* Inner Recovery Reserve Track (inverse: 26% left) */}
              <circle cx="155" cy="155" r={innerR} stroke="rgba(21, 128, 61, 0.12)" strokeWidth="10" fill="none" />
              <circle
                cx="155"
                cy="155"
                r={innerR}
                stroke={COLORS.sage}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={innerC}
                strokeDashoffset={innerC * (1 - (1 - riskProg) * 0.85)}
                transform="rotate(-90 155 155)"
              />
            </svg>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 78,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {Math.round(riskProg * 100)}%
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: COLORS.terracotta,
                  letterSpacing: "0.08em",
                  marginTop: 8,
                }}
              >
                BURNOUT RISK
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 18,
              background: COLORS.paperSoft,
              border: `1px solid ${COLORS.borderHairline}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkMuted }}>
                RECOVERY RESERVE
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 20, fontWeight: 700, color: COLORS.forest }}>
                26% remaining
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkMuted }}>
                TREND (28 DAYS)
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 20, fontWeight: 700, color: COLORS.terracotta }}>
                ↑ Rising steadily
              </div>
            </div>
          </div>
        </PaperCard>

        {/* RIGHT: Patterns You Might Miss */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles color={COLORS.gold} size={20} />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 15,
                letterSpacing: "0.08em",
                color: COLORS.inkSecondary,
              }}
            >
              QUIET PATTERNS DETECTED IN YOUR OWN RHYTHM
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1, justifyContent: "center" }}>
            {PATTERNS.map((pat) => {
              const s = spring({
                frame: Math.max(0, frame - pat.delay),
                fps,
                config: { damping: 14, stiffness: 125 },
              });
              const Icon = pat.icon;
              return (
                <div
                  key={pat.title}
                  style={{
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [56, 0])}px)`,
                  }}
                >
                  <PaperCard padding="26px 30px" radius={24}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 18,
                            background: pat.softBg,
                            border: `1.5px solid ${pat.accent}38`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon color={pat.accent} size={28} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: FONTS.serif,
                              fontSize: 28,
                              fontWeight: 700,
                              color: COLORS.ink,
                              lineHeight: 1.15,
                            }}
                          >
                            {pat.title}
                          </div>
                          <div
                            style={{
                              fontFamily: FONTS.sans,
                              fontSize: 17,
                              color: COLORS.inkSecondary,
                              marginTop: 6,
                              lineHeight: 1.4,
                            }}
                          >
                            {pat.desc}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "9px 18px",
                          borderRadius: 999,
                          background: pat.softBg,
                          border: `1px solid ${pat.accent}40`,
                          fontFamily: FONTS.mono,
                          fontSize: 15,
                          color: pat.accent,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pat.metric}
                      </span>
                    </div>
                  </PaperCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
