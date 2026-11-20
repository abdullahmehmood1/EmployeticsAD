import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { CaptionsOverlay } from "./components/CaptionsOverlay";
import { TransitionFlare } from "./components/TransitionFlare";
import audioManifestData from "./data/audioManifest.json";
import { AudioManifest } from "./data/script";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2ConnectAndScore } from "./scenes/Scene2ConnectAndScore";
import { Scene3ExplainWhy } from "./scenes/Scene3ExplainWhy";
import { Scene4TakeAction } from "./scenes/Scene4TakeAction";
import { Scene5Outcome } from "./scenes/Scene5Outcome";
import { Scene6BrandOutro } from "./scenes/Scene6BrandOutro";
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
    <AbsoluteFill style={{ backgroundColor: transparentBg ? "transparent" : COLORS.bgDeep }}>
      {/* Continuous atmospheric backdrop (transparent when PyTorch CUDA GPU Shader composites!) */}
      <Background transparent={transparentBg} />

      {/* Studio Voiceover + Modern Tech Soundtrack + Synchronized UI SFX */}
      {shouldPlayAudio && (
        <Audio src={staticFile(manifest.masterAudioFile)} volume={audioVolume} />
      )}

      {/* 0–7s: The Hidden Burnout Problem */}
      <Sequence from={SCENES.scene1.startFrame} durationInFrames={SCENES.scene1.durationFrames}>
        <Scene1Problem />
      </Sequence>

      {/* 7–15s: Meet Employetics — Connects Everyday Tools & Scores Risk */}
      <Sequence from={SCENES.scene2.startFrame} durationInFrames={SCENES.scene2.durationFrames}>
        <Scene2ConnectAndScore />
      </Sequence>

      {/* 15–23s: Explainable AI Drivers + Private 1-Min Employee Check-Ins */}
      <Sequence from={SCENES.scene3.startFrame} durationInFrames={SCENES.scene3.durationFrames}>
        <Scene3ExplainWhy />
      </Sequence>

      {/* 23–33s: 1-Click Workload Split + AI HR Copilot */}
      <Sequence from={SCENES.scene4.startFrame} durationInFrames={SCENES.scene4.durationFrames}>
        <Scene4TakeAction />
      </Sequence>

      {/* 33–39s: Outcome — Act Weeks Early & Retain Talent */}
      <Sequence from={SCENES.scene5.startFrame} durationInFrames={SCENES.scene5.durationFrames}>
        <Scene5Outcome />
      </Sequence>

      {/* 39–45s: Employetics Brand Finale */}
      <Sequence from={SCENES.scene6.startFrame} durationInFrames={SCENES.scene6.durationFrames}>
        <Scene6BrandOutro />
      </Sequence>

      {/* Optical light-sweep transitions & progress hairline */}
      <TransitionFlare />

      {/* Optional Broadcast-Grade Synchronized Captions */}
      <CaptionsOverlay manifest={manifest} enabled={showCaptions} />
    </AbsoluteFill>
  );
};
