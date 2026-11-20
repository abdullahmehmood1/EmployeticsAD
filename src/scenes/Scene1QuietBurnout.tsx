import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CalendarDays, Clock, HeartHandshake, Moon } from "lucide-react";
import { PaperCard } from "../components/PaperCard";
import { COLORS, FONTS } from "../theme";

const WEEKENDS = [
  { num: "01", dates: "OCT 4 – 5", hrs: "5.5h logged" },
  { num: "02", dates: "OCT 11 – 12", hrs: "6.8h logged" },
  { num: "03", dates: "OCT 18 – 19", hrs: "8.2h logged" },
  { num: "04", dates: "OCT 25 – 26", hrs: "9.4h logged" },
];

const LATE_WEEKS = [
  { wk: "WK 1", time: "9:15 PM", height: 0.34 },
  { wk: "WK 2", time: "10:40 PM", height: 0.56 },
  { wk: "WK 3", time: "11:55 PM", height: 0.78 },
  { wk: "WK 4", time: "1:20 AM", height: 0.98 },
];

export const Scene1QuietBurnout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0-185): "Four weekends in a row."
  const phase1Out = interpolate(frame, [168, 196], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2 (180-360): "Logging in later every week."
  const phase2In = interpolate(frame, [178, 206], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const phase2Out = interpolate(frame, [340, 368], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Analog clock sweep from 9:15 -> 1:20 AM
  const clockSweep = interpolate(frame, [195, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const hourAngle = -90 + clockSweep * 130; // 9 -> 1:20
  const minAngle = 90 + clockSweep * 1440;

  // Phase 3 (355-540): "And nobody asks if you're okay."
  const phase3Spring = spring({
    frame: Math.max(0, frame - 360),
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  const okaySpring = spring({
    frame: Math.max(0, frame - 420),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Smooth exit into Scene 2
  const exitProgress = interpolate(frame, [510, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitProgress,
        transform: `scale(${1 + exitProgress * 0.06})`,
        padding: "86px 116px",
      }}
    >
      {/* PHASE 1: FOUR WEEKENDS IN A ROW */}
      {frame <= 202 && (
        <AbsoluteFill
          style={{
            opacity: phase1Out,
            transform: `translateY(${(1 - phase1Out) * -28}px)`,
            padding: "86px 116px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px",
                borderRadius: 999,
                background: COLORS.terracottaSoft,
                border: "1px solid rgba(217, 72, 38, 0.28)",
                fontFamily: FONTS.mono,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: COLORS.terracotta,
                marginBottom: 20,
              }}
            >
              <CalendarDays size={16} />
              OCTOBER ACTIVITY LOG
            </div>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: COLORS.ink,
                lineHeight: 1.05,
              }}
            >
              Four weekends{" "}
              <span style={{ fontFamily: FONTS.serifItalic, color: COLORS.terracotta }}>
                in a row.
              </span>
            </div>
          </div>

          {/* 4 Editorial Calendar Tear-Sheets */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 30,
              marginTop: 20,
            }}
          >
            {WEEKENDS.map((wk, idx) => {
              const cardS = spring({
                frame: Math.max(0, frame - 12 - idx * 24),
                fps,
                config: { damping: 14, stiffness: 130 },
              });
              const stampS = spring({
                frame: Math.max(0, frame - 26 - idx * 24),
                fps,
                config: { damping: 11, stiffness: 180 },
              });

              return (
                <div
                  key={wk.num}
                  style={{
                    opacity: cardS,
                    transform: `translateY(${interpolate(cardS, [0, 1], [65, 0])}px) rotate(${
                      (idx - 1.5) * 1.1
                    }deg)`,
                  }}
                >
                  <PaperCard
                    accentColor={COLORS.terracotta}
                    showTopRibbon
                    padding={30}
                    style={{
                      height: 430,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 14,
                          color: COLORS.inkMuted,
                          letterSpacing: "0.08em",
                        }}
                      >
                        WEEKEND
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.serif,
                          fontSize: 48,
                          fontWeight: 700,
                          color: COLORS.terracotta,
                          lineHeight: 1,
                        }}
                      >
                        {wk.num}
                      </span>
                    </div>

                    <div>
                      <div
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 22,
                          fontWeight: 700,
                          color: COLORS.ink,
                          marginBottom: 16,
                        }}
                      >
                        {wk.dates}
                      </div>

                      {/* Sat / Sun Editorial Blocks */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {["SAT", "SUN"].map((d) => (
                          <div
                            key={d}
                            style={{
                              padding: "16px 12px",
                              borderRadius: 14,
                              background: COLORS.terracottaSoft,
                              border: "1.5px solid rgba(217, 72, 38, 0.35)",
                              textAlign: "center",
                              transform: `scale(${interpolate(stampS, [0, 1], [1.18, 1])})`,
                              opacity: stampS,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: FONTS.mono,
                                fontSize: 13,
                                color: COLORS.terracotta,
                                fontWeight: 500,
                              }}
                            >
                              {d}
                            </div>
                            <div
                              style={{
                                fontFamily: FONTS.sans,
                                fontSize: 15,
                                fontWeight: 700,
                                color: COLORS.ink,
                                marginTop: 4,
                              }}
                            >
                              ONLINE
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: `1px solid ${COLORS.borderHairline}`,
                        paddingTop: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: FONTS.mono,
                        fontSize: 15,
                        color: COLORS.terracotta,
                      }}
                    >
                      <span>{wk.hrs}</span>
                      <span>0 DAYS OFF</span>
                    </div>
                  </PaperCard>
                </div>
              );
            })}
          </div>

          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 22,
              color: COLORS.inkSecondary,
              textAlign: "right",
            }}
          >
            Zero uninterrupted weekends in 28 days.
          </div>
        </AbsoluteFill>
      )}

      {/* PHASE 2: LOGGING IN LATER EVERY WEEK */}
      {frame >= 175 && frame <= 372 && (
        <AbsoluteFill
          style={{
            opacity: phase2In * phase2Out,
            transform: `translateY(${(1 - phase2In) * 32 - (1 - phase2Out) * 24}px)`,
            padding: "86px 116px",
            display: "grid",
            gridTemplateColumns: "520px 1fr",
            gap: 54,
            alignItems: "center",
          }}
        >
          {/* Left: Sculptural Analog Midnight Clock */}
          <PaperCard
            accentColor={COLORS.amber}
            showTopRibbon
            padding={42}
            style={{
              height: 620,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 999,
                background: COLORS.amberSoft,
                fontFamily: FONTS.mono,
                fontSize: 14,
                color: COLORS.gold,
              }}
            >
              <Moon size={15} />
              LAST ACTIVE SIGN-OFF
            </div>

            {/* Crisp Editorial Analog Clock */}
            <svg width="310" height="310" viewBox="0 0 310 310">
              <circle cx="155" cy="155" r="142" fill="#FAF6F0" stroke="rgba(28, 25, 23, 0.14)" strokeWidth="2.5" />
              <circle cx="155" cy="155" r="126" fill="none" stroke="rgba(217, 72, 38, 0.22)" strokeWidth="10" strokeDasharray="195 600" transform="rotate(-180 155 155)" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const x1 = 155 + Math.cos(a) * 116;
                const y1 = 155 + Math.sin(a) * 116;
                const x2 = 155 + Math.cos(a) * 130;
                const y2 = 155 + Math.sin(a) * 130;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i === 9 || i === 0 ? COLORS.terracotta : COLORS.inkMuted}
                    strokeWidth={i % 3 === 0 ? "3.5" : "2"}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Hour hand */}
              <line
                x1="155"
                y1="155"
                x2={155 + Math.cos((hourAngle * Math.PI) / 180) * 74}
                y2={155 + Math.sin((hourAngle * Math.PI) / 180) * 74}
                stroke={COLORS.ink}
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              {/* Minute hand */}
              <line
                x1="155"
                y1="155"
                x2={155 + Math.cos((minAngle * Math.PI) / 180) * 104}
                y2={155 + Math.sin((minAngle * Math.PI) / 180) * 104}
                stroke={COLORS.terracotta}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="155" cy="155" r="8" fill={COLORS.terracotta} />
            </svg>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 60,
                  fontWeight: 700,
                  color: COLORS.terracotta,
                  lineHeight: 1,
                }}
              >
                {clockSweep < 0.33
                  ? "9:15 PM"
                  : clockSweep < 0.66
                  ? "11:10 PM"
                  : "1:20 AM"}
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkSecondary, marginTop: 8 }}>
                +4 hours later than your healthy baseline
              </div>
            </div>
          </PaperCard>

          {/* Right: Editorial Headline + Rising Late-Night Bar Progression */}
          <div style={{ display: "flex", flexDirection: "column", gap: 38 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  color: COLORS.terracotta,
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                <Clock size={16} />
                LATE-NIGHT DRIFT
              </div>
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 72,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: COLORS.ink,
                  lineHeight: 1.06,
                }}
              >
                Logging in{" "}
                <span style={{ fontFamily: FONTS.serifItalic, color: COLORS.terracotta }}>
                  later
                </span>{" "}
                every week.
              </div>
            </div>

            <PaperCard padding={36}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                  alignItems: "flex-end",
                  height: 290,
                }}
              >
                {LATE_WEEKS.map((w, idx) => {
                  const grow = spring({
                    frame: Math.max(0, frame - 205 - idx * 20),
                    fps,
                    config: { damping: 14, stiffness: 120 },
                  });
                  const isLate = idx >= 2;
                  return (
                    <div
                      key={w.wk}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        height: "100%",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 16,
                          fontWeight: 500,
                          color: isLate ? COLORS.terracotta : COLORS.inkSecondary,
                          opacity: grow,
                        }}
                      >
                        {w.time}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${w.height * 195 * grow}px`,
                          borderRadius: "16px 16px 6px 6px",
                          background: isLate
                            ? "linear-gradient(180deg, #EA580C 0%, #DC2626 100%)"
                            : "linear-gradient(180deg, #F59E0B 0%, #D97706 100%)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 14,
                          color: COLORS.inkMuted,
                        }}
                      >
                        {w.wk}
                      </span>
                    </div>
                  );
                })}
              </div>
            </PaperCard>
          </div>
        </AbsoluteFill>
      )}

      {/* PHASE 3: "And nobody asks if you're okay." — Quiet Intimate Editorial Statement */}
      {frame >= 352 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: "0 180px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              opacity: phase3Spring,
              transform: `translateY(${interpolate(phase3Spring, [0, 1], [36, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: COLORS.terracottaSoft,
                border: "1.5px solid rgba(217, 72, 38, 0.30)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HeartHandshake color={COLORS.terracotta} size={38} />
            </div>

            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: 88,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: COLORS.ink,
                lineHeight: 1.12,
              }}
            >
              And nobody asks
              <br />
              if you’re{" "}
              <span
                style={{
                  fontFamily: FONTS.serifItalic,
                  color: COLORS.terracotta,
                  opacity: okaySpring,
                  display: "inline-block",
                  transform: `translateY(${interpolate(okaySpring, [0, 1], [16, 0])}px)`,
                }}
              >
                okay.
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
