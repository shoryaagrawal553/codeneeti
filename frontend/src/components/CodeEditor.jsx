import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({
  code,
  onChange,
  language,
  selectedFinding,
  readOnly = false,
  height = '460px',
  onFileUpload,
  onLoadSample,
  isAnalyzing = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  // Monaco language identifier mapping for all 7 supported languages
  const getMonacoLanguage = (lang) => {
    switch (lang?.toLowerCase()) {
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'go':
        return 'go';
      case 'python':
      default:
        return 'python';
    }
  };
  const monacoLanguage = getMonacoLanguage(language);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('codeguard-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#120F1D',
        'editor.lineHighlightBackground': '#1E192D',
        'editorLineNumber.foreground': '#544A6E',
        'editorLineNumber.activeForeground': '#B3A9C9',
        'editorCursor.foreground': '#A592D6',
      },
    });

    monaco.editor.setTheme('codeguard-dark');
  };

  // Scroll to and highlight line range when a finding is selected
  useEffect(() => {
    if (!editorRef.current || !selectedFinding) return;

    const editor = editorRef.current;
    const startLine = selectedFinding.line_start || 1;
    const endLine = selectedFinding.line_end || startLine;

    // Scroll to the line
    editor.revealLineInCenter(startLine);

    // Apply line highlight decoration
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: {
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: 1000,
        },
        options: {
          isWholeLine: true,
          className: 'finding-line-highlight',
          overviewRuler: {
            color: 'rgba(239, 68, 68, 0.7)',
            position: 4,
          },
        },
      },
    ]);
  }, [selectedFinding]);

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
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        height: height || '460px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
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
        language={monacoLanguage}
        value={code}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 13.5,
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readOnly || isAnalyzing,
          tabSize: language === 'javascript' ? 2 : 4,
          wordWrap: 'on',
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
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
            {onLoadSample && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onLoadSample}
                style={{ fontSize: '0.8rem', pointerEvents: 'auto' }}
              >
                Load Vulnerable Sample
              </button>
            )}
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
