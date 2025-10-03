https://chayan2006.github.io/triage-bot/
AI Medical Triage Frontend
This is a comprehensive, single-page web application designed to provide preliminary medical triage using Google's Gemini AI. It allows users to describe their symptoms in multiple languages and receive an instant risk assessment, potential conditions, and advice. The application is built with a focus on accessibility, intuitive UI, and providing immediate guidance in potential emergency situations.

✨ Features
AI-Powered Triage: Core functionality is powered by the Gemini API to analyze user-described symptoms and provide a structured, multi-lingual response.

Multi-Language Support: Users can interact with the application in several Indian languages including Hindi, Marathi, Bengali, Tamil, Telugu, and more, with both input and output being localized.

Voice-to-Text & Text-to-Speech: Integrated Web Speech API allows users to dictate their symptoms and have the AI-generated results read aloud.

Dual-Mode AI Assistant:

General Mode: Functions as a general health chatbot for non-urgent questions.

Emergency Mode: Automatically activates after a high-risk triage result to provide calming, step-by-step guidance while waiting for professional help.

Dynamic UI & Theming:

A beautiful, responsive interface with Light and Dark modes.

Calm, health-themed 3D background animations using Three.js.

Integrated Emergency Resources:

Nearby Hospitals: One-click redirection to Google Maps to find nearby hospitals using the user's geolocation.

Emergency Contacts: A dedicated page listing important national helpline numbers for India.

User Authentication: A complete login page with options for email/password and Google Sign-In, handled by the backend.

Feedback System: Users can provide feedback on the triage results, which is processed and stored by the custom backend.

💻 Technology Stack
Frontend: HTML5, Tailwind CSS, JavaScript (ES6 Modules)

Backend: Python (FastAPI)

AI & Machine Learning: Google Gemini API (for triage and chat)

3D Graphics: Three.js

Web APIs: Web Speech API (SpeechRecognition & SpeechSynthesis), Geolocation API

🌐 Backend & API Pipeline
The backend is a Python-based server built with FastAPI. It serves as a robust intermediary between the frontend and various third-party services, handling core business logic, AI interactions, and data processing.

API Endpoints
Triage: POST /api/triage

Body: { "symptoms": "...", "language": "en-US" }

Returns: A structured JSON TriageOutcome from the Gemini API, including risk level, probable conditions, explanation, and advice.

Speech-to-Text: POST /api/stt

Body: Multipart form data with file (audio) and language.

Returns: { "text": "...", "language": "..." }

Text-to-Speech: GET /api/tts

Query Params: ?text=...&language=hi

Returns: An audio/mpeg file.

Translation: POST /api/translate

Body: { "text": "...", "target_language": "en" }

Returns: { "text": "..." }

Supported Languages: GET /api/translate/languages

Returns: A list of supported language codes.

Nearby Providers: POST /api/providers/nearby

Body: { "lat": ..., "lon": ..., "radius_m": 5000 }

Returns: A list of nearby hospitals/clinics sourced from APIs like Overpass.

Core Triage Pipeline
The primary data flow for a voice-based triage request is designed as follows:

Frontend: Captures the user's voice and sends the audio file to the /api/stt endpoint.

Backend (STT): Transcribes the audio to text using a service like Vosk.

Backend (Translate): The transcribed text is sent to the translation service to be converted into English for the AI model.

Backend (Triage): The translated English text is sent to /api/triage, which securely communicates with the Gemini API to get the risk assessment and advice.

Backend (Localize): The English results from Gemini are translated back into the user's original language.

Frontend: The final, localized results are displayed. The user can then click a 'Play' button to send this text to the /api/tts endpoint to hear the results read aloud.

🚀 Getting Started
Frontend
No build process is needed. This is a self-contained, single-file application.

Open the ai-triage-frontend.html file in any modern web browser.

API Key: To connect to the AI, replace the placeholder GEMINI_API_KEY in the <script> section with your actual Google Gemini API key.

Backend URL: Ensure the fetch calls in the JavaScript point to the correct URL where your Python backend is running.

Backend
Set up the Python FastAPI server as described in its own repository/documentation.

Ensure all the API endpoints listed in the "Backend & API Pipeline" section are running and accessible from the frontend.

⚠️ Disclaimer
This application is intended for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
