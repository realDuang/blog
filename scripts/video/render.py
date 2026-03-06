"""Layer 3c: Orchestrator — coordinates TTS + Remotion rendering

Loads scenes.json, generates TTS audio, builds timing/props data,
and invokes Remotion to render the final video.
"""

import asyncio
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

from .tts import run_tts_pipeline, DEFAULT_VOICE
from .tts_providers import DEFAULT_PROVIDER
from .tts_providers.edge import DEFAULT_RATE
from .subtitle import generate_subtitles


def _find_remotion_dir() -> Path:
    """Locate the Remotion sub-project directory."""
    return Path(__file__).parent / "remotion"


def _prepare_audio_for_remotion(timing_data: dict, remotion_dir: Path) -> dict:
    """Copy audio files into remotion/public/ and update paths for staticFile()."""
    public_audio = remotion_dir / "public" / "audio"
    public_audio.mkdir(parents=True, exist_ok=True)

    for scene in timing_data.get("scenes", []):
        audio = scene.get("audio_file")
        if audio:
            src = Path(audio)
            if src.exists():
                dst = public_audio / src.name
                shutil.copy2(src, dst)
                scene["audio_file"] = f"audio/{src.name}"
    return timing_data


def _prepare_assets_for_remotion(
    remotion_dir: Path,
    speaker_avatars: Optional[dict[str, str]] = None,
    hook_character_image: Optional[str] = None,
    hook_background_image: Optional[str] = None,
) -> tuple[Optional[dict[str, str]], Optional[str], Optional[str]]:
    """Copy image assets into remotion/public/assets/ and return relative paths.

    Returns (resolved_avatars, resolved_hook_image, resolved_hook_bg) with paths relative to public/.
    """
    resolved_avatars = None
    resolved_hook = None
    resolved_hook_bg = None

    if speaker_avatars:
        resolved_avatars = {}
        public_avatars = remotion_dir / "public" / "assets" / "avatars"
        public_avatars.mkdir(parents=True, exist_ok=True)
        for speaker, path in speaker_avatars.items():
            src = Path(path)
            if src.exists():
                dst = public_avatars / src.name
                if src.resolve() != dst.resolve():
                    shutil.copy2(src, dst)
                resolved_avatars[speaker] = f"assets/avatars/{src.name}"
                print(f"  Avatar for speaker {speaker}: {src.name}")
            else:
                # Treat as already-relative path (e.g. "assets/avatars/paimon.png")
                resolved_avatars[speaker] = path
                print(f"  Avatar for speaker {speaker}: {path} (relative)")

    if hook_character_image:
        src = Path(hook_character_image)
        if src.exists():
            public_assets = remotion_dir / "public" / "assets" / "avatars"
            public_assets.mkdir(parents=True, exist_ok=True)
            dst = public_assets / src.name
            if src.resolve() != dst.resolve():
                shutil.copy2(src, dst)
            resolved_hook = f"assets/avatars/{src.name}"
            print(f"  Hook character image: {src.name}")
        else:
            resolved_hook = hook_character_image
            print(f"  Hook character image: {hook_character_image} (relative)")

    if hook_background_image:
        src = Path(hook_background_image)
        if src.exists():
            public_backgrounds = remotion_dir / "public" / "assets" / "backgrounds"
            public_backgrounds.mkdir(parents=True, exist_ok=True)
            dst = public_backgrounds / src.name
            if src.resolve() != dst.resolve():
                shutil.copy2(src, dst)
            resolved_hook_bg = f"assets/backgrounds/{src.name}"
            print(f"  Hook background image: {src.name}")
        else:
            resolved_hook_bg = hook_background_image
            print(f"  Hook background image: {hook_background_image} (relative)")

    return resolved_avatars, resolved_hook, resolved_hook_bg


