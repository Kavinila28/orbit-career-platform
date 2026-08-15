import React, { useState } from 'react';
import { Briefcase, DollarSign, MapPin, Layers, Edit3, Sparkles, Building, Loader2, AlertCircle, Radio, Wifi } from 'lucide-react';
import { analyzeJobDescription, isLiveMode } from '../../services/api';

export default function JobDescriptionView({ job, onCustomJobCreate, apiMode = 'DEMO' }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleParseCustomJob = async () => {
    if (!customTitle || !customText) return;

    setErrorMessage(null);

    if (apiMode === 'LIVE' || isLiveMode()) {
      setIsLoading(true);
      try {
        const parsedData = await analyzeJobDescription({
          raw_description: customText,
          title: customTitle,
          company: customCompany || 'Company Benchmark'
        });

        const newJob = {
          id: parsedData.id,
          title: parsedData.title,
          company: parsedData.company,
          department: parsedData.department || 'Engineering',
          level: parsedData.level || 'Target Role',
          location: parsedData.location || 'Remote',
          salaryRange: parsedData.salary_range || '$130,000 - $180,000',
          description: parsedData.raw_description,
          requiredSkills: parsedData.required_skills.map(s => ({
            name: s.name,
            category: s.category,
            weight: s.weight,
            importance: s.importance,
            description: s.description
          })),
          preferredSkills: parsedData.preferred_skills.map(s => ({
            name: s.name,
            category: s.category,
            weight: s.weight,
            importance: s.importance,
            description: s.description
          })),
          responsibilities: parsedData.responsibilities
        };

        onCustomJobCreate(newJob);
        setIsCustomMode(false);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to parse job description via backend API.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local demo mode
      const detectedSkills = [];
      const skillList = [
        { name: "Python", category: "Languages" },
        { name: "SQL", category: "Databases" },
        { name: "Machine Learning", category: "AI/ML" },
        { name: "FastAPI", category: "Backend" },
        { name: "Docker", category: "Cloud/DevOps" },
        { name: "AWS", category: "Cloud/DevOps" },
        { name: "PostgreSQL", category: "Databases" },
        { name: "PyTorch", category: "AI/ML" }
      ];

      skillList.forEach(s => {
        if (customText.toLowerCase().includes(s.name.toLowerCase())) {
          detectedSkills.push({
            name: s.name,
            category: s.category,
            weight: 0.125,
            importance: "Required",
            description: `Extracted requirement for ${s.name}`
          });
        }
      });

      const newJob = {
        id: `custom-${Date.now()}`,
        title: customTitle,
        company: customCompany || "Custom Job Target",
        department: "Engineering",
        level: "Target Role",
        location: "Remote / Hybrid",
        salaryRange: "$130,000 - $180,000",
        description: customText,
        requiredSkills: detectedSkills.length > 0 ? detectedSkills : [
          { name: "Python", category: "Languages", weight: 0.5, importance: "Required" },
          { name: "SQL", category: "Databases", weight: 0.5, importance: "Required" }
        ],
        preferredSkills: [],
        responsibilities: [
          "Design, build, and maintain production software systems.",
          "Collaborate across cross-functional engineering teams."
        ]
      };

      onCustomJobCreate(newJob);
      setIsCustomMode(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'var(--brand-primary)', 
            color: '#fff', 
            width: '42px', 
            height: '42px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{job.title}</h2>
              <span className="badge badge-primary">{job.company}</span>
              <span 
                className={`badge ${apiMode === 'LIVE' ? 'badge-success' : 'badge-neutral'}`}
                style={{ fontSize: '0.6875rem' }}
              >
                {apiMode === 'LIVE' ? <Wifi size={10} style={{ marginRight: '3px' }} /> : <Radio size={10} style={{ marginRight: '3px' }} />}
                {apiMode === 'LIVE' ? 'LIVE JD TAXONOMY' : 'DEMO BENCHMARK'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '4px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building size={13} /> {job.department}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={13} /> {job.salaryRange}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setErrorMessage(null);
            }}
          >
            <Edit3 size={14} />
            {isCustomMode ? 'View Pre-set Roles' : 'Paste Custom Job Description'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div 
          className="badge badge-danger" 
          style={{ 
            padding: '10px 16px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger, #ef4444)',
            color: 'var(--color-danger, #ef4444)'
          }}
        >
          <AlertCircle size={16} />
          <span><strong>Job Analysis API Error:</strong> {errorMessage}</span>
        </div>
      )}

      {isCustomMode ? (
        /* Custom Job Description Parser Form */
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
              Custom Job Description Parser & Weighting Engine
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="grid-2">
              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: '6px' }}>Target Job Title *</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Lead Machine Learning Infrastructure Engineer"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: '6px' }}>Company / Benchmark Org</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Stripe, Scale AI, Datadog"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: '6px' }}>Raw Job Description Text *</label>
              <textarea
                className="text-input"
                style={{ minHeight: '160px', lineHeight: 1.5 }}
                placeholder="Paste complete job description requirements, qualifications, and responsibilities..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCustomMode(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleParseCustomJob}
                disabled={!customTitle || !customText || isLoading}
              >
                {isLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                {isLoading ? 'Parsing Taxonomy via Backend...' : (apiMode === 'LIVE' ? 'Parse & Weight via API' : 'Parse Job Requirements')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Requirements Breakdown Grid */
        <div className="grid-2">
          
          {/* Left: Required Technical Skills */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Layers size={16} style={{ color: 'var(--brand-primary)' }} />
                Required Technical Competencies
              </h3>
              <span className="badge badge-primary">{job.requiredSkills.length} Requirements</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {job.requiredSkills.map(skill => (
                <div 
                  key={skill.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{skill.name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>{skill.category}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Weight: <strong>{Math.round(skill.weight * 100)}%</strong> • {skill.description || 'Core technical requirement'}
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>Required</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preferred Qualifications & Responsibilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Preferred Skills */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '0.9375rem' }}>
                  Preferred / Nice-to-Have Skills
                </h3>
                <span className="badge badge-neutral">{job.preferredSkills.length} Preferred</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.preferredSkills.map(skill => (
                  <div 
                    key={skill.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{skill.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.75rem' }}>
                        ({Math.round(skill.weight * 100)}% weight)
                      </span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>Preferred</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '0.9375rem' }}>
                  Core Role Responsibilities
                </h3>
              </div>

              <ul style={{ paddingLeft: '18px', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{resp}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
