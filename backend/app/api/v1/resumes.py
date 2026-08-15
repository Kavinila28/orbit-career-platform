"""Resume Ingestion API Router for ORBIT."""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.pdf_parser import parse_resume_pdf
from app.services.supabase_client import supabase_service

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class ResumeUploadResponse(BaseModel):
    id: str
    name: str
    title: str
    email: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    github_username: Optional[str] = None
    resume_text: str
    extracted_skills: List[Dict[str, Any]]
    stats: Dict[str, Any]
    sections_detected: List[str]
    created_at: str


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and Parse Real PDF Resume"
)
async def upload_resume(file: UploadFile = File(...)):
    """Uploads a PDF resume, parses raw text with pypdf, segments sections,
    extracts technical skills with strict evidence states, and persists candidate record.
    """
    # 1. Validate File Type
    if not file.filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF format is supported for resume uploads."
        )

    # 2. Read Binary Content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum limit of 10MB."
        )

    # 3. Parse PDF with pypdf
    try:
        extracted = parse_resume_pdf(content)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while parsing PDF resume: {str(e)}"
        )

    # 4. Save Candidate to Database (Supabase / In-Memory Fallback)
    candidate_record = {
        "name": extracted.name,
        "title": "Software Engineer",
        "email": extracted.email,
        "location": extracted.location,
        "education": extracted.education,
        "github_username": extracted.github_username,
        "resume_text": extracted.raw_text,
        "extracted_skills": extracted.extracted_skills,
        "stats": extracted.stats,
        "verified_badges": []
    }

    saved_candidate = await supabase_service.create_candidate(candidate_record)

    return ResumeUploadResponse(
        id=saved_candidate["id"],
        name=saved_candidate["name"],
        title=saved_candidate.get("title", "Software Engineer"),
        email=saved_candidate.get("email"),
        location=saved_candidate.get("location"),
        education=saved_candidate.get("education"),
        github_username=saved_candidate.get("github_username"),
        resume_text=saved_candidate["resume_text"],
        extracted_skills=saved_candidate["extracted_skills"],
        stats=saved_candidate["stats"],
        sections_detected=list(extracted.sections.keys()),
        created_at=saved_candidate["created_at"]
    )
