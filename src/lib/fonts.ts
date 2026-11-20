import { loadFont } from "@remotion/google-fonts/Poppins";

const poppins = loadFont("normal", {
  weights: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
});

export const POPPINS_FONT = poppins.fontFamily;
export const waitForPoppins = poppins.waitUntilDone;
