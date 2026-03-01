"""GPT-SoVITS provider — local voice cloning via GPT-SoVITS API v2."""

import asyncio
import struct
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


def _trim_trailing_silence(filepath: str, threshold: float = 150, min_silence_sec: float = 0.8, keep_tail_sec: float = 0.15) -> float:
    """Trim trailing silence from a WAV file in-place.

    Scans backwards from the end to find the last sample above threshold,
    then truncates the file keeping a short tail for natural fade-out.

    Args:
        filepath: path to the WAV file (modified in-place)
        threshold: RMS amplitude threshold below which a chunk is considered silent
        min_silence_sec: only trim if trailing silence exceeds this duration
        keep_tail_sec: seconds of silence to keep after the last voiced chunk

    Returns:
        New duration in seconds (unchanged if no trim was needed).
    """
    with wave.open(filepath, "rb") as wf:
        params = wf.getparams()
        nframes = wf.getnframes()
        rate = wf.getframerate()
        nch = wf.getnchannels()
        sw = wf.getsampwidth()
        raw = wf.readframes(nframes)

    if nframes == 0 or rate == 0:
        return 0.0

    original_dur = nframes / rate
    chunk_samples = int(rate * 0.05)  # 50ms chunks for precision
    chunk_bytes = chunk_samples * nch * sw
    total_chunks = nframes // chunk_samples

    if total_chunks < 2:
        return round(original_dur, 2)

    # Find last non-silent chunk (scanning backwards)
    last_voiced_chunk = total_chunks - 1
    for ci in range(total_chunks - 1, -1, -1):
        offset = ci * chunk_bytes
        chunk = raw[offset:offset + chunk_bytes]
        if len(chunk) < chunk_bytes:
            continue
        samples = struct.unpack(f"<{len(chunk) // 2}h", chunk)
        rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
        if rms >= threshold:
            last_voiced_chunk = ci
            break
    else:
        # Entire file is silent — don't trim everything
        return round(original_dur, 2)

    voiced_end_sec = (last_voiced_chunk + 1) * chunk_samples / rate
    trailing_silence = original_dur - voiced_end_sec

    if trailing_silence < min_silence_sec:
        return round(original_dur, 2)

    # Trim: keep voiced audio + a short tail
    keep_frames = int((voiced_end_sec + keep_tail_sec) * rate)
    keep_frames = min(keep_frames, nframes)
    trimmed_bytes = raw[: keep_frames * nch * sw]

    with wave.open(filepath, "wb") as wf:
        wf.setparams(params)
        wf.writeframes(trimmed_bytes)

    new_dur = round(keep_frames / rate, 2)
    trimmed = round(original_dur - new_dur, 2)
    print(f"    Trimmed {trimmed}s trailing silence ({original_dur:.1f}s → {new_dur}s)")
    return new_dur


def _squeeze_internal_silence(filepath: str, threshold: float = 150, max_gap_sec: float = 0.6) -> float:
    """Compress long internal silence gaps in a WAV file.

    Scans through the audio and shortens any silence gap longer than
    max_gap_sec down to max_gap_sec. Preserves all voiced content.

    Args:
        filepath: path to the WAV file (modified in-place)
        threshold: RMS amplitude threshold for silence detection
        max_gap_sec: maximum allowed silence duration between voiced segments

    Returns:
        New duration in seconds.
    """
    with wave.open(filepath, "rb") as wf:
        params = wf.getparams()
        nframes = wf.getnframes()
        rate = wf.getframerate()
        nch = wf.getnchannels()
        sw = wf.getsampwidth()
        raw = wf.readframes(nframes)

    if nframes == 0 or rate == 0:
        return 0.0

    chunk_samples = int(rate * 0.05)  # 50ms chunks
    chunk_bytes = chunk_samples * nch * sw
    total_chunks = nframes // chunk_samples
    max_gap_chunks = int(max_gap_sec / 0.05)

    # Classify each chunk as voiced or silent
    voiced = []
    for ci in range(total_chunks):
        offset = ci * chunk_bytes
        chunk = raw[offset:offset + chunk_bytes]
        if len(chunk) < chunk_bytes:
            voiced.append(False)
            continue
        samples = struct.unpack(f"<{len(chunk) // 2}h", chunk)
        rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
        voiced.append(rms >= threshold)

    # Find silence runs and check if any exceed max_gap
    silence_runs = []
    run_start = None
    for ci in range(total_chunks):
        if not voiced[ci]:
            if run_start is None:
                run_start = ci
        else:
            if run_start is not None:
                run_len = ci - run_start
                if run_len > max_gap_chunks and run_start > 0:  # skip leading silence
                    silence_runs.append((run_start, run_len))
                run_start = None

    if not silence_runs:
        return round(nframes / rate, 2)

    # Rebuild audio: keep voiced chunks, compress silence gaps
    output_chunks = bytearray()
    ci = 0
    total_trimmed = 0
    while ci < total_chunks:
        # Check if this is the start of a compressible silence run
        matched_run = None
        for start, length in silence_runs:
            if ci == start:
                matched_run = (start, length)
                break

        if matched_run:
            start, length = matched_run
            # Keep only max_gap_chunks worth of silence
            keep = max_gap_chunks
            for k in range(keep):
                offset = (start + k) * chunk_bytes
                output_chunks.extend(raw[offset:offset + chunk_bytes])
            total_trimmed += length - keep
            ci = start + length
        else:
            offset = ci * chunk_bytes
            output_chunks.extend(raw[offset:offset + chunk_bytes])
            ci += 1

    # Also include any remaining samples after the last full chunk
    remaining_start = total_chunks * chunk_bytes
    if remaining_start < len(raw):
        output_chunks.extend(raw[remaining_start:])

    if total_trimmed > 0:
        with wave.open(filepath, "wb") as wf:
            wf.setparams(params)
            wf.writeframes(bytes(output_chunks))

        new_frames = len(output_chunks) // (nch * sw)
        new_dur = round(new_frames / rate, 2)
        trimmed_sec = round(total_trimmed * 0.05, 2)
        print(f"    Squeezed {trimmed_sec}s internal silence ({nframes/rate:.1f}s → {new_dur}s)")
        return new_dur

    return round(nframes / rate, 2)


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
            "batch_size": kwargs.get("batch_size", 4),
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

        # Auto-trim trailing silence to prevent GPT-SoVITS generating long silent tails
        duration = _trim_trailing_silence(str(output_path))
        # Compress any internal silence gaps > 0.6s
        duration = _squeeze_internal_silence(str(output_path))
        if duration == 0.0:
            duration = _get_wav_duration(str(output_path))

        return {
            "audio_file": str(output_path),
            "duration_seconds": duration,
        }

    def get_audio_extension(self) -> str:
        return self.media_type
