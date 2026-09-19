import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle, MapPin } from 'lucide-react';
import { SEVERITY_LEVELS, VERIFICATION_STATUS } from '../types';

export default function FindingDetail({ finding }) {
  if (!finding) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <ShieldAlert size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
        <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>No Finding Selected</h4>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Select a finding from the list to view detailed explanation and code context.
        </p>
      </div>
    );
  }

  const severityInfo = SEVERITY_LEVELS[finding.severity] || SEVERITY_LEVELS.Info;
  const verificationInfo = VERIFICATION_STATUS[finding.verification_status] || VERIFICATION_STATUS.Unavailable;
  const lineDisplay = finding.line_start === finding.line_end
    ? `Line ${finding.line_start}`
    : `Lines ${finding.line_start}–${finding.line_end}`;

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                color: severityInfo.color,
                backgroundColor: severityInfo.bg,
                borderColor: severityInfo.border,
              }}
            >
              <AlertCircle size={12} />
              {finding.severity}
            </span>

            <span
              className="badge"
              style={{
                color: verificationInfo.color,
                backgroundColor: verificationInfo.bg,
              }}
            >
              <CheckCircle size={12} />
              {finding.verification_status}
            </span>

            {finding.cwe && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                {finding.cwe}
              </span>
            )}
          </div>

          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {finding.title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
          <MapPin size={14} />
          <span>{lineDisplay}</span>
        </div>
      </div>

      {/* Meta Attributes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-canvas)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CATEGORY</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{finding.category}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>STATIC RULE</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{finding.rule_id}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CONFIDENCE</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{finding.confidence}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VERIFICATION</span>
          <span style={{ fontWeight: 600, color: verificationInfo.color }}>{finding.verification_status}</span>
        </div>
      </div>

      {/* Structured Analysis Explanation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
          Plain-Language Explanation
        </h4>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${severityInfo.color}`,
            fontSize: '0.925rem',
            lineHeight: 1.65,
            color: 'var(--text-primary)',
          }}
        >
          {finding.explanation}
        </div>
      </div>
    </div>
  );
}
