import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

export const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Flat laptop slides in fast from the right (0 -> 78) and spins in 3D to face camera straight-on!
  const slideProg = interpolate(frame, [0, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const spinProg = interpolate(frame, [10, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const laptopX = interpolate(slideProg, [0, 1], [1500, 0]);
  const laptopRotY = interpolate(spinProg, [0, 1], [-66, 0]);
  const laptopScale = interpolate(spinProg, [0, 1], [0.84, 1]);

  // Callout 1 (LEFT): "WHO'S AT RISK?" pops in at ~17.2s (local frame 192)
  const callout1Pop = spring({
    frame: Math.max(0, frame - 192),
    fps,
    config: { damping: 10, stiffness: 240, mass: 0.75 },
  });
  const arrow1Draw = interpolate(frame, [202, 234], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Callout 2 (RIGHT): "AND WHY." pops in at ~20.8s (local frame 408)
  const callout2Pop = spring({
    frame: Math.max(0, frame - 408),
    fps,
    config: { damping: 10, stiffness: 240, mass: 0.75 },
  });
  const arrow2Draw = interpolate(frame, [418, 450], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Fast amber/navy wipe transition into Scene 5 Solution (frames 704-720)
  const exitWipe = interpolate(frame, [704, 720], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.white,
        perspective: 1800,
        overflow: "hidden",
      }}
    >
      {/* Subtle flat architectural frame */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect x="64" y="56" width="1792" height="968" stroke="rgba(15, 42, 82, 0.10)" strokeWidth="2.5" fill="none" />
      </svg>

      {/* Top minimal kicker */}
      <div
        style={{
          position: "absolute",
          top: 84,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: COLORS.navy,
          opacity: slideProg,
        }}
      >
        EMPLOYETICS PLATFORM
      </div>

      {/* CENTER: Flat Geometric Laptop Frame with PLAIN SOLID NAVY (#0F2A52) SCREEN RECTANGLE */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 34,
        }}
      >
        <div
          style={{
            transform: `translateX(${laptopX}px) rotateY(${laptopRotY}deg) scale(${laptopScale})`,
            transformStyle: "preserve-3d",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Laptop Lid / Bezel */}
          <div
            style={{
              width: 1008,
              height: 588,
              borderRadius: "24px 24px 6px 6px",
              backgroundColor: COLORS.slateFrame,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 24px 50px rgba(15, 42, 82, 0.14)",
            }}
          >
            {/* Tiny camera dot */}
            <div
              style={{
                position: "absolute",
                top: 9,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#475569",
              }}
            />

            {/* PLAIN SOLID NAVY (#0F2A52) 16:9 SCREEN RECTANGLE — 100% CLEAN FOR SCREEN RECORDING DROP-IN */}
            <div
              style={{
                width: 960,
                height: 540,
                backgroundColor: COLORS.navy,
              }}
            />
          </div>

          {/* Flat Laptop Keyboard Base / Deck */}
          <div
            style={{
              width: 1140,
              height: 28,
              backgroundColor: COLORS.slateBase,
              borderRadius: "2px 2px 18px 18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              borderBottom: `6px solid ${COLORS.slateBaseDark}`,
            }}
          >
            <div
              style={{
                width: 148,
                height: 9,
                backgroundColor: COLORS.slateBaseDark,
                borderRadius: "0 0 8px 8px",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      {/* CALLOUT 1 (LEFT SIDE — CLEAR OF SCREEN): "WHO'S AT RISK?" + Animated Arrow */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 342,
          width: 286,
          opacity: Math.min(1, callout1Pop * 2),
          transform: `scale(${interpolate(callout1Pop, [0, 1], [0.55, 1])})`,
          transformOrigin: "right center",
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.navy,
            borderLeft: `10px solid ${COLORS.amber}`,
            padding: "24px 28px",
            boxShadow: "0 16px 32px rgba(15, 42, 82, 0.16)",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: COLORS.amber,
              marginBottom: 6,
            }}
          >
            01 • PREDICT
          </div>
          <div
            style={{
              fontFamily: FONTS.heavy,
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: COLORS.white,
              lineHeight: 1.05,
            }}
          >
            WHO’S AT
            <br />
            RISK<span style={{ color: COLORS.amber }}>?</span>
          </div>
        </div>
      </div>

      {/* Animated Bold Flat Arrow 1 -> Laptop Left Edge (starts cleanly outside box!) */}
      {frame >= 200 && (
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          fill="none"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <path
            d="M 376 420 C 402 420, 418 438, 444 438"
            stroke={COLORS.amber}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="110"
            strokeDashoffset={110 * (1 - arrow1Draw)}
          />
          {arrow1Draw > 0.88 && (
            <path
              d="M 426 422 L 446 438 L 426 454"
              stroke={COLORS.amber}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}

      {/* CALLOUT 2 (RIGHT SIDE — CLEAR OF SCREEN): "AND WHY." + Animated Arrow */}
      <div
        style={{
          position: "absolute",
          right: 78,
          top: 520,
          width: 286,
          opacity: Math.min(1, callout2Pop * 2),
          transform: `scale(${interpolate(callout2Pop, [0, 1], [0.55, 1])})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.amber,
            borderRight: `10px solid ${COLORS.navy}`,
            padding: "24px 28px",
            boxShadow: "0 16px 32px rgba(245, 158, 11, 0.22)",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: COLORS.navy,
              marginBottom: 6,
            }}
          >
            02 • EXPLAIN
          </div>
          <div
            style={{
              fontFamily: FONTS.heavy,
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: COLORS.navy,
              lineHeight: 1.02,
            }}
          >
            AND WHY<span style={{ color: COLORS.white }}>.</span>
          </div>
        </div>
      </div>

      {/* Animated Bold Flat Arrow 2 -> Laptop Right Edge (starts cleanly outside box!) */}
      {frame >= 416 && (
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          fill="none"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <path
            d="M 1544 584 C 1518 584, 1502 566, 1476 566"
            stroke={COLORS.navy}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="110"
            strokeDashoffset={110 * (1 - arrow2Draw)}
          />
          {arrow2Draw > 0.88 && (
            <path
              d="M 1494 550 L 1474 566 L 1494 582"
              stroke={COLORS.navy}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}

      {/* Fast Amber/Navy Hard Wipe into Scene 5 Solution */}
      {exitWipe > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.amber,
              transform: `translateX(${100 - Math.min(100, exitWipe * 1.18)}%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.navy,
              transform: `translateX(${100 - exitWipe}%)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
