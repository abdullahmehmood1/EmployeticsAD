import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EmployeticsLogo } from "../components/EmployeticsLogo";
import { COLORS, FONTS } from "../theme";

export const Scene6BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const ringScale = interpolate(frame, [0, 90], [0.7, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const tag1 = spring({ frame: Math.max(0, frame - 64), fps, config: { damping: 14, stiffness: 120 } });
  const tag2 = spring({ frame: Math.max(0, frame - 118), fps, config: { damping: 14, stiffness: 120 } });
  const pills = spring({ frame: Math.max(0, frame - 150), fps, config: { damping: 15, stiffness: 115 } });
  const cta = spring({ frame: Math.max(0, frame - 180), fps, config: { damping: 16, stiffness: 110 } });

  const lineW = interpolate(frame, [42, 92], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });

  return (
    <AbsoluteFill style={{ opacity: sceneIn, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
      {/* Counter-rotating orbital rings */}
      <svg width="840" height="840" viewBox="0 0 840 840" style={{ position: "absolute", opacity: 0.25 * sceneIn, transform: `rotate(${frame * 0.22}deg) scale(${ringScale})`, pointerEvents: "none" }}>
        <circle cx="420" cy="420" r="365" stroke="url(#outRing)" strokeWidth="1.4" strokeDasharray="10 14" fill="none" />
        <defs>
          <linearGradient id="outRing" x1="0" y1="0" x2="840" y2="840" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <svg width="650" height="650" viewBox="0 0 650 650" style={{ position: "absolute", opacity: 0.17 * sceneIn, transform: `rotate(${-frame * 0.28}deg) scale(${ringScale})`, pointerEvents: "none" }}>
        <circle cx="325" cy="325" r="275" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 18" fill="none" />
      </svg>

      {/* Center Brand Lockup */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <EmployeticsLogo size={118} showWordmark animateIn delayFrames={8} />

        <div style={{ width: lineW, height: 2, borderRadius: 999, background: "linear-gradient(90deg, transparent, #6366F1, #22D3EE, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: FONTS.display, fontSize: 64, fontWeight: 800, letterSpacing: "-0.035em" }}>
          <span style={{ color: COLORS.textPrimary, opacity: tag1, transform: `translateY(${interpolate(tag1, [0, 1], [30, 0])}px)`, display: "inline-block" }}>
            Predict burnout.
          </span>
          <span style={{ background: "linear-gradient(90deg, #818CF8 0%, #22D3EE 55%, #34D399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: tag2, transform: `translateY(${interpolate(tag2, [0, 1], [30, 0])}px)`, display: "inline-block" }}>
            Keep your people.
          </span>
        </div>

        {/* 3 Clear Feature Summary Pills */}
        <div style={{ opacity: pills, transform: `translateY(${interpolate(pills, [0, 1], [18, 0])}px)`, display: "flex", gap: 14 }}>
          {["Predict Burnout Risk", "1-Click Workload Split", "AI HR Copilot & Private Check-Ins"].map((feat) => (
            <span
              key={feat}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                background: "rgba(15, 23, 42, 0.72)",
                border: "1px solid rgba(148, 163, 184, 0.22)",
                fontFamily: FONTS.mono,
                fontSize: 14,
                color: "#CBD5E1",
              }}
            >
              {feat}
            </span>
          ))}
        </div>

        <div
          style={{
            opacity: cta,
            transform: `translateY(${interpolate(cta, [0, 1], [18, 0])}px)`,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 34px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.82)",
            border: "1px solid rgba(129, 140, 248, 0.45)",
            boxShadow: "0 12px 38px rgba(2, 6, 23, 0.55), 0 0 28px rgba(99, 102, 241, 0.25)",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.emeraldBright }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 600, letterSpacing: "0.04em", color: COLORS.textPrimary }}>
            employetics.ai
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
