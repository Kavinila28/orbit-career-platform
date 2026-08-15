"""Deterministic Career Readiness Scoring Engine for ORBIT.

Pure mathematical implementation with zero LLM/hallucinated numerical values.
Strictly bounded to [0, 100] with fully explainable 4-pillar formulation.

Formula:
  base_score = 0.35 * skill_alignment + 0.25 * code_evidence + 0.20 * production_hygiene + 0.20 * architecture_depth
  overall_score = min(100, max(0, round(base_score)))
"""
import math
from typing import Dict, Any, List, Optional, Tuple, Literal
from pydantic import BaseModel, Field


# Approved 4-state Evidence Model
EvidenceState = Literal["VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"]


class PillarBreakdown(BaseModel):
    skillAlignment: int = Field(ge=0, le=100)
    codeEvidence: int = Field(ge=0, le=100)
    productionHygiene: int = Field(ge=0, le=100)
    architectureDepth: int = Field(ge=0, le=100)


class SkillGapEvaluation(BaseModel):
    skill: str
    category: str
    importance: str  # "Required" | "Preferred"
    candidateEvidence: str
    repoCount: int = 0
    hasCert: bool = False
    evidenceState: EvidenceState
    gapLevel: str       # "Low" | "Medium" | "High"
    evidenceStrength: int = Field(ge=0, le=100)
    impactScore: str
    actionItem: str


class ReadinessEvaluationResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    base_score: int = Field(ge=0, le=100)
    pillars: PillarBreakdown
    gap_matrix: List[SkillGapEvaluation]
    completed_milestones: List[str]
    status_badge: str
    rating: str


# ====================================================================
# Pillar 1: Skill Alignment Calculation (Weight: 35%)
# ====================================================================
def calculate_skill_alignment(
    job_skills: List[Dict[str, Any]],
    candidate_skills: List[Dict[str, Any]],
    candidate_repos: List[Dict[str, Any]],
    completed_milestones: Optional[List[str]] = None
) -> Tuple[float, List[SkillGapEvaluation]]:
    """Calculates deterministic Skill Alignment score [0, 100] using Phase 4 JD weights.
    
    Strictly preserves the 4 approved evidence states:
      1. VERIFIED (>= 1 verified repos with matching tech in code):
         - >= 2 verified repos: E_i = 1.00 (evidenceStrength = min(100, 75 + repoCount * 5))
         - 1 verified repo: E_i = 0.85 (evidenceStrength = 75)
      2. PARTIAL (Valid certification matching skill, 0 repos):
         - E_i = 0.55 (evidenceStrength = 50)
      3. SELF_REPORTED (Resume mention only, 0 verified repos):
         - E_i = 0.30 (evidenceStrength = 25)
      4. UNAVAILABLE (Absent in analyzed repositories and resume):
         - E_i = 0.00 (evidenceStrength = 0)
    """
    if not job_skills:
        return 100.0, []

    total_weight = sum(s.get("weight", 0.0) for s in job_skills)
    if total_weight <= 0:
        total_weight = 1.0

    skill_alignment_score = 0.0
    gap_matrix = []

    for req_skill in job_skills:
        skill_name = req_skill["name"]
        skill_weight = req_skill.get("weight", 1.0 / len(job_skills))
        importance = req_skill.get("importance", "Required")
        category = req_skill.get("category", "General")

        # 1. Check candidate repository code proof (Real Evidence)
        matching_repos = [
            r for r in candidate_repos
            if any(t.lower() == skill_name.lower() for t in r.get("tech_stack", [])) or
               (r.get("language", "").lower() == skill_name.lower())
        ]
        repo_count = len(matching_repos)

        # 2. Check resume claims and certifications
        cand_skill_entry = next(
            (s for s in candidate_skills if s.get("name", "").lower() == skill_name.lower()),
            None
        )
        has_cert = cand_skill_entry.get("certified", False) if cand_skill_entry else False
        cert_name = cand_skill_entry.get("certName", "Certification") if cand_skill_entry else ""
        resume_mentions = cand_skill_entry.get("resumeMentions", 0) if cand_skill_entry else 0

        # 3. Deterministic 4-State Evidence Assignment
        if repo_count >= 2:
            evidence_state: EvidenceState = "VERIFIED"
            evidence_factor = 1.00
            evidence_str = f"{repo_count} GitHub repositories with verified code"
            gap_level = "Low"
            evidence_strength = min(100, 75 + repo_count * 5)
            impact_str = "Verified Strength"
            action_item = "Maintain test coverage and active documentation"
        elif repo_count == 1:
            evidence_state: EvidenceState = "VERIFIED"
            evidence_factor = 0.85
            evidence_str = "1 GitHub repository (Verified in Code)"
            gap_level = "Low"
            evidence_strength = 75
            impact_str = "Verified Match"
            action_item = "Expand test coverage and module depth in repository"
        elif has_cert:
            evidence_state = "PARTIAL"
            evidence_factor = 0.55
            evidence_str = f"Certified ({cert_name}) — 0 code repositories"
            gap_level = "Medium"
            evidence_strength = 50
            impact_str = "+8 pts"
            action_item = f"Build 1 production repository demonstrating {skill_name}"
        elif resume_mentions > 0:
            evidence_state = "SELF_REPORTED"
            evidence_factor = 0.30
            evidence_str = f"Self-reported on resume ({resume_mentions}x) — 0 code repositories"
            gap_level = "High" if importance == "Required" else "Medium"
            evidence_strength = 25
            impact_str = "+12 pts" if importance == "Required" else "+6 pts"
            action_item = f"Create GitHub repository providing code proof for {skill_name}"
        else:
            evidence_state = "UNAVAILABLE"
            evidence_factor = 0.00
            evidence_str = "Not found in analyzed technical evidence"
            gap_level = "High" if importance == "Required" else "Medium"
            evidence_strength = 0
            impact_str = "+15 pts" if importance == "Required" else "+5 pts"
            action_item = f"Complete a project blueprint to build and deploy {skill_name}"

        # Weighted Contribution
        skill_alignment_score += (skill_weight / total_weight) * (evidence_factor * 100.0)

        gap_matrix.append(SkillGapEvaluation(
            skill=skill_name,
            category=category,
            importance=importance,
            candidateEvidence=evidence_str,
            repoCount=repo_count,
            hasCert=has_cert,
            evidenceState=evidence_state,
            gapLevel=gap_level,
            evidenceStrength=evidence_strength,
            impactScore=impact_str,
            actionItem=action_item
        ))

    return min(100.0, max(0.0, skill_alignment_score)), gap_matrix


