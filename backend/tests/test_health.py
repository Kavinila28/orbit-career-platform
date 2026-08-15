import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verify that GET /api/v1/health returns healthy status code 200."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == settings.VERSION
        assert data["environment"] == settings.ENVIRONMENT
        assert "timestamp" in data
        assert data["service"] == settings.PROJECT_NAME


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verify that GET / returns API metadata."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["health"] == "/api/v1/health"
