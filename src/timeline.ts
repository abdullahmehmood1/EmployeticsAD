/**
 * Single source of truth for Employetics AdTwo (1080x1080 square, 30 fps, 1200 frames = 40.0 s).
 * Edit any text or frame number here to update visuals, motion, and synced audio together.
 */

export const VIDEO = {
  id: "AdTwo",
  width: 1080,
  height: 1080,
  fps: 30,
  durationInFrames: 1200,
  safeMargin: 90,
  maxTextWidth: 900, // 1080 - 2 * 90
} as const;

/**
 * Strict daytime pastel palette — NO neon, NO black (#000000).
 * Lighter/darker tints of these 8 core colors are used for isometric shading.
 */
export const PALETTE = {
  SKY: "#DCEBF7",
  SKY_LIGHT: "#EDF5FC",
  SKY_DEEP: "#BBD6EC",

  SAND: "#F4EAD7",
  SAND_LIGHT: "#FAF3E6",
  SAND_TILE_A: "#F7EFE0",
  SAND_TILE_B: "#ECE0C8",
  SAND_SHADE_L: "#DFCFAF",
  SAND_SHADE_R: "#CEBA94",

  WHITE: "#FFFFFF",

  NAVY: "#0F2A52",
  NAVY_MID: "#224273",
  NAVY_LIGHT: "#3A5B8C",

  SLATE: "#5B6B82",
  SLATE_LIGHT: "#8A99AE",
  SLATE_PALE: "#CFD8E4",
  SLATE_DARK: "#435268",

  GREEN: "#4F9E7A",
  GREEN_LIGHT: "#76BA9A",
  GREEN_DARK: "#3B7E5F",
  GREEN_SOFT: "#D6EDE2",

  AMBER: "#E3A64B",
  AMBER_LIGHT: "#F0C37C",
  AMBER_DARK: "#C4882E",
  AMBER_SOFT: "#FBEED7",

  CORAL: "#D9694F",
  CORAL_LIGHT: "#E9907B",
  CORAL_DARK: "#B94E35",
  CORAL_SOFT: "#FADFD8",
} as const;

/** Allowed on-screen copy (ONLY these strings appear in the ad). */
export const COPY = {
  // S1 HOOK
  s1Line1: "ONE OF THEM",
  s1Line2: "IS ABOUT TO BURN OUT.",

  // S2 PUZZLE
  s2PromptStem: "CAN YOU TELL WHO",
  s2QuestionMark: "?",
  s2PromptFull: "CAN YOU TELL WHO?",

  // S3 REVEAL
  s3Brand: "EMPLOYETICS",
  s3Sub: "SEES BURNOUT FIRST.",
  s3Alert: "!",

  // S4 THE APP
  s4Callout1: "RED = NEEDS HELP.",
  s4Callout2: "ONE CLICK TO BALANCE.",
  s4DemoData: "DEMO DATA",

  // S5 THE FIX
  s5Line1: "BALANCE THE WORK.",
  s5Line2: "BEFORE BURNOUT.",

  // S6 END CARD
  s6WordmarkBold: "Employ",
  s6WordmarkRegular: "etics",
  s6Slogan: "Predict burnout. Keep your people.",
} as const;

