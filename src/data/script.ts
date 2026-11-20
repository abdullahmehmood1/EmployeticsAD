export interface SceneScript {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
}

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

export interface CaptionSegment {
  sceneId: string;
  startSec: number;
  endSec: number;
  text: string;
  words?: WordTiming[];
}

export interface AudioManifest {
  voice: string;
  durationSec: number;
  masterAudioFile: string;
  hasGeneratedAudio: boolean;
  segments: CaptionSegment[];
}

export const AD_SCRIPT: SceneScript[] = [
  {
    id: "vo1",
    startSec: 0.25,
    endSec: 2.9,
    text: "Your best employee just quit.",
  },
  {
    id: "vo2",
    startSec: 8.2,
    endSec: 10.7,
    text: "Nobody saw it coming.",
  },
  {
    id: "vo3",
    startSec: 11.4,
    endSec: 13.8,
    text: "Now you can.",
  },
];
