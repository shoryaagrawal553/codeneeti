import React, { useRef } from 'react';
import { MAX_CODE_BYTES } from '../services/reviewService';

export default function EditorToolbar({
  language,
  onLanguageChange,
  isAutoDetect,
  onToggleAutoDetect,
  fileName,
  onClearFile,
  codeStats,
  onClearCode,
  onLoadSample,
  onFileUpload,
  isAnalyzing,
}) {
  const fileInputRef = useRef(null);

  const isOverSize = codeStats.bytes > MAX_CODE_BYTES;
  const sizeKB = (codeStats.bytes / 1024).toFixed(1);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = ''; // Reset input to allow re-uploading same file
    }
  };

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
        borderBottom: '1px solid var(--border-subtle)',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
      }}
    >
      {/* Left controls: Language & File actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <label
            htmlFor="lang-select"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
            }}
          >
            Language:
          </label>
          <select
            id="lang-select"
            className="select-input"
            value={isAutoDetect ? 'auto' : language}
            onChange={(e) => {
              if (e.target.value === 'auto') {
                onToggleAutoDetect(true);
              } else {
                onToggleAutoDetect(false);
                onLanguageChange(e.target.value);
              }
            }}
            disabled={isAnalyzing}
          >
            <option value="auto">Auto-detect ({language === 'python' ? 'Python' : 'JavaScript'})</option>
            <option value="python">Python (.py)</option>
            <option value="javascript">JavaScript (.js)</option>
          </select>
        </div>

        {/* Upload File Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          title="Upload a .py or .js file (max 100 KB)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".py,.js"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Load Sample Code */}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onLoadSample}
          disabled={isAnalyzing}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          title="Load sample code with SQL Injection & Hardcoded Secret"
        >
          Load Sample Code
        </button>

        {/* Loaded File Pill */}
        {fileName && (
          <div
            className="animate-fade-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              backgroundColor: 'rgba(99, 102, 241, 0.14)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--primary)' }}>📄</span>
            <span>{fileName}</span>
            <button
              type="button"
              onClick={onClearFile}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '0.9rem',
                lineHeight: 1,
              }}
              title="Remove file"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Right controls: Stats and Clear */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Real-time Code Stats & Size Guard */}
        <div
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: isOverSize ? 'var(--severity-critical)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{codeStats.lines} lines</span>
          <span>&bull;</span>
          <span>{codeStats.characters} chars</span>
          <span>&bull;</span>
          <span
            style={{
              fontWeight: isOverSize ? 700 : 500,
              padding: isOverSize ? '0.1rem 0.4rem' : '0',
              backgroundColor: isOverSize ? 'var(--severity-critical-bg)' : 'transparent',
              borderRadius: 'var(--radius-xs)',
              border: isOverSize ? '1px solid var(--severity-critical-border)' : 'none',
            }}
          >
            {sizeKB} KB / 100 KB
          </span>
        </div>

        {/* Clear Code Button */}
        {codeStats.characters > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClearCode}
            disabled={isAnalyzing}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem', color: 'var(--text-muted)' }}
            title="Clear editor code"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
