import React from "react";
import { Composition } from "remotion";
import { EmployeticsAd, EmployeticsAdProps } from "./EmployeticsAd";
import { VIDEO_CONFIG } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EmployeticsAd"
      component={EmployeticsAd as unknown as React.FC<Record<string, unknown>>}
      durationInFrames={VIDEO_CONFIG.totalFrames}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
      defaultProps={
        {
          showCaptions: false,
          includeAudio: true,
          audioVolume: 1.0,
          transparentBg: false,
        } satisfies EmployeticsAdProps
      }
    />
  );
};
