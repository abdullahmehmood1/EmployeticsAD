import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { COPY, PALETTE } from "../timeline";
import { POPPINS_FONT } from "./fonts";

export interface MagnifierProps {
  /** Screen X, Y of lens center in office SVG coordinate space. */
  x: number;
  y: number;
  /** Subtle tilt angle in degrees (tilts playfully when shrugging at wrong worker). */
  tiltDeg?: number;
  /** Opacity / entrance scale (0..1). */
  scale?: number;
  /** Local frames elapsed since pause began at a wrong worker (>= 0 shows "?" shrug bubble). */
  shrugRelFrame?: number;
}

/**
 * Playful cartoon magnifying glass that inspects smiling workers and shrugs with "?" bubbles.
 */
export const Magnifier: React.FC<MagnifierProps> = ({
  x,
  y,
  tiltDeg = 0,
  scale = 1,
  shrugRelFrame = -1,
}) => {
  const { fps } = useVideoConfig();
  if (scale <= 0.01) return null;

  const showBubble = shrugRelFrame >= 0 && shrugRelFrame < 34;
  const bubbleSpr = showBubble
    ? spring({
        frame: shrugRelFrame,
        fps,
        config: { damping: 10, stiffness: 210, mass: 0.7 },
      })
    : 0;
  const bubbleFade = showBubble
    ? interpolate(shrugRelFrame, [24, 34], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const bubbleScale = bubbleSpr * bubbleFade;
  const bubbleFloat = showBubble ? interpolate(shrugRelFrame, [0, 34], [0, -14]) : 0;

  return (
    <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${scale.toFixed(4)})`}>
      {/* Playful floating "?" thought bubble when guessing a healthy smiling worker */}
      {showBubble && bubbleScale > 0.02 && (
        <g
          transform={`translate(48, ${(-52 + bubbleFloat).toFixed(1)}) scale(${bubbleScale.toFixed(
            4
          )})`}
        >
          <circle cx={-12} cy={18} r={4.5} fill={PALETTE.WHITE} stroke={PALETTE.NAVY} strokeWidth={1.8} />
          <circle cx={-4} cy={10} r={6} fill={PALETTE.WHITE} stroke={PALETTE.NAVY} strokeWidth={1.8} />
          <circle cx={10} cy={-8} r={22} fill={PALETTE.WHITE} stroke={PALETTE.NAVY} strokeWidth={2.4} />
          <text
            x={10}
            y={1}
            textAnchor="middle"
            fontFamily={POPPINS_FONT}
            fontWeight={900}
            fontSize={26}
            fill={PALETTE.AMBER_DARK}
          >
            {COPY.s2QuestionMark}
          </text>
        </g>
      )}

      {/* Magnifier body */}
      <g transform={`rotate(${tiltDeg.toFixed(2)})`}>
        {/* Soft pastel drop shadow */}
        <circle cx={6} cy={12} r={46} fill="rgba(15, 42, 82, 0.11)" />

        {/* Wooden/Navy handle */}
        <line
          x1={31}
          y1={31}
          x2={72}
          y2={72}
          stroke={PALETTE.NAVY}
          strokeWidth={18}
          strokeLinecap="round"
        />
        <line
          x1={34}
          y1={34}
          x2={68}
          y2={68}
          stroke={PALETTE.NAVY_LIGHT}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.55}
        />
        {/* Brass collar */}
        <line
          x1={29}
          y1={29}
          x2={39}
          y2={39}
          stroke={PALETTE.AMBER}
          strokeWidth={19}
          strokeLinecap="round"
        />

        {/* Glass lens */}
        <circle cx={0} cy={0} r={42} fill={PALETTE.SKY_LIGHT} fillOpacity={0.34} />
        {/* Specular curved glass highlight */}
        <path
          d="M -24 -16 A 28 28 0 0 1 -6 -27"
          fill="none"
          stroke={PALETTE.WHITE}
          strokeWidth={5.5}
          strokeLinecap="round"
          opacity={0.85}
        />
        <circle cx={-26} cy={-4} r={3} fill={PALETTE.WHITE} opacity={0.85} />

        {/* Outer bezel */}
        <circle cx={0} cy={0} r={44} fill="none" stroke={PALETTE.AMBER} strokeWidth={10} />
        <circle cx={0} cy={0} r={49} fill="none" stroke={PALETTE.NAVY} strokeWidth={2.4} />
        <circle cx={0} cy={0} r={39} fill="none" stroke={PALETTE.NAVY} strokeWidth={2} />
      </g>
    </g>
  );
};
