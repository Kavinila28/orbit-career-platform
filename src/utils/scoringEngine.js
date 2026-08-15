/**
 * ORBIT Deterministic Career Readiness Scoring Engine (Client-Side)
 * Strictly synchronized with backend Phase 5 mathematical formulation.
 */

export function calculateReadinessScore(candidate, job, completedMilestoneIds = []) {
  if (!candidate || !job) {
    return {
      overallScore: 0,
      baseScore: 0,
      pillars: {
        skillAlignment: 0,
        codeEvidence: 0,
        productionHygiene: 0,
        architectureDepth: 0
      },
      rating: "Emerging Readiness",
      statusBadge: "Emerging Readiness",
      strengths: [],
      criticalGaps: []
    };
  }

  // 1. Skill Alignment (Weight: 35%)
  const allJobSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])];
  let totalSkillWeight = 0;
  let earnedSkillScore = 0;
  const criticalGaps = [];
  const strengths = [];

  allJobSkills.forEach(reqSkill => {
    const isRequired = reqSkill.importance === "Required";
    const skillWeight = reqSkill.weight || (isRequired ? 0.1 : 0.05);
    totalSkillWeight += skillWeight;

    // Check candidate repos
    const matchingRepos = (candidate.githubRepos || []).filter(r => 
      (r.techStack || r.tech_stack || []).some(t => t.toLowerCase() === reqSkill.name.toLowerCase()) ||
      (r.language || '').toLowerCase() === reqSkill.name.toLowerCase()
    );
    const repoCount = matchingRepos.length;

    // Check resume & certs
    const candidateSkill = (candidate.extractedSkills || []).find(
      s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
    );
    const hasCert = candidateSkill?.certified || false;
    const resumeMentions = candidateSkill?.resumeMentions || (candidateSkill ? 1 : 0);

    let factor = 0.0;
    if (repoCount >= 2) {
      factor = 1.0;
      strengths.push({ skill: reqSkill.name, evidence: `${repoCount} GitHub repositories with verified code`, level: "Verified Strong Proof" });
    } else if (repoCount === 1) {
      factor = 0.85;
      strengths.push({ skill: reqSkill.name, evidence: "1 GitHub repository (Verified in Code)", level: "Verified Match" });
    } else if (hasCert) {
      factor = 0.55;
    } else if (resumeMentions > 0) {
      factor = 0.30;
      if (isRequired) {
        criticalGaps.push({ skill: reqSkill.name, reason: "Self-reported on resume with 0 verified code repositories", severity: "High" });
      }
    } else {
      factor = 0.0;
      if (isRequired) {
        criticalGaps.push({ skill: reqSkill.name, reason: "Not found in analyzed technical evidence", severity: "High" });
      }
    }

    earnedSkillScore += factor * skillWeight;
  });

  const skillAlignmentVal = totalSkillWeight > 0 
    ? Math.min(100, Math.round((earnedSkillScore / totalSkillWeight) * 100))
    : 0;

  // 2. GitHub Code Evidence (Weight: 25%)
  const repos = candidate.githubRepos || [];
  let codeEvidenceVal = 0;
  if (repos.length > 0) {
    const volumeScore = Math.min(40, repos.length * 10);
    const avgComplexity = repos.reduce((acc, r) => acc + (r.complexityScore || r.complexity_score || 5), 0) / repos.length;
    const complexityScore = Math.min(35, (avgComplexity / 10) * 35);
    const totalCommits = repos.reduce((acc, r) => acc + (r.commits || r.commits_last_year || 0), 0);
    const commitScore = Math.min(15, (totalCommits / 150) * 15);
    const docScore = 10; // baseline 800 words
    codeEvidenceVal = Math.min(100, Math.round(volumeScore + complexityScore + commitScore + docScore));
  }

  // 3. Production Hygiene (Weight: 20%)
  let productionHygieneVal = 0;
  if (repos.length > 0) {
    let testPoints = 0;
    repos.forEach(r => {
      const cov = r.testCoverage ?? r.test_coverage;
      const hasTests = r.hasTests || r.has_tests;
      if (cov !== null && cov !== undefined) {
        testPoints += cov > 0 ? (cov / 100) * 35 : 5;
      } else if (hasTests) {
        testPoints += 17.5; // baseline presence
      }
    });
    const testScore = testPoints / repos.length;
    const dockerScore = (repos.filter(r => r.hasDocker || r.has_docker).length / repos.length) * 35;
    const ciScore = (repos.filter(r => r.hasCI || r.has_ci).length / repos.length) * 30;
    productionHygieneVal = Math.min(100, Math.round(testScore + dockerScore + ciScore));
  }

  // 4. Architecture Depth (Weight: 20%)
  let architectureDepthVal = 0;
  if (repos.length > 0) {
    let score = 0;
    if (repos.some(r => r.hasModularStructure || r.has_modular_structure)) score += 25;
    if (repos.some(r => r.hasDbIntegration || r.has_db_integration)) score += 20;
    if (repos.some(r => r.hasEnvConfig || r.has_env_config)) score += 15;
    if (repos.some(r => r.hasDocker || r.has_docker)) score += 20;
    if (repos.some(r => (r.techStack || r.tech_stack || []).some(t => ['FastAPI', 'REST APIs', 'GraphQL', 'Django'].includes(t)))) score += 20;
    architectureDepthVal = Math.min(100, score);
  }

  // Composite Deterministic Score
  const baseScore = Math.min(100, Math.max(0, Math.round(
    skillAlignmentVal * 0.35 +
    codeEvidenceVal * 0.25 +
    productionHygieneVal * 0.20 +
    architectureDepthVal * 0.20
  )));

  // Milestone Progress Bonus for Simulator View
  let milestoneBonus = 0;
  if (completedMilestoneIds && completedMilestoneIds.length > 0) {
    completedMilestoneIds.forEach(id => {
      if (id === "build-fastapi-service") milestoneBonus += 14;
      if (id === "dockerize-repos") milestoneBonus += 8;
      if (id === "add-pytest-ci") milestoneBonus += 6;
      if (id === "aws-deploy-ecs") milestoneBonus += 5;
      if (id === "redis-caching-layer") milestoneBonus += 9;
      if (id === "k8s-helm-setup") milestoneBonus += 11;
      if (id === "dsa-graph-mastery") milestoneBonus += 4;
    });
  }

  // Rating Thresholds
  let rating = "Developing Readiness";
  let statusBadge = "Developing Readiness";
  if (baseScore >= 85) {
    rating = "High Readiness";
    statusBadge = "High Readiness";
  } else if (baseScore >= 70) {
    rating = "Moderate Readiness";
    statusBadge = "Moderate Readiness";
  } else if (baseScore >= 50) {
    rating = "Developing Readiness";
    statusBadge = "Developing Readiness";
  } else {
    rating = "Emerging Readiness";
    statusBadge = "Emerging Readiness";
  }

  return {
    overallScore: baseScore,
    baseScore: baseScore,
    milestoneBonus: milestoneBonus,
    pillars: {
      skillAlignment: skillAlignmentVal,
      codeEvidence: codeEvidenceVal,
      productionHygiene: productionHygieneVal,
      architectureDepth: architectureDepthVal
    },
    rating,
    statusBadge,
    strengths,
    criticalGaps
  };
}
