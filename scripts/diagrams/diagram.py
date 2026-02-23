"""
Core diagram builder with context manager API.

Inspired by the `diagrams` library's context manager pattern
and d2/Mermaid's semantic styling approach.

Usage:
    with BlogDiagram("Title", "Subtitle") as d:
        with d.group("Group", style="primary"):
            a = d.node("a", "Node A", "desc")
            b = d.node("b", "Node B", "desc")
        d.edge(a, b, "relates to")

    d.render("output_path")  # produces output_path.png
"""

from __future__ import annotations

import os
import graphviz
from typing import Optional, List, Tuple

from .theme import Theme, THEME_DEFAULT


# Ensure Graphviz binaries are on PATH (Windows)
_GRAPHVIZ_BIN = r"C:\Program Files\Graphviz\bin"
if os.path.isdir(_GRAPHVIZ_BIN) and _GRAPHVIZ_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] += os.pathsep + _GRAPHVIZ_BIN


class _NodeRef:
    """Lightweight reference to a node, returned by BlogDiagram.node()."""
    __slots__ = ("id", "label")

    def __init__(self, node_id: str, label: str):
        self.id = node_id
        self.label = label

    def __repr__(self):
        return f"Node({self.id!r})"


class _GroupContext:
    """Context manager for a named group (Graphviz cluster subgraph)."""

    def __init__(self, diagram: BlogDiagram, name: str, label: str,
                 style: str = "primary"):
        self.diagram = diagram
        self.name = name
        self.label = label
        self.style = style
        self._subgraph: Optional[graphviz.Digraph] = None

    def __enter__(self):
        theme = self.diagram.theme
        gs = theme.get_group_style(self.style)

        self._subgraph = graphviz.Digraph(name=f"cluster_{self.name}")
        self._subgraph.attr(
            label=self._format_group_label(self.label, gs["label_color"]),
            style="rounded",
            color=gs["color"],
            bgcolor=gs["bgcolor"],
            penwidth=str(theme.node_penwidth),
            margin=theme.group_margin,
            labeljust="c",
            fontname=theme.font_family,
        )
        # Push this subgraph as the active target
        self.diagram._push_target(self._subgraph)
        return self

    def __exit__(self, *exc):
        self.diagram._pop_target()
        # Add the completed subgraph to parent
        self.diagram._current_target().subgraph(self._subgraph)
        return False

    def _format_group_label(self, label: str, color: str) -> str:
        size = self.diagram.theme.group_label_size
        return (
            f'<<BR/>'
            f'<FONT POINT-SIZE="{size}" COLOR="{color}"><B>{label}</B></FONT>'
            f'<BR/><BR/>>'
        )


