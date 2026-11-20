#!/usr/bin/env node
/**
 * Scans public/ and audio/ and writes src/lib/assets.json so Remotion knows at bundle time:
 * - Whether public/app_demo.mp4 exists (uses <OffthreadVideo>) or public/attrition_screen.png
 * - Whether audio/voiceover.mp3 or public/audio/vo/*.mp3 exist
 * - Whether audio/music.mp3 exists
 * - Which public/sfx/*.wav files exist
 * If audio/voiceover.mp3 or audio/music.mp3 exist at project root, copies them to public/audio/
 * so staticFile() can serve them seamlessly.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const audioRootDir = path.join(rootDir, "audio");
const publicAudioDir = path.join(publicDir, "audio");
const outJson = path.join(rootDir, "src", "lib", "assets.json");

fs.mkdirSync(publicAudioDir, { recursive: true });
fs.mkdirSync(path.dirname(outJson), { recursive: true });

// Mirror optional root audio/voiceover.mp3 and audio/music.mp3 into public/audio/
for (const fname of ["voiceover.mp3", "music.mp3"]) {
  const src = path.join(audioRootDir, fname);
  const dst = path.join(publicAudioDir, fname);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
  }
}

const has = (relToPublic) => fs.existsSync(path.join(publicDir, relToPublic));

const voClips = ["vo_10.mp3", "vo_100.mp3", "vo_345.mp3", "vo_495.mp3", "vo_875.mp3", "vo_1045.mp3"].filter(
  (f) => has(path.join("audio", "vo", f))
);

const sfxFiles = ["impact.wav", "whoosh.wav", "tick.wav", "charge.wav", "chime.wav"].reduce(
  (acc, f) => {
    acc[f.replace(".wav", "")] = has(path.join("sfx", f));
    return acc;
  },
  {}
);

const manifest = {
  hasAppDemoVideo: has("app_demo.mp4"),
  hasAttritionScreen: has("attrition_screen.png"),
  hasCustomVoiceover: has(path.join("audio", "voiceover.mp3")),
  hasMusic: has(path.join("audio", "music.mp3")),
  voClips,
  sfx: sfxFiles,
};

fs.writeFileSync(outJson, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("[Assets] Synced src/lib/assets.json:", JSON.stringify(manifest));
