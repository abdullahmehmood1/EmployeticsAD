#!/usr/bin/env node
/**
 * Scans public/ and audio/ and writes src/lib/assets.json so Remotion knows at bundle time:
 * - Whether public/app_demo.mp4, public/team_burnout.png, public/workload_optimizer.png exist
 * - Whether audio/voiceover.mp3 or public/audio/vo/*.mp3 exist
 * - Whether audio/music.mp3 or public/sfx/music_loop.wav exist
 * - Which public/sfx/*.wav files exist
 * Mirrors optional root audio/voiceover.mp3 and audio/music.mp3 into public/audio/.
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

for (const fname of ["voiceover.mp3", "music.mp3"]) {
  const src = path.join(audioRootDir, fname);
  const dst = path.join(publicAudioDir, fname);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
  }
}

const has = (relToPublic) => fs.existsSync(path.join(publicDir, relToPublic));

const voClips = [
  "vo_12.mp3",
  "vo_110.mp3",
  "vo_310.mp3",
  "vo_410.mp3",
  "vo_540.mp3",
  "vo_720.mp3",
  "vo_1030.mp3",
].filter((f) => has(path.join("audio", "vo", f)));

const sfxNames = ["pop", "whoosh", "ding", "thud", "sparkle", "click", "music_loop"];
const sfx = sfxNames.reduce((acc, name) => {
  acc[name] = has(path.join("sfx", `${name}.wav`));
  return acc;
}, {});

const manifest = {
  hasAppDemoVideo: has("app_demo.mp4"),
  hasTeamBurnoutScreen: has("team_burnout.png"),
  hasWorkloadOptimizerScreen: has("workload_optimizer.png"),
  hasCustomVoiceover: has(path.join("audio", "voiceover.mp3")),
  hasCustomMusic: has(path.join("audio", "music.mp3")),
  voClips,
  sfx,
};

fs.writeFileSync(outJson, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("[Assets] Synced src/lib/assets.json:", JSON.stringify(manifest));
