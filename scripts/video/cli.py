"""Blog Article to Video Pipeline — CLI entry point

Usage:
    # Full pipeline with edge-tts (default, faster speech)
    python scripts/video/cli.py full \\
        --input blogs/financial-analysis/2026-02-22.md \\
        --preset bilibili \\
        --output scripts/video/output/

    # Use GPT-SoVITS for voice cloning
    python scripts/video/cli.py render \\
        --output scripts/video/output/ \\
        --provider gpt-sovits \\
        --ref-audio /path/to/reference.wav \\
        --prompt-text "参考音频的文字内容"

Pipeline steps:
    1. parse:  Markdown → segments.json
    2. adapt:  segments.json → (LLM prompt → ) scenes.json
    3. tts:    scenes.json → per-scene audio files
    4. render: scenes.json + audio → MP4 video
"""

import argparse
import json
import sys
from pathlib import Path

# Ensure the parent package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.video.parser import parse_to_file
from scripts.video.adapter import adapt, validate_scenes, build_prompt
from scripts.video.render import render_video, render_tts_only
from scripts.video.tts import DEFAULT_VOICE
from scripts.video.tts_providers import DEFAULT_PROVIDER
from scripts.video.tts_providers.edge import DEFAULT_RATE


def _build_provider_kwargs(args) -> dict:
    """Extract provider-specific kwargs from parsed CLI args."""
    provider = getattr(args, "provider", DEFAULT_PROVIDER)
    if provider == "gpt-sovits":
        kwargs = {
            "speed_factor": getattr(args, "speed", 1.2),
            "temperature": getattr(args, "temperature", 0.6),
            "top_k": getattr(args, "top_k", 10),
            "top_p": getattr(args, "top_p", 0.8),
            "seed": getattr(args, "seed", -1),
            "text_split_method": getattr(args, "text_split_method", "cut3"),
        }
        ref = getattr(args, "ref_audio", "")
        if ref:
            kwargs["ref_audio_path"] = ref
        prompt = getattr(args, "prompt_text", "")
        if prompt:
            kwargs["prompt_text"] = prompt
        api_url = getattr(args, "api_url", "")
        if api_url:
            kwargs["api_url"] = api_url
        gpt_w = getattr(args, "gpt_weights", "")
        if gpt_w:
            kwargs["gpt_weights"] = gpt_w
        sovits_w = getattr(args, "sovits_weights", "")
        if sovits_w:
            kwargs["sovits_weights"] = sovits_w
        extra_urls = getattr(args, "extra_api_urls", [])
        if extra_urls:
            kwargs["extra_api_urls"] = extra_urls
        return kwargs
    return {}


def _build_speaker_profiles(args) -> dict | None:
    """Build speaker profiles dict from CLI args for dialogue scenes.

    Returns None if no speaker B config is provided.
    Speaker A uses the default --ref-audio / --gpt-weights / --sovits-weights.
    Speaker B uses --speaker-b-* variants.
    """
    provider = getattr(args, "provider", DEFAULT_PROVIDER)
    if provider != "gpt-sovits":
        return None

    b_ref = getattr(args, "speaker_b_ref_audio", "")
    if not b_ref:
        return None  # No second speaker configured

    profiles = {}

    # Speaker A profile — uses the primary CLI args
    a_ref = getattr(args, "ref_audio", "")
    if a_ref:
        profiles["A"] = {
            "gpt_weights": getattr(args, "gpt_weights", ""),
            "sovits_weights": getattr(args, "sovits_weights", ""),
            "ref_audio_path": a_ref,
            "prompt_text": getattr(args, "prompt_text", ""),
            "name": getattr(args, "speaker_a_name", "") or "A",
        }

    # Speaker B profile
    b_speed = getattr(args, "speaker_b_speed", 0)
    profiles["B"] = {
        "gpt_weights": getattr(args, "speaker_b_gpt_weights", ""),
        "sovits_weights": getattr(args, "speaker_b_sovits_weights", ""),
        "ref_audio_path": b_ref,
        "prompt_text": getattr(args, "speaker_b_prompt_text", ""),
        "name": getattr(args, "speaker_b_name", "") or "B",
    }
    if b_speed > 0:
        profiles["B"]["speed_factor"] = b_speed

    return profiles


