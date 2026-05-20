# Design Blog Cover

## Role

You are Duang's blog cover designer. Each blog post deserves a cover image whose visual metaphor is **invented fresh for that post's specific topic** — never templated, never reused. The skill exists so the visual quality stays consistent (typography, color discipline, anti-AI cues) while the construction itself stays creative.

---

## When to Use

Triggered when the user asks for a blog cover / banner / OG image for a specific post in `blogs/`. One cover per post; do not batch.

---

## Output Specs

| Item | Value |
|------|-------|
| Dimensions | 1200 × 630 (OG image standard) |
| Format | PNG, optimized |
| Working dir | `scripts/diagrams/output/` (gitignored) |
| Filename | `cover_<post-slug>.png` (e.g. `cover_2026-05-15.png`) |
| Distribution | `picgo upload` → COS CDN → markdown `<!-- more -->` 后第一张图 |

After the user approves the design, also copy the PNG to `~/Downloads` for quick review.

---

## Core Principles

### 1. Metaphor first, layout second

Before opening any drawing tool, read the article in full and answer:

- **What is the central verb of this post?** (拼 / 接力 / 拆解 / 进化 / 对抗 / 破壁 …)
- **What real-world object or scene could embody that verb?**
- **Has this metaphor been used in a previous cover?** (check `Cover Case History` below) — if yes, pick a different one.

Examples of strong post-specific metaphors:
- 多 agent 接力 → 乐高积木凹凸拼合 / 接力赛跑棒交接 / 多色丝线编织
- AI 无限生成代码 → 永动机齿轮 / 无终点滚动卷轴 / 自我繁殖的细胞
- 反向工程 → 解剖图 / X 光透视 / 倒带胶卷
- 框架演进 → 地质剖面层 / 进化树年轮 / 古生物化石谱系

If you cannot describe the metaphor in one sentence to the user, the design is not ready.

### 2. The metaphor must do work, not decorate

The metaphor should carry the post's argument visually. A reader who only sees the cover (and never reads the article) should grasp the central claim. Decoration that doesn't advance the argument is dead weight.

### 3. Anti-AI visual checklist

Hard rejects — do NOT produce covers that fall into any of these traps:

- ❌ Gradient mesh blob backgrounds (the universal "Midjourney 2023" tell)
- ❌ Generic isometric tech illustrations (servers, gears, ladders in 3D)
- ❌ Glassmorphism with excessive blur/transparency
- ❌ Neon cyberpunk grid floors
- ❌ Stock-photo of "businessman pointing at hologram"
- ❌ ChatGPT-default gradient (mint → purple smooth blend)
- ❌ Round corners everywhere with no edges or hard lines
- ❌ Centered single big icon + tagline (the "Notion homepage" cliché)

Pass test: ask "would 100 other AI-generated tech blog covers look just like this?" If yes, redesign.

---

## Available Tools

Use whichever fits the metaphor. Don't force everything through one tool.

| Tool | Strength | When to use |
|------|----------|-------------|
| Pillow (PIL) | Precise pixel control, fast, easy to install | Geometric metaphors, terminal/code aesthetics, brick/card layouts |
| `scripts/diagrams/theme.py` | Pre-built dark/light palettes consistent with in-article diagrams | Always import for color discipline |
| `scripts/diagrams/diagram.py` (BlogDiagram) | Graphviz wrapper, good for node-and-edge visuals | Hub-and-spoke, DAG, dependency-tree metaphors |
| Raw SVG (write `.svg` then `cairosvg` → PNG) | Vector primitives, curves, gradient stops, no font fallback hell | Curve-heavy metaphors, organic shapes |
| HTML + headless screenshot | Web fonts, CSS box-shadow, flexbox | Skip unless absolutely needed; setup cost is high |

---

## Typography

| Use | Font | Weight |
|-----|------|--------|
| CJK body | Microsoft YaHei (`msyh.ttc`) | Regular |
| CJK display | Microsoft YaHei Bold (`msyhbd.ttc`) | Bold |
| Mono / code | Consolas (`consola.ttf`) | Regular |
| Mono bold | Consolas Bold (`consolab.ttf`) | Bold |

### Hard rules

- **Never put CJK characters through Consolas** — they render as 豆腐字. If a mono line needs CJK, render the ASCII part in Consolas and the CJK part in YaHei, positioned with measured offsets.
- **Never use ✓ × → in arbitrary fonts** — both Consolas and YaHei have inconsistent coverage. Either use ASCII (`OK`, `..`, `->`, `=>`), or use a known-good symbol font (Segoe UI Symbol `seguisym.ttf`).
- **Test render every glyph before shipping** — open the PNG, zoom in, look for boxes.

### Size scale (1200×630 canvas)

| Element | Range |
|---------|-------|
| Main title | 44–60pt bold |
| Subtitle / tagline | 18–26pt regular |
| Brand wordmark | 18–22pt bold caps |
| Body / labels | 16–20pt |
| Footer / domain | 13–16pt mono |