/** Exact global frame timeline at 30 fps (0..1199). */
export const TIMELINE = {
  // S1 HOOK: f0-89 (90 frames)
  S1: {
    start: 0,
    end: 89,
    duration: 90,
    tilesStart: 0,
    desksStart: 16,
    workersStart: 28,
    heartsStart: 42,
    line1In: 8,
    line2In: 24,
  },

  // S2 THE PUZZLE: f90-299 (210 frames)
  S2: {
    start: 90,
    end: 299,
    duration: 210,
    titleIn: 100,
    drainStart: 120,
    drainEnd: 260,
    paperStackFrames: [130, 155, 180, 205, 230] as readonly number[],
    sweepStart: 285,
    sweepEnd: 299,
  },

  // S3 REVEAL: f300-389 (90 frames)
  S3: {
    start: 300,
    end: 389,
    duration: 90,
    cardStart: 304,
    scanStart: 320,
    scanHitWorker3: 339,
    scanEnd: 368,
    subIn: 336,
  },

  // S4 THE APP: f390-659 (270 frames)
  S4: {
    start: 390,
    end: 659,
    duration: 270,
    windowInStart: 392,
    zoom1Start: 400,
    zoom1End: 500,
    callout1At: 438,
    swapAt: 520,
    zoom2Start: 525,
    zoom2End: 625,
    callout2At: 552,
    clickRippleAt: 600,
    windowOutStart: 640,
    windowOutEnd: 659,
  },

  // S5 THE FIX: f660-1019 (360 frames)
  S5: {
    start: 660,
    end: 1019,
    duration: 360,
    flyStart: 680,
    flyEnd: 760,
    blockFlights: [
      { depart: 680, land: 706 },
      { depart: 693, land: 719 },
      { depart: 706, land: 732 },
      { depart: 719, land: 745 },
      { depart: 732, land: 758 },
    ] as readonly { depart: number; land: number }[],
    line1In: 700,
    refillStart: 760,
    refillEnd: 840,
    line2In: 780,
    underlineStart: 792,
    underlineEnd: 822,
    celebrateStart: 850,
    celebrateEnd: 900,
    shrinkStart: 1000,
    shrinkEnd: 1019,
  },

  // S6 END CARD: f1020-1199 (180 frames = 6.0 s)
  S6: {
    start: 1020,
    end: 1199,
    duration: 180,
    logoStart: 1025,
    logoEnd: 1050,
    wordmarkStart: 1045,
    wordmarkEnd: 1070,
    sloganStart: 1080,
    sloganEnd: 1100,
  },

  // Audio cue points
  AUDIO: {
    popFrames: [6, 14, 22, 30, 38, 46, 54, 100, 146, 196, 246, 340, 440, 560, 700, 780] as readonly number[],
    whooshFrames: [285, 392, 520, 640, 1000] as readonly number[],
    dingFrames: [342, 838, 1030] as readonly number[],
    thudFrames: [706, 719, 732, 745, 758] as readonly number[],
    sparkleFrames: [795, 850] as readonly number[],
    clickFrame: 600,
    musicVolume: 0.18,
    musicFadeOutStart: 1170,
    voClips: [
      { from: 12, file: "vo_12.mp3", text: "One of them is about to burn out." },
      { from: 110, file: "vo_110.mp3", text: "Can you tell which one?" },
      { from: 310, file: "vo_310.mp3", text: "Employetics can. It sees burnout before you do." },
      { from: 410, file: "vo_410.mp3", text: "Red means someone needs help." },
      { from: 540, file: "vo_540.mp3", text: "One click balances the work." },
      { from: 720, file: "vo_720.mp3", text: "Fair work. Happy team." },
      { from: 1030, file: "vo_1030.mp3", text: "Employetics. Predict burnout. Keep your people." },
    ] as const,
  },
} as const;

/**
 * Verified landmark coordinates on public/team_burnout.png & public/workload_optimizer.png (1200x750).
 */
export const SCREEN_TARGETS = {
  teamBurnout: {
    // Alex Rivera CORAL high-risk card: x=254..544 (c=399), y=150..416 (c=283)
    riskCard: {
      u: 399 / 1200,
      v: 283 / 750,
      w: 290 / 1200,
      h: 266 / 750,
    },
    zoomOrigin: { ox: 0.28, oy: 0.30 },
    zoomScale: 1.36,
  },
  workloadOptimizer: {
    // "Optimise Workload" GREEN button: x=852..1132 (c=992), y=616..684 (c=650)
    optimiseBtn: {
      u: 992 / 1200,
      v: 650 / 750,
      w: 280 / 1200,
      h: 68 / 750,
    },
    zoomOrigin: { ox: 0.85, oy: 0.82 },
    zoomScale: 1.28,
  },
} as const;
