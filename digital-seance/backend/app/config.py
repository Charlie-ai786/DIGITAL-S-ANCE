import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    # Model configuration
    MODEL_ID: str = os.getenv("MODEL_ID", "Qwen/Qwen2.5-3B-Instruct")
    MODEL_DEVICE: str = os.getenv("MODEL_DEVICE", "auto")
    MODEL_DTYPE: str = os.getenv("MODEL_DTYPE", "auto")
    MAX_NEW_TOKENS: int = int(os.getenv("MAX_NEW_TOKENS", "700"))
    REPETITION_PENALTY: float = float(os.getenv("REPETITION_PENALTY", "1.1"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    TOP_P: float = float(os.getenv("TOP_P", "0.9"))
    MODEL_LOAD_ON_STARTUP: bool = os.getenv("MODEL_LOAD_ON_STARTUP", "false").lower() in ("true", "1", "yes")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./digital_seance.db")

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    APP_NAME: str = "Digital Séance API"
    APP_VERSION: str = "1.0.0"

settings = Settings()
