import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Story
from app.services.ai_service import ai_service

# Test database in memory with StaticPool to share connection across sessions
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["database"] == "connected"
    assert "version" in data
    assert "model_id" in data

def test_model_status_endpoint():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_id" in data
    assert "status" in data
    assert "is_loaded" in data
    assert "device" in data
    assert "generation_available" in data

def test_input_validation_empty_prompt():
    # Prompt must be at least 5 characters
    payload = {
        "prompt": "abc",
        "spirit": "The Forgotten One",
        "length": "medium",
        "tone": "Psychological horror"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 422  # Unprocessable Entity from pydantic

def test_model_unavailable_handling(monkeypatch):
    # Ensure if model is unloaded or cannot load, API returns 503 rather than fake data
    monkeypatch.setattr(ai_service, "load_model", lambda: False)
    ai_service.status = "error"
    ai_service.error_message = "Weights not loaded on low-memory instance"
    ai_service.model = None

    payload = {
        "prompt": "I discovered an antique mirror in the attic covered by dark velvet cloth.",
        "spirit": "The Shadow",
        "length": "short",
        "tone": "Psychological horror",
        "language": "English"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 503
    assert "not loaded" in response.json()["detail"].lower() or "unavailable" in response.json()["detail"].lower()

def test_haunted_archive_crud():
    # 1. Save story to archive
    story_data = {
        "title": "Echoes in the Attic",
        "original_input": "An antique mirror found in the grandfather's attic.",
        "generated_story": "The silver was tarnished, yet the reflection refused to blink...",
        "spirit": "The Forgotten One",
        "tone": "Gothic mystery",
        "language": "English",
        "model_id": "Qwen/Qwen2.5-3B-Instruct",
        "duration_seconds": 3.42,
        "alternate_ending": None
    }
    create_res = client.post("/api/stories", json=story_data)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == "Echoes in the Attic"
    story_id = created["id"]

    # 2. Get list of stories
    list_res = client.get("/api/stories")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["id"] == story_id

    # 3. Filter by spirit
    filter_match = client.get("/api/stories?spirit=The%20Forgotten%20One")
    assert len(filter_match.json()) == 1
    filter_mismatch = client.get("/api/stories?spirit=The%20Shadow")
    assert len(filter_mismatch.json()) == 0

    # 4. Search
    search_res = client.get("/api/stories?search=mirror")
    assert len(search_res.json()) == 1

    # 5. Get by ID
    get_res = client.get(f"/api/stories/{story_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == story_id

    # 6. Attach alternate ending
    patch_res = client.patch(
        f"/api/stories/{story_id}/alternate-ending?alternate_ending=The%20mirror%20shattered%20from%20within."
    )
    assert patch_res.status_code == 200
    assert "mirror shattered" in patch_res.json()["alternate_ending"]

    # 7. Delete story
    del_res = client.delete(f"/api/stories/{story_id}")
    assert del_res.status_code == 204

    # 8. Verify deleted
    get_deleted = client.get(f"/api/stories/{story_id}")
    assert get_deleted.status_code == 404

def test_alternate_ending_unavailable_handling(monkeypatch):
    monkeypatch.setattr(ai_service, "load_model", lambda: False)
    ai_service.status = "error"
    ai_service.model = None

    payload = {
        "original_input": "Found a key with no door.",
        "original_story": "The key remained in the pocket, humming faintly in the moonlight.",
        "spirit": "The Lost Traveler",
        "tone": "Supernatural suspense"
    }
    response = client.post("/api/stories/alternate-ending", json=payload)
    assert response.status_code == 503

def test_whisper_unavailable_handling(monkeypatch):
    monkeypatch.setattr(ai_service, "load_model", lambda: False)
    ai_service.status = "error"
    ai_service.model = None

    payload = {
        "category": "Midnight warning",
        "language": "English"
    }
    response = client.post("/api/stories/whisper", json=payload)
    assert response.status_code == 503
