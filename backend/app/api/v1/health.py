from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str
    service: str


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
async def health_check():
    """Returns the operational status of the ORBIT FastAPI backend."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
        service=settings.PROJECT_NAME
    )
