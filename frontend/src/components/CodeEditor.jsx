import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({
  code,
  onChange,
  language,
  selectedFinding,
  readOnly = false,
  height = '460px',
}) {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  // Monaco language identifier mapping
  const monacoLanguage = language === 'javascript' ? 'javascript' : 'python';

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom subtle highlight theme rule if needed
    monaco.editor.defineTheme('codeguard-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1322',
        'editor.lineHighlightBackground': '#1a243d55',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#94a3b8',
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

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-canvas)',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <Editor
        height={height}
        language={monacoLanguage}
        value={code}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 13.5,
          fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          tabSize: language === 'javascript' ? 2 : 4,
          wordWrap: 'on',
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
