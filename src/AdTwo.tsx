import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import assets from "./lib/assets.json";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Puzzle } from "./scenes/Scene2Puzzle";
import { Scene3Reveal } from "./scenes/Scene3Reveal";
import { Scene4App } from "./scenes/Scene4App";
import { Scene5Fix } from "./scenes/Scene5Fix";
import { Scene6EndCard } from "./scenes/Scene6EndCard";
import { PALETTE, TIMELINE, VIDEO } from "./timeline";

/**
 * Main 40-second (1080x1080 square, 30 fps, 1200 frames) Employetics isometric ad (AdTwo).
 * Works cleanly with sound off, procedural SFX + 112bpm marimba loop, edge-tts VO, or custom audio.
 */
export const AdTwo: React.FC = () => {
  const { S1, S2, S3, S4, S5, S6, AUDIO } = TIMELINE;
  const availableVoClips: string[] = assets.voClips;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.SAND }}>
      {/* ================= VISUAL SCENES (f0..1199) ================= */}
      <Sequence from={S1.start} durationInFrames={S1.duration} name="S1-Hook">
        <Scene1Hook />
      </Sequence>

      <Sequence from={S2.start} durationInFrames={S2.duration} name="S2-Puzzle">
        <Scene2Puzzle />
      </Sequence>

      <Sequence from={S3.start} durationInFrames={S3.duration} name="S3-Reveal">
        <Scene3Reveal />
      </Sequence>

      <Sequence from={S4.start} durationInFrames={S4.duration} name="S4-App">
        <Scene4App />
      </Sequence>

      <Sequence from={S5.start} durationInFrames={S5.duration} name="S5-Fix">
        <Scene5Fix />
      </Sequence>

      <Sequence from={S6.start} durationInFrames={S6.duration} name="S6-EndCard">
        <Scene6EndCard />
      </Sequence>

      {/* ================= WARM PLAYFUL SFX ================= */}
      {assets.sfx.pop &&
        AUDIO.popFrames.map((f) => (
          <Sequence key={`pop-${f}`} from={f} durationInFrames={8} name={`SFX-Pop-${f}`}>
            <Audio src={staticFile("sfx/pop.wav")} volume={0.42} />
          </Sequence>
        ))}

      {assets.sfx.whoosh &&
        AUDIO.whooshFrames.map((f) => (
          <Sequence key={`whoosh-${f}`} from={f} durationInFrames={16} name={`SFX-Whoosh-${f}`}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.44} />
          </Sequence>
        ))}

      {assets.sfx.ding &&
        AUDIO.dingFrames.map((f) => (
          <Sequence key={`ding-${f}`} from={f} durationInFrames={28} name={`SFX-Ding-${f}`}>
            <Audio src={staticFile("sfx/ding.wav")} volume={0.62} />
          </Sequence>
        ))}

      {assets.sfx.thud &&
        AUDIO.thudFrames.map((f) => (
          <Sequence key={`thud-${f}`} from={f} durationInFrames={8} name={`SFX-Thud-${f}`}>
            <Audio src={staticFile("sfx/thud.wav")} volume={0.58} />
          </Sequence>
        ))}

      {assets.sfx.sparkle &&
        AUDIO.sparkleFrames.map((f) => (
          <Sequence key={`sparkle-${f}`} from={f} durationInFrames={36} name={`SFX-Sparkle-${f}`}>
            <Audio src={staticFile("sfx/sparkle.wav")} volume={0.65} />
          </Sequence>
        ))}

      {assets.sfx.click && (
        <Sequence from={AUDIO.clickFrame} durationInFrames={8} name="SFX-Click">
          <Audio src={staticFile("sfx/click.wav")} volume={0.75} />
        </Sequence>
      )}

      {/* ================= UPBEAT MUSIC (custom audio/music.mp3 or generated music_loop.wav) ================= */}
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
        assets.sfx.music_loop && (
          <Audio
            src={staticFile("sfx/music_loop.wav")}
            volume={(f) =>
              interpolate(
                f,
                [AUDIO.musicFadeOutStart, VIDEO.durationInFrames - 1],
                [AUDIO.musicVolume, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            }
          />
        )
      )}

      {/* ================= VOICE-OVER (custom audio/voiceover.mp3 or edge-tts clips) ================= */}
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
    </AbsoluteFill>
  );
};
