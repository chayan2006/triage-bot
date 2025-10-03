# app/services/tts_service.py
import os
import tempfile
import pyttsx3


def synthesize(text: str) -> bytes:
    """
    Generate speech audio (WAV) for the given text and return the bytes.
    Uses Windows SAPI5 via pyttsx3, so it works offline.
    """
    if not text or not text.strip():
        return b""

    # init engine
    engine = pyttsx3.init()  # on Windows uses sapi5
    # optional tuning
    engine.setProperty("rate", 175)     # speaking rate
    engine.setProperty("volume", 1.0)   # 0.0 to 1.0

    # write to temp wav file then read bytes
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp_path = tmp.name

        engine.save_to_file(text, tmp_path)
        engine.runAndWait()

        with open(tmp_path, "rb") as f:
            data = f.read()
        return data
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
