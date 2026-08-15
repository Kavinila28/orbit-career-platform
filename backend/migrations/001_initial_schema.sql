-- ====================================================================
-- ORBIT — PostgreSQL Database Schema Migration 001
-- Description: Initial schema for Candidates, Repositories, Jobs,
--              Readiness Evaluations, and Interview Records.
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Automated updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    email VARCHAR(255),
    location VARCHAR(255),
    education TEXT,
    github_username VARCHAR(255),
    resume_text TEXT,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    verified_badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Candidates updated_at
DROP TRIGGER IF EXISTS trigger_candidates_updated_at ON candidates;
CREATE TRIGGER trigger_candidates_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Candidate Repositories Table
CREATE TABLE IF NOT EXISTS candidate_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(100),
    stars INT DEFAULT 0 CHECK (stars >= 0),
    forks INT DEFAULT 0 CHECK (forks >= 0),
    commits_last_year INT DEFAULT 0 CHECK (commits_last_year >= 0),
    has_tests BOOLEAN DEFAULT FALSE,
    test_coverage NUMERIC(5,2) DEFAULT NULL, -- NULL = UNAVAILABLE
    has_docker BOOLEAN DEFAULT FALSE,
    has_ci BOOLEAN DEFAULT FALSE,
    has_db_integration BOOLEAN DEFAULT FALSE,
    has_env_config BOOLEAN DEFAULT FALSE,
    has_modular_structure BOOLEAN DEFAULT FALSE,
    complexity_score NUMERIC(3,1) DEFAULT 5.0 CHECK (complexity_score >= 0.0 AND complexity_score <= 10.0),
    tech_stack JSONB DEFAULT '[]'::jsonb,
    insights JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Candidate Repositories updated_at
DROP TRIGGER IF EXISTS trigger_candidate_repositories_updated_at ON candidate_repositories;
CREATE TRIGGER trigger_candidate_repositories_updated_at
BEFORE UPDATE ON candidate_repositories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Job Descriptions Table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    level VARCHAR(100),
    location VARCHAR(255),
    salary_range VARCHAR(100),
    raw_description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    preferred_skills JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Job Descriptions updated_at
DROP TRIGGER IF EXISTS trigger_job_descriptions_updated_at ON job_descriptions;
CREATE TRIGGER trigger_job_descriptions_updated_at
BEFORE UPDATE ON job_descriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Readiness Evaluations Table
CREATE TABLE IF NOT EXISTS readiness_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    base_score INT NOT NULL CHECK (base_score >= 0 AND base_score <= 100),
    milestone_bonus INT DEFAULT 0 CHECK (milestone_bonus >= 0),
    pillars JSONB NOT NULL,
    gap_matrix JSONB NOT NULL,
    completed_milestones JSONB DEFAULT '[]'::jsonb,
    status_badge VARCHAR(50) DEFAULT 'Analyzing',
    rating VARCHAR(100) DEFAULT 'Unrated',
    percentile INT DEFAULT 50 CHECK (percentile >= 0 AND percentile <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Readiness Evaluations updated_at
DROP TRIGGER IF EXISTS trigger_readiness_evaluations_updated_at ON readiness_evaluations;
CREATE TRIGGER trigger_readiness_evaluations_updated_at
BEFORE UPDATE ON readiness_evaluations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Interview Records Table
CREATE TABLE IF NOT EXISTS interview_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    topic VARCHAR(150),
    question_text TEXT NOT NULL,
    user_answer TEXT,
    rubric_evaluation JSONB,
    model_answer TEXT,
    overall_rating INT CHECK (overall_rating >= 0 AND overall_rating <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Interview Records updated_at
DROP TRIGGER IF EXISTS trigger_interview_records_updated_at ON interview_records;
CREATE TRIGGER trigger_interview_records_updated_at
BEFORE UPDATE ON interview_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- Performance & Lookup Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_github ON candidates(github_username);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_repos_candidate_id ON candidate_repositories(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evals_candidate_job ON readiness_evaluations(candidate_id, job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_job ON interview_records(candidate_id, job_id);
