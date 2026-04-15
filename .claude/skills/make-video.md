# Make Video

Blog-to-video rendering pipeline: article segments → scenes.json → TTS audio → subtitles → Remotion → MP4.

---

## Architecture

```
scripts/video/
  cli.py             → CLI entry (render / tts / validate subcommands)
  adapter.py         → scenes.json validation
  tts.py             → TTS orchestrator (generate audio → timing data)
  subtitle.py        → Subtitle generation from narration/dialogue text
  render.py          → Full pipeline orchestrator (TTS → subtitles → Remotion)
  tts_providers/
    gpt_sovits.py    → GPT-SoVITS provider (local voice cloning)
    edge.py          → Edge TTS provider (cloud)
  remotion/src/
    Root.tsx          → Remotion composition router
    compositions/    → Scene type components (BilibiliHook, Dialogue, etc.)
    types.ts         → TypeScript type definitions
  presets/           → LLM prompt presets for scenes.json generation
  output/            → Rendered output (gitignored)
```

---

## Key Learnings & Gotchas

### GPT-SoVITS TTS

- **Sentence swallowing**: GPT-SoVITS can swallow/truncate sentences when requests are fired too quickly in succession. Root cause is model state leakage between inferences. Fix: enforce sequential generation with 0.5s cooldown between scenes and 0.3s between dialogue lines.
- **text_split_method**: Use `cut3` (split by `。`) for best results. `cut2` swallows more sentences.
- **Sampling params**: Conservative defaults reduce unwanted emotion artifacts: `temperature=0.6, top_k=10, top_p=0.8, repetition_penalty=1.35`.
- **Speaker switching**: When switching speakers in dialogue mode, both GPT and SoVITS weights must be reloaded via API. Skip reload if same speaker as previous line.

### Video Timing

- **No black screen at start**: Never use a global intro delay that shifts `start_frame` away from 0. The visual must appear at frame 0. Audio delay is handled per-scene via `audio_start_offset_frames` (0.3s) — visual appears first, voice follows.
- **Buffer per scene**: Each scene gets 0.8s extra (0.3s front pad for audio offset + 0.5s end pad for breathing room).

### Scene Script Quality

- Avoid multiple "最后" transitions — each gives a false sense of ending.
- Ending phrases ("一键三连/下期再见") must appear exactly once, only in the `bilibili_outro` scene.
- `bilibili_hook` should open with a universally relatable pain point, not assume prior context.
- Watch for content duplication between adjacent scenes (especially chapter_title → comparison pairs).

### Dialogue Mode

- Scene type `dialogue` uses `lines: [{speaker, text}]` instead of `narration`.
- TTS generates per-line audio with speaker switching, then concatenates with 0.3s silence gaps.
- Subtitle timing uses `line_durations` from TTS for frame-accurate positioning.
- Speaker profiles are passed via CLI args (`--speaker-b-*`) and registered on the GPT-SoVITS provider.
- **Per-speaker speed**: Each speaker profile supports `speed_factor` (e.g., slower voice at 1.0 vs default 1.2). Set via `--speaker-b-speed`.
- **Speaker names**: Use `--speaker-a-name` / `--speaker-b-name` to replace A/B labels with character names throughout the pipeline (subtitles, dialogue bubbles, avatars).

### Remotion Rendering

- **Long video OOM**: Videos over ~5 minutes (9000+ frames) crash Remotion with default concurrency. Use `--concurrency 1` in the Remotion render command to prevent OOM.
- **Subprocess timeout**: Default 600s is insufficient for long videos. Currently set to 2400s (40 min).
- **Audio copy to public/**: `render.py` copies audio from `output/audio/` to `remotion/public/audio/` because Remotion's `staticFile()` requires files in the `public/` directory. Both directories are gitignored.
