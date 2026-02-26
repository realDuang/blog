"""Subtitle generation from narration text.

Splits each scene's narration by punctuation and distributes timing
proportionally across the audio duration. No speech recognition needed —
the original text is used directly for accurate subtitles.

Dialogue scenes use per-line timing data from the TTS layer.
"""

import re

# Punctuation marks that end a subtitle segment
_SPLIT_RE = re.compile(r"(?<=[。！？；，、,!?;])")

# Maximum characters per subtitle line before forced split
_MAX_CHARS = 25


def _split_narration(narration: str) -> list[str]:
    """Split narration text into subtitle-sized chunks.

    First splits at punctuation, then enforces a max-char limit
    by breaking long segments at word boundaries.
    """
    # Split at punctuation
    raw_parts = _SPLIT_RE.split(narration.strip())
    # Filter empty strings
    raw_parts = [p.strip() for p in raw_parts if p.strip()]

    # Enforce max chars per segment
    segments: list[str] = []
    for part in raw_parts:
        while len(part) > _MAX_CHARS:
            # Find a reasonable break point
            cut = _MAX_CHARS
            segments.append(part[:cut])
            part = part[cut:]
        if part:
            segments.append(part)

    return segments


def _generate_dialogue_subtitles(scene: dict, fps: int, speaker_names: dict[str, str] | None = None) -> list[dict]:
    """Generate subtitles for a dialogue scene using per-line data.

    Each dialogue line becomes one or more subtitle segments,
    prefixed with the speaker display name (e.g. [派蒙] or [钟离]).
    Uses line_durations from TTS if available, otherwise distributes
    proportionally by character count.
    """
    lines = scene.get("lines", [])
    frame_count = scene.get("frame_count", 0)
    if not lines or not frame_count:
        return []

    line_durations = scene.get("line_durations", [])
    gap_seconds = 0.3  # Must match the gap in tts.py _concat_wav_files
    names = speaker_names or {}

    subtitles: list[dict] = []

    if line_durations and len(line_durations) == len(lines):
        # Use actual TTS durations for precise timing
        current_time = 0.0
        for i, (line, dur) in enumerate(zip(lines, line_durations)):
            speaker = line.get("speaker", "A")
            display_name = names.get(speaker, speaker)
            text = line.get("text", "")
            if not text.strip():
                continue

            start_frame = int(current_time * fps)
            end_frame = int((current_time + dur) * fps)
            end_frame = min(end_frame, frame_count)

            # Split long lines into subtitle segments
            segments = _split_narration(text)
            total_chars = sum(len(s) for s in segments)

            seg_start = start_frame
            for seg in segments:
                seg_frames = round((end_frame - start_frame) * len(seg) / total_chars) if total_chars > 0 else 0
                subtitles.append({
                    "text": f"[{display_name}] {seg}",
                    "start_frame": seg_start,
                    "end_frame": min(seg_start + seg_frames, frame_count),
                    "speaker": speaker,
                })
                seg_start = seg_start + seg_frames

            current_time += dur + gap_seconds
    else:
        # Fallback: distribute proportionally by character count
        total_chars = sum(len(l.get("text", "")) for l in lines)
        if total_chars == 0:
            return []

        current_frame = 0
        for line in lines:
            speaker = line.get("speaker", "A")
            display_name = names.get(speaker, speaker)
            text = line.get("text", "")
            if not text.strip():
                continue

            line_frames = round(frame_count * len(text) / total_chars)
            segments = _split_narration(text)
            seg_total = sum(len(s) for s in segments) or 1

            for seg in segments:
                seg_frames = round(line_frames * len(seg) / seg_total)
                subtitles.append({
                    "text": f"[{display_name}] {seg}",
                    "start_frame": current_frame,
                    "end_frame": min(current_frame + seg_frames, frame_count),
                    "speaker": speaker,
                })
                current_frame += seg_frames

    return subtitles


def generate_subtitles(timing_data: dict) -> dict:
    """Add subtitle data to each scene in timing_data.

    Uses the narration text directly (no speech recognition).
    Splits by punctuation, then distributes timing proportionally
    based on character count within each scene's frame_count.

    Dialogue scenes use per-line timing for speaker-labeled subtitles.

    Args:
        timing_data: The timing dict (modified in-place and returned).

    Returns:
        The same timing_data dict with `subtitles` added to each scene.
    """
    fps = timing_data.get("fps", 30)
    scenes = timing_data.get("scenes", [])
    speaker_names = timing_data.get("speaker_names")

    if not scenes:
        return timing_data

    total_subs = 0
    for i, scene in enumerate(scenes):
        frame_count = scene.get("frame_count", 0)

        # Dialogue scenes: use per-line subtitle generation
        if scene.get("type") == "dialogue" and scene.get("lines"):
            subtitles = _generate_dialogue_subtitles(scene, fps, speaker_names=speaker_names)
            scene["subtitles"] = subtitles
            total_subs += len(subtitles)
            print(f"    [{i+1}/{len(scenes)}] {scene['id']}: {len(subtitles)} subtitle segments (dialogue)")
            continue

        # Regular scenes: use narration
        narration = scene.get("narration", "")

        if not narration or not frame_count:
            scene["subtitles"] = []
            continue

        segments = _split_narration(narration)
        if not segments:
            scene["subtitles"] = []
            continue

        # Distribute frames proportionally by character count
        total_chars = sum(len(s) for s in segments)
        subtitles: list[dict] = []
        current_frame = 0

        for seg in segments:
            seg_frames = round(frame_count * len(seg) / total_chars)
            start_frame = current_frame
            end_frame = min(current_frame + seg_frames, frame_count)
            subtitles.append({
                "text": seg,
                "start_frame": start_frame,
                "end_frame": end_frame,
            })
            current_frame = end_frame

        scene["subtitles"] = subtitles
        total_subs += len(subtitles)

        print(f"    [{i+1}/{len(scenes)}] {scene['id']}: {len(subtitles)} subtitle segments")

    print(f"  Total: {total_subs} subtitle segments across {len(scenes)} scenes")
    return timing_data
