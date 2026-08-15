import React from 'react';
import { Orbit, Moon, Sun, Download, Sparkles, User, Briefcase, Radio, Wifi } from 'lucide-react';
import { SAMPLE_CANDIDATES } from '../data/sampleCandidates';
import { SAMPLE_JOBS } from '../data/sampleJobs';

export default function Navbar({
  selectedCandidate,
  onSelectCandidate,
  selectedJob,
  onSelectJob,
  theme,
  onToggleTheme,
  onExportDossier,
  readinessScore,
  apiMode = 'DEMO',
  onToggleApiMode
}) {
  return (
    <header className="navbar">
      <div className="brand-logo">
        <div className="brand-icon-wrapper">
          <Orbit size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-name">ORBIT</span>
            <span className="brand-tag">AI Career OS</span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>
            Evidence-Based Career Intelligence & Readiness
          </p>
        </div>
      </div>

      <div className="nav-controls">
        {/* DEMO / LIVE Mode Switcher */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            padding: '2px 4px',
            gap: '4px'
          }}
        >
          <button
            type="button"
            className={`btn-sm ${apiMode === 'DEMO' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ 
              padding: '4px 8px', 
              fontSize: '0.75rem', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => onToggleApiMode && onToggleApiMode('DEMO')}
            title="Use deterministic local demo fixtures"
          >
            <Radio size={12} />
            DEMO
          </button>
          <button
            type="button"
            className={`btn-sm ${apiMode === 'LIVE' ? 'btn-success' : 'btn-ghost'}`}
            style={{ 
              padding: '4px 8px', 
              fontSize: '0.75rem', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: apiMode === 'LIVE' ? 'var(--color-emerald-600, #059669)' : 'transparent',
              color: apiMode === 'LIVE' ? '#ffffff' : 'var(--text-secondary)'
            }}
            onClick={() => onToggleApiMode && onToggleApiMode('LIVE')}
            title="Connect to real FastAPI /api/v1 backend"
          >
            <Wifi size={12} />
            LIVE API
          </button>
        </div>

        {/* Candidate Switcher (Demo Candidates) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select-control"
            value={selectedCandidate.id}
            onChange={(e) => {
              const cand = SAMPLE_CANDIDATES.find(c => c.id === e.target.value);
              if (cand) onSelectCandidate(cand);
            }}
            title="Switch Candidate Profile"
          >
            {SAMPLE_CANDIDATES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.title.split(' ')[0]} {c.title.split(' ')[1] || ''})
              </option>
            ))}
          </select>
        </div>

        {/* Target Job Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select-control"
            value={selectedJob.id}
            onChange={(e) => {
              const j = SAMPLE_JOBS.find(job => job.id === e.target.value);
              if (j) onSelectJob(j);
            }}
            title="Switch Target Job"
          >
            {SAMPLE_JOBS.map(j => (
              <option key={j.id} value={j.id}>
                Target: {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Readiness Badge */}
        <div 
          className="badge badge-primary"
          style={{ padding: '6px 12px', fontSize: '0.8125rem', fontWeight: 700 }}
        >
          <Sparkles size={13} style={{ marginRight: '4px' }} />
          Readiness: {readinessScore}/100
        </div>

        {/* Export Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onExportDossier}
          title="Download Verified Career Readiness Dossier"
        >
          <Download size={14} />
          Export Dossier
        </button>

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