# ====================================================================
# Pillar 2: GitHub Code Evidence (Weight: 25%)
# ====================================================================
def calculate_code_evidence(candidate_repos: List[Dict[str, Any]]) -> float:
    """Calculates GitHub Code Evidence score [0, 100] from real verifiable code telemetry.
    
    Formulation (Max 100 pts):
      1. Repo Count Volume: min(40, N_repos * 10) -> Max 40 pts
      2. Complexity Score: min(35, (avg_complexity / 10.0) * 35) -> Max 35 pts
      3. Commit Cadence (365d): min(15, (commits_365d / 150) * 15) -> Max 15 pts (Supporting signal)
      4. Documentation Depth: min(10, (avg_readme_words / 800) * 10) -> Max 10 pts
      * Stars = 0 pts (Social proof only, zero impact on code evidence).
    """
    if not candidate_repos:
        return 0.0

    n_repos = len(candidate_repos)
    repo_volume_score = min(40.0, n_repos * 10.0)

    avg_complexity = sum(r.get("complexity_score", 5.0) for r in candidate_repos) / n_repos
    complexity_score = min(35.0, (avg_complexity / 10.0) * 35.0)

    total_commits_year = sum(r.get("commits_last_year", 0) for r in candidate_repos)
    commit_score = min(15.0, (total_commits_year / 150.0) * 15.0)

    # Documentation depth: uses readme_words (default 800 words = 10 pts)
    avg_readme = sum(r.get("readme_words", 800.0) for r in candidate_repos) / n_repos
    doc_score = min(10.0, (avg_readme / 800.0) * 10.0)

    total = repo_volume_score + complexity_score + commit_score + doc_score
    return min(100.0, max(0.0, total))


# ====================================================================
# Pillar 3: Production & DevOps Hygiene (Weight: 20%)
# ====================================================================
def calculate_production_hygiene(candidate_repos: List[Dict[str, Any]]) -> float:
    """Calculates Production Hygiene score [0, 100].
    
    Formulation (Max 100 pts):
      1. Testing Component (Max 35 pts):
         - Verified Positive Coverage (test_coverage > 0.0): (test_coverage / 100.0) * 35.0
         - Verified Zero Coverage (test_coverage == 0.0): 5.0 pts (test files present, 0% passing coverage)
         - Unavailable Coverage (test_coverage is None):
           - If has_tests == True: 17.5 pts (baseline test presence credit without assuming coverage)
           - If has_tests == False: 0.0 pts
      2. Docker / Containerization Presence (Max 35 pts):
         - (N_docker / N_repos) * 35.0
      3. Automated CI/CD Workflows (Max 30 pts):
         - (N_ci / N_repos) * 30.0
    """
    if not candidate_repos:
        return 0.0

    n_repos = len(candidate_repos)
    
    testing_points = 0.0
    for r in candidate_repos:
        cov = r.get("test_coverage")
        has_tests = r.get("has_tests", False)

        if cov is not None:
            if cov > 0.0:
                testing_points += (min(100.0, float(cov)) / 100.0) * 35.0
            else:
                testing_points += 5.0  # Verified 0%
        else:
            if has_tests:
                testing_points += 17.5  # Presence credit only
            else:
                testing_points += 0.0

    test_score = testing_points / n_repos

    n_docker = sum(1 for r in candidate_repos if r.get("has_docker", False))
    n_ci = sum(1 for r in candidate_repos if r.get("has_ci", False))

    docker_score = (n_docker / n_repos) * 35.0
    ci_score = (n_ci / n_repos) * 30.0

    total = test_score + docker_score + ci_score
    return min(100.0, max(0.0, total))


