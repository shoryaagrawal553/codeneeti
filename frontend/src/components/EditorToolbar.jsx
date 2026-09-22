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
  availableLanguages = null,
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

  const langOptions = availableLanguages || SUPPORTED_LANGUAGES;

  return (
    <div className="editor-toolbar-container">
      {/* Left controls: Language selection, File upload, Sample loader */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', minWidth: 0 }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Code2 size={15} style={{ color: '#A592D6' }} />
          <label htmlFor="language-select" style={{ fontSize: '0.8rem', color: '#B3A9C9', fontWeight: 600 }}>
            Language:
          </label>
          <select
            id="language-select"
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
              backgroundColor: '#14111E',
              color: '#EDE8F8',
              border: '1px solid #362E4F',
              borderRadius: '8px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.825rem',
              fontWeight: 500,
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
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(44, 140, 125, 0.2)',
              color: '#4FD1C5',
              border: '1px solid rgba(44, 140, 125, 0.4)',
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
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                backgroundColor: '#272138',
                color: '#D8D0E8',
                border: '1px solid #3E3458',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              title="Upload a source file (.py, .js, .ts, .java, .c, .cpp, .go)"
            >
              <Upload size={13} />
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.pyw,.js,.jsx,.mjs,.cjs,.ts,.tsx,.mts,.cts,.java,.c,.h,.cpp,.cc,.cxx,.hpp,.hh,.hxx,.go"
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
              backgroundColor: '#2F254B',
              border: '1px solid #4D3C77',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              color: '#EDE8F8',
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
                  color: '#A59DB8',
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
            onClick={onLoadSample}
            disabled={isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              padding: '0.35rem 0.65rem',
              background: 'transparent',
              color: '#E07A9F', // Dusty rose
              border: 'none',
              cursor: 'pointer',
            }}
            title="Load benchmark vulnerable sample snippet"
          >
            <Sparkles size={13} />
            Load Sample
          </button>
        )}
      </div>

      {/* Right controls: Metrics, Clear, Analyze */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0 }}>
        {/* Code metrics counters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: overSize ? '#F87171' : '#9288AA',
          }}
        >
          <span>{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <span>&bull;</span>
          <span>{chars.toLocaleString()} chars</span>
          <span>&bull;</span>
          <span
            style={{
              color: overSize ? '#F87171' : '#B8AED0',
              fontWeight: overSize ? 700 : 500,
              padding: overSize ? '0.1rem 0.4rem' : '0',
              backgroundColor: overSize ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              borderRadius: '4px',
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
            onClick={handleClear}
            disabled={isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              padding: '0.35rem 0.55rem',
              background: 'transparent',
              border: 'none',
              color: '#9288AA',
              cursor: 'pointer',
            }}
            title="Clear editor code"
          >
            <RotateCcw size={12} />
            Clear
          </button>
        )}

        {/* Primary Action: ANALYZE CODE */}
        {onAnalyze && (
          <button
            type="button"
            onClick={onAnalyze}
            disabled={chars === 0 || overSize || isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1.3rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.02em',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#6C5BA8',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(108, 91, 168, 0.35)',
              opacity: chars === 0 || overSize || isAnalyzing ? 0.6 : 1,
              cursor: chars === 0 || overSize || isAnalyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isAnalyzing ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                ANALYZE CODE
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
