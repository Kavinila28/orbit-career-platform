import React from 'react';
import { CheckSquare, Square, TrendingUp, Award, Download, ShieldCheck, RefreshCcw } from 'lucide-react';

export default function WhatIfSimulator({ 
  candidate, 
  job, 
  readiness, 
  completedMilestones, 
  onToggleMilestone, 
  onResetMilestones,
  onExportDossier 
}) {
  const simulationMilestones = [
    {
      id: "build-fastapi-service",
      title: "Build High-Throughput FastAPI ML Serving Gateway",
      targetGap: "FastAPI & Low-Latency Serving",
      pts: 14,
      desc: "Creates production REST API with Pydantic validation and async inference queue."
    },
    {
      id: "dockerize-repos",
      title: "Add Multi-Stage Dockerfiles & Docker Compose",
      targetGap: "Docker & Containerization",
      pts: 8,
      desc: "Packages application into lightweight, reproducible container images."
    },
    {
      id: "add-pytest-ci",
      title: "Write PyTest Unit Tests (85%+ coverage) & GitHub Actions CI",
      targetGap: "Code Quality & Automated CI/CD",
      pts: 6,
      desc: "Establishes automated test verification on every pull request."
    },
    {
      id: "aws-deploy-ecs",
      title: "Deploy Containerized Gateway to AWS ECS / App Runner",
      targetGap: "AWS Cloud Deployment",
      pts: 5,
      desc: "Proves hands-on cloud orchestration beyond basic certification claims."
    },
    {
      id: "redis-caching-layer",
      title: "Implement Redis Lua Token-Bucket Rate Limiter",
      targetGap: "Redis & Distributed Systems",
      pts: 9,
      desc: "Demonstrates atomic concurrency handling and caching architecture."
    },
    {
      id: "k8s-helm-setup",
      title: "Configure Kubernetes Helm Charts & Prometheus Metrics",
      targetGap: "Kubernetes & Observability",
      pts: 11,
      desc: "Sets up autoscaling, rolling releases, and telemetry dashboards."
    },
    {
      id: "dsa-graph-mastery",
      title: "Solve 25 Curated Graph & Sliding Window DSA Problems",
      targetGap: "Technical Interview Algorithmics",
      pts: 4,
      desc: "Ensures algorithmic speed during live coding screening rounds."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hero: Simulation Header & Score Projection */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--brand-light) 100%)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">Interactive Career Simulation</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Target: {job.title} ({job.company})
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
              "What-If" Real-Time Readiness Projector
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '620px' }}>
              Simulate completing specific engineering projects, adding tests, or dockerizing code. Watch how ORBIT's multi-factor algorithm recalculates your employability score in real time!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Projected Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: readiness.overallScore >= 80 ? 'var(--success-solid)' : 'var(--brand-primary)' }}>
                {readiness.overallScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: readiness.overallScore >= 80 ? 'var(--success-solid)' : 'var(--warning-solid)' }}>
                {readiness.milestoneBonus > 0 ? `+${readiness.milestoneBonus} Pts from Milestones` : 'Baseline Score'}
              </div>
            </div>

            {readiness.milestoneBonus > 0 && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={onResetMilestones}
                title="Reset simulation to candidate baseline"
              >
                <RefreshCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Milestones Checklist & Career Progress History */}
      <div className="grid-2">
        
        {/* Left Column: Interactive Milestone Toggles */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckSquare size={16} style={{ color: 'var(--brand-primary)' }} />
              Simulate Completing Gap-Closing Milestones
            </h3>
            <span className="badge badge-neutral">
              {completedMilestones.length} of {simulationMilestones.length} Completed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {simulationMilestones.map((m) => {
              const isChecked = completedMilestones.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => onToggleMilestone(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                    border: isChecked ? '1px solid var(--success-border)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isChecked ? 'var(--success-solid)' : 'var(--text-muted)' }}>
                    {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {m.title}
                      </span>
                      <span className={`badge ${isChecked ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.6875rem' }}>
                        +{m.pts} pts
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {m.desc}
                    </p>

                    <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '4px' }}>
                      Target: {m.targetGap}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Historical Career Readiness Trajectory & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Progress Timeline Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <TrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
                Career Readiness Growth History
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {candidate.progressHistory.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: 'var(--radius-full)', 
                    background: 'var(--brand-light)', 
                    color: 'var(--brand-primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8125rem'
                  }}>
                    {item.score}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      {item.event}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.date}
                    </div>
                  </div>
                </div>
              ))}

              {/* Simulated Current Step */}
              {readiness.milestoneBonus > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--success-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: 'var(--radius-full)', 
                    background: 'var(--success-solid)', 
                    color: '#fff',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8125rem'
                  }}>
                    {readiness.overallScore}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--success-text)' }}>
                      Projected with {completedMilestones.length} Completed Milestones
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', opacity: 0.85 }}>
                      Simulation Active
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verified Badges & Export */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Award size={16} style={{ color: 'var(--brand-primary)' }} />
                Verified Engineering Proof Badges
              </h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {candidate.verifiedBadges.map((b) => (
                <div 
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                >
                  <ShieldCheck size={14} color="var(--brand-primary)" />
                  <span>{b.title}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({b.issuer})</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={onExportDossier}
              >
                <Download size={14} />
                Download Verified Readiness Dossier (PDF / Report)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
