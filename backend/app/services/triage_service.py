# backend/app/services/triage_service.py
import google.generativeai as genai
from app.config import settings   # loads from .env

# Configure Gemini API
genai.configure(api_key=settings.GOOGLE_API_KEY)

# Use the correct model
model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

def triage_symptoms(symptoms: str, lang: str = "en") -> str:
    """
    Use Gemini to analyze symptoms and give triage advice.
    """
    prompt = f"""
    You are a healthcare triage bot. The user symptoms are:
    {symptoms} (language: {lang}).

    Provide:
    1. Possible common causes (not diagnosis).
    2. Recommendation: Home remedy / Visit doctor / Emergency.
    Keep it short and easy to understand.
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return {"error": f"Error generating triage: {str(e)}"}
