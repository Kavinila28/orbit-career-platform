/**
 * Export Candidate Career Dossier as downloadable text / print format
 */

export function generateCareerDossierHtml(candidate, job, readiness, gaps) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ORBIT Career Readiness Dossier - ${candidate.name}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
    .title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
    .subtitle { font-size: 14px; color: #64748b; margin: 0; }
    .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; }
    .score-val { font-size: 36px; font-weight: 800; color: #2563eb; }
    .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 28px 0 14px 0; border-left: 4px solid #2563eb; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 600; }
    td { padding: 10px 12px; border: 1px solid #e2e8f0; }
    .gap-low { color: #16a34a; font-weight: 600; }
    .gap-medium { color: #d97706; font-weight: 600; }
    .gap-high { color: #dc2626; font-weight: 600; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 11px; border-radius: 4px; background: #e2e8f0; font-weight: 600; margin-right: 6px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">ORBIT — Verified Career Readiness Dossier</h1>
    <p class="subtitle">Candidate: <strong>${candidate.name}</strong> (${candidate.title}) | Target Role: <strong>${job.title}</strong> (${job.company}) | Generated: ${dateStr}</p>
  </div>

  <div class="score-box">
    <div>
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600;">Overall Career Readiness Score</div>
      <div style="font-size: 16px; font-weight: 600; margin-top: 4px; color: #334155;">${readiness.rating || readiness.statusBadge}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Deterministic 4-Pillar Engineering Formulation</div>
    </div>
    <div style="text-align: right;">
      <div class="score-val">${readiness.overallScore}/100</div>
      <div style="font-size: 12px; color: #64748b;">Evidence Match Benchmark</div>
    </div>
  </div>

  <div class="section-title">Deterministic Evaluation Pillars</div>
  <table>
    <thead>
      <tr>
        <th>Pillar</th>
        <th>Weight</th>
        <th>Score</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Core Skill Alignment</strong></td>
        <td>35%</td>
        <td>${readiness.pillars.skillAlignment}/100</td>
        <td>JD Normalized Weights & Evidence Multipliers</td>
      </tr>
      <tr>
        <td><strong>GitHub Code Evidence</strong></td>
        <td>25%</td>
        <td>${readiness.pillars.codeEvidence}/100</td>
        <td>Repository Volume, Complexity & Commits</td>
      </tr>
      <tr>
        <td><strong>Production & DevOps Hygiene</strong></td>
        <td>20%</td>
        <td>${readiness.pillars.productionHygiene}/100</td>
        <td>Unit Testing, Docker Containerization, CI/CD</td>
      </tr>
      <tr>
        <td><strong>Architecture & Engineering Depth</strong></td>
        <td>20%</td>
        <td>${readiness.pillars.architectureDepth}/100</td>
        <td>Modular Separation, DB Integration & APIs</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Skill Gap & Evidence Matrix</div>
  <table>
    <thead>
      <tr>
        <th>Skill</th>
        <th>Requirement</th>
        <th>Candidate Proof</th>
        <th>Evidence State</th>
        <th>Gap Status</th>
        <th>Action Recommended</th>
      </tr>
    </thead>
    <tbody>
      ${gaps.map(g => `
        <tr>
          <td><strong>${g.skill}</strong> <span style="font-size: 11px; color: #64748b;">(${g.category})</span></td>
          <td><span class="badge">${g.importance}</span></td>
          <td>${g.candidateEvidence}</td>
          <td><span class="badge">${g.evidenceState || (g.gapLevel === 'Low' ? 'VERIFIED' : 'SELF_REPORTED')}</span></td>
          <td class="gap-${g.gapLevel.toLowerCase()}">${g.gapLevel} Gap (${g.evidenceStrength}%)</td>
          <td>${g.actionItem}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>ORBIT AI Career OS • Evidence-Based Career Intelligence & Readiness Platform</p>
    <p>Report generated via deterministic technical audit • Zero fabricated repository evidence</p>
  </div>
</body>
</html>
  `;
}
