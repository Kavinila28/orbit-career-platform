import React, { useState } from 'react';
import { FileText, Briefcase } from 'lucide-react';
import GithubIcon from '../GithubIcon';
import ResumeParserView from './ResumeParserView';
import GitHubAnalyzerView from './GitHubAnalyzerView';
import JobDescriptionView from './JobDescriptionView';

export default function EvidenceHub({ 
  candidate, 
  job, 
  onSelectJob, 
  onCustomJobCreate, 
  onUpdateResume,
  onLiveGitHubAnalyzed,
  onLiveGitHubRequestStart,
  onLiveGitHubFailure,
  onLiveResumeExtracted,
  apiMode = 'DEMO'
}) {
  const [subTab, setSubTab] = useState('github'); // 'github' | 'resume' | 'job'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Sub-tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'var(--bg-card)', 
        padding: '6px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-light)',
        width: 'fit-content'
      }}>
        <button
          className={`btn btn-sm ${subTab === 'github' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('github')}
        >
          <GithubIcon size={14} />
          GitHub Repositories ({candidate.githubRepos.length})
        </button>

        <button
          className={`btn btn-sm ${subTab === 'resume' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('resume')}
        >
          <FileText size={14} />
          Parsed Resume ({candidate.extractedSkills.length} Skills)
        </button>

        <button
          className={`btn btn-sm ${subTab === 'job' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('job')}
        >
          <Briefcase size={14} />
          Target Job Description ({job.title.split(' ')[0]})
        </button>
      </div>

      {/* Sub-tab View */}
      {subTab === 'github' && (
        <GitHubAnalyzerView 
          candidate={candidate} 
          onLiveGitHubAnalyzed={onLiveGitHubAnalyzed}
          onLiveGitHubRequestStart={onLiveGitHubRequestStart}
          onLiveGitHubFailure={onLiveGitHubFailure}
          apiMode={apiMode}
        />
      )}
      {subTab === 'resume' && (
        <ResumeParserView 
          candidate={candidate} 
          onUpdateResume={onUpdateResume} 
          onLiveResumeExtracted={onLiveResumeExtracted}
          apiMode={apiMode}
        />
      )}
      {subTab === 'job' && (
        <JobDescriptionView 
          job={job} 
          onSelectJob={onSelectJob} 
          onCustomJobCreate={onCustomJobCreate} 
          apiMode={apiMode}
        />
      )}

    </div>
  );
}
