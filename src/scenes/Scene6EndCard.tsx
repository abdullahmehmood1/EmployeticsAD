import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText } from "../lib/FitText";
import { POPPINS_FONT } from "../lib/fonts";
import { LogoMark } from "../lib/LogoMark";

/**
 * S6 END CARD (f1020-1199, 6.0 s): Warm CREAM background.
 * f1030-1060: <LogoMark> fades up and scales softly in at center (NAVY).
 * f1050-1075: wordmark "Employetics" wipes in beneath ("Employ" Poppins 800, "etics" Poppins 400, NAVY).
 * f1085-1105: slogan "Predict burnout. Keep your people." fades up (Poppins 500, 42 px, letter-spacing 2 px, NAVY).
 * Hold perfectly still and sharp until f1199.
 */
export const Scene6EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s6 = TIMELINE.S6;

  const logoS = s6.logoStart - s6.start; // 10 (f1030)
  const logoE = s6.logoEnd - s6.start; // 40 (f1060)
  const wordS = s6.wordmarkStart - s6.start; // 30 (f1050)
  const wordE = s6.wordmarkEnd - s6.start; // 55 (f1075)
  const slogS = s6.sloganStart - s6.start; // 65 (f1085)
  const slogE = s6.sloganEnd - s6.start; // 85 (f1105 -> perfectly still thereafter)

  const logoP = interpolate(frame, [logoS, logoE], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(logoP, [0, 1], [0.82, 1]);
  const logoY = interpolate(logoP, [0, 1], [24, 0]);

  const wordWipe = interpolate(frame, [wordS, wordE], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sloganP = interpolate(frame, [slogS, slogE], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sloganY = interpolate(sloganP, [0, 1], [18, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.CREAM,
        paddingLeft: VIDEO.safeLeft,
        paddingRight: VIDEO.width - VIDEO.safeRight,
        paddingTop: VIDEO.safeTop,
        paddingBottom: VIDEO.height - VIDEO.safeBottom,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Centered Brand Icon */}
      <div
        style={{
          opacity: logoP,
          transform: `translateY(${logoY.toFixed(1)}px) scale(${logoScale.toFixed(4)})`,
          marginBottom: 38,
        }}
      >
        <LogoMark size={184} color={PALETTE.NAVY} />
      </div>

      {/* Wordmark "Employetics" (Poppins ONLY on end card: 800 + 400, NAVY) */}
      <div
        style={{
          clipPath: `inset(0 ${((1 - wordWipe) * 100).toFixed(2)}% 0 0)`,
          fontFamily: POPPINS_FONT,
          fontSize: 108,
          lineHeight: 1.04,
          letterSpacing: "-2px",
          color: PALETTE.NAVY,
          whiteSpace: "nowrap",
          maxWidth: VIDEO.maxTextWidth,
        }}
      >
        <span style={{ fontWeight: 800 }}>{COPY.s6WordmarkBold}</span>
        <span style={{ fontWeight: 400 }}>{COPY.s6WordmarkRegular}</span>
      </div>

      {/* Slogan fades up beneath */}
      <div
        style={{
          marginTop: 28,
          opacity: sloganP,
          transform: `translateY(${sloganY.toFixed(1)}px)`,
        }}
      >
        <FitText
          text={COPY.s6Slogan}
          font="brand"
          fontSize={42}
          fontWeight={500}
          color={PALETTE.NAVY}
          maxWidth={VIDEO.maxTextWidth}
          letterSpacing={2}
        />
      </div>
    </AbsoluteFill>
  );
};
