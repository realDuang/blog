// Visual theme for video compositions
// Blue palette matching the blog diagram toolkit

export type VideoFormat = "landscape" | "portrait";

const colors = {
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
  bgTranslucent: "rgba(15, 23, 42, 0.82)", // Semi-transparent bg for portrait overlay
  bgCard: "#1E293B",     // Card background
  bgCardTranslucent: "rgba(30, 41, 59, 0.85)", // Semi-transparent card for portrait
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
} as const;

const fonts = {
  // System fonts that work across platforms
  heading: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
} as const;

const animation = {
  fadeInDuration: 15, // frames
  slideDistance: 60,   // pixels
  staggerDelay: 8,    // frames between staggered items
} as const;

const landscapeSizes = {
  width: 1920,
  height: 1080,
  titleLarge: 72,
  titleMedium: 56,
  titleSmall: 42,
  bodyLarge: 36,
  body: 32,
  bodySmall: 28,
  caption: 24,
  code: 26,
  padding: 80,
  paddingSmall: 40,
  gap: 32,
  borderRadius: 16,
} as const;

const portraitSizes = {
  width: 1080,
  height: 1920,
  titleLarge: 56,
  titleMedium: 44,
  titleSmall: 36,
  bodyLarge: 32,
  body: 28,
  bodySmall: 24,
  caption: 20,
  code: 22,
  padding: 64,
  paddingSmall: 32,
  gap: 24,
  borderRadius: 14,
} as const;

const landscapeSubtitle = {
  fontSize: 36,
  bg: "rgba(0, 0, 0, 0.65)",
  color: "#FFFFFF",
  paddingH: 24,
  paddingV: 12,
  borderRadius: 8,
  bottom: 60,
  maxWidth: 1600,
} as const;

const portraitSubtitle = {
  fontSize: 34,
  bg: "rgba(0, 0, 0, 0.65)",
  color: "#FFFFFF",
  paddingH: 22,
  paddingV: 11,
  borderRadius: 8,
  bottom: 160,
  maxWidth: 960,
} as const;

export function getTheme(format: VideoFormat = "landscape") {
  const isPortrait = format === "portrait";
  // In portrait mode, use translucent backgrounds so the global background image shows through
  const portraitColors = {
    ...colors,
    bg: colors.bgTranslucent,
    bgCard: colors.bgCardTranslucent,
    codeBg: "rgba(26, 26, 46, 0.85)",
    textSecondary: "#CBD5E1",  // Brighter secondary text for portrait translucent bg
    textMuted: "#94A3B8",      // Brighter muted text for portrait
  };
  return {
    format,
    colors: isPortrait ? portraitColors : colors,
    fonts,
    sizes: isPortrait ? portraitSizes : landscapeSizes,
    subtitle: isPortrait ? portraitSubtitle : landscapeSubtitle,
    animation,
  };
}

// Default theme for backward compatibility (landscape)
export const theme = getTheme("landscape");

export type Theme = ReturnType<typeof getTheme>;
