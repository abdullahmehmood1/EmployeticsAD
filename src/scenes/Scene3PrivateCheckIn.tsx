import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Check, EyeOff, Lock, ShieldCheck, Timer } from "lucide-react";
import { PaperCard } from "../components/PaperCard";
import { COLORS, FONTS } from "../theme";

const TAGS = [
  { label: "Back-to-back sprints", selectedAt: 135 },
  { label: "No weekend recovery", selectedAt: 185 },
  { label: "Late-night alerts", selectedAt: 999 },
  { label: "Unclear priorities", selectedAt: 999 },
];

export const Scene3PrivateCheckIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(frame, [628, 660], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Countdown timer inside 1-minute check-in pill: 0:60 -> 0:46
  const secsLeft = Math.max(46, 60 - Math.floor(frame / 28));

  // Energy slider smoothly slides from 70% -> 28% ("Drained 3/10")
  const sliderPos = interpolate(frame, [40, 120], [72, 28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Privacy Vault Lock engages around 25.0s -> local frame 300 ("It's private. Never shared with HR.")
  const vaultSpring = spring({
    frame: Math.max(0, frame - 300),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const proofLeftSpring = spring({
    frame: Math.max(0, frame - 340),
    fps,
    config: { damping: 14, stiffness: 125 },
  });

  const proofRightSpring = spring({
    frame: Math.max(0, frame - 410),
    fps,
    config: { damping: 14, stiffness: 125 },
  });

  const ripple = interpolate(frame, [306, 385], [0.75, 1.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleOp = interpolate(frame, [306, 325, 385], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneIn * (1 - exitProgress),
        transform: `scale(${interpolate(sceneIn, [0, 1], [0.96, 1]) + exitProgress * 0.06})`,
        padding: "66px 130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Editorial Header */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 20px",
            borderRadius: 999,
            background: COLORS.sageSoft,
            border: "1px solid rgba(21, 128, 61, 0.30)",
            fontFamily: FONTS.mono,
            fontSize: 14,
            color: COLORS.forest,
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          <Timer size={16} />
          ONE-MINUTE PRIVATE CHECK-IN • 0:{secsLeft}
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: COLORS.ink,
          }}
        >
          One minute.{" "}
          <span style={{ fontFamily: FONTS.serifItalic, color: COLORS.sage }}>
            Completely private.
          </span>
        </div>
      </div>

      {/* Center Tactile Check-In Card + Botanical Privacy Vault Overlay */}
      <div style={{ position: "relative", flex: 1, marginTop: 18, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
        <PaperCard
          accentColor={COLORS.forest}
          showTopRibbon
          padding="36px 44px"
          style={{ position: "relative" }}
        >
          {/* Check-in content dims softly once Private Vault Shield locks */}
          <div style={{ opacity: 1 - vaultSpring * 0.55 }}>
            {/* Question 1: Energy Slider */}
            <div style={{ marginBottom: 34 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
                <div style={{ fontFamily: FONTS.serif, fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
                  1. How is your energy today?
                </div>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: sliderPos < 45 ? COLORS.terracotta : COLORS.sage,
                    background: sliderPos < 45 ? COLORS.terracottaSoft : COLORS.sageSoft,
                    padding: "6px 16px",
                    borderRadius: 999,
                  }}
                >
                  {sliderPos < 45 ? "Drained • 3 / 10" : "Steady • 7 / 10"}
                </span>
              </div>

              <div style={{ position: "relative", height: 18, borderRadius: 999, background: "#EDE6DA" }}>
                <div
                  style={{
                    width: `${sliderPos}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #D94826 0%, #F59E0B 100%)",
                  }}
                />
                {/* Tactile thumb */}
                <div
                  style={{
                    position: "absolute",
                    left: `${sliderPos}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#FFFDF9",
                    border: `4px solid ${COLORS.terracotta}`,
                    boxShadow: "0 6px 16px rgba(28, 25, 23, 0.18)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: COLORS.inkMuted,
                  marginTop: 10,
                }}
              >
                <span>EXHAUSTED</span>
                <span>BALANCED</span>
                <span>ENERGIZED</span>
              </div>
            </div>

            {/* Question 2: Selectable Editorial Chips */}
            <div>
              <div style={{ fontFamily: FONTS.serif, fontSize: 30, fontWeight: 700, color: COLORS.ink, marginBottom: 18 }}>
                2. What’s weighing on you most?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {TAGS.map((tag) => {
                  const selected = frame >= tag.selectedAt;
                  return (
                    <div
                      key={tag.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 24px",
                        borderRadius: 999,
                        background: selected ? COLORS.forest : COLORS.paperSoft,
                        border: selected
                          ? `1.5px solid ${COLORS.forest}`
                          : `1.5px solid ${COLORS.borderHairline}`,
                        fontFamily: FONTS.sans,
                        fontSize: 19,
                        fontWeight: 600,
                        color: selected ? "#FAF6F0" : COLORS.inkSecondary,
                        boxShadow: selected ? "0 10px 24px rgba(20, 83, 45, 0.22)" : "none",
                      }}
                    >
                      {selected && <Check size={18} color="#A7F3D0" />}
                      {tag.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTANICAL PRIVACY VAULT SEAL OVERLAY */}
          {vaultSpring > 0.01 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `rgba(250, 246, 240, ${0.65 * vaultSpring})`,
              }}
            >
              {/* Concentric Sage Protection Ripple */}
              {rippleOp > 0.01 && (
                <div
                  style={{
                    position: "absolute",
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    border: `2.5px solid ${COLORS.sage}`,
                    opacity: rippleOp,
                    transform: `scale(${ripple})`,
                  }}
                />
              )}

              <div
                style={{
                  opacity: vaultSpring,
                  transform: `scale(${interpolate(vaultSpring, [0, 1], [0.82, 1])})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "24px 42px",
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #14532D 0%, #166534 100%)",
                  boxShadow: "0 24px 56px rgba(20, 83, 45, 0.34)",
                  color: "#FAF6F0",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: "rgba(167, 243, 208, 0.16)",
                    border: "1.5px solid rgba(167, 243, 208, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock color="#A7F3D0" size={30} />
                </div>
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: "#A7F3D0", letterSpacing: "0.1em" }}>
                    END-TO-END PRIVATE CHECK-IN
                  </div>
                  <div style={{ fontFamily: FONTS.serif, fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>
                    Locked to your eyes only.
                  </div>
                </div>
              </div>
            </div>
          )}
        </PaperCard>

        {/* Bottom Dual Privacy Guarantee Cards ("It's private. Never shared with HR.") */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div
            style={{
              opacity: proofLeftSpring,
              transform: `translateY(${interpolate(proofLeftSpring, [0, 1], [32, 0])}px)`,
            }}
          >
            <PaperCard
              accentColor={COLORS.sage}
              showTopRibbon
              padding="24px 30px"
              radius={22}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: COLORS.sageSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck color={COLORS.forest} size={28} />
                </div>
                <div>
                  <div style={{ fontFamily: FONTS.serif, fontSize: 27, fontWeight: 700, color: COLORS.forest }}>
                    Private to You
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 17, color: COLORS.inkSecondary, marginTop: 3 }}>
                    Personal insights & pacing tips — stored privately.
                  </div>
                </div>
              </div>
            </PaperCard>
          </div>

          <div
            style={{
              opacity: proofRightSpring,
              transform: `translateY(${interpolate(proofRightSpring, [0, 1], [32, 0])}px)`,
            }}
          >
            <PaperCard
              accentColor={COLORS.terracotta}
              showTopRibbon
              padding="24px 30px"
              radius={22}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: COLORS.terracottaSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <EyeOff color={COLORS.terracotta} size={28} />
                </div>
                <div>
                  <div style={{ fontFamily: FONTS.serif, fontSize: 27, fontWeight: 700, color: COLORS.ink }}>
                    Never Shared with HR
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 17, color: COLORS.inkSecondary, marginTop: 3 }}>
                    Zero manager visibility. Zero HR access. Always.
                  </div>
                </div>
              </div>
            </PaperCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
