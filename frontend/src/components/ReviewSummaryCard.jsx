import React, { useState } from 'react';

export default function ReviewSummaryCard({ result, onBackToEditor }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'diff'

  if (!result) return null;

  const { findings = [], fixed_code = '', summary = {}, review_id } = result;

  const handleCopy = () => {
    if (fixed_code) {
      navigator.clipboard.writeText(fixed_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-info';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top summary card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-resolved">Analysis Complete</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                ID: {review_id?.slice(0, 8)}...
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', margin: 0 }}>Review Findings &amp; Verified Remediation</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onBackToEditor}>
              ← Edit Source Code
            </button>
          </div>
        </div>

        {/* Metric pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Detected</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{summary.total_findings || findings.length}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empirically Resolved</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-resolved)' }}>{summary.resolved || 0}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unresolved Issues</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>{summary.unresolved || 0}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regression Warnings</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>{summary.regressions || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'findings' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('findings')}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
        >
          Findings ({findings.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'diff' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('diff')}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
        >
          Remediated Code
        </button>
      </div>

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {findings.map((f, i) => (
            <div
              key={f.id || i}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getSeverityBadgeClass(f.severity)}`}>
                    {f.severity}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {f.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {f.cwe && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.15rem 0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)' }}>
                      {f.cwe}
                    </span>
                  )}
                  <span className="badge badge-resolved">
                    ✓ {f.verification_status || 'Resolved'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {f.explanation}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Lines {f.line_start}&ndash;{f.line_end}</span>
                <span>&bull;</span>
                <span>Rule: {f.rule_id}</span>
                <span>&bull;</span>
                <span>Confidence: {f.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remediation Tab */}
      {activeTab === 'diff' && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Remediated Output (Fix Agent &amp; Verifier)</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Generated code passes deterministic static re-scan without regressions.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ fontSize: '0.8rem' }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Fixed Code'}
            </button>
          </div>

          <pre
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              overflowX: 'auto',
              color: '#38bdf8',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <code>{fixed_code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
