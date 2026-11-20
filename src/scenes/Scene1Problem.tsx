import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AlertTriangle, Calendar, Clock, Flame, MailWarning } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // 3 staggered everyday burnout signals that hide before a resignation
  const card1 = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 14, stiffness: 125 } });
  const card2 = spring({ frame: Math.max(0, frame - 98), fps, config: { damping: 14, stiffness: 125 } });
  const card3 = spring({ frame: Math.max(0, frame - 154), fps, config: { damping: 14, stiffness: 125 } });

  // Sudden resignation notice pops in at 4.0s (frame 240)
  const quitSpring = spring({
    frame: Math.max(0, frame - 242),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const ringScale = interpolate(frame, [246, 330], [0.7, 1.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOp = interpolate(frame, [246, 265, 330], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit zoom-out into Employetics reveal
  const exitProgress = interpolate(frame, [388, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const nightBars = [
    { lbl: "9P", h: 0.42 },
    { lbl: "10P", h: 0.62 },
    { lbl: "11P", h: 0.85 },
    { lbl: "12A", h: 0.96 },
    { lbl: "1A", h: 0.78 },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitProgress,
        transform: `scale(${1 + exitProgress * 0.14})`,
        padding: "68px 104px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [24, 0])}px)`,
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
            border: "1px solid rgba(244, 63, 94, 0.42)",
            fontFamily: FONTS.mono,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: "#FDA4AF",
            marginBottom: 14,
          }}
        >
          <AlertTriangle size={16} />
          THE HIDDEN BURNOUT PROBLEM
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
          Burnout never announces itself.
        </div>
      </div>

      {/* 3 Everyday Signals Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, marginTop: 18 }}>
        {/* Card 1: Late Nights */}
        <div
          style={{
            opacity: card1 * (1 - quitSpring * 0.35),
            transform: `translateY(${interpolate(card1, [0, 1], [48, 0])}px)`,
          }}
        >
          <GlassCard accentColor={COLORS.crimson} glow padding={28} sheenDelay={20} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Clock color={COLORS.crimson} size={24} />
                <span style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>
                  Late Nights
                </span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: "#FDA4AF", background: "rgba(244,63,94,0.16)", padding: "5px 11px", borderRadius: 8 }}>
                +14.5h / wk
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 145 }}>
              {nightBars.map((b, i) => {
                const grow = spring({ frame: Math.max(0, frame - 52 - i * 5), fps, config: { damping: 14, stiffness: 130 } });
                return (
                  <div key={b.lbl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${b.h * 110 * grow}px`,
                        borderRadius: "8px 8px 3px 3px",
                        background: i >= 2 ? "linear-gradient(180deg, #FB7185, #E11D48)" : "linear-gradient(180deg, #818CF8, #4F46E5)",
                      }}
                    />
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted }}>{b.lbl}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
              After-hours commits & Slack messages piling up quietly
            </div>
          </GlassCard>
        </div>

        {/* Card 2: Lost Weekends */}
        <div
          style={{
            opacity: card2 * (1 - quitSpring * 0.35),
            transform: `translateY(${interpolate(card2, [0, 1], [48, 0])}px)`,
          }}
        >
          <GlassCard accentColor={COLORS.amber} glow padding={28} sheenDelay={55} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Calendar color={COLORS.amber} size={24} />
                <span style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>
                  Weekend Sprints
                </span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: "#FCD34D", background: "rgba(245,158,11,0.16)", padding: "5px 11px", borderRadius: 8 }}>
                4 IN A ROW
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 7 }}>
              {Array.from({ length: 21 }).map((_, idx) => {
                const isWknd = idx % 7 >= 5;
                return (
                  <div
                    key={idx}
                    style={{
                      height: 28,
                      borderRadius: 6,
                      background: isWknd ? "rgba(245, 158, 11, 0.72)" : "rgba(148, 163, 184, 0.14)",
                      border: isWknd ? "1px solid #FBBF24" : "1px solid rgba(148, 163, 184, 0.1)",
                    }}
                  />
                );
              })}
            </div>

            <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
              Active logins every Saturday & Sunday with zero recovery
            </div>
          </GlassCard>
        </div>

        {/* Card 3: Task Overload */}
        <div
          style={{
            opacity: card3 * (1 - quitSpring * 0.35),
            transform: `translateY(${interpolate(card3, [0, 1], [48, 0])}px)`,
          }}
        >
          <GlassCard accentColor={COLORS.indigoBright} glow padding={28} sheenDelay={90} style={{ height: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Flame color={COLORS.crimson} size={24} />
                <span style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>
                  115% Workload
                </span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: "#FDA4AF", background: "rgba(244,63,94,0.16)", padding: "5px 11px", borderRadius: 8 }}>
                OVERLOADED
              </span>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 }}>
                <span>Assigned Sprint Load</span>
                <span style={{ color: COLORS.crimson, fontWeight: 700 }}>46h / 40h</span>
              </div>
              <div style={{ height: 18, borderRadius: 999, background: "rgba(148, 163, 184, 0.14)", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${interpolate(frame, [160, 215], [0, 94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #F59E0B, #F43F5E)",
                  }}
                />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, marginTop: 10 }}>
                While teammates nearby sit at 54% capacity
              </div>
            </div>

            <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary }}>
              Silent burnout building right inside everyday work tools
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Dramatic Resignation Consequence Banner */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        {ringOp > 0.01 && (
          <div
            style={{
              position: "absolute",
              width: 580,
              height: 120,
              borderRadius: 28,
              border: `2px solid ${COLORS.crimson}`,
              opacity: ringOp,
              transform: `scale(${ringScale})`,
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            opacity: quitSpring,
            transform: `translateY(${interpolate(quitSpring, [0, 1], [34, 0])}px) scale(${interpolate(quitSpring, [0, 1], [0.92, 1])})`,
          }}
        >
          <GlassCard accentColor={COLORS.crimson} glow padding="22px 38px">
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #F43F5E, #9F1239)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MailWarning color="#FFFFFF" size={28} />
              </div>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: "#FDA4AF", letterSpacing: "0.08em" }}>
                  WITHOUT EARLY VISIBILITY
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 800, color: COLORS.textPrimary }}>
                  You only find out when your best developer resigns.
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};
