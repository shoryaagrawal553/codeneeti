import React from 'react';
import { CheckCircle2, Loader2, Circle, ShieldCheck } from 'lucide-react';

const STAGES = [
  { id: 'static', title: 'Static Analysis', subtitle: 'Deterministic Semgrep + Bandit scan' },
  { id: 'analyzer', title: 'Analyzer Agent', subtitle: 'Gemini contextual risk & explanation' },
  { id: 'fix', title: 'Fix Agent', subtitle: 'Gemini minimal unified remediation' },
  { id: 'verifier', title: 'Verifier Agent', subtitle: 'Empirical re-analysis & regression check' },
];

export default function PipelineProgress({ currentStageIndex = 0 }) {
  return (
    <div
      className="card-glass animate-fade-in"
      style={{
        padding: '1.5rem',
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--shadow-glow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Sequential Agent Pipeline in Progress
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Processing code through deterministic detection and three specialized Gemini agents
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive
                  ? 'var(--primary-surface)'
                  : isDone
                  ? 'var(--bg-surface)'
                  : 'var(--bg-canvas)',
                border: `1px solid ${
                  isActive
                    ? 'var(--primary)'
                    : isDone
                    ? 'var(--status-resolved-border)'
                    : 'var(--border-subtle)'
                }`,
                transition: 'all var(--transition-normal)',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {isDone ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--status-resolved)' }} />
                ) : isActive ? (
                  <Loader2 size={18} className="animate-pulse-glow" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Circle size={18} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--primary)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {stage.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {stage.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
