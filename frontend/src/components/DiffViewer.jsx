import React, { useState } from 'react';
import { diffLines } from 'diff';
import { Copy, Check, AlertTriangle, ShieldCheck, FileDiff } from 'lucide-react';

export default function DiffViewer({
  originalCode,
  fixedCode,
  fixAvailable = true,
  verificationAvailable = true,
  warnings = [],
}) {
  const [copied, setCopied] = useState(false);

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

  // Degraded state: Fix not available
  if (!fixAvailable || !fixedCode) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={36} style={{ color: 'var(--severity-medium)', marginBottom: '0.75rem' }} />
        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Automated Fix Unavailable</h4>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '480px', marginInline: 'auto' }}>
          The Fix Agent was unable to produce a safe automated repair for this snippet.
          Please refer to the finding explanations to apply remediation manually.
        </p>
        {warnings.length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textAlign: 'left',
            }}
          >
            <strong>Warnings:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Compute line diff
  const diffParts = diffLines(originalCode || '', fixedCode || '');

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileDiff size={18} style={{ color: 'var(--secondary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            Remediation &amp; Unified Diff
          </h3>
          {verificationAvailable ? (
            <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
              <ShieldCheck size={11} /> Verified Fix
            </span>
          ) : (
            <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
              Unverified
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '0.825rem',
            color: copied ? 'var(--status-resolved)' : 'var(--text-primary)',
            borderColor: copied ? 'var(--status-resolved-border)' : 'var(--border-medium)',
          }}
        >
          {copied ? (
            <>
              <Check size={14} style={{ color: 'var(--status-resolved)' }} />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Fixed Code
            </>
          )}
        </button>
      </div>

      {/* Developer Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 0.9rem',
          backgroundColor: 'var(--primary-surface)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Notice:</span>
        <span>Generated fixes are suggestions. Review and test before applying.</span>
      </div>

      {/* Diff Code Container */}
      <div
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          overflowX: 'auto',
          lineHeight: 1.6,
          maxHeight: '440px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'table', width: '100%' }}>
          {diffParts.map((part, partIdx) => {
            const lines = part.value.replace(/\n$/, '').split('\n');
            const isAdded = part.added;
            const isRemoved = part.removed;

            const bg = isAdded
              ? 'rgba(16, 185, 129, 0.14)'
              : isRemoved
              ? 'rgba(239, 68, 68, 0.14)'
              : 'transparent';

            const textColor = isAdded
              ? '#34d399'
              : isRemoved
              ? '#f87171'
              : 'var(--text-primary)';

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
                      ? 'var(--status-resolved)'
                      : isRemoved
                      ? 'var(--severity-critical)'
                      : 'var(--text-muted)',
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
    </div>
  );
}
