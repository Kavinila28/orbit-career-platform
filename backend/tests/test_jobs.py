import math
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.jd_parser import parse_job_description


@pytest.fixture
def sample_ml_job_description():
    return """AI/ML Systems Engineer
Anthropic Benchmark • San Francisco, CA • $140,000 - $190,000

About the Role
We are seeking an AI/ML Engineer to build low-latency inference services and scalable machine learning pipelines.

Key Responsibilities
- Architect high-throughput REST API inference microservices with async event processing.
- Deploy fine-tuned Transformer models to production Kubernetes clusters.
- Collaborate with research teams to optimize model memory footprints via quantization.
- Build automated CI/CD deployment pipelines with test validation.

Requirements & Qualifications
- Strong proficiency in Python and SQL.
- Production experience with PyTorch and Transformers (Hugging Face).
- Hands-on expertise building asynchronous APIs in FastAPI or Django.
- Experience with Docker containerization and PostgreSQL.

Preferred Qualifications
- Familiarity with Kubernetes (K8s) orchestration and Helm charts.
- Experience deploying cloud services on AWS or GCP.
- Knowledge of Redis caching and distributed task queues.
"""


def test_jd_parsing_service(sample_ml_job_description):
    """Test deterministic skill extraction, section splitting, and full-precision weight normalization."""
    result = parse_job_description(
        raw_text=sample_ml_job_description,
        title="AI/ML Systems Engineer",
        company="Anthropic Benchmark"
    )

    assert result.title == "AI/ML Systems Engineer"
    assert result.company == "Anthropic Benchmark"
    assert len(result.required_skills) >= 4
    assert len(result.preferred_skills) >= 2
    assert len(result.responsibilities) >= 3

    req_names = [s["name"] for s in result.required_skills]
    pref_names = [s["name"] for s in result.preferred_skills]

    # Required skills verification
    assert "Python" in req_names
    assert "PyTorch" in req_names
    assert "FastAPI" in req_names
    assert "Docker" in req_names
    assert "PostgreSQL" in req_names

    # Preferred skills verification
    assert "Kubernetes" in pref_names or "AWS" in pref_names or "Redis" in pref_names

    # Verify minRepos is NOT present in job requirement outputs (no evidence fabrication)
    for s in result.required_skills + result.preferred_skills:
        assert "minRepos" not in s

    # Exact full-precision weight normalization check (tolerance: 1e-9)
    all_weights = [s["weight"] for s in result.required_skills] + [s["weight"] for s in result.preferred_skills]
    total_weight = sum(all_weights)
    assert math.isclose(total_weight, 1.0, rel_tol=1e-9)
    assert abs(total_weight - 1.0) < 1e-9


def test_synonym_normalization_and_deduplication():
    """Verify that synonyms (e.g. Postgres -> PostgreSQL, K8s -> Kubernetes) are deduplicated."""
    raw_text = """Senior Cloud Platform Engineer
Requirements:
- Strong experience with Postgres and PostgreSQL databases.
- Proven expertise in K8s and Kubernetes cluster operations.
- Proficiency in Golang and Go language systems.
- Production usage of ReactJS and React frontend frameworks.
"""
    result = parse_job_description(raw_text=raw_text)

    all_names = [s["name"] for s in result.required_skills] + [s["name"] for s in result.preferred_skills]

    # Check deduplication to canonical names
    assert all_names.count("PostgreSQL") == 1
    assert all_names.count("Kubernetes") == 1
    assert all_names.count("Go") == 1
    assert all_names.count("React") == 1


def test_deterministic_repeatability(sample_ml_job_description):
    """Verify that multiple runs produce 100% identical outputs and weights."""
    run1 = parse_job_description(raw_text=sample_ml_job_description)
    run2 = parse_job_description(raw_text=sample_ml_job_description)
    run3 = parse_job_description(raw_text=sample_ml_job_description)

    assert run1.model_dump() == run2.model_dump()
    assert run2.model_dump() == run3.model_dump()


@pytest.mark.asyncio
async def test_job_analyze_api_endpoint(sample_ml_job_description):
    """Test POST /api/v1/jobs/analyze endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "title": "AI/ML Systems Engineer",
            "company": "Anthropic Benchmark",
            "department": "Model Infrastructure",
            "level": "Mid-Senior",
            "location": "San Francisco, CA (Hybrid)",
            "salary_range": "$150,000 - $190,000",
            "raw_description": sample_ml_job_description
        }
        response = await client.post("/api/v1/jobs/analyze", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert data["title"] == "AI/ML Systems Engineer"
        assert data["company"] == "Anthropic Benchmark"
        assert len(data["required_skills"]) >= 4
        assert len(data["preferred_skills"]) >= 2
        assert data["total_skills_detected"] >= 6

        # Check full precision sum on API response
        api_weights = [s["weight"] for s in data["required_skills"]] + [s["weight"] for s in data["preferred_skills"]]
        assert math.isclose(sum(api_weights), 1.0, rel_tol=1e-9)


@pytest.mark.asyncio
async def test_job_analyze_empty_input_rejected():
    """Test that empty or too short JD text is rejected with HTTP 422 or 400."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"raw_description": "Too short"}
        response = await client.post("/api/v1/jobs/analyze", json=payload)
        assert response.status_code in [400, 422]
