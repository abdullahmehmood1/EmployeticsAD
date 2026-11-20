import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO } from "../timeline";
import { DotGrid } from "../lib/DotGrid";
import { FitText } from "../lib/FitText";

/**
 * S3 REVEAL (f330-419): WHITE background.
 * f336: "MEET" (NAVY, 70 px, letter-spaced) slides up.
 * f345: "EMPLOYETICS." (NAVY, Poppins 900, ~190 px) bounces in with overshoot + one expanding ring pulse.
 * f372-416: "AI THAT SPOTS BURNOUT BEFORE PEOPLE QUIT." types on (NAVY, 56 px, weight 700);
 *   from f400 an AMBER underline sweeps under the word "BURNOUT".
 * f410-419: NAVY iris wipe expands from center to cover white.
 */
export const Scene3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s3 = TIMELINE.S3;

  const meetAt = s3.meetIn - s3.start; // 6
  const brandAt = s3.brandBounce - s3.start; // 15
  const typeStart = s3.typeStart - s3.start; // 42
  const typeEnd = s3.typeEnd - s3.start; // 86
  const underlineStart = s3.underlineStart - s3.start; // 70
  const underlineEnd = s3.underlineEnd - s3.start; // 79
  const irisStart = s3.irisStart - s3.start; // 80
  const irisEnd = s3.irisEnd - s3.start; // 89

  // "MEET" slide up
  const meetProgress = spring({
    frame: Math.max(0, frame - meetAt),
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.7 },
  });
  const meetOpacity = frame < meetAt ? 0 : interpolate(frame - meetAt, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const meetY = interpolate(meetProgress, [0, 1], [44, 0]);

  // "EMPLOYETICS." bounce with crisp overshoot
  const brandRel = frame - brandAt;
  const brandSpring =
    brandRel < 0
      ? 0
      : spring({
          frame: brandRel,
          fps,
          config: { damping: 9.5, stiffness: 210, mass: 0.8 },
        });
  const brandScale = interpolate(brandSpring, [0, 1], [0.58, 1]);
  const brandOpacity =
    brandRel < 0 ? 0 : interpolate(brandRel, [0, 3], [0, 1], { extrapolateRight: "clamp" });

  // Single expanding ring pulse right on "EMPLOYETICS." bounce (flat AMBER stroke)
  const ringRadius = interpolate(brandRel, [0, 26], [85, 620], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(brandRel, [0, 3, 26], [0, 0.72, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typewriter reveal for "AI THAT SPOTS BURNOUT BEFORE PEOPLE QUIT."
  const fullLine = COPY.s3TaglineFull;
  const hlWord = COPY.s3TaglineHighlight;
  const hlIndex = fullLine.indexOf(hlWord);
  const beforeHl = hlIndex >= 0 ? fullLine.slice(0, hlIndex) : fullLine;
  const hlText = hlIndex >= 0 ? fullLine.slice(hlIndex, hlIndex + hlWord.length) : "";
  const afterHl = hlIndex >= 0 ? fullLine.slice(hlIndex + hlWord.length) : "";

  const typedCount =
    frame < typeStart
      ? 0
      : Math.min(
          fullLine.length,
          Math.floor(
            interpolate(frame, [typeStart, typeEnd], [1, fullLine.length], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          )
        );

  const renderTypedSegment = (segment: string, offset: number) => {
    const visibleLen = Math.max(0, Math.min(segment.length, typedCount - offset));
    return (
      <>
        <span>{segment.slice(0, visibleLen)}</span>
        <span style={{ visibility: "hidden" }}>{segment.slice(visibleLen)}</span>
      </>
    );
  };

  // AMBER underline sweep under "BURNOUT" starting right at f400
  const underlineScaleX =
    frame < underlineStart
      ? 0
      : interpolate(frame, [underlineStart, underlineEnd], [0.28, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // NAVY circular iris wipe expanding from center (f410-419)
  const irisRadius =
    frame < irisStart
      ? 0
      : interpolate(frame, [irisStart, irisEnd], [0, 1180], {
          easing: Easing.in(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.WHITE, overflow: "hidden" }}>
      <DotGrid color={PALETTE.NAVY} opacity={0.055} spacing={68} speedX={-0.45} speedY={0.25} />

      {/* Expanding flat ring pulse on brand reveal */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {brandRel >= 0 && ringOpacity > 0.005 && (
          <circle
            cx={VIDEO.width / 2}
            cy={VIDEO.height / 2 - 20}
            r={ringRadius}
            fill="none"
            stroke={PALETTE.AMBER}
            strokeWidth={7}
            strokeOpacity={ringOpacity}
          />
        )}
      </svg>

      {/* Safe-margin centered reveal stack */}
      <AbsoluteFill
        style={{
          padding: VIDEO.safeMargin,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* "MEET" */}
        <div
          style={{
            opacity: meetOpacity,
            transform: `translateY(${meetY.toFixed(2)}px)`,
            marginBottom: 8,
          }}
        >
          <FitText
            text={COPY.s3Kicker}
            fontSize={70}
            fontWeight={700}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={18}
          />
        </div>

        {/* "EMPLOYETICS." */}
        <div
          style={{
            opacity: brandOpacity,
            transform: `scale(${brandScale.toFixed(4)})`,
            marginBottom: 42,
          }}
        >
          <FitText
            text={COPY.s3Brand}
            fontSize={190}
            fontWeight={900}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={-3}
          />
        </div>

        {/* Typewriter line with pixel-locked AMBER underline sweep under "BURNOUT" */}
        <div style={{ minHeight: 82, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FitText
            text={fullLine}
            fontSize={56}
            fontWeight={700}
            color={PALETTE.NAVY}
            maxWidth={VIDEO.maxTextWidth}
            letterSpacing={0.5}
          >
            {renderTypedSegment(beforeHl, 0)}
            {hlText && (
              <span style={{ position: "relative", display: "inline-block" }}>
                {renderTypedSegment(hlText, beforeHl.length)}
                {underlineScaleX > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -10,
                      height: 9,
                      borderRadius: 4,
                      backgroundColor: PALETTE.AMBER,
                      transformOrigin: "left center",
                      transform: `scaleX(${underlineScaleX.toFixed(4)})`,
                    }}
                  />
                )}
              </span>
            )}
            {renderTypedSegment(afterHl, beforeHl.length + hlText.length)}
          </FitText>
        </div>
      </AbsoluteFill>

      {/* NAVY circular iris wipe expanding from center (f410-419) */}
      {irisRadius > 0 && (
        <svg
          width={VIDEO.width}
          height={VIDEO.height}
          viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle cx={VIDEO.width / 2} cy={VIDEO.height / 2} r={irisRadius} fill={PALETTE.NAVY} />
        </svg>
      )}
    </AbsoluteFill>
  );
};
