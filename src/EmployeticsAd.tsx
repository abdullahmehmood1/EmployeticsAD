import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { CaptionsOverlay } from "./components/CaptionsOverlay";
import { TransitionFlare } from "./components/TransitionFlare";
import audioManifestData from "./data/audioManifest.json";
import { AudioManifest } from "./data/script";
import { Scene1Imbalance } from "./scenes/Scene1Imbalance";
import { Scene2DailyMonitor } from "./scenes/Scene2DailyMonitor";
import { Scene3OneClickSplit } from "./scenes/Scene3OneClickSplit";
import { Scene4BalancedTeam } from "./scenes/Scene4BalancedTeam";
import { Scene5BrandOutro } from "./scenes/Scene5BrandOutro";
import { SCENES } from "./theme";

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
    <AbsoluteFill style={{ backgroundColor: transparentBg ? "transparent" : "#050814" }}>
      {/* Pure deterministic vector/CSS background (ZERO blinking; transparent when GPU shader composites!) */}
      <Background transparent={transparentBg} />

      {/* Master Voiceover + Soundtrack + UI Sound Effects */}
      {shouldPlayAudio && (
        <Audio src={staticFile(manifest.masterAudioFile)} volume={audioVolume} />
      )}

      {/* Scene 1: 0–9s (Frames 0–540) */}
      <Sequence from={SCENES.scene1.startFrame} durationInFrames={SCENES.scene1.durationFrames}>
        <Scene1Imbalance />
      </Sequence>

      {/* Scene 2: 9–19s (Frames 540–1140) */}
      <Sequence from={SCENES.scene2.startFrame} durationInFrames={SCENES.scene2.durationFrames}>
        <Scene2DailyMonitor />
      </Sequence>

      {/* Scene 3: 19–31s (Frames 1140–1860) */}
      <Sequence from={SCENES.scene3.startFrame} durationInFrames={SCENES.scene3.durationFrames}>
        <Scene3OneClickSplit />
      </Sequence>

      {/* Scene 4: 31–35s (Frames 1860–2100) */}
      <Sequence from={SCENES.scene4.startFrame} durationInFrames={SCENES.scene4.durationFrames}>
        <Scene4BalancedTeam />
      </Sequence>

      {/* Scene 5: 35–40s (Frames 2100–2400) */}
      <Sequence from={SCENES.scene5.startFrame} durationInFrames={SCENES.scene5.durationFrames}>
        <Scene5BrandOutro />
      </Sequence>

      {/* Anamorphic light-sweep transitions & subtle cinema timeline hairline */}
      <TransitionFlare />

      {/* Optional Broadcast-Grade Synchronized Captions */}
      <CaptionsOverlay manifest={manifest} enabled={showCaptions} />
    </AbsoluteFill>
  );
};
