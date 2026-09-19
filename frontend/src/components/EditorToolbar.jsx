import React, { useRef } from 'react';
import { Play, RotateCcw, Sparkles, AlertTriangle, Code2, Upload, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES, MAX_CODE_BYTES } from '../types';

export default function EditorToolbar({
  language,
  onLanguageChange,
  detectedLanguage,
  isAutoDetect,
  onToggleAutoDetect,
  fileName,
  onClearFile,
  codeStats = { lines: 0, chars: 0, characters: 0, bytes: 0 },
  onClear,
  onClearCode,
  onLoadSample,
  onFileUpload,
  onAnalyze,
  isAnalyzing = false,
  isOverLimit = false,
}) {
  const fileInputRef = useRef(null);

  // Normalize stats
  const lines = codeStats.lines || 0;
  const chars = codeStats.characters ?? codeStats.chars ?? 0;
  const bytes = codeStats.bytes || 0;
  const kbSize = (bytes / 1024).toFixed(1);
  const overSize = isOverLimit || bytes > MAX_CODE_BYTES;

  const handleClear = onClear || onClearCode;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  // Supported languages list
  const langOptions = SUPPORTED_LANGUAGES || [
    { id: 'auto', display_name: 'Auto-detect' },
    { id: 'python', display_name: 'Python (.py)' },
    { id: 'javascript', display_name: 'JavaScript (.js)' },
  ];

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
      {/* Left controls: Language selection, File upload, Sample loader */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Code2 size={16} style={{ color: 'var(--primary)' }} />
          <label htmlFor="language-select" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Language:
          </label>
          <select
            id="language-select"
            className="select-input"
            value={isAutoDetect ? 'auto' : language}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'auto') {
                if (onToggleAutoDetect) onToggleAutoDetect(true);
                onLanguageChange('auto');
              } else {
                if (onToggleAutoDetect) onToggleAutoDetect(false);
                onLanguageChange(val);
              }
            }}
            disabled={isAnalyzing}
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {langOptions.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* Detected language indicator */}
        {(language === 'auto' || isAutoDetect) && detectedLanguage && (
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

        {/* Upload File Button */}
        {onFileUpload && (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
              title="Upload a .py or .js file (max 100 KB)"
            >
              <Upload size={14} />
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </>
        )}

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
            <span>📄</span>
            <span>{fileName}</span>
            {onClearFile && (
              <button
                type="button"
                onClick={onClearFile}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0 2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Remove file"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Load Sample Button */}
        {onLoadSample && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onLoadSample}
            disabled={isAnalyzing}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
            title="Load benchmark vulnerable sample snippet"
          >
            <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
            Load Sample
          </button>
        )}
      </div>

      {/* Right controls: Metrics, Clear, Analyze */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {/* Code metrics counters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: overSize ? 'var(--severity-critical)' : 'var(--text-muted)',
          }}
        >
          <span>{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <span>&bull;</span>
          <span>{chars.toLocaleString()} chars</span>
          <span>&bull;</span>
          <span
            style={{
              color: overSize ? 'var(--severity-critical)' : 'var(--text-secondary)',
              fontWeight: overSize ? 700 : 400,
              padding: overSize ? '0.1rem 0.4rem' : '0',
              backgroundColor: overSize ? 'var(--severity-critical-bg)' : 'transparent',
              borderRadius: 'var(--radius-xs)',
              border: overSize ? '1px solid var(--severity-critical-border)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {overSize && <AlertTriangle size={12} />}
            {kbSize} KB / 100 KB
          </span>
        </div>

        {/* Clear Code Button */}
        {chars > 0 && handleClear && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClear}
            disabled={isAnalyzing}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', gap: '0.3rem', color: 'var(--text-muted)' }}
            title="Clear editor code"
          >
            <RotateCcw size={12} />
            Clear
          </button>
        )}

        {/* Optional inline Analyze button */}
        {onAnalyze && (
          <button
            type="button"
            onClick={onAnalyze}
            disabled={chars === 0 || overSize || isAnalyzing}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: chars === 0 || overSize || isAnalyzing ? 0.6 : 1,
              cursor: chars === 0 || overSize || isAnalyzing ? 'not-allowed' : 'pointer',
            }}
          >
            {isAnalyzing ? (
              <span className="animate-pulse-glow">Analyzing...</span>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Analyze Code
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
