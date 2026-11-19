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

  // Find active segment
  const segment = manifest.segments.find(
    (s) => currentSec >= s.startSec - 0.05 && currentSec <= s.endSec + 0.15
  );

  if (!segment) {
    return null;
  }

  // If word-level timings exist, group into clean 6-8 word broadcast chunks
  let displayWords: { text: string; active: boolean; spoken: boolean }[] = [];

  if (segment.words && segment.words.length > 0) {
    const chunkSize = 7;
    let activeIdx = segment.words.findIndex(
      (w) => currentSec >= w.startSec - 0.05 && currentSec <= w.endSec + 0.12
    );
    if (activeIdx === -1) {
      // Find last word started before currentSec
      for (let i = segment.words.length - 1; i >= 0; i--) {
        if (currentSec >= segment.words[i].startSec) {
          activeIdx = i;
          break;
        }
      }
      if (activeIdx === -1) activeIdx = 0;
    }

    const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize;
    const chunk = segment.words.slice(chunkStart, chunkStart + chunkSize);
    displayWords = chunk.map((w, idx) => {
      const globalIdx = chunkStart + idx;
      return {
        text: w.word,
        active: globalIdx === activeIdx,
        spoken: globalIdx <= activeIdx,
      };
    });
  } else {
    // Fallback chunking by proportional time
    const allWords = segment.text.split(" ");
    const progress = Math.min(
      0.999,
      Math.max(0, (currentSec - segment.startSec) / Math.max(0.1, segment.endSec - segment.startSec))
    );
    const activeIdx = Math.floor(progress * allWords.length);
    const chunkSize = 7;
    const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize;
    displayWords = allWords.slice(chunkStart, chunkStart + chunkSize).map((word, idx) => ({
      text: word,
      active: chunkStart + idx === activeIdx,
      spoken: chunkStart + idx <= activeIdx,
    }));
  }

  const fade = interpolate(
    currentSec,
    [segment.startSec - 0.05, segment.startSec + 0.12, segment.endSec, segment.endSec + 0.15],
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
          background: "rgba(5, 8, 20, 0.78)",
          border: "1px solid rgba(148, 163, 184, 0.22)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.55)",
          borderRadius: 16,
          padding: "14px 28px",
          maxWidth: 1120,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 10px",
        }}
      >
        {displayWords.map((w, idx) => (
          <span
            key={`${w.text}-${idx}`}
            style={{
              fontFamily: FONTS.body,
              fontSize: 30,
              fontWeight: w.active ? 700 : 500,
              color: w.active
                ? COLORS.cyanBright
                : w.spoken
                ? COLORS.textPrimary
                : "rgba(248, 250, 252, 0.55)",
              letterSpacing: "-0.01em",
              textShadow: w.active ? "0 0 18px rgba(34, 211, 238, 0.45)" : "none",
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
