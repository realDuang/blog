"""
Theme system for blog diagrams.

Provides immutable theme configurations using dataclasses.
Inspired by d2's theme system and Mermaid's theme variables.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass(frozen=True)
class ColorPalette:
    """A coordinated set of colors for a single semantic role."""
    fill: str        # background fill
    border: str      # border / outline
    text: str        # primary text color
    subtle: str      # secondary / description text


@dataclass(frozen=True)
class EdgeStyle:
    """Pre-configured edge styling."""
    color: str
    penwidth: str = "1.5"
    style: str = "solid"       # solid, dashed, dotted, bold
    font_color: str = ""       # defaults to color if empty
    arrowhead: str = "normal"  # normal, vee, dot, none


@dataclass(frozen=True)
class Theme:
    """
    Complete visual theme for blog diagrams.

    A theme defines all visual parameters — colors, fonts, sizes, spacing —
    ensuring every diagram produced with the same theme looks consistent.

    Node semantic types: primary, secondary, accent, muted, warning, info
    Edge semantic types: primary, secondary, accent, muted, danger
    Group semantic types: primary, secondary, accent, muted
    """
    # ── Identity ──
    name: str = "default"

    # ── Typography ──
    font_family: str = "Microsoft YaHei"
    title_size: int = 24
    subtitle_size: int = 13
    node_title_size: int = 18
    node_desc_size: int = 12
    node_detail_size: int = 11
    edge_label_size: int = 11
    group_label_size: int = 15
    summary_size: int = 14

    # ── Layout ──
    dpi: int = 200
    pad: str = "0.8"
    nodesep: str = "1.0"
    ranksep: str = "0.9"
    node_margin: str = "0.35,0.25"
    group_margin: str = "30"
    node_penwidth: str = "2"

    # ── Global colors ──
    bg_color: str = "#FFFFFF"
    subtitle_color: str = "#8B95A5"
    summary_fill: str = "#F8FAFC"
    summary_border: str = "#CBD5E1"
    summary_text: str = "#1E293B"

    # ── Node palettes (keyed by semantic type) ──
    node_palettes: Dict[str, ColorPalette] = field(default_factory=lambda: {
        "primary": ColorPalette(
            fill="#DBEAFE", border="#60A5FA",
            text="#1D4ED8", subtle="#64748B",
        ),
        "secondary": ColorPalette(
            fill="#CCFBF1", border="#5EEAD4",
            text="#0F766E", subtle="#64748B",
        ),
        "accent": ColorPalette(
            fill="#EDE9FE", border="#A78BFA",
            text="#6D28D9", subtle="#64748B",
        ),
        "warm": ColorPalette(
            fill="#FFF7ED", border="#FDBA74",
            text="#C2410C", subtle="#64748B",
        ),
        "muted": ColorPalette(
            fill="#F9FAFB", border="#D1D5DB",
            text="#6B7280", subtle="#9CA3AF",
        ),
        "danger": ColorPalette(
            fill="#FEF2F2", border="#FCA5A5",
            text="#DC2626", subtle="#9CA3AF",
        ),
        "success": ColorPalette(
            fill="#F0FDF4", border="#86EFAC",
            text="#15803D", subtle="#64748B",
        ),
        "info": ColorPalette(
            fill="#EFF6FF", border="#93C5FD",
            text="#2563EB", subtle="#64748B",
        ),
    })

    # ── Edge styles (keyed by semantic type) ──
    edge_styles: Dict[str, EdgeStyle] = field(default_factory=lambda: {
        "primary": EdgeStyle(color="#60A5FA", penwidth="1.8"),
        "secondary": EdgeStyle(color="#5EEAD4", penwidth="1.5"),
        "accent": EdgeStyle(color="#A78BFA", penwidth="1.5"),
        "warm": EdgeStyle(color="#FDBA74", penwidth="1.5"),
        "muted": EdgeStyle(color="#D1D5DB", penwidth="1.5"),
        "danger": EdgeStyle(color="#FCA5A5", penwidth="1.5", style="dashed"),
        "dashed": EdgeStyle(color="#A78BFA", penwidth="1.5", style="dashed"),
        "bidirectional": EdgeStyle(color="#C4B5FD", penwidth="1.8"),
        "invisible": EdgeStyle(color="#FFFFFF", style="invis"),
    })

    # ── Group styles (keyed by semantic type) ──
    group_styles: Dict[str, Dict[str, str]] = field(default_factory=lambda: {
        "primary": {
            "color": "#93C5FD",
            "bgcolor": "#EFF6FF",
            "label_color": "#2563EB",
        },
        "secondary": {
            "color": "#5EEAD4",
            "bgcolor": "#F0FDFA",
            "label_color": "#0F766E",
        },
        "accent": {
            "color": "#A78BFA",
            "bgcolor": "#F5F3FF",
            "label_color": "#6D28D9",
        },
        "danger": {
            "color": "#FCA5A5",
            "bgcolor": "#FEF2F2",
            "label_color": "#DC2626",
        },
        "muted": {
            "color": "#D1D5DB",
            "bgcolor": "#F9FAFB",
            "label_color": "#6B7280",
        },
        "warm": {
            "color": "#FDBA74",
            "bgcolor": "#FFF7ED",
            "label_color": "#C2410C",
        },
    })

    def get_node_palette(self, style: str = "primary") -> ColorPalette:
        return self.node_palettes.get(style, self.node_palettes["primary"])

    def get_edge_style(self, style: str = "primary") -> EdgeStyle:
        return self.edge_styles.get(style, self.edge_styles["primary"])

    def get_group_style(self, style: str = "primary") -> Dict[str, str]:
        return self.group_styles.get(style, self.group_styles["primary"])


# ── Pre-built themes ──

THEME_DEFAULT = Theme(name="default")

THEME_DARK = Theme(
    name="dark",
    bg_color="#1E293B",
    subtitle_color="#94A3B8",
    summary_fill="#334155",
    summary_border="#475569",
    summary_text="#F1F5F9",
    node_palettes={
        "primary": ColorPalette(
            fill="#1E3A5F", border="#3B82F6",
            text="#93C5FD", subtle="#94A3B8",
        ),
        "secondary": ColorPalette(
            fill="#134E4A", border="#14B8A6",
            text="#5EEAD4", subtle="#94A3B8",
        ),
        "accent": ColorPalette(
            fill="#3B1F6E", border="#8B5CF6",
            text="#C4B5FD", subtle="#94A3B8",
        ),
        "warm": ColorPalette(
            fill="#431407", border="#F97316",
            text="#FDBA74", subtle="#94A3B8",
        ),
        "muted": ColorPalette(
            fill="#334155", border="#64748B",
            text="#CBD5E1", subtle="#94A3B8",
        ),
        "danger": ColorPalette(
            fill="#450A0A", border="#EF4444",
            text="#FCA5A5", subtle="#94A3B8",
        ),
        "success": ColorPalette(
            fill="#14532D", border="#22C55E",
            text="#86EFAC", subtle="#94A3B8",
        ),
        "info": ColorPalette(
            fill="#1E3A5F", border="#3B82F6",
            text="#93C5FD", subtle="#94A3B8",
        ),
    },
    edge_styles={
        "primary": EdgeStyle(color="#3B82F6", penwidth="1.8"),
        "secondary": EdgeStyle(color="#14B8A6", penwidth="1.5"),
        "accent": EdgeStyle(color="#8B5CF6", penwidth="1.5"),
        "warm": EdgeStyle(color="#F97316", penwidth="1.5"),
        "muted": EdgeStyle(color="#64748B", penwidth="1.5"),
        "danger": EdgeStyle(color="#EF4444", penwidth="1.5", style="dashed"),
        "dashed": EdgeStyle(color="#8B5CF6", penwidth="1.5", style="dashed"),
        "bidirectional": EdgeStyle(color="#8B5CF6", penwidth="1.8"),
        "invisible": EdgeStyle(color="#1E293B", style="invis"),
    },
    group_styles={
        "primary": {
            "color": "#3B82F6",
            "bgcolor": "#1E3A5F",
            "label_color": "#93C5FD",
        },
        "secondary": {
            "color": "#14B8A6",
            "bgcolor": "#134E4A",
            "label_color": "#5EEAD4",
        },
        "accent": {
            "color": "#8B5CF6",
            "bgcolor": "#3B1F6E",
            "label_color": "#C4B5FD",
        },
        "danger": {
            "color": "#EF4444",
            "bgcolor": "#450A0A",
            "label_color": "#FCA5A5",
        },
        "muted": {
            "color": "#64748B",
            "bgcolor": "#334155",
            "label_color": "#CBD5E1",
        },
        "warm": {
            "color": "#F97316",
            "bgcolor": "#431407",
            "label_color": "#FDBA74",
        },
    },
)

THEMES: Dict[str, Theme] = {
    "default": THEME_DEFAULT,
    "dark": THEME_DARK,
}
