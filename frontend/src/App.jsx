import React from 'react';

export default function App() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '1rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                fontWeight: '700',
                color: '#ffffff',
                fontSize: '1.1rem',
              }}
            >
              CG
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
                CodeGuard
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AI Code Review &amp; Security Assistant
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-resolved animate-pulse-glow">
              Foundation Ready
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              FE-001
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Hero Welcome Card */}
          <div className="card-glass card-interactive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ backgroundColor: 'var(--primary-surface)', color: 'var(--primary)', borderColor: 'var(--border-accent)' }}>
                  Phase 1
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Architecture Milestone
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', margin: 0 }}>
                Frontend Foundation &amp; Design System
              </h1>
              <p style={{ fontSize: '1rem', maxWidth: '780px', lineHeight: 1.6 }}>
                CodeGuard provides deterministic vulnerability detection via Semgrep and Bandit,
                coupled with a 3-agent Gemini pipeline for contextual explanation, automated remediation,
                and empirical regression verification.
              </p>
            </div>
          </div>

          {/* Design System Verification & Token Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Severity Tokens Card */}
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                Severity Design Tokens
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Standardized indicators conforming to API Contract enum definitions.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-critical">Critical</span>
                <span className="badge badge-high">High</span>
                <span className="badge badge-medium">Medium</span>
                <span className="badge badge-low">Low</span>
                <span className="badge badge-info">Info</span>
                <span className="badge badge-resolved">Resolved</span>
              </div>
            </div>

            {/* Pipeline Architecture Card */}
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}></span>
                Three-Agent Workflow
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Sequential orchestration stages defined in PRD &amp; DEC-007.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 80px', padding: '0.6rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>01</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Analyzer</div>
                </div>
                <div style={{ flex: '1 1 80px', padding: '0.6rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>02</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fix</div>
                </div>
                <div style={{ flex: '1 1 80px', padding: '0.6rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>03</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Verifier</div>
                </div>
              </div>
            </div>

            {/* Mock Infrastructure Card */}
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-resolved)' }}></span>
                Mock Infrastructure
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Offline mock fixture prepared for standalone UI development.
              </p>
              <code style={{ display: 'block', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--secondary)' }}>
                /src/mocks/sampleReviewResult.json
              </code>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.25rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            CodeGuard &bull; CodeNeeti Hackathon 2026
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            API Contract v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
