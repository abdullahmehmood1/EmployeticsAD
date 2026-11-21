#!/usr/bin/env node
/**
 * Scans public/ and audio/ and writes src/lib/assets.json for AdThree:
 * - Whether public/self_awareness.png exists
 * - Whether audio/music.mp3 or public/sfx/music.wav exists
 * - Which public/sfx/*.wav files exist
 * Mirrors optional root audio/music.mp3 into public/audio/ so staticFile() can serve it.
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

const musicSrc = path.join(audioRootDir, "music.mp3");
const musicDst = path.join(publicAudioDir, "music.mp3");
if (fs.existsSync(musicSrc)) {
  fs.copyFileSync(musicSrc, musicDst);
}

const has = (relToPublic) => fs.existsSync(path.join(publicDir, relToPublic));

const sfxNames = [
  "msg_pop",
  "msg_sent",
  "typing_tick",
  "whoosh_soft",
  "chime",
  "heartbeat",
  "music",
];
const sfx = sfxNames.reduce((acc, name) => {
  acc[name] = has(path.join("sfx", `${name}.wav`));
  return acc;
}, {});

const manifest = {
  hasSelfAwarenessScreen: has("self_awareness.png"),
  hasCustomMusic: has(path.join("audio", "music.mp3")),
  sfx,
};

fs.writeFileSync(outJson, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("[Assets] Synced src/lib/assets.json:", JSON.stringify(manifest));
