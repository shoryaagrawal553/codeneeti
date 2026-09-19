import React from 'react';

export default function Header({ onReset, onGoToLanding }) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        borderTop: '1px solid var(--border-top-highlight)',
        backgroundColor: 'var(--bg-surface-glass)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 0',
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand */}
        <div
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              borderTop: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            CG
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>
                CodeGuard
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
              AI Code Review &amp; Security Assistant
            </p>
          </div>
        </div>

        {/* Navigation & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {onGoToLanding && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onGoToLanding}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
              title="Return to pixel-art meadow landing page"
            >
              <span>🌿</span>
              <span>Meadow</span>
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: 'var(--status-resolved)',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-resolved)',
                boxShadow: '0 0 6px var(--status-resolved)',
              }}
            ></span>
            Interactive Review Ready
          </div>
        </div>
      </div>
    </header>
  );
}
