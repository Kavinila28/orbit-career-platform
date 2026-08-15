import React, { useEffect } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import GithubIcon from '../GithubIcon';

export default function EvidenceDetailModal({ skillGap, candidate, onClose, onBridgeGap }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!skillGap) return null;

  const candidateSkill = candidate.extractedSkills?.find(
    s => s.name.toLowerCase() === skillGap.skill.toLowerCase()
  );

  const matchingRepos = candidate.githubRepos?.filter(r => 
    r.techStack?.some(t => t.toLowerCase() === skillGap.skill.toLowerCase()) ||
    r.language?.toLowerCase() === skillGap.skill.toLowerCase()
  ) || [];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Skill Evidence Deep-Dive: {skillGap.skill}</h2>
              <span className={`badge ${
                skillGap.gapLevel === 'Low' ? 'badge-success' : 
                skillGap.gapLevel === 'Medium' ? 'badge-warning' : 'badge-danger'
              }`}>
                {skillGap.gapLevel} Gap
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Category: <strong>{skillGap.category}</strong> • Requirement: <strong>{skillGap.importance}</strong>
            </p>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '18px' }}>
          
          {/* Summary Box */}
          <div style={{ 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Evaluation Status & Signal
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {skillGap.candidateEvidence}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {skillGap.actionItem}
            </div>
          </div>

          {/* Matched GitHub Repositories Proof */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Matched GitHub Repositories ({matchingRepos.length})
            </h4>

            {matchingRepos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchingRepos.map(repo => (
                  <div 
                    key={repo.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GithubIcon size={14} />
                        {repo.name}
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        Score: {repo.complexityScore}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {repo.description}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      {repo.techStack?.map(t => (
                        <span key={t} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-text)',
                fontSize: '0.875rem'
              }}>
                <AlertTriangle size={24} style={{ marginBottom: '6px' }} />
                <div>No matching code repositories detected in candidate's GitHub profile.</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>
                  Hiring teams will discount resume claims for this skill without visible commit proof.
                </div>
              </div>
            )}
          </div>

          {/* Resume Proof Breakdown */}
          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '14px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)' 
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Resume Analysis
            </h4>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Resume Mentions: <strong>{candidateSkill?.resumeMentions || 0} times</strong> • 
              Certified: <strong>{candidateSkill?.certified ? `Yes (${candidateSkill.certName})` : 'No Certification'}</strong>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {skillGap.gapLevel !== 'Low' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onBridgeGap(skillGap.skill);
              }}
            >
              Open Gap-Closing Blueprint
              <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
