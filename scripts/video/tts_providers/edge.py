"""EdgeTTS provider — free Microsoft Edge text-to-speech."""

import struct
from pathlib import Path

import edge_tts

from .base import TTSProvider

# Available Chinese voices
VOICES = {
    "male": "zh-CN-YunxiNeural",
    "female": "zh-CN-XiaoxiaoNeural",
    "male2": "zh-CN-YunjianNeural",
    "female2": "zh-CN-XiaoyiNeural",
}

DEFAULT_VOICE = VOICES["male"]
DEFAULT_RATE = "+20%"  # slightly faster to match mainstream video pacing


def _get_mp3_duration(filepath: str) -> float:
    """Estimate MP3 duration from file size and bitrate.

    edge-tts outputs 48kbps MP3 by default. For more accurate duration,
    we parse the first MP3 frame header to get the actual bitrate.
    """
    path = Path(filepath)
    file_size = path.stat().st_size

    bitrate = 48000  # default fallback
    try:
        with open(filepath, "rb") as f:
            data = f.read(4096)
            for i in range(len(data) - 3):
                if data[i] == 0xFF and (data[i + 1] & 0xE0) == 0xE0:
                    header = struct.unpack(">I", data[i:i+4])[0]
                    version = (header >> 19) & 3
                    layer = (header >> 17) & 3
                    bitrate_index = (header >> 12) & 0xF

                    if version == 3 and layer == 1:  # MPEG1 Layer 3
                        br_table = [0, 32, 40, 48, 64, 80, 96, 112,
                                    128, 160, 192, 224, 256, 320, 0]
                        if 1 <= bitrate_index <= 13:
                            bitrate = br_table[bitrate_index] * 1000
                    elif version in (0, 2) and layer == 1:  # MPEG2/2.5 Layer 3
                        br_table = [0, 8, 16, 24, 32, 40, 48, 56,
                                    64, 80, 96, 112, 128, 144, 160]
                        if 1 <= bitrate_index <= 14:
                            bitrate = br_table[bitrate_index] * 1000
                    break
    except Exception:
        pass

    if bitrate <= 0:
        bitrate = 48000
    duration = (file_size * 8) / bitrate
    return round(duration, 2)


class EdgeTTSProvider(TTSProvider):
    """Microsoft Edge TTS — free, no API key, good Chinese voices."""

    name = "edge"

    def __init__(self, voice: str = DEFAULT_VOICE, rate: str = DEFAULT_RATE,
                 volume: str = "+0%", **_kwargs):
        self.voice = voice
        self.rate = rate
        self.volume = volume

    async def generate(self, text: str, output_path: Path, **kwargs) -> dict:
        voice = kwargs.get("voice", self.voice)
        rate = kwargs.get("rate", self.rate)
        volume = kwargs.get("volume", self.volume)

        communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
        await communicate.save(str(output_path))

        duration = _get_mp3_duration(str(output_path))

        return {
            "audio_file": str(output_path),
            "duration_seconds": duration,
        }

    def get_audio_extension(self) -> str:
        return "mp3"
