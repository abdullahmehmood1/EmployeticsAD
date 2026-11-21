import React, { useId } from "react";
import { PALETTE } from "../timeline";

export interface MoonProps {
  /** Growth factor 0..1 across S2 as the week gets later and lonelier. */
  growth: number;
  opacity?: number;
}

/** Soft crescent moon icon growing slowly in the upper-right corner during late-night chats. */
export const Moon: React.FC<MoonProps> = ({ growth, opacity = 0.75 }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `moon-cut-${uid}`;
  const size = 46 + growth * 46; // grows softly from 46 px -> 92 px

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", opacity: opacity * (0.35 + growth * 0.65) }}
    >
      <defs>
        <mask id={maskId}>
          <rect width="100" height="100" fill="#000" />
          <circle cx="50" cy="50" r="34" fill="#fff" />
          <circle cx="64" cy="40" r="28" fill="#000" />
        </mask>
      </defs>
      {/* Faint halo ring */}
      <circle
        cx="50"
        cy="50"
        r={42}
        fill={PALETTE.CREAM}
        fillOpacity={0.05 + growth * 0.06}
      />
      <rect width="100" height="100" fill={PALETTE.CREAM} mask={`url(#${maskId})`} />
    </svg>
  );
};
