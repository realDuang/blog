"""Abstract base class for TTS providers."""

from abc import ABC, abstractmethod
from pathlib import Path


class TTSProvider(ABC):
    """Base interface that all TTS backends must implement."""

    # Subclasses should set a human-readable name
    name: str = "base"

    @abstractmethod
    async def generate(
        self,
        text: str,
        output_path: Path,
        **kwargs,
    ) -> dict:
        """Generate a single audio file from text.

        Args:
            text: the narration string to synthesise
            output_path: target file path (provider decides extension)
            **kwargs: provider-specific options

        Returns:
            dict with at least:
                audio_file: str   — path to the generated file
                duration_seconds: float
        """
        ...

    def get_audio_extension(self) -> str:
        """Return the file extension this provider produces (without dot)."""
        return "mp3"
