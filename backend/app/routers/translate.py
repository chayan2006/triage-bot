from fastapi import APIRouter
from pydantic import BaseModel
from app.services.translate_service import translate_text

router = APIRouter(prefix="/translate", tags=["Translation"])

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "en"   # default: English

@router.post("/")
async def translate(req: TranslateRequest):
    """
    Translate given text into target language
    """
    return await translate_text(req.text, req.target_lang)
