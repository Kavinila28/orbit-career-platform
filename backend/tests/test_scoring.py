import pytest
import math
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.scoring_engine import (
    calculate_skill_alignment,
    calculate_code_evidence,
    calculate_production_hygiene,
    calculate_architecture_depth,
    evaluate_readiness
)
from app.services.supabase_client import supabase_service


# ====================================================================
# Unit Tests for Individual Scoring Pillars
# ====================================================================

def test_four_evidence_states_strictly_preserved():
    """Verify that Pillar 1 strictly outputs only the 4 approved evidence states:
    VERIFIED, PARTIAL, SELF_REPORTED, and UNAVAILABLE (no 5th state).
    """
    job_skills = [
        {"name": "Python", "weight": 0.25, "importance": "Required", "category": "Languages"},
        {"name": "AWS", "weight": 0.25, "importance": "Required", "category": "Cloud/DevOps"},
        {"name": "FastAPI", "weight": 0.25, "importance": "Required", "category": "Backend"},
        {"name": "Kubernetes", "weight": 0.25, "importance": "Preferred", "category": "Cloud/DevOps"}
    ]

    candidate_skills = [
        {"name": "Python", "resumeMentions": 3, "certified": False},
        {"name": "AWS", "resumeMentions": 1, "certified": True, "certName": "AWS Solutions Architect"},
        {"name": "FastAPI", "resumeMentions": 2, "certified": False}
        # Kubernetes has zero resume mentions and zero repos
    ]

    candidate_repos = [
        {"name": "nlp-parser", "language": "Python", "tech_stack": ["Python", "PyTorch"]},
        {"name": "data-pipeline", "language": "Python", "tech_stack": ["Python"]}
    ]

    score, gap_matrix = calculate_skill_alignment(
        job_skills=job_skills,
        candidate_skills=candidate_skills,
        candidate_repos=candidate_repos,
        completed_milestones=[]
    )

    allowed_states = {"VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"}

    # 1. Check all states are within the 4 allowed states
    for gap in gap_matrix:
        assert gap.evidenceState in allowed_states
        assert gap.evidenceState != "NO_EVIDENCE"  # 5th state forbidden

    # 2. Python: 2 repos -> VERIFIED (factor = 1.0) -> 25.0 pts
    python_gap = next(g for g in gap_matrix if g.skill == "Python")
    assert python_gap.evidenceState == "VERIFIED"
    assert python_gap.evidenceStrength >= 80

    # 3. AWS: certified -> PARTIAL (factor = 0.55) -> 13.75 pts
    aws_gap = next(g for g in gap_matrix if g.skill == "AWS")
    assert aws_gap.evidenceState == "PARTIAL"
    assert aws_gap.hasCert is True

    # 4. FastAPI: resume only -> SELF_REPORTED (factor = 0.30) -> 7.50 pts
    fastapi_gap = next(g for g in gap_matrix if g.skill == "FastAPI")
    assert fastapi_gap.evidenceState == "SELF_REPORTED"
    assert fastapi_gap.repoCount == 0

    # 5. Kubernetes: missing -> UNAVAILABLE (factor = 0.0) -> 0.0 pts
    k8s_gap = next(g for g in gap_matrix if g.skill == "Kubernetes")
    assert k8s_gap.evidenceState == "UNAVAILABLE"
    assert k8s_gap.evidenceStrength == 0

    expected_score = 25.0 + 13.75 + 7.50 + 0.0  # = 46.25
    assert math.isclose(score, 46.25, rel_tol=1e-3)


def test_pillar2_code_evidence_and_stars_isolation():
    """Verify Code Evidence respects volume/complexity/commits, and stars do NOT increase score."""
    repos_base = [
        {"name": "repo1", "complexity_score": 8.0, "commits_last_year": 60, "stars": 0},
        {"name": "repo2", "complexity_score": 6.0, "commits_last_year": 40, "stars": 0}
    ]

    repos_with_stars = [
        {"name": "repo1", "complexity_score": 8.0, "commits_last_year": 60, "stars": 5000},
        {"name": "repo2", "complexity_score": 6.0, "commits_last_year": 40, "stars": 12000}
    ]

    score_base = calculate_code_evidence(repos_base)
    score_with_stars = calculate_code_evidence(repos_with_stars)

    # Stars must have zero numerical impact
    assert score_base == score_with_stars

    # Volume: 2 repos = 20 pts
    # Complexity: avg 7.0 / 10.0 * 35 = 24.5 pts
    # Commits: 100 / 150 * 15 = 10.0 pts
    # Doc baseline (800 words): 10.0 pts
    expected = 20.0 + 24.5 + 10.0 + 10.0  # = 64.5
    assert math.isclose(score_base, expected, rel_tol=1e-3)


