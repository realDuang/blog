"""TTS provider plugins — pluggable text-to-speech backends."""

from .base import TTSProvider
from .edge import EdgeTTSProvider
from .gpt_sovits import GPTSoVITSProvider

PROVIDERS: dict[str, type[TTSProvider]] = {
    "edge": EdgeTTSProvider,
    "gpt-sovits": GPTSoVITSProvider,
}

DEFAULT_PROVIDER = "edge"


def get_provider(name: str, **kwargs) -> TTSProvider:
    """Instantiate a TTS provider by name.

    Args:
        name: provider key (e.g. "edge", "gpt-sovits")
        **kwargs: forwarded to the provider constructor

    Returns:
        a ready-to-use TTSProvider instance
    """
    cls = PROVIDERS.get(name)
    if cls is None:
        available = ", ".join(PROVIDERS.keys())
        raise ValueError(f"Unknown TTS provider '{name}'. Available: {available}")
    return cls(**kwargs)
