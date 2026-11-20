import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioManifest } from "../data/script";
import { COLORS, FONTS } from "../theme";

interface CaptionsOverlayProps {
  manifest: AudioManifest;
  enabled: boolean;
}

export const CaptionsOverlay: React.FC<CaptionsOverlayProps> = ({ manifest, enabled }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) {
    return null;
  }

  const currentSec = frame / fps;
  // Never draw captions over the 34-40s clean solid white editor plate
  if (currentSec >= 34.0) {
    return null;
  }

  const segment = manifest.segments.find(
    (s) => currentSec >= s.startSec - 0.05 && currentSec <= s.endSec + 0.15
  );
  if (!segment) return null;

  const fade = interpolate(
    currentSec,
    [segment.startSec - 0.05, segment.startSec + 0.1, segment.endSec, segment.endSec + 0.15],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 42,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: fade,
          backgroundColor: COLORS.navy,
          border: `2px solid ${COLORS.amber}`,
          borderRadius: 8,
          padding: "12px 28px",
          fontFamily: FONTS.sans,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: "-0.01em",
        }}
      >
        {segment.text}
      </div>
    </AbsoluteFill>
  );
};
