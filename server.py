"""Optional FastAPI backend for OpenAI-powered responses.
Set OPENAI_API_KEY in the environment to enable the hosted GenAI assistant.
Without it, the frontend uses its built-in guidance fallback.
"""
import os
from typing import Any
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="AirAware AI")
class AskRequest(BaseModel):
    question: str
    city: str = "Hyderabad"
    air: dict[str, Any] | None = None
    profile: str = "family"

@app.post("/api/assistant")
async def assistant(req: AskRequest):
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return {"answer": None, "mode": "fallback"}
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        reading = req.air or {}
        prompt = (
            "You are AirAware, a cautious urban air-quality education assistant. "
            "Give concise, practical advice, not diagnosis. Never claim AQI predicts an individual's health. "
            "Distinguish general guidance from urgent medical advice; recommend local public-health guidance "
            "and clinician advice for symptoms or high-risk conditions. Do not invent readings. "
            f"Location: {req.city}. Household profile: {req.profile}. "
            f"Latest supplied air data: {reading}. User question: {req.question}"
        )
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            input=prompt,
            max_output_tokens=350,
        )
        return {"answer": response.output_text, "mode": "openai"}
    except Exception:
        return {"answer": None, "mode": "fallback"}

# Serve the frontend from the same origin for easy local deployment.
app.mount("/", StaticFiles(directory=".", html=True), name="static")