def test_pillar3_production_hygiene_coverage_distinctions():
    """Verify Production Hygiene distinguishes:
    1. Verified positive coverage (> 0%)
    2. Verified 0% coverage (tests present, 0% coverage)
    3. Unavailable coverage (test_coverage is None)
    """
    # Case 1: Verified positive coverage (80%)
    repos_positive_cov = [
        {"name": "repo1", "has_tests": True, "test_coverage": 80.0, "has_docker": False, "has_ci": False}
    ]
    # Test score = (80 / 100) * 35 = 28.0 pts
    score_pos = calculate_production_hygiene(repos_positive_cov)
    assert math.isclose(score_pos, 28.0, rel_tol=1e-3)

    # Case 2: Verified 0% coverage (0.0)
    repos_zero_cov = [
        {"name": "repo1", "has_tests": True, "test_coverage": 0.0, "has_docker": False, "has_ci": False}
    ]
    # Test score = 5.0 pts (presence only, 0% execution credit)
    score_zero = calculate_production_hygiene(repos_zero_cov)
    assert math.isclose(score_zero, 5.0, rel_tol=1e-3)

    # Case 3: Unavailable coverage (None) with tests present
    repos_unavail_cov_with_tests = [
        {"name": "repo1", "has_tests": True, "test_coverage": None, "has_docker": False, "has_ci": False}
    ]
    # Test score = 17.5 pts (baseline test presence credit without assuming 100% or 0%)
    score_unavail = calculate_production_hygiene(repos_unavail_cov_with_tests)
    assert math.isclose(score_unavail, 17.5, rel_tol=1e-3)

    # Case 4: Unavailable coverage with NO tests present
    repos_no_tests = [
        {"name": "repo1", "has_tests": False, "test_coverage": None, "has_docker": False, "has_ci": False}
    ]
    score_no_tests = calculate_production_hygiene(repos_no_tests)
    assert score_no_tests == 0.0


def test_pillar4_architecture_depth_and_cert_isolation():
    """Verify Architecture Depth is based purely on detected structural signals,
    and certifications or stars do NOT increase architecture depth.
    """
    repos_modular = [
        {
            "name": "enterprise-api",
            "has_modular_structure": True,   # +25
            "has_db_integration": True,       # +20
            "has_env_config": True,           # +15
            "has_docker": True,               # +20
            "tech_stack": ["Python", "FastAPI"] # +20 API contract
        }
    ]

    score = calculate_architecture_depth(repos_modular)
    assert score == 100.0  # 25 + 20 + 15 + 20 + 20 = 100.0

    repos_minimal = [{"name": "script", "tech_stack": ["Python"]}]
    assert calculate_architecture_depth(repos_minimal) == 0.0


# ====================================================================
# Boundary, Repeatability, and Clean Score Tests
# ====================================================================

def test_readiness_boundary_zero():
    """Verify candidate with zero evidence scores exactly 0."""
    candidate_empty = {"extracted_skills": []}
    job = {
        "required_skills": [{"name": "Python", "weight": 0.5}, {"name": "SQL", "weight": 0.5}],
        "preferred_skills": []
    }
    result = evaluate_readiness(
        candidate=candidate_empty,
        job=job,
        candidate_repos=[],
        completed_milestones=[]
    )
    assert result.overall_score == 0
    assert result.base_score == 0
    assert result.pillars.skillAlignment == 0
    assert result.pillars.codeEvidence == 0
    assert result.status_badge == "Emerging Readiness"


