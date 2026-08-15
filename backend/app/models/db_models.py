"""Database schemas and Pydantic models for Supabase tables."""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# ====================================================================
# Candidate Models
# ====================================================================
class ExtractedSkill(BaseModel):
    name: str
    category: str = "General"
    resumeMentions: int = 1
    repoCount: int = 0
    certified: bool = False
    certName: Optional[str] = None
    evidenceState: Literal["VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"] = "SELF_REPORTED"


class CandidateStats(BaseModel):
    totalRepos: int = 0
    commitCountYear: int = 0
    topLanguage: str = "Python"


class CandidateBase(BaseModel):
    name: str
    title: Optional[str] = "Software Engineer"
    email: Optional[str] = None
    location: Optional[str] = "Remote"
    education: Optional[str] = None
    github_username: Optional[str] = None
    resume_text: Optional[str] = None
    extracted_skills: List[Dict[str, Any]] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)
    verified_badges: List[Dict[str, Any]] = Field(default_factory=list)


class CandidateCreate(CandidateBase):
    pass


class CandidateInDB(CandidateBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ====================================================================
# Repository Models
# ====================================================================
class RepositoryBase(BaseModel):
    candidate_id: str
    name: str
    description: Optional[str] = ""
    language: Optional[str] = "Python"
    stars: int = 0
    forks: int = 0
    commits_last_year: int = 0
    has_tests: bool = False
    test_coverage: Optional[float] = None  # None = UNAVAILABLE, 0.0 = Verified 0%, >0.0 = Verified Coverage %
    has_docker: bool = False
    has_ci: bool = False
    has_db_integration: bool = False
    has_env_config: bool = False
    has_modular_structure: bool = False
    complexity_score: float = 5.0
    tech_stack: List[str] = Field(default_factory=list)
    insights: List[str] = Field(default_factory=list)


class RepositoryCreate(RepositoryBase):
    pass


class RepositoryInDB(RepositoryBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ====================================================================
# Job Description Models
# ====================================================================
class RequiredSkill(BaseModel):
    name: str
    category: str = "General"
    weight: float = Field(ge=0.0, le=1.0)
    importance: str = "Required"  # Required | Preferred
    description: Optional[str] = ""


class JobDescriptionBase(BaseModel):
    title: str
    company: str
    department: Optional[str] = "Engineering"
    level: Optional[str] = "Target Role"
    location: Optional[str] = "Remote"
    salary_range: Optional[str] = None
    raw_description: str
    required_skills: List[Dict[str, Any]] = Field(default_factory=list)
    preferred_skills: List[Dict[str, Any]] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)


class JobDescriptionCreate(JobDescriptionBase):
    pass


class JobDescriptionInDB(JobDescriptionBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ====================================================================
# Readiness Evaluation Models
# ====================================================================
class ScoringPillars(BaseModel):
    skillAlignment: int = Field(ge=0, le=100)
    codeEvidence: int = Field(ge=0, le=100)
    productionHygiene: int = Field(ge=0, le=100)
    architectureDepth: int = Field(ge=0, le=100)


class SkillGapItem(BaseModel):
    skill: str
    category: str
    importance: str
    description: Optional[str] = ""
    candidateEvidence: str
    repoCount: int = 0
    hasCert: bool = False
    gapLevel: str  # Low | Medium | High
    evidenceStrength: int = Field(ge=0, le=100)
    impactScore: str
    actionItem: str
    evidenceState: Literal["VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"] = "UNAVAILABLE"


class ReadinessEvaluationBase(BaseModel):
    candidate_id: str
    job_id: str
    overall_score: int = Field(ge=0, le=100)
    base_score: int = Field(ge=0, le=100)
    pillars: Dict[str, Any]
    gap_matrix: List[Dict[str, Any]]
    completed_milestones: List[str] = Field(default_factory=list)
    status_badge: str = "Moderate Readiness"
    rating: str = "Moderate Readiness"


class ReadinessEvaluationCreate(ReadinessEvaluationBase):
    pass


class ReadinessEvaluationInDB(ReadinessEvaluationBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
