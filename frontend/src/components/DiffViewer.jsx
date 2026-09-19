import React, { useState } from 'react';
import { diffLines } from 'diff';
import { Copy, Check, AlertTriangle, ShieldCheck, FileDiff, Sparkles, ArrowRight, CheckCircle2, XCircle, AlertOctagon, HelpCircle } from 'lucide-react';

/**
 * DiffViewer — Clean BEFORE / AFTER and Unified Comparison with Calm Verification Status
 */
export default function DiffViewer({
  originalCode,
  fixedCode,
  fixAvailable = true,
  verificationAvailable = true,
  warnings = [],
  summary,
  findings = [],
  onSelectFinding,
  onApplyFix,
}) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [diffMode, setDiffMode] = useState('split'); // 'split' | 'unified'

  const handleCopy = async () => {
    if (!fixedCode) return;
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy fixed code:', err);
    }
  };

  const handleApply = () => {
    if (!fixedCode || !onApplyFix) return;
    onApplyFix(fixedCode);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  // Helper to sanitize warnings and remove raw URLs or technical artifacts
  const cleanWarningText = (text) => {
    if (!text || typeof text !== 'string') return '';
    const noUrls = text.replace(/https?:\/\/\S+/g, '').replace(/<\w+\s+of\s+RPC[^>]+>/g, '').trim();
    return noUrls.splitlines ? noUrls.splitlines()[0] : noUrls.split('\n')[0];
  };

  // Degraded state: Fix not available
  if (!fixAvailable || !fixedCode) {
    return (
      <div className="card" style={{ padding: '2rem 1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <AlertTriangle size={36} style={{ color: '#D97706', marginBottom: '0.75rem' }} />
          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1A1626' }}>
            Automated Fix Unavailable
          </h4>
          <p style={{ fontSize: '0.925rem', marginTop: '0.5rem', maxWidth: '580px', marginInline: 'auto', color: '#58516B', lineHeight: 1.55 }}>
            Static analysis completed successfully. Automated AI code repair is temporarily unavailable due to API rate limits.
            Detailed manual remediation guidance for each detected issue is provided below.
          </p>

          {warnings && warnings.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                fontSize: '0.8rem',
                color: '#92400E',
                maxWidth: '620px',
                marginInline: 'auto',
                textAlign: 'left',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>System Status:</strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.4 }}>
                {warnings.map((w, i) => (
                  <li key={i}>{cleanWarningText(w)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Structured Manual Remediation Guidance per Finding */}
        {findings && findings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2F2', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Manual Remediation Guidance ({findings.length} Issue{findings.length > 1 ? 's' : ''})
              </span>
              <span style={{ fontSize: '0.775rem', color: '#7E7694' }}>
                Follow recommended patterns to resolve issues directly in the editor
              </span>
            </div>

            {findings.map((f, idx) => (
              <div
                key={f.id || idx}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#F8F6FC',
                  borderRadius: '12px',
                  border: '1px solid #E8E2F2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: f.severity === 'Critical' ? '#FEF2F2' : f.severity === 'High' ? '#FFF1F2' : '#FFFBEB',
                        color: f.severity === 'Critical' ? '#DC2626' : f.severity === 'High' ? '#E11D48' : '#D97706',
                        border: '1px solid currentColor',
                      }}
                    >
                      {f.severity}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#58516B' }}>
                      Lines {f.line_start}{f.line_end && f.line_end !== f.line_start ? `–${f.line_end}` : ''}
                    </span>
                    {f.cwe && (
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.15rem 0.45rem', backgroundColor: '#EDE8F8', borderRadius: '4px', color: '#5E4F98' }}>
                        {f.cwe}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#8C82A3' }}>
                      {f.rule_id}
                    </span>
                  </div>

                  {onSelectFinding && (
                    <button
                      type="button"
                      onClick={() => onSelectFinding(f)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#5E4F98',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Locate in Editor →
                    </button>
                  )}
                </div>

                <h5 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#1A1626' }}>
                  {f.title}
                </h5>

                <div
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: '#342F42',
                    backgroundColor: '#FFFFFF',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #E8E2F2',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {f.explanation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#7E7694', fontSize: '0.875rem', marginTop: '1rem' }}>
            No static code issues detected in this snippet.
          </div>
        )}
      </div>
    );
  }

  // Compute unified diff parts
  const diffParts = diffLines(originalCode || '', fixedCode || '');

  // Split lines for side-by-side view
  const originalLines = (originalCode || '').split('\n');
  const fixedLines = (fixedCode || '').split('\n');

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
      
      {/* 18. VERIFICATION FLOW STATE BANNER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#F8F6FC',
          border: '1px solid #E8E2F2',
          borderRadius: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', fontWeight: 700, letterSpacing: '0.04em', color: '#58516B' }}>
            EMPIRICAL VERIFICATION PIPELINE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {verificationAvailable ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                }}
              >
                <ShieldCheck size={13} /> Empirical Re-Analysis Verified
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#D97706',
                }}
              >
                <HelpCircle size={13} /> Unverified Suggestion
              </span>
            )}
          </div>
        </div>

        {/* Linear Verification Stages: FINDING → FIX APPLIED → RE-ANALYSIS → VERIFICATION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E8E2F2',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D97706' }}>
            <AlertTriangle size={13} />
            <span>01 Finding Detected</span>
          </div>

          <ArrowRight size={12} style={{ color: '#88809E' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#5E4F98' }}>
            <Sparkles size={13} />
            <span>02 Fix Generated</span>
          </div>

          <ArrowRight size={12} style={{ color: '#88809E' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2C8C7D' }}>
            <ShieldCheck size={13} />
            <span>03 Static Re-Analysis</span>
          </div>

          <ArrowRight size={12} style={{ color: '#88809E' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16A34A', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            <span>04 Verification Complete</span>
          </div>
        </div>

        {/* Backend Verification Truth Stats */}
        {summary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> <strong>{summary.resolved ?? 0}</strong> Resolved
            </span>
            {(summary.unresolved ?? 0) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#DC2626', fontWeight: 600 }}>
                <XCircle size={14} /> <strong>{summary.unresolved}</strong> Unresolved
              </span>
            )}
            {(summary.regressions ?? 0) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontWeight: 600 }}>
                <AlertOctagon size={14} /> <strong>{summary.regressions}</strong> Regressions
              </span>
            )}
          </div>
        )}
      </div>

      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileDiff size={18} style={{ color: '#5E4F98' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1A1626' }}>
            Code Remediation Comparison
          </h3>

          {/* Diff Mode Switcher: Split BEFORE/AFTER vs Unified */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F3EEF9',
              borderRadius: '9999px',
              padding: '2px',
              border: '1px solid #E2D9EE',
            }}
          >
            <button
              type="button"
              onClick={() => setDiffMode('split')}
              style={{
                background: diffMode === 'split' ? '#FFFFFF' : 'transparent',
                color: diffMode === 'split' ? '#1A1626' : '#6B6382',
                border: 'none',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: diffMode === 'split' ? 700 : 500,
                boxShadow: diffMode === 'split' ? '0 1px 4px rgba(35, 25, 60, 0.08)' : 'none',
              }}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setDiffMode('unified')}
              style={{
                background: diffMode === 'unified' ? '#FFFFFF' : 'transparent',
                color: diffMode === 'unified' ? '#1A1626' : '#6B6382',
                border: 'none',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: diffMode === 'unified' ? 700 : 500,
                boxShadow: diffMode === 'unified' ? '0 1px 4px rgba(35, 25, 60, 0.08)' : 'none',
              }}
            >
              Unified Diff
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Primary Action: APPLY FIX */}
          {onApplyFix && (
            <button
              type="button"
              onClick={handleApply}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                backgroundColor: applied ? '#16A34A' : '#5E4F98',
                borderColor: applied ? '#15803D' : 'transparent',
              }}
            >
              {applied ? (
                <>
                  <Check size={14} />
                  Applied to Editor!
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  APPLY FIX
                </>
              )}
            </button>
          )}

          {/* Secondary Action: REVIEW CHANGES / COPY */}
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: copied ? '#16A34A' : '#1A1626',
            }}
          >
            {copied ? (
              <>
                <Check size={14} style={{ color: '#16A34A' }} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                REVIEW CHANGES
              </>
            )}
          </button>
        </div>
      </div>

      {/* BEFORE / AFTER Comparison Views in Sleek Rounded Workstation Frames */}
      {diffMode === 'split' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {/* BEFORE Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#120F1D',
              borderRadius: '16px',
              border: '1px solid #2D2742',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(18, 15, 29, 0.2)',
            }}
          >
            <div
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#1A1628',
                borderBottom: '1px solid #2D2742',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#F87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>BEFORE: ORIGINAL CODE</span>
              <span style={{ fontSize: '0.7rem', color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                Vulnerable
              </span>
            </div>
            <div
              style={{
                padding: '0.85rem 0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.825rem',
                overflowX: 'auto',
                lineHeight: 1.6,
                maxHeight: '440px',
                overflowY: 'auto',
                color: '#EDE8F8',
              }}
            >
              {originalLines.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', padding: '0 0.5rem', whiteSpace: 'pre' }}>
                  <span style={{ width: '32px', color: '#665C82', userSelect: 'none', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span>{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#120F1D',
              borderRadius: '16px',
              border: '1px solid #2D2742',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(18, 15, 29, 0.2)',
            }}
          >
            <div
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#1A1628',
                borderBottom: '1px solid #2D2742',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>AFTER: CODEGUARD FIXED CODE</span>
              <span style={{ fontSize: '0.7rem', color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                Remediated
              </span>
            </div>
            <div
              style={{
                padding: '0.85rem 0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.825rem',
                overflowX: 'auto',
                lineHeight: 1.6,
                maxHeight: '440px',
                overflowY: 'auto',
                color: '#EDE8F8',
              }}
            >
              {fixedLines.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', padding: '0 0.5rem', whiteSpace: 'pre' }}>
                  <span style={{ width: '32px', color: '#665C82', userSelect: 'none', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span>{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified Diff Container */
        <div
          style={{
            backgroundColor: '#120F1D',
            borderRadius: '16px',
            border: '1px solid #2D2742',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            overflowX: 'auto',
            lineHeight: 1.6,
            maxHeight: '440px',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(18, 15, 29, 0.2)',
          }}
        >
          <div style={{ display: 'table', width: '100%', padding: '0.5rem 0' }}>
            {diffParts.map((part, partIdx) => {
              const lines = part.value.replace(/\n$/, '').split('\n');
              const isAdded = part.added;
              const isRemoved = part.removed;

              const bg = isAdded
                ? 'rgba(16, 185, 129, 0.16)'
                : isRemoved
                ? 'rgba(239, 68, 68, 0.16)'
                : 'transparent';

              const textColor = isAdded
                ? '#34D399'
                : isRemoved
                ? '#F87171'
                : '#EDE8F8';

              const prefix = isAdded ? '+ ' : isRemoved ? '- ' : '  ';

              return lines.map((line, lineIdx) => (
                <div
                  key={`${partIdx}-${lineIdx}`}
                  style={{
                    display: 'flex',
                    backgroundColor: bg,
                    color: textColor,
                    padding: '0.1rem 1rem',
                    whiteSpace: 'pre',
                  }}
                >
                  <span
                    style={{
                      userSelect: 'none',
                      width: '28px',
                      flexShrink: 0,
                      color: isAdded
                        ? '#34D399'
                        : isRemoved
                        ? '#F87171'
                        : '#665C82',
                    }}
                  >
                    {prefix}
                  </span>
                  <span>{line || ' '}</span>
                </div>
              ));
            })}
          </div>
        </div>
      )}
    </div>
  );
}
