/**
 * ORBIT API Client Service.
 * 
 * Provides unified communication with the FastAPI backend (/api/v1) and
 * manages global DEMO / LIVE mode toggling.
 * 
 * Strict Evidence Integrity:
 * - DEMO mode uses local deterministic fixtures.
 * - LIVE mode calls real backend endpoints and NEVER silently falls back to demo data on error.
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';

let currentMode = 'DEMO'; // 'DEMO' | 'LIVE'

export const getApiMode = () => currentMode;

export const setApiMode = (mode) => {
  if (mode === 'DEMO' || mode === 'LIVE') {
    currentMode = mode;
    localStorage.setItem('orbit_api_mode', mode);
  }
};

export const isLiveMode = () => currentMode === 'LIVE';

// Initialize from localStorage if present
if (typeof window !== 'undefined') {
  const savedMode = localStorage.getItem('orbit_api_mode');
  if (savedMode === 'DEMO' || savedMode === 'LIVE') {
    currentMode = savedMode;
  }
}

/**
 * Standard HTTP error helper
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isRateLimit = status === 429;
    this.isNotFound = status === 404;
    this.isBadRequest = status === 400;
  }
}

/**
 * Health Check Endpoint
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) {
      throw new ApiError(`Health check failed: ${res.statusText}`, res.status);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Cannot connect to backend: ${err.message}`, 0);
  }
}

/**
 * Real PDF Resume Upload: POST /api/v1/resumes/upload
 */
export async function uploadResumePdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.detail || 'Resume upload failed', res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Network error uploading resume: ${err.message}`, 0);
  }
}

/**
 * Job Description Parsing: POST /api/v1/jobs/analyze
 */
export async function analyzeJobDescription(payload) {
  try {
    const res = await fetch(`${API_BASE}/jobs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.detail || 'Job analysis failed', res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Network error analyzing job description: ${err.message}`, 0);
  }
}

/**
 * Real GitHub Public Repository Analysis: POST /api/v1/github/analyze
 */
export async function analyzeGitHubProfile(username, candidateId = null) {
  try {
    const res = await fetch(`${API_BASE}/github/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        candidate_id: candidateId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.detail || 'GitHub analysis failed', res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Network error analyzing GitHub profile: ${err.message}`, 0);
  }
}

/**
 * Career Readiness Deterministic Evaluation: POST /api/v1/readiness/evaluate
 */
export async function evaluateReadinessApi({ candidateId, jobId, completedMilestones = [], candidateRepos = null }) {
  try {
    const res = await fetch(`${API_BASE}/readiness/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        completed_milestones: completedMilestones,
        candidate_repos: candidateRepos
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.detail || 'Readiness evaluation failed', res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Network error evaluating readiness: ${err.message}`, 0);
  }
}
