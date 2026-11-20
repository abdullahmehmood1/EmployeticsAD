/**
 * Single source of truth for Employetics AdOne (1920x1080, 30 fps, 1200 frames = 40.0 s).
 * Edit any copy or frame number here to update visuals, motion, and synced audio together.
 */

export const VIDEO = {
  id: "AdOne",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1200,
  safeMargin: 150,
  maxTextWidth: 1620, // 1920 - 2 * 150
} as const;

/** Strict 4-color palette — no neon, no gradients, nothing else. */
export const PALETTE = {
  NAVY: "#0F2A52",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  AMBER: "#F2A93B",
} as const;

/** Allowed on-screen copy (ONLY these strings appear in the ad). */
export const COPY = {
  // S1 HOOK
  s1Line1: "YOUR BEST EMPLOYEE",
  s1Line2: "JUST QUIT.",

  // S2 PROBLEM
  s2Line1: "LATE NIGHTS.",
  s2Line2: "LOST WEEKENDS.",
  s2Line3: "NOBODY NOTICED.",
  s2Alert: "!",

  // S3 REVEAL
  s3Kicker: "MEET",
  s3Brand: "EMPLOYETICS.",
  s3TaglinePrefix: "AI THAT SPOTS ",
  s3TaglineHighlight: "BURNOUT",
  s3TaglineSuffix: " BEFORE PEOPLE QUIT.",
  s3TaglineFull: "AI THAT SPOTS BURNOUT BEFORE PEOPLE QUIT.",

  // S4 THE APP
  s4Callout1: "WHO'S AT RISK?",
  s4Callout2: "AND WHY.",
  s4DemoData: "DEMO DATA",

  // S5 SOLUTION
  s5Line1: "ACT EARLY.",
  s5Line2: "KEEP YOUR PEOPLE.",

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
    line1Slam: 6,
    line2Slam: 36,
    hardCut: 80,
  },

  // S2 PROBLEM: f90-329 (240 frames)
  S2: {
    start: 90,
    end: 329,
    duration: 240,
    batteryIn: 90,
    line1Slam: 102,
    drain1End: 130, // 100% -> 70%
    line2Slam: 156,
    drain2End: 185, // 70% -> 35%
    line3Slam: 210,
    drain3End: 240, // 35% -> 8%, alert pulse begins (every 15f)
    pulsePeriod: 15,
    wipeStart: 315,
    wipeEnd: 329,
  },

  // S3 REVEAL: f330-419 (90 frames)
  S3: {
    start: 330,
    end: 419,
    duration: 90,
    meetIn: 336,
    brandBounce: 345,
    typeStart: 372,
    typeEnd: 416,
    underlineStart: 400,
    underlineEnd: 409,
    irisStart: 410,
    irisEnd: 419,
  },

  // S4 THE APP: f420-779 (360 frames)
  S4: {
    start: 420,
    end: 779,
    duration: 360,
    laptopInStart: 420,
    laptopInEnd: 450,
    kenBurnsStart: 450,
    kenBurnsEnd: 540,
    callout1Start: 500,
    callout2Start: 610,
    laptopOutStart: 720,
    laptopOutEnd: 779,
  },

  // S5 SOLUTION: f780-1034 (255 frames)
  S5: {
    start: 780,
    end: 1034,
    duration: 255,
    chargeStart: 790,
    chargeEnd: 860,
    burstAt: 860,
    line1Slam: 870,
    line2Slam: 925,
    collapseStart: 1000,
    flashStart: 1022,
    collapseEnd: 1034,
  },

  // S6 END CARD: f1035-1199 (165 frames = 5.5 s)
  S6: {
    start: 1035,
    end: 1199,
    duration: 165,
    logoStart: 1040,
    logoEnd: 1065,
    wordmarkStart: 1055,
    wordmarkEnd: 1080,
    sloganStart: 1085,
    sloganEnd: 1100,
  },

  // Audio cue points
  AUDIO: {
    impactFrames: [6, 36, 102, 156, 210, 870, 925] as readonly number[],
    heavyImpactFrames: [36, 210, 925] as readonly number[],
    whooshFrames: [315, 410, 420, 720, 1006] as readonly number[],
    tickFrames: [240, 255, 270, 285, 300, 374, 381, 388, 395, 402] as readonly number[],
    chargeFrame: 790,
    chimeFrame: 860,
    musicVolume: 0.2,
    musicFadeOutStart: 1170, // 1.0 s (30 frames) fade-out at end
    voClips: [
      { from: 10, file: "vo_10.mp3", text: "Your best employee just quit." },
      { from: 100, file: "vo_100.mp3", text: "Late nights. Lost weekends. Nobody noticed." },
      { from: 345, file: "vo_345.mp3", text: "Meet Employetics. AI that spots burnout before people quit." },
      { from: 495, file: "vo_495.mp3", text: "See who's at risk. And exactly why." },
      { from: 875, file: "vo_875.mp3", text: "Act early. Keep your people." },
      { from: 1045, file: "vo_1045.mp3", text: "Employetics." },
    ] as const,
  },
} as const;

/** Normalized landmark coordinates on public/attrition_screen.png (1280x720) verified visually. */
export const SCREEN_TARGETS = {
  // Top risk card "89% HIGH RISK" badge center (x=858/1280, y=202/720)
  riskPercent: { u: 858 / 1280, v: 202 / 720 },
  // Top risk card "SHAP Explain" button center (x=1092/1280, y=202/720) and normalized size
  shapButton: {
    u: 1092 / 1280,
    v: 202 / 720,
    w: 236 / 1280,
    h: 64 / 720,
  },
  // Ken Burns zoom origin & scale keeping header + entire top card + both landmarks 100% unclipped
  kenBurnsOrigin: { ox: 0.95, oy: 0.16 },
  kenBurnsMaxScale: 1.22,
} as const;
