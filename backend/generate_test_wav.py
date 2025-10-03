import pyttsx3
import wave

# Initialize TTS engine
engine = pyttsx3.init()
engine.save_to_file("Hello, I have a sore throat", "test_audio.wav")
engine.runAndWait()

print("✅ test_audio.wav generated successfully!")
