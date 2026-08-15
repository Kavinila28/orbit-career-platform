import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy, Check } from 'lucide-react';

export default function ProjectBlueprintModal({ blueprint, onClose, onSimulateComplete, isCompleted }) {
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!blueprint) return null;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{blueprint.title}</h2>
              <span className="badge badge-primary">{blueprint.impactOnReadiness}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Bridges Target Gaps: <strong>{blueprint.targetSkills.join(', ')}</strong> • Estimated Time: <strong>{blueprint.estimatedTimeToBuild}</strong>
            </p>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          
          {/* Why this matters */}
          <div style={{ 
            background: 'var(--brand-light)', 
            border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px 18px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: '4px' }}>
              Why Hiring Managers Value This Project:
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {blueprint.whyThisMatters}
            </div>
          </div>

          {/* Architecture Components */}
          {blueprint.architecture && (
            <div className="card">
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Architecture & Data Flow
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {Object.entries(blueprint.architecture).map(([key, desc]) => (
                  <div key={key} style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--brand-primary)' }}>
                      {key}:
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Folder Tree */}
          {blueprint.repoStructure && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Recommended Repository Structure:
              </h4>
              <div className="code-block" style={{ fontSize: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                {blueprint.repoStructure.join('\n')}
              </div>
            </div>
          )}

          {/* Step-by-Step Milestones */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Implementation Milestones:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blueprint.milestones?.map((m) => (
                <div 
                  key={m.step}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Step {m.step}: {m.title}
                  </div>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {m.tasks.map((task, tidx) => (
                      <li key={tidx}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Resume Bullets */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Targeted Resume Bullet Points (Ready to Copy):
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {blueprint.resumeBullets?.map((bullet, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'var(--bg-tertiary)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>• {bullet}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => copyToClipboard(bullet, idx)}
                  >
                    {copiedBulletIdx === idx ? (
                      <>
                        <Check size={12} color="var(--success-solid)" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Spec
          </button>

          <button 
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              onSimulateComplete(blueprint.id);
              onClose();
            }}
          >
            <CheckCircle size={15} />
            {isCompleted ? 'Mark as Incomplete in Simulator' : `Simulate Completing Project (${blueprint.impactOnReadiness})`}
          </button>
        </div>

      </div>
    </div>
  );
}
