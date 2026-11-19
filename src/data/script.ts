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
    text: "Your best developer just resigned. No warning. But the signs were there: late nights, lost weekends, falling feedback. Hidden in the data.",
  },
  {
    id: "scene2",
    startSec: 9,
    endSec: 16,
    text: "Employetics reads daily attendance, tasks and feedback, and ranks who is likely to leave.",
  },
  {
    id: "scene3",
    startSec: 16,
    endSec: 24,
    text: "It also tells you why. Overtime. Falling peer feedback. So you fix the real cause.",
  },
  {
    id: "scene4",
    startSec: 24,
    endSec: 31,
    text: "Or just ask the HR assistant. It answers in seconds, from your own data.",
  },
  {
    id: "scene5",
    startSec: 31,
    endSec: 35,
    text: "Act weeks before the resignation letter.",
  },
  {
    id: "scene6",
    startSec: 35,
    endSec: 40,
    text: "Employetics. Predict burnout. Keep your people.",
  },
];
