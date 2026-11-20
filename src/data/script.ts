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
    text: "Four weekends in a row. Logging in later every week. And nobody asks if you’re okay.",
  },
  {
    id: "scene2",
    startSec: 9,
    endSec: 20,
    text: "Employetics shows you your own burnout risk, and spots patterns you might miss.",
  },
  {
    id: "scene3",
    startSec: 20,
    endSec: 31,
    text: "Take a one-minute check-in. It’s private. Never shared with HR.",
  },
  {
    id: "scene4",
    startSec: 31,
    endSec: 35,
    text: "Know when to slow down.",
  },
  {
    id: "scene5",
    startSec: 35,
    endSec: 40,
    text: "Employetics. Predict burnout. Keep your people.",
  },
];
