import React from "react";
import { useCurrentFrame } from "remotion";
import type { SubtitleSegment } from "../types";
import { theme } from "../theme";

interface SubtitleProps {
  subtitles: SubtitleSegment[];
  speakerNames?: Record<string, string>;
}

// Speaker color mapping for dialogue subtitles
const SPEAKER_COLORS: Record<string, string> = {
  A: theme.colors.primaryLight,
  B: theme.colors.accent,
};

export const Subtitle: React.FC<SubtitleProps> = ({ subtitles, speakerNames }) => {
  const frame = useCurrentFrame();

  const active = subtitles.find(
    (s) => frame >= s.start_frame && frame <= s.end_frame,
  );

  if (!active) return null;

  // Parse speaker prefix from text like "[派蒙] some text" or "[A] some text"
  const speakerMatch = active.text.match(/^\[([^\]]+)\]\s*/);
  const speaker = active.speaker || (speakerMatch ? speakerMatch[1] : null);
  const displayText = speakerMatch ? active.text.slice(speakerMatch[0].length) : active.text;
  // Look up color by speaker ID (A/B), or by display name if speaker_names maps to it
  const speakerColor = speaker ? (SPEAKER_COLORS[speaker] || theme.colors.textSecondary) : null;
  // Use the display name from the subtitle text prefix (already resolved by Python)
  const displaySpeaker = speakerMatch ? speakerMatch[1] : speaker;

  return (
    <div
      style={{
        position: "absolute",
        bottom: theme.subtitle.bottom,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          backgroundColor: theme.subtitle.bg,
          color: theme.subtitle.color,
          fontSize: theme.subtitle.fontSize,
          fontFamily: theme.fonts.body,
          paddingLeft: theme.subtitle.paddingH,
          paddingRight: theme.subtitle.paddingH,
          paddingTop: theme.subtitle.paddingV,
          paddingBottom: theme.subtitle.paddingV,
          borderRadius: theme.subtitle.borderRadius,
          lineHeight: 1.4,
          maxWidth: 1600,
          textAlign: "center",
        }}
      >
        {speakerColor && (
          <span style={{ color: speakerColor, fontWeight: "bold" }}>
            [{displaySpeaker}]{" "}
          </span>
        )}
        {displayText}
      </span>
    </div>
  );
};
