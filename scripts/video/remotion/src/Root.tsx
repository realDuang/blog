import React from "react";
import { Sequence, useCurrentFrame, Audio, staticFile } from "remotion";
import type { VideoProps, Scene } from "./types";
import { ChapterTitle } from "./compositions/ChapterTitle";
import { TextCard } from "./compositions/TextCard";
import { ImageScene } from "./compositions/ImageScene";
import { CodeScene } from "./compositions/CodeScene";
import { Comparison } from "./compositions/Comparison";
import { DataReveal } from "./compositions/DataReveal";
import { Summary } from "./compositions/Summary";
import { Subtitle } from "./compositions/Subtitle";
import { BilibiliHook } from "./compositions/BilibiliHook";
import { BilibiliOutro } from "./compositions/BilibiliOutro";
import { Dialogue } from "./compositions/Dialogue";

const SceneRenderer: React.FC<{
  scene: Scene;
  speakerNames?: Record<string, string>;
  speakerAvatars?: Record<string, string>;
  hookCharacterImage?: string;
  hookBackgroundImage?: string;
}> = ({ scene, speakerNames, speakerAvatars, hookCharacterImage, hookBackgroundImage }) => {
  switch (scene.type) {
    case "chapter_title":
      return <ChapterTitle visual={scene.visual as any} />;
    case "text_card":
      return <TextCard visual={scene.visual as any} />;
    case "image":
      return <ImageScene visual={scene.visual as any} />;
    case "code":
      return <CodeScene visual={scene.visual as any} />;
    case "comparison":
      return <Comparison visual={scene.visual as any} />;
    case "data_reveal":
      return <DataReveal visual={scene.visual as any} />;
    case "summary":
      return <Summary visual={scene.visual as any} />;
    case "bilibili_hook":
      return <BilibiliHook visual={scene.visual as any} characterImage={hookCharacterImage} backgroundImage={hookBackgroundImage} />;
    case "bilibili_outro":
      return <BilibiliOutro visual={scene.visual as any} />;
    case "dialogue":
      return <Dialogue visual={scene.visual as any} lines={scene.lines || []} speakerNames={speakerNames} speakerAvatars={speakerAvatars} lineDurations={scene.line_durations} audioStartOffsetFrames={scene.audio_start_offset_frames || 0} />;
    default:
      return null;
  }
};

export const VideoComposition: React.FC<VideoProps> = (props) => {
  const { scenes, speaker_names, speaker_avatars, hook_character_image, hook_background_image } = props;

  return (
    <div style={{ position: "relative", width: 1920, height: 1080 }}>
      {scenes.map((scene) => {
        const startFrame = scene.start_frame ?? 0;
        const durationInFrames = scene.frame_count ?? 150;

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationInFrames}
            name={`${scene.type}: ${scene.id}`}
          >
            <SceneRenderer
              scene={scene}
              speakerNames={speaker_names}
              speakerAvatars={speaker_avatars}
              hookCharacterImage={hook_character_image}
              hookBackgroundImage={hook_background_image}
            />
            {scene.audio_file && (
              <Sequence from={scene.audio_start_offset_frames || 0}>
                <Audio src={staticFile(scene.audio_file)} />
              </Sequence>
            )}
            {scene.subtitles && scene.subtitles.length > 0 && (
              <Subtitle subtitles={scene.subtitles} speakerNames={speaker_names} />
            )}
          </Sequence>
        );
      })}
    </div>
  );
};
