import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { DataRevealVisual } from "../types";

interface Props {
  visual: DataRevealVisual;
  theme?: Theme;
}

export const DataReveal: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numberScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  const contextOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: "clamp",
  });
  const contextY = interpolate(frame, [25, 40], [15, 0], {
    extrapolateRight: "clamp",
  });

  // Glow effect behind the number
  const glowOpacity = interpolate(frame, [10, 25], [0, 0.3], {
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
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}40, transparent)`,
          opacity: glowOpacity,
        }}
      />

      {/* Number + Unit */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          transform: `scale(${numberScale})`,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            color: theme.colors.accent,
            lineHeight: 1,
          }}
        >
          {visual.number}
        </div>
        {visual.unit && (
          <div
            style={{
              fontSize: theme.sizes.titleSmall,
              fontFamily: theme.fonts.body,
              color: theme.colors.textSecondary,
              fontWeight: 500,
            }}
          >
            {visual.unit}
          </div>
        )}
      </div>

      {/* Context */}
      {visual.context && (
        <div
          style={{
            marginTop: 40,
            fontSize: theme.sizes.bodyLarge,
            fontFamily: theme.fonts.body,
            color: theme.colors.textMuted,
            opacity: contextOpacity,
            transform: `translateY(${contextY}px)`,
            textAlign: "center",
            maxWidth: "60%",
          }}
        >
          {visual.context}
        </div>
      )}
    </div>
  );
};
