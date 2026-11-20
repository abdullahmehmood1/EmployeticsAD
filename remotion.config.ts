import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
// Allow rendering cleanly with zero audio files (or SFX/VO/music when present)
Config.setEnforceAudioTrack(false);
// Colab / Docker runs as root; disable Chromium sandbox per Remotion docs
Config.setChromiumFlags({
  "no-sandbox": true,
  "disable-setuid-sandbox": true,
  "disable-dev-shm-usage": true,
});
