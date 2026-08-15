"""Readiness Scoring API Router for ORBIT."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.scoring_engine import evaluate_readiness, ReadinessEvaluationResult
from app.services.supabase_client import supabase_service

router = APIRouter()


class ReadinessEvaluateRequest(BaseModel):
    candidate_id: str = Field(..., description="UUID of candidate in database")
    job_id: str = Field(..., description="UUID of job description in database")
    completed_milestones: List[str] = Field(default_factory=list, description="List of completed milestone IDs")
    # Optional direct repository payload for controlled test/fixture execution
    candidate_repos: Optional[List[Dict[str, Any]]] = None


class ReadinessEvaluateResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    overall_score: int
    base_score: int
    pillars: Dict[str, Any]
    gap_matrix: List[Dict[str, Any]]
    completed_milestones: List[str]
    status_badge: str
    rating: str
    created_at: str


@router.post(
    "/evaluate",
    response_model=ReadinessEvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Deterministic Career Readiness Evaluation"
)
async def evaluate_candidate_readiness(request: ReadinessEvaluateRequest):
    """Calculates deterministic 4-pillar readiness score and skill gap matrix
    comparing verified candidate technical evidence against target job requirements.
    """
    # 1. Fetch Candidate
    candidate = await supabase_service.get_candidate(request.candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{request.candidate_id}' not found."
        )

    # 2. Fetch Job Description
    job = await supabase_service.get_job_description(request.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job Description with ID '{request.job_id}' not found."
        )

    # 3. Retrieve Candidate Repositories
    if request.candidate_repos is not None:
        candidate_repos = request.candidate_repos
    else:
        candidate_repos = await supabase_service.list_repositories_by_candidate(request.candidate_id)
        if not candidate_repos and "repositories" in candidate:
            candidate_repos = candidate["repositories"]

    # 4. Deterministic Scoring Evaluation
    eval_result: ReadinessEvaluationResult = evaluate_readiness(
        candidate=candidate,
        job=job,
        candidate_repos=candidate_repos,
        completed_milestones=request.completed_milestones
    )

    # 5. Persist Evaluation Record
    eval_record = {
        "candidate_id": request.candidate_id,
        "job_id": request.job_id,
        "overall_score": eval_result.overall_score,
        "base_score": eval_result.base_score,
        "pillars": eval_result.pillars.model_dump(),
        "gap_matrix": [g.model_dump() for g in eval_result.gap_matrix],
        "completed_milestones": eval_result.completed_milestones,
        "status_badge": eval_result.status_badge,
        "rating": eval_result.rating
    }

    saved_eval = await supabase_service.create_readiness_evaluation(eval_record)

    return ReadinessEvaluateResponse(
        id=saved_eval["id"],
        candidate_id=saved_eval["candidate_id"],
        job_id=saved_eval["job_id"],
        overall_score=saved_eval["overall_score"],
        base_score=saved_eval["base_score"],
        pillars=saved_eval["pillars"],
        gap_matrix=saved_eval["gap_matrix"],
        completed_milestones=saved_eval["completed_milestones"],
        status_badge=saved_eval["status_badge"],
        rating=saved_eval["rating"],
        created_at=saved_eval["created_at"]
    )
