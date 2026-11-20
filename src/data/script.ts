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
    id: "scene1",
    startSec: 0,
    endSec: 9,
    text: "One teammate is drowning in tasks. Another has hours to spare. You only notice when someone burns out.",
  },
  {
    id: "scene2",
    startSec: 9,
    endSec: 19,
    text: "Employetics watches your team every day, and flags who is heading for burnout.",
  },
  {
    id: "scene3",
    startSec: 19,
    endSec: 31,
    text: "One click gives a fairer split. In this demo, the most overloaded teammate drops from 115 percent to 88 percent capacity.",
  },
  {
    id: "scene4",
    startSec: 31,
    endSec: 35,
    text: "A balanced team. Before burnout, not after.",
  },
  {
    id: "scene5",
    startSec: 35,
    endSec: 40,
    text: "Employetics. Predict burnout. Keep your people.",
  },
];
