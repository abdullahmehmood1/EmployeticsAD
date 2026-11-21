/**
 * Single source of truth for Employetics AdThree (1080x1920 vertical 9:16, 30 fps, 1200 frames = 40.0 s).
 * Edit any text or frame timing here to update visuals, motion, and synced sound effects together.
 */

export const VIDEO = {
  id: "AdThree",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1200,
  // Strict social-app safe zone (clear of TikTok/Reels/Shorts chrome)
  safeLeft: 110,
  safeRight: 970,
  safeTop: 250,
  safeBottom: 1500,
  maxTextWidth: 860, // 970 - 110
} as const;

/** Strict emotional night-to-dawn palette (NO neon). */
export const PALETTE = {
  MIDNIGHT: "#0B1B33",
  NIGHT_DARK: "#060F1F",
  DEEP: "#14284A",
  BUBBLE: "#263A5C",
  CREAM: "#FFF4E0",
  TEAL: "#5FA8A0",
  GOLD: "#F0B65A",
  NAVY: "#0F2A52",
  AMBER: "#E3A64B", // Low battery (<20%) only
} as const;

/** Allowed on-screen copy (ONLY these strings appear in AdThree). */
export const COPY = {
  // S1 HOOK
  s1Hook: "Still screening.",

  // Day chips
  dayMon: "MON",
  dayWed: "WED",
  daySat: "SAT",
  daySun: "SUN",

  // Status bar times
  timeMon: "9:02 PM",
  timeWed: "11:48 PM",
  timeSat: "10:15 PM",
  timeSun: "9:00 AM",

  // Exact chat bubbles
  chatMonIn: "Shortlist ready?",
  chatMonOut: "Still screening 400 CVs.",
  chatWedIn: "Quick HR data check?",
  chatWedOut: "Hold on. Digging through files.",
  chatSatIn: "Dinner tonight?",
  chatSatOut: "Can't. Still screening.",
  chatSunOut: "Shortlist sent. All questions answered.",
  chatSunIn: "Brunch at 10?",

  // S3 THE TURN
  s3Turn: "There's a better way.",

  // S4 THE APP
  s4Line1: "CVs ranked in seconds.",
  s4Line2: "Ask your own HR data.",
  s4Badge: "CUSTOMIZED HR CHATBOT.",
  s4DemoData: "DEMO DATA",

  // S5 THE CHANGE
  s5Line1: "HIRE FASTER.",
  s5Line2: "ASK ANYTHING. INSTANTLY.",

  // S6 END CARD
  s6WordmarkBold: "Employ",
  s6WordmarkRegular: "etics",
  s6Slogan: "Smarter HR. Explainable AI.",
} as const;

/** Exact global frame timeline at 30 fps (0..1199). */
export const TIMELINE = {
  // S1 HOOK: f0-89 (90 frames)
  S1: {
    start: 0,
    end: 89,
    duration: 90,
    typeStart: 8,
    typeEnd: 36,
    ghostFrames: [40, 48, 56] as readonly number[],
    morphStart: 70,
    morphEnd: 89,
  },

  // S2 THE WEEK: f90-329 (240 frames)
  S2: {
    start: 90,
    end: 329,
    duration: 240,
    monStart: 90,
    monIncoming: 95,
    monTypingStart: 115,
    monTypingEnd: 128,
    monReply: 130,

    wedStart: 170,
    wedIncoming: 175,
    wedReply: 205,

    satStart: 250,
    satIncoming: 255,
    satTypingStart: 275,
    satTypingEnd: 300,
    satReply: 305,
  },

  // S3 THE TURN: f330-419 (90 frames)
  S3: {
    start: 330,
    end: 419,
    duration: 90,
    textFadeIn: 340,
    textFull: 364,
    fadeOutStart: 405,
    fadeOutEnd: 419,
  },

  // S4 THE APP: f420-689 (270 frames)
  S4: {
    start: 420,
    end: 689,
    duration: 270,
    windowRiseStart: 420,
    zoomCvStart: 440,
    line1At: 450,
    crossfadeAt: 535,
    line2At: 550,
    chatbotFocusAt: 610,
    windowDownStart: 670,
    windowDownEnd: 689,
  },

  // S5 THE CHANGE: f690-1019 (330 frames)
  S5: {
    start: 690,
    end: 1019,
    duration: 330,
    dawnStart: 700,
    dawnEnd: 860,
    hrBubble: 720,
    friendBubble: 770,
    chargeStart: 780,
    chargeEnd: 850,
    chimeAt: 850,
    chatFadeOutStart: 874,
    chatFadeOutEnd: 890,
    line1At: 890,
    line2At: 950,
    endFadeStart: 1000,
    endFadeEnd: 1019,
  },

  // S6 END CARD: f1020-1199 (180 frames = 6.0 s)
  S6: {
    start: 1020,
    end: 1199,
    duration: 180,
    logoStart: 1030,
    logoEnd: 1060,
    wordmarkStart: 1050,
    wordmarkEnd: 1075,
    sloganStart: 1085,
    sloganEnd: 1105,
  },

  // Audio cue points (NO voice-over — intimate felt piano + subtle UI sounds)
  AUDIO: {
    msgPopFrames: [95, 175, 255, 770] as readonly number[],
    msgSentFrames: [130, 205, 305, 720] as readonly number[],
    typingTickFrames: [
      10, 14, 18, 22, 26, 30, 34, // S1 typing "Still screening."
      116, 120, 124, // MON typing dots
      195, 199, 203, // WED reply cadence
      277, 282, 287, 292, 297, // SAT longer typing dots
    ] as readonly number[],
    whooshSoftFrames: [72, 420, 535, 670, 882] as readonly number[],
    heartbeatFrame: 344,
    chimeFrame: 850,
    musicVolume: 0.25,
    musicFadeOutStart: 1155, // gentle 1.5 s fade-out
  },
} as const;

/** Verified normalized landmarks on public/cv_screening.png & public/hr_chatbot.png (1080x1080). */
export const HR_SCREEN_TARGETS = {
  // Top-ranked candidate card (#1 Maya Chen, 97% Match) in cv_screening.png
  topCandidate: {
    u: 0.5,
    v: 336 / 1080,
    w: 960 / 1080,
    h: 264 / 1080,
  },
  // AI Instant Reply panel in hr_chatbot.png
  chatbotReplyPanel: {
    u: 539 / 1080,
    v: 646 / 1080,
    w: 958 / 1080,
    h: 536 / 1080,
  },
} as const;

/** Smooth color interpolation utility for night-to-dawn background & contrast shifts. */
export function lerpColor(hexA: string, hexB: string, t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const parse = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r1 + (r2 - r1) * u)}${toHex(g1 + (g2 - g1) * u)}${toHex(b1 + (b2 - b1) * u)}`;
}
