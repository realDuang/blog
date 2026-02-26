"""GPT-SoVITS provider — local voice cloning via GPT-SoVITS API v2."""

import asyncio
import wave
from pathlib import Path

import httpx

from .base import TTSProvider

DEFAULT_API_URL = "http://127.0.0.1:9880"
DEFAULT_SPEED = 1.2  # slightly faster than 1.0 to match mainstream pacing


def _get_wav_duration(filepath: str) -> float:
    """Get exact WAV file duration from header."""
    try:
        with wave.open(filepath, "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            if rate > 0:
                return round(frames / rate, 2)
    except Exception:
        pass
    # fallback: estimate from file size (16-bit mono 32kHz ≈ 64KB/s)
    size = Path(filepath).stat().st_size
    return round(size / 64000, 2)


class GPTSoVITSProvider(TTSProvider):
    """GPT-SoVITS V4 — high-quality Chinese voice cloning.

    Requires a running GPT-SoVITS api_v2.py server:
        python api_v2.py -a 127.0.0.1 -p 9880

    Constructor args:
        api_url:         base URL of the API server
        ref_audio_path:  path to the reference audio clip (3-10s recommended)
        prompt_text:     transcript of the reference audio
        prompt_lang:     language of the prompt ("zh", "en", "ja", etc.)
        text_lang:       language of the narration text
        speed_factor:    playback speed multiplier (1.0 = normal)
        media_type:      output format ("wav", "raw", "ogg", "aac")
        gpt_weights:     GPT model .ckpt path (auto-loaded on first call)
        sovits_weights:  SoVITS model .pth path (auto-loaded on first call)
        temperature:     sampling temperature — lower = more stable (default 0.6)
        top_k:           top-K sampling — lower = fewer random tokens (default 10)
        top_p:           nucleus sampling — lower = less randomness (default 0.8)
        repetition_penalty: T2S repetition penalty (default 1.35)
        seed:            random seed for reproducibility (-1 = random)
        text_split_method: text splitting strategy (default "cut3", split by 。)
    """

    name = "gpt-sovits"

    def __init__(
        self,
        api_url: str = DEFAULT_API_URL,
        ref_audio_path: str = "",
        prompt_text: str = "",
        prompt_lang: str = "zh",
        text_lang: str = "zh",
        speed_factor: float = DEFAULT_SPEED,
        media_type: str = "wav",
        gpt_weights: str = "",
        sovits_weights: str = "",
        # Sampling parameters — conservative defaults to reduce unwanted emotion
        temperature: float = 0.6,
        top_k: int = 10,
        top_p: float = 0.8,
        repetition_penalty: float = 1.35,
        seed: int = -1,
        text_split_method: str = "cut3",
        **_kwargs,
    ):
        self.api_url = api_url.rstrip("/")
        self.ref_audio_path = ref_audio_path
        self.prompt_text = prompt_text
        self.prompt_lang = prompt_lang
        self.text_lang = text_lang
        self.speed_factor = speed_factor
        self.media_type = media_type
        self.gpt_weights = gpt_weights
        self.sovits_weights = sovits_weights
        self.temperature = temperature
        self.top_k = top_k
        self.top_p = top_p
        self.repetition_penalty = repetition_penalty
        self.seed = seed
        self.text_split_method = text_split_method
        self._weights_loaded = False

        # Speaker profiles for dual-speaker dialogue support
        # Map: speaker_name -> { gpt_weights, sovits_weights, ref_audio_path, prompt_text }
        self._speaker_profiles: dict[str, dict] = {}
        self._current_speaker: str = ""

        # Load weights immediately (synchronous, blocking) so we don't
        # hit timeout issues inside the async TTS loop.
        self._ensure_weights_loaded()

    def _ensure_weights_loaded(self):
        """Load GPT and SoVITS model weights via API (synchronous, once)."""
        if self._weights_loaded:
            return
        if not self.gpt_weights and not self.sovits_weights:
            self._weights_loaded = True
            return

        with httpx.Client(timeout=600) as client:
            if self.gpt_weights:
                r = client.get(
                    f"{self.api_url}/set_gpt_weights",
                    params={"weights_path": self.gpt_weights},
                )
                if r.status_code != 200:
                    raise RuntimeError(f"Failed to load GPT weights: {r.text[:300]}")
                print(f"  Loaded GPT weights: {self.gpt_weights}")
            if self.sovits_weights:
                r = client.get(
                    f"{self.api_url}/set_sovits_weights",
                    params={"weights_path": self.sovits_weights},
                )
                if r.status_code != 200:
                    raise RuntimeError(f"Failed to load SoVITS weights: {r.text[:300]}")
                print(f"  Loaded SoVITS weights: {self.sovits_weights}")

        self._weights_loaded = True

    def register_speaker(self, name: str, profile: dict) -> None:
        """Register a speaker profile for dialogue mode.

        Args:
            name: speaker identifier (e.g. "A", "B")
            profile: dict with keys:
                gpt_weights: str — path to GPT .ckpt model
                sovits_weights: str — path to SoVITS .pth model
                ref_audio_path: str — path to reference audio clip
                prompt_text: str — transcript of the reference audio
        """
        self._speaker_profiles[name] = profile
        print(f"  Registered speaker '{name}': {profile.get('ref_audio_path', '(default)')}")

    def switch_speaker(self, name: str) -> None:
        """Switch to a registered speaker profile by loading its weights.

        Skips weight loading if the speaker is already active.
        """
        if name == self._current_speaker:
            return

        profile = self._speaker_profiles.get(name)
        if not profile:
            return  # Use default settings if speaker not registered

        gpt_w = profile.get("gpt_weights", "")
        sovits_w = profile.get("sovits_weights", "")
        ref = profile.get("ref_audio_path", "")
        prompt = profile.get("prompt_text", "")

        # Load model weights if different from current
        with httpx.Client(timeout=600) as client:
            if gpt_w:
                r = client.get(
                    f"{self.api_url}/set_gpt_weights",
                    params={"weights_path": gpt_w},
                )
                if r.status_code != 200:
                    raise RuntimeError(f"Failed to load GPT weights for speaker '{name}': {r.text[:300]}")
            if sovits_w:
                r = client.get(
                    f"{self.api_url}/set_sovits_weights",
                    params={"weights_path": sovits_w},
                )
                if r.status_code != 200:
                    raise RuntimeError(f"Failed to load SoVITS weights for speaker '{name}': {r.text[:300]}")

        # Update instance ref audio for subsequent generate() calls
        if ref:
            self.ref_audio_path = ref
        if prompt:
            self.prompt_text = prompt

        # Apply per-speaker speed factor if configured
        speed = profile.get("speed_factor")
        if speed is not None:
            self.speed_factor = speed

        self._current_speaker = name
        print(f"  Switched to speaker '{name}'" + (f" (speed={speed})" if speed else ""))

    async def generate(self, text: str, output_path: Path, **kwargs) -> dict:
        # Allow per-call overrides
        payload = {
            "text": text,
            "text_lang": kwargs.get("text_lang", self.text_lang),
            "ref_audio_path": kwargs.get("ref_audio_path", self.ref_audio_path),
            "prompt_text": kwargs.get("prompt_text", self.prompt_text),
            "prompt_lang": kwargs.get("prompt_lang", self.prompt_lang),
            "speed_factor": kwargs.get("speed_factor", self.speed_factor),
            "media_type": kwargs.get("media_type", self.media_type),
            "streaming_mode": False,
            "text_split_method": kwargs.get("text_split_method", self.text_split_method),
            "temperature": kwargs.get("temperature", self.temperature),
            "top_k": kwargs.get("top_k", self.top_k),
            "top_p": kwargs.get("top_p", self.top_p),
            "repetition_penalty": kwargs.get("repetition_penalty", self.repetition_penalty),
            "seed": kwargs.get("seed", self.seed),
        }

        # Remove empty optional fields so the API uses its defaults
        if not payload["ref_audio_path"]:
            del payload["ref_audio_path"]
        if not payload["prompt_text"]:
            del payload["prompt_text"]

        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(f"{self.api_url}/tts", json=payload)

            if resp.status_code != 200:
                error_detail = resp.text[:500]
                raise RuntimeError(
                    f"GPT-SoVITS API error ({resp.status_code}): {error_detail}"
                )

            # Write audio stream to file
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(resp.content)

        duration = _get_wav_duration(str(output_path))

        return {
            "audio_file": str(output_path),
            "duration_seconds": duration,
        }

    def get_audio_extension(self) -> str:
        return self.media_type
