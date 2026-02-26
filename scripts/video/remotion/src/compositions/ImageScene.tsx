import React from "react";
import { useCurrentFrame, interpolate, Img } from "remotion";
import { theme } from "../theme";
import type { ImageVisual } from "../types";

interface Props {
  visual: ImageVisual;
}

export const ImageScene: React.FC<Props> = ({ visual }) => {
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
          maxHeight: theme.sizes.height - 250,
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
            fontSize: theme.sizes.bodySmall,
            fontFamily: theme.fonts.body,
            color: theme.colors.textMuted,
            opacity: captionOpacity,
            textAlign: "center",
          }}
        >
          {visual.caption}
        </div>
      )}
    </div>
  );
};
