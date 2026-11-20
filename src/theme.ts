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
  durationSeconds: 40,
  totalFrames: 40 * 60, // 2400 frames
} as const;

export const SCENES = {
  scene1: { id: "scene1", startSec: 0, endSec: 9, startFrame: 0, durationFrames: 540 },
  scene2: { id: "scene2", startSec: 9, endSec: 19, startFrame: 540, durationFrames: 600 },
  scene3: { id: "scene3", startSec: 19, endSec: 31, startFrame: 1140, durationFrames: 720 },
  scene4: { id: "scene4", startSec: 31, endSec: 35, startFrame: 1860, durationFrames: 240 },
  scene5: { id: "scene5", startSec: 35, endSec: 40, startFrame: 2100, durationFrames: 300 },
} as const;

export const COLORS = {
  bgDeep: "#050814",
  bgSurface: "#0B1120",
  bgCard: "rgba(15, 23, 42, 0.78)",
  bgCardElevated: "rgba(22, 33, 58, 0.88)",
  borderSubtle: "rgba(148, 163, 184, 0.16)",
  borderGlow: "rgba(99, 102, 241, 0.45)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  indigo: "#6366F1",
  indigoBright: "#818CF8",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  violet: "#8B5CF6",

  crimson: "#F43F5E",
  crimsonGlow: "rgba(244, 63, 94, 0.35)",
  amber: "#F59E0B",
  amberGlow: "rgba(245, 158, 11, 0.30)",
  emerald: "#10B981",
  emeraldBright: "#34D399",
  emeraldGlow: "rgba(16, 185, 129, 0.32)",
} as const;
