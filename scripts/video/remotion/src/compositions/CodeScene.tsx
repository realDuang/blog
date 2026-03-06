import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { CodeVisual } from "../types";

interface Props {
  visual: CodeVisual;
  theme?: Theme;
}

export const CodeScene: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();

  const lines = visual.code.split("\n");
  const highlightSet = new Set(visual.highlight_lines ?? []);

  const containerOpacity = interpolate(frame, [0, 10], [0, 1], {
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
        opacity: containerOpacity,
      }}
    >
      {/* Language badge */}
      {visual.language && (
        <div
          style={{
            alignSelf: "flex-start",
            marginLeft: theme.sizes.padding,
            marginBottom: 16,
            padding: "6px 16px",
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            fontSize: theme.sizes.caption,
            fontFamily: theme.fonts.code,
            color: theme.colors.text,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {visual.language}
        </div>
      )}

      {/* Code block */}
      <div
        style={{
          backgroundColor: theme.colors.codeBg,
          borderRadius: theme.sizes.borderRadius,
          padding: theme.sizes.paddingSmall,
          width: theme.sizes.width - theme.sizes.padding * 2,
          overflow: "hidden",
        }}
      >
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = highlightSet.has(lineNum);
          const delay = index * 3;
          const lineOpacity = interpolate(
            frame,
            [delay + 5, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isHighlighted
                  ? theme.colors.codeHighlight
                  : "transparent",
                borderLeft: isHighlighted
                  ? `3px solid ${theme.colors.primary}`
                  : "3px solid transparent",
                padding: "4px 12px",
                opacity: lineOpacity,
              }}
            >
              {/* Line number */}
              <span
                style={{
                  width: 40,
                  textAlign: "right",
                  marginRight: 20,
                  fontSize: theme.sizes.code - 4,
                  fontFamily: theme.fonts.code,
                  color: theme.colors.textMuted,
                  userSelect: "none",
                }}
              >
                {lineNum}
              </span>
              {/* Code content */}
              <span
                style={{
                  fontSize: theme.sizes.code,
                  fontFamily: theme.fonts.code,
                  color: theme.colors.codeText,
                  whiteSpace: "pre",
                }}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
