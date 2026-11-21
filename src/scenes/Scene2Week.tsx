import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO, lerpColor } from "../timeline";
import { ChatBubble } from "../lib/ChatBubble";
import { DayChip } from "../lib/DayChip";
import { Moon } from "../lib/Moon";
import { StatusBar } from "../lib/StatusBar";
import { TypingDots } from "../lib/TypingDots";

export interface WeekChatProps {
  /** Render the complete frozen end state of S2 (dimmed behind S3 "There's a better way."). */
  frozenEnd?: boolean;
  dimOpacity?: number;
}

/**
 * S2 THE WEEK (f90-329): First-person HR Manager late-night chat across MON -> WED -> SAT.
 * Background slides DEEP -> MIDNIGHT -> #060F1F; battery drains 78% -> 41% -> 9% (AMBER <20%);
 * crescent moon grows softly in the upper-right corner.
 */
export const Scene2Week: React.FC<WeekChatProps> = ({ frozenEnd = false, dimOpacity = 1 }) => {
  const localFrame = useCurrentFrame();
  const s2 = TIMELINE.S2;
  const frame = frozenEnd ? s2.duration - 1 : localFrame;
  const globalFrame = s2.start + frame;

  const monChip = 0; // f90
  const monIn = s2.monIncoming - s2.start; // 5 (f95)
  const monTypeS = s2.monTypingStart - s2.start; // 25 (f115)
  const monTypeE = s2.monTypingEnd - s2.start; // 38 (f128)
  const monOut = s2.monReply - s2.start; // 40 (f130)

  const wedChip = s2.wedStart - s2.start; // 80 (f170)
  const wedIn = s2.wedIncoming - s2.start; // 85 (f175)
  const wedOut = s2.wedReply - s2.start; // 115 (f205)

  const satChip = s2.satStart - s2.start; // 160 (f250)
  const satIn = s2.satIncoming - s2.start; // 165 (f255)
  const satTypeS = s2.satTypingStart - s2.start; // 185 (f275)
  const satTypeE = s2.satTypingEnd - s2.start; // 210 (f300)
  const satOut = s2.satReply - s2.start; // 215 (f305)

  // Background slides DEEP (#14284A) -> MIDNIGHT (#0B1B33) -> #060F1F
  let bgColor: string;
  if (frame < wedChip) {
    bgColor = lerpColor(PALETTE.DEEP, PALETTE.MIDNIGHT, frame / wedChip);
  } else if (frame < satChip) {
    bgColor = lerpColor(PALETTE.MIDNIGHT, PALETTE.NIGHT_DARK, ((frame - wedChip) / (satChip - wedChip)) * 0.45);
  } else {
    bgColor = lerpColor(
      lerpColor(PALETTE.MIDNIGHT, PALETTE.NIGHT_DARK, 0.45),
      PALETTE.NIGHT_DARK,
      (frame - satChip) / (s2.duration - satChip)
    );
  }

  const statusTime =
    globalFrame >= s2.satStart
      ? COPY.timeSat
      : globalFrame >= s2.wedStart
      ? COPY.timeWed
      : COPY.timeMon;

  const batteryPercent = interpolate(
    frame,
    [0, wedChip, satChip, s2.duration - 1],
    [78, 41, 14, 9],
    {
      easing: Easing.inOut(Easing.sin),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const moonGrowth = interpolate(frame, [0, s2.duration - 1], [0.1, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cameraScale = frozenEnd
    ? 1.028
    : interpolate(frame, [0, s2.duration - 1], [1.0, 1.028], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: dimOpacity,
          transform: `scale(${cameraScale.toFixed(4)})`,
          transformOrigin: "center 45%",
        }}
      >
        {/* Growing crescent moon softly tucked in the upper-right corner */}
        <div
          style={{
            position: "absolute",
            top: VIDEO.safeTop + 76,
            right: VIDEO.width - VIDEO.safeRight,
            pointerEvents: "none",
          }}
        >
          <Moon growth={moonGrowth} opacity={0.78} />
        </div>

        {/* Top phone status bar (time + draining battery icon) */}
        <StatusBar time={statusTime} batteryPercent={batteryPercent} inkColor={PALETTE.CREAM} />

        {/* Clean chat header: plain circle avatar, zero photo, zero extra text */}
        <div
          style={{
            position: "absolute",
            top: VIDEO.safeTop + 72,
            left: VIDEO.safeLeft,
            right: VIDEO.width - VIDEO.safeRight,
            height: 76,
            borderBottom: "1px solid rgba(255, 244, 224, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: PALETTE.BUBBLE,
              border: "2px solid rgba(255, 244, 224, 0.16)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                width: 152,
                height: 13,
                borderRadius: 999,
                backgroundColor: "rgba(255, 244, 224, 0.22)",
              }}
            />
            <div
              style={{
                width: 88,
                height: 9,
                borderRadius: 999,
                backgroundColor: "rgba(95, 168, 160, 0.35)",
              }}
            />
          </div>
        </div>

        {/* Message thread strictly inside y = 424..1480, x = 110..970 (zero overlap!) */}
        <div
          style={{
            position: "absolute",
            top: VIDEO.safeTop + 174,
            left: VIDEO.safeLeft,
            right: VIDEO.width - VIDEO.safeRight,
            bottom: VIDEO.height - VIDEO.safeBottom,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* MON 9:02 PM */}
          <DayChip label={COPY.dayMon} appearAt={frozenEnd ? -100 : monChip} />
          <ChatBubble text={COPY.chatMonIn} side="friend" appearAt={frozenEnd ? -100 : monIn} />
          {!frozenEnd && <TypingDots startAt={monTypeS} endAt={monTypeE} side="sara" />}
          <ChatBubble text={COPY.chatMonOut} side="sara" appearAt={frozenEnd ? -100 : monOut} />

          {/* WED 11:48 PM */}
          <div style={{ height: 8 }} />
          <DayChip label={COPY.dayWed} appearAt={frozenEnd ? -100 : wedChip} />
          <ChatBubble text={COPY.chatWedIn} side="friend" appearAt={frozenEnd ? -100 : wedIn} />
          <ChatBubble text={COPY.chatWedOut} side="sara" appearAt={frozenEnd ? -100 : wedOut} />

          {/* SAT 10:15 PM */}
          <div style={{ height: 8 }} />
          <DayChip label={COPY.daySat} appearAt={frozenEnd ? -100 : satChip} />
          <ChatBubble text={COPY.chatSatIn} side="friend" appearAt={frozenEnd ? -100 : satIn} />
          {!frozenEnd && <TypingDots startAt={satTypeS} endAt={satTypeE} side="sara" />}
          <ChatBubble
            text={COPY.chatSatOut}
            side="sara"
            appearAt={frozenEnd ? -100 : satOut}
            quiet
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
