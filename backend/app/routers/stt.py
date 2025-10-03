# app/routers/stt.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio  # use your existing service

router = APIRouter()

# Accept both "/" and "/stt" to be resilient while you switch the frontend
@router.post("")
@router.post("/")
@router.post("/stt")
async def stt_endpoint(file: UploadFile = File(...)):
    try:
        # If your service needs a file path, write to a temp file
        import tempfile, os
        data = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        transcript = transcribe_audio(tmp_path)   # <-- keep your existing logic
        os.remove(tmp_path)

        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"STT error: {e}")
