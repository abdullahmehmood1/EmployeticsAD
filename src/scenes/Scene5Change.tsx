import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COPY, PALETTE, TIMELINE, VIDEO, lerpColor } from "../timeline";
import { ChatBubble } from "../lib/ChatBubble";
import { DayChip } from "../lib/DayChip";
import { FitText } from "../lib/FitText";
import { StatusBar } from "../lib/StatusBar";
import { Sun } from "../lib/Sun";

/**
 * S5 THE CHANGE (f690-1019): Back in the chat — night slowly turns to warm hopeful dawn.
 * f700-860: background interpolates MIDNIGHT -> warm dawn (CREAM top -> soft GOLD bottom),
 *           and a GOLD sun rises slowly behind the phone UI.
 * f720: Sara's honest TEAL bubble "Honestly? I'm tired."
 * f770: Friend replies "I'm coming over."
 * Status bar shows SUN 9:00 AM; battery recharges 9% -> 100% (TEAL) f780-850 with soft chime at f850.
 * f880: chat fades out; two big serif lines appear on bright dawn in NAVY:
 *       f890 "NOTICE YOURSELF." / f950 "BEFORE BURNOUT NOTICES YOU."
 * f1000-1019: slow warm fade into CREAM end card.
 */
export const Scene5Change: React.FC = () => {
  const frame = useCurrentFrame();
  const s5 = TIMELINE.S5;

  const dawnS = s5.dawnStart - s5.start; // 10 (f700)
  const dawnE = s5.dawnEnd - s5.start; // 170 (f860)
  const saraAt = s5.saraBubble - s5.start; // 30 (f720)
  const friendAt = s5.friendBubble - s5.start; // 80 (f770)
  const chargeS = s5.chargeStart - s5.start; // 90 (f780)
  const chargeE = s5.chargeEnd - s5.start; // 160 (f850)
  const chatOutS = s5.chatFadeOutStart - s5.start; // 184 (f874)
  const chatOutE = s5.chatFadeOutEnd - s5.start; // 200 (f890)
  const line1At = s5.line1At - s5.start; // 200 (f890)
  const line2At = s5.line2At - s5.start; // 260 (f950)
  const endFadeS = s5.endFadeStart - s5.start; // 310 (f1000)
  const endFadeE = s5.endFadeEnd - s5.start; // 329 (f1019)

  // Smooth night-to-dawn sky interpolation (f700-860)
  const dawnP = interpolate(frame, [dawnS, dawnE], [0, 1], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Warm golden-hour twilight waypoints (prevents cool grey midpoints during night-to-dawn!)
  const twilightTop = lerpColor(PALETTE.BUBBLE, PALETTE.GOLD, 0.36);
  const twilightHorizon = lerpColor(PALETTE.BUBBLE, PALETTE.GOLD, 0.62);
  const softGoldHorizon = lerpColor(PALETTE.CREAM, PALETTE.GOLD, 0.52);

  const skyTop =
    dawnP < 0.45
      ? lerpColor(PALETTE.MIDNIGHT, twilightTop, dawnP / 0.45)
      : lerpColor(twilightTop, PALETTE.CREAM, (dawnP - 0.45) / 0.55);

  const skyBottom =
    dawnP < 0.4
      ? lerpColor(PALETTE.MIDNIGHT, twilightHorizon, dawnP / 0.4)
      : lerpColor(twilightHorizon, softGoldHorizon, (dawnP - 0.4) / 0.6);

  // Status bar ink smoothly transitions CREAM -> NAVY once upper sky brightens cleanly
  const inkBlend = interpolate(dawnP, [0.55, 0.80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statusInk = lerpColor(PALETTE.CREAM, PALETTE.NAVY, inkBlend);
  const dividerColor =
    inkBlend > 0.5 ? "rgba(15, 42, 82, 0.14)" : "rgba(255, 244, 224, 0.14)";
  const chipBg =
    inkBlend > 0.5 ? "rgba(15, 42, 82, 0.10)" : "rgba(38, 58, 92, 0.55)";

  // Battery recharges smoothly 9% -> 100% (TEAL) across f780-850
  const batteryPercent = interpolate(frame, [chargeS, chargeE], [9, 100], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isCharging = frame >= chargeS;
  const chimeRel = frame - chargeE;
  const batteryPulse =
    chimeRel >= 0 && chimeRel < 32
      ? Math.sin((chimeRel / 32) * Math.PI)
      : isCharging && frame < chargeE
      ? 0.25 + 0.25 * Math.sin((frame - chargeS) * 0.25)
      : 0;

  // Chat UI fades gently away at f874-890 to give the dawn sky full poetic space
  const chatOpacity =
    interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(frame, [chatOutS, chatOutE], [1, 0], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Two monumental dawn serif lines in NAVY (high contrast over luminous CREAM sky!)
  const l1Op = interpolate(frame, [line1At, line1At + 22], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const l1Y = interpolate(frame, [line1At, line1At + 22], [22, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const l2Op = interpolate(frame, [line2At, line2At + 22], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const l2Y = interpolate(frame, [line2At, line2At + 22], [22, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle slow push-in on final dawn lines
  const textDriftScale = interpolate(frame, [line1At, endFadeE], [0.99, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Soft CREAM cross-dissolve into S6 End Card (f1000-1019)
  const endCreamFade = interpolate(frame, [endFadeS, endFadeE], [0, 1], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sunPulse = 0.5 + 0.5 * Math.sin(frame / 18);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyTop} 46%, ${skyBottom} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Slowly rising GOLD sun circle behind the phone UI */}
      <Sun progress={dawnP} pulse={sunPulse} />

      {/* Sunday morning phone chat UI */}
      {chatOpacity > 0.01 && (
        <AbsoluteFill style={{ opacity: chatOpacity }}>
          <StatusBar
            dayPrefix={COPY.daySun}
            time={COPY.timeSun}
            batteryPercent={batteryPercent}
            charging={isCharging}
            batteryPulse={batteryPulse}
            inkColor={statusInk}
          />

          {/* Minimal contact header (plain circle, zero photo/unauthorized text) */}
          <div
            style={{
              position: "absolute",
              top: VIDEO.safeTop + 72,
              left: VIDEO.safeLeft,
              right: VIDEO.width - VIDEO.safeRight,
              height: 76,
              borderBottom: `1px solid ${dividerColor}`,
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
                backgroundColor: inkBlend > 0.5 ? "rgba(15, 42, 82, 0.14)" : PALETTE.BUBBLE,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  width: 152,
                  height: 13,
                  borderRadius: 999,
                  backgroundColor: inkBlend > 0.5 ? "rgba(15, 42, 82, 0.22)" : "rgba(255, 244, 224, 0.22)",
                }}
              />
              <div
                style={{
                  width: 88,
                  height: 9,
                  borderRadius: 999,
                  backgroundColor: "rgba(95, 168, 160, 0.55)",
                }}
              />
            </div>
          </div>

          {/* Sunday morning honest exchange centered calmly inside safe zone */}
          <div
            style={{
              position: "absolute",
              top: VIDEO.safeTop + 210,
              left: VIDEO.safeLeft,
              right: VIDEO.width - VIDEO.safeRight,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            <DayChip label={COPY.daySun} appearAt={6} bgColor={chipBg} textColor={statusInk} />
            <ChatBubble text={COPY.chatSunSara} side="sara" appearAt={saraAt} />
            <ChatBubble text={COPY.chatSunFriend} side="friend" appearAt={friendAt} />
          </div>
        </AbsoluteFill>
      )}

      {/* Dawn emotional resolution lines in crisp NAVY on luminous CREAM upper sky */}
      {frame >= line1At && (
        <AbsoluteFill
          style={{
            paddingLeft: VIDEO.safeLeft,
            paddingRight: VIDEO.width - VIDEO.safeRight,
            paddingTop: VIDEO.safeTop,
            paddingBottom: VIDEO.height - VIDEO.safeBottom,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            transform: `scale(${textDriftScale.toFixed(4)})`,
          }}
        >
          <div
            style={{
              opacity: l1Op,
              transform: `translateY(${l1Y.toFixed(1)}px)`,
            }}
          >
            <FitText
              text={COPY.s5Line1}
              font="serif"
              fontSize={98}
              color={PALETTE.NAVY}
              maxWidth={VIDEO.maxTextWidth}
              letterSpacing={1}
            />
          </div>

          <div
            style={{
              opacity: l2Op,
              transform: `translateY(${l2Y.toFixed(1)}px)`,
            }}
          >
            <FitText
              text={COPY.s5Line2}
              font="serif"
              fontSize={64}
              color={PALETTE.NAVY}
              maxWidth={VIDEO.maxTextWidth}
              letterSpacing={0.5}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Slow warm fade into CREAM end card (f1000-1019) */}
      {endCreamFade > 0.005 && (
        <AbsoluteFill
          style={{
            backgroundColor: PALETTE.CREAM,
            opacity: endCreamFade,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
