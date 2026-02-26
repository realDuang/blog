"""Blog article to video pipeline.

Three-layer architecture:
  Layer 1 (parser.py):  Markdown → segments.json
  Layer 2 (adapter.py): Segments → scenes.json (via LLM preset)
  Layer 3 (render.py):  Scenes → TTS audio + Remotion video → MP4
"""

__version__ = "0.1.0"
