import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.database import get_db
from app.models import Story
from app.schemas import (
    StoryGenerateRequest,
    StoryGenerateResponse,
    AlternateEndingRequest,
    AlternateEndingResponse,
    StorySaveRequest,
    StoryResponse,
)
from app.services.ai_service import ai_service

logger = logging.getLogger("digital_seance.routers.stories")
router = APIRouter(prefix="/api/stories", tags=["stories"])

@router.post("/generate", response_model=StoryGenerateResponse)
def generate_story(req: StoryGenerateRequest):
    """
    Summons a supernatural narrative using the open-weight AI model.
    Direct local Transformers inference. Never returns fake responses.
    """
    try:
        result = ai_service.generate_story(
            prompt=req.prompt,
            spirit=req.spirit,
            length=req.length,
            tone=req.tone,
            language=req.language,
            temperature=req.temperature,
            max_new_tokens=req.max_new_tokens
        )
        return StoryGenerateResponse(**result)
    except RuntimeError as e:
        logger.warning(f"Generation unavailable: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Story generation failed: {str(e)}"
        )

@router.post("/alternate-ending", response_model=AlternateEndingResponse)
def generate_alternate_ending(req: AlternateEndingRequest):
    """
    Generates a haunting alternate ending for an existing story
    using the open-weight AI model.
    """
    try:
        result = ai_service.generate_alternate_ending(
            original_input=req.original_input,
            original_story=req.original_story,
            spirit=req.spirit,
            tone=req.tone,
            language=req.language,
            temperature=req.temperature
        )
        return AlternateEndingResponse(**result)
    except RuntimeError as e:
        logger.warning(f"Alternate ending generation unavailable: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected alternate ending error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Alternate ending generation failed: {str(e)}"
        )

@router.get("", response_model=List[StoryResponse])
def get_stories(
    search: Optional[str] = Query(None, description="Search term for title or content"),
    spirit: Optional[str] = Query(None, description="Filter by spirit guide"),
    tone: Optional[str] = Query(None, description="Filter by atmospheric tone"),
    sort: Optional[str] = Query("newest", description="'newest' or 'oldest'"),
    db: Session = Depends(get_db)
):
    """
    Retrieves archived stories from the Haunted Archive with search and filters.
    """
    query = db.query(Story)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Story.title.ilike(search_filter)) |
            (Story.generated_story.ilike(search_filter)) |
            (Story.original_input.ilike(search_filter))
        )

    if spirit and spirit != "all":
        query = query.filter(Story.spirit == spirit)

    if tone and tone != "all":
        query = query.filter(Story.tone == tone)

    if sort == "oldest":
        query = query.order_by(asc(Story.created_at))
    else:
        query = query.order_by(desc(Story.created_at))

    stories = query.all()
    return [StoryResponse(**s.to_dict()) for s in stories]

@router.get("/{story_id}", response_model=StoryResponse)
def get_story(story_id: str, db: Session = Depends(get_db)):
    """Retrieve a single story from the Haunted Archive by ID."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found in the archive.")
    return StoryResponse(**story.to_dict())

@router.post("", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
def save_story(req: StorySaveRequest, db: Session = Depends(get_db)):
    """Persists a generated story into the Haunted Archive in SQLite."""
    story = Story(
        title=req.title,
        original_input=req.original_input,
        generated_story=req.generated_story,
        spirit=req.spirit,
        tone=req.tone,
        language=req.language,
        model_id=req.model_id,
        duration_seconds=req.duration_seconds,
        alternate_ending=req.alternate_ending
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return StoryResponse(**story.to_dict())

@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(story_id: str, db: Session = Depends(get_db)):
    """Permanently purges a story from the Haunted Archive."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found in the archive.")
    db.delete(story)
    db.commit()
    return None

@router.patch("/{story_id}/alternate-ending", response_model=StoryResponse)
def attach_alternate_ending(
    story_id: str,
    alternate_ending: str,
    db: Session = Depends(get_db)
):
    """Saves or updates an alternate ending for an archived story."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found in the archive.")
    story.alternate_ending = alternate_ending
    db.commit()
    db.refresh(story)
    return StoryResponse(**story.to_dict())

