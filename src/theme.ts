import { loadFont as loadPlusJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const plusJakarta = loadPlusJakarta("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetBrainsMono = loadJetBrainsMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const FONTS = {
  display: `${plusJakarta.fontFamily}, "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif`,
  body: `${inter.fontFamily}, "Inter", -apple-system, BlinkMacSystemFont, sans-serif`,
  mono: `${jetBrainsMono.fontFamily}, "JetBrains Mono", ui-monospace, monospace`,
} as const;

export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 60,
  durationSeconds: 45,
  totalFrames: 45 * 60, // 2700 frames
} as const;

export const SCENES = {
  scene1: { id: "scene1", startSec: 0, endSec: 7, startFrame: 0, durationFrames: 420 },
  scene2: { id: "scene2", startSec: 7, endSec: 15, startFrame: 420, durationFrames: 480 },
  scene3: { id: "scene3", startSec: 15, endSec: 23, startFrame: 900, durationFrames: 480 },
  scene4: { id: "scene4", startSec: 23, endSec: 33, startFrame: 1380, durationFrames: 600 },
  scene5: { id: "scene5", startSec: 33, endSec: 39, startFrame: 1980, durationFrames: 360 },
  scene6: { id: "scene6", startSec: 39, endSec: 45, startFrame: 2340, durationFrames: 360 },
} as const;

export const COLORS = {
  bgDeep: "#050814",
  bgSurface: "#0B1120",
  bgCard: "rgba(15, 23, 42, 0.80)",
  borderSubtle: "rgba(148, 163, 184, 0.16)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  indigo: "#6366F1",
  indigoBright: "#818CF8",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  violet: "#8B5CF6",

  crimson: "#F43F5E",
  amber: "#F59E0B",
  emerald: "#10B981",
  emeraldBright: "#34D399",
} as const;
