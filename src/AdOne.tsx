import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import assets from "./lib/assets.json";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Reveal } from "./scenes/Scene3Reveal";
import { Scene4App } from "./scenes/Scene4App";
import { Scene5Solution } from "./scenes/Scene5Solution";
import { Scene6EndCard } from "./scenes/Scene6EndCard";
import { PALETTE, TIMELINE, VIDEO } from "./timeline";

/**
 * Main 40-second (1200-frame, 30 fps, 1920x1080) Employetics kinetic ad composition.
 * Works cleanly with zero audio, procedural SFX only, edge-tts VO clips, or custom voiceover/music.
 */
export const AdOne: React.FC = () => {
  const { S1, S2, S3, S4, S5, S6, AUDIO } = TIMELINE;
  const heavySet = new Set<number>(AUDIO.heavyImpactFrames);
  const availableVoClips: string[] = assets.voClips;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.BLACK }}>
      {/* ================= VISUAL SCENES (f0..1199) ================= */}
      <Sequence from={S1.start} durationInFrames={S1.duration} name="S1-Hook">
        <Scene1Hook />
      </Sequence>

      <Sequence from={S2.start} durationInFrames={S2.duration} name="S2-Problem">
        <Scene2Problem />
      </Sequence>

      <Sequence from={S3.start} durationInFrames={S3.duration} name="S3-Reveal">
        <Scene3Reveal />
      </Sequence>

      <Sequence from={S4.start} durationInFrames={S4.duration} name="S4-App">
        <Scene4App />
      </Sequence>

      <Sequence from={S5.start} durationInFrames={S5.duration} name="S5-Solution">
        <Scene5Solution />
      </Sequence>

      <Sequence from={S6.start} durationInFrames={S6.duration} name="S6-EndCard">
        <Scene6EndCard />
      </Sequence>

      {/* ================= PROCEDURAL SFX ================= */}
      {assets.sfx.impact &&
        AUDIO.impactFrames.map((f) => (
          <Sequence key={`impact-${f}`} from={f} durationInFrames={20} name={`SFX-Impact-${f}`}>
            <Audio src={staticFile("sfx/impact.wav")} volume={heavySet.has(f) ? 0.92 : 0.72} />
          </Sequence>
        ))}

      {assets.sfx.whoosh &&
        AUDIO.whooshFrames.map((f) => (
          <Sequence key={`whoosh-${f}`} from={f} durationInFrames={18} name={`SFX-Whoosh-${f}`}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.55} />
          </Sequence>
        ))}

      {assets.sfx.tick &&
        AUDIO.tickFrames.map((f) => (
          <Sequence key={`tick-${f}`} from={f} durationInFrames={6} name={`SFX-Tick-${f}`}>
            <Audio src={staticFile("sfx/tick.wav")} volume={0.22} />
          </Sequence>
        ))}

      {assets.sfx.charge && (
        <Sequence from={AUDIO.chargeFrame} durationInFrames={75} name="SFX-Charge">
          <Audio src={staticFile("sfx/charge.wav")} volume={0.62} />
        </Sequence>
      )}

      {assets.sfx.chime && (
        <Sequence from={AUDIO.chimeFrame} durationInFrames={45} name="SFX-Chime">
          <Audio src={staticFile("sfx/chime.wav")} volume={0.75} />
        </Sequence>
      )}

      {/* ================= VOICE-OVER ================= */}
      {assets.hasCustomVoiceover ? (
        <Audio src={staticFile("audio/voiceover.mp3")} volume={1.0} />
      ) : (
        AUDIO.voClips.map((clip) =>
          availableVoClips.includes(clip.file) ? (
            <Sequence key={clip.file} from={clip.from} name={`VO-${clip.from}`}>
              <Audio src={staticFile(`audio/vo/${clip.file}`)} volume={1.0} />
            </Sequence>
          ) : null
        )
      )}

      {/* ================= OPTIONAL BACKGROUND MUSIC ================= */}
      {assets.hasMusic && (
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
      )}
    </AbsoluteFill>
  );
};
