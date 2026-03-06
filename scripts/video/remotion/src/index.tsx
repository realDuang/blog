import React from "react";
import { registerRoot, Composition } from "remotion";
import { VideoComposition } from "./Root";
import type { VideoProps } from "./types";
import { getTheme } from "./theme";

// Default props for preview mode
const defaultProps: VideoProps = {
  title: "Preview",
  fps: 30,
  total_frames: 300,
  total_duration_seconds: 10,
  scenes: [
    {
      id: "scene_001",
      type: "chapter_title",
      narration: "这是一个预览场景",
      visual: { title: "视频预览", subtitle: "Blog to Video Pipeline" },
      frame_count: 150,
      start_frame: 0,
    },
    {
      id: "scene_002",
      type: "text_card",
      narration: "测试文字卡片",
      visual: {
        bullets: ["第一个要点", "第二个要点", "第三个要点"],
        highlight_index: 0,
      },
      frame_count: 150,
      start_frame: 150,
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps as any}
        calculateMetadata={async ({ props }: { props: any }) => {
          const format = props.format || "landscape";
          const t = getTheme(format);
          return {
            durationInFrames: props.total_frames || 300,
            fps: props.fps || 30,
            width: t.sizes.width,
            height: t.sizes.height,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
