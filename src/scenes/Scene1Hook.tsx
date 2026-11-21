import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO, lerpColor } from "../timeline";
import { FitText } from "../lib/FitText";
import { INTER_FONT, SERIF_FONT } from "../lib/fonts";

/**
 * S1 HOOK (f0-89): MIDNIGHT background.
 * f8: big DM Serif Display "I'm fine." (CREAM, ~160 px) types on with blinking cursor.
 * f40, f48, f56: three ghost copies expand outward and softly fade.
 * f70-89: text shrinks & glides down-right into a TEAL chat bubble as the background warms to DEEP chat screen.
 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = TIMELINE.S1;

  const text = COPY.s1Hook; // "I'm fine."
  const typeStart = s1.typeStart; // 8
  const typeEnd = s1.typeEnd; // 35
  const morphStart = s1.morphStart; // 70
  const morphEnd = s1.morphEnd; // 89

  // Characters typed cleanly across f8..35
  const typedCount =
    frame < typeStart
      ? 0
      : Math.min(
          text.length,
          Math.floor(
            interpolate(frame, [typeStart, typeEnd], [1, text.length + 0.99], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          )
        );
  const visibleText = text.slice(0, typedCount);

  // Soft blinking caret while typing & briefly after (hides when morph begins)
  const showCursor = frame >= typeStart && frame < morphStart - 2;
  const cursorOpacity = showCursor ? (Math.floor((frame - typeStart) / 9) % 2 === 0 ? 0.9 : 0.12) : 0;

  // f70-89 morph: big serif line shrinks & moves down-right into a TEAL chat bubble; background -> DEEP
  const morphP = interpolate(frame, [morphStart, morphEnd], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgColor = lerpColor(PALETTE.MIDNIGHT, PALETTE.DEEP, morphP);

  // Gentle slow breathing push-in before morph
  const breatheScale = interpolate(frame, [0, morphStart], [0.985, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Main line morphs from screen center (540, 860) toward chat bubble zone (780, 1020)
  const tx = interpolate(morphP, [0, 1], [0, 235]);
  const ty = interpolate(morphP, [0, 1], [0, 165]);
  const textScale = interpolate(morphP, [0, 1], [breatheScale, 0.34]);
  const serifOpacity = interpolate(morphP, [0, 0.72], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Emerging TEAL chat bubble fades in cleanly as the serif text finishes shrinking
  const bubbleOpacity = interpolate(morphP, [0.35, 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bubbleScale = interpolate(morphP, [0.35, 1], [1.22, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Faint chat chrome emerging softly at the very end (f74-89) for seamless handoff to S2
  const chromeOpacity = interpolate(morphP, [0.45, 1], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* Soft emerging chat header divider at end of S1 */}
      {chromeOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: VIDEO.safeTop + 76,
            left: VIDEO.safeLeft,
            right: VIDEO.width - VIDEO.safeRight,
            height: 76,
            borderBottom: "1px solid rgba(255, 244, 224, 0.14)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: chromeOpacity,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: PALETTE.BUBBLE,
            }}
          />
          <div
            style={{
              width: 148,
              height: 14,
              borderRadius: 999,
              backgroundColor: PALETTE.BUBBLE,
            }}
          />
        </div>
      )}

      {/* Three ghost copies expanding gently outward at f40, f48, f56 */}
      {s1.ghostFrames.map((gStart, idx) => {
        const rel = frame - gStart;
        if (rel < 0 || rel > 36) return null;
        const p = interpolate(rel, [0, 32], [0, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const gScale = 1 + p * (0.42 + idx * 0.14);
        const gOpacity = interpolate(rel, [0, 5, 32], [0, 0.34 - idx * 0.05, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) * (1 - morphP);

        return (
          <div
            key={gStart}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 140,
              pointerEvents: "none",
              opacity: gOpacity,
              transform: `scale(${gScale.toFixed(4)})`,
            }}
          >
            <FitText
              text={text}
              font="serif"
              fontSize={160}
              color={PALETTE.CREAM}
              maxWidth={VIDEO.maxTextWidth}
            />
          </div>
        );
      })}

      {/* Center hero serif line "I'm fine." typing on with blinking cursor */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 140,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: serifOpacity,
            transform: `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${textScale.toFixed(
              4
            )})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 162,
              lineHeight: 1.05,
              color: PALETTE.CREAM,
              whiteSpace: "nowrap",
            }}
          >
            {visibleText}
          </span>
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 138,
                marginLeft: 8,
                borderRadius: 3,
                backgroundColor: PALETTE.CREAM,
                opacity: cursorOpacity,
              }}
            />
          )}
        </div>
      </div>

      {/* Morph target: emerging TEAL chat bubble down-right */}
      {bubbleOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            right: VIDEO.width - VIDEO.safeRight,
            top: 995,
            opacity: bubbleOpacity,
            transform: `scale(${bubbleScale.toFixed(4)})`,
            transformOrigin: "right center",
            backgroundColor: PALETTE.TEAL,
            color: PALETTE.MIDNIGHT,
            fontFamily: INTER_FONT,
            fontSize: 35,
            fontWeight: 600,
            padding: "21px 32px",
            borderRadius: "28px 28px 8px 28px",
            boxShadow: "0 10px 26px rgba(6, 15, 31, 0.25)",
          }}
        >
          {COPY.s1Hook}
        </div>
      )}
    </AbsoluteFill>
  );
};
