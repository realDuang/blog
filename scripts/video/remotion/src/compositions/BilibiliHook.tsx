import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BilibiliHookVisual } from "../types";

interface BilibiliHookProps {
  visual: BilibiliHookVisual;
}

export const BilibiliHook: React.FC<BilibiliHookProps> = ({ visual }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation sequences
  // 1. Question fades in and slides up slightly
  const questionOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const questionY = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. The impact text "slaps" onto the screen
  // Wait until frame 45 (1.5s in at 30fps)
  const showImpact = frame > 45;
  const impactScale = spring({
    frame: frame - 45,
    fps,
    config: {
      damping: 12,
      stiffness: 150,
      mass: 1.5,
    },
  });

  const impactRotate = interpolate(frame - 45, [0, 10], [-10, -5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: theme.sizes.padding,
      }}
    >
      <div
        style={{
          opacity: questionOpacity,
          transform: `translateY(${questionY}px)`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: theme.sizes.titleLarge,
            color: theme.colors.text,
            fontWeight: "bold",
            lineHeight: 1.3,
            margin: 0,
            textShadow: `0 4px 12px rgba(0,0,0,0.5)`,
          }}
        >
          {visual.question}
        </h1>
      </div>

      <div
        style={{
          opacity: showImpact ? 1 : 0,
          transform: `scale(${showImpact ? impactScale : 0}) rotate(${impactRotate}deg)`,
          backgroundColor: theme.colors.danger,
          padding: "20px 40px",
          borderRadius: 20,
          boxShadow: `0 10px 30px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)`,
        }}
      >
        <h2
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: 84, // Extra large for impact
            color: "#ffffff",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textShadow: "0 4px 0px rgba(0,0,0,0.2)",
          }}
        >
          {visual.impact_text}
        </h2>
      </div>

      {/* Glitch/Scanline overlay effect for the hook */}
      {frame > 45 && frame < 55 && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'white',
          opacity: interpolate(frame, [45, 48, 55], [0, 0.1, 0]),
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }} />
      )}
    </div>
  );
};