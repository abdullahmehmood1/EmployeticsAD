import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTE, VIDEO } from "../timeline";
import { FitText } from "./FitText";

export interface CalloutProps {
  /** Local frame inside S4 when this callout begins animating. */
  startFrame: number;
  label: string;
  labelX: number;
  labelY: number;
  labelMaxWidth?: number;
  labelFontSize?: number;
  labelColor?: string;
  labelAlign?: "left" | "center" | "right";
  /** Hand-drawn curved arrow SVG path coordinates (from label -> target). */
  fromX: number;
  fromY: number;
  ctrlX: number;
  ctrlY: number;
  toX: number;
  toY: number;
  /** Optional pulsing flat highlight ring around target point (e.g. 89% badge). */
  ring?: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  };
}

/**
 * Hand-drawn-style curved arrow + bold kinetic label + optional pulsing target highlight ring.
 */
export const Callout: React.FC<CalloutProps> = ({
  startFrame,
  label,
  labelX,
  labelY,
  labelMaxWidth = 520,
  labelFontSize = 52,
  labelColor = PALETTE.WHITE,
  labelAlign = "center",
  fromX,
  fromY,
  ctrlX,
  ctrlY,
  toX,
  toY,
  ring,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - startFrame;

  if (rel < 0) {
    return null;
  }

  const labelSpring = spring({
    frame: rel,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.75 },
  });
  const labelScale = interpolate(labelSpring, [0, 1], [0.75, 1]);
  const labelOpacity = interpolate(rel, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Smooth stroke-draw progress along the curved arrow shaft
  const drawProgress = interpolate(rel, [3, 17], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Compute arrowhead angle from final tangent of quadratic bezier (ctrl -> to)
  const angle = Math.atan2(toY - ctrlY, toX - ctrlX);
  const headLen = 24;
  const spread = 0.52;
  const h1x = toX - headLen * Math.cos(angle - spread);
  const h1y = toY - headLen * Math.sin(angle - spread);
  const h2x = toX - headLen * Math.cos(angle + spread);
  const h2y = toY - headLen * Math.sin(angle + spread);

  const headOpacity = interpolate(drawProgress, [0.72, 0.98], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generous path length estimate for strokeDasharray reveal
  const approxLen =
    Math.hypot(ctrlX - fromX, ctrlY - fromY) + Math.hypot(toX - ctrlX, toY - ctrlY) + 40;

  // Pulsing highlight ring wave (flat AMBER stroke)
  const pulse = 0.5 + 0.5 * Math.sin((rel / 22) * Math.PI * 2);

  const labelTransformX =
    labelAlign === "center" ? "-50%" : labelAlign === "right" ? "-100%" : "0%";

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Pulsing highlight ring at target */}
        {ring && (
          <g opacity={interpolate(rel, [8, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            <ellipse
              cx={ring.cx}
              cy={ring.cy}
              rx={ring.rx + pulse * 10}
              ry={ring.ry + pulse * 10}
              fill="none"
              stroke={PALETTE.AMBER}
              strokeWidth={4}
              strokeOpacity={0.25 + (1 - pulse) * 0.4}
            />
            <ellipse
              cx={ring.cx}
              cy={ring.cy}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke={PALETTE.AMBER}
              strokeWidth={6}
            />
          </g>
        )}

        {/* Hand-drawn curved arrow shaft (solid AMBER with crisp dark backing stroke for contrast) */}
        <path
          d={`M ${fromX.toFixed(1)} ${fromY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(
            1
          )} ${toX.toFixed(1)} ${toY.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.NAVY}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={approxLen}
          strokeDashoffset={approxLen * (1 - drawProgress)}
          opacity={0.75}
        />
        <path
          d={`M ${fromX.toFixed(1)} ${fromY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(
            1
          )} ${toX.toFixed(1)} ${toY.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.AMBER}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeDasharray={approxLen}
          strokeDashoffset={approxLen * (1 - drawProgress)}
        />

        {/* Hand-drawn open chevron arrowhead */}
        <path
          d={`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${toX.toFixed(1)} ${toY.toFixed(
            1
          )} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.NAVY}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={headOpacity * 0.75}
        />
        <path
          d={`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${toX.toFixed(1)} ${toY.toFixed(
            1
          )} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`}
          fill="none"
          stroke={PALETTE.AMBER}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={headOpacity}
        />
      </svg>

      {/* Bold Callout Label */}
      <div
        style={{
          position: "absolute",
          left: labelX,
          top: labelY,
          transform: `translate(${labelTransformX}, -50%) scale(${labelScale.toFixed(4)})`,
          transformOrigin:
            labelAlign === "left"
              ? "left center"
              : labelAlign === "right"
              ? "right center"
              : "center center",
          opacity: labelOpacity,
        }}
      >
        <FitText
          text={label}
          fontSize={labelFontSize}
          fontWeight={900}
          color={labelColor}
          maxWidth={labelMaxWidth}
          letterSpacing={1.5}
          align={labelAlign}
        />
      </div>
    </div>
  );
};
