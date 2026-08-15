from fastapi import APIRouter
from app.api.v1 import health, resumes, jobs, readiness, github

api_v1_router = APIRouter()

# Register API Sub-routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_v1_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_v1_router.include_router(readiness.router, prefix="/readiness", tags=["Readiness"])
api_v1_router.include_router(github.router, prefix="/github", tags=["GitHub"])