# ====================================================================
# Pillar 4: Architecture & Engineering Structure Depth (Weight: 20%)
# ====================================================================
def calculate_architecture_depth(candidate_repos: List[Dict[str, Any]]) -> float:
    """Calculates Architecture & Engineering Structure Depth [0, 100].
    
    Strict Rules:
      - Stars do NOT increase architecture depth.
      - Certifications do NOT increase architecture depth.
      - Scored strictly on verifiable structural signals across repositories:
        1. Modular Layer Separation (has_modular_structure): +25 pts
        2. Database Integration & Migrations (has_db_integration): +20 pts
        3. Configuration Management (has_env_config): +15 pts
        4. Multi-Service / Containerized Infra (has_docker): +20 pts
        5. API Contracts & Specs (REST / FastAPI / Type schemas): +20 pts
    """
    if not candidate_repos:
        return 0.0

    has_modular = any(r.get("has_modular_structure", False) for r in candidate_repos)
    has_db = any(r.get("has_db_integration", False) for r in candidate_repos)
    has_config = any(r.get("has_env_config", False) for r in candidate_repos)
    has_docker = any(r.get("has_docker", False) for r in candidate_repos)
    has_api_contracts = any(
        "FastAPI" in r.get("tech_stack", []) or "REST APIs" in r.get("tech_stack", []) or "GraphQL" in r.get("tech_stack", [])
        for r in candidate_repos
    )

    score = 0.0
    if has_modular:
        score += 25.0
    if has_db:
        score += 20.0
    if has_config:
        score += 15.0
    if has_docker:
        score += 20.0
    if has_api_contracts:
        score += 20.0

    return min(100.0, max(0.0, score))


# ====================================================================
# Main Deterministic Scoring Orchestrator
# ====================================================================
def evaluate_readiness(
    candidate: Dict[str, Any],
    job: Dict[str, Any],
    candidate_repos: List[Dict[str, Any]],
    completed_milestones: Optional[List[str]] = None
) -> ReadinessEvaluationResult:
    """Evaluates candidate technical evidence against target job requirements.
    
    Final Score Bounds:
      base_score = 0.35 * skill_alignment + 0.25 * code_evidence + 0.20 * production_hygiene + 0.20 * architecture_depth
      overall_score = min(100, max(0, round(base_score)))
      
    Deterministic Rating Scale:
      - [85, 100]: High Readiness (Verified technical match across core role requirements)
      - [70, 84]:  Moderate Readiness (Satisfies primary requirements with minor gap closure needed)
      - [50, 69]:  Developing Readiness (Foundational skills present; needs production repository proof)
      - [0, 49]:   Emerging Readiness (Early stage; significant skill & architecture gaps)
    """
    milestones = completed_milestones or []
    all_job_skills = (job.get("required_skills", []) or []) + (job.get("preferred_skills", []) or [])
    candidate_skills = candidate.get("extracted_skills", []) or []

    # 1. Compute 4 Pillars
    skill_alignment_val, gap_matrix = calculate_skill_alignment(
        all_job_skills, candidate_skills, candidate_repos, milestones
    )
    code_evidence_val = calculate_code_evidence(candidate_repos)
    production_hygiene_val = calculate_production_hygiene(candidate_repos)
    architecture_depth_val = calculate_architecture_depth(candidate_repos)

    # 2. Base Score & Overall Score (100% Deterministic, strictly 0-100)
    base_score_float = (
        0.35 * skill_alignment_val +
        0.25 * code_evidence_val +
        0.20 * production_hygiene_val +
        0.20 * architecture_depth_val
    )
    overall_score = min(100, max(0, round(base_score_float)))

    # 3. Deterministic Rating Scale
    if overall_score >= 85:
        status_badge = "High Readiness"
        rating = "High Readiness"
    elif overall_score >= 70:
        status_badge = "Moderate Readiness"
        rating = "Moderate Readiness"
    elif overall_score >= 50:
        status_badge = "Developing Readiness"
        rating = "Developing Readiness"
    else:
        status_badge = "Emerging Readiness"
        rating = "Emerging Readiness"

    pillars = PillarBreakdown(
        skillAlignment=round(skill_alignment_val),
        codeEvidence=round(code_evidence_val),
        productionHygiene=round(production_hygiene_val),
        architectureDepth=round(architecture_depth_val)
    )

    return ReadinessEvaluationResult(
        overall_score=overall_score,
        base_score=overall_score,
        pillars=pillars,
        gap_matrix=gap_matrix,
        completed_milestones=milestones,
        status_badge=status_badge,
        rating=rating
    )
