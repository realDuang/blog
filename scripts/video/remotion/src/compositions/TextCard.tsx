import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { TextCardVisual } from "../types";

interface Props {
  visual: TextCardVisual;
  theme?: Theme;
}

export const TextCard: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { bullets, highlight_index } = visual;

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
      {bullets.map((bullet, index) => {
        const delay = index * theme.animation.staggerDelay;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateX = interpolate(frame, [delay, delay + 15], [40, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const isHighlighted = highlight_index === index;

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
            {/* Bullet marker */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isHighlighted
                  ? theme.colors.accent
                  : theme.colors.primary,
                marginTop: 14,
                marginRight: 24,
                flexShrink: 0,
              }}
            />
            {/* Bullet text */}
            <div
              style={{
                fontSize: theme.sizes.bodyLarge,
                fontFamily: theme.fonts.body,
                color: isHighlighted
                  ? theme.colors.text
                  : theme.colors.textSecondary,
                fontWeight: isHighlighted ? 600 : 400,
                lineHeight: 1.6,
              }}
            >
              {bullet}
            </div>
          </div>
        );
      })}
    </div>
  );
};
