import pytest
import httpx
from httpx import AsyncClient, ASGITransport, MockTransport
from app.main import app
from app.services.github_service import GitHubService


@pytest.fixture
def mock_github_profile():
    return {
        "login": "alexrivera-ai",
        "avatar_url": "https://avatars.githubusercontent.com/u/123456?v=4",
        "bio": "AI Systems & Machine Learning Engineer",
        "public_repos": 2
    }


@pytest.fixture
def mock_github_repos():
    return [
        {
            "name": "neural-inference-engine",
            "description": "High throughput neural network inference engine",
            "stargazers_count": 140,
            "forks_count": 22,
            "size": 420,
            "language": "Python",
            "fork": False,
            "owner": {"login": "alexrivera-ai"},
            "html_url": "https://github.com/alexrivera-ai/neural-inference-engine"
        },
        {
            "name": "distributed-data-pipeline",
            "description": "Async streaming ETL pipeline",
            "stargazers_count": 85,
            "forks_count": 9,
            "size": 280,
            "language": "Python",
            "fork": False,
            "owner": {"login": "alexrivera-ai"},
            "html_url": "https://github.com/alexrivera-ai/distributed-data-pipeline"
        }
    ]


@pytest.fixture
def mock_repo_contents():
    return [
        {"name": "src", "type": "dir"},
        {"name": "tests", "type": "dir"},
        {"name": "Dockerfile", "type": "file"},
        {"name": ".github", "type": "dir"},
        {"name": ".env.example", "type": "file"},
        {"name": "alembic", "type": "dir"},
        {"name": "README.md", "type": "file", "size": 3600}
    ]


def build_mock_handler(mock_github_profile, mock_github_repos, mock_repo_contents):
    def handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if url == "https://api.github.com/users/alexrivera-ai":
            return httpx.Response(200, json=mock_github_profile)
        elif "users/alexrivera-ai/repos" in url:
            return httpx.Response(200, json=mock_github_repos)
        elif "repos/alexrivera-ai/neural-inference-engine/languages" in url:
            return httpx.Response(200, json={"Python": 85000, "TypeScript": 15000})
        elif "repos/alexrivera-ai/neural-inference-engine/contents" in url:
            return httpx.Response(200, json=mock_repo_contents)
        elif "repos/alexrivera-ai/distributed-data-pipeline/languages" in url:
            return httpx.Response(200, json={"Python": 60000})
        elif "repos/alexrivera-ai/distributed-data-pipeline/contents" in url:
            return httpx.Response(200, json=[{"name": "src", "type": "dir"}])
        elif url == "https://api.github.com/users/empty-dev":
            return httpx.Response(200, json={"login": "empty-dev", "public_repos": 0})
        elif "users/empty-dev/repos" in url:
            return httpx.Response(200, json=[])
        elif url == "https://api.github.com/users/nonexistent-user-xyz":
            return httpx.Response(404, json={"message": "Not Found"})
        elif url == "https://api.github.com/users/ratelimited-dev":
            return httpx.Response(403, json={"message": "API rate limit exceeded"})
        return httpx.Response(404, json={"message": "Not Found"})
    return handler


@pytest.mark.asyncio
async def test_github_analysis_with_controlled_fixture(
    mock_github_profile,
    mock_github_repos,
    mock_repo_contents
):
    """Test full repository discovery, tech stack detection, and structural signals from controlled GitHub fixture."""
    handler = build_mock_handler(mock_github_profile, mock_github_repos, mock_repo_contents)
    mock_client = httpx.AsyncClient(transport=MockTransport(handler))

    service = GitHubService()
    analysis = await service.analyze_github_user("alexrivera-ai", custom_client=mock_client)

    assert analysis.username == "alexrivera-ai"
    assert analysis.public_repos_count == 2
    assert analysis.total_stars_display == 225  # 140 + 85
    assert len(analysis.repositories) == 2

    # Structural Signals
    repo1 = next(r for r in analysis.repositories if r.name == "neural-inference-engine")
    assert repo1.has_tests is True
    assert repo1.has_docker is True
    assert repo1.has_ci is True
    assert repo1.has_db_integration is True
    assert repo1.has_env_config is True
    assert repo1.has_modular_structure is True
    assert repo1.test_coverage is None  # UNAVAILABLE (no fabrication)
    assert "Python" in repo1.tech_stack
    assert "TypeScript" in repo1.tech_stack

    # Verified Skills Evidence
    verified_techs = [s["name"] for s in analysis.verified_skills]
    assert "Python" in verified_techs
    assert "Docker" in verified_techs
    for s in analysis.verified_skills:
        assert s["evidenceState"] == "VERIFIED"


@pytest.mark.asyncio
async def test_github_empty_profile():
    """Verify handling of empty GitHub profile with 0 public repositories."""
    handler = build_mock_handler({}, [], [])
    mock_client = httpx.AsyncClient(transport=MockTransport(handler))

    service = GitHubService()
    analysis = await service.analyze_github_user("empty-dev", custom_client=mock_client)
    assert analysis.username == "empty-dev"
    assert analysis.public_repos_count == 0
    assert len(analysis.repositories) == 0
    assert len(analysis.verified_skills) == 0


@pytest.mark.asyncio
async def test_github_nonexistent_user():
    """Verify 404 error when user does not exist on GitHub."""
    handler = build_mock_handler({}, [], [])
    mock_client = httpx.AsyncClient(transport=MockTransport(handler))

    service = GitHubService()
    with pytest.raises(ValueError, match="does not exist"):
        await service.analyze_github_user("nonexistent-user-xyz", custom_client=mock_client)


@pytest.mark.asyncio
async def test_github_rate_limit_exceeded():
    """Verify 429 rate-limit error handling."""
    handler = build_mock_handler({}, [], [])
    mock_client = httpx.AsyncClient(transport=MockTransport(handler))

    service = GitHubService()
    with pytest.raises(PermissionError, match="rate limit exceeded"):
        await service.analyze_github_user("ratelimited-dev", custom_client=mock_client)


@pytest.mark.asyncio
async def test_deterministic_github_analysis_repeatability(
    mock_github_profile,
    mock_github_repos,
    mock_repo_contents
):
    """Verify that multiple analysis runs produce 100% identical outputs."""
    handler = build_mock_handler(mock_github_profile, mock_github_repos, mock_repo_contents)
    mock_client = httpx.AsyncClient(transport=MockTransport(handler))

    service = GitHubService()
    run1 = await service.analyze_github_user("alexrivera-ai", custom_client=mock_client)
    run2 = await service.analyze_github_user("alexrivera-ai", custom_client=mock_client)

    assert run1.public_repos_count == run2.public_repos_count
    assert run1.total_stars_display == run2.total_stars_display
    assert run1.top_languages == run2.top_languages
    assert len(run1.repositories) == len(run2.repositories)
