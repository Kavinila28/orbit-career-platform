"""GitHub Analysis API Router for ORBIT."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.github_service import github_service, GitHubCandidateAnalysis
from app.services.supabase_client import supabase_service

router = APIRouter()


class GitHubAnalyzeRequest(BaseModel):
    username: str = Field(..., min_length=1, description="GitHub username to inspect")
    candidate_id: Optional[str] = Field(None, description="Optional UUID of candidate in database to attach evidence to")


@router.post(
    "/analyze",
    response_model=GitHubCandidateAnalysis,
    status_code=status.HTTP_200_OK,
    summary="Real GitHub Public Repository Analysis"
)
async def analyze_github_profile(request: GitHubAnalyzeRequest):
    """Fetches real public repositories, technology signatures, testing suites,
    Docker containerization, and modular structure from GitHub's REST API.
    
    Preserves strict evidence integrity:
      - Marks only verified detectable technologies as VERIFIED.
      - Keeps test_coverage as UNAVAILABLE (None) rather than fabricated.
      - GitHub stars are collected strictly for display and contribute 0 pts to scoring.
    """
    clean_user = request.username.strip().lstrip("@")
    if not clean_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username cannot be empty."
        )

    try:
        analysis = await github_service.analyze_github_user(clean_user)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except PermissionError as pe:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(pe)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing GitHub profile: {str(e)}"
        )

    # Optional: Attach verified repositories and telemetry to candidate record if ID provided
    if request.candidate_id:
        existing_candidate = await supabase_service.get_candidate(request.candidate_id)
        if existing_candidate:
            # Merge verified skills with existing resume skills
            existing_skills = existing_candidate.get("extracted_skills", [])
            merged_skills = []
            seen_names = set()

            # 1. Add verified skills from GitHub
            for v_skill in analysis.verified_skills:
                merged_skills.append({
                    "name": v_skill["name"],
                    "category": "General",
                    "resumeMentions": 0,
                    "repoCount": v_skill["repoCount"],
                    "certified": False,
                    "evidenceState": "VERIFIED"
                })
                seen_names.add(v_skill["name"].lower())

            # 2. Add remaining resume skills (as SELF_REPORTED or PARTIAL)
            for r_skill in existing_skills:
                if r_skill["name"].lower() not in seen_names:
                    merged_skills.append(r_skill)
                    seen_names.add(r_skill["name"].lower())
                else:
                    # Update existing skill repo count
                    for m in merged_skills:
                        if m["name"].lower() == r_skill["name"].lower():
                            m["resumeMentions"] = r_skill.get("resumeMentions", 1)
                            m["certified"] = r_skill.get("certified", False)
                            m["certName"] = r_skill.get("certName")

            update_payload = {
                "github_username": clean_user,
                "extracted_skills": merged_skills,
                "stats": {
                    "totalRepos": analysis.public_repos_count,
                    "commitCountYear": analysis.total_commits_year,
                    "topLanguage": analysis.top_languages[0] if analysis.top_languages else "Python"
                }
            }
            await supabase_service.update_candidate(request.candidate_id, update_payload)

            # Persist repositories to repository table
            for repo in analysis.repositories:
                repo_record = {
                    "candidate_id": request.candidate_id,
                    "name": repo.name,
                    "description": repo.description,
                    "language": repo.language,
                    "stars": repo.stars,
                    "forks": repo.forks,
                    "commits_last_year": repo.commits_last_year,
                    "has_tests": repo.has_tests,
                    "test_coverage": repo.test_coverage,
                    "has_docker": repo.has_docker,
                    "has_ci": repo.has_ci,
                    "has_db_integration": repo.has_db_integration,
                    "has_env_config": repo.has_env_config,
                    "has_modular_structure": repo.has_modular_structure,
                    "complexity_score": repo.complexity_score,
                    "tech_stack": repo.tech_stack,
                    "insights": repo.insights
                }
                await supabase_service.create_repository(repo_record)

    return analysis
