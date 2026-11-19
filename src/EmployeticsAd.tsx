import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { CaptionsOverlay } from "./components/CaptionsOverlay";
import audioManifestData from "./data/audioManifest.json";
import { AudioManifest } from "./data/script";
import { Scene1Resignation } from "./scenes/Scene1Resignation";
import { Scene2RiskRanking } from "./scenes/Scene2RiskRanking";
import { Scene3WhyDrivers } from "./scenes/Scene3WhyDrivers";
import { Scene4HRAssistant } from "./scenes/Scene4HRAssistant";
import { Scene5ActBefore } from "./scenes/Scene5ActBefore";
import { Scene6BrandOutro } from "./scenes/Scene6BrandOutro";
import { SCENES } from "./theme";

export interface EmployeticsAdProps {
  showCaptions: boolean;
  includeAudio: boolean;
  audioVolume: number;
}

const manifest = audioManifestData as AudioManifest;

export const EmployeticsAd: React.FC<EmployeticsAdProps> = ({
  showCaptions = false,
  includeAudio = true,
  audioVolume = 1.0,
}) => {
  const shouldPlayAudio = includeAudio && manifest.hasGeneratedAudio;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050814" }}>
      {/* Continuous atmospheric motion-graphics canvas */}
      <Background />

      {/* Master Voiceover + Soundtrack + UI Sound Effects */}
      {shouldPlayAudio && (
        <Audio src={staticFile(manifest.masterAudioFile)} volume={audioVolume} />
      )}

      {/* Scene 1: 0–9s (Frames 0–540) */}
      <Sequence from={SCENES.scene1.startFrame} durationInFrames={SCENES.scene1.durationFrames}>
        <Scene1Resignation />
      </Sequence>

      {/* Scene 2: 9–16s (Frames 540–960) */}
      <Sequence from={SCENES.scene2.startFrame} durationInFrames={SCENES.scene2.durationFrames}>
        <Scene2RiskRanking />
      </Sequence>

      {/* Scene 3: 16–24s (Frames 960–1440) */}
      <Sequence from={SCENES.scene3.startFrame} durationInFrames={SCENES.scene3.durationFrames}>
        <Scene3WhyDrivers />
      </Sequence>

      {/* Scene 4: 24–31s (Frames 1440–1860) */}
      <Sequence from={SCENES.scene4.startFrame} durationInFrames={SCENES.scene4.durationFrames}>
        <Scene4HRAssistant />
      </Sequence>

      {/* Scene 5: 31–35s (Frames 1860–2100) */}
      <Sequence from={SCENES.scene5.startFrame} durationInFrames={SCENES.scene5.durationFrames}>
        <Scene5ActBefore />
      </Sequence>

      {/* Scene 6: 35–40s (Frames 2100–2400) */}
      <Sequence from={SCENES.scene6.startFrame} durationInFrames={SCENES.scene6.durationFrames}>
        <Scene6BrandOutro />
      </Sequence>

      {/* Optional Broadcast-Grade Synchronized Captions */}
      <CaptionsOverlay manifest={manifest} enabled={showCaptions} />
    </AbsoluteFill>
  );
};
