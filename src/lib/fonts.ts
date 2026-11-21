import { loadFont as loadDMSerifDisplay } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

const dmSerif = loadDMSerifDisplay("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

const poppins = loadPoppins("normal", {
  weights: ["400", "500", "800"],
  subsets: ["latin"],
});

export const SERIF_FONT = dmSerif.fontFamily;
export const INTER_FONT = inter.fontFamily;
export const POPPINS_FONT = poppins.fontFamily;
