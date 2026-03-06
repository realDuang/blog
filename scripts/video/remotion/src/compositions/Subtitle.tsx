import React from "react";
import { useCurrentFrame } from "remotion";
import type { SubtitleSegment } from "../types";
import { getTheme, theme, type VideoFormat } from "../theme";

interface SubtitleProps {
  subtitles: SubtitleSegment[];
  speakerNames?: Record<string, string>;
  format?: VideoFormat;
}

// Speaker color mapping for dialogue subtitles
const SPEAKER_COLORS: Record<string, string> = {
  A: theme.colors.primaryLight,
  B: theme.colors.accent,
};

export const Subtitle: React.FC<SubtitleProps> = ({ subtitles, speakerNames, format = "landscape" }) => {
  const frame = useCurrentFrame();
  const t = getTheme(format);

  const active = subtitles.find(
    (s) => frame >= s.start_frame && frame <= s.end_frame,
  );

  if (!active) return null;

  // Parse speaker prefix from text like "[派蒙] some text" or "[A] some text"
  const speakerMatch = active.text.match(/^\[([^\]]+)\]\s*/);
  const speaker = active.speaker || (speakerMatch ? speakerMatch[1] : null);
  const displayText = speakerMatch ? active.text.slice(speakerMatch[0].length) : active.text;
  // Look up color by speaker ID (A/B), or by display name if speaker_names maps to it
  const speakerColor = speaker ? (SPEAKER_COLORS[speaker] || t.colors.textSecondary) : null;
  // Use the display name from the subtitle text prefix (already resolved by Python)
  const displaySpeaker = speakerMatch ? speakerMatch[1] : speaker;

  return (
    <div
      style={{
        position: "absolute",
        bottom: t.subtitle.bottom,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          backgroundColor: t.subtitle.bg,
          color: t.subtitle.color,
          fontSize: t.subtitle.fontSize,
          fontFamily: t.fonts.body,
          paddingLeft: t.subtitle.paddingH,
          paddingRight: t.subtitle.paddingH,
          paddingTop: t.subtitle.paddingV,
          paddingBottom: t.subtitle.paddingV,
          borderRadius: t.subtitle.borderRadius,
          lineHeight: 1.4,
          maxWidth: t.subtitle.maxWidth,
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
