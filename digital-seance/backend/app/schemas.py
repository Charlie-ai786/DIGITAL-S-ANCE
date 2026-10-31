from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class StoryGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=5000, description="User memory, diary fragment, or scenario")
    spirit: str = Field(default="The Forgotten One", description="Selected spirit guide")
    length: str = Field(default="medium", description="Length: short, medium, or long")
    tone: str = Field(default="Psychological horror", description="Atmospheric tone")
    language: str = Field(default="English", description="Language: English or Hindi")
    temperature: Optional[float] = Field(default=0.7, ge=0.1, le=1.5)
    max_new_tokens: Optional[int] = Field(default=None, ge=100, le=2048)

class StoryGenerateResponse(BaseModel):
    title: str
    story: str
    spirit: str
    tone: str
    language: str
    duration_seconds: float
    model_id: str

class AlternateEndingRequest(BaseModel):
    original_input: str = Field(..., min_length=5, max_length=5000)
    original_story: str = Field(..., min_length=20, max_length=15000)
    spirit: str = Field(default="The Forgotten One")
    tone: str = Field(default="Psychological horror")
    language: str = Field(default="English")
    temperature: Optional[float] = Field(default=0.75, ge=0.1, le=1.5)

class AlternateEndingResponse(BaseModel):
    alternate_ending: str
    duration_seconds: float
    model_id: str

class WhisperRequest(BaseModel):
    category: str = Field(..., description="Category: Forgotten memory, Midnight warning, Lost soul, Digital ghost, Strange coincidence")
    language: str = Field(default="English")

class WhisperResponse(BaseModel):
    whisper: str
    category: str
    model_id: str
    disclaimer: str = "Fictional atmospheric AI-generated fragment."

class StorySaveRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    original_input: str = Field(..., min_length=1)
    generated_story: str = Field(..., min_length=1)
    spirit: str = Field(..., max_length=64)
    tone: str = Field(..., max_length=64)
    language: str = Field(default="English", max_length=32)
    model_id: str = Field(..., max_length=128)
    duration_seconds: Optional[float] = 0.0
    alternate_ending: Optional[str] = None

class StoryResponse(BaseModel):
    id: str
    title: str
    original_input: str
    generated_story: str
    spirit: str
    tone: str
    language: str
    created_at: Optional[str] = None
    model_id: str
    duration_seconds: Optional[float] = 0.0
    alternate_ending: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ModelStatusResponse(BaseModel):
    model_id: str
    is_loaded: bool
    status: str  # "unloaded", "loading", "ready", "error"
    device: str
    dtype: str
    generation_available: bool
    error_message: Optional[str] = None
    max_new_tokens: int
    memory_info: Optional[dict] = None

class HealthResponse(BaseModel):
    status: str
    database: str
    model_status: str
    model_id: str
    version: str
