"""Layer 3a: TTS — Text-to-Speech with pluggable provider backends

Generates per-scene audio files and collects timing data.
Supports multiple TTS engines via the tts_providers package.
Dialogue scenes generate per-line audio and concatenate them.
"""

import asyncio
import json
import wave
import struct
from pathlib import Path
from typing import Optional

from .tts_providers import get_provider, DEFAULT_PROVIDER, TTSProvider
from .tts_providers.edge import DEFAULT_VOICE, DEFAULT_RATE

# Re-export for backwards compat with render.py / cli.py
__all__ = ["DEFAULT_VOICE", "run_tts_pipeline", "render_tts_only"]


def _concat_wav_files(wav_paths: list[str], output_path: str, gap_seconds: float = 0.3) -> float:
    """Concatenate multiple WAV files with a short silence gap between them.

    Returns the total duration in seconds.
    """
    if not wav_paths:
        return 0.0

    # Read the first file to get format parameters
    with wave.open(wav_paths[0], "rb") as first:
        params = first.getparams()
        nchannels = params.nchannels
        sampwidth = params.sampwidth
        framerate = params.framerate

    # Calculate gap frames
    gap_frames = int(framerate * gap_seconds)
    silence = b"\x00" * (gap_frames * nchannels * sampwidth)

    total_frames = 0
    with wave.open(output_path, "wb") as out:
        out.setnchannels(nchannels)
        out.setsampwidth(sampwidth)
        out.setframerate(framerate)

        for i, path in enumerate(wav_paths):
            with wave.open(path, "rb") as wf:
                # Verify compatible format
                if wf.getframerate() != framerate or wf.getnchannels() != nchannels:
                    raise ValueError(
                        f"WAV format mismatch: {path} has {wf.getframerate()}Hz/{wf.getnchannels()}ch, "
                        f"expected {framerate}Hz/{nchannels}ch"
                    )
                data = wf.readframes(wf.getnframes())
                out.writeframes(data)
                total_frames += wf.getnframes()

            # Add silence gap between lines (not after the last one)
            if i < len(wav_paths) - 1:
                out.writeframes(silence)
                total_frames += gap_frames

    return round(total_frames / framerate, 2) if framerate > 0 else 0.0


async def _generate_scene_audio(
    provider: TTSProvider,
    scene_id: str,
    text: str,
    output_dir: Path,
) -> dict:
    """Generate TTS audio for a single scene using the given provider."""
    ext = provider.get_audio_extension()
    output_path = output_dir / f"{scene_id}.{ext}"

    result = await provider.generate(text, output_path)

    return {
        "scene_id": scene_id,
        "audio_file": result["audio_file"],
        "duration_seconds": result["duration_seconds"],
        "char_count": len(text),
    }


async def _generate_dialogue_audio(
    provider: TTSProvider,
    scene_id: str,
    lines: list[dict],
    output_dir: Path,
) -> dict:
    """Generate TTS audio for a dialogue scene with multiple speakers.

    Generates each line separately (switching speakers if the provider supports it),
    then concatenates all line audio files into a single scene audio.

    Returns timing info including per-line durations for subtitle generation.
    """
    from .tts_providers.gpt_sovits import GPTSoVITSProvider

    ext = provider.get_audio_extension()
    line_dir = output_dir / f"{scene_id}_lines"
    line_dir.mkdir(parents=True, exist_ok=True)

    line_audio_paths: list[str] = []
    line_durations: list[float] = []
    total_chars = 0

    for i, line in enumerate(lines):
        speaker = line.get("speaker", "A")
        text = line.get("text", "")
        if not text.strip():
            continue

        # Switch speaker if provider supports it
        if isinstance(provider, GPTSoVITSProvider) and provider._speaker_profiles:
            provider.switch_speaker(speaker)

        line_path = line_dir / f"line_{i:03d}_{speaker}.{ext}"
        result = await provider.generate(text, line_path)

        # Cooldown between dialogue lines to prevent GPT-SoVITS sentence swallowing
        if i < len(lines) - 1:
            await asyncio.sleep(0.3)

        line_audio_paths.append(result["audio_file"])
        line_durations.append(result["duration_seconds"])
        total_chars += len(text)

    # Concatenate all line audio into a single scene file
    scene_audio_path = str(output_dir / f"{scene_id}.{ext}")
    if line_audio_paths:
        total_duration = _concat_wav_files(line_audio_paths, scene_audio_path, gap_seconds=0.3)
    else:
        total_duration = 3.0

    return {
        "scene_id": scene_id,
        "audio_file": scene_audio_path if line_audio_paths else None,
        "duration_seconds": total_duration,
        "char_count": total_chars,
        "line_durations": line_durations,  # For subtitle timing
    }


