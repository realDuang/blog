import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { DialogueVisual, DialogueLine } from "../types";

interface DialogueProps {
  visual: DialogueVisual;
  lines: DialogueLine[];
  speakerNames?: Record<string, string>;
}

// Speaker color scheme
const SPEAKER_STYLES: Record<string, { color: string; align: "left" | "right" }> = {
  A: { color: theme.colors.primaryLight, align: "left" },
  B: { color: theme.colors.accent, align: "right" },
};

const getSpeakerStyle = (speaker: string) =>
  SPEAKER_STYLES[speaker] || { color: theme.colors.textSecondary, align: "left" as const };

export const Dialogue: React.FC<DialogueProps> = ({ visual, lines, speakerNames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Topic label fade-in
  const topicOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Calculate how many lines to show based on frame progression
  // Each line appears with a staggered delay
  const linesPerScene = lines.length;
  const lineDelay = 12; // frames between each line appearing

  return (
    <div
      style={{
        flex: 1,
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
          const entryFrame = 10 + i * lineDelay;
          const progress = spring({
            frame: frame - entryFrame,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          const style = getSpeakerStyle(line.speaker);
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
                }}
              >
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
