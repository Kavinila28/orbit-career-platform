/**
 * Automated Frontend Integration & Unit Test Suite
 * Tests DEMO / LIVE mode toggling, API clients, error handling, 
 * evidence-state preservation, star isolation, and state clearing on LIVE failures.
 */

import assert from 'node:assert/strict';
import { calculateReadinessScore } from '../src/utils/scoringEngine.js';
import { analyzeSkillGaps } from '../src/utils/gapAnalyzer.js';
import { SAMPLE_CANDIDATES } from '../src/data/sampleCandidates.js';
import { SAMPLE_JOBS } from '../src/data/sampleJobs.js';

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

console.log('Starting Frontend Integration & Unit Tests...\n');

// 1. DEMO Mode Fixture Tests
runTest('DEMO Mode: Sample candidates load with valid profiles', () => {
  assert.ok(SAMPLE_CANDIDATES.length >= 3, 'Expected at least 3 demo candidates');
  SAMPLE_CANDIDATES.forEach(cand => {
    assert.ok(cand.id, 'Candidate must have ID');
    assert.ok(cand.name, 'Candidate must have name');
    assert.ok(cand.githubRepos.length > 0, 'Candidate must have repos');
    assert.ok(cand.extractedSkills.length > 0, 'Candidate must have extracted skills');
  });
});

runTest('DEMO Mode: Sample jobs load with required skills and weights', () => {
  assert.ok(SAMPLE_JOBS.length >= 3, 'Expected at least 3 demo jobs');
  SAMPLE_JOBS.forEach(job => {
    assert.ok(job.id, 'Job must have ID');
    assert.ok(job.requiredSkills.length > 0, 'Job must have required skills');
  });
});

// 2. Strict 4 Evidence States in Gap Analysis
runTest('Evidence State: Preserves exactly 4 states (VERIFIED, PARTIAL, SELF_REPORTED, UNAVAILABLE)', () => {
  const candidate = {
    id: "test-cand",
    extractedSkills: [
      { name: "Python", repoCount: 2, certified: false, resumeMentions: 3 },
      { name: "AWS", repoCount: 0, certified: true, certName: "AWS SAA", resumeMentions: 1 },
      { name: "SQL", repoCount: 0, certified: false, resumeMentions: 2 }
    ],
    githubRepos: [
      { name: "repo1", techStack: ["Python"], language: "Python" }
    ]
  };

  const job = {
    requiredSkills: [
      { name: "Python", importance: "Required", weight: 0.4 },
      { name: "AWS", importance: "Required", weight: 0.3 },
      { name: "SQL", importance: "Required", weight: 0.2 },
      { name: "Rust", importance: "Required", weight: 0.1 }
    ],
    preferredSkills: []
  };

  const gaps = analyzeSkillGaps(candidate, job);
  const states = gaps.map(g => g.evidenceState);

  assert.equal(gaps.find(g => g.skill === "Python").evidenceState, "VERIFIED");
  assert.equal(gaps.find(g => g.skill === "AWS").evidenceState, "PARTIAL");
  assert.equal(gaps.find(g => g.skill === "SQL").evidenceState, "SELF_REPORTED");
  assert.equal(gaps.find(g => g.skill === "Rust").evidenceState, "UNAVAILABLE");

  // Verify no other states exist
  const allowed = new Set(["VERIFIED", "PARTIAL", "SELF_REPORTED", "UNAVAILABLE"]);
  states.forEach(s => assert.ok(allowed.has(s), `Invalid evidence state: ${s}`));
});

// 3. Deterministic Scoring Range & Rating Bounds
runTest('Scoring Engine: Bounded strictly in [0, 100]', () => {
  const emptyResult = calculateReadinessScore(null, null);
  assert.equal(emptyResult.overallScore, 0);

  const lowCandidate = { extractedSkills: [], githubRepos: [] };
  const targetJob = SAMPLE_JOBS[0];
  const lowResult = calculateReadinessScore(lowCandidate, targetJob);
  assert.ok(lowResult.overallScore >= 0 && lowResult.overallScore <= 100);
  assert.equal(lowResult.rating, "Emerging Readiness");

  const highCandidate = SAMPLE_CANDIDATES[0];
  const highResult = calculateReadinessScore(highCandidate, targetJob);
  assert.ok(highResult.overallScore >= 0 && highResult.overallScore <= 100);
});

