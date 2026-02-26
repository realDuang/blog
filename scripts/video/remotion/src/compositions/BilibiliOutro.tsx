import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BilibiliOutroVisual } from "../types";

interface BilibiliOutroProps {
  visual: BilibiliOutroVisual;
}

// Bilibili-style action icons as inline SVG components
// These closely match the official bilibili video action button designs

const ThumbsUpIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none">
    <path
      d="M9 18.5v10.4h4.5V18.5H9zm19.5-1.2c0-1.2-1-2.3-2.3-2.3h-7l1.1-5.1.03-.4c0-.5-.2-.9-.5-1.2l-1.2-1.2-7.4 7.4c-.4.4-.6.9-.6 1.5v10.4c0 1.2 1 2.3 2.3 2.3h10.1c.9 0 1.7-.5 2.1-1.3l3.4-8c.1-.3.2-.6.2-.9v-2.2l-.01.01-.01-.95z"
      fill={color}
    />
  </svg>
);

const CoinIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none">
    <circle cx="18" cy="18" r="12" stroke={color} strokeWidth="2.5" fill="none" />
    <text
      x="18"
      y="23"
      textAnchor="middle"
      fontSize="15"
      fontWeight="bold"
      fontFamily="serif"
      fill={color}
    >
      币
    </text>
  </svg>
);

const StarIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none">
    <path
      d="M18 6l3.7 7.5L30 14.8l-6 5.8 1.4 8.4L18 25l-7.4 4 1.4-8.4-6-5.8 8.3-1.3z"
      fill={color}
    />
  </svg>
);

const FollowIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none">
    <circle cx="15" cy="12" r="5" fill={color} />
    <path
      d="M7 27c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <line x1="27" y1="14" x2="27" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="23" y1="18" x2="31" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Map element name to its icon component, color, and label
const ACTION_CONFIG: Record<
  string,
  { Icon: React.FC<{ size: number; color: string }>; color: string }
> = {
  点赞: { Icon: ThumbsUpIcon, color: "#F97583" },
  投币: { Icon: CoinIcon, color: "#FDBC4B" },
  收藏: { Icon: StarIcon, color: "#FDBC4B" },
  关注: { Icon: FollowIcon, color: "#23ADE5" },
};

// Fallback lookup for partial matches
function getActionConfig(element: string) {
  if (ACTION_CONFIG[element]) return ACTION_CONFIG[element];
  if (element.includes("赞") || element.includes("like"))
    return ACTION_CONFIG["点赞"];
  if (element.includes("币") || element.includes("coin"))
    return ACTION_CONFIG["投币"];
  if (element.includes("藏") || element.includes("fav"))
    return ACTION_CONFIG["收藏"];
  if (element.includes("注") || element.includes("sub"))
    return ACTION_CONFIG["关注"];
  return { Icon: StarIcon, color: theme.colors.primaryLight };
}

export const BilibiliOutro: React.FC<BilibiliOutroProps> = ({ visual }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgCard,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: theme.sizes.padding,
        color: theme.colors.text,
      }}
    >
      <h1
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: theme.sizes.titleLarge,
          fontWeight: "bold",
          marginBottom: 80,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        感谢观看！
      </h1>

      <div style={{ display: "flex", gap: 80 }}>
        {visual.elements.map((element, i) => {
          const delay = 15 + i * 10;
          const scale = spring({
            frame: frame - delay,
            fps,
            config: {
              damping: 12,
              stiffness: 100,
            },
          });

          const { Icon, color } = getActionConfig(element);

          // Glow pulse animation after pop-in
          const glowPhase = Math.max(0, frame - delay - 15);
          const glowOpacity =
            glowPhase > 0
              ? 0.3 + 0.15 * Math.sin(glowPhase * 0.15)
              : 0;

          return (
            <div
              key={element}
              style={{
                transform: `scale(${scale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* Icon circle with glow */}
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 65,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: `3px solid ${color}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: `0 0 ${20 + glowPhase * 0.3}px ${color}${Math.round(
                    glowOpacity * 255
                  )
                    .toString(16)
                    .padStart(2, "0")}`,
                  position: "relative",
                }}
              >
                <Icon size={64} color={color} />
              </div>
              <span
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.sizes.bodyLarge,
                  fontWeight: "bold",
                  color,
                  opacity: scale > 0.5 ? 1 : 0,
                }}
              >
                {element}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
