import React from 'react';

const STAGES = [
  { id: 1, title: 'Static Analysis', tool: 'Semgrep & Bandit', desc: 'Deterministic AST scanning for rule violations' },
  { id: 2, title: 'Analyzer Agent', tool: 'Google Gemini', desc: 'Synthesizing findings and plain-language explanations' },
  { id: 3, title: 'Fix Agent', tool: 'Google Gemini', desc: 'Synthesizing verified minimal code remediation' },
  { id: 4, title: 'Verifier Agent', tool: 'Subprocess Re-run', desc: 'Re-scanning remediated code for regressions' },
];

export default function ProgressOverlay({ currentStage = 1, currentLabel = '' }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 12, 20, 0.82)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          backgroundColor: 'rgba(18, 25, 42, 0.92)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <div
              className="animate-spin"
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
              }}
            />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Analyzing Code</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Executing 3-Agent Gemini &amp; Static Pipeline
            </p>
          </div>
        </div>

        {/* Current status description */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {currentLabel || 'Initializing analysis pipeline...'}
        </div>

        {/* Stage List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {STAGES.map((s) => {
            const isDone = s.id < currentStage;
            const isCurrent = s.id === currentStage;

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  border: isCurrent ? '1px solid var(--border-accent)' : '1px solid transparent',
                  opacity: isDone || isCurrent ? 1 : 0.45,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: isDone
                        ? 'var(--status-resolved-bg)'
                        : isCurrent
                        ? 'var(--primary-surface)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: isDone
                        ? 'var(--status-resolved)'
                        : isCurrent
                        ? 'var(--primary)'
                        : 'var(--text-muted)',
                      border: isDone
                        ? '1px solid var(--status-resolved-border)'
                        : isCurrent
                        ? '1px solid var(--border-accent)'
                        : 'none',
                    }}
                  >
                    {isDone ? '✓' : s.id}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {s.tool}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
