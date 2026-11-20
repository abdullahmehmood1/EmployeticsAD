import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Calendar, Clock, EyeOff, Lock, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { COLORS, FONTS } from "../theme";

const DRIVERS = [
  { label: "After-Hours Overtime", detail: "58 hrs/wk avg • +14.5h past 9 PM", impact: "+38% RISK", pct: 90, color: COLORS.crimson, delay: 48, icon: Clock },
  { label: "Consecutive Weekends", detail: "Active logins 4 Saturdays & Sundays straight", impact: "+27% RISK", pct: 74, color: COLORS.amber, delay: 98, icon: Calendar },
  { label: "Falling Peer Feedback", detail: "Review sentiment dropped 34% in 6 weeks", impact: "+19% RISK", pct: 58, color: COLORS.indigoBright, delay: 148, icon: MessageSquareWarning },
];

export const Scene3ExplainWhy: React.FC = () => {
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

  const gaugeProg = interpolate(frame, [14, 95], [0, 0.91], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const r = 108;
  const circ = 2 * Math.PI * r;

  // Private 1-minute Employee Check-in Card ("while giving employees private 1-minute check-ins never shared with HR")
  const privacySpring = spring({
    frame: Math.max(0, frame - 220),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const lockPop = spring({
    frame: Math.max(0, frame - 285),
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.94, 1]) + exitProgress * 0.1})`,
        padding: "68px 92px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.amber, marginBottom: 10 }}>
            EXPLAINABLE AI + EMPLOYEE PRIVACY
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 50, fontWeight: 800, letterSpacing: "-0.03em", color: COLORS.textPrimary }}>
            See <span style={{ color: COLORS.cyanBright }}>why</span> risk is rising — while protecting trust.
          </div>
        </div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.emeraldBright, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(52,211,153,0.38)", padding: "8px 16px", borderRadius: 999 }}>
          EXPLAINABLE ATTRIBUTION
        </span>
      </div>

      {/* Main Split: Left 91% Risk Gauge | Right Root Drivers + Private 1-Min Check-In Vault */}
      <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 34, flex: 1, marginTop: 26, alignItems: "stretch" }}>
        {/* Left Profile Gauge */}
        <GlassCard accentColor={COLORS.crimson} glow padding={32} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(244,63,94,0.22)", border: "1.5px solid rgba(244,63,94,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.display, fontSize: 20, fontWeight: 800, color: COLORS.textPrimary }}>
              AR
            </div>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.textPrimary }}>Alex Rivera</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary }}>Staff Engineer • Core API</div>
            </div>
          </div>

          <div style={{ position: "relative", width: 256, height: 256 }}>
            <svg width="256" height="256" viewBox="0 0 256 256">
              <defs>
                <linearGradient id="whyGauge" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              <circle cx="128" cy="128" r={r} stroke="rgba(148,163,184,0.14)" strokeWidth="17" fill="none" />
              <circle
                cx="128"
                cy="128"
                r={r}
                stroke="url(#whyGauge)"
                strokeWidth="17"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - gaugeProg)}
                transform="rotate(-90 128 128)"
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 66, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>
                {Math.round(gaugeProg * 100)}%
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#FDA4AF", marginTop: 8 }}>
                CRITICAL RISK
              </div>
            </div>
          </div>

          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(5,8,20,0.55)", border: "1px solid rgba(148,163,184,0.14)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.textMuted }}>CAPACITY</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 800, color: COLORS.crimson, marginTop: 2 }}>115%</div>
            </div>
            <div style={{ background: "rgba(5,8,20,0.55)", border: "1px solid rgba(148,163,184,0.14)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.textMuted }}>LEAD TIME</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 800, color: COLORS.amber, marginTop: 2 }}>4–6 wks</div>
            </div>
          </div>
        </GlassCard>

        {/* Right: Root-Cause Drivers + Employee Private Pulse Check-In */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}>
          <GlassCard accentColor={COLORS.indigo} padding={28} style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 18 }}>
              Root-Cause Drivers (Manager View)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DRIVERS.map((d) => {
                const s = spring({ frame: Math.max(0, frame - d.delay), fps, config: { damping: 14, stiffness: 125 } });
                const fill = interpolate(frame, [d.delay + 6, d.delay + 46], [0, d.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
                const Icon = d.icon;
                return (
                  <div key={d.label} style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [35, 0])}px)`, padding: "14px 18px", borderRadius: 16, background: "rgba(8,13,28,0.55)", border: "1px solid rgba(148,163,184,0.14)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Icon color={d.color} size={20} />
                        <div>
                          <div style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>{d.label}</div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary }}>{d.detail}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: d.color, background: `${d.color}1C`, padding: "5px 12px", borderRadius: 999 }}>
                        {d.impact}
                      </span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: "rgba(148,163,184,0.14)", overflow: "hidden" }}>
                      <div style={{ width: `${fill}%`, height: "100%", borderRadius: 999, background: d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Employee Private 1-Min Check-In Vault Card */}
          <div style={{ opacity: privacySpring, transform: `translateY(${interpolate(privacySpring, [0, 1], [32, 0])}px)` }}>
            <GlassCard accentColor={COLORS.emeraldBright} glow padding="22px 28px">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,0.20)", border: "1px solid rgba(52,211,153,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(lockPop, [0, 1], [0.7, 1])})` }}>
                    <Lock color={COLORS.emeraldBright} size={24} />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.emeraldBright, letterSpacing: "0.08em" }}>
                      FOR EMPLOYEES • 1-MINUTE PULSE CHECK-IN
                    </div>
                    <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, marginTop: 2 }}>
                      Spot your own fatigue privately — never shared with HR
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(52,211,153,0.4)", fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.emeraldBright }}>
                    <ShieldCheck size={16} /> PRIVATE
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(148,163,184,0.12)", border: "1px solid rgba(148,163,184,0.28)", fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>
                    <EyeOff size={16} /> NO HR ACCESS
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
