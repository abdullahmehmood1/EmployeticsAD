import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadDMMono } from "@remotion/google-fonts/DMMono";

const fraunces = loadFraunces("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const frauncesItalic = loadFraunces("italic", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = loadDMSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const dmMono = loadDMMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const FONTS = {
  serif: `${fraunces.fontFamily}, "Fraunces", Georgia, serif`,
  serifItalic: `${frauncesItalic.fontFamily}, "Fraunces", Georgia, serif`,
  sans: `${dmSans.fontFamily}, "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`,
  mono: `${dmMono.fontFamily}, "DM Mono", ui-monospace, monospace`,
} as const;

export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 60,
  durationSeconds: 40,
  totalFrames: 40 * 60, // 2400 frames
} as const;

export const SCENES = {
  scene1: { id: "scene1", startSec: 0, endSec: 9, startFrame: 0, durationFrames: 540 },
  scene2: { id: "scene2", startSec: 9, endSec: 20, startFrame: 540, durationFrames: 660 },
  scene3: { id: "scene3", startSec: 20, endSec: 31, startFrame: 1200, durationFrames: 660 },
  scene4: { id: "scene4", startSec: 31, endSec: 35, startFrame: 1860, durationFrames: 240 },
  scene5: { id: "scene5", startSec: 35, endSec: 40, startFrame: 2100, durationFrames: 300 },
} as const;

// Completely New Art Direction: Warm Sunlit Editorial Minimalism
export const COLORS = {
  // Warm paper & alabaster canvas
  canvasLight: "#FAF6F0",
  canvasWarm: "#F3EBE0",
  paperCard: "rgba(255, 253, 249, 0.94)",
  paperSoft: "#F6EFE5",
  borderHairline: "rgba(28, 25, 23, 0.10)",
  borderStrong: "rgba(28, 25, 23, 0.18)",

  // Rich Espresso & Stone ink typography
  ink: "#1C1917",
  inkSecondary: "#57534E",
  inkMuted: "#78716C",

  // Emotional Editorial Accents (NO dark neon!)
  terracotta: "#D94826",
  terracottaSoft: "#FDECE7",
  amber: "#D97706",
  amberSoft: "#FEF3C7",

  forest: "#14532D",
  sage: "#15803D",
  sageBright: "#16A34A",
  sageSoft: "#E6F4EC",
  sageMist: "#BBF7D0",

  gold: "#B45309",
  goldLight: "#F59E0B",
} as const;
