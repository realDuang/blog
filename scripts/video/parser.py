"""Layer 1: Markdown → segments.json

Parses a blog markdown file into structured segments for downstream
video generation. Handles frontmatter, headings, paragraphs, code blocks,
images, tables, lists, and blockquotes.
"""

import json
import re
from pathlib import Path
from typing import Optional

from markdown_it import MarkdownIt
from markdown_it.tree import SyntaxTreeNode


def _extract_frontmatter(text: str) -> tuple[dict, str]:
    """Strip YAML frontmatter and return (metadata dict, remaining text)."""
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return {}, text
    raw = m.group(1)
    meta = {}
    for line in raw.splitlines():
        if ":" in line and not line.startswith(" ") and not line.startswith("-"):
            key, val = line.split(":", 1)
            meta[key.strip()] = val.strip()
    body = text[m.end():]
    return meta, body


def _strip_vuepress_containers(text: str) -> str:
    """Remove VuePress custom container markers (:::tip, :::) but keep content."""
    # Replace :::tip or :::warning etc. with empty line
    text = re.sub(r"^:::(\w+)?\s*$", "", text, flags=re.MULTILINE)
    return text


def _extract_images_from_text(text: str) -> list[str]:
    """Find all markdown image URLs in a text string."""
    return re.findall(r"!\[.*?\]\((.*?)\)", text)


def _extract_plain_text(markdown_text: str) -> str:
    """Rough conversion of markdown text to plain text."""
    text = markdown_text
    # Remove image syntax
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # Remove link syntax, keep text
    text = re.sub(r"\[([^\]]*)\]\(.*?\)", r"\1", text)
    # Remove bold/italic markers
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text)
    # Remove inline code backticks
    text = re.sub(r"`([^`]*)`", r"\1", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _render_table_content(lines: list[str]) -> str:
    """Given raw table lines, return the full markdown table string."""
    return "\n".join(lines)


def parse_markdown(filepath: str) -> dict:
    """Parse a markdown file into structured segments.

    Returns:
        dict with keys:
          - title: str
          - segments: list[dict] each with id, type, level, content,
            text, images, code_lang, parent_heading
    """
    path = Path(filepath)
    raw = path.read_text(encoding="utf-8")

    meta, body = _extract_frontmatter(raw)
    title = meta.get("title", path.stem)

    # Strip <!-- more --> markers
    body = body.replace("<!-- more -->", "")

    # Strip VuePress containers
    body = _strip_vuepress_containers(body)

    segments: list[dict] = []
    seg_counter = 0
    current_heading: Optional[str] = None
    current_heading_level: int = 0

    def make_seg(seg_type: str, content: str, **kwargs) -> dict:
        nonlocal seg_counter
        seg_counter += 1
        seg = {
            "id": f"seg_{seg_counter:03d}",
            "type": seg_type,
            "level": kwargs.get("level"),
            "content": content.strip(),
            "text": kwargs.get("text", _extract_plain_text(content)),
            "images": kwargs.get("images", _extract_images_from_text(content)),
            "code_lang": kwargs.get("code_lang"),
            "parent_heading": current_heading,
        }
        return seg

    # We parse line-by-line with state tracking for fenced code blocks and tables
    lines = body.split("\n")
    i = 0
    in_code_block = False
    code_fence_lang = None
    code_lines: list[str] = []
    in_table = False
    table_lines: list[str] = []
    paragraph_lines: list[str] = []

    def flush_paragraph():
        nonlocal paragraph_lines
        if paragraph_lines:
            content = "\n".join(paragraph_lines).strip()
            if content:
                # Check if it's a standalone image line
                img_only = re.match(r"^!\[.*?\]\(.*?\)$", content.strip())
                if img_only:
                    images = _extract_images_from_text(content)
                    segments.append(make_seg("image", content, images=images,
                                             text=_extract_plain_text(content)))
                else:
                    segments.append(make_seg("paragraph", content))
            paragraph_lines = []

    def flush_table():
        nonlocal table_lines, in_table
        if table_lines:
            content = _render_table_content(table_lines)
            # Extract plain text: remove | and --- separators
            plain_lines = []
            for tl in table_lines:
                if re.match(r"^\|[-:|]+\|$", tl.strip()):
                    continue  # skip separator line
                cells = [c.strip() for c in tl.strip().strip("|").split("|")]
                plain_lines.append(" | ".join(cells))
            text = "\n".join(plain_lines)
            segments.append(make_seg("table", content, text=text))
            table_lines = []
            in_table = False

    while i < len(lines):
        line = lines[i]

        # --- Fenced code block start/end ---
        fence_match = re.match(r"^```(\w*)$", line.strip())
        if fence_match and not in_code_block:
            flush_paragraph()
            flush_table()
            in_code_block = True
            code_fence_lang = fence_match.group(1) or None
            code_lines = [line]
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            if line.strip() == "```":
                content = "\n".join(code_lines)
                inner = "\n".join(code_lines[1:-1])
                segments.append(make_seg("code", content,
                                         text=inner.strip(),
                                         code_lang=code_fence_lang))
                in_code_block = False
                code_lines = []
                code_fence_lang = None
            i += 1
            continue

        # --- Heading ---
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line.strip())
        if heading_match:
            flush_paragraph()
            flush_table()
            level = len(heading_match.group(1))
            heading_text = heading_match.group(2).strip()
            # Update parent heading tracking
            if level <= 2:
                current_heading = heading_text
                current_heading_level = level
            elif level > current_heading_level:
                # Sub-heading: keep the parent
                pass
            segments.append(make_seg("heading", line.strip(),
                                     level=level, text=heading_text))
            i += 1
            continue

        # --- Table ---
        if re.match(r"^\|.+\|$", line.strip()):
            flush_paragraph()
            if not in_table:
                in_table = True
            table_lines.append(line.strip())
            i += 1
            continue
        else:
            if in_table:
                flush_table()

        # --- List item ---
        list_match = re.match(r"^(\s*)([-*+]|\d+\.)\s+(.+)$", line)
        if list_match:
            flush_paragraph()
            content = line.strip()
            segments.append(make_seg("list", content,
                                     text=_extract_plain_text(content)))
            i += 1
            continue

        # --- Blockquote ---
        if line.strip().startswith(">"):
            flush_paragraph()
            content = re.sub(r"^>\s?", "", line.strip())
            segments.append(make_seg("blockquote", content,
                                     text=_extract_plain_text(content)))
            i += 1
            continue

        # --- Empty line ---
        if not line.strip():
            flush_paragraph()
            i += 1
            continue

        # --- Regular text (paragraph) ---
        paragraph_lines.append(line)
        i += 1

    # Flush any remaining content
    flush_paragraph()
    flush_table()

    # Merge consecutive list items under the same parent into a single list segment
    merged = _merge_consecutive_lists(segments)

    return {"title": title, "segments": merged}


