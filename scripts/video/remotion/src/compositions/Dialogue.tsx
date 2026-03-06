import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { DialogueVisual, DialogueLine } from "../types";

interface DialogueProps {
  visual: DialogueVisual;
  lines: DialogueLine[];
  speakerNames?: Record<string, string>;
  speakerAvatars?: Record<string, string>;
  lineDurations?: number[];
  audioStartOffsetFrames?: number;
  theme?: Theme;
}

// Speaker color scheme — uses a theme-aware factory
function getSpeakerStyles(t: Theme): Record<string, { color: string; align: "left" | "right" }> {
  return {
    A: { color: t.colors.primaryLight, align: "left" },
    B: { color: t.colors.accent, align: "right" },
  };
}

const getSpeakerStyle = (speaker: string, t: Theme) => {
  const styles = getSpeakerStyles(t);
  return styles[speaker] || { color: t.colors.textSecondary, align: "left" as const };
};

/**
 * Calculate the frame at which each dialogue line's audio starts playing.
 * Accounts for audio_start_offset_frames and 0.3s gaps between lines.
 */
function getLineEntryFrames(
  lines: DialogueLine[],
  lineDurations: number[] | undefined,
  fps: number,
  audioStartOffsetFrames: number,
): number[] {
  if (!lineDurations || lineDurations.length !== lines.length) {
    // Fallback: stagger by fixed delay
    return lines.map((_, i) => 10 + i * 12);
  }

  const gapSeconds = 0.3; // must match tts.py _concat_wav_files gap
  const entryFrames: number[] = [];
  let cumulativeTime = 0;

  for (let i = 0; i < lines.length; i++) {
    // The bubble should appear when this line's audio starts
    const entryFrame = audioStartOffsetFrames + Math.round(cumulativeTime * fps);
    entryFrames.push(entryFrame);
    cumulativeTime += lineDurations[i] + gapSeconds;
  }

  return entryFrames;
}

export const Dialogue: React.FC<DialogueProps> = ({
  visual,
  lines,
  speakerNames,
  speakerAvatars,
  lineDurations,
  audioStartOffsetFrames = 0,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Topic label fade-in
  const topicOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Calculate entry frame for each line based on audio timing
  const lineEntryFrames = getLineEntryFrames(lines, lineDurations, fps, audioStartOffsetFrames);

  return (
    <div
      style={{
        width: theme.sizes.width,
        height: theme.sizes.height,
        backgroundColor: theme.colors.bg,
        display: "flex",
        flexDirection: "column",
        padding: theme.sizes.padding,
        color: theme.colors.text,
        overflow: "hidden",
      }}
    >
      {/* Topic indicator */}
      <div
        style={{
          opacity: topicOpacity,
          marginBottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 6,
            height: 32,
            backgroundColor: theme.colors.primaryLight,
            borderRadius: 3,
          }}
        />
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.sizes.bodySmall,
            color: theme.colors.textSecondary,
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {visual.topic}
        </span>
      </div>

      {/* Dialogue lines */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          maxWidth: 1600,
          alignSelf: "center",
          width: "100%",
        }}
      >
        {lines.map((line, i) => {
          const entryFrame = lineEntryFrames[i];
          const progress = spring({
            frame: frame - entryFrame,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          const style = getSpeakerStyle(line.speaker, theme);
          const displayName = speakerNames?.[line.speaker] || line.speaker;
          const isRight = style.align === "right";

          // Slide direction based on speaker alignment
          const slideX = isRight
            ? interpolate(progress, [0, 1], [60, 0])
            : interpolate(progress, [0, 1], [-60, 0]);

          if (progress <= 0) return null;

          return (
            <div
              key={`${line.speaker}-${i}`}
              style={{
                display: "flex",
                flexDirection: isRight ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 20,
                opacity: progress,
                transform: `translateX(${slideX}px)`,
              }}
            >
              {/* Speaker avatar */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: style.color,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  border: `3px solid ${style.color}`,
                }}
              >
                {speakerAvatars?.[line.speaker] ? (
                  <Img
                    src={staticFile(speakerAvatars[line.speaker])}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontSize: displayName.length > 1 ? 20 : 28,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {displayName}
                  </span>
                )}
              </div>

              {/* Speech bubble */}
              <div
                style={{
                  backgroundColor: isRight
                    ? `${style.color}22`
                    : theme.colors.bgCard,
                  borderRadius: 20,
                  borderTopLeftRadius: isRight ? 20 : 4,
                  borderTopRightRadius: isRight ? 4 : 20,
                  padding: "20px 28px",
                  maxWidth: "75%",
                  border: `2px solid ${isRight ? `${style.color}44` : theme.colors.bgCardLight}`,
                }}
              >
                <p
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: theme.sizes.bodyLarge,
                    lineHeight: 1.5,
                    margin: 0,
                    color: theme.colors.text,
                  }}
                >
                  {line.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
