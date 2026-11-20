import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Activity, AlertTriangle, Radar } from "lucide-react";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  capacity: number;
  hours: string;
  status: string;
  color: string;
  flagged?: boolean;
}

const TEAM: TeamMember[] = [
  {
    name: "Alex Rivera",
    role: "Staff Software Engineer",
    initials: "AR",
    capacity: 115,
    hours: "46h / 40h",
    status: "HEADING FOR BURNOUT",
    color: COLORS.crimson,
    flagged: true,
  },
  {
    name: "Jordan Lee",
    role: "Frontend Architect",
    initials: "JL",
    capacity: 96,
    hours: "38h / 40h",
    status: "NEAR LIMIT",
    color: COLORS.amber,
  },
  {
    name: "Maya Lin",
    role: "Product Designer",
    initials: "ML",
    capacity: 82,
    hours: "33h / 40h",
    status: "OPTIMAL",
    color: COLORS.indigoBright,
  },
  {
    name: "Devon Brooks",
    role: "Platform Engineer",
    initials: "DB",
    capacity: 71,
    hours: "28h / 40h",
    status: "HEALTHY",
    color: COLORS.cyanBright,
  },
  {
    name: "Samira Patel",
    role: "Backend Engineer",
    initials: "SP",
    capacity: 54,
    hours: "21h / 40h",
    status: "AVAILABLE",
    color: COLORS.emeraldBright,
  },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

export const Scene2DailyMonitor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Active weekday scanner sweeps Mon -> Fri (frames 35 -> 250)
  const activeDayIdx = Math.min(
    4,
    Math.floor(
      interpolate(frame, [30, 240], [0, 4.99], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Flag spotlight hits Alex Rivera around 13.8s (local frame 288)
  const flagSpotlight = spring({
    frame: Math.max(0, frame - 285),
    fps,
    config: { damping: 13, stiffness: 130 },
  });

  // Smooth zoom-in transition into Scene 3 (frames 568-600)
  const exitProgress = interpolate(frame, [568, 600], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Sweeping horizontal scanner beam across the dashboard during daily check
  const scanBarX = interpolate(frame, [45, 250], [-10, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanBarOp = interpolate(frame, [45, 65, 225, 250], [0, 0.5, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.95, 1]) + exitProgress * 0.12})`,
        padding: "66px 96px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: COLORS.cyanBright,
              marginBottom: 10,
            }}
          >
            <Radar size={16} />
            DAILY CAPACITY & BURNOUT RADAR
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 50,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: COLORS.textPrimary,
            }}
          >
            Watches your team every day. Flags burnout early.
          </div>
        </div>
        <EmployeticsLogo size={52} showWordmark />
      </div>

      {/* Main Live Monitoring Dashboard */}
      <GlassCard
        accentColor={COLORS.indigo}
        glow
        padding={34}
        style={{
          flex: 1,
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Daily Scan Beam */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${scanBarX}%`,
            width: 180,
            background:
              "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.22), transparent)",
            opacity: scanBarOp,
            pointerEvents: "none",
          }}
        />

        {/* Day-by-Day Live Pulse Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 22,
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Activity color={COLORS.cyanBright} size={22} />
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              Engineering Team Capacity
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {DAYS.map((day, i) => {
              const isActive = i === activeDayIdx;
              const isPast = i < activeDayIdx;
              return (
                <div
                  key={day}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    background: isActive
                      ? "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)"
                      : isPast
                      ? "rgba(6, 182, 212, 0.16)"
                      : "rgba(148, 163, 184, 0.10)",
                    border: isActive
                      ? "1px solid #22D3EE"
                      : "1px solid rgba(148, 163, 184, 0.18)",
                    color: isActive ? "#FFFFFF" : isPast ? COLORS.cyanBright : COLORS.textMuted,
                    boxShadow: isActive ? "0 0 18px rgba(6, 182, 212, 0.50)" : "none",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5-Teammate Capacity Rows with 100% Healthy Threshold Guideline */}
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            paddingTop: 18,
            paddingBottom: 10,
          }}
        >
          {TEAM.map((m, idx) => {
            const rowIn = spring({
              frame: Math.max(0, frame - 26 - idx * 14),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            const barProg = interpolate(frame, [42 + idx * 14, 155 + idx * 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            });

            const shownPct = Math.round(m.capacity * barProg);
            const isFlagged = Boolean(m.flagged);
            const dimOther = isFlagged ? 1 : 1 - flagSpotlight * 0.32;

            return (
              <div
                key={m.name}
                style={{
                  opacity: rowIn * dimOther,
                  transform: `translateY(${interpolate(rowIn, [0, 1], [26, 0])}px) scale(${
                    isFlagged ? 1 + flagSpotlight * 0.018 : 1
                  })`,
                  display: "grid",
                  gridTemplateColumns: "310px 1fr 270px",
                  alignItems: "center",
                  gap: 28,
                  padding: "16px 22px",
                  borderRadius: 16,
                  background: isFlagged
                    ? `rgba(244, 63, 94, ${0.09 + flagSpotlight * 0.11})`
                    : "rgba(15, 23, 42, 0.52)",
                  border: isFlagged
                    ? `1.5px solid rgba(244, 63, 94, ${0.40 + flagSpotlight * 0.52})`
                    : "1px solid rgba(148, 163, 184, 0.12)",
                  boxShadow:
                    isFlagged && flagSpotlight > 0.1
                      ? `0 0 ${32 * flagSpotlight}px rgba(244, 63, 94, 0.35)`
                      : "none",
                }}
              >
                {/* Avatar & Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: `${m.color}24`,
                      border: `1px solid ${m.color}66`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONTS.display,
                      fontSize: 16,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {m.initials}
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
                      {m.name}
                    </div>
                    <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary }}>
                      {m.role} • {m.hours}
                    </div>
                  </div>
                </div>

                {/* Horizontal Bar with 100% Limit Marker */}
                <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: 16,
                      borderRadius: 999,
                      background: "rgba(148, 163, 184, 0.14)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (shownPct / 125) * 100)}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: isFlagged
                          ? "linear-gradient(90deg, #F59E0B 0%, #F43F5E 70%, #E11D48 100%)"
                          : m.color,
                        boxShadow: isFlagged ? "0 0 18px rgba(244, 63, 94, 0.65)" : "none",
                      }}
                    />
                  </div>
                  {/* 100% Limit Line (100/125 = 80%) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "80%",
                      top: -4,
                      bottom: -4,
                      width: 2,
                      borderLeft: "2px dashed rgba(248, 250, 252, 0.45)",
                    }}
                  />
                </div>

                {/* Right Capacity % + Status Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isFlagged ? "#FFFFFF" : m.color,
                      background: isFlagged
                        ? `rgba(225, 29, 72, ${0.45 + flagSpotlight * 0.45})`
                        : `${m.color}1C`,
                      border: `1px solid ${m.color}66`,
                      padding: "6px 12px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isFlagged && flagSpotlight > 0.2 ? "⚠ " : ""}
                    {m.status}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 28,
                      fontWeight: 800,
                      color: isFlagged ? COLORS.crimson : COLORS.textPrimary,
                      minWidth: 74,
                      textAlign: "right",
                    }}
                  >
                    {shownPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Flag Callout Strip */}
        <div
          style={{
            opacity: flagSpotlight,
            transform: `translateY(${interpolate(flagSpotlight, [0, 1], [18, 0])}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderRadius: 14,
            background: "rgba(244, 63, 94, 0.14)",
            border: "1px solid rgba(244, 63, 94, 0.48)",
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AlertTriangle color={COLORS.crimson} size={22} />
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              Burnout Flag: <span style={{ color: "#FDA4AF" }}>Alex Rivera is at 115% capacity</span>{" "}
              while 2 teammates have spare bandwidth.
            </span>
          </div>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.cyanBright,
            }}
          >
            1-CLICK REBALANCE READY →
          </span>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};
