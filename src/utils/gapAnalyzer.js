/**
 * ORBIT Gap Analyzer (Client-Side)
 * Strictly preserves the 4 approved evidence states:
 * VERIFIED, PARTIAL, SELF_REPORTED, UNAVAILABLE
 */

export function analyzeSkillGaps(candidate, job, completedMilestones = []) {
  if (!candidate || !job) return [];

  const allSkills = [
    ...(job.requiredSkills || []).map(s => ({ ...s, importance: "Required" })),
    ...(job.preferredSkills || []).map(s => ({ ...s, importance: "Preferred" }))
  ];

  return allSkills.map(reqSkill => {
    const isBridgedByMilestone = completedMilestones.some(mId => {
      if (mId === "build-fastapi-service" && (reqSkill.name === "FastAPI" || reqSkill.name === "Docker")) return true;
      if (mId === "dockerize-repos" && reqSkill.name === "Docker") return true;
      if (mId === "aws-deploy-ecs" && reqSkill.name === "AWS") return true;
      if (mId === "redis-caching-layer" && reqSkill.name === "Redis") return true;
      if (mId === "k8s-helm-setup" && (reqSkill.name === "Kubernetes" || reqSkill.name === "Helm")) return true;
      return false;
    });

    const candidateSkill = (candidate.extractedSkills || []).find(
      s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
    );

    const matchingRepos = (candidate.githubRepos || []).filter(r => 
      (r.techStack || r.tech_stack || []).some(t => t.toLowerCase() === reqSkill.name.toLowerCase()) ||
      (r.language || '').toLowerCase() === reqSkill.name.toLowerCase()
    );

    const repoCount = candidateSkill?.repoCount || matchingRepos.length || 0;
    const hasCert = candidateSkill?.certified || false;
    const certName = candidateSkill?.certName || "Certification";
    const resumeMentions = candidateSkill?.resumeMentions || (candidateSkill ? 1 : 0);

    let candidateEvidence = "Not found in analyzed technical evidence";
    let evidenceState = "UNAVAILABLE";
    let gapLevel = "High";
    let evidenceStrength = 0;
    let impactScore = reqSkill.importance === "Required" ? "+15 pts" : "+5 pts";
    let actionItem = `Start milestone blueprint to master and implement ${reqSkill.name}`;

    if (isBridgedByMilestone) {
      candidateEvidence = "Bridged via Completed Project Blueprint";
      evidenceState = "VERIFIED";
      gapLevel = "Low";
      evidenceStrength = 95;
      impactScore = "Active Strength";
      actionItem = "Completed in What-If Simulator";
    } else if (repoCount >= 2) {
      candidateEvidence = `${repoCount} GitHub repositories with verified code`;
      evidenceState = "VERIFIED";
      gapLevel = "Low";
      evidenceStrength = Math.min(100, 75 + repoCount * 5);
      impactScore = "Verified Strength";
      actionItem = "Maintain test coverage and active commit history";
    } else if (repoCount === 1) {
      candidateEvidence = "1 GitHub repository (Verified in Code)";
      evidenceState = "VERIFIED";
      gapLevel = "Low";
      evidenceStrength = 75;
      impactScore = "Verified Match";
      actionItem = "Expand test coverage and module depth in repository";
    } else if (hasCert) {
      candidateEvidence = `Certified (${certName}) — 0 code repositories`;
      evidenceState = "PARTIAL";
      gapLevel = "Medium";
      evidenceStrength = 50;
      impactScore = "+8 pts";
      actionItem = `Build 1 production repository demonstrating ${reqSkill.name} in code`;
    } else if (resumeMentions > 0) {
      candidateEvidence = `Self-reported on resume (${resumeMentions}x) — 0 code repositories`;
      evidenceState = "SELF_REPORTED";
      gapLevel = reqSkill.importance === "Required" ? "High" : "Medium";
      evidenceStrength = 25;
      impactScore = reqSkill.importance === "Required" ? "+12 pts" : "+6 pts";
      actionItem = `Create a GitHub repository to provide code proof for ${reqSkill.name}`;
    }

    return {
      skill: reqSkill.name,
      category: reqSkill.category || "General",
      importance: reqSkill.importance,
      description: reqSkill.description || "",
      candidateEvidence,
      evidenceState,
      repoCount,
      hasCert,
      gapLevel,
      evidenceStrength,
      impactScore,
      actionItem
    };
  });
}
