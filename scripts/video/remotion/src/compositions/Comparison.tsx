import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";
import type { ComparisonVisual } from "../types";

interface Props {
  visual: ComparisonVisual;
}

export const Comparison: React.FC<Props> = ({ visual }) => {
  const frame = useCurrentFrame();

  const leftOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const rightOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const vsOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const SideCard: React.FC<{
    label: string;
    points: string[];
    opacity: number;
    color: string;
  }> = ({ label, points, opacity, color }) => (
    <div
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.sizes.borderRadius,
        padding: theme.sizes.paddingSmall,
        borderTop: `4px solid ${color}`,
        opacity,
      }}
    >
      <div
        style={{
          fontSize: theme.sizes.titleSmall,
          fontFamily: theme.fonts.heading,
          fontWeight: 700,
          color,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      {points.map((point, i) => {
        const delay = i * theme.animation.staggerDelay + 15;
        const pointOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              fontSize: theme.sizes.body,
              fontFamily: theme.fonts.body,
              color: theme.colors.textSecondary,
              marginBottom: 16,
              paddingLeft: 16,
              borderLeft: `3px solid ${color}40`,
              opacity: pointOpacity,
              lineHeight: 1.5,
            }}
          >
            {point}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        width: theme.sizes.width,
        height: theme.sizes.height,
        backgroundColor: theme.colors.bg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.sizes.gap * 2,
        padding: theme.sizes.padding,
      }}
    >
      <SideCard
        label={visual.left.label}
        points={visual.left.points}
        opacity={leftOpacity}
        color={theme.colors.primary}
      />
      <div
        style={{
          fontSize: theme.sizes.titleMedium,
          fontFamily: theme.fonts.heading,
          fontWeight: 700,
          color: theme.colors.accent,
          opacity: vsOpacity,
        }}
      >
        VS
      </div>
      <SideCard
        label={visual.right.label}
        points={visual.right.points}
        opacity={rightOpacity}
        color={theme.colors.accent}
      />
    </div>
  );
};
