import React from "react";
import { Composition } from "remotion";
import { AdThree } from "./AdThree";
import { VIDEO } from "./timeline";
import "./lib/fonts";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO.id}
      component={AdThree}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
