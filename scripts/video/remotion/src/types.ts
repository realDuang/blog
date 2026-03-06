// TypeScript types for the video pipeline data contracts

/** Scene types supported by the renderer */
export type SceneType =
  | "chapter_title"
  | "text_card"
  | "image"
  | "code"
  | "comparison"
  | "data_reveal"
  | "summary"
  | "bilibili_hook"
  | "bilibili_outro"
  | "dialogue";

/** Visual data varies by scene type */
export interface BilibiliHookVisual {
  question: string;
  impact_text: string;
}

export interface BilibiliOutroVisual {
  elements: string[];
}

export interface ChapterTitleVisual {
  title: string;
  subtitle?: string;
}

export interface TextCardVisual {
  bullets: string[];
  highlight_index?: number;
}

export interface ImageVisual {
  image_url: string;
  caption?: string;
}

export interface CodeVisual {
  code: string;
  language: string;
  highlight_lines?: number[];
}

export interface ComparisonVisual {
  left: { label: string; points: string[] };
  right: { label: string; points: string[] };
}

export interface DataRevealVisual {
  number: string;
  unit?: string;
  context?: string;
}

export interface SummaryVisual {
  title?: string;
  points: string[];
}

export interface DialogueVisual {
  topic: string;
}

/** A single line of dialogue from a speaker */
export interface DialogueLine {
  speaker: string;
  text: string;
}

export type SceneVisual =
  | ChapterTitleVisual
  | TextCardVisual
  | ImageVisual
  | CodeVisual
  | ComparisonVisual
  | DataRevealVisual
  | SummaryVisual
  | BilibiliHookVisual
  | BilibiliOutroVisual
  | DialogueVisual;

/** A subtitle segment with frame-level timing */
export interface SubtitleSegment {
  text: string;
  start_frame: number;
  end_frame: number;
  speaker?: string;
}

/** A single scene in the video */
export interface Scene {
  id: string;
  type: SceneType;
  narration: string;
  lines?: DialogueLine[];
  visual: SceneVisual;
  duration_hint?: number;
  source_segments?: string[];
  // Added by timing layer
  audio_file?: string | null;
  duration_seconds?: number;
  frame_count?: number;
  start_frame?: number;
  audio_start_offset_frames?: number;
  subtitles?: SubtitleSegment[];
  line_durations?: number[];
}

/** Props passed to the Remotion composition */
export interface VideoProps {
  title: string;
  fps: number;
  total_frames: number;
  total_duration_seconds: number;
  scenes: Scene[];
  speaker_names?: Record<string, string>;
  speaker_avatars?: Record<string, string>;
  hook_character_image?: string;
  hook_background_image?: string;
  format?: "landscape" | "portrait";
}
