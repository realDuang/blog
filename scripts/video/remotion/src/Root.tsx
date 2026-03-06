import React from "react";
import { Sequence, useCurrentFrame, Audio, staticFile, Img, interpolate } from "remotion";
import type { VideoProps, Scene } from "./types";
import { getTheme, type VideoFormat } from "./theme";
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
import { BilibiliHookPortrait } from "./compositions/BilibiliHookPortrait";
import { ComparisonPortrait } from "./compositions/ComparisonPortrait";
import { BilibiliOutroPortrait } from "./compositions/BilibiliOutroPortrait";

/** Blurred + dimmed background image layer for portrait mode scenes */
const PortraitBackground: React.FC<{ backgroundImage: string; width: number; height: number }> = ({ backgroundImage, width, height }) => {
  const frame = useCurrentFrame();
  // Subtle Ken Burns zoom throughout each scene
  const bgScale = interpolate(frame, [0, 600], [1.02, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img
        src={staticFile(backgroundImage)}
        style={{
          width: width + 80,
          height: height + 80,
          objectFit: "cover",
          position: "absolute",
          top: -40,
          left: -40,
          transform: `scale(${bgScale})`,
          filter: "blur(18px) brightness(0.3) saturate(1.2)",
        }}
      />
      {/* Vignette overlay for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
};

/** Scene types that already have their own background treatment */
const SCENES_WITH_OWN_BG = new Set(["bilibili_hook"]);

const SceneRenderer: React.FC<{
  scene: Scene;
  speakerNames?: Record<string, string>;
  speakerAvatars?: Record<string, string>;
  hookCharacterImage?: string;
  hookBackgroundImage?: string;
  format: VideoFormat;
}> = ({ scene, speakerNames, speakerAvatars, hookCharacterImage, hookBackgroundImage, format }) => {
  const t = getTheme(format);

  switch (scene.type) {
    case "chapter_title":
      return <ChapterTitle visual={scene.visual as any} theme={t} />;
    case "text_card":
      return <TextCard visual={scene.visual as any} theme={t} />;
    case "image":
      return <ImageScene visual={scene.visual as any} theme={t} />;
    case "code":
      return <CodeScene visual={scene.visual as any} theme={t} />;
    case "comparison":
      return format === "portrait"
        ? <ComparisonPortrait visual={scene.visual as any} theme={t} />
        : <Comparison visual={scene.visual as any} theme={t} />;
    case "data_reveal":
      return <DataReveal visual={scene.visual as any} theme={t} />;
    case "summary":
      return <Summary visual={scene.visual as any} theme={t} />;
    case "bilibili_hook":
      return format === "portrait"
        ? <BilibiliHookPortrait visual={scene.visual as any} characterImage={hookCharacterImage} backgroundImage={hookBackgroundImage} theme={t} />
        : <BilibiliHook visual={scene.visual as any} characterImage={hookCharacterImage} backgroundImage={hookBackgroundImage} />;
    case "bilibili_outro":
      return format === "portrait"
        ? <BilibiliOutroPortrait visual={scene.visual as any} theme={t} />
        : <BilibiliOutro visual={scene.visual as any} />;
    case "dialogue":
      return <Dialogue visual={scene.visual as any} lines={scene.lines || []} speakerNames={speakerNames} speakerAvatars={speakerAvatars} lineDurations={scene.line_durations} audioStartOffsetFrames={scene.audio_start_offset_frames || 0} theme={t} />;
    default:
      return null;
  }
};

export const VideoComposition: React.FC<VideoProps> = (props) => {
  const { scenes, speaker_names, speaker_avatars, hook_character_image, hook_background_image, format = "landscape" } = props;
  const t = getTheme(format);

  return (
    <div style={{ position: "relative", width: t.sizes.width, height: t.sizes.height }}>
      {scenes.map((scene) => {
        const startFrame = scene.start_frame ?? 0;
        const durationInFrames = scene.frame_count ?? 150;
        const needsPortraitBg = format === "portrait" && hook_background_image && !SCENES_WITH_OWN_BG.has(scene.type);

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationInFrames}
            name={`${scene.type}: ${scene.id}`}
          >
            {needsPortraitBg && (
              <PortraitBackground backgroundImage={hook_background_image!} width={t.sizes.width} height={t.sizes.height} />
            )}
            <SceneRenderer
              scene={scene}
              speakerNames={speaker_names}
              speakerAvatars={speaker_avatars}
              hookCharacterImage={hook_character_image}
              hookBackgroundImage={hook_background_image}
              format={format}
            />
            {scene.audio_file && (
              <Sequence from={scene.audio_start_offset_frames || 0}>
                <Audio src={staticFile(scene.audio_file)} />
              </Sequence>
            )}
            {scene.subtitles && scene.subtitles.length > 0 && (
              <Subtitle subtitles={scene.subtitles} speakerNames={speaker_names} format={format} />
            )}
          </Sequence>
        );
      })}
    </div>
  );
};
