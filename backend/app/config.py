"""Configuration management for CodeGuard backend."""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file if present
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()  # Fall back to default search path


class Settings:
    """Backend application settings."""

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Security & Size Guards
    MAX_CODE_SIZE_BYTES: int = int(os.getenv("MAX_CODE_SIZE_BYTES", "102400"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # LLM & Pipeline Settings
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    ANALYZER_TIMEOUT_SECONDS: int = int(os.getenv("ANALYZER_TIMEOUT_SECONDS", "30"))
    GEMINI_TIMEOUT_SECONDS: int = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))
    AGENT_TIMEOUT_SECONDS: int = int(os.getenv("AGENT_TIMEOUT_SECONDS", "45"))
    PIPELINE_TIMEOUT_SECONDS: int = int(os.getenv("PIPELINE_TIMEOUT_SECONDS", "120"))

    # CORS Settings
    @property
    def CORS_ORIGINS(self) -> List[str]:
        raw = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        )
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


settings = Settings()
