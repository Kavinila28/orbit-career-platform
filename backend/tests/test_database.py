import pytest
from app.models.db_models import (
    CandidateCreate,
    RepositoryCreate,
    JobDescriptionCreate,
    ReadinessEvaluationCreate
)
from app.services.supabase_client import supabase_service


@pytest.mark.asyncio
async def test_candidate_persistence():
    """Verify creating and retrieving candidate records."""
    candidate_data = {
        "name": "Alex Rivera",
        "title": "Junior Machine Learning Engineer",
        "email": "alex.rivera@example.com",
        "location": "San Francisco, CA",
        "github_username": "alexrivera-ai",
        "extracted_skills": [
            {"name": "Python", "category": "Languages", "repoCount": 3, "evidenceState": "VERIFIED"},
            {"name": "FastAPI", "category": "Backend", "repoCount": 0, "evidenceState": "SELF_REPORTED"}
        ],
        "stats": {"totalRepos": 5, "commitCountYear": 240, "topLanguage": "Python"}
    }

    # Validate with Pydantic model
    validated_candidate = CandidateCreate(**candidate_data)
    assert validated_candidate.name == "Alex Rivera"

    # Persist via service
    saved = await supabase_service.create_candidate(validated_candidate.model_dump())
    assert saved["id"] is not None
    assert saved["name"] == "Alex Rivera"
    assert "created_at" in saved
    assert "updated_at" in saved

    # Retrieve
    retrieved = await supabase_service.get_candidate(saved["id"])
    assert retrieved is not None
    assert retrieved["email"] == "alex.rivera@example.com"

    # Update candidate
    updated = await supabase_service.update_candidate(saved["id"], {"title": "Senior ML Engineer", "stats": {"totalRepos": 8}})
    assert updated is not None
    assert updated["title"] == "Senior ML Engineer"
    assert updated["stats"]["totalRepos"] == 8


@pytest.mark.asyncio
async def test_repository_persistence():
    """Verify repository creation with nullable coverage."""
    repo_data = {
        "candidate_id": "test-cand-id-123",
        "name": "neural-style-transfer",
        "description": "PyTorch deep learning model",
        "language": "Python",
        "stars": 42,
        "forks": 8,
        "commits_last_year": 85,
        "has_tests": True,
        "test_coverage": None,  # UNAVAILABLE coverage
        "has_docker": False,
        "has_ci": True,
        "complexity_score": 7.5,
        "tech_stack": ["Python", "PyTorch", "NumPy"]
    }

    validated_repo = RepositoryCreate(**repo_data)
    assert validated_repo.test_coverage is None

    saved = await supabase_service.create_repository(validated_repo.model_dump())
    assert saved["id"] is not None
    assert saved["test_coverage"] is None
    assert saved["complexity_score"] == 7.5

    # List
    repos = await supabase_service.list_repositories_by_candidate("test-cand-id-123")
    assert len(repos) >= 1
    assert repos[0]["name"] == "neural-style-transfer"


@pytest.mark.asyncio
async def test_job_description_persistence():
    """Verify job description creation and retrieval."""
    job_data = {
        "title": "AI/ML Engineer",
        "company": "Anthropic Benchmark",
        "department": "Model Serving",
        "level": "Mid-Level",
        "salary_range": "$140,000 - $190,000",
        "raw_description": "We are seeking an ML engineer proficient in FastAPI, Docker, and PyTorch.",
        "required_skills": [
            {"name": "Python", "category": "Languages", "weight": 0.25, "importance": "Required"},
            {"name": "FastAPI", "category": "Backend", "weight": 0.25, "importance": "Required"}
        ],
        "preferred_skills": [
            {"name": "Docker", "category": "Cloud/DevOps", "weight": 0.15, "importance": "Preferred"}
        ]
    }

    validated_job = JobDescriptionCreate(**job_data)
    saved = await supabase_service.create_job_description(validated_job.model_dump())
    assert saved["id"] is not None
    assert saved["title"] == "AI/ML Engineer"

    retrieved = await supabase_service.get_job_description(saved["id"])
    assert retrieved is not None
    assert len(retrieved["required_skills"]) == 2


@pytest.mark.asyncio
async def test_readiness_evaluation_persistence():
    """Verify readiness evaluation score bounds and pillar serialization."""
    eval_data = {
        "candidate_id": "test-cand-id-123",
        "job_id": "test-job-id-456",
        "overall_score": 72,
        "base_score": 72,
        "milestone_bonus": 0,
        "pillars": {
            "skillAlignment": 74,
            "codeEvidence": 80,
            "productionHygiene": 45,
            "architectureDepth": 55
        },
        "gap_matrix": [
            {
                "skill": "FastAPI",
                "category": "Backend",
                "importance": "Required",
                "candidateEvidence": "Mentioned on resume (2x) but 0 repos",
                "gapLevel": "High",
                "evidenceStrength": 25,
                "impactScore": "+14 pts",
                "actionItem": "Build a repository utilizing FastAPI",
                "evidenceState": "SELF_REPORTED"
            }
        ],
        "status_badge": "Good Foundation",
        "rating": "Competitive Candidate",
        "percentile": 78
    }

    validated_eval = ReadinessEvaluationCreate(**eval_data)
    assert validated_eval.overall_score == 72
    assert validated_eval.pillars["skillAlignment"] == 74

    saved = await supabase_service.create_readiness_evaluation(validated_eval.model_dump())
    assert saved["id"] is not None
    assert saved["overall_score"] == 72

    latest = await supabase_service.get_latest_evaluation("test-cand-id-123", "test-job-id-456")
    assert latest is not None
    assert latest["overall_score"] == 72
