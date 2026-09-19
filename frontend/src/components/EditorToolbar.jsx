import React from 'react';
import { Play, RotateCcw, Sparkles, AlertTriangle, Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, MAX_CODE_BYTES } from '../types';

export default function EditorToolbar({
  language,
  onLanguageChange,
  detectedLanguage,
  codeStats,
  onClear,
  onLoadSample,
  onAnalyze,
  isAnalyzing,
  isOverLimit,
}) {
  const { lines, chars, bytes } = codeStats;
  const kbSize = (bytes / 1024).toFixed(1);
  const percentage = Math.min(100, Math.round((bytes / MAX_CODE_BYTES) * 100));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left controls: Language selector and Demo loader */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Code2 size={16} style={{ color: 'var(--primary)' }} />
          <label htmlFor="language-select" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.display_name}
              </option>
            ))}
          </select>
        </div>

        {language === 'auto' && detectedLanguage && (
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--secondary-surface)',
              color: 'var(--secondary)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            Detected: {detectedLanguage}
          </span>
        )}

        <button
          type="button"
          onClick={onLoadSample}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          title="Load benchmark vulnerable sample snippet"
        >
          <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
          Load Demo Sample
        </button>
      </div>

      {/* Right controls: Metrics, Reset & Analyze */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Code metrics counters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          <span>{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <span>&bull;</span>
          <span>{chars.toLocaleString()} chars</span>
          <span>&bull;</span>
          <span
            style={{
              color: isOverLimit
                ? 'var(--severity-critical)'
                : percentage > 80
                ? 'var(--severity-high)'
                : 'var(--text-secondary)',
              fontWeight: isOverLimit ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {isOverLimit && <AlertTriangle size={12} />}
            {kbSize} KB / 100 KB
          </span>
        </div>

        {/* Clear/Reset button */}
        <button
          type="button"
          onClick={onClear}
          disabled={chars === 0 || isAnalyzing}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: chars === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            cursor: chars === 0 || isAnalyzing ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
          }}
          title="Clear code"
        >
          <RotateCcw size={13} />
          Clear
        </button>

        {/* Primary Analyze Button */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={chars === 0 || isOverLimit || isAnalyzing}
          className="btn btn-primary"
          style={{
            padding: '0.45rem 1.15rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            opacity: chars === 0 || isOverLimit || isAnalyzing ? 0.6 : 1,
            cursor: chars === 0 || isOverLimit || isAnalyzing ? 'not-allowed' : 'pointer',
          }}
        >
          {isAnalyzing ? (
            <>
              <span className="animate-pulse-glow">Analyzing...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
