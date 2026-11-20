import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FlatBattery } from "../components/FlatBattery";
import { COLORS, FONTS, getImpactShake } from "../theme";

export const Scene5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero Battery recharges smoothly from 8% Empty Red -> 100% Full Green (frames 12 -> 310)
  const batteryLevel = interpolate(frame, [12, 165, 305], [8, 56, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const batteryPop = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Beat 1 (48-252): "ACT EARLY."
  const hit1 = 48;
  const slam1 = spring({
    frame: Math.max(0, frame - hit1),
    fps,
    config: { damping: 11, stiffness: 310, mass: 0.72 },
  });

  // Beat 2 (252-480): "KEEP YOUR PEOPLE."
  const hit2 = 252;
  const slam2 = spring({
    frame: Math.max(0, frame - hit2),
    fps,
    config: { damping: 11, stiffness: 310, mass: 0.72 },
  });

  const isBeat2 = frame >= hit2;
  const shake1 = getImpactShake(frame, hit1, 18, 16);
  const shake2 = getImpactShake(frame, hit2, 22, 18);
  const sx = shake1.x + shake2.x;
  const sy = shake1.y + shake2.y;
  const srot = shake1.rot + shake2.rot;

  // Quick amber kinetic slash wipe between Beat 1 and Beat 2
  const midWipe = interpolate(frame, [244, 256], [-100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const activeLocal = isBeat2 ? frame - hit2 : Math.max(0, frame - hit1);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy, overflow: "hidden" }}>
      {/* Clean geometric framing lines */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect x="64" y="56" width="1792" height="968" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
      </svg>

      {/* Main Container with Screen-Shake */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${sx}px, ${sy}px) rotate(${srot}deg)`,
          gap: 64,
        }}
      >
        {/* Hero Recharging Flat Battery Icon */}
        <div
          style={{
            transform: `scale(${interpolate(batteryPop, [0, 1], [0.6, 1])})`,
            padding: "24px 44px",
            borderRadius: 18,
            backgroundColor: COLORS.navyDark,
            border: `2px solid ${batteryLevel >= 98 ? COLORS.batteryGreen : "rgba(255,255,255,0.16)"}`,
          }}
        >
          <FlatBattery
            level={batteryLevel}
            scale={1.45}
            charging={batteryLevel < 99}
            showPercent
          />
        </div>

        {/* Giant Heavy Kinetic Slam Typography */}
        <div style={{ textAlign: "center", minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {!isBeat2 && frame >= hit1 && (
            <div
              style={{
                fontFamily: FONTS.heavy,
                fontSize: 186,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                color: COLORS.white,
                lineHeight: 0.94,
                transform: `scale(${interpolate(slam1, [0, 1], [1.85, 1])})`,
                opacity: Math.min(1, slam1 * 2.4),
              }}
            >
              ACT EARLY<span style={{ color: COLORS.amber }}>.</span>
            </div>
          )}

          {isBeat2 && (
            <div
              style={{
                fontFamily: FONTS.heavy,
                fontSize: 158,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                color: COLORS.white,
                lineHeight: 0.95,
                transform: `scale(${interpolate(slam2, [0, 1], [1.85, 1])})`,
                opacity: Math.min(1, slam2 * 2.4),
              }}
            >
              KEEP YOUR
              <br />
              <span style={{ color: COLORS.amber }}>PEOPLE</span>
              <span style={{ color: COLORS.white }}>.</span>
            </div>
          )}

          {/* Crisp Accent Bar */}
          {frame >= hit1 && (
            <div
              style={{
                width: interpolate(activeLocal, [0, 14], [0, 560], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.exp),
                }),
                height: 12,
                backgroundColor: isBeat2 ? COLORS.batteryGreen : COLORS.amber,
                marginTop: 26,
              }}
            />
          )}
        </div>
      </AbsoluteFill>

      {/* Quick Kinetic Amber Slash Wipe at 30.2s */}
      {frame >= 244 && frame <= 256 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: COLORS.amber,
            transform: `translateX(${midWipe}%) skewX(-10deg)`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
