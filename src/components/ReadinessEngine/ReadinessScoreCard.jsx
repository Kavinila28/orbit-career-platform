import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Server, Code, Layers } from 'lucide-react';

export default function ReadinessScoreCard({ readiness, job }) {
  const getPillarColor = (score) => {
    if (score >= 80) return 'var(--success-solid)';
    if (score >= 60) return 'var(--brand-primary)';
    if (score >= 40) return 'var(--warning-solid)';
    return 'var(--danger-solid)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Main Readiness Gauge Hero */}
      <div className="card" style={{ 
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          
          {/* Left: Score Circle / Radial Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle 
                  cx="50" cy="50" r="42" 
                  stroke="var(--border-light)" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                {/* Score Stroke */}
                <circle 
                  cx="50" cy="50" r="42" 
                  stroke={readiness.overallScore >= 80 ? 'var(--success-solid)' : readiness.overallScore >= 70 ? 'var(--brand-primary)' : 'var(--warning-solid)'}
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - readiness.overallScore / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>
                  {readiness.overallScore}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  / 100
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Career Readiness Score</h3>
                <span className={`badge ${readiness.overallScore >= 70 ? 'badge-success' : readiness.overallScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                  {readiness.statusBadge || readiness.rating}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Evaluation for <strong>{job.title}</strong> at {job.company}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>Deterministic 4-Pillar Engineering Formulation • Strictly Bounded [0, 100]</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Strengths vs Gaps Count */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '12px 18px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              minWidth: '140px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success-solid)', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Verified Strengths
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, marginTop: '4px' }}>
                {readiness.strengths?.length || 0} Skills
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Code-verified proof
              </div>
            </div>

            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '12px 18px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              minWidth: '140px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--danger-solid)', fontWeight: 700 }}>
                <AlertTriangle size={14} /> Critical Gaps
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, marginTop: '4px' }}>
                {readiness.criticalGaps?.length || 0} Skills
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Missing from evidence
              </div>
            </div>
          </div>

        </div>

        {/* 4 Pillars Progress Grid */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Deterministic Multi-Factor Scoring Breakdown:
          </div>

          <div className="grid-4">
            
            {/* Pillar 1 */}
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Code size={14} /> Skill Alignment
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: getPillarColor(readiness.pillars.skillAlignment) }}>
                  {readiness.pillars.skillAlignment}%
                </span>
              </div>
              <div className="progress-track" style={{ margin: '8px 0 6px 0' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${readiness.pillars.skillAlignment}%`, 
                    backgroundColor: getPillarColor(readiness.pillars.skillAlignment) 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Weight: 35% • JD Normalized Weights
              </div>
            </div>

            {/* Pillar 2 */}
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Cpu size={14} /> Code Evidence
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: getPillarColor(readiness.pillars.codeEvidence) }}>
                  {readiness.pillars.codeEvidence}%
                </span>
              </div>
              <div className="progress-track" style={{ margin: '8px 0 6px 0' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${readiness.pillars.codeEvidence}%`, 
                    backgroundColor: getPillarColor(readiness.pillars.codeEvidence) 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Weight: 25% • Volume, Depth & Commits
              </div>
            </div>

            {/* Pillar 3 */}
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Server size={14} /> Production Hygiene
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: getPillarColor(readiness.pillars.productionHygiene) }}>
                  {readiness.pillars.productionHygiene}%
                </span>
              </div>
              <div className="progress-track" style={{ margin: '8px 0 6px 0' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${readiness.pillars.productionHygiene}%`, 
                    backgroundColor: getPillarColor(readiness.pillars.productionHygiene) 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Weight: 20% • Tests, Docker & CI/CD
              </div>
            </div>

            {/* Pillar 4 */}
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Layers size={14} /> Architecture Depth
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: getPillarColor(readiness.pillars.architectureDepth) }}>
                  {readiness.pillars.architectureDepth}%
                </span>
              </div>
              <div className="progress-track" style={{ margin: '8px 0 6px 0' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${readiness.pillars.architectureDepth}%`, 
                    backgroundColor: getPillarColor(readiness.pillars.architectureDepth) 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Weight: 20% • Modularity, DB & APIs
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
