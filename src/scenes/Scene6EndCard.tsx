import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText } from "../lib/FitText";
import { POPPINS_FONT } from "../lib/fonts";
import { LogoMark } from "../lib/LogoMark";

/**
 * S6 END CARD (f1035-1199, 5.5 s): Pure WHITE background.
 * f1040-1065: <LogoMark> springs in center-left.
 * f1055-1080: wordmark "Employetics" wipes in to its right ("Employ" 800, "etics" 400, NAVY).
 * f1085-1100: "Predict burnout. Keep your people." fades up beneath (Poppins 500, ~46 px, letter-spacing 2 px, NAVY).
 * f1100-1199: hold perfectly still and sharp.
 */
export const Scene6EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s6 = TIMELINE.S6;

  const logoStart = s6.logoStart - s6.start; // 5
  const wordStart = s6.wordmarkStart - s6.start; // 20
  const wordEnd = s6.wordmarkEnd - s6.start; // 45
  const sloganStart = s6.sloganStart - s6.start; // 50
  const sloganEnd = s6.sloganEnd - s6.start; // 65 (global f1100 -> perfectly still thereafter)

  // Logo icon spring in (f1040-1065), locked cleanly to 1.0 by sloganEnd so hold is 100% still
  const logoRel = frame - logoStart;
  const logoSpr =
    logoRel < 0
      ? 0
      : frame >= sloganEnd
      ? 1
      : spring({
          frame: logoRel,
          fps,
          config: { damping: 12, stiffness: 175, mass: 0.85 },
        });
  const logoScale = interpolate(logoSpr, [0, 1], [0.4, 1]);
  const logoOpacity =
    logoRel < 0 ? 0 : interpolate(logoRel, [0, 4], [0, 1], { extrapolateRight: "clamp" });

  // Wordmark wipe-in left-to-right (f1055-1080)
  const wordWipe = interpolate(frame, [wordStart, wordEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slogan fade up beneath (f1085-1100)
  const sloganProgress = interpolate(frame, [sloganStart, sloganEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sloganY = interpolate(sloganProgress, [0, 1], [24, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.WHITE,
        padding: VIDEO.safeMargin,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Horizontal Brand Lockup: LogoMark center-left + Wordmark to its right */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          maxWidth: VIDEO.maxTextWidth,
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale.toFixed(4)})`,
          }}
        >
          <LogoMark size={164} color={PALETTE.NAVY} />
        </div>

        <div
          style={{
            clipPath: `inset(0 ${((1 - wordWipe) * 100).toFixed(2)}% 0 0)`,
            fontFamily: POPPINS_FONT,
            fontSize: 128,
            lineHeight: 1.0,
            letterSpacing: "-2px",
            color: PALETTE.NAVY,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontWeight: 800 }}>{COPY.s6WordmarkBold}</span>
          <span style={{ fontWeight: 400 }}>{COPY.s6WordmarkRegular}</span>
        </div>
      </div>

      {/* Slogan fades up cleanly beneath */}
      <div
        style={{
          marginTop: 42,
          opacity: sloganProgress,
          transform: `translateY(${sloganY.toFixed(2)}px)`,
        }}
      >
        <FitText
          text={COPY.s6Slogan}
          fontSize={46}
          fontWeight={500}
          color={PALETTE.NAVY}
          maxWidth={VIDEO.maxTextWidth}
          letterSpacing={2}
        />
      </div>
    </AbsoluteFill>
  );
};
