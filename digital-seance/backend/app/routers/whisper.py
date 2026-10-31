import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas import WhisperRequest, WhisperResponse
from app.services.ai_service import ai_service

logger = logging.getLogger("digital_seance.routers.whisper")
router = APIRouter(prefix="/api/stories", tags=["whisper"])

@router.post("/whisper", response_model=WhisperResponse)
def summon_whisper(req: WhisperRequest):
    """
    Summons a short, mysterious supernatural message (The Final Whisper)
    using the open-weight AI model.
    """
    try:
        result = ai_service.generate_whisper(
            category=req.category,
            language=req.language
        )
        return WhisperResponse(**result)
    except RuntimeError as e:
        logger.warning(f"Whisper generation unavailable: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Whisper inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"The machine could not channel the whisper: {str(e)}"
        )
