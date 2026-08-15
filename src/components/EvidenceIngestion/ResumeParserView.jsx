import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Award, Sparkles, UploadCloud, Edit3, AlertCircle, Loader2, Radio, Wifi } from 'lucide-react';
import { uploadResumePdf, isLiveMode } from '../../services/api';

export default function ResumeParserView({ candidate, onUpdateResume, onLiveResumeExtracted, apiMode = 'DEMO' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeText, setResumeText] = useState(candidate.resumeText);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Synchronize resume text when active candidate changes
  useEffect(() => {
    setResumeText(candidate.resumeText);
    setIsEditing(false);
    setErrorMessage(null);
  }, [candidate.id, candidate.resumeText]);

  const handleSave = () => {
    if (onUpdateResume) {
      onUpdateResume(resumeText);
    }
    setIsEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMessage(null);

    if (apiMode === 'LIVE' || isLiveMode()) {
      // Real backend PDF extraction
      setIsLoading(true);
      try {
        const extractedData = await uploadResumePdf(file);
        setUploadSuccess(true);
        if (onLiveResumeExtracted) {
          onLiveResumeExtracted(extractedData);
        }
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to parse resume via backend API.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local demo mode
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setResumeText(text);
        if (onUpdateResume) onUpdateResume(text);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div style={{ 
        background: 'var(--brand-light)', 
        border: '1px solid var(--border-light)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'var(--brand-primary)', 
            color: '#fff', 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Resume Technical Evidence Parser
              </span>
              <span 
                className={`badge ${apiMode === 'LIVE' ? 'badge-success' : 'badge-neutral'}`}
                style={{ fontSize: '0.6875rem' }}
              >
                {apiMode === 'LIVE' ? <Wifi size={10} style={{ marginRight: '3px' }} /> : <Radio size={10} style={{ marginRight: '3px' }} />}
                {apiMode === 'LIVE' ? 'LIVE MODE (pypdf Backend)' : 'DEMO MODE (Local Fixtures)'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Extracted {candidate.extractedSkills.length} technical skills, education timeline, and {candidate.extractedSkills.filter(s => s.certified).length} verified certifications.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <label className={`btn btn-secondary btn-sm ${isLoading ? 'disabled' : ''}`} style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? <Loader2 size={14} className="spin" /> : <UploadCloud size={14} />}
            {isLoading ? 'Extracting via Backend...' : 'Upload PDF / Resume'}
            <input 
              type="file" 
              accept=".pdf,.txt,.md" 
              onChange={handleFileUpload} 
              disabled={isLoading}
              style={{ display: 'none' }} 
            />
          </label>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
          >
            <Edit3 size={14} />
            {isEditing ? 'Cancel Edit' : 'Edit Resume Text'}
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
          <span><strong>API Error:</strong> {errorMessage}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="badge badge-success" style={{ padding: '8px 14px', width: 'fit-content' }}>
          <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
          {apiMode === 'LIVE' ? 'PDF uploaded and parsed by pypdf backend!' : 'Resume loaded and parsed!'}
        </div>
      )}

      {/* Grid: Extracted Skills & Resume View */}
      <div className="grid-2">
        
        {/* Left: Extracted Skills by Category */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
              Extracted Technical Skills & Evidence Classification
            </h3>
            <span className="badge badge-neutral">{candidate.extractedSkills.length} Skills</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidate.extractedSkills.map(skill => {
              const state = skill.evidenceState || (skill.certified ? 'PARTIAL' : skill.repoCount > 0 ? 'VERIFIED' : 'SELF_REPORTED');
              return (
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
                      <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {skill.category}
                      </span>
                      {skill.certified && (
                        <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                          <Award size={10} style={{ marginRight: '3px' }} />
                          {skill.certName || 'Certified'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Resume Mentions: <strong>{skill.resumeMentions || 1}x</strong> • Verified Repos: <strong>{skill.repoCount || 0} projects</strong>
                    </div>
                  </div>

                  <span 
                    className={`badge ${
                      state === 'VERIFIED' ? 'badge-success' :
                      state === 'PARTIAL' ? 'badge-primary' :
                      state === 'SELF_REPORTED' ? 'badge-warning' : 'badge-danger'
                    }`} 
                    style={{ fontSize: '0.6875rem', fontWeight: 600 }}
                  >
                    {state}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Raw Resume Text Viewer / Editor */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={16} style={{ color: 'var(--text-secondary)' }} />
              Raw Resume Source Text
            </h3>
            {isEditing && (
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                Save & Re-Index
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              className="text-input"
              style={{ minHeight: '380px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.5 }}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          ) : (
            <pre 
              style={{ 
                background: 'var(--bg-secondary)', 
                padding: '16px', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.8125rem', 
                lineHeight: 1.6, 
                color: 'var(--text-secondary)',
                maxHeight: '420px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {resumeText}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
}
