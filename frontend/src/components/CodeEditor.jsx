import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({
  code,
  onChange,
  language,
  onFileUpload,
  onLoadSample,
  isAnalyzing,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  // Drag & drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragOver(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  // Monaco editor options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', Consolas, monospace",
    lineHeight: 22,
    tabSize: 4,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    renderLineHighlight: 'all',
    theme: 'vs-dark',
    readOnly: isAnalyzing,
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '460px',
        backgroundColor: '#0c121e',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Monaco Editor Canvas */}
      <Editor
        height="100%"
        language={language === 'javascript' ? 'javascript' : 'python'}
        value={code}
        onChange={(val) => onChange(val || '')}
        options={editorOptions}
        theme="vs-dark"
      />

      {/* Empty State Overlay when no code is entered */}
      {(!code || code.trim() === '') && !isDragOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'var(--text-muted)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: 'var(--primary)',
            }}
          >
            ⌨
          </div>
          <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Paste code here or drag &amp; drop a file
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Supports Python (.py) and JavaScript (.js) up to 100 KB
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onLoadSample}
              style={{ fontSize: '0.8rem', pointerEvents: 'auto' }}
            >
              Load Vulnerable Sample
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="drag-overlay">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--primary-glow)',
              fontSize: '1.8rem',
              color: '#ffffff',
            }}
          >
            📥
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              Drop file to load into CodeGuard
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supports Python (.py) or JavaScript (.js) files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
