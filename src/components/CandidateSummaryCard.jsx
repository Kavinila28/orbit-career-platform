import React from 'react';
import { MapPin, GraduationCap, ArrowUpRight, Layers, Radio, Wifi } from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function CandidateSummaryCard({ candidate, job, readiness, onOpenTab, apiMode = 'DEMO' }) {
  return (
    <div className="card" style={{ marginTop: '20px', background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left: Avatar & Bio */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img 
            src={candidate.avatar || `https://avatars.githubusercontent.com/${candidate.githubUsername || 'octocat'}`} 
            alt={candidate.name} 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: 'var(--radius-full)', 
              objectFit: 'cover',
              border: '2px solid var(--border-medium)'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{candidate.name}</h2>
              <span className="badge badge-primary">{candidate.title}</span>
              <span 
                className={`badge ${apiMode === 'LIVE' ? 'badge-success' : 'badge-neutral'}`}
                style={{ fontSize: '0.6875rem' }}
              >
                {apiMode === 'LIVE' ? <Wifi size={10} style={{ marginRight: '3px' }} /> : <Radio size={10} style={{ marginRight: '3px' }} />}
                {apiMode === 'LIVE' ? 'LIVE EVALUATION' : 'DEMO FIXTURE'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {candidate.location || 'Remote'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={13} /> {candidate.education || 'Computer Science'}
              </span>
              <a 
                href={candidate.githubUrl || `https://github.com/${candidate.githubUsername}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}
              >
                <GithubIcon size={13} /> @{candidate.githubUsername}
              </a>
            </div>
          </div>
        </div>

        {/* Center: Target Job Match Indicator */}
        <div style={{ 
          background: 'var(--bg-tertiary)', 
          padding: '12px 18px', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-light)',
          minWidth: '260px'
        }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Target Benchmark Role
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {job.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {job.company} • {job.level}
          </div>
        </div>

        {/* Right: Quick Evidence Stats */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {candidate.stats.totalRepos || candidate.githubRepos.length}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Repositories
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'var(--border-light)' }}></div>

          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {candidate.stats.commitCountYear || 0}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Year Commits
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'var(--border-light)' }}></div>

          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {readiness.overallScore}%
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Readiness Score
            </div>
          </div>
        </div>

      </div>

      {/* Summary Highlight Alert Bar */}
      <div style={{ 
        marginTop: '16px', 
        paddingTop: '14px', 
        borderTop: '1px solid var(--border-light)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Readiness Rating:</span>
          <span className={`badge ${readiness.overallScore >= 70 ? 'badge-success' : readiness.overallScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
            {readiness.statusBadge || readiness.rating || 'Evaluating'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            ({readiness.rating || 'Deterministic Assessment'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenTab('gap-matrix')}
          >
            <Layers size={13} />
            View Skill Gap Matrix
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onOpenTab('roadmap')}
          >
            <ArrowUpRight size={13} />
            Bridge Gaps with Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
