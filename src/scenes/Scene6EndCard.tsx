import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { FitText } from "../lib/FitText";
import { POPPINS_FONT } from "../lib/fonts";
import { LogoMark } from "../lib/LogoMark";

/**
 * S6 END CARD (f1020-1199, 6.0 s): SKY background.
 * f1025-1050: <LogoMark> springs in at center-top.
 * f1045-1070: wordmark "Employetics" wipes in under it ("Employ" Poppins 800, "etics" Poppins 400, NAVY).
 * f1080-1100: slogan "Predict burnout. Keep your people." fades up (Poppins 500, 40 px, letter-spacing 2 px, NAVY).
 * f1100-1199: hold perfectly still and sharp.
 */
export const Scene6EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s6 = TIMELINE.S6;

  const logoStart = s6.logoStart - s6.start; // 5
  const wordStart = s6.wordmarkStart - s6.start; // 25
  const wordEnd = s6.wordmarkEnd - s6.start; // 50
  const sloganStart = s6.sloganStart - s6.start; // 60
  const sloganEnd = s6.sloganEnd - s6.start; // 80 (global f1100 -> perfectly still thereafter)

  const logoRel = frame - logoStart;
  const logoSpr =
    logoRel < 0
      ? 0
      : frame >= sloganEnd
      ? 1
      : spring({
          frame: logoRel,
          fps,
          config: { damping: 11, stiffness: 175, mass: 0.85 },
        });
  const logoScale = interpolate(logoSpr, [0, 1], [0.4, 1]);
  const logoOpacity =
    logoRel < 0 ? 0 : interpolate(logoRel, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  const wordWipe = interpolate(frame, [wordStart, wordEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sloganProgress = interpolate(frame, [sloganStart, sloganEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sloganY = interpolate(sloganProgress, [0, 1], [22, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.SKY,
        padding: VIDEO.safeMargin,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* LogoMark centered above wordmark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale.toFixed(4)})`,
          marginBottom: 34,
        }}
      >
        <LogoMark size={172} color={PALETTE.NAVY} />
      </div>

      {/* Wordmark "Employetics" wipes in cleanly beneath ("Employ" 800 + "etics" 400, NAVY) */}
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
          opacity: sloganProgress,
          transform: `translateY(${sloganY.toFixed(2)}px)`,
        }}
      >
        <FitText
          text={COPY.s6Slogan}
          fontSize={40}
          fontWeight={500}
          color={PALETTE.NAVY}
          maxWidth={VIDEO.maxTextWidth}
          letterSpacing={2}
        />
      </div>
    </AbsoluteFill>
  );
};