def _merge_consecutive_lists(segments: list[dict]) -> list[dict]:
    """Merge consecutive list segments into single list segments."""
    if not segments:
        return segments

    merged: list[dict] = []
    i = 0
    while i < len(segments):
        seg = segments[i]
        if seg["type"] == "list":
            # Collect consecutive list items
            list_items = [seg]
            j = i + 1
            while j < len(segments) and segments[j]["type"] == "list":
                list_items.append(segments[j])
                j += 1
            # Merge into one
            content = "\n".join(item["content"] for item in list_items)
            text = "\n".join(item["text"] for item in list_items)
            all_images = []
            for item in list_items:
                all_images.extend(item["images"])
            merged_seg = {
                "id": list_items[0]["id"],
                "type": "list",
                "level": None,
                "content": content,
                "text": text,
                "images": all_images,
                "code_lang": None,
                "parent_heading": list_items[0]["parent_heading"],
            }
            merged.append(merged_seg)
            i = j
        else:
            merged.append(seg)
            i += 1

    # Re-number IDs sequentially
    for idx, seg in enumerate(merged, 1):
        seg["id"] = f"seg_{idx:03d}"

    return merged


def parse_to_file(input_path: str, output_path: str) -> dict:
    """Parse markdown and write segments.json to output_path."""
    result = parse_markdown(input_path)
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python parser.py <input.md> [output.json]")
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "scripts/video/output/segments.json"
    result = parse_to_file(inp, out)
    print(f"Parsed {len(result['segments'])} segments from '{result['title']}'")
    print(f"Output: {out}")
