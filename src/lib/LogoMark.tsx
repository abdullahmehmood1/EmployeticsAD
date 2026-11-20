import React, { useId } from "react";
import { PALETTE } from "../timeline";

export interface LogoMarkProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Exact Employetics LogoMark (512x512 viewBox, ONE color via SVG mask cut-outs).
 * Uses a unique React useId() mask identifier per instance.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 160,
  color = PALETTE.NAVY,
  style,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `employetics-cut-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" rx="118" fill="#fff" />
          <circle cx="256" cy="160" r="68" fill="#000" />
          <path
            d="M62 512 L62 424 C62 332 148 268 256 268 C364 268 450 332 450 424 L450 512 Z"
            fill="#000"
          />
          <polyline
            points="116,470 190,396 240,448 318,370"
            fill="none"
            stroke="#fff"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="356,332 349,401 287,339"
            fill="#fff"
            stroke="#fff"
            strokeWidth="14"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <rect width="512" height="512" fill={color} mask={`url(#${maskId})`} />
    </svg>
  );
};
