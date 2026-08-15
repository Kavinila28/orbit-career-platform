import React, { useState, useEffect } from 'react';
import { Star, GitCommit, Code2, ShieldCheck, Search, Loader2, AlertCircle, Radio, Wifi, ExternalLink } from 'lucide-react';
import GithubIcon from '../GithubIcon';
import { analyzeGitHubProfile, isLiveMode } from '../../services/api';

export default function GitHubAnalyzerView({ 
  candidate, 
  onLiveGitHubAnalyzed, 
  onLiveGitHubRequestStart,
  onLiveGitHubFailure,
  apiMode = 'DEMO' 
}) {
  const [selectedRepoId, setSelectedRepoId] = useState(candidate.githubRepos[0]?.id || candidate.githubRepos[0]?.name || null);
  const [usernameInput, setUsernameInput] = useState(candidate.githubUsername || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Synchronize when active candidate changes
  useEffect(() => {
    setSelectedRepoId(candidate.githubRepos[0]?.id || candidate.githubRepos[0]?.name || null);
    setUsernameInput(candidate.githubUsername || '');
    setErrorMessage(null);
  }, [candidate.id, candidate.githubUsername, apiMode]);

  const selectedRepo = candidate.githubRepos.find(r => (r.id && r.id === selectedRepoId) || r.name === selectedRepoId) || candidate.githubRepos[0];

  const handleLiveLookup = async (e) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim().replace(/^@/, '');
    if (!cleanUser) return;

    setIsLoading(true);
    setErrorMessage(null);
    if (onLiveGitHubRequestStart) {
      onLiveGitHubRequestStart();
    }

    try {
      const liveData = await analyzeGitHubProfile(cleanUser, candidate.id);
      if (onLiveGitHubAnalyzed) {
        onLiveGitHubAnalyzed(liveData);
      }
      setSelectedRepoId(liveData.repositories?.[0]?.name || null);
    } catch (err) {
      const msg = err.message || 'GitHub API analysis failed. Check username or rate limit.';
      setErrorMessage(msg);
      if (onLiveGitHubFailure) {
        onLiveGitHubFailure();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Lookup Control */}
      <div style={{ 
        background: 'var(--bg-card)', 
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
            background: '#24292e', 
            color: '#fff', 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <GithubIcon size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                {apiMode === 'LIVE' 
                  ? `GitHub Code Intelligence Audit: ${candidate.githubUsername ? '@' + candidate.githubUsername : '(Enter Profile)'}`
                  : `GitHub Code Intelligence Audit: @${candidate.githubUsername}`}
              </span>
              <span 
                className={`badge ${apiMode === 'LIVE' ? 'badge-success' : 'badge-neutral'}`}
                style={{ fontSize: '0.6875rem' }}
              >
                {apiMode === 'LIVE' ? <Wifi size={10} style={{ marginRight: '3px' }} /> : <Radio size={10} style={{ marginRight: '3px' }} />}
                {apiMode === 'LIVE' ? 'LIVE GITHUB API' : 'DEMO FIXTURES'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {apiMode === 'LIVE'
                ? `Discovered ${candidate.githubRepos.length} public repositories • ${candidate.stats?.commitCountYear || 0} commits in last 12 months • Primary: ${candidate.stats?.topLanguage || 'None'}`
                : `Analyzed ${candidate.githubRepos.length} demo repositories • ${candidate.stats?.commitCountYear || 0} commits in last 12 months • Primary Language: ${candidate.stats?.topLanguage || 'Python'}`}
            </div>
          </div>
        </div>

        {/* Live Lookup Form */}
        {apiMode === 'LIVE' && (
          <form onSubmit={handleLiveLookup} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="text-input"
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.8125rem' }}
              placeholder="e.g. octocat, tiangolo"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={isLoading || !usernameInput.trim()}
            >
              {isLoading ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
              {isLoading ? 'Auditing...' : 'Audit Profile'}
            </button>
          </form>
        )}
      </div>

      {/* Explicit API Error Banner */}
      {errorMessage && (
        <div 
          className="badge badge-danger" 
          style={{ 
            padding: '12px 18px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger, #ef4444)',
            color: 'var(--color-danger, #ef4444)',
            fontSize: '0.875rem'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>LIVE GitHub Audit Failure:</strong> {errorMessage}
            <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.9 }}>
              No fallback or demo repository data is displayed to ensure evidence integrity.
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--brand-primary)' }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Querying GitHub REST API for @{usernameInput.trim().replace(/^@/, '')}...
          </div>
          <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
            Fetching public repositories, language distribution, and architecture signatures.
          </p>
        </div>
      )}

      {/* Only render repositories if not loading and no active error */}
      {!isLoading && !errorMessage && (
        <>
          {candidate.githubRepos.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              {apiMode === 'LIVE' ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    No LIVE GitHub Evidence Loaded
                  </div>
                  <p style={{ fontSize: '0.8125rem', margin: 0 }}>
                    Enter a public GitHub username in the input above (e.g. <code>octocat</code>, <code>tiangolo</code>) to audit real code repositories and telemetry.
                  </p>
                </div>
              ) : (
                <div>No repositories found for this demo profile.</div>
              )}
            </div>
          ) : (
            <div className="grid-2">
              
              {/* Left Column: Repository Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Audited Repositories ({candidate.githubRepos.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Stars are display-only (0 pts in score)
                  </span>
                </div>

                {candidate.githubRepos.map(repo => {
                  const repoKey = repo.id || repo.name;
                  const isSelected = repoKey === (selectedRepo?.id || selectedRepo?.name);
                  const coverageVal = repo.testCoverage ?? repo.test_coverage;
                  const coverageDisplay = coverageVal !== null && coverageVal !== undefined ? `${coverageVal}%` : 'UNAVAILABLE';

                  return (
                    <div
                      key={repoKey}
                      onClick={() => setSelectedRepoId(repoKey)}
                      style={{
                        background: isSelected ? 'var(--brand-light)' : 'var(--bg-card)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                              {repo.name}
                            </span>
                            {repo.html_url && (
                              <a 
                                href={repo.html_url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                            {repo.description || 'Public GitHub repository'}
                          </p>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          Score: {repo.complexityScore || repo.complexity_score || 5}/10
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Code2 size={12} /> {repo.language || 'Unknown'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }} title="Display only, 0 pts in scoring">
                          <Star size={12} /> {repo.stars || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <GitCommit size={12} /> {repo.commits || repo.commits_last_year || 0} commits
                        </span>
                      </div>

                      {/* Hygiene flags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <span 
                          className={`badge ${repo.hasTests || repo.has_tests ? (coverageVal !== null ? 'badge-success' : 'badge-primary') : 'badge-danger'}`} 
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {repo.hasTests || repo.has_tests ? `Tests (${coverageDisplay})` : 'No Tests'}
                        </span>
                        <span className={`badge ${repo.hasDocker || repo.has_docker ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6875rem' }}>
                          {repo.hasDocker || repo.has_docker ? 'Docker' : 'No Docker'}
                        </span>
                        <span className={`badge ${repo.hasCI || repo.has_ci ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6875rem' }}>
                          {repo.hasCI || repo.has_ci ? 'CI/CD Active' : 'No CI/CD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected Repo Deep Dive & Architectural Audit */}
              {selectedRepo ? (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card-header" style={{ marginBottom: '8px' }}>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '1.125rem' }}>
                        <Code2 size={18} style={{ color: 'var(--brand-primary)' }} />
                        {selectedRepo.name}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Language: {selectedRepo.language} • Complexity Rating: {selectedRepo.complexityScore || selectedRepo.complexity_score || 5}/10
                      </div>
                    </div>
                    <span className="badge badge-primary">
                      <ShieldCheck size={12} style={{ marginRight: '3px' }} />
                      Code Verified
                    </span>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Detected Tech Stack & Dependencies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(selectedRepo.techStack || selectedRepo.tech_stack || [selectedRepo.language]).map(tech => (
                        <span key={tech} className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Signals */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Verifiable Engineering Structure Signals
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                        <span>Modular Architecture Separation</span>
                        <span className={`badge ${selectedRepo.hasModularStructure || selectedRepo.has_modular_structure ? 'badge-success' : 'badge-neutral'}`}>
                          {selectedRepo.hasModularStructure || selectedRepo.has_modular_structure ? 'Verified (+25 pts)' : 'Absent (0 pts)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                        <span>Database / Migration Layer</span>
                        <span className={`badge ${selectedRepo.hasDbIntegration || selectedRepo.has_db_integration ? 'badge-success' : 'badge-neutral'}`}>
                          {selectedRepo.hasDbIntegration || selectedRepo.has_db_integration ? 'Verified (+20 pts)' : 'Absent (0 pts)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                        <span>Configuration / Secret Isolation</span>
                        <span className={`badge ${selectedRepo.hasEnvConfig || selectedRepo.has_env_config ? 'badge-success' : 'badge-neutral'}`}>
                          {selectedRepo.hasEnvConfig || selectedRepo.has_env_config ? 'Verified (+15 pts)' : 'Absent (0 pts)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                        <span>Docker Containerization</span>
                        <span className={`badge ${selectedRepo.hasDocker || selectedRepo.has_docker ? 'badge-success' : 'badge-neutral'}`}>
                          {selectedRepo.hasDocker || selectedRepo.has_docker ? 'Verified (+20 pts)' : 'Absent (0 pts)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Summary */}
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Audit Telemetry Note:</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      Test coverage is marked as <strong>{selectedRepo.testCoverage ? `${selectedRepo.testCoverage}%` : 'UNAVAILABLE'}</strong> because runtime test execution reports are not provided by standard GitHub metadata.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
