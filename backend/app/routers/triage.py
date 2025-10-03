from fastapi import APIRouter
from pydantic import BaseModel
from app.services.triage_service import triage_symptoms

router = APIRouter()

class TriageRequest(BaseModel):
    symptoms: str
    language: str = "en"   # user’s input language

@router.post("/")
async def triage(req: TriageRequest):
    """
    Triage endpoint – takes symptoms, returns advice.
    """
    result = triage_symptoms(req.symptoms, req.language)
    return {"triage": result}
