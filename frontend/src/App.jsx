import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Sparkles, AlertCircle, Layers, CheckCircle2 } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import EditorToolbar from './components/EditorToolbar';
import FileUploader from './components/FileUploader';
import PipelineProgress from './components/PipelineProgress';
import FindingsList from './components/FindingsList';
import FindingDetail from './components/FindingDetail';
import DiffViewer from './components/DiffViewer';
import { analyzeCode, getHealth } from './services/api';
import { MAX_CODE_BYTES } from './types';

// Benchmark sample code for quick testing and judges' demonstration
const DEMO_SAMPLE_PYTHON = `import sqlite3

DB_PASSWORD = "super_secret_db_password_123"

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE name = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()
`;

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [filename, setFilename] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'diff'

  // Pipeline state machine: 'idle' | 'analyzing' | 'results' | 'error'
  const [status, setStatus] = useState('idle');
  const [analysisStage, setAnalysisStage] = useState(0);
  const [reviewResult, setReviewResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking' });

  // Check backend health on mount
  useEffect(() => {
    getHealth().then((health) => {
      setBackendHealth(health);
    });
  }, []);

  // Compute code statistics
  const codeStats = useMemo(() => {
    const lines = code ? code.split('\n').length : 0;
    const chars = code.length;
    const bytes = new TextEncoder().encode(code).length;
    return { lines, chars, bytes };
  }, [code]);

  const isOverLimit = codeStats.bytes > MAX_CODE_BYTES;

  // Auto-detect language from code keywords or filename
  const detectedLanguage = useMemo(() => {
    if (filename) {
      if (filename.toLowerCase().endsWith('.py')) return 'Python';
      if (filename.toLowerCase().endsWith('.js')) return 'JavaScript';
    }

    if (code) {
      if (code.includes('def ') || code.includes('import ') || code.includes('elif ')) {
        return 'Python';
      }
      if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) {
        return 'JavaScript';
      }
    }
    return null;
  }, [code, filename]);

  // Handle file load from FileUploader
  const handleFileLoaded = ({ code: fileCode, filename: name, language: lang }) => {
    setCode(fileCode);
    setFilename(name);
    setLanguage(lang);
    setErrorMessage(null);
  };

  // Handle loading demo benchmark
  const handleLoadSample = () => {
    setCode(DEMO_SAMPLE_PYTHON);
    setLanguage('python');
    setFilename('sample_query.py');
    setErrorMessage(null);
  };

  // Handle Clear
  const handleClear = () => {
    setCode('');
    setFilename(null);
    setSelectedFinding(null);
    setReviewResult(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  // Trigger analysis pipeline
  const handleAnalyze = async () => {
    if (!code || !code.trim()) {
      setErrorMessage('Please enter or upload code before analyzing.');
      return;
    }

    if (isOverLimit) {
      setErrorMessage('Code exceeds 100 KB limit. Please reduce snippet size.');
      return;
    }

    setErrorMessage(null);
    setStatus('analyzing');
    setAnalysisStage(0);

    // Deterministic progression sequence for visual feedback (Phase 11)
    const stageTimer1 = setTimeout(() => setAnalysisStage(1), 350);
    const stageTimer2 = setTimeout(() => setAnalysisStage(2), 700);
    const stageTimer3 = setTimeout(() => setAnalysisStage(3), 1050);

    try {
      const result = await analyzeCode({
        code,
        language,
        filename,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setAnalysisStage(3);

      setReviewResult(result);
      setStatus('results');

      // Default select first finding if present
      if (result.findings && result.findings.length > 0) {
        setSelectedFinding(result.findings[0]);
      } else {
        setSelectedFinding(null);
      }
    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setStatus('error');
      setErrorMessage(err.message || 'Analysis pipeline encountered an error.');
      if (err.partialResult) {
        setReviewResult(err.partialResult);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '0.85rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                color: '#ffffff',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                CodeGuard
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)' }}>v1.0</span>
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Agentic AI Code Review &amp; Security Assistant
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              className="badge"
              style={{
                backgroundColor: backendHealth.status === 'ok' ? 'var(--status-resolved-bg)' : 'var(--primary-surface)',
                color: backendHealth.status === 'ok' ? 'var(--status-resolved)' : 'var(--primary)',
                borderColor: backendHealth.status === 'ok' ? 'var(--status-resolved-border)' : 'var(--border-accent)',
                fontSize: '0.75rem',
              }}
            >
              <CheckCircle2 size={12} />
              {backendHealth.status === 'ok' ? 'Backend Online' : 'Mock Mode Active'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              API Contract v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, padding: '1.75rem 0 3rem' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* File Upload Zone */}
          <FileUploader
            currentFilename={filename}
            onFileLoaded={handleFileLoaded}
            onError={(msg) => setErrorMessage(msg)}
            onClearFile={() => setFilename(null)}
          />

          {/* Validation or Error Banner */}
          {errorMessage && (
            <div
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                backgroundColor: 'var(--severity-critical-bg)',
                border: '1px solid var(--severity-critical-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--severity-critical)',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Editor Workspace Container */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
            }}
          >
            <EditorToolbar
              language={language}
              onLanguageChange={setLanguage}
              detectedLanguage={detectedLanguage}
              codeStats={codeStats}
              onClear={handleClear}
              onLoadSample={handleLoadSample}
              onAnalyze={handleAnalyze}
              isAnalyzing={status === 'analyzing'}
              isOverLimit={isOverLimit}
            />

            <CodeEditor
              code={code}
              onChange={(newCode) => {
                setCode(newCode);
                if (errorMessage) setErrorMessage(null);
              }}
              language={language === 'auto' ? (detectedLanguage ? detectedLanguage.toLowerCase() : 'python') : language}
              selectedFinding={selectedFinding}
              height="400px"
            />
          </div>

          {/* Pipeline Progress Indicator */}
          {status === 'analyzing' && (
            <PipelineProgress currentStageIndex={analysisStage} />
          )}

          {/* Results Workspace */}
          {status === 'results' && reviewResult && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Results Tabs Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('findings')}
                  className="btn"
                  style={{
                    backgroundColor: activeTab === 'findings' ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: activeTab === 'findings' ? 'var(--primary)' : 'var(--text-secondary)',
                    borderColor: activeTab === 'findings' ? 'var(--border-accent)' : 'transparent',
                    fontSize: '0.875rem',
                    padding: '0.45rem 1rem',
                  }}
                >
                  <Layers size={15} />
                  Findings &amp; Analysis ({reviewResult.findings ? reviewResult.findings.length : 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('diff')}
                  className="btn"
                  style={{
                    backgroundColor: activeTab === 'diff' ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: activeTab === 'diff' ? 'var(--secondary)' : 'var(--text-secondary)',
                    borderColor: activeTab === 'diff' ? 'var(--secondary-surface)' : 'transparent',
                    fontSize: '0.875rem',
                    padding: '0.45rem 1rem',
                  }}
                >
                  <Sparkles size={15} />
                  Remediation &amp; Diff
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'findings' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Detected Issues
                    </h4>
                    <FindingsList
                      findings={reviewResult.findings}
                      selectedFindingId={selectedFinding?.id}
                      onSelectFinding={setSelectedFinding}
                      summary={reviewResult.summary}
                    />
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Issue Details &amp; Context
                    </h4>
                    <FindingDetail finding={selectedFinding} />
                  </div>
                </div>
              ) : (
                <DiffViewer
                  originalCode={code}
                  fixedCode={reviewResult.fixed_code}
                  fixAvailable={reviewResult.fix_available}
                  verificationAvailable={reviewResult.verification_available}
                  warnings={reviewResult.warnings}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.25rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            CodeGuard &bull; CodeNeeti Hackathon 2026 &bull; Antigravity Multi-Agent Implementation
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Sequential Pipeline: Static Analysis &rarr; Analyzer &rarr; Fix &rarr; Verifier
          </span>
        </div>
      </footer>
    </div>
  );
}
