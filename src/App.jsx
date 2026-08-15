import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  FileSearch, 
  Sparkles, 
  Terminal, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { SAMPLE_CANDIDATES } from './data/sampleCandidates';
import { SAMPLE_JOBS } from './data/sampleJobs';
import { calculateReadinessScore } from './utils/scoringEngine';
import { analyzeSkillGaps } from './utils/gapAnalyzer';
import { generateCareerDossierHtml } from './utils/exportDossier';
import { getApiMode, setApiMode } from './services/api';

import Navbar from './components/Navbar';
import CandidateSummaryCard from './components/CandidateSummaryCard';
import ReadinessScoreCard from './components/ReadinessEngine/ReadinessScoreCard';
import SkillGapMatrix from './components/ReadinessEngine/SkillGapMatrix';
import EvidenceDetailModal from './components/ReadinessEngine/EvidenceDetailModal';
import EvidenceHub from './components/EvidenceIngestion/EvidenceHub';
import RoadmapView from './components/RoadmapGenerator/RoadmapView';
import InterviewStudio from './components/MockInterviewer/InterviewStudio';
import WhatIfSimulator from './components/Simulator/WhatIfSimulator';

export default function App() {
  const [selectedDemoCandidate, setSelectedDemoCandidate] = useState(SAMPLE_CANDIDATES[0]);
  const [liveCandidate, setLiveCandidate] = useState({
    id: 'live-candidate',
    name: 'Live Evaluated Candidate',
    title: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Remote',
    education: 'B.S. in Computer Science',
    githubUsername: '',
    githubRepos: [],
    extractedSkills: [],
    stats: {
      totalRepos: 0,
      commitCountYear: 0,
      topLanguage: 'None'
    },
    resumeText: ''
  });

  const [job, setJob] = useState(SAMPLE_JOBS[0]);
  const [activeTab, setActiveTab] = useState('readiness'); // 'readiness' | 'evidence' | 'roadmap' | 'interview' | 'simulator'
  const [theme, setTheme] = useState('dark');
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [selectedSkillGap, setSelectedSkillGap] = useState(null);
  const [apiMode, setApiModeState] = useState(getApiMode());
  const [apiErrorMessage, setApiErrorMessage] = useState(null);

  // Active candidate depends on API Mode
  const candidate = apiMode === 'LIVE' ? liveCandidate : selectedDemoCandidate;

  // Sync theme with HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleApiMode = (newMode) => {
    setApiMode(newMode);
    setApiModeState(newMode);
    setApiErrorMessage(null);

    if (newMode === 'LIVE') {
      // Clear any demo candidate repositories and start fresh for LIVE mode
      setLiveCandidate(prev => ({
        ...prev,
        githubUsername: prev.githubUsername || '',
        githubRepos: prev.githubRepos || [],
        stats: prev.stats || { totalRepos: 0, commitCountYear: 0, topLanguage: 'None' }
      }));
    }
  };

  // Dynamic calculations
  const readiness = calculateReadinessScore(candidate, job, completedMilestones);
  const gaps = analyzeSkillGaps(candidate, job, completedMilestones);

  // Milestone toggling
  const handleToggleMilestone = (milestoneId) => {
    setCompletedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId) 
        : [...prev, milestoneId]
    );
  };

  const handleResetMilestones = () => {
    setCompletedMilestones([]);
  };

  // Export Dossier
  const handleExportDossier = () => {
    const htmlContent = generateCareerDossierHtml(candidate, job, readiness, gaps);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ORBIT_Readiness_Dossier_${candidate.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCustomJobCreate = (newJob) => {
    setJob(newJob);
  };

  const handleUpdateResume = (newResumeText) => {
    if (apiMode === 'LIVE') {
      setLiveCandidate(prev => ({ ...prev, resumeText: newResumeText }));
    } else {
      setSelectedDemoCandidate(prev => ({ ...prev, resumeText: newResumeText }));
    }
  };

  const handleLiveResumeExtracted = (extractedData) => {
    setLiveCandidate(prev => ({
      ...prev,
      id: extractedData.id || prev.id,
      name: extractedData.name || prev.name,
      email: extractedData.email || prev.email,
      githubUsername: extractedData.github_username || prev.githubUsername,
      extractedSkills: extractedData.extracted_skills || prev.extractedSkills,
      education: extractedData.education_timeline?.[0]?.degree || prev.education,
      resumeText: extractedData.raw_text || prev.resumeText
    }));
  };

  const handleLiveGitHubRequestStart = () => {
    // Clear any stale repositories when a new live request begins
    setLiveCandidate(prev => ({
      ...prev,
      githubRepos: [],
      stats: {
        totalRepos: 0,
        commitCountYear: 0,
        topLanguage: 'None'
      }
    }));
  };

  const handleLiveGitHubFailure = () => {
    // Explicitly guarantee no stale or demo repos remain on failure
    setLiveCandidate(prev => ({
      ...prev,
      githubRepos: [],
      stats: {
        totalRepos: 0,
        commitCountYear: 0,
        topLanguage: 'None'
      }
    }));
  };

  const handleLiveGitHubAnalyzed = (liveAnalysis) => {
    // Map API repositories to candidate repos
    const mappedRepos = (liveAnalysis.repositories || []).map((r, idx) => ({
      id: `live-repo-${idx}`,
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stars,
      forks: r.forks,
      commits: r.commits_last_year,
      hasTests: r.has_tests,
      testCoverage: r.test_coverage,
      hasDocker: r.has_docker,
      hasCI: r.has_ci,
      hasModularStructure: r.has_modular_structure,
      hasDbIntegration: r.has_db_integration,
      hasEnvConfig: r.has_env_config,
      complexityScore: r.complexity_score,
      techStack: r.tech_stack,
      insights: r.insights,
      html_url: r.html_url
    }));

    setLiveCandidate(prev => ({
      ...prev,
      githubUsername: liveAnalysis.username,
      avatar: liveAnalysis.avatar_url || prev.avatar,
      githubRepos: mappedRepos,
      stats: {
        totalRepos: liveAnalysis.public_repos_count,
        commitCountYear: liveAnalysis.total_commits_year,
        topLanguage: liveAnalysis.top_languages?.[0] || 'Python'
      }
    }));
  };

  const handleOpenRoadmapForSkill = () => {
    setActiveTab('roadmap');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation with DEMO/LIVE Mode Toggle */}
      <Navbar
        selectedCandidate={candidate}
        onSelectCandidate={(cand) => {
          if (apiMode === 'DEMO') {
            setSelectedDemoCandidate(cand);
          }
          setCompletedMilestones([]);
        }}
        selectedJob={job}
        onSelectJob={(j) => {
          setJob(j);
          setCompletedMilestones([]);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportDossier={handleExportDossier}
        readinessScore={readiness.overallScore}
        apiMode={apiMode}
        onToggleApiMode={handleToggleApiMode}
      />

      <main className="app-container">

        {apiErrorMessage && (
          <div 
            className="badge badge-danger" 
            style={{ 
              marginBottom: '16px',
              padding: '12px 18px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '8px', 
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger, #ef4444)',
              color: 'var(--color-danger, #ef4444)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span><strong>Backend Communication Error:</strong> {apiErrorMessage}</span>
            </div>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setApiErrorMessage(null)}
              style={{ color: 'inherit' }}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Active Candidate & Target Job Summary Header */}
        <CandidateSummaryCard
          candidate={candidate}
          job={job}
          readiness={readiness}
          apiMode={apiMode}
          onOpenTab={(tabKey) => {
            if (tabKey === 'gap-matrix') setActiveTab('readiness');
            if (tabKey === 'roadmap') setActiveTab('roadmap');
          }}
        />

        {/* Global Tabs Navigation */}
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'readiness' ? 'active' : ''}`}
            onClick={() => setActiveTab('readiness')}
          >
            <Layers size={16} />
            Career Readiness & Skill Gap Matrix
            <span className="tab-badge">{readiness.overallScore}/100</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            <FileSearch size={16} />
            Evidence Ingestion & Repository Audit
            <span className="tab-badge">{candidate.githubRepos.length} Repos</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <Sparkles size={16} />
            Actionable AI Roadmaps & Blueprints
            <span className="tab-badge">+28 Pts</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            <Terminal size={16} />
            Project-Grounded AI Mock Interviewer
          </button>

          <button
            className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <TrendingUp size={16} />
            "What-If" Career Simulator
            {completedMilestones.length > 0 && (
              <span className="tab-badge" style={{ background: 'var(--success-solid)' }}>
                +{readiness.milestoneBonus} Pts
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Career Readiness & Skill Gap Matrix */}
        {activeTab === 'readiness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ReadinessScoreCard
              readiness={readiness}
              candidate={candidate}
              job={job}
            />

            <SkillGapMatrix
              gaps={gaps}
              onSelectSkillGap={(g) => setSelectedSkillGap(g)}
              onOpenRoadmap={handleOpenRoadmapForSkill}
            />
          </div>
        )}

        {/* Tab 2: Evidence Ingestion & Repository Audit */}
        {activeTab === 'evidence' && (
          <EvidenceHub
            candidate={candidate}
            job={job}
            onSelectJob={(j) => setJob(j)}
            onCustomJobCreate={handleCustomJobCreate}
            onUpdateResume={handleUpdateResume}
            onLiveResumeExtracted={handleLiveResumeExtracted}
            onLiveGitHubAnalyzed={handleLiveGitHubAnalyzed}
            onLiveGitHubRequestStart={handleLiveGitHubRequestStart}
            onLiveGitHubFailure={handleLiveGitHubFailure}
            apiMode={apiMode}
          />
        )}

        {/* Tab 3: Actionable AI Roadmaps & Blueprints */}
        {activeTab === 'roadmap' && (
          <RoadmapView
            candidate={candidate}
            job={job}
            gaps={gaps}
            onSimulateMilestone={handleToggleMilestone}
            completedMilestones={completedMilestones}
          />
        )}

        {/* Tab 4: Project-Grounded AI Mock Interviewer */}
        {activeTab === 'interview' && (
          <InterviewStudio
            candidate={candidate}
            job={job}
          />
        )}

        {/* Tab 5: "What-If" Career Simulator */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator
            candidate={candidate}
            job={job}
            readiness={readiness}
            completedMilestones={completedMilestones}
            onToggleMilestone={handleToggleMilestone}
            onResetMilestones={handleResetMilestones}
            onExportDossier={handleExportDossier}
          />
        )}

      </main>

      {/* Detail Modal for Selected Skill Gap */}
      {selectedSkillGap && (
        <EvidenceDetailModal
          skillGap={selectedSkillGap}
          candidate={candidate}
          onClose={() => setSelectedSkillGap(null)}
          onBridgeGap={handleOpenRoadmapForSkill}
        />
      )}

      {/* Footer */}
      <footer style={{ 
        marginTop: 'auto', 
        borderTop: '1px solid var(--border-light)', 
        padding: '24px 20px', 
        textAlign: 'center', 
        fontSize: '0.8125rem', 
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <strong>ORBIT</strong> — AI Career Intelligence & Evidence-Based Readiness Platform
        </div>
        <p>Connecting candidate proof to engineering job requirements • Built for students & early-career developers</p>
      </footer>

    </div>
  );
}
