import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTE } from "../timeline";
import { INTER_FONT } from "./fonts";

export interface ChatBubbleProps {
  text: string;
  side: "friend" | "sara";
  /** Local frame when this message softly springs into the chat. */
  appearAt: number;
  /** Optional subtle dimming/shrinking (used on Saturday night's quiet "I'm fine."). */
  quiet?: boolean;
}

/**
 * Gentle, calm iMessage-style chat bubble:
 * - Friend: left-aligned, BUBBLE (#263A5C) fill, CREAM (#FFF4E0) text
 * - Sara: right-aligned, TEAL (#5FA8A0) fill, MIDNIGHT (#0B1B33) text
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  side,
  appearAt,
  quiet = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - appearAt;

  if (rel < 0) return null;

  const spr = spring({
    frame: rel,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.9 },
  });

  const targetScale = quiet ? 0.88 : 1;
  const targetOpacity = quiet ? 0.68 : 1;
  const scale = interpolate(spr, [0, 1], [0.84 * targetScale, targetScale]);
  const translateY = interpolate(spr, [0, 1], [16, 0]);
  const opacity = interpolate(rel, [0, 7], [0.38 * targetOpacity, targetOpacity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isSara = side === "sara";

  return (
    <div
      style={{
        alignSelf: isSara ? "flex-end" : "flex-start",
        maxWidth: 680,
        opacity,
        transform: `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(4)})`,
        transformOrigin: isSara ? "right bottom" : "left bottom",
        backgroundColor: isSara ? PALETTE.TEAL : PALETTE.BUBBLE,
        color: isSara ? PALETTE.MIDNIGHT : PALETTE.CREAM,
        fontFamily: INTER_FONT,
        fontSize: quiet ? 31 : 35,
        fontWeight: isSara ? 600 : 400,
        lineHeight: 1.32,
        padding: quiet ? "18px 28px" : "21px 32px",
        borderRadius: isSara ? "28px 28px 8px 28px" : "28px 28px 28px 8px",
        boxShadow: "0 10px 26px rgba(6, 15, 31, 0.22)",
      }}
    >
      {text}
    </div>
  );
};
