from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Deterministic AI Career Intelligence & Readiness Platform Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to ORBIT API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
