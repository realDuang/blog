"""Layer 2: Content Adapter — segments.json → scenes.json

Loads a preset prompt and the parsed segments, then produces a combined
prompt for an LLM to generate scenes.json.

Two execution modes:
  - Agent mode (default): prints the combined prompt to stdout for the
    calling AI agent to process in-context.
  - File mode: if scenes.json already exists (e.g., manually created),
    validates it against the schema.
"""

import json
import sys
from pathlib import Path
from typing import Optional

# Scene type definitions for validation
VALID_SCENE_TYPES = {
    "chapter_title", "text_card", "image", "code",
    "comparison", "data_reveal", "summary",
    "bilibili_hook", "bilibili_outro", "dialogue"
}

REQUIRED_VISUAL_KEYS = {
    "chapter_title": ["title"],
    "text_card": ["bullets"],
    "image": ["image_url"],
    "code": ["code", "language"],
    "comparison": ["left", "right"],
    "data_reveal": ["number"],
    "summary": ["points"],
    "bilibili_hook": ["question", "impact_text"],
    "bilibili_outro": ["elements"],
    "dialogue": ["topic"],
}


def load_preset(preset_name: str, presets_dir: Optional[str] = None) -> str:
    """Load a preset prompt file by name."""
    if presets_dir is None:
        presets_dir = str(Path(__file__).parent / "presets")
    preset_path = Path(presets_dir) / f"{preset_name}.md"
    if not preset_path.exists():
        available = [p.stem for p in Path(presets_dir).glob("*.md")]
        raise FileNotFoundError(
            f"Preset '{preset_name}' not found. Available: {available}"
        )
    return preset_path.read_text(encoding="utf-8")


def build_prompt(segments_data: dict, preset_name: str = "bilibili",
                 presets_dir: Optional[str] = None) -> str:
    """Build the full LLM prompt combining preset + segments data.

    Returns a string prompt that can be sent to an LLM to generate scenes.json.
    """
    preset_prompt = load_preset(preset_name, presets_dir)

    segments_json = json.dumps(segments_data, ensure_ascii=False, indent=2)

    prompt = f"""{preset_prompt}

---

## 原文 segments.json

以下是原文解析后的结构化内容，请基于此生成场景脚本：

```json
{segments_json}
```

请输出完整的 scenes.json（纯 JSON，不要包含 markdown 代码块标记）。
"""
    return prompt


def validate_scenes(scenes_data: dict) -> list[str]:
    """Validate a scenes.json structure. Returns list of error messages."""
    errors = []

    if "title" not in scenes_data:
        errors.append("Missing 'title' field")

    if "scenes" not in scenes_data:
        errors.append("Missing 'scenes' field")
        return errors

    scenes = scenes_data["scenes"]
    if not isinstance(scenes, list):
        errors.append("'scenes' must be a list")
        return errors

    total_duration = 0
    total_narration_chars = 0
    seen_ids = set()

    for i, scene in enumerate(scenes):
        prefix = f"Scene {i+1}"

        # Check required fields — dialogue scenes use 'lines' instead of 'narration'
        required = ["id", "type", "visual"]
        if scene.get("type") == "dialogue":
            required.append("lines")
        else:
            required.append("narration")
        for field in required:
            if field not in scene:
                errors.append(f"{prefix}: missing '{field}'")

        scene_id = scene.get("id", f"unknown_{i}")
        if scene_id in seen_ids:
            errors.append(f"{prefix}: duplicate id '{scene_id}'")
        seen_ids.add(scene_id)

        # Validate scene type
        scene_type = scene.get("type")
        if scene_type not in VALID_SCENE_TYPES:
            errors.append(f"{prefix}: invalid type '{scene_type}'")

        # Validate visual has required keys for this type
        visual = scene.get("visual", {})
        if scene_type in REQUIRED_VISUAL_KEYS:
            for key in REQUIRED_VISUAL_KEYS[scene_type]:
                if key not in visual:
                    errors.append(f"{prefix}: visual missing '{key}' for type '{scene_type}'")

        # Track totals — dialogue uses lines, others use narration
        if scene.get("type") == "dialogue":
            for line in scene.get("lines", []):
                total_narration_chars += len(line.get("text", ""))
        else:
            narration = scene.get("narration", "")
            total_narration_chars += len(narration)
        total_duration += scene.get("duration_hint", 0)

    # Warn on totals
    if total_narration_chars > 4000:
        errors.append(
            f"Total narration too long: {total_narration_chars} chars "
            f"(target: 3000-3500, max: 4000)"
        )
    if total_narration_chars < 1000:
        errors.append(
            f"Total narration too short: {total_narration_chars} chars "
            f"(target: 3000-3500)"
        )

    return errors


def adapt(segments_path: str, preset_name: str = "bilibili",
          output_path: Optional[str] = None,
          presets_dir: Optional[str] = None) -> str:
    """Main adapter function.

    If output_path exists and contains valid scenes.json, validates it.
    Otherwise, generates and prints the LLM prompt for agent-mode processing.

    Returns the prompt string.
    """
    segments_data = json.loads(
        Path(segments_path).read_text(encoding="utf-8")
    )

    # If scenes.json already exists, validate it
    if output_path and Path(output_path).exists():
        scenes_data = json.loads(
            Path(output_path).read_text(encoding="utf-8")
        )
        errors = validate_scenes(scenes_data)
        if errors:
            print("Validation errors in existing scenes.json:", file=sys.stderr)
            for e in errors:
                print(f"  - {e}", file=sys.stderr)
            return ""
        else:
            print(f"scenes.json is valid: {len(scenes_data['scenes'])} scenes, "
                  f"title='{scenes_data['title']}'")
            return ""

    # Generate prompt for LLM
    prompt = build_prompt(segments_data, preset_name, presets_dir)
    return prompt


def save_scenes(scenes_data: dict, output_path: str) -> list[str]:
    """Validate and save scenes.json. Returns validation errors (empty if ok)."""
    errors = validate_scenes(scenes_data)
    if not errors:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(
            json.dumps(scenes_data, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
    return errors


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Layer 2: Content Adapter")
    parser.add_argument("--segments", required=True, help="Path to segments.json")
    parser.add_argument("--preset", default="bilibili", help="Preset name")
    parser.add_argument("--output", help="Path to scenes.json (for validation)")
    parser.add_argument("--prompt-only", action="store_true",
                        help="Only output the prompt, don't validate")
    args = parser.parse_args()

    result = adapt(args.segments, args.preset, args.output)
    if result:
        print(result)
