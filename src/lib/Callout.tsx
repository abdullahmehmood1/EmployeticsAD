import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTE, VIDEO } from "../timeline";
import { FitText } from "./FitText";

export interface CalloutProps {
  /** Local frame inside S4 when this callout pops in. */
  startFrame: number;
  /** Optional local frame when this callout softly fades out. */
  endFrame?: number;
  label: string;
  labelX: number;
  labelY: number;
  labelMaxWidth?: number;
  labelFontSize?: number;
  labelColor?: string;
  pillBg?: string;
  arrowColor?: string;
  fromX: number;
  fromY: number;
  ctrlX: number;
  ctrlY: number;
  toX: number;
  toY: number;
}

/**
 * Friendly rounded pill label + soft curved vector arrow drawing smoothly to a UI target.
 */
export const Callout: React.FC<CalloutProps> = ({
  startFrame,
  endFrame,
  label,
  labelX,
  labelY,
  labelMaxWidth = 680,
  labelFontSize = 42,
  labelColor = PALETTE.NAVY,
  pillBg = PALETTE.WHITE,
  arrowColor = PALETTE.CORAL,
  fromX,
  fromY,
  ctrlX,
  ctrlY,
  toX,
  toY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - startFrame;

  if (rel < 0) return null;

  const outFade =
    endFrame !== undefined
      ? interpolate(frame, [endFrame - 10, endFrame], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  if (outFade <= 0.01) return null;

  const spr = spring({
    frame: rel,
    fps,
    config: { damping: 11, stiffness: 185, mass: 0.8 },
  });
  const labelScale = interpolate(spr, [0, 1], [0.65, 1]);
  const inFade = interpolate(rel, [0, 4], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drawProgress = interpolate(rel, [1, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOpacity = interpolate(drawProgress, [0.7, 0.98], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const angle = Math.atan2(toY - ctrlY, toX - ctrlX);
  const headLen = 19;
  const spread = 0.54;
  const h1x = toX - headLen * Math.cos(angle - spread);
  const h1y = toY - headLen * Math.sin(angle - spread);
  const h2x = toX - headLen * Math.cos(angle + spread);
  const h2y = toY - headLen * Math.sin(angle + spread);

  const approxLen =
    Math.hypot(ctrlX - fromX, ctrlY - fromY) + Math.hypot(toX - ctrlX, toY - ctrlY) + 40;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: outFade }}>
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <path
          d={`M ${fromX.toFixed(1)} ${fromY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(
            1
          )} ${toX.toFixed(1)} ${toY.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.WHITE}
          strokeWidth={11}
          strokeLinecap="round"
          strokeDasharray={approxLen}
          strokeDashoffset={approxLen * (1 - drawProgress)}
          opacity={0.85}
        />
        <path
          d={`M ${fromX.toFixed(1)} ${fromY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(
            1
          )} ${toX.toFixed(1)} ${toY.toFixed(1)}`}
          fill="none"
          stroke={arrowColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={approxLen}
          strokeDashoffset={approxLen * (1 - drawProgress)}
        />
        <path
          d={`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${toX.toFixed(1)} ${toY.toFixed(
            1
          )} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.WHITE}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={headOpacity * 0.85}
        />
        <path
          d={`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${toX.toFixed(1)} ${toY.toFixed(
            1
          )} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`}
          fill="none"
          stroke={arrowColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={headOpacity}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: labelX,
          top: labelY,
          transform: `translate(-50%, -50%) scale(${labelScale.toFixed(4)})`,
          opacity: inFade,
          backgroundColor: pillBg,
          border: `3px solid ${arrowColor}`,
          borderRadius: 24,
          padding: "12px 26px",
          boxShadow: "0 12px 28px rgba(15, 42, 82, 0.12)",
        }}
      >
        <FitText
          text={label}
          fontSize={labelFontSize}
          fontWeight={900}
          color={labelColor}
          maxWidth={labelMaxWidth}
          letterSpacing={-0.3}
        />
      </div>
    </div>
  );
};
