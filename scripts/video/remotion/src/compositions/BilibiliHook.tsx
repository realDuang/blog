import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { theme } from "../theme";
import type { BilibiliHookVisual } from "../types";

interface BilibiliHookProps {
  visual: BilibiliHookVisual;
  characterImage?: string;
  backgroundImage?: string;
}

export const BilibiliHook: React.FC<BilibiliHookProps> = ({ visual, characterImage, backgroundImage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Animation timeline ===

  // Background: slow zoom (Ken Burns) throughout
  const bgScale = interpolate(frame, [0, 300], [1.05, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Question text: fade in + slide up (0.2s–0.6s)
  const questionOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionY = interpolate(frame, [6, 22], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Impact text: "slap" with spring at 1.5s
  const showImpact = frame > 45;
  const impactScale = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 150, mass: 1.5 },
  });
  const impactRotate = interpolate(frame - 45, [0, 10], [-8, -3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Character: slide in from right with spring (0.3s–1s)
  const charProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const charX = interpolate(charProgress, [0, 1], [250, 0]);

  // Diagonal accent stripe pulse
  const stripePulse = interpolate(frame, [0, 60, 120], [0.7, 1, 0.7], {
    extrapolateRight: "extend",
  });

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        width: 1920,
        height: 1080,
      }}
    >
      {/* Layer 1: Background image (blurred + zoomed) or gradient fallback */}
      {backgroundImage ? (
        <div
          style={{
            position: "absolute",
            top: -40,
            left: -40,
            right: -40,
            bottom: -40,
            transform: `scale(${bgScale})`,
          }}
        >
          <Img
            src={staticFile(backgroundImage)}
            style={{
              width: "calc(100% + 80px)",
              height: "calc(100% + 80px)",
              objectFit: "cover",
              filter: "blur(12px) brightness(0.4) saturate(1.3)",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 30% 50%, #1a1a4e 0%, #0F172A 50%, #0a0a1a 100%)`,
            transform: `scale(${bgScale})`,
          }}
        />
      )}

      {/* Layer 2: Dark gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.5) 50%, rgba(15,23,42,0.3) 100%)`,
        }}
      />

      {/* Layer 3: Diagonal accent stripe (B站 cover signature element) */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: 200,
          width: 300,
          height: 1600,
          background: `linear-gradient(180deg, ${theme.colors.danger}00, ${theme.colors.danger}40, ${theme.colors.danger}00)`,
          transform: `rotate(-20deg)`,
          opacity: stripePulse * 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -200,
          right: 350,
          width: 100,
          height: 1600,
          background: `linear-gradient(180deg, ${theme.colors.accent}00, ${theme.colors.accent}30, ${theme.colors.accent}00)`,
          transform: `rotate(-20deg)`,
          opacity: stripePulse * 0.4,
        }}
      />

      {/* Layer 4: Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Layer 5: Content — left text + right character */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          padding: theme.sizes.padding,
          zIndex: 1,
        }}
      >
        {/* Left: text content */}
        <div
          style={{
            flex: characterImage ? 0.55 : 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: characterImage ? "flex-start" : "center",
            paddingLeft: 20,
            paddingRight: characterImage ? 40 : 0,
          }}
        >
          {/* Question text with text shadow for depth */}
          <div
            style={{
              opacity: questionOpacity,
              transform: `translateY(${questionY}px)`,
              textAlign: characterImage ? "left" : "center",
              marginBottom: 50,
            }}
          >
            <h1
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: 68,
                color: theme.colors.text,
                fontWeight: 900,
                lineHeight: 1.35,
                margin: 0,
                textShadow: `0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.3)`,
                letterSpacing: "0.02em",
              }}
            >
              {visual.question}
            </h1>
          </div>

          {/* Impact badge */}
          <div
            style={{
              opacity: showImpact ? 1 : 0,
              transform: `scale(${showImpact ? impactScale : 0}) rotate(${impactRotate}deg)`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${theme.colors.danger} 0%, #DC2626 100%)`,
                padding: "18px 44px",
                borderRadius: 16,
                boxShadow: `0 8px 32px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)`,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >
              <h2
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: 76,
                  color: "#ffffff",
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: "0.06em",
                  textShadow: "0 3px 0px rgba(0,0,0,0.25), 0 0 20px rgba(255,255,255,0.1)",
                }}
              >
                {visual.impact_text}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: character image */}
        {characterImage && (
          <div
            style={{
              flex: 0.45,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              height: "100%",
              opacity: charProgress,
              transform: `translateX(${charX}px)`,
            }}
          >
            {/* Character glow effect */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: -30,
                  background: `radial-gradient(ellipse at 50% 80%, ${theme.colors.primaryLight}30 0%, transparent 70%)`,
                  filter: "blur(20px)",
                }}
              />
              <Img
                src={staticFile(characterImage)}
                style={{
                  position: "relative",
                  maxHeight: 880,
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: `drop-shadow(0 12px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${theme.colors.primaryLight}20)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Flash overlay on impact */}
      {frame > 45 && frame < 55 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "white",
            opacity: interpolate(frame, [45, 47, 55], [0, 0.15, 0]),
            pointerEvents: "none",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.colors.danger}, ${theme.colors.accent}, ${theme.colors.primaryLight})`,
          opacity: interpolate(frame, [0, 20], [0, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </div>
  );
};
