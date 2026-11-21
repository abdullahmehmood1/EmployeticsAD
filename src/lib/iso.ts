import { PALETTE } from "../timeline";

/** Exact isometric tile size specified by creative brief. */
export const ISO_TILE_SIZE = 90;

/**
 * Exact isometric projection helper:
 * iso(x, y, z) => [(x - y) * 0.866 * T, (x + y) * 0.5 * T - z]
 */
export function iso(x: number, y: number, z = 0, T = ISO_TILE_SIZE): [number, number] {
  return [(x - y) * 0.866 * T, (x + y) * 0.5 * T - z];
}

export function isoPoints(coords: readonly [number, number, number][], T = ISO_TILE_SIZE): string {
  return coords
    .map(([x, y, z]) => {
      const [px, py] = iso(x, y, z, T);
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
}

/** 6x4 floor grid dimensions & spaced 3x2 desk layout (zero visual overlap). */
export const FLOOR_COLS = 6;
export const FLOOR_ROWS = 4;

export interface DeskSlot {
  index: number;
  x: number;
  y: number;
  shirt: string;
  shirtLight: string;
  shirtShade: string;
  hair: string;
  skin: string;
  basePapers: number;
}

/**
 * 3x2 grid of 6 desks:
 * - Index 3 ("the struggling one"): front-left-mid, prominent focal position
 * - Index 5 ("free capacity"): front-right, nearly empty desk
 */
export const WORKER_SLOTS: readonly DeskSlot[] = [
  {
    index: 0,
    x: 0.9,
    y: 0.85,
    shirt: PALETTE.SKY_DEEP,
    shirtLight: PALETTE.SKY,
    shirtShade: PALETTE.SLATE_LIGHT,
    hair: PALETTE.NAVY_MID,
    skin: "#F4D5B8",
    basePapers: 2,
  },
  {
    index: 1,
    x: 2.9,
    y: 0.85,
    shirt: PALETTE.GREEN_LIGHT,
    shirtLight: PALETTE.GREEN_SOFT,
    shirtShade: PALETTE.GREEN,
    hair: PALETTE.NAVY,
    skin: "#E8BF9B",
    basePapers: 2,
  },
  {
    index: 2,
    x: 4.9,
    y: 0.85,
    shirt: PALETTE.AMBER_LIGHT,
    shirtLight: PALETTE.AMBER_SOFT,
    shirtShade: PALETTE.AMBER,
    hair: PALETTE.SLATE_DARK,
    skin: "#F6DEC6",
    basePapers: 1,
  },
  {
    // Worker #3 — "the struggling one"
    index: 3,
    x: 0.9,
    y: 2.85,
    shirt: PALETTE.NAVY_LIGHT,
    shirtLight: PALETTE.SLATE_LIGHT,
    shirtShade: PALETTE.NAVY,
    hair: PALETTE.NAVY,
    skin: "#F2CFAF",
    basePapers: 2,
  },
  {
    index: 4,
    x: 2.9,
    y: 2.85,
    shirt: PALETTE.SLATE_LIGHT,
    shirtLight: PALETTE.SLATE_PALE,
    shirtShade: PALETTE.SLATE,
    hair: PALETTE.NAVY_MID,
    skin: "#DEB18B",
    basePapers: 2,
  },
  {
    // Worker #5 — nearly empty desk (free capacity)
    index: 5,
    x: 4.9,
    y: 2.85,
    shirt: PALETTE.GREEN,
    shirtLight: PALETTE.GREEN_LIGHT,
    shirtShade: PALETTE.GREEN_DARK,
    hair: PALETTE.NAVY,
    skin: "#F5D7BA",
    basePapers: 0,
  },
] as const;

/** Sorted back-to-front by (x + y) for proper isometric Painter's Algorithm occlusion. */
export const WORKER_SLOTS_DEPTH_SORTED: readonly DeskSlot[] = [...WORKER_SLOTS].sort(
  (a, b) => a.x + a.y - (b.x + b.y) || a.index - b.index
);

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * u, g1 + (g2 - g1) * u, b1 + (b2 - b1) * u);
}

/** Smoothly maps HeartBar level (1 -> 0) across GREEN -> AMBER -> CORAL. */
export function heartColorForLevel(level: number): string {
  const clamped = Math.max(0, Math.min(1, level));
  if (clamped >= 0.62) {
    return lerpColor(PALETTE.AMBER, PALETTE.GREEN, (clamped - 0.62) / 0.38);
  }
  if (clamped >= 0.32) {
    return lerpColor(PALETTE.CORAL, PALETTE.AMBER, (clamped - 0.32) / 0.30);
  }
  return PALETTE.CORAL;
}