class BlogDiagram:
    """
    High-level diagram builder wrapping Graphviz.

    Features:
    - Context manager for scoped construction
    - Semantic node/edge/group types mapped to theme colors
    - Automatic Graphviz layout (no manual coordinates)
    - Consistent typography and spacing from theme

    Parameters:
        title: Main diagram title
        subtitle: Optional subtitle / description
        theme: Theme instance (defaults to THEME_DEFAULT)
        engine: Graphviz layout engine (dot, neato, fdp, circo, etc.)
        direction: Layout direction (TB, LR, BT, RL)
        format: Output format (png, svg, pdf)
    """

    def __init__(
        self,
        title: str,
        subtitle: str = "",
        *,
        theme: Theme = THEME_DEFAULT,
        engine: str = "dot",
        direction: str = "TB",
        format: str = "png",
    ):
        self.title = title
        self.subtitle = subtitle
        self.theme = theme
        self.engine = engine
        self.direction = direction
        self.format = format

        self._dot = graphviz.Digraph(
            name="blog_diagram",
            format=format,
            engine=engine,
            graph_attr=self._build_graph_attrs(),
            node_attr=self._build_node_attrs(),
            edge_attr=self._build_edge_attrs(),
        )
        self._target_stack: List[graphviz.Digraph] = [self._dot]
        self._rank_constraints: List[List[str]] = []
        self._nodes: dict[str, _NodeRef] = {}

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        # Apply rank constraints after all nodes/edges are defined
        self._apply_rank_constraints()
        return False

    # ── Public API ──

    def node(
        self,
        node_id: str,
        title: str,
        description: str = "",
        detail: str = "",
        *,
        style: str = "primary",
        detail_style: str = "",
    ) -> _NodeRef:
        """
        Add a node to the current scope (diagram root or group).

        Args:
            node_id: Unique identifier for the node
            title: Primary label text
            description: Secondary description (smaller font)
            detail: Additional detail line (smallest font, e.g. formula)
            style: Semantic style name (primary, secondary, accent, muted, etc.)
            detail_style: Optional override style for the detail text color

        Returns:
            _NodeRef that can be used in edge() calls
        """
        palette = self.theme.get_node_palette(style)
        detail_palette = (self.theme.get_node_palette(detail_style)
                          if detail_style else None)
        label = self._format_node_label(title, description, detail,
                                        palette, detail_palette)

        target = self._current_target()
        target.node(
            node_id,
            label=label,
            fillcolor=palette.fill,
            color=palette.border,
        )

        ref = _NodeRef(node_id, title)
        self._nodes[node_id] = ref
        return ref

    def edge(
        self,
        src: _NodeRef | str,
        dst: _NodeRef | str,
        label: str = "",
        *,
        style: str = "primary",
        direction: str = "forward",  # forward, back, both, none
        constraint: bool = True,
    ) -> None:
        """
        Add an edge between two nodes.

        Args:
            src: Source node (NodeRef or node_id string)
            dst: Destination node (NodeRef or node_id string)
            label: Edge label text
            style: Semantic style name
            direction: Arrow direction (forward, back, both, none)
            constraint: Whether this edge affects layout ranking
        """
        src_id = src.id if isinstance(src, _NodeRef) else src
        dst_id = dst.id if isinstance(dst, _NodeRef) else dst

        es = self.theme.get_edge_style(style)
        edge_attrs = {
            "color": es.color,
            "penwidth": es.penwidth,
            "style": es.style,
            "arrowhead": es.arrowhead,
        }

        if label:
            font_color = es.font_color or es.color
            edge_attrs["label"] = (
                f'<<FONT POINT-SIZE="{self.theme.edge_label_size}" '
                f'COLOR="{font_color}"> {label} </FONT>>'
            )

        dir_map = {"forward": "forward", "back": "back",
                    "both": "both", "none": "none"}
        edge_attrs["dir"] = dir_map.get(direction, "forward")

        if not constraint:
            edge_attrs["constraint"] = "false"

        target = self._current_target()
        target.edge(src_id, dst_id, **edge_attrs)

    def group(
        self,
        name: str,
        label: str = "",
        *,
        style: str = "primary",
    ) -> _GroupContext:
        """
        Create a visual group (cluster subgraph). Use as context manager:

            with d.group("my_group", "Group Label", style="primary"):
                d.node(...)

        Args:
            name: Unique group identifier
            label: Display label for the group (defaults to name)
            style: Semantic style name
        """
        return _GroupContext(self, name, label or name, style)

    def summary(
        self,
        text: str,
        node_id: str = "summary",
    ) -> _NodeRef:
        """
        Add a summary/conclusion node (special styling).

        Args:
            text: Summary text content
            node_id: Node identifier (default: "summary")
        """
        t = self.theme
        label = (
            f'<<BR/>'
            f'<FONT POINT-SIZE="{t.summary_size}" COLOR="{t.summary_text}">'
            f'<B>{text}</B></FONT>'
            f'<BR/><BR/>>'
        )
        self._dot.node(
            node_id,
            label=label,
            fillcolor=t.summary_fill,
            color=t.summary_border,
            style="rounded,filled",
            penwidth="1.5",
        )
        ref = _NodeRef(node_id, text)
        self._nodes[node_id] = ref
        return ref

    def same_rank(self, *nodes: _NodeRef | str) -> None:
        """
        Force multiple nodes to appear on the same horizontal level.

        Args:
            *nodes: NodeRefs or node_id strings to align
        """
        ids = [n.id if isinstance(n, _NodeRef) else n for n in nodes]
        self._rank_constraints.append(ids)

    def invisible_edge(
        self,
        src: _NodeRef | str,
        dst: _NodeRef | str,
    ) -> None:
        """Add an invisible edge to influence layout ordering."""
        self.edge(src, dst, style="invisible")

    def render(
        self,
        output_path: str,
        *,
        cleanup: bool = True,
        view: bool = False,
    ) -> str:
        """
        Render the diagram to file.

        Args:
            output_path: Output file path (without extension)
            cleanup: Remove intermediate DOT file after rendering
            view: Open the rendered file in default viewer

        Returns:
            Path to the rendered file (with extension)
        """
        result = self._dot.render(
            output_path,
            cleanup=cleanup,
            view=view,
        )
        return result

    def source(self) -> str:
        """Return the generated DOT source code (useful for debugging)."""
        return self._dot.source

    # ── Internal helpers ──

    def _build_graph_attrs(self) -> dict:
        t = self.theme
        attrs = {
            "rankdir": self.direction,
            "bgcolor": t.bg_color,
            "fontname": t.font_family,
            "pad": t.pad,
            "dpi": str(t.dpi),
            "nodesep": t.nodesep,
            "ranksep": t.ranksep,
            "compound": "true",
            "newrank": "true",
        }
        if self.title:
            label_parts = [
                f'<<BR/><FONT POINT-SIZE="{t.title_size}">'
                f'<B>{self.title}</B></FONT><BR/><BR/>'
            ]
            if self.subtitle:
                label_parts.append(
                    f'<FONT POINT-SIZE="{t.subtitle_size}" '
                    f'COLOR="{t.subtitle_color}">{self.subtitle}</FONT>'
                    f'<BR/><BR/>'
                )
            attrs["label"] = "".join(label_parts) + ">"
            attrs["labelloc"] = "t"
            attrs["labeljust"] = "c"
        return attrs

    def _build_node_attrs(self) -> dict:
        t = self.theme
        return {
            "fontname": t.font_family,
            "shape": "box",
            "style": "rounded,filled",
            "penwidth": t.node_penwidth,
            "margin": t.node_margin,
        }

    def _build_edge_attrs(self) -> dict:
        return {
            "fontname": self.theme.font_family,
            "fontsize": str(self.theme.edge_label_size),
        }

    def _format_node_label(self, title: str, desc: str, detail: str,
                           palette, detail_palette=None) -> str:
        """Build HTML label for a node with consistent spacing."""
        parts = [f'<<BR/><FONT POINT-SIZE="{self.theme.node_title_size}" '
                 f'COLOR="{palette.text}"><B>{title}</B></FONT><BR/><BR/>']

        if desc:
            parts.append(
                f'<FONT POINT-SIZE="{self.theme.node_desc_size}" '
                f'COLOR="{palette.subtle}">{desc}</FONT><BR/><BR/>'
            )
        if detail:
            detail_color = (detail_palette.text if detail_palette
                            else palette.text)
            parts.append(
                f'<FONT POINT-SIZE="{self.theme.node_detail_size}" '
                f'COLOR="{detail_color}"><B>{detail}</B></FONT><BR/><BR/>'
            )
        parts.append(">")
        return "".join(parts)

    def _current_target(self) -> graphviz.Digraph:
        """Return the current target subgraph (top of stack)."""
        return self._target_stack[-1]

    def _push_target(self, target: graphviz.Digraph) -> None:
        self._target_stack.append(target)

    def _pop_target(self) -> graphviz.Digraph:
        return self._target_stack.pop()

    def _apply_rank_constraints(self) -> None:
        """Apply same_rank constraints as unnamed subgraphs."""
        for node_ids in self._rank_constraints:
            with self._dot.subgraph() as s:
                s.attr(rank="same")
                for nid in node_ids:
                    s.node(nid)
