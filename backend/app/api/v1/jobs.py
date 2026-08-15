"""Job Description Analysis API Router for ORBIT."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.jd_parser import parse_job_description
from app.services.supabase_client import supabase_service

router = APIRouter()


class JobAnalyzeRequest(BaseModel):
    raw_description: str = Field(..., min_length=15, description="Raw job description text")
    title: Optional[str] = "AI/ML Engineer"
    company: Optional[str] = "Benchmark Org"
    department: Optional[str] = "Engineering"
    level: Optional[str] = "Target Role"
    location: Optional[str] = "Remote / Hybrid"
    salary_range: Optional[str] = "$130,000 - $180,000"


class JobAnalyzeResponse(BaseModel):
    id: str
    title: str
    company: str
    department: str
    level: str
    location: str
    salary_range: Optional[str]
    raw_description: str
    required_skills: List[Dict[str, Any]]
    preferred_skills: List[Dict[str, Any]]
    responsibilities: List[str]
    total_skills_detected: int
    created_at: str


@router.post(
    "/analyze",
    response_model=JobAnalyzeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze Raw Job Description Text"
)
async def analyze_job(request: JobAnalyzeRequest):
    """Parses raw job description text into a structured requirement taxonomy,
    classifies Required vs Preferred skills, calculates normalized algorithmic weights,
    and persists the job description to the database.
    """
    try:
        extracted = parse_job_description(
            raw_text=request.raw_description,
            title=request.title,
            company=request.company,
            department=request.department,
            level=request.level,
            location=request.location,
            salary_range=request.salary_range
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing job description: {str(e)}"
        )

    # Persist Job to Database
    job_record = {
        "title": extracted.title,
        "company": extracted.company,
        "department": extracted.department,
        "level": extracted.level,
        "location": extracted.location,
        "salary_range": extracted.salary_range,
        "raw_description": extracted.raw_description,
        "required_skills": extracted.required_skills,
        "preferred_skills": extracted.preferred_skills,
        "responsibilities": extracted.responsibilities
    }

    saved_job = await supabase_service.create_job_description(job_record)

    return JobAnalyzeResponse(
        id=saved_job["id"],
        title=saved_job["title"],
        company=saved_job["company"],
        department=saved_job.get("department", "Engineering"),
        level=saved_job.get("level", "Target Role"),
        location=saved_job.get("location", "Remote"),
        salary_range=saved_job.get("salary_range"),
        raw_description=saved_job["raw_description"],
        required_skills=saved_job["required_skills"],
        preferred_skills=saved_job["preferred_skills"],
        responsibilities=saved_job.get("responsibilities", []),
        total_skills_detected=extracted.total_skills_detected,
        created_at=saved_job["created_at"]
    )
