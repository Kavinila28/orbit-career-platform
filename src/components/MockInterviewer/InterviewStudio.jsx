import React, { useState, useEffect } from 'react';
import { Terminal, Send, Sparkles, HelpCircle, Code2, BookOpen, RefreshCw } from 'lucide-react';
import { SAMPLE_INTERVIEW_QUESTIONS } from '../../data/interviewQuestions';

export default function InterviewStudio({ candidate, job }) {
  // Find questions grounded in candidate's repositories
  const relevantQuestions = SAMPLE_INTERVIEW_QUESTIONS.filter(q => 
    q.candidateId === candidate.id || q.jobId === job.id
  );

  const activeQuestionsList = relevantQuestions.length > 0 ? relevantQuestions : SAMPLE_INTERVIEW_QUESTIONS;

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Synchronize state when candidate or job changes
  useEffect(() => {
    setActiveQuestionIdx(0);
    setUserAnswer('');
    setShowHints(false);
    setShowModelAnswer(false);
    setEvaluation(null);
  }, [candidate.id, job.id]);

  const activeQuestion = activeQuestionsList[activeQuestionIdx] || activeQuestionsList[0];

  const handleSelectQuestion = (idx) => {
    setActiveQuestionIdx(idx);
    setUserAnswer('');
    setShowHints(false);
    setShowModelAnswer(false);
    setEvaluation(null);
  };

  const handleEvaluateAnswer = () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setTimeout(() => {
      // Intelligent heuristic evaluation simulation
      const textLower = userAnswer.toLowerCase();
      const mentionsOnnx = textLower.includes('onnx') || textLower.includes('quantization') || textLower.includes('fastapi') || textLower.includes('rust');
      const mentionsBatch = textLower.includes('batch') || textLower.includes('queue') || textLower.includes('redis') || textLower.includes('stream');
      const mentionsAsync = textLower.includes('async') || textLower.includes('worker') || textLower.includes('latency') || textLower.includes('concurrency');

      let techScore = 65;
      let sysScore = 60;
      let proofScore = 70;

      if (mentionsOnnx) techScore += 15;
      if (mentionsBatch) sysScore += 20;
      if (mentionsAsync) proofScore += 15;

      const overallRating = Math.round((techScore + sysScore + proofScore) / 3);

      setEvaluation({
        overallRating,
        techScore: Math.min(95, techScore),
        sysScore: Math.min(95, sysScore),
        proofScore: Math.min(95, proofScore),
        strengths: [
          "Demonstrates strong familiarity with asynchronous request flows and API contracts.",
          "Directly addresses the throughput requirements of high-concurrency microservices."
        ],
        improvements: [
          "Could elaborate more on model quantization (e.g. FP16 vs INT8) to optimize memory bandwidth on GPU/CPU.",
          "Consider discussing fallback mechanisms (circuit breakers) when inference queues exceed maximum threshold."
        ],
        verdict: overallRating >= 80 ? "Pass — Strong Engineering Rationale" : "Borderline — Needs Greater Systems & Low-Latency Depth"
      });
      setIsEvaluating(false);
    }, 900);
  };

  const handleLoadSampleDraft = () => {
    setUserAnswer(`In my repository, I used PyTorch eager execution. For production serving under 50ms at 500 req/s, I would:
1. Export the fine-tuned RoBERTa model to ONNX with FP16 precision to eliminate Python interpreter overhead.
2. Build an async FastAPI gateway that validates inputs with Pydantic and pushes inference payloads into a Redis batch queue.
3. Use dynamic batching (5ms window) so that multiple concurrent requests are processed in a single tensor pass.
4. Set up Hugging Face FastTokenizers with strict max sequence length (128 tokens) to avoid quadratic attention scaling.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
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
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            color: '#fff', 
            width: '42px', 
            height: '42px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Terminal size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800 }}>
              AI Technical Project-Based Mock Interview Studio
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Questions dynamically generated from candidate's <strong>actual GitHub repositories</strong> and connected to target job requirements.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-primary">
            <Sparkles size={12} style={{ marginRight: '4px' }} />
            Project Grounded
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid-2">
        
        {/* Left Column: Question & Context */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Question Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {activeQuestionsList.map((q, idx) => (
              <button
                key={q.id}
                className={`btn btn-sm ${activeQuestionIdx === idx ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSelectQuestion(idx)}
              >
                Q{idx + 1}: {q.topic.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active Question Box */}
          {activeQuestion && (
            <div style={{ 
              background: 'var(--bg-tertiary)', 
              padding: '16px 18px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-primary">{activeQuestion.topic}</span>
                <span className="badge badge-neutral">{activeQuestion.difficulty}</span>
              </div>

              <div style={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {activeQuestion.question}
              </div>

              {/* Context Note */}
              <div style={{ 
                marginTop: '12px', 
                paddingTop: '10px', 
                borderTop: '1px solid var(--border-light)', 
                fontSize: '0.75rem', 
                color: 'var(--brand-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Code2 size={13} />
                {activeQuestion.contextNote}
              </div>
            </div>
          )}

          {/* Action buttons: Hints & Model Answer */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowHints(!showHints)}
            >
              <HelpCircle size={14} />
              {showHints ? 'Hide Hints' : 'Show Hints & Key Concepts'}
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
            >
              <BookOpen size={14} />
              {showModelAnswer ? 'Hide Ideal Model Answer' : 'View Ideal Engineering Answer'}
            </button>

            <button 
              className="btn btn-outline btn-sm"
              onClick={handleLoadSampleDraft}
              title="Populate with a high-quality sample response"
            >
              Fill Sample Response
            </button>
          </div>

          {/* Hints View */}
          {showHints && activeQuestion && (
            <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--warning-text)', marginBottom: '6px' }}>
                Architectural Hints & Signals:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.8125rem', color: 'var(--warning-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeQuestion.hints?.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Answer View */}
          {showModelAnswer && activeQuestion && (
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Ideal Model Response:
              </div>
              <div className="code-block" style={{ fontSize: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {activeQuestion.sampleModelAnswer}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Answer Workspace & AI Evaluation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Code2 size={16} style={{ color: 'var(--brand-primary)' }} />
              Candidate Technical Response
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Markdown & Code supported
            </span>
          </div>

          <textarea
            className="form-textarea"
            rows={10}
            placeholder="Type your technical explanation, architectural trade-offs, and code snippets here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.6 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {userAnswer.length} characters
            </span>

            <button 
              className="btn btn-primary"
              onClick={handleEvaluateAnswer}
              disabled={isEvaluating || !userAnswer.trim()}
            >
              {isEvaluating ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  Analyzing Code & Depth...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit & Evaluate Answer
                </>
              )}
            </button>
          </div>

          {/* AI Rubric Evaluation Result */}
          {evaluation && (
            <div style={{ 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                  AI Interview Evaluation Report
                </div>
                <span className={`badge ${evaluation.overallRating >= 80 ? 'badge-success' : 'badge-warning'}`}>
                  Score: {evaluation.overallRating}/100 • {evaluation.verdict}
                </span>
              </div>

              {/* Rubric Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Technical Depth</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary)' }}>{evaluation.techScore}%</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>System Design</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary)' }}>{evaluation.sysScore}%</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Proof Connection</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary)' }}>{evaluation.proofScore}%</div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div style={{ fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--success-solid)', marginBottom: '4px' }}>Key Strengths:</div>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                  {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>

                <div style={{ fontWeight: 700, color: 'var(--warning-solid)', marginTop: '8px', marginBottom: '4px' }}>Areas to Deepen:</div>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                  {evaluation.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
