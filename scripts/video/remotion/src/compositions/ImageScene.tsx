import React from "react";
import { useCurrentFrame, interpolate, Img } from "remotion";
import { theme as defaultTheme, type Theme } from "../theme";
import type { ImageVisual } from "../types";

interface Props {
  visual: ImageVisual;
  theme?: Theme;
}

export const ImageScene: React.FC<Props> = ({ visual, theme = defaultTheme }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle Ken Burns zoom effect
  const scale = interpolate(frame, [0, 300], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });

  const captionOpacity = interpolate(frame, [20, 35], [0, 1], {
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
        opacity,
      }}
    >
      {/* Image container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          borderRadius: theme.sizes.borderRadius,
          maxHeight: theme.format === "portrait" ? theme.sizes.height - 500 : theme.sizes.height - 250,
          width: "100%",
        }}
      >
        <Img
          src={visual.image_url}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transform: `scale(${scale})`,
            borderRadius: theme.sizes.borderRadius,
          }}
        />
      </div>

      {/* Caption */}
      {visual.caption && (
        <div
          style={{
            marginTop: 24,
            fontSize: theme.format === "portrait" ? theme.sizes.body : theme.sizes.bodySmall,
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
            opacity: captionOpacity,
            textAlign: "center",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {visual.caption}
        </div>
      )}
    </div>
  );
};
