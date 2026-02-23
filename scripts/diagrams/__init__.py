"""
blog-diagrams: Consistent, beautiful diagram generation for blog articles.

Usage:
    from diagrams import BlogDiagram, Theme

    with BlogDiagram("My Title", "Optional subtitle") as d:
        with d.group("Group Name", style="primary"):
            a = d.node("A", "Node A", "description")
            b = d.node("B", "Node B", "description")
        c = d.node("C", "Node C")
        d.edge(a, b, "label")
        d.edge(b, c, "label", style="dashed")

    d.render("output_path")
"""

from .diagram import BlogDiagram
from .theme import Theme, THEMES

__all__ = ["BlogDiagram", "Theme", "THEMES"]
__version__ = "0.1.0"