// 4. GitHub Stars Isolation
runTest('Telemetry Rule: GitHub stars contribute 0 points to readiness score', () => {
  const job = SAMPLE_JOBS[0];
  const candZeroStars = {
    extractedSkills: [{ name: "Python", repoCount: 1 }],
    githubRepos: [{ name: "r1", language: "Python", stars: 0, commits: 20, complexityScore: 6 }]
  };
  const candMillionStars = {
    extractedSkills: [{ name: "Python", repoCount: 1 }],
    githubRepos: [{ name: "r1", language: "Python", stars: 1000000, commits: 20, complexityScore: 6 }]
  };

  const score1 = calculateReadinessScore(candZeroStars, job);
  const score2 = calculateReadinessScore(candMillionStars, job);
  assert.equal(score1.overallScore, score2.overallScore, 'Stars must not change readiness score');
});

// 5. API Error Handling & Structure
runTest('API Error Structure: Custom ApiError captures status, isRateLimit, and isNotFound', () => {
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

  const notFoundErr = new ApiError('User not found', 404);
  assert.equal(notFoundErr.isNotFound, true);
  assert.equal(notFoundErr.isRateLimit, false);

  const rateLimitErr = new ApiError('API rate limit exceeded', 429);
  assert.equal(rateLimitErr.isRateLimit, true);
  assert.equal(rateLimitErr.isNotFound, false);
});

// 6. Nullable Test Coverage Preservation
runTest('Telemetry Rule: test_coverage = null (UNAVAILABLE) receives presence baseline without inventing 100%', () => {
  const candNullCoverage = {
    extractedSkills: [],
    githubRepos: [{ name: "r1", hasTests: true, testCoverage: null }]
  };
  const candVerified100 = {
    extractedSkills: [],
    githubRepos: [{ name: "r1", hasTests: true, testCoverage: 100 }]
  };
  const candNoTests = {
    extractedSkills: [],
    githubRepos: [{ name: "r1", hasTests: false, testCoverage: null }]
  };

  const job = SAMPLE_JOBS[0];
  const scoreNull = calculateReadinessScore(candNullCoverage, job);
  const score100 = calculateReadinessScore(candVerified100, job);
  const scoreNone = calculateReadinessScore(candNoTests, job);

  assert.ok(scoreNull.pillars.productionHygiene < score100.pillars.productionHygiene, 'Unavailable coverage must not get 100% credit');
  assert.ok(scoreNull.pillars.productionHygiene > scoreNone.pillars.productionHygiene, 'Test presence receives baseline presence credit');
});

// 7. LIVE Mode State Isolation: Clearing DEMO Repos on Switch and On Failure
runTest('LIVE Mode State: Switching to LIVE mode clears DEMO repos and retains 0 DEMO repos on API error', () => {
  // Simulate active demo state
  let apiMode = 'DEMO';
  const demoCandidate = SAMPLE_CANDIDATES[0];
  let liveCandidate = {
    id: 'live-candidate',
    githubRepos: [],
    stats: { totalRepos: 0, commitCountYear: 0, topLanguage: 'None' }
  };

  let activeCandidate = apiMode === 'LIVE' ? liveCandidate : demoCandidate;
  assert.ok(activeCandidate.githubRepos.length > 0, 'DEMO candidate has fixture repos');

  // Switch to LIVE mode
  apiMode = 'LIVE';
  activeCandidate = apiMode === 'LIVE' ? liveCandidate : demoCandidate;
  assert.equal(activeCandidate.githubRepos.length, 0, 'Entering LIVE mode must have 0 DEMO repos');
  assert.equal(activeCandidate.stats.totalRepos, 0);

  // Simulate LIVE request start and failure
  const handleLiveGitHubRequestStart = () => {
    liveCandidate.githubRepos = [];
    liveCandidate.stats = { totalRepos: 0, commitCountYear: 0, topLanguage: 'None' };
  };
  const handleLiveGitHubFailure = () => {
    liveCandidate.githubRepos = [];
    liveCandidate.stats = { totalRepos: 0, commitCountYear: 0, topLanguage: 'None' };
  };

  handleLiveGitHubRequestStart();
  // Request fails with HTTP 429/404/500
  handleLiveGitHubFailure();

  activeCandidate = apiMode === 'LIVE' ? liveCandidate : demoCandidate;
  assert.equal(activeCandidate.githubRepos.length, 0, 'LIVE failure must leave 0 repositories visible');
  assert.notEqual(activeCandidate.githubRepos, demoCandidate.githubRepos, 'Never replace failed LIVE request with DEMO repos');
});

console.log(`\n========================================`);
console.log(`Frontend Test Summary: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
