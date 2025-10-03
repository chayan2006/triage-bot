# app/routers/tts.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from app.services.tts_service import synthesize

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("")
@router.post("/")
@router.post("/tts")
async def tts_endpoint(req: TTSRequest):
    try:
        audio_bytes = synthesize(req.text)
        if not audio_bytes:
            return Response(content=b"", media_type="audio/wav")
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"TTS error: {e}")
