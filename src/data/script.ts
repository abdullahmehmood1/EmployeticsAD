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
    endSec: 7,
    text: "Burnout never announces itself. Late nights, weekend sprints, and rising workloads hide in everyday data until your best people quit.",
  },
  {
    id: "scene2",
    startSec: 7,
    endSec: 15,
    text: "Meet Employetics — the AI workforce platform that reads daily hours, tasks, and feedback to predict who is heading for burnout.",
  },
  {
    id: "scene3",
    startSec: 15,
    endSec: 23,
    text: "It shows managers the real drivers, while giving employees private one-minute check-ins that are never shared with HR.",
  },
  {
    id: "scene4",
    startSec: 23,
    endSec: 33,
    text: "Rebalance workloads in a single click, or ask the AI HR Copilot anything directly from your live team data.",
  },
  {
    id: "scene5",
    startSec: 33,
    endSec: 39,
    text: "Act weeks before the resignation letter — and keep your highest performers healthy and thriving.",
  },
  {
    id: "scene6",
    startSec: 39,
    endSec: 45,
    text: "Employetics. Predict burnout. Keep your people.",
  },
];