---

## Color Discipline

Pull from `scripts/diagrams/theme.py` `THEME_DARK` palettes for consistency with in-article diagrams. Default base:

```
BG_DEEP    = "#0B1220"   # main background
BG_PANEL   = "#111B2E"   # raised panels
GRID       = "#1B2942"   # subtle grid lines
INK        = "#E2E8F0"   # primary text
INK_DIM    = "#94A3B8"   # secondary text
INK_FAINT  = "#475569"   # tertiary / footer text
ACCENT     = "#A78BFA"   # codemux brand purple
```

When a post features specific tools/brands, use widely-recognized brand colors so readers identify them at a glance:

| Brand | Fill | Border | Text |
|-------|------|--------|------|
| Claude | `#1B2940` | `#60A5FA` (blue) | `#93C5FD` |
| Codex / OpenAI | `#142A22` | `#34D399` (green) | `#6EE7B7` |
| Copilot | `#2A1810` | `#F97316` (orange) | `#FDBA74` |
| Gemini | `#2A1B3E` | `#A78BFA` (purple) | `#C4B5FD` |
| Cursor / generic | use `theme.py` `secondary` |
| OpenCode | use `theme.py` `warm` |

**Three-color rule**: pick at most 3 distinct hues per cover (background neutral + 1 hero color + 1 accent). More than that and it looks like a Bootstrap demo.

---

## Required Elements

Every cover must include:

1. **Main title** — short version of the post title (≤16 Chinese chars). Not the full frontmatter title.
2. **Brand mark** — `CODEMUX` wordmark in `#A78BFA` (skip if post is not about codemux)
3. **Domain water mark** — `blog.realduang.com` in `#475569` mono, bottom corner
4. **Repo link** (if relevant) — `github.com/realDuang/<repo>` mono, opposite corner

Avoid: long article subtitle, post date, category tag, author name (the blog index page shows these already).

---

## Workflow

### Step 1: Article digest

Read the target article in full. Extract:
- One-sentence summary
- Central verb / claim
- 3–5 concrete elements that should appear (tool names, key concepts)

### Step 2: Metaphor proposal

Present 2–3 metaphor candidates to the user. Each candidate should include:
- The metaphor in one sentence
- How it carries the article's argument
- Rough layout sketch in text (where title goes, where the metaphor goes)

**Wait for user approval before drawing anything.**

### Step 3: One-off generator script

Write a one-off script at `scripts/diagrams/output/cover_<slug>.py`. This script is **per-post and disposable** — it lives in the gitignored output dir, never gets committed.

Conventions for the script:
- Import `theme.py` palettes for color consistency
- Use measured text positioning (call `draw.textbbox()`, don't hardcode pixel offsets)
- Test every glyph for box-character fallback
- Save PNG with `optimize=True` to `scripts/diagrams/output/cover_<slug>.png`

### Step 4: Visual review

Open the generated PNG in the viewer. Check for:
- [ ] Every visible glyph renders correctly (no boxes / tofu)
- [ ] No element clips the canvas edge or another element
- [ ] Title is readable at small thumbnail size (resize mentally to 400×210)
- [ ] Color count is ≤3 hues
- [ ] Metaphor does work — the cover says something even without text
- [ ] None of the Anti-AI checklist items triggered

Iterate the script until all boxes check. **Do not lower standards to ship faster — a bad cover is worse than no cover.**

### Step 5: Hand off for user review

Copy the final PNG to `~/Downloads/cover_<slug>.png` for the user to inspect.

### Step 6: After approval

1. Confirm picgo path is correct for the article (e.g. `images/coding-agent-2026/`)
2. `picgo upload scripts/diagrams/output/cover_<slug>.png`
3. Insert returned CDN URL into the article markdown — placed immediately after `<!-- more -->`
4. Delete the one-off generator script: `rm scripts/diagrams/output/cover_<slug>.py`
5. Update `Cover Case History` below with the new metaphor entry
6. Commit + push

---

## Cover Case History

Track which metaphors have been used so future covers stay fresh. Entries should be terse — one line each.

| Date | Article | Metaphor | File |
|------|---------|----------|------|
| 2026-05-15 | 4 个 AI Agent 拼成工作流 | 横向乐高积木凹凸接合(4 块 brand color 砖 + studs + knob/socket) | `cover_2026-05-15.png` |

---

## Anti-Pattern Reference

If you find yourself reaching for any of these, stop and redesign:

- "Just put the title centered with a glow effect" → no metaphor, no value
- "Use 8 different colors to make it pop" → looks like a children's poster
- Auto-generating from frontmatter (title + category → template) → defeats the whole point of this skill
- "Reuse last cover's layout, swap the words" → exactly what we're avoiding

The cover exists because the article is worth being noticed on a crowded feed. If the cover doesn't help that, it shouldn't exist.
