import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Float
from app.database import Base

class Story(Base):
    __tablename__ = "stories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(255), nullable=False)
    original_input = Column(Text, nullable=False)
    generated_story = Column(Text, nullable=False)
    spirit = Column(String(64), nullable=False)
    tone = Column(String(64), nullable=False)
    language = Column(String(32), default="English", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    model_id = Column(String(128), nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=True)
    alternate_ending = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "original_input": self.original_input,
            "generated_story": self.generated_story,
            "spirit": self.spirit,
            "tone": self.tone,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "model_id": self.model_id,
            "duration_seconds": self.duration_seconds,
            "alternate_ending": self.alternate_ending
        }
