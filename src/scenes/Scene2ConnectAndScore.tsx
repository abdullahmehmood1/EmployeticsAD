import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Activity, CheckSquare, MessageSquare, ShieldAlert } from "lucide-react";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const STREAMS = [
  { title: "Daily Attendance", sub: "Hours, late logins & weekend work", icon: Activity, color: COLORS.cyanBright, delay: 14 },
  { title: "Sprint Tasks", sub: "Ticket load, blockers & deadlines", icon: CheckSquare, color: COLORS.indigoBright, delay: 36 },
  { title: "Peer Feedback", sub: "Reviews, sentiment & 1:1 notes", icon: MessageSquare, color: COLORS.violet, delay: 58 },
];

const RANKED = [
  { rank: 1, name: "Alex Rivera", role: "Staff Engineer • 46h/wk", initials: "AR", risk: 91, badge: "CRITICAL RISK", color: COLORS.crimson },
  { rank: 2, name: "Maya Lin", role: "Product Designer • 5 wknds", initials: "ML", risk: 78, badge: "HIGH RISK", color: COLORS.amber },
  { rank: 3, name: "Jordan Lee", role: "Frontend Lead • 11 blockers", initials: "JL", risk: 58, badge: "ELEVATED", color: COLORS.indigoBright },
  { rank: 4, name: "Samira Patel", role: "Backend Engineer • 21h/wk", initials: "SP", risk: 21, badge: "HEALTHY", color: COLORS.emeraldBright },
];

