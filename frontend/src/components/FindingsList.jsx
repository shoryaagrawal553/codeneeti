import React from 'react';
import { AlertCircle, CheckCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { SEVERITY_LEVELS, VERIFICATION_STATUS } from '../types';

export default function FindingsList({
  findings = [],
  selectedFindingId,
  onSelectFinding,
  summary,
}) {
  if (!findings || findings.length === 0) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <ShieldCheck size={40} style={{ color: 'var(--status-resolved)', marginBottom: '0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>No Issues Detected</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '360px' }}>
          Static analysis and agent verification found no bugs or security vulnerabilities in this snippet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Summary Header */}
      {summary && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Total Findings: {summary.total_findings}
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ color: 'var(--status-resolved)', fontWeight: 500 }}>
              {summary.resolved} Resolved
            </span>
            {summary.unresolved > 0 && (
              <span style={{ color: 'var(--severity-critical)', fontWeight: 500 }}>
                {summary.unresolved} Unresolved
              </span>
            )}
            {summary.regressions > 0 && (
              <span style={{ color: 'var(--severity-high)', fontWeight: 500 }}>
                {summary.regressions} Regressions
              </span>
            )}
          </div>
        </div>
      )}

      {/* Findings Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {findings.map((finding) => {
          const isSelected = finding.id === selectedFindingId;
          const severityInfo = SEVERITY_LEVELS[finding.severity] || SEVERITY_LEVELS.Info;
          const verificationInfo = VERIFICATION_STATUS[finding.verification_status] || VERIFICATION_STATUS.Unavailable;
          const lineText = finding.line_start === finding.line_end
            ? `Line ${finding.line_start}`
            : `Lines ${finding.line_start}–${finding.line_end}`;

          return (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
              }}
              className="card-interactive"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                <span
                  className="badge"
                  style={{
                    color: severityInfo.color,
                    backgroundColor: severityInfo.bg,
                    borderColor: severityInfo.border,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <AlertCircle size={11} />
                  {finding.severity}
                </span>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {finding.title}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.25rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                      {lineText}
                    </span>
                    <span>&bull;</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{finding.rule_id}</span>
                    {finding.cwe && (
                      <>
                        <span>&bull;</span>
                        <span style={{ color: 'var(--text-muted)' }}>{finding.cwe}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                <span
                  className="badge"
                  style={{
                    color: verificationInfo.color,
                    backgroundColor: verificationInfo.bg,
                    fontSize: '0.7rem',
                  }}
                >
                  <CheckCircle size={10} />
                  {finding.verification_status}
                </span>
                <ChevronRight size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
