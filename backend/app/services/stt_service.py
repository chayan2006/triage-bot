import speech_recognition as sr
import tempfile

async def transcribe_audio(file) -> str:
    try:
        recognizer = sr.Recognizer()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(await file.read())
            temp_audio.flush()
            with sr.AudioFile(temp_audio.name) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                return text
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"