async def generate_all_audio(
    scenes_data: dict,
    output_dir: str,
    provider: TTSProvider,
    concurrency: int = 5,
) -> list[dict]:
    """Generate TTS audio for all scenes concurrently.

    Args:
        scenes_data: parsed scenes.json dict
        output_dir: directory to write audio files
        provider: a TTSProvider instance
        concurrency: max concurrent TTS requests
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    scenes = scenes_data.get("scenes", [])
    semaphore = asyncio.Semaphore(concurrency)

    async def limited_generate(scene):
        async with semaphore:
            # Dialogue scenes: generate per-line audio with speaker switching
            if scene.get("type") == "dialogue" and scene.get("lines"):
                return await _generate_dialogue_audio(
                    provider, scene["id"], scene["lines"], out_path
                )

            # Regular scenes: use narration text
            narration = scene.get("narration", "")
            if not narration.strip():
                return {
                    "scene_id": scene["id"],
                    "audio_file": None,
                    "duration_seconds": 3.0,
                    "char_count": 0,
                }
            return await _generate_scene_audio(
                provider, scene["id"], narration, out_path
            )

    # For GPT-SoVITS with multiple API instances, distribute scenes
    # across instances for true parallel generation.
    is_local_tts = provider.name == "gpt-sovits"
    if is_local_tts:
        # Warm-up delay: GPT-SoVITS cold start can swallow the first sentence
        await asyncio.sleep(0.8)

        extra_providers = getattr(provider, "_extra_instances", [])

        if extra_providers:
            # Parallel: round-robin scenes across all instances
            all_providers = [provider] + extra_providers
            n = len(all_providers)
            print(f"  Parallel TTS: {n} instances")

            # Group scenes by instance index
            groups: list[list[tuple[int, dict]]] = [[] for _ in range(n)]
            for i, scene in enumerate(scenes):
                groups[i % n].append((i, scene))

            async def run_group(prov, group):
                """Generate scenes assigned to one provider, sequentially."""
                group_results = []
                for idx, scene in group:
                    if scene.get("type") == "dialogue" and scene.get("lines"):
                        result = await _generate_dialogue_audio(
                            prov, scene["id"], scene["lines"], out_path
                        )
                    else:
                        narration = scene.get("narration", "")
                        if not narration.strip():
                            result = {
                                "scene_id": scene["id"],
                                "audio_file": None,
                                "duration_seconds": 3.0,
                                "char_count": 0,
                            }
                        else:
                            result = await _generate_scene_audio(
                                prov, scene["id"], narration, out_path
                            )
                    group_results.append((idx, result))
                return group_results

            # Run all groups concurrently
            group_tasks = [run_group(p, g) for p, g in zip(all_providers, groups)]
            group_results = await asyncio.gather(*group_tasks)

            # Merge and sort by original index
            all_indexed = []
            for gr in group_results:
                all_indexed.extend(gr)
            all_indexed.sort(key=lambda x: x[0])
            return [r for _, r in all_indexed]
        else:
            # Single instance: sequential with cooldown between scenes.
            # GPT-SoVITS can swallow/truncate sentences when requests fire
            # too quickly due to model state leakage between inferences.
            results = []
            for i, scene in enumerate(scenes):
                result = await limited_generate(scene)
                results.append(result)
                # Cooldown between scenes to prevent sentence swallowing
                if i < len(scenes) - 1:
                    await asyncio.sleep(0.5)
            return results

    tasks = [limited_generate(scene) for scene in scenes]
    results = await asyncio.gather(*tasks)
    return list(results)


def generate_timing_data(
    scenes_data: dict,
    audio_results: list[dict],
    fps: int = 30,
    speaker_names: dict[str, str] | None = None,
) -> dict:
    """Combine scenes with audio timing data for Remotion rendering."""
    audio_lookup = {r["scene_id"]: r for r in audio_results}

    scenes_with_timing = []
    total_frames = 0

    # Audio offset: visual appears immediately, audio starts slightly later
    # to prevent perceived "swallowing" at the start of each scene.
    audio_offset_frames = int(0.3 * fps)

    for scene in scenes_data.get("scenes", []):
        audio = audio_lookup.get(scene["id"], {})
        duration = audio.get("duration_seconds", scene.get("duration_hint", 5))
        # Buffer: 0.3s front pad (audio offset) + 0.5s end pad
        duration_with_buffer = duration + 0.8
        frames = int(duration_with_buffer * fps)

        scenes_with_timing.append({
            **scene,
            "audio_file": audio.get("audio_file"),
            "duration_seconds": duration,
            "audio_start_offset_frames": audio_offset_frames,
            "frame_count": frames,
            "start_frame": total_frames,
            # Pass through per-line durations for dialogue subtitle timing
            **({"line_durations": audio["line_durations"]} if "line_durations" in audio else {}),
        })
        total_frames += frames

    result = {
        "title": scenes_data.get("title", ""),
        "fps": fps,
        "total_frames": total_frames,
        "total_duration_seconds": round(total_frames / fps, 2),
        "scenes": scenes_with_timing,
    }
    if speaker_names:
        result["speaker_names"] = speaker_names
    return result


async def run_tts_pipeline(
    scenes_path: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE,
    rate: str = DEFAULT_RATE,
    fps: int = 30,
    provider_name: str = DEFAULT_PROVIDER,
    provider_kwargs: Optional[dict] = None,
    speaker_profiles: Optional[dict] = None,
    speaker_names: Optional[dict[str, str]] = None,
) -> dict:
    """Full TTS pipeline: load scenes -> generate audio -> produce timing data.

    Args:
        scenes_path: path to scenes.json
        output_dir: directory for audio output
        voice: voice name (edge-tts specific, ignored by other providers)
        rate: speech rate (edge-tts specific, ignored by other providers)
        fps: video frames per second
        provider_name: which TTS backend to use ("edge", "gpt-sovits")
        provider_kwargs: extra kwargs passed to the provider constructor
        speaker_profiles: optional dict mapping speaker names to profiles
            e.g. {"A": {"gpt_weights": "...", "sovits_weights": "...",
                        "ref_audio_path": "...", "prompt_text": "..."},
                   "B": {...}}
        speaker_names: optional dict mapping speaker IDs to display names
            e.g. {"A": "钟离", "B": "派蒙"}

    Returns:
        timing/props dict (also saved to output_dir/timing.json)
    """
    scenes_data = json.loads(
        Path(scenes_path).read_text(encoding="utf-8")
    )

    # Build provider instance
    kwargs = dict(provider_kwargs or {})
    if provider_name == "edge":
        kwargs.setdefault("voice", voice)
        kwargs.setdefault("rate", rate)
    provider = get_provider(provider_name, **kwargs)

    # Register speaker profiles for dialogue scenes
    if speaker_profiles and provider_name == "gpt-sovits":
        from .tts_providers.gpt_sovits import GPTSoVITSProvider
        if isinstance(provider, GPTSoVITSProvider):
            for speaker_name, profile in speaker_profiles.items():
                provider.register_speaker(speaker_name, profile)

    # Create extra GPT-SoVITS instances for parallel generation
    if provider_name == "gpt-sovits":
        from .tts_providers.gpt_sovits import GPTSoVITSProvider
        extra_urls = kwargs.pop("extra_api_urls", [])
        if extra_urls and isinstance(provider, GPTSoVITSProvider):
            extra_instances = []
            for url in extra_urls:
                extra_kwargs = dict(kwargs)
                extra_kwargs["api_url"] = url
                extra_prov = GPTSoVITSProvider(**extra_kwargs)
                # Register same speaker profiles on extra instances
                if speaker_profiles:
                    for speaker_name, profile in speaker_profiles.items():
                        extra_prov.register_speaker(speaker_name, profile)
                extra_instances.append(extra_prov)
            provider._extra_instances = extra_instances
            print(f"  Extra TTS instances: {extra_urls}")

    print(f"Generating TTS for {len(scenes_data['scenes'])} scenes...")
    print(f"  Provider: {provider.name}")
    if provider_name == "edge":
        print(f"  Voice: {kwargs.get('voice', voice)}")
        print(f"  Rate: {kwargs.get('rate', rate)}")
    print(f"  Output: {output_dir}")

    # GPT-SoVITS is single-threaded inference, no benefit from concurrency
    concurrency = 1 if provider_name == "gpt-sovits" else 5

    audio_results = await generate_all_audio(
        scenes_data, output_dir, provider, concurrency
    )

    # Report stats
    total_chars = sum(r["char_count"] for r in audio_results)
    total_duration = sum(r["duration_seconds"] for r in audio_results)
    print(f"  Total narration: {total_chars} chars")
    print(f"  Total audio duration: {total_duration:.1f}s ({total_duration/60:.1f}min)")

    timing = generate_timing_data(scenes_data, audio_results, fps, speaker_names=speaker_names)

    # Save timing data
    timing_path = Path(output_dir) / "timing.json"
    timing_path.write_text(
        json.dumps(timing, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  Timing data: {timing_path}")

    return timing


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Layer 3a: TTS Generator")
    parser.add_argument("--scenes", required=True, help="Path to scenes.json")
    parser.add_argument("--output", required=True, help="Output directory for audio")
    parser.add_argument("--provider", default=DEFAULT_PROVIDER,
                        choices=["edge", "gpt-sovits"],
                        help=f"TTS provider (default: {DEFAULT_PROVIDER})")
    parser.add_argument("--voice", default=DEFAULT_VOICE,
                        help=f"TTS voice — edge only (default: {DEFAULT_VOICE})")
    parser.add_argument("--rate", default=DEFAULT_RATE,
                        help=f"Speech rate — edge only (default: {DEFAULT_RATE})")
    parser.add_argument("--ref-audio", default="",
                        help="Reference audio path — gpt-sovits only")
    parser.add_argument("--prompt-text", default="",
                        help="Reference audio transcript — gpt-sovits only")
    parser.add_argument("--speed", type=float, default=1.2,
                        help="Speed factor — gpt-sovits only (default: 1.2)")
    parser.add_argument("--fps", type=int, default=30, help="Video FPS")
    args = parser.parse_args()

    prov_kwargs = {}
    if args.provider == "gpt-sovits":
        prov_kwargs = {
            "ref_audio_path": args.ref_audio,
            "prompt_text": args.prompt_text,
            "speed_factor": args.speed,
        }

    asyncio.run(run_tts_pipeline(
        args.scenes, args.output,
        voice=args.voice, rate=args.rate, fps=args.fps,
        provider_name=args.provider, provider_kwargs=prov_kwargs,
    ))
