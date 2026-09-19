import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import EditorToolbar from './components/EditorToolbar';
import CodeEditor from './components/CodeEditor';
import NotificationBanner from './components/NotificationBanner';
import ProgressOverlay from './components/ProgressOverlay';
import ReviewSummaryCard from './components/ReviewSummaryCard';
import LandingScene from './components/LandingScene';
import {
  MAX_CODE_BYTES,
  detectLanguage,
  validateFile,
  SAMPLE_VULNERABLE_CODE,
  executeCodeReview,
} from './services/reviewService';

export default function App() {
  // Top-level navigation state: 'landing' (primary pixel-art world) | 'workspace' (code review app)
  const [viewMode, setViewMode] = useState('landing');

  // Editor and input state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [fileName, setFileName] = useState(null);
  const [notification, setNotification] = useState(null);

  // Analysis & Pipeline execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressState, setProgressState] = useState({ stage: 1, label: '' });
  const [reviewResult, setReviewResult] = useState(null);

  // Compute stats
  const codeStats = useMemo(() => {
    const lines = code ? code.split('\n').length : 0;
    const characters = code.length;
    const bytes = new Blob([code]).size;
    return { lines, characters, bytes };
  }, [code]);

  const isOverSize = codeStats.bytes > MAX_CODE_BYTES;
  const isReadyToAnalyze = code.trim().length > 0 && !isOverSize && !isAnalyzing;

  // Code input handler
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (isAutoDetect && newCode.trim().length > 0) {
      const detected = detectLanguage(fileName || '', newCode);
      setLanguage(detected);
    }
  };

  // File upload / drop handler
  const handleFileUpload = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setNotification({ type: 'error', message: validation.error });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result || '';
      setCode(content);
      setFileName(file.name);

      if (isAutoDetect) {
        const detected = detectLanguage(file.name, content);
        setLanguage(detected);
      }

      setNotification({
        type: 'info',
        message: `Successfully loaded '${file.name}' (${(file.size / 1024).toFixed(1)} KB).`,
      });
    };

    reader.onerror = () => {
      setNotification({ type: 'error', message: `Failed to read file '${file.name}'.` });
    };

    reader.readAsText(file);
  };

  // Load sample code
  const handleLoadSample = () => {
    setCode(SAMPLE_VULNERABLE_CODE);
    setFileName('sample_vulnerable_app.py');
    setLanguage('python');
    setNotification({
      type: 'info',
      message: 'Loaded sample Python application with SQL Injection (CWE-89) and Hardcoded Secret (CWE-798).',
    });
  };

  // Clear code
  const handleClearCode = () => {
    setCode('');
    setFileName(null);
    setNotification(null);
  };

  // Trigger review execution
  const handleRunReview = async () => {
    if (!isReadyToAnalyze) return;

    setNotification(null);
    setIsAnalyzing(true);
    setProgressState({ stage: 1, label: 'Initiating static analysis...' });

    try {
      const result = await executeCodeReview(code, language, (progress) => {
        setProgressState(progress);
      });
      setReviewResult(result);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Review failed: ${err?.message || 'An unexpected error occurred during review.'}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // If in 'landing' mode, display the full-screen pixel-art meadow with CRT gateway
  if (viewMode === 'landing') {
    return <LandingScene onEnter={() => setViewMode('workspace')} />;
  }

  // Otherwise, display the CodeGuard review workspace
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Floating Translucent Header */}
      <Header
        onReset={() => setReviewResult(null)}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Container */}
      <main style={{ flex: 1, padding: '2rem 0 4rem' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Notification / Validation Alert */}
          {notification && (
            <NotificationBanner
              type={notification.type}
              message={notification.message}
              onDismiss={() => setNotification(null)}
            />
          )}

          {/* Size Guard Warning if code exceeds 100 KB */}
          {isOverSize && (
            <NotificationBanner
              type="error"
              message={`File size (${(codeStats.bytes / 1024).toFixed(1)} KB) exceeds the 100 KB limit. Submission is disabled until code is reduced.`}
            />
          )}

          {/* Review Results View or Editor View */}
          {reviewResult ? (
            <ReviewSummaryCard
              result={reviewResult}
              onBackToEditor={() => setReviewResult(null)}
            />
          ) : (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Introduction Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.65rem', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
                    Code Review &amp; Security Assistant
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.92rem' }}>
                    Paste code or drag and drop a file to run Semgrep, Bandit, and multi-agent Gemini verification.
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRunReview}
                  disabled={!isReadyToAnalyze}
                  style={{
                    padding: '0.65rem 1.45rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}
                >
                  <span>✨</span>
                  <span>Run Code Review</span>
                </button>
              </div>

              {/* Unified Monaco Editor & Drop Zone Container */}
              <div
                className="glass-panel"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <EditorToolbar
                  language={language}
                  onLanguageChange={setLanguage}
                  isAutoDetect={isAutoDetect}
                  onToggleAutoDetect={setIsAutoDetect}
                  fileName={fileName}
                  onClearFile={() => setFileName(null)}
                  codeStats={codeStats}
                  onClearCode={handleClearCode}
                  onLoadSample={handleLoadSample}
                  onFileUpload={handleFileUpload}
                  isAnalyzing={isAnalyzing}
                />

                <CodeEditor
                  code={code}
                  onChange={handleCodeChange}
                  language={language}
                  onFileUpload={handleFileUpload}
                  onLoadSample={handleLoadSample}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {/* Bottom Feature Badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <span>🛡️ <strong>Semgrep &amp; Bandit</strong> AST Ground Truth</span>
                  <span>🤖 <strong>3-Agent Gemini</strong> Pipeline</span>
                  <span>⚡ <strong>Empirical</strong> Fix Verification</span>
                </div>
                <div>
                  Supported: <strong style={{ color: 'var(--text-primary)' }}>Python (.py)</strong>, <strong style={{ color: 'var(--text-primary)' }}>JavaScript (.js)</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4-Stage Progress Overlay during review */}
      {isAnalyzing && (
        <ProgressOverlay
          currentStage={progressState.stage}
          currentLabel={progressState.label}
        />
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem 0',
          backgroundColor: 'var(--bg-surface)',
          marginTop: 'auto',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            CodeGuard &bull; AI Code Review &amp; Security Assistant
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            API Contract v1.0 &bull; Local-First
          </span>
        </div>
      </footer>
    </div>
  );
}