def render_video(
    scenes_path: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE,
    rate: str = DEFAULT_RATE,
    fps: int = 30,
    output_filename: str = "video.mp4",
    provider_name: str = DEFAULT_PROVIDER,
    provider_kwargs: Optional[dict] = None,
    subtitles: bool = True,
    speaker_profiles: Optional[dict] = None,
    speaker_names: Optional[dict[str, str]] = None,
    speaker_avatars: Optional[dict[str, str]] = None,
    hook_character_image: Optional[str] = None,
    hook_background_image: Optional[str] = None,
    video_bitrate: Optional[str] = None,
    scale: Optional[float] = None,
    video_format: Optional[str] = None,
) -> Optional[str]:
    """Full render pipeline: TTS -> subtitles -> timing -> Remotion -> MP4.

    Args:
        scenes_path: path to scenes.json
        output_dir: directory for all output (audio, timing, video)
        voice: TTS voice name (edge-tts only)
        rate: speech rate adjustment (edge-tts only)
        fps: video frames per second
        output_filename: final video filename
        provider_name: TTS provider ("edge", "gpt-sovits")
        provider_kwargs: extra kwargs for the provider constructor
        subtitles: generate subtitles from narration text (default True)
        speaker_profiles: optional speaker profiles for dialogue scenes
        speaker_names: optional display name mapping e.g. {"A": "钟离", "B": "派蒙"}
        speaker_avatars: optional avatar image paths e.g. {"A": "path/to/img.png"}
        hook_character_image: optional character image for bilibili_hook scene
        hook_background_image: optional background image for bilibili_hook scene
        video_bitrate: Remotion video bitrate e.g. "10M" (default: Remotion's default)
        scale: Remotion scale factor e.g. 2.0 for 4K output (default: 1.0)
        video_format: "landscape" (default 16:9) or "portrait" (9:16 vertical)

    Returns:
        path to rendered video file, or None on failure
    """
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)

    remotion_dir = _find_remotion_dir()
    audio_dir = output / "audio"

    # Step 1: Generate TTS audio
    print("=" * 60)
    print("Step 1/4: Generating TTS audio...")
    print("=" * 60)

    timing_data = asyncio.run(
        run_tts_pipeline(
            scenes_path, str(audio_dir), voice, rate, fps,
            provider_name=provider_name,
            provider_kwargs=provider_kwargs,
            speaker_profiles=speaker_profiles,
            speaker_names=speaker_names,
        )
    )

    # Step 2: Generate subtitles
    print()
    print("=" * 60)
    if subtitles:
        print("Step 2/4: Generating subtitles...")
        print("=" * 60)
        timing_data = generate_subtitles(timing_data)
    else:
        print("Step 2/4: Subtitles skipped (--no-subtitles)")
        print("=" * 60)

    # Step 3: Prepare Remotion props
    print()
    print("=" * 60)
    print("Step 3/4: Preparing Remotion props...")
    print("=" * 60)

    # Use absolute paths so Remotion can find audio files regardless of CWD
    remotion_timing = _prepare_audio_for_remotion(
        json.loads(json.dumps(timing_data)),  # deep copy
        remotion_dir,
    )

    # Copy image assets into remotion/public/
    resolved_avatars, resolved_hook, resolved_hook_bg = _prepare_assets_for_remotion(
        remotion_dir, speaker_avatars, hook_character_image, hook_background_image,
    )
    if resolved_avatars:
        remotion_timing["speaker_avatars"] = resolved_avatars
    if resolved_hook:
        remotion_timing["hook_character_image"] = resolved_hook
    if resolved_hook_bg:
        remotion_timing["hook_background_image"] = resolved_hook_bg

    # Set video format (landscape or portrait)
    if video_format:
        remotion_timing["format"] = video_format
        print(f"  Format: {video_format}")

    # Write props.json for Remotion
    props_path = output / "props.json"
    props_path.write_text(
        json.dumps(remotion_timing, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  Props written to: {props_path}")
    print(f"  Total frames: {remotion_timing['total_frames']}")
    print(f"  Total duration: {remotion_timing['total_duration_seconds']}s")
    print(f"  Scenes: {len(remotion_timing['scenes'])}")

    # Step 4: Render with Remotion
    print()
    print("=" * 60)
    print("Step 4/4: Rendering video with Remotion...")
    print("=" * 60)

    # Auto-adjust output filename for portrait format (avoid overwriting landscape)
    if video_format == "portrait" and output_filename == "video.mp4":
        output_filename = "video_portrait.mp4"

    video_path = output / output_filename

    # Build Remotion render command
    # On Windows, use npx.cmd to avoid PATH issues with subprocess
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = [
        npx_cmd, "remotion", "render",
        "src/index.tsx",
        "VideoComposition",
        str(video_path.resolve()),
        "--props", str(props_path.resolve()),
        "--frames", f"0-{remotion_timing['total_frames'] - 1}",
        "--port", "3100",
        "--concurrency", "50%",
    ]

    if video_bitrate:
        cmd.extend(["--video-bitrate", video_bitrate])

    if scale and scale != 1.0:
        cmd.extend(["--scale", str(scale)])

    print(f"  Running: {' '.join(cmd)}")
    print(f"  CWD: {remotion_dir}")

    try:
        result = subprocess.run(
            cmd,
            cwd=str(remotion_dir),
            capture_output=True,
            text=True,
            timeout=2400,  # 40 minute timeout
        )

        if result.returncode == 0:
            print(f"\n  Video rendered: {video_path}")
            print(f"  Size: {video_path.stat().st_size / (1024*1024):.1f} MB")
            return str(video_path)
        else:
            print(f"\n  Remotion render failed (exit code {result.returncode})")
            print(f"  stdout: {result.stdout[-500:]}" if result.stdout else "")
            print(f"  stderr: {result.stderr[-500:]}" if result.stderr else "")
            return None

    except subprocess.TimeoutExpired:
        print("\n  Remotion render timed out after 40 minutes")
        return None
    except FileNotFoundError:
        print("\n  Error: 'npx' not found. Ensure Node.js is installed.")
        return None


def render_tts_only(
    scenes_path: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE,
    rate: str = DEFAULT_RATE,
    fps: int = 30,
    provider_name: str = DEFAULT_PROVIDER,
    provider_kwargs: Optional[dict] = None,
    subtitles: bool = True,
    speaker_profiles: Optional[dict] = None,
    speaker_names: Optional[dict[str, str]] = None,
) -> dict:
    """Run only the TTS step — useful for testing audio without video render."""
    audio_dir = Path(output_dir) / "audio"
    timing_data = asyncio.run(
        run_tts_pipeline(
            scenes_path, str(audio_dir), voice, rate, fps,
            provider_name=provider_name,
            provider_kwargs=provider_kwargs,
            speaker_profiles=speaker_profiles,
            speaker_names=speaker_names,
        )
    )
    if subtitles:
        timing_data = generate_subtitles(timing_data)
    return timing_data


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Layer 3c: Render Orchestrator")
    parser.add_argument("--scenes", required=True, help="Path to scenes.json")
    parser.add_argument("--output", required=True, help="Output directory")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="TTS voice")
    parser.add_argument("--rate", default=DEFAULT_RATE, help="Speech rate")
    parser.add_argument("--fps", type=int, default=30, help="Video FPS")
    parser.add_argument("--tts-only", action="store_true",
                        help="Only generate TTS audio, skip video render")
    args = parser.parse_args()

    if args.tts_only:
        render_tts_only(args.scenes, args.output, args.voice, args.rate, args.fps)
    else:
        render_video(args.scenes, args.output, args.voice, args.rate, args.fps)
