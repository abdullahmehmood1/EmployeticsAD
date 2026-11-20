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

interface RankedEmployee {
  rank: number;
  name: string;
  role: string;
  initials: string;
  risk: number;
  status: string;
  color: string;
  signal: string;
}

const EMPLOYEES: RankedEmployee[] = [
  {
    rank: 1,
    name: "Alex Rivera",
    role: "Staff Software Engineer",
    initials: "AR",
    risk: 91,
    status: "CRITICAL RISK",
    color: COLORS.crimson,
    signal: "+14.5h late nights • -37% feedback",
  },
  {
    rank: 2,
    name: "Maya Lin",
    role: "Senior Product Designer",
    initials: "ML",
    risk: 78,
    status: "HIGH RISK",
    color: COLORS.amber,
    signal: "5 weekend sprints • high load",
  },
  {
    rank: 3,
    name: "Devon Brooks",
    role: "Backend Tech Lead",
    initials: "DB",
    risk: 64,
    status: "ELEVATED",
    color: "#EAB308",
    signal: "12 overdue sprint blockers",
  },
  {
    rank: 4,
    name: "Priya Nair",
    role: "Lead Data Engineer",
    initials: "PN",
    risk: 22,
    status: "HEALTHY",
    color: COLORS.emerald,
    signal: "Balanced hours • 4.8★ feedback",
  },
];

const DATA_STREAMS = [
  {
    title: "Daily Attendance",
    subtitle: "Shift hours, late logins & weekend work",
    icon: Activity,
    color: COLORS.cyanBright,
    delay: 14,
  },
  {
    title: "Tasks & Velocity",
    subtitle: "Sprint overload, blockers & cycle time",
    icon: CheckSquare,
    color: COLORS.indigoBright,
    delay: 42,
  },
  {
    title: "Team Feedback",
    subtitle: "Peer reviews, 1:1 notes & sentiment",
    icon: MessageSquare,
    color: COLORS.violet,
    delay: 70,
  },
];

