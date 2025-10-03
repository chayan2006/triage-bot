# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all routers
from app.routers import translate, stt, tts, triage, health

app = FastAPI(title="Healthcare Triage Bot")

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ⚠️ In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {"message": "Healthcare Triage Bot API is running 🚑"}

# Register routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(translate.router, prefix="/translate", tags=["Translate"])
app.include_router(stt.router, prefix="/stt", tags=["Speech-to-Text"])
app.include_router(tts.router, prefix="/tts", tags=["Text-to-Speech"])
app.include_router(triage.router, prefix="/triage", tags=["Triage"])
