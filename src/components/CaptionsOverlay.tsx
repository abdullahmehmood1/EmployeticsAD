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
  const segment = manifest.segments.find(
    (s) => currentSec >= s.startSec - 0.05 && currentSec <= s.endSec + 0.15
  );
  if (!segment) return null;

  let displayWords: { text: string; active: boolean; spoken: boolean }[] = [];

  if (segment.words && segment.words.length > 0) {
    const chunkSize = 7;
    let activeIdx = segment.words.findIndex(
      (w) => currentSec >= w.startSec - 0.05 && currentSec <= w.endSec + 0.12
    );
    if (activeIdx === -1) {
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
    displayWords = chunk.map((w, idx) => ({
      text: w.word,
      active: chunkStart + idx === activeIdx,
      spoken: chunkStart + idx <= activeIdx,
    }));
  } else {
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
        paddingBottom: 40,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: fade,
          background: "rgba(28, 25, 23, 0.90)",
          borderRadius: 999,
          padding: "13px 30px",
          boxShadow: "0 12px 32px rgba(28, 25, 23, 0.22)",
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
              fontFamily: FONTS.sans,
              fontSize: 28,
              fontWeight: w.active ? 700 : 500,
              color: w.active
                ? "#FDE68A"
                : w.spoken
                ? "#FAF6F0"
                : "rgba(250, 246, 240, 0.58)",
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
