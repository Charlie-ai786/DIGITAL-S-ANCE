import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.routers import health, stories, whisper

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("digital_seance")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down Digital Séance API.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Digital Séance — Open-weight AI supernatural storytelling.",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev + deployed Render frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request duration & safety middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    
    # Request size guard (limit to 500KB payload to prevent abuse)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 512 * 1024:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request payload too large (max 512 KB)."}
        )

    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Include Routers
app.include_router(health.router)
app.include_router(stories.router)
app.include_router(whisper.router)

@app.get("/")
def root():
    return {
        "app": "Digital Séance API",
        "tagline": "The past has a story. Let the machine tell it.",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "model_status": "/api/model/status"
    }