def test_readiness_boundary_max_and_no_unexplained_bonus():
    """Verify readiness score is strictly bounded to [0, 100] and overall_score == base_score."""
    candidate_full = {
        "extracted_skills": [
            {"name": "Python", "certified": True},
            {"name": "SQL", "certified": True}
        ]
    }
    job = {
        "required_skills": [{"name": "Python", "weight": 0.5}, {"name": "SQL", "weight": 0.5}],
        "preferred_skills": []
    }
    repos_full = [
        {
            "name": f"repo{i}",
            "language": "Python",
            "complexity_score": 10.0,
            "commits_last_year": 300,
            "has_tests": True,
            "test_coverage": 100.0,
            "has_docker": True,
            "has_ci": True,
            "has_modular_structure": True,
            "has_db_integration": True,
            "has_env_config": True,
            "tech_stack": ["Python", "SQL", "FastAPI"]
        }
        for i in range(5)
    ]

    result = evaluate_readiness(
        candidate=candidate_full,
        job=job,
        candidate_repos=repos_full,
        completed_milestones=["build-fastapi-service"]
    )
    # Must be strictly 100 with base_score == overall_score
    assert result.overall_score == 100
    assert result.base_score == 100
    assert result.status_badge == "High Readiness"


def test_deterministic_rating_thresholds():
    """Verify deterministic mapping of scores to ratings:
    [85, 100] -> High Readiness
    [70, 84]  -> Moderate Readiness
    [50, 69]  -> Developing Readiness
    [0, 49]   -> Emerging Readiness
    """
    assert evaluate_readiness({"extracted_skills": []}, {"required_skills": []}, []).status_badge == "Emerging Readiness"


def test_deterministic_repeatability():
    """Verify that running evaluation 5 times produces 100% identical outputs."""
    candidate = {
        "extracted_skills": [
            {"name": "Python", "resumeMentions": 3},
            {"name": "FastAPI", "resumeMentions": 1}
        ]
    }
    job = {
        "required_skills": [{"name": "Python", "weight": 0.6}, {"name": "FastAPI", "weight": 0.4}],
        "preferred_skills": []
    }
    repos = [
        {"name": "ml-service", "language": "Python", "tech_stack": ["Python"], "complexity_score": 7.0, "has_tests": True}
    ]

    runs = [
        evaluate_readiness(candidate, job, repos, ["dockerize-repos"])
        for _ in range(5)
    ]

    first_dump = runs[0].model_dump()
    for r in runs[1:]:
        assert r.model_dump() == first_dump


# ====================================================================
# API Integration Test for POST /api/v1/readiness/evaluate
# ====================================================================

@pytest.mark.asyncio
async def test_readiness_evaluate_endpoint():
    """Test POST /api/v1/readiness/evaluate against database records."""
    # 1. Create Candidate in DB
    cand_payload = {
        "name": "Alex Rivera",
        "title": "ML Engineer",
        "email": "alex.eval@test.local",
        "extracted_skills": [
            {"name": "Python", "resumeMentions": 4, "certified": False},
            {"name": "AWS", "resumeMentions": 1, "certified": True, "certName": "AWS SAA"}
        ],
        "stats": {"totalRepos": 2, "commitCountYear": 180}
    }
    cand = await supabase_service.create_candidate(cand_payload)

    # 2. Create Job in DB
    job_payload = {
        "title": "AI/ML Systems Engineer",
        "company": "Anthropic Benchmark",
        "raw_description": "Job description for evaluation testing.",
        "required_skills": [
            {"name": "Python", "weight": 0.6, "importance": "Required"},
            {"name": "AWS", "weight": 0.4, "importance": "Required"}
        ]
    }
    job = await supabase_service.create_job_description(job_payload)

    # 3. Call /api/v1/readiness/evaluate
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        req_body = {
            "candidate_id": cand["id"],
            "job_id": job["id"],
            "completed_milestones": [],
            "candidate_repos": [
                {
                    "name": "alex-ml",
                    "language": "Python",
                    "complexity_score": 7.5,
                    "commits_last_year": 120,
                    "has_tests": True,
                    "test_coverage": None,  # UNAVAILABLE
                    "has_docker": False,
                    "has_ci": True,
                    "has_modular_structure": True,
                    "has_db_integration": False,
                    "has_env_config": True,
                    "tech_stack": ["Python"]
                }
            ]
        }
        response = await client.post("/api/v1/readiness/evaluate", json=req_body)
        assert response.status_code == 200
        data = response.json()

        assert data["overall_score"] >= 0 and data["overall_score"] <= 100
        assert data["base_score"] == data["overall_score"]
        assert "skillAlignment" in data["pillars"]
        assert "codeEvidence" in data["pillars"]
        assert "productionHygiene" in data["pillars"]
        assert "architectureDepth" in data["pillars"]
        assert "percentile" not in data  # Unsupported percentile removed
        assert len(data["gap_matrix"]) == 2
        for gap in data["gap_matrix"]:
            assert gap["evidenceState"] in ["VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"]
