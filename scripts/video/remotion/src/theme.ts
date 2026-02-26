// Visual theme for video compositions
// Blue palette matching the blog diagram toolkit

export const theme = {
  colors: {
    // Primary blue palette
    primary: "#2563EB",
    primaryLight: "#3B82F6",
    primaryDark: "#1D4ED8",
    primaryBg: "#EFF6FF",

    // Accent
    accent: "#F59E0B",
    accentLight: "#FCD34D",

    // Neutrals
    bg: "#0F172A",         // Dark background for video
    bgCard: "#1E293B",     // Card background
    bgCardLight: "#334155", // Lighter card
    text: "#F8FAFC",       // Primary text (white-ish)
    textSecondary: "#94A3B8", // Secondary text
    textMuted: "#64748B",  // Muted text

    // Semantic
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#06B6D4",

    // Code
    codeBg: "#1A1A2E",
    codeText: "#E2E8F0",
    codeHighlight: "rgba(37, 99, 235, 0.2)",
    codeKeyword: "#C084FC",
    codeString: "#34D399",
    codeComment: "#64748B",
  },

  fonts: {
    // System fonts that work across platforms
    heading: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },

  sizes: {
    // Video dimensions (1080p)
    width: 1920,
    height: 1080,

    // Typography
    titleLarge: 72,
    titleMedium: 56,
    titleSmall: 42,
    bodyLarge: 36,
    body: 32,
    bodySmall: 28,
    caption: 24,
    code: 26,

    // Spacing
    padding: 80,
    paddingSmall: 40,
    gap: 32,
    borderRadius: 16,
  },

  subtitle: {
    fontSize: 36,
    bg: "rgba(0, 0, 0, 0.65)",
    color: "#FFFFFF",
    paddingH: 24,
    paddingV: 12,
    borderRadius: 8,
    bottom: 60,
  },

  animation: {
    fadeInDuration: 15, // frames
    slideDistance: 60,   // pixels
    staggerDelay: 8,    // frames between staggered items
  },
} as const;

export type Theme = typeof theme;
