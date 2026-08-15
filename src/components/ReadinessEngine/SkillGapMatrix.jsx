import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function SkillGapMatrix({ gaps, onSelectSkillGap, onOpenRoadmap }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(gaps.map(g => g.category)))];

  const filteredGaps = gaps.filter(g => {
    const matchesSeverity = filterSeverity === 'ALL' || g.gapLevel.toUpperCase() === filterSeverity;
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch = g.skill.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.candidateEvidence.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const getGapBadgeClass = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high':
      case 'critical': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const getProgressColor = (strength) => {
    if (strength >= 70) return 'var(--success-solid)';
    if (strength >= 40) return 'var(--warning-solid)';
    return 'var(--danger-solid)';
  };

  const getEvidenceStateBadge = (gap) => {
    const state = gap.evidenceState || (gap.evidenceStrength >= 75 ? 'VERIFIED' : gap.hasCert ? 'PARTIAL' : gap.evidenceStrength > 0 ? 'SELF_REPORTED' : 'UNAVAILABLE');
    switch (state) {
      case 'VERIFIED':
        return <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>VERIFIED</span>;
      case 'PARTIAL':
        return <span className="badge badge-primary" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>PARTIAL</span>;
      case 'SELF_REPORTED':
        return <span className="badge badge-warning" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>SELF_REPORTED</span>;
      case 'UNAVAILABLE':
      default:
        return <span className="badge badge-neutral" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>UNAVAILABLE</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Controls & Filter Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        
        {/* Severity Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filterSeverity === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSeverity('ALL')}
          >
            All Skills ({gaps.length})
          </button>
          <button
            className={`btn btn-sm ${filterSeverity === 'HIGH' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSeverity('HIGH')}
          >
            Critical / High Gaps ({gaps.filter(g => g.gapLevel === 'High').length})
          </button>
          <button
            className={`btn btn-sm ${filterSeverity === 'MEDIUM' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSeverity('MEDIUM')}
          >
            Medium Gaps ({gaps.filter(g => g.gapLevel === 'Medium').length})
          </button>
          <button
            className={`btn btn-sm ${filterSeverity === 'LOW' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSeverity('LOW')}
          >
            Verified Strengths ({gaps.filter(g => g.gapLevel === 'Low').length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            className="select-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <div style={{ position: 'relative', width: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

      </div>

      {/* Main Skill Gap Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Skill & Category</th>
              <th>Job Requirement</th>
              <th>Candidate Technical Evidence</th>
              <th>Evidence Strength</th>
              <th>Gap Level</th>
              <th>Hireability Impact</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGaps.map(g => (
              <tr 
                key={g.skill}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectSkillGap(g)}
              >
                {/* Skill Name & Category */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{g.skill}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {g.category}
                    </span>
                  </div>
                  {g.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {g.description}
                    </div>
                  )}
                </td>

                {/* Job Requirement Tier */}
                <td>
                  <span className={`badge ${g.importance === 'Required' ? 'badge-primary' : 'badge-neutral'}`}>
                    {g.importance}
                  </span>
                </td>

                {/* Candidate Evidence */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {g.gapLevel === 'Low' ? (
                        <CheckCircle2 size={15} style={{ color: 'var(--success-solid)', flexShrink: 0 }} />
                      ) : g.gapLevel === 'Medium' ? (
                        <AlertCircle size={15} style={{ color: 'var(--warning-solid)', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: 'var(--danger-solid)', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {g.candidateEvidence}
                      </span>
                    </div>
                    <div>
                      {getEvidenceStateBadge(g)}
                    </div>
                  </div>
                </td>

                {/* Evidence Strength Progress */}
                <td style={{ minWidth: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${g.evidenceStrength}%`,
                          backgroundColor: getProgressColor(g.evidenceStrength)
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '30px' }}>
                      {g.evidenceStrength}%
                    </span>
                  </div>
                </td>

                {/* Gap Level Badge */}
                <td>
                  <span className={`badge ${getGapBadgeClass(g.gapLevel)}`}>
                    {g.gapLevel} Gap
                  </span>
                </td>

                {/* Hireability Impact */}
                <td>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.8125rem',
                    color: g.gapLevel === 'Low' ? 'var(--success-solid)' : g.gapLevel === 'High' ? 'var(--danger-solid)' : 'var(--warning-solid)' 
                  }}>
                    {g.impactScore}
                  </span>
                </td>

                {/* Action Button */}
                <td style={{ textAlign: 'right' }}>
                  {g.gapLevel === 'Low' ? (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSkillGap(g);
                      }}
                    >
                      Audit Proof
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRoadmap(g.skill);
                      }}
                    >
                      Bridge Gap
                      <ChevronRight size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
