import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../theme";

/**
 * 34-40s: Everything rapidly collapses inward into a 100% PURE SOLID WHITE (#FFFFFF) screen.
 * Completely clean for dropping logo & slogan in the video editor!
 */
export const Scene6Whiteout: React.FC = () => {
  const frame = useCurrentFrame();

  // Rapid geometric collapse over first 38 frames (0.63s), then 100% pure solid white (#FFFFFF)
  const collapse = interpolate(frame, [0, 36], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.exp),
  });

  const amberRingScale = interpolate(frame, [16, 40], [1.15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white, overflow: "hidden" }}>
      {/* Collapsing Deep Navy card snapping into center point */}
      {collapse > 0.002 && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.navy,
            transform: `scale(${collapse})`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heavy,
              fontSize: 158,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: COLORS.white,
              textAlign: "center",
              lineHeight: 0.95,
              opacity: collapse,
            }}
          >
            KEEP YOUR
            <br />
            <span style={{ color: COLORS.amber }}>PEOPLE.</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Brief crisp amber geometric accent collapsing into the center dot */}
      {amberRingScale > 0.005 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              width: 240,
              height: 16,
              backgroundColor: COLORS.amber,
              transform: `scale(${amberRingScale})`,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
