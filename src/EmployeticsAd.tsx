import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { CaptionsOverlay } from "./components/CaptionsOverlay";
import { TransitionFlare } from "./components/TransitionFlare";
import audioManifestData from "./data/audioManifest.json";
import { AudioManifest } from "./data/script";
import { Scene1QuietBurnout } from "./scenes/Scene1QuietBurnout";
import { Scene2PersonalRisk } from "./scenes/Scene2PersonalRisk";
import { Scene3PrivateCheckIn } from "./scenes/Scene3PrivateCheckIn";
import { Scene4SlowDown } from "./scenes/Scene4SlowDown";
import { Scene5BrandOutro } from "./scenes/Scene5BrandOutro";
import { COLORS, SCENES } from "./theme";

export interface EmployeticsAdProps {
  showCaptions: boolean;
  includeAudio: boolean;
  audioVolume: number;
  transparentBg?: boolean;
}

const manifest = audioManifestData as AudioManifest;

export const EmployeticsAd: React.FC<EmployeticsAdProps> = ({
  showCaptions = false,
  includeAudio = true,
  audioVolume = 1.0,
  transparentBg = false,
}) => {
  const shouldPlayAudio = includeAudio && manifest.hasGeneratedAudio;

  return (
    <AbsoluteFill
      style={{ backgroundColor: transparentBg ? "transparent" : COLORS.canvasLight }}
    >
      {/* Pure deterministic warm editorial background (transparent when CUDA GPU Sunlit Shader composites!) */}
      <Background transparent={transparentBg} />

      {/* Master Voiceover + Warm Acoustic Soundtrack + UI SFX */}
      {shouldPlayAudio && (
        <Audio src={staticFile(manifest.masterAudioFile)} volume={audioVolume} />
      )}

      {/* Scene 1: 0–9s (Frames 0–540) */}
      <Sequence from={SCENES.scene1.startFrame} durationInFrames={SCENES.scene1.durationFrames}>
        <Scene1QuietBurnout />
      </Sequence>

      {/* Scene 2: 9–20s (Frames 540–1200) */}
      <Sequence from={SCENES.scene2.startFrame} durationInFrames={SCENES.scene2.durationFrames}>
        <Scene2PersonalRisk />
      </Sequence>

      {/* Scene 3: 20–31s (Frames 1200–1860) */}
      <Sequence from={SCENES.scene3.startFrame} durationInFrames={SCENES.scene3.durationFrames}>
        <Scene3PrivateCheckIn />
      </Sequence>

      {/* Scene 4: 31–35s (Frames 1860–2100) */}
      <Sequence from={SCENES.scene4.startFrame} durationInFrames={SCENES.scene4.durationFrames}>
        <Scene4SlowDown />
      </Sequence>

      {/* Scene 5: 35–40s (Frames 2100–2400) */}
      <Sequence from={SCENES.scene5.startFrame} durationInFrames={SCENES.scene5.durationFrames}>
        <Scene5BrandOutro />
      </Sequence>

      {/* Warm sunlit silk transitions & editorial progress thread */}
      <TransitionFlare />

      {/* Optional Broadcast-Grade Synchronized Captions */}
      <CaptionsOverlay manifest={manifest} enabled={showCaptions} />
    </AbsoluteFill>
  );
};