def cmd_parse(args):
    """Step 1: Parse markdown to segments.json."""
    output = Path(args.output) / "segments.json"
    result = parse_to_file(args.input, str(output))
    print(f"Parsed {len(result['segments'])} segments from '{result['title']}'")
    print(f"Output: {output}")


def cmd_adapt(args):
    """Step 2: Generate LLM adaptation prompt or validate scenes.json."""
    segments_path = Path(args.output) / "segments.json"
    scenes_path = Path(args.output) / "scenes.json"

    if not segments_path.exists():
        print(f"Error: {segments_path} not found. Run 'parse' step first.")
        sys.exit(1)

    if scenes_path.exists() and not args.force:
        # Validate existing scenes.json
        scenes_data = json.loads(scenes_path.read_text(encoding="utf-8"))
        errors = validate_scenes(scenes_data)
        if errors:
            print("Validation errors in scenes.json:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
        else:
            print(f"scenes.json is valid: {len(scenes_data['scenes'])} scenes")
            return

    # Generate LLM prompt
    prompt = adapt(str(segments_path), args.preset)
    if prompt:
        prompt_path = Path(args.output) / "adapt_prompt.md"
        prompt_path.write_text(prompt, encoding="utf-8")
        print(f"Adaptation prompt written to: {prompt_path}")
        print(f"Prompt length: {len(prompt)} chars")
        print()
        print("Next step: Feed this prompt to an AI agent (Claude Code / Copilot)")
        print(f"and save the output as: {scenes_path}")
        print()
        print("Or run with --print-prompt to output directly to stdout.")


def _build_speaker_names(args) -> dict[str, str] | None:
    """Build speaker display name mapping from CLI args.

    Returns None if no names are configured.
    Returns e.g. {"A": "钟离", "B": "派蒙"}.
    """
    a_name = getattr(args, "speaker_a_name", "")
    b_name = getattr(args, "speaker_b_name", "")
    if not a_name and not b_name:
        return None
    names = {}
    if a_name:
        names["A"] = a_name
    if b_name:
        names["B"] = b_name
    return names


def _build_speaker_avatars(args) -> dict[str, str] | None:
    """Build speaker avatar path mapping from CLI args.

    Returns None if no avatars are configured.
    Returns e.g. {"A": "/path/to/zhongli.png", "B": "/path/to/paimon.png"}.
    """
    a_avatar = getattr(args, "speaker_a_avatar", "")
    b_avatar = getattr(args, "speaker_b_avatar", "")
    if not a_avatar and not b_avatar:
        return None
    avatars = {}
    if a_avatar:
        avatars["A"] = a_avatar
    if b_avatar:
        avatars["B"] = b_avatar
    return avatars


def cmd_tts(args):
    """Step 3: Generate TTS audio from scenes.json."""
    scenes_path = Path(args.output) / "scenes.json"
    if not scenes_path.exists():
        print(f"Error: {scenes_path} not found. Run 'adapt' step first.")
        sys.exit(1)

    provider_kwargs = _build_provider_kwargs(args)
    speaker_profiles = _build_speaker_profiles(args)
    speaker_names = _build_speaker_names(args)
    render_tts_only(
        str(scenes_path), args.output,
        voice=args.voice, rate=args.rate, fps=args.fps,
        provider_name=args.provider,
        provider_kwargs=provider_kwargs,
        subtitles=not getattr(args, "no_subtitles", False),
        speaker_profiles=speaker_profiles,
        speaker_names=speaker_names,
    )


def cmd_render(args):
    """Step 4: Full render (TTS + Remotion video)."""
    scenes_path = Path(args.output) / "scenes.json"
    if not scenes_path.exists():
        print(f"Error: {scenes_path} not found. Run 'adapt' step first.")
        sys.exit(1)

    provider_kwargs = _build_provider_kwargs(args)
    speaker_profiles = _build_speaker_profiles(args)
    speaker_names = _build_speaker_names(args)
    speaker_avatars = _build_speaker_avatars(args)
    hook_image = getattr(args, "hook_character_image", "")
    hook_bg = getattr(args, "hook_background_image", "")
    result = render_video(
        str(scenes_path), args.output,
        voice=args.voice, rate=args.rate, fps=args.fps,
        provider_name=args.provider,
        provider_kwargs=provider_kwargs,
        subtitles=not getattr(args, "no_subtitles", False),
        speaker_profiles=speaker_profiles,
        speaker_names=speaker_names,
        speaker_avatars=speaker_avatars,
        hook_character_image=hook_image or None,
        hook_background_image=hook_bg or None,
        video_bitrate=getattr(args, "video_bitrate", "") or None,
        scale=getattr(args, "scale", 0) or None,
        video_format=getattr(args, "video_format", "") or None,
    )

    if result:
        print(f"\nVideo ready: {result}")
    else:
        print("\nVideo rendering failed.")
        sys.exit(1)


def cmd_full(args):
    """Run full pipeline: parse → adapt (prompt) → [manual LLM step] → tts → render."""
    print("=" * 60)
    print("Full Pipeline")
    print("=" * 60)
    print()

    # Step 1: Parse
    print("[1/4] Parsing markdown...")
    cmd_parse(args)
    print()

    # Step 2: Adapt — check if scenes.json exists
    scenes_path = Path(args.output) / "scenes.json"
    if scenes_path.exists():
        scenes_data = json.loads(scenes_path.read_text(encoding="utf-8"))
        errors = validate_scenes(scenes_data)
        if errors:
            print("[2/4] scenes.json has validation errors:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
        print(f"[2/4] Using existing scenes.json ({len(scenes_data['scenes'])} scenes)")
    else:
        print("[2/4] Generating adaptation prompt...")
        cmd_adapt(args)
        print()
        print("Pipeline paused. Create scenes.json, then re-run to continue.")
        print(f"  python scripts/video/cli.py render --output {args.output}")
        return

    # Step 3+4: TTS + Render
    print()
    print("[3/4 + 4/4] Generating TTS and rendering video...")
    cmd_render(args)


def main():
    parser = argparse.ArgumentParser(
        description="Blog Article to Video Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    subparsers = parser.add_subparsers(dest="command", help="Pipeline step")

    # Common args
    def add_common_args(p):
        p.add_argument("--output", "-o", default="scripts/video/output/",
                        help="Output directory (default: scripts/video/output/)")

    def add_tts_args(p):
        """Add TTS-related arguments to a subparser."""
        p.add_argument("--provider", default=DEFAULT_PROVIDER,
                        choices=["edge", "gpt-sovits"],
                        help=f"TTS provider (default: {DEFAULT_PROVIDER})")
        p.add_argument("--voice", default=DEFAULT_VOICE,
                        help=f"TTS voice — edge only (default: {DEFAULT_VOICE})")
        p.add_argument("--rate", default=DEFAULT_RATE,
                        help=f"Speech rate — edge only (default: {DEFAULT_RATE.replace('%', '%%')})")
        p.add_argument("--fps", type=int, default=30, help="Video FPS")
        # GPT-SoVITS specific
        p.add_argument("--ref-audio", default="", dest="ref_audio",
                        help="Reference audio path — gpt-sovits only")
        p.add_argument("--prompt-text", default="", dest="prompt_text",
                        help="Reference audio transcript — gpt-sovits only")
        p.add_argument("--speed", type=float, default=1.2,
                        help="Speed factor — gpt-sovits only (default: 1.2)")
        p.add_argument("--api-url", default="", dest="api_url",
                        help="GPT-SoVITS API URL (default: http://127.0.0.1:9880)")
        p.add_argument("--gpt-weights", default="", dest="gpt_weights",
                        help="GPT model weights path — gpt-sovits only")
        p.add_argument("--sovits-weights", default="", dest="sovits_weights",
                        help="SoVITS model weights path — gpt-sovits only")
        p.add_argument("--no-subtitles", action="store_true", dest="no_subtitles",
                        help="Skip subtitle generation")
        # GPT-SoVITS sampling parameters
        p.add_argument("--temperature", type=float, default=0.6,
                        help="Sampling temperature — gpt-sovits only (default: 0.6)")
        p.add_argument("--top-k", type=int, default=10, dest="top_k",
                        help="Top-K sampling — gpt-sovits only (default: 10)")
        p.add_argument("--top-p", type=float, default=0.8, dest="top_p",
                        help="Top-P nucleus sampling — gpt-sovits only (default: 0.8)")
        p.add_argument("--seed", type=int, default=-1,
                        help="Random seed for reproducibility — gpt-sovits only (default: -1)")
        p.add_argument("--text-split-method", default="cut3", dest="text_split_method",
                        choices=["cut0", "cut1", "cut2", "cut3", "cut4", "cut5"],
                        help="Text splitting method — gpt-sovits only (default: cut3)")
        # Speaker B parameters (for dialogue preset with dual speakers)
        p.add_argument("--speaker-b-ref-audio", default="", dest="speaker_b_ref_audio",
                        help="Speaker B reference audio path — dialogue mode")
        p.add_argument("--speaker-b-prompt-text", default="", dest="speaker_b_prompt_text",
                        help="Speaker B reference audio transcript — dialogue mode")
        p.add_argument("--speaker-b-gpt-weights", default="", dest="speaker_b_gpt_weights",
                        help="Speaker B GPT model weights — dialogue mode")
        p.add_argument("--speaker-b-sovits-weights", default="", dest="speaker_b_sovits_weights",
                        help="Speaker B SoVITS model weights — dialogue mode")
        p.add_argument("--speaker-b-speed", type=float, default=0, dest="speaker_b_speed",
                        help="Speaker B speed factor — dialogue mode (0 = use global --speed)")
        # Speaker display names (for subtitles and video display)
        p.add_argument("--speaker-a-name", default="", dest="speaker_a_name",
                        help="Speaker A display name (default: A)")
        p.add_argument("--speaker-b-name", default="", dest="speaker_b_name",
                        help="Speaker B display name (default: B)")
        # Speaker avatar images
        p.add_argument("--speaker-a-avatar", default="", dest="speaker_a_avatar",
                        help="Speaker A avatar image path")
        p.add_argument("--speaker-b-avatar", default="", dest="speaker_b_avatar",
                        help="Speaker B avatar image path")
        # Hook scene character image
        p.add_argument("--hook-character-image", default="", dest="hook_character_image",
                        help="Character image for bilibili_hook scene")
        # Hook scene background image
        p.add_argument("--hook-background-image", default="", dest="hook_background_image",
                        help="Background image for bilibili_hook scene")
        # Parallel TTS: extra GPT-SoVITS API URLs
        p.add_argument("--extra-api-urls", nargs="*", default=[], dest="extra_api_urls",
                        help="Extra GPT-SoVITS API URLs for parallel TTS (e.g. http://127.0.0.1:9881)")
        # Video render options
        p.add_argument("--video-bitrate", default="", dest="video_bitrate",
                        help="Video bitrate for Remotion render (e.g. 10M, 5M)")
        p.add_argument("--scale", type=float, default=0, dest="scale",
                        help="Remotion scale factor (e.g. 2 for 4K output from 1080p)")
        p.add_argument("--format", default="", dest="video_format",
                        choices=["", "landscape", "portrait"],
                        help="Video format: landscape (16:9) or portrait (9:16 vertical)")

    # parse
    p_parse = subparsers.add_parser("parse", help="Step 1: Markdown -> segments.json")
    p_parse.add_argument("--input", "-i", required=True, help="Input markdown file")
    add_common_args(p_parse)

    # adapt
    p_adapt = subparsers.add_parser("adapt", help="Step 2: Generate adaptation prompt")
    p_adapt.add_argument("--input", "-i", help="Input markdown (for re-parsing)")
    p_adapt.add_argument("--preset", default="bilibili", help="Style preset")
    p_adapt.add_argument("--force", action="store_true",
                          help="Regenerate prompt even if scenes.json exists")
    p_adapt.add_argument("--print-prompt", action="store_true",
                          help="Print prompt to stdout")
    add_common_args(p_adapt)

    # tts
    p_tts = subparsers.add_parser("tts", help="Step 3: Generate TTS audio")
    add_common_args(p_tts)
    add_tts_args(p_tts)

    # render
    p_render = subparsers.add_parser("render", help="Step 4: Full render")
    add_common_args(p_render)
    add_tts_args(p_render)

    # full
    p_full = subparsers.add_parser("full", help="Run full pipeline")
    p_full.add_argument("--input", "-i", required=True, help="Input markdown file")
    p_full.add_argument("--preset", default="bilibili", help="Style preset")
    p_full.add_argument("--force", action="store_true",
                         help="Force regenerate adaptation prompt")
    add_common_args(p_full)
    add_tts_args(p_full)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Dispatch
    commands = {
        "parse": cmd_parse,
        "adapt": cmd_adapt,
        "tts": cmd_tts,
        "render": cmd_render,
        "full": cmd_full,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
