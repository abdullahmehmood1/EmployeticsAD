import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const montserrat = loadMontserrat("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

const mono = loadJetBrainsMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

export const FONTS = {
  heavy: `${montserrat.fontFamily}, "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif`,
  sans: `${inter.fontFamily}, "Inter", -apple-system, BlinkMacSystemFont, sans-serif`,
  mono: `${mono.fontFamily}, "JetBrains Mono", ui-monospace, monospace`,
} as const;

export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 60,
  durationSeconds: 40,
  totalFrames: 40 * 60, // 2400 frames
} as const;

export const SCENES = {
  scene1Hook: { id: "scene1", startSec: 0, endSec: 3, startFrame: 0, durationFrames: 180 },
  scene2Problem: { id: "scene2", startSec: 3, endSec: 11, startFrame: 180, durationFrames: 480 },
  scene3Reveal: { id: "scene3", startSec: 11, endSec: 14, startFrame: 660, durationFrames: 180 },
  scene4App: { id: "scene4", startSec: 14, endSec: 26, startFrame: 840, durationFrames: 720 },
  scene5Solution: { id: "scene5", startSec: 26, endSec: 34, startFrame: 1560, durationFrames: 480 },
  scene6Whiteout: { id: "scene6", startSec: 34, endSec: 40, startFrame: 2040, durationFrames: 360 },
} as const;

// Strict Bold Kinetic Typography Palette — NO NEON COLOURS
export const COLORS = {
  black: "#000000",
  navy: "#0F2A52",
  navyDark: "#0A1D3A",
  navyMid: "#173B70",
  white: "#FFFFFF",
  amber: "#F59E0B",
  amberDeep: "#D97706",

  // Flat Battery Status Colors (clean flat vector, no neon)
  batteryGreen: "#16A34A",
  batteryAmber: "#F59E0B",
  batteryRed: "#DC2626",

  // Subtle neutral for flat laptop body bezel
  slateFrame: "#1E293B",
  slateBase: "#CBD5E1",
  slateBaseDark: "#94A3B8",
} as const;

/**
 * Deterministic damped trailer impact screen-shake (zero randomness, zero flicker).
 */
export function getImpactShake(
  frame: number,
  hitFrame: number,
  amplitude = 14,
  duration = 18
): { x: number; y: number; rot: number } {
  const dt = frame - hitFrame;
  if (dt < 0 || dt > duration) {
    return { x: 0, y: 0, rot: 0 };
  }
  const decay = Math.exp(-dt * 0.24) * (1 - dt / duration);
  const x = Math.sin(dt * 2.9) * amplitude * decay;
  const y = Math.cos(dt * 3.7) * amplitude * 0.8 * decay;
  const rot = Math.sin(dt * 2.2) * (amplitude * 0.04) * decay;
  return { x, y, rot };
}
