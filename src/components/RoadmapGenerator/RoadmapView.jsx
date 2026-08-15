import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Code2, Layers, Award, Cpu } from 'lucide-react';
import { PROJECT_BLUEPRINTS } from '../../data/projectBlueprints';
import ProjectBlueprintModal from './ProjectBlueprintModal';

export default function RoadmapView({ candidate, job, gaps, onSimulateMilestone, completedMilestones }) {
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [activeRoadmapTab, setActiveRoadmapTab] = useState('projects'); // 'projects' | 'repo-fixes' | 'dsa' | 'certs'

  // Filter blueprints relevant to candidate's missing skills
  const relevantBlueprints = PROJECT_BLUEPRINTS.filter(bp => 
    bp.targetSkills.some(skill => 
      gaps.some(g => g.skill.toLowerCase() === skill.toLowerCase() && g.gapLevel !== 'Low')
    )
  );

  const blueprintsToShow = relevantBlueprints.length > 0 ? relevantBlueprints : PROJECT_BLUEPRINTS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--brand-light) 100%)', 
        border: '1px solid var(--border-medium)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">Personalized AI Action Plan</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Targeting {job.title} at {job.company}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
            Evidence-Driven Gap Closing Roadmap
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px' }}>
            Instead of generic resume tips, ORBIT generated a step-by-step technical plan to eliminate your exact hiring blockers through verifiable GitHub projects and code enhancements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              +28 Points
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Potential Score Jump
            </div>
          </div>
        </div>
      </div>

      {/* Sub-nav Tabs */}
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
          className={`btn btn-sm ${activeRoadmapTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveRoadmapTab('projects')}
        >
          <Code2 size={14} />
          High-Impact Projects to Build ({blueprintsToShow.length})
        </button>

        <button
          className={`btn btn-sm ${activeRoadmapTab === 'repo-fixes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveRoadmapTab('repo-fixes')}
        >
          <Sparkles size={14} />
          Existing GitHub Repo Upgrades
        </button>

        <button
          className={`btn btn-sm ${activeRoadmapTab === 'dsa' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveRoadmapTab('dsa')}
        >
          <Layers size={14} />
          Targeted DSA & System Design
        </button>

        <button
          className={`btn btn-sm ${activeRoadmapTab === 'certs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveRoadmapTab('certs')}
        >
          <Award size={14} />
          Certifications & ROI Analysis
        </button>
      </div>

      {/* Tab 1: High Impact Projects */}
      {activeRoadmapTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {blueprintsToShow.map((bp) => {
            const isCompleted = completedMilestones.includes(bp.id);
            return (
              <div 
                key={bp.id}
                className="card"
                style={{
                  border: isCompleted ? '2px solid var(--success-solid)' : '1px solid var(--border-light)',
                  background: isCompleted ? 'var(--success-bg)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{bp.title}</h3>
                      <span className="badge badge-primary">{bp.impactOnReadiness}</span>
                      {isCompleted && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                          Completed in Simulator
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '750px', lineHeight: 1.5 }}>
                      {bp.summary}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Bridges Gaps In:
                      </span>
                      {bp.targetSkills.map(s => (
                        <span key={s} className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {s}
                        </span>
                      ))}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        • Est. Time: <strong>{bp.estimatedTimeToBuild}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'center' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedBlueprint(bp)}
                    >
                      Open Full Engineering Spec
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Existing GitHub Repo Upgrades */}
      {activeRoadmapTab === 'repo-fixes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
              Hygiene Remediation for Candidate Repositories
            </h3>
            <span className="badge badge-neutral">Quick Wins (+14 Score Points)</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Upgrading your existing repositories from student projects to production-grade engineering codebases drastically improves hiring confidence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidate.githubRepos.map(repo => (
              <div 
                key={repo.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {repo.name}
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                    Language: {repo.language}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {!repo.hasTests && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>
                        • Missing Unit Tests: Add PyTest / Jest suite with 80%+ coverage
                      </span>
                      <span className="badge badge-danger">+4 Points</span>
                    </div>
                  )}

                  {!repo.hasDocker && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>
                        • Missing Containerization: Add multi-stage Dockerfile and docker-compose.yml
                      </span>
                      <span className="badge badge-danger">+5 Points</span>
                    </div>
                  )}

                  {!repo.hasCI && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>
                        • Missing CI/CD: Add `.github/workflows/ci.yml` for automated linting & test validation
                      </span>
                      <span className="badge badge-danger">+5 Points</span>
                    </div>
                  )}

                  {repo.hasTests && repo.hasDocker && repo.hasCI && (
                    <div style={{ color: 'var(--success-solid)', fontWeight: 600, fontSize: '0.8125rem' }}>
                      ✓ High engineering hygiene verified across testing, Docker, and CI/CD!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Targeted DSA & System Design */}
      {activeRoadmapTab === 'dsa' && (
        <div className="grid-2">
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Layers size={16} style={{ color: 'var(--brand-primary)' }} />
                DSA Topics for {job.company.split(' ')[0]} Benchmark
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>1. Graphs: BFS/DFS, Dijkstra, Topological Sort</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Frequently asked for dependency graphs, ML pipeline orchestration, and network routing.
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>2. Sliding Window & Two Pointers (String/Array)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Essential for string tokenization algorithms and streaming data analytics.
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>3. Dynamic Programming & Memoization</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Targeted for edit distance, sequence alignment, and knapsack optimization problems.
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Cpu size={16} style={{ color: 'var(--brand-primary)' }} />
                System Design Focus Areas
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>1. Asynchronous Task Queues & Workers</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Decoupling slow compute tasks from HTTP API gateways using Redis / RabbitMQ / SQS.
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>2. Database Sharding, Indexing & Read-Replicas</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Optimizing high-read throughput with PostgreSQL B-Tree and GIN indexes.
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>3. Multi-Layer Caching (In-Memory + CDN)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Cache invalidation patterns (write-through, cache-aside) with Redis.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Certifications & ROI */}
      {activeRoadmapTab === 'certs' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={16} style={{ color: 'var(--brand-primary)' }} />
              Certification Value vs Project Proof ROI Matrix
            </h3>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            ORBIT analyzes which certifications provide genuine hiring signal versus where building verified GitHub repositories delivers 4x higher ROI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AWS Solutions Architect Associate (SAA-C03)</div>
                <span className="badge badge-success">High ROI for Cloud/DevOps</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Recommendation:</strong> Highly respected baseline. Pair this with a live Terraform AWS repository for maximum hiring signal.
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Generic Python / JavaScript Online Certificates</div>
                <span className="badge badge-warning">Low ROI — Skip & Build Code Proof</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Recommendation:</strong> Hiring teams place minimal value on beginner course completion certificates. Building 1 production FastAPI repository carries 5x the hiring weight.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedBlueprint && (
        <ProjectBlueprintModal
          blueprint={selectedBlueprint}
          isCompleted={completedMilestones.includes(selectedBlueprint.id)}
          onClose={() => setSelectedBlueprint(null)}
          onSimulateComplete={(id) => onSimulateMilestone(id)}
        />
      )}

    </div>
  );
}
