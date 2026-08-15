from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application Settings loaded from environment variables."""
    PROJECT_NAME: str = "ORBIT — AI Career Intelligence & Readiness Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]

    # Supabase (Optional for Phase 1)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # GitHub
    GITHUB_TOKEN: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
