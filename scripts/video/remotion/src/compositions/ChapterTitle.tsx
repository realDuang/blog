import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { ChapterTitleVisual } from "../types";

interface Props {
  visual: ChapterTitleVisual;
  theme?: Theme;
}

export const ChapterTitle: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15 } });
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [15, 30], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Decorative line animation
  const lineWidth = interpolate(frame, [5, 25], [0, 200], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: theme.sizes.width,
        height: theme.sizes.height,
        backgroundColor: theme.colors.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: theme.sizes.padding,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: theme.sizes.titleLarge,
          fontFamily: theme.fonts.heading,
          fontWeight: 700,
          color: theme.colors.text,
          textAlign: "center",
          transform: `scale(${titleSpring})`,
          lineHeight: 1.3,
          maxWidth: "80%",
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {visual.title}
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          backgroundColor: theme.colors.primary,
          marginTop: 32,
          marginBottom: 32,
          borderRadius: 2,
        }}
      />

      {/* Subtitle */}
      {visual.subtitle && (
        <div
          style={{
            fontSize: theme.sizes.titleSmall,
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          {visual.subtitle}
        </div>
      )}
    </div>
  );
};
