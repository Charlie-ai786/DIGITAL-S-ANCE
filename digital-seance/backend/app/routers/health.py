import threading
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.schemas import HealthResponse, ModelStatusResponse
from app.services.ai_service import ai_service
from app.database import engine

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            pass
    except Exception as e:
        db_status = f"error: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status,
        model_status=ai_service.status,
        model_id=settings.MODEL_ID,
        version=settings.APP_VERSION
    )

@router.get("/model/status", response_model=ModelStatusResponse)
def get_model_status():
    status_dict = ai_service.get_status()
    return ModelStatusResponse(**status_dict)

@router.post("/model/load")
def trigger_model_load():
    """Trigger background loading of open-weight model weights."""
    if ai_service.status == "ready":
        return {"message": "Model is already loaded and ready.", "status": ai_service.status}
    if ai_service.status == "loading":
        return {"message": "Model is currently loading.", "status": ai_service.status}

    threading.Thread(target=ai_service.load_model, daemon=True).start()
    return {"message": f"Started loading weights for {ai_service.model_id} on {ai_service.device}.", "status": "loading"}
