import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CaptionsOverlay } from "./components/CaptionsOverlay";
import audioManifestData from "./data/audioManifest.json";
import { AudioManifest } from "./data/script";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Reveal } from "./scenes/Scene3Reveal";
import { Scene4App } from "./scenes/Scene4App";
import { Scene5Solution } from "./scenes/Scene5Solution";
import { Scene6Whiteout } from "./scenes/Scene6Whiteout";
import { COLORS, SCENES } from "./theme";

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
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Master Deep Male Voiceover + Heavy Bass Hits + Rising Synth Pulse */}
      {shouldPlayAudio && (
        <Audio src={staticFile(manifest.masterAudioFile)} volume={audioVolume} />
      )}

      {/* 0–3s (Frames 0–180): HOOK — Black screen, white text slams */}
      <Sequence from={SCENES.scene1Hook.startFrame} durationInFrames={SCENES.scene1Hook.durationFrames}>
        <Scene1Hook />
      </Sequence>

      {/* 3–11s (Frames 180–660): PROBLEM — Navy screen, slams + draining flat battery */}
      <Sequence from={SCENES.scene2Problem.startFrame} durationInFrames={SCENES.scene2Problem.durationFrames}>
        <Scene2Problem />
      </Sequence>

      {/* 11–14s (Frames 660–840): REVEAL — Fast wipe to white, MEET EMPLOYETICS + typing */}
      <Sequence from={SCENES.scene3Reveal.startFrame} durationInFrames={SCENES.scene3Reveal.durationFrames}>
        <Scene3Reveal />
      </Sequence>

      {/* 14–26s (Frames 840–1560): APP — Flat laptop slides & spins, solid navy screen, 2 callouts */}
      <Sequence from={SCENES.scene4App.startFrame} durationInFrames={SCENES.scene4App.durationFrames}>
        <Scene4App />
      </Sequence>

      {/* 26–34s (Frames 1560–2040): SOLUTION — Recharging battery + ACT EARLY / KEEP YOUR PEOPLE */}
      <Sequence from={SCENES.scene5Solution.startFrame} durationInFrames={SCENES.scene5Solution.durationFrames}>
        <Scene5Solution />
      </Sequence>

      {/* 34–40s (Frames 2040–2400): WHITEOUT — Rapid collapse into 100% solid white screen */}
      <Sequence from={SCENES.scene6Whiteout.startFrame} durationInFrames={SCENES.scene6Whiteout.durationFrames}>
        <Scene6Whiteout />
      </Sequence>

      {/* Optional Captions (hidden automatically on 34-40s solid white editor plate) */}
      <CaptionsOverlay manifest={manifest} enabled={showCaptions} />
    </AbsoluteFill>
  );
};
