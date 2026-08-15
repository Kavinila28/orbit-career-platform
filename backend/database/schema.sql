-- ====================================================================
-- ORBIT — Core Relational Database Schema for Supabase (PostgreSQL 15+)
-- Phase 8: Core Persistence (4 Tables)
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. Candidates Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT 'Software Engineer',
    email VARCHAR(255),
    location VARCHAR(255) DEFAULT 'Remote',
    education VARCHAR(255),
    github_username VARCHAR(255),
    resume_text TEXT,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{"totalRepos": 0, "commitCountYear": 0, "topLanguage": "Python"}'::jsonb,
    verified_badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. Candidate Repositories Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS candidate_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(100) DEFAULT 'Python',
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    commits_last_year INTEGER DEFAULT 0,
    has_tests BOOLEAN DEFAULT FALSE,
    test_coverage REAL, -- Nullable: NULL = UNAVAILABLE, 0.0 = Verified 0%, >0.0 = Verified Coverage %
    has_docker BOOLEAN DEFAULT FALSE,
    has_ci BOOLEAN DEFAULT FALSE,
    has_db_integration BOOLEAN DEFAULT FALSE,
    has_env_config BOOLEAN DEFAULT FALSE,
    has_modular_structure BOOLEAN DEFAULT FALSE,
    complexity_score REAL DEFAULT 5.0,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    insights JSONB DEFAULT '[]'::jsonb,
    html_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Job Descriptions Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    department VARCHAR(255) DEFAULT 'Engineering',
    level VARCHAR(100) DEFAULT 'Target Role',
    location VARCHAR(255) DEFAULT 'Remote',
    salary_range VARCHAR(100),
    raw_description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    preferred_skills JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Readiness Evaluations Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS readiness_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    base_score INTEGER NOT NULL CHECK (base_score >= 0 AND base_score <= 100),
    pillars JSONB NOT NULL,
    gap_matrix JSONB NOT NULL,
    completed_milestones JSONB DEFAULT '[]'::jsonb,
    status_badge VARCHAR(100) DEFAULT 'Developing Readiness',
    rating VARCHAR(100) DEFAULT 'Developing Readiness',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_candidate_repos_candidate_id ON candidate_repositories(candidate_id);
CREATE INDEX IF NOT EXISTS idx_readiness_eval_cand_job ON readiness_evaluations(candidate_id, job_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_created ON job_descriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates(created_at DESC);

-- ====================================================================
-- 7. Row Level Security (RLS) Configuration
-- ====================================================================
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_evaluations ENABLE ROW LEVEL SECURITY;

-- Backend Service Access Policies (Allow read/write by authenticated service / anon for dev API)
CREATE POLICY "Allow select for public candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Allow insert/update for candidates" ON candidates FOR ALL USING (true);

CREATE POLICY "Allow select for repositories" ON candidate_repositories FOR SELECT USING (true);
CREATE POLICY "Allow insert/update for repositories" ON candidate_repositories FOR ALL USING (true);

CREATE POLICY "Allow select for job descriptions" ON job_descriptions FOR SELECT USING (true);
CREATE POLICY "Allow insert/update for job descriptions" ON job_descriptions FOR ALL USING (true);

CREATE POLICY "Allow select for evaluations" ON readiness_evaluations FOR SELECT USING (true);
CREATE POLICY "Allow insert/update for evaluations" ON readiness_evaluations FOR ALL USING (true);
