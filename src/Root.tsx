import React from "react";
import { Composition } from "remotion";
import { AdOne } from "./AdOne";
import { VIDEO } from "./timeline";
import "./lib/fonts";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO.id}
      component={AdOne}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