export const Scene2ConnectAndScore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [448, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const hubSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 120 } });
  const boardSpring = spring({ frame: Math.max(0, frame - 115), fps, config: { damping: 15, stiffness: 115 } });
  const focusAlex = interpolate(frame, [340, 385], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const dashOffset = -(frame * 3.4);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.94, 1]) + exitProgress * 0.14})`,
        padding: "68px 88px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Bar introducing Employetics */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.cyanBright, marginBottom: 10 }}>
            MEET EMPLOYETICS • PREDICTIVE WORKFORCE AI
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", color: COLORS.textPrimary }}>
            Connects your daily tools. Flags burnout early.
          </div>
        </div>
        <EmployeticsLogo size={54} showWordmark animateIn delayFrames={4} />
      </div>

      {/* Main Architecture Flow: Left Work Tools -> Center Employetics AI -> Right Live Burnout Ranking */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "430px 210px 1fr",
          alignItems: "center",
          flex: 1,
          marginTop: 24,
        }}
      >
        {/* LEFT: 3 Connected Signal Streams */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, zIndex: 2 }}>
          {STREAMS.map((st) => {
            const s = spring({ frame: Math.max(0, frame - st.delay), fps, config: { damping: 14, stiffness: 125 } });
            const Icon = st.icon;
            return (
              <div key={st.title} style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-55, 0])}px)` }}>
                <GlassCard accentColor={st.color} glow padding="22px 24px">
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: `${st.color}22`,
                        border: `1px solid ${st.color}55`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon color={st.color} size={25} />
                    </div>
                    <div>
                      <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>
                        {st.title}
                      </div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary, marginTop: 3 }}>
                        {st.sub}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* CENTER: Flowing Cubic-Bezier Data Packets + Spinning Orbital AI Hub */}
        <div style={{ position: "relative", height: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="260" height="480" viewBox="0 0 260 480" fill="none" style={{ position: "absolute", left: -25, top: 0, overflow: "visible" }}>
            <defs>
              <linearGradient id="streamCyan" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="streamOut" x1="130" y1="240" x2="260" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>

            {[106, 240, 374].map((y, idx) => {
              const t = (frame * 0.024 + idx * 0.33) % 1;
              const inv = 1 - t;
              const bx = 3 * inv * inv * t * 65 + 3 * inv * t * t * 75 + t * t * t * 130;
              const by = inv * inv * inv * y + 3 * inv * inv * t * y + 3 * inv * t * t * 240 + t * t * t * 240;
              return (
                <g key={idx}>
                  <path d={`M 0 ${y} C 65 ${y}, 75 240, 130 240`} stroke="rgba(129, 140, 248, 0.22)" strokeWidth="3" />
                  <path
                    d={`M 0 ${y} C 65 ${y}, 75 240, 130 240`}
                    stroke="url(#streamCyan)"
                    strokeWidth="3.5"
                    strokeDasharray="14 18"
                    strokeDashoffset={dashOffset - idx * 14}
                    strokeLinecap="round"
                  />
                  <circle cx={bx} cy={by} r="5.5" fill="#22D3EE" />
                </g>
              );
            })}

            <path d="M 130 240 L 255 240" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="4" />
            <path
              d="M 130 240 L 255 240"
              stroke="url(#streamOut)"
              strokeWidth="4.5"
              strokeDasharray="16 14"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={boardSpring}
            />
            {boardSpring > 0.2 && (
              <circle cx={130 + ((frame * 3.0) % 125)} cy={240} r="5.5" fill="#FB7185" opacity={boardSpring} />
            )}
          </svg>

          <svg
            width="136"
            height="136"
            viewBox="0 0 136 136"
            style={{ position: "absolute", zIndex: 2, transform: `rotate(${frame * 1.4}deg) scale(${hubSpring})`, opacity: 0.75 }}
          >
            <circle cx="68" cy="68" r="60" stroke="url(#streamCyan)" strokeWidth="2" strokeDasharray="18 14" fill="none" />
          </svg>
          <div style={{ position: "relative", zIndex: 3, transform: `scale(${hubSpring})` }}>
            <EmployeticsLogo size={84} showWordmark={false} />
          </div>
        </div>

        {/* RIGHT: Live Burnout & Attrition Risk Ranking */}
        <div
          style={{
            opacity: boardSpring,
            transform: `translateX(${interpolate(boardSpring, [0, 1], [75, 0])}px)`,
            zIndex: 2,
          }}
        >
          <GlassCard accentColor={COLORS.indigo} glow padding={30}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: "1px solid rgba(148,163,184,0.14)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldAlert color={COLORS.crimson} size={24} />
                <span style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 700, color: COLORS.textPrimary }}>
                  Real-Time Burnout Risk Ranking
                </span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.cyanBright, background: "rgba(6,182,212,0.14)", border: "1px solid rgba(34,211,238,0.35)", padding: "6px 14px", borderRadius: 999 }}>
                LIVE AI SCORE
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {RANKED.map((emp, idx) => {
                const rSpring = spring({ frame: Math.max(0, frame - 135 - idx * 14), fps, config: { damping: 14, stiffness: 125 } });
                const countProg = interpolate(frame, [150 + idx * 14, 230 + idx * 14], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                });
                const shown = Math.round(emp.risk * countProg);
                const isTop = idx === 0;
                const dim = isTop ? 1 : 1 - focusAlex * 0.42;
                const rad = 24;
                const circ = 2 * Math.PI * rad;

                return (
                  <div
                    key={emp.name}
                    style={{
                      opacity: rSpring * dim,
                      transform: `translateY(${interpolate(rSpring, [0, 1], [28, 0])}px) scale(${isTop ? 1 + focusAlex * 0.025 : 1})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "15px 18px",
                      borderRadius: 16,
                      background: isTop ? `rgba(244, 63, 94, ${0.10 + focusAlex * 0.10})` : "rgba(15, 23, 42, 0.55)",
                      border: isTop ? `1.5px solid rgba(244, 63, 94, ${0.44 + focusAlex * 0.46})` : "1px solid rgba(148, 163, 184, 0.12)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 17, fontWeight: 800, color: isTop ? "#FDA4AF" : COLORS.textMuted, width: 30 }}>
                        #{emp.rank}
                      </span>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `${emp.color}24`,
                          border: `1px solid ${emp.color}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: FONTS.display,
                          fontSize: 15,
                          fontWeight: 800,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {emp.initials}
                      </div>
                      <div>
                        <div style={{ fontFamily: FONTS.display, fontSize: 21, fontWeight: 700, color: COLORS.textPrimary }}>{emp.name}</div>
                        <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary }}>{emp.role}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: emp.color, background: `${emp.color}1C`, border: `1px solid ${emp.color}48`, padding: "6px 12px", borderRadius: 999 }}>
                        {emp.badge}
                      </span>
                      <div style={{ position: "relative", width: 58, height: 58 }}>
                        <svg width="58" height="58" viewBox="0 0 58 58">
                          <circle cx="29" cy="29" r={rad} stroke="rgba(148,163,184,0.16)" strokeWidth="5" fill="none" />
                          <circle
                            cx="29"
                            cy="29"
                            r={rad}
                            stroke={emp.color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={circ}
                            strokeDashoffset={circ * (1 - (emp.risk / 100) * countProg)}
                            transform="rotate(-90 29 29)"
                          />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.mono, fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>
                          {shown}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};
