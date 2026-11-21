import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import assets from "./lib/assets.json";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Week } from "./scenes/Scene2Week";
import { Scene3Turn } from "./scenes/Scene3Turn";
import { Scene4App } from "./scenes/Scene4App";
import { Scene5Change } from "./scenes/Scene5Change";
import { Scene6EndCard } from "./scenes/Scene6EndCard";
import { PALETTE, TIMELINE, VIDEO } from "./timeline";

/**
 * Main 40-second vertical 9:16 (1080x1920, 30 fps, 1200 frames) intimate night-to-dawn ad (AdThree).
 * NO voice-over — pure visual storytelling supported by soft felt-piano score and subtle UI SFX.
 */
export const AdThree: React.FC = () => {
  const { S1, S2, S3, S4, S5, S6, AUDIO } = TIMELINE;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.MIDNIGHT }}>
      {/* ================= VISUAL SCENES (f0..1199) ================= */}
      <Sequence from={S1.start} durationInFrames={S1.duration} name="S1-Hook">
        <Scene1Hook />
      </Sequence>

      <Sequence from={S2.start} durationInFrames={S2.duration} name="S2-TheWeek">
        <Scene2Week />
      </Sequence>

      <Sequence from={S3.start} durationInFrames={S3.duration} name="S3-TheTurn">
        <Scene3Turn />
      </Sequence>

      <Sequence from={S4.start} durationInFrames={S4.duration} name="S4-TheApp">
        <Scene4App />
      </Sequence>

      <Sequence from={S5.start} durationInFrames={S5.duration} name="S5-TheChange">
        <Scene5Change />
      </Sequence>

      <Sequence from={S6.start} durationInFrames={S6.duration} name="S6-EndCard">
        <Scene6EndCard />
      </Sequence>

      {/* ================= SOFT EMOTIONAL PIANO SCORE ================= */}
      {assets.hasCustomMusic ? (
        <Audio
          src={staticFile("audio/music.mp3")}
          volume={(f) =>
            interpolate(
              f,
              [AUDIO.musicFadeOutStart, VIDEO.durationInFrames - 1],
              [AUDIO.musicVolume, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          }
        />
      ) : (
        assets.sfx.music && (
          <Audio
            src={staticFile("sfx/music.wav")}
            volume={(f) =>
              interpolate(
                f,
                [AUDIO.musicFadeOutStart, VIDEO.durationInFrames - 1],
                [0.42, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            }
          />
        )
      )}

      {/* ================= SUBTLE FIRST-PERSON UI & EMOTIONAL SFX ================= */}
      {assets.sfx.msg_pop &&
        AUDIO.msgPopFrames.map((f) => (
          <Sequence key={`pop-${f}`} from={f} durationInFrames={10} name={`SFX-MsgPop-${f}`}>
            <Audio src={staticFile("sfx/msg_pop.wav")} volume={0.46} />
          </Sequence>
        ))}

      {assets.sfx.msg_sent &&
        AUDIO.msgSentFrames.map((f) => (
          <Sequence key={`sent-${f}`} from={f} durationInFrames={8} name={`SFX-MsgSent-${f}`}>
            <Audio src={staticFile("sfx/msg_sent.wav")} volume={f === 305 ? 0.28 : 0.42} />
          </Sequence>
        ))}

      {assets.sfx.typing_tick &&
        AUDIO.typingTickFrames.map((f) => (
          <Sequence key={`tick-${f}`} from={f} durationInFrames={4} name={`SFX-Tick-${f}`}>
            <Audio src={staticFile("sfx/typing_tick.wav")} volume={0.2} />
          </Sequence>
        ))}

      {assets.sfx.whoosh_soft &&
        AUDIO.whooshSoftFrames.map((f) => (
          <Sequence key={`whoosh-${f}`} from={f} durationInFrames={18} name={`SFX-Whoosh-${f}`}>
            <Audio src={staticFile("sfx/whoosh_soft.wav")} volume={0.32} />
          </Sequence>
        ))}

      {assets.sfx.heartbeat && (
        <Sequence from={AUDIO.heartbeatFrame} durationInFrames={30} name="SFX-Heartbeat">
          <Audio src={staticFile("sfx/heartbeat.wav")} volume={0.48} />
        </Sequence>
      )}

      {assets.sfx.chime && (
        <Sequence from={AUDIO.chimeFrame} durationInFrames={45} name="SFX-DawnChime">
          <Audio src={staticFile("sfx/chime.wav")} volume={0.62} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