export const Scene2RiskRanking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Hub pulses continuously
  const hubSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Leaderboard slides & springs in smoothly around 11.4s (local frame 145)
  const boardSpring = spring({
    frame: Math.max(0, frame - 140),
    fps,
    config: { damping: 15, stiffness: 110, mass: 0.9 },
  });

  // Focus spotlight pulses on #1 Alex Rivera near the end before zooming into Scene 3
  const focusAlex = interpolate(frame, [300, 345], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Smooth zoom-in transition into Scene 3 (frames 390-420)
  const exitProgress = interpolate(frame, [388, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const dashOffset = -(frame * 3.2);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.14})`,
        padding: "70px 88px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: COLORS.cyanBright,
              marginBottom: 10,
            }}
          >
            LIVE PREDICTIVE ENGINE
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: COLORS.textPrimary,
            }}
          >
            Reads daily signals. Ranks attrition risk.
          </div>
        </div>
        <EmployeticsLogo size={50} showWordmark />
      </div>

      {/* Main Content Grid: Left Signal Streams -> Center Engine -> Right Risk Leaderboard */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "460px 190px 1fr",
          alignItems: "center",
          gap: 0,
          flex: 1,
          marginTop: 28,
        }}
      >
        {/* LEFT COLUMN: 3 Signal Ingestion Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, zIndex: 2 }}>
          {DATA_STREAMS.map((stream) => {
            const s = spring({
              frame: Math.max(0, frame - stream.delay),
              fps,
              config: { damping: 14, stiffness: 125 },
            });
            const Icon = stream.icon;
            return (
              <div
                key={stream.title}
                style={{
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-55, 0])}px)`,
                }}
              >
                <GlassCard accentColor={stream.color} glow padding="22px 24px">
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 15,
                        background: `${stream.color}22`,
                        border: `1px solid ${stream.color}55`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon color={stream.color} size={26} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 23,
                          fontWeight: 700,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {stream.title}
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 15,
                          color: COLORS.textSecondary,
                          marginTop: 4,
                        }}
                      >
                        {stream.subtitle}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* MIDDLE: Animated Flow SVG Connectors + Employetics Core Node */}
        <div
          style={{
            position: "relative",
            height: 480,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="240"
            height="480"
            viewBox="0 0 240 480"
            fill="none"
            style={{ position: "absolute", left: -25, top: 0, overflow: "visible" }}
          >
            <defs>
              <linearGradient id="flowCyan" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="flowOut" x1="120" y1="240" x2="240" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>

            {/* 3 input curves converging into center hub + glowing traveling data packets */}
            {[108, 240, 372].map((y, idx) => {
              const t = ((frame * 0.022 + idx * 0.33) % 1);
              const inv = 1 - t;
              // Exact cubic Bezier evaluation for M 0 y C 60 y, 70 240, 120 240
              const bx = 3 * inv * inv * t * 60 + 3 * inv * t * t * 70 + t * t * t * 120;
              const by =
                inv * inv * inv * y +
                3 * inv * inv * t * y +
                3 * inv * t * t * 240 +
                t * t * t * 240;
              return (
                <g key={idx}>
                  <path
                    d={`M 0 ${y} C 60 ${y}, 70 240, 120 240`}
                    stroke="rgba(129, 140, 248, 0.22)"
                    strokeWidth="3"
                  />
                  <path
                    d={`M 0 ${y} C 60 ${y}, 70 240, 120 240`}
                    stroke="url(#flowCyan)"
                    strokeWidth="3.5"
                    strokeDasharray="14 18"
                    strokeDashoffset={dashOffset - idx * 14}
                    strokeLinecap="round"
                  />
                  {/* Moving glowing data packet orb */}
                  <circle
                    cx={bx}
                    cy={by}
                    r="5.5"
                    fill="#22D3EE"
                    style={{ filter: "drop-shadow(0 0 10px #22D3EE)" }}
                  />
                </g>
              );
            })}

            {/* Output beam from hub to dashboard + traveling risk pulse */}
            <path
              d="M 120 240 L 235 240"
              stroke="rgba(99, 102, 241, 0.25)"
              strokeWidth="4"
            />
            <path
              d="M 120 240 L 235 240"
              stroke="url(#flowOut)"
              strokeWidth="4.5"
              strokeDasharray="16 14"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={boardSpring}
            />
            {boardSpring > 0.2 && (
              <circle
                cx={120 + ((frame * 2.8) % 115)}
                cy={240}
                r="5.5"
                fill="#FB7185"
                opacity={boardSpring}
                style={{ filter: "drop-shadow(0 0 10px #F43F5E)" }}
              />
            )}
          </svg>

          {/* Spinning Orbital Ring + Glowing Central Engine Hub */}
          <svg
            width="136"
            height="136"
            viewBox="0 0 136 136"
            style={{
              position: "absolute",
              zIndex: 2,
              transform: `rotate(${frame * 1.4}deg) scale(${hubSpring})`,
              opacity: 0.72,
              pointerEvents: "none",
            }}
          >
            <circle
              cx="68"
              cy="68"
              r="60"
              stroke="url(#flowCyan)"
              strokeWidth="2"
              strokeDasharray="18 14"
              fill="none"
            />
          </svg>
          <div
            style={{
              position: "relative",
              zIndex: 3,
              transform: `scale(${hubSpring * (1 + 0.03 * Math.sin(frame * 0.1))})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -18,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.42) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <EmployeticsLogo size={84} showWordmark={false} />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Attrition Risk Ranking Leaderboard */}
        <div
          style={{
            opacity: boardSpring,
            transform: `translateX(${interpolate(boardSpring, [0, 1], [80, 0])}px) scale(${interpolate(
              boardSpring,
              [0, 1],
              [0.95, 1]
            )})`,
            zIndex: 2,
          }}
        >
          <GlassCard accentColor={COLORS.indigo} glow padding={32}>
            {/* Table Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 20,
                borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldAlert color={COLORS.crimson} size={24} />
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 25,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                  }}
                >
                  Attrition Risk Ranking
                </span>
              </div>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  color: COLORS.cyanBright,
                  background: "rgba(6, 182, 212, 0.14)",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                ENGINEERING • LIVE
              </span>
            </div>

            {/* Ranked Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {EMPLOYEES.map((emp, idx) => {
                const rowSpring = spring({
                  frame: Math.max(0, frame - 160 - idx * 14),
                  fps,
                  config: { damping: 14, stiffness: 120 },
                });

                const countProgress = interpolate(
                  frame,
                  [175 + idx * 14, 245 + idx * 14],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.cubic),
                  }
                );

                const displayedRisk = Math.round(emp.risk * countProgress);
                const isTop = idx === 0;
                const rowDim = isTop ? 1 : 1 - focusAlex * 0.42;

                // Circular risk progress SVG
                const radius = 24;
                const circ = 2 * Math.PI * radius;
                const strokeOffset = circ * (1 - (emp.risk / 100) * countProgress);

                return (
                  <div
                    key={emp.name}
                    style={{
                      opacity: rowSpring * rowDim,
                      transform: `translateY(${interpolate(rowSpring, [0, 1], [32, 0])}px) scale(${
                        isTop ? 1 + focusAlex * 0.025 : 1
                      })`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: 16,
                      background: isTop
                        ? `rgba(244, 63, 94, ${0.1 + focusAlex * 0.09})`
                        : "rgba(15, 23, 42, 0.55)",
                      border: isTop
                        ? `1.5px solid rgba(244, 63, 94, ${0.42 + focusAlex * 0.48})`
                        : "1px solid rgba(148, 163, 184, 0.12)",
                      boxShadow: isTop
                        ? `0 0 ${24 + focusAlex * 26}px rgba(244, 63, 94, ${0.22 + focusAlex * 0.22})`
                        : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* Rank Badge */}
                      <div
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 17,
                          fontWeight: 800,
                          color: isTop ? "#FDA4AF" : COLORS.textMuted,
                          width: 30,
                        }}
                      >
                        #{emp.rank}
                      </div>

                      {/* Avatar */}
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 13,
                          background: `${emp.color}24`,
                          border: `1px solid ${emp.color}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: FONTS.display,
                          fontSize: 16,
                          fontWeight: 800,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {emp.initials}
                      </div>

                      <div>
                        <div
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 21,
                            fontWeight: 700,
                            color: COLORS.textPrimary,
                          }}
                        >
                          {emp.name}
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.body,
                            fontSize: 14,
                            color: COLORS.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {emp.role} • <span style={{ color: "#CBD5E1" }}>{emp.signal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: status pill + animated risk ring */}
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: emp.color,
                          background: `${emp.color}1C`,
                          border: `1px solid ${emp.color}48`,
                          padding: "6px 12px",
                          borderRadius: 999,
                        }}
                      >
                        {emp.status}
                      </span>

                      <div style={{ position: "relative", width: 58, height: 58 }}>
                        <svg width="58" height="58" viewBox="0 0 58 58">
                          <circle
                            cx="29"
                            cy="29"
                            r={radius}
                            stroke="rgba(148, 163, 184, 0.16)"
                            strokeWidth="5"
                            fill="none"
                          />
                          <circle
                            cx="29"
                            cy="29"
                            r={radius}
                            stroke={emp.color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={circ}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 29 29)"
                          />
                        </svg>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONTS.mono,
                            fontSize: 15,
                            fontWeight: 800,
                            color: COLORS.textPrimary,
                          }}
                        >
                          {displayedRisk}%
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
