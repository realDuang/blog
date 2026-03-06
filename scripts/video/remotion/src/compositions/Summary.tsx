import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { SummaryVisual } from "../types";

interface Props {
  visual: SummaryVisual;
  theme?: Theme;
}

export const Summary: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
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
        padding: theme.sizes.padding,
        paddingLeft: theme.sizes.padding * 2,
        paddingRight: theme.sizes.padding * 2,
      }}
    >
      {/* Title */}
      {visual.title && (
        <div
          style={{
            fontSize: theme.sizes.titleMedium,
            fontFamily: theme.fonts.heading,
            fontWeight: 700,
            color: theme.colors.accentLight,
            marginBottom: theme.sizes.gap * 2,
            opacity: titleOpacity,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {visual.title}
        </div>
      )}

      {/* Summary points */}
      {visual.points.map((point, index) => {
        const delay = index * theme.animation.staggerDelay + 10;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateX = interpolate(frame, [delay, delay + 15], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: theme.sizes.gap,
              opacity,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {/* Numbered marker */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.primary,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 24,
                flexShrink: 0,
                fontSize: theme.sizes.bodySmall,
                fontFamily: theme.fonts.heading,
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              {index + 1}
            </div>
            <div
              style={{
                fontSize: theme.sizes.bodyLarge,
                fontFamily: theme.fonts.body,
                color: theme.colors.text,
                lineHeight: 1.6,
                paddingTop: 4,
              }}
            >
              {point}
            </div>
          </div>
        );
      })}
    </div>
  );
};
