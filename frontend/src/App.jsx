import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layers, Sparkles, CheckCircle2, Terminal } from 'lucide-react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import EditorToolbar from './components/EditorToolbar';
import FileUploader from './components/FileUploader';
import PipelineProgress from './components/PipelineProgress';
import FindingsList from './components/FindingsList';
import FindingDetail from './components/FindingDetail';
import DiffViewer from './components/DiffViewer';
import NotificationBanner from './components/NotificationBanner';
import FrameSequenceHero from './components/FrameSequenceHero';
import SpiderPointerEffect from './components/SpiderPointerEffect';
import { analyzeCode, getHealth, getLanguages } from './services/api';
import { MAX_CODE_BYTES, SUPPORTED_LANGUAGES } from './types';

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
  const workspaceRef = useRef(null);

  // Editor and submission state
  const [code, setCode] = useState(DEMO_SAMPLE_PYTHON);
  const [language, setLanguage] = useState('python');
  const [isAutoDetect, setIsAutoDetect] = useState(false);
  const [filename, setFilename] = useState('sample_query.py');
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'diff'

  // Pipeline state machine: 'idle' | 'analyzing' | 'results' | 'error'
  const [status, setStatus] = useState('idle');
  const [analysisStage, setAnalysisStage] = useState(0);
  const [reviewResult, setReviewResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fixAppliedMessage, setFixAppliedMessage] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking' });
  const [availableLanguages, setAvailableLanguages] = useState(SUPPORTED_LANGUAGES);

  // Check backend health & fetch supported languages on mount
  useEffect(() => {
    getHealth().then((health) => {
      setBackendHealth(health);
    });

    getLanguages().then((res) => {
      if (res?.languages && res.languages.length > 0) {
        setAvailableLanguages([
          { id: 'auto', display_name: 'Auto-detect' },
          ...res.languages.map((l) => ({
            id: l.id,
            display_name: l.display_name ? `${l.display_name} (${l.extensions?.[0] || ''})` : l.id,
            extensions: l.extensions || [],
          })),
        ]);
      }
    });
  }, []);

  // Compute code statistics
  const codeStats = useMemo(() => {
    const lines = code ? code.split('\n').length : 0;
    const chars = code.length;
    const bytes = new TextEncoder().encode(code).length;
    return { lines, chars, characters: chars, bytes };
  }, [code]);

  const isOverLimit = codeStats.bytes > MAX_CODE_BYTES;

  // Auto-detect language from code keywords or filename across all 7 supported languages
  const detectedLanguage = useMemo(() => {
    if (filename) {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.py') || lower.endsWith('.pyw')) return 'Python';
      if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'JavaScript';
      if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.mts') || lower.endsWith('.cts')) return 'TypeScript';
      if (lower.endsWith('.java')) return 'Java';
      if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.hpp') || lower.endsWith('.hh') || lower.endsWith('.hxx')) return 'C++';
      if (lower.endsWith('.c') || lower.endsWith('.h')) return 'C';
      if (lower.endsWith('.go')) return 'Go';
    }

    if (code) {
      if (code.includes('package main') || code.includes('func main()')) {
        return 'Go';
      }
      if (code.includes('public class ') || code.includes('System.out.')) {
        return 'Java';
      }
      if (code.includes('#include <') || code.includes('int main(') || code.includes('std::')) {
        return code.includes('std::') || code.includes('cout') ? 'C++' : 'C';
      }
      if (code.includes('interface ') || code.includes(': string') || code.includes(': number') || code.includes('export type')) {
        return 'TypeScript';
      }
      if (code.includes('def ') || code.includes('import ') || code.includes('elif ')) {
        return 'Python';
      }
      if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) {
        return 'JavaScript';
      }
    }
    return null;
  }, [code, filename]);

  // Normalized language passed to Monaco Editor
  const editorLanguage = useMemo(() => {
    if (language !== 'auto') return language;
    if (!detectedLanguage) return 'python';
    const norm = detectedLanguage.toLowerCase();
    if (norm === 'c++') return 'cpp';
    return norm;
  }, [language, detectedLanguage]);

  // Handle file load from FileUploader or direct drop
  const handleFileLoaded = ({ code: fileCode, filename: name, language: lang }) => {
    setCode(fileCode);
    setFilename(name);
    if (lang) {
      setLanguage(lang);
      setIsAutoDetect(false);
    }
    setErrorMessage(null);
  };

  // Direct file upload handler
  const handleFileUpload = (file) => {
    if (!file) return;
    const name = file.name;
    const lowerName = name.toLowerCase();

    let detectedLang = null;
    if (lowerName.endsWith('.py') || lowerName.endsWith('.pyw')) {
      detectedLang = 'python';
    } else if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx') || lowerName.endsWith('.mjs') || lowerName.endsWith('.cjs')) {
      detectedLang = 'javascript';
    } else if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx') || lowerName.endsWith('.mts') || lowerName.endsWith('.cts')) {
      detectedLang = 'typescript';
    } else if (lowerName.endsWith('.java')) {
      detectedLang = 'java';
    } else if (lowerName.endsWith('.cpp') || lowerName.endsWith('.cc') || lowerName.endsWith('.cxx') || lowerName.endsWith('.hpp') || lowerName.endsWith('.hh') || lowerName.endsWith('.hxx')) {
      detectedLang = 'cpp';
    } else if (lowerName.endsWith('.c') || lowerName.endsWith('.h')) {
      detectedLang = 'c';
    } else if (lowerName.endsWith('.go')) {
      detectedLang = 'go';
    }

    if (!detectedLang) {
      setErrorMessage(`Unsupported file "${name}". CodeGuard supports Python, JavaScript, TypeScript, Java, C, C++, and Go files.`);
      return;
    }

    if (file.size > MAX_CODE_BYTES) {
      const sizeKb = (file.size / 1024).toFixed(1);
      setErrorMessage(`File is too large (${sizeKb} KB). Maximum allowed size is 100 KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result || '';
      handleFileLoaded({
        code: content,
        filename: name,
        language: detectedLang,
      });
    };
    reader.onerror = () => {
      setErrorMessage(`Failed to read "${name}".`);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Handle loading demo benchmark
  const handleLoadSample = () => {
    setCode(DEMO_SAMPLE_PYTHON);
    setLanguage('python');
    setIsAutoDetect(false);
    setFilename('sample_query.py');
    setErrorMessage(null);
    setFixAppliedMessage(null);
  };

  // Handle Clear / Reset
  const handleClear = () => {
    setCode('');
    setFilename(null);
    setSelectedFinding(null);
    setReviewResult(null);
    setStatus('idle');
    setErrorMessage(null);
    setFixAppliedMessage(null);
  };

  // Handle Apply Fix from Diff Viewer into Monaco Editor
  const handleApplyFix = (fixedCode) => {
    if (!fixedCode) return;
    setCode(fixedCode);
    setFixAppliedMessage('Verified fix successfully applied to Monaco Editor! You can re-run analysis to confirm resolution.');
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    setFixAppliedMessage(null);
    setStatus('analyzing');
    setAnalysisStage(0);

    // Progression timer sequence for visual feedback
    const stageTimer1 = setTimeout(() => setAnalysisStage(1), 400);
    const stageTimer2 = setTimeout(() => setAnalysisStage(2), 900);
    const stageTimer3 = setTimeout(() => setAnalysisStage(3), 1400);

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

  // Scroll navigation helpers
  const scrollToWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', backgroundColor: '#F8F6FC', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Interactive Cyber Spider Cursor Follower */}
      <SpiderPointerEffect />
      
      {/* 2. Hero: Scroll-Driven Frame Sequence Animation (LOCKED & UNTOUCHED) */}
      <div id="hero">
        <FrameSequenceHero onStartReview={scrollToWorkspace} />
      </div>

      {/* 5. FlowForge-Inspired Floating Pill Navigation */}
      <Header
        onReset={handleClear}
        onScrollToHero={scrollToHero}
        onScrollToWorkspace={scrollToWorkspace}
        backendHealth={backendHealth}
      />

      {/* 8. Creative Developer Review Workspace */}
      <main
        ref={workspaceRef}
        id="workspace"
        style={{
          padding: '3rem 0 5rem',
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#F8F6FC',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section Heading: WHAT ARE YOU REVIEWING? (Warm & Approachable) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingBottom: '0.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#5E4F98',
                backgroundColor: '#EDE8F8',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                width: 'fit-content',
              }}
            >
              <Terminal size={13} />
              DEVELOPER WORKSPACE
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#1A1626',
                margin: 0,
              }}
            >
              WHAT ARE YOU REVIEWING?
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#58516B', margin: 0, maxWidth: '680px', lineHeight: 1.55 }}>
              Paste code below or drag-and-drop a source file to run deterministic AST scans with Semgrep &amp; Bandit,
              followed by multi-agent Gemini vulnerability explanation and verified remediation.
            </p>
          </div>

          {/* Friendly Drag & Drop File Upload Drop-Zone */}
          <FileUploader
            currentFilename={filename}
            onFileLoaded={handleFileLoaded}
            onError={(msg) => setErrorMessage(msg)}
            onClearFile={() => setFilename(null)}
          />

          {/* Validation or Error Banner */}
          {errorMessage && (
            <NotificationBanner
              type="error"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}

          {/* Fix Applied Success Banner */}
          {fixAppliedMessage && (
            <div
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                color: '#15803D',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#16A34A' }} />
              <span style={{ flex: 1 }}>{fixAppliedMessage}</span>
              <button
                type="button"
                onClick={() => setFixAppliedMessage(null)}
                style={{ background: 'transparent', border: 'none', color: '#15803D', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Cozy Developer Workstation Monitor Container (Inspired by Reference Image 4) */}
          <div
            style={{
              border: '1px solid #2D2742',
              borderRadius: '20px',
              boxShadow: '0 20px 48px rgba(28, 22, 45, 0.14), 0 4px 12px rgba(28, 22, 45, 0.08)',
              overflow: 'hidden',
              backgroundColor: '#1C1829',
            }}
          >
            {/* Monitor Bezel Top Bar with Window Control Dots */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 1rem',
                backgroundColor: '#161222',
                borderBottom: '1px solid #28213B',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F87171' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34D399' }} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#7E7399',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 70px)',
                  textAlign: 'center',
                }}
              >
                codeguard-workstation &bull; {filename || 'untitled'}
              </span>
              <div style={{ width: '38px', flexShrink: 0 }} /> {/* Spacer */}
            </div>

            {/* Editor Toolbar */}
            <EditorToolbar
              language={language}
              onLanguageChange={setLanguage}
              detectedLanguage={detectedLanguage}
              isAutoDetect={isAutoDetect}
              onToggleAutoDetect={setIsAutoDetect}
              fileName={filename}
              onClearFile={() => setFilename(null)}
              codeStats={codeStats}
              onClear={handleClear}
              onClearCode={handleClear}
              onLoadSample={handleLoadSample}
              onFileUpload={handleFileUpload}
              onAnalyze={handleAnalyze}
              isAnalyzing={status === 'analyzing'}
              isOverLimit={isOverLimit}
              availableLanguages={availableLanguages}
            />

            {/* Monaco Editor in Dark Workstation Theme */}
            <CodeEditor
              code={code}
              onChange={(newCode) => {
                setCode(newCode);
                if (errorMessage) setErrorMessage(null);
              }}
              language={editorLanguage}
              selectedFinding={selectedFinding}
              onFileUpload={handleFileUpload}
              onLoadSample={handleLoadSample}
              isAnalyzing={status === 'analyzing'}
              height="440px"
            />
          </div>

          {/* Section 14: Analyzing State */}
          {status === 'analyzing' && (
            <PipelineProgress currentStageIndex={analysisStage} />
          )}

          {/* Section 15-18: Results, Finding Detail, Fix View & Verification */}
          {status === 'results' && reviewResult && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Findings vs Diff Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #E8E2F2',
                  paddingBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('findings')}
                    className="btn"
                    style={{
                      backgroundColor: activeTab === 'findings' ? '#5E4F98' : '#FFFFFF',
                      color: activeTab === 'findings' ? '#FFFFFF' : '#58516B',
                      border: `1px solid ${activeTab === 'findings' ? '#5E4F98' : '#E8E2F2'}`,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.5rem 1.15rem',
                      minHeight: '38px',
                      boxShadow: activeTab === 'findings' ? '0 2px 8px rgba(94, 79, 152, 0.2)' : '0 1px 3px rgba(35, 25, 60, 0.04)',
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
                      backgroundColor: activeTab === 'diff' ? '#2C8C7D' : '#FFFFFF',
                      color: activeTab === 'diff' ? '#FFFFFF' : '#58516B',
                      border: `1px solid ${activeTab === 'diff' ? '#2C8C7D' : '#E8E2F2'}`,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.5rem 1.15rem',
                      minHeight: '38px',
                      boxShadow: activeTab === 'diff' ? '0 2px 8px rgba(44, 140, 125, 0.2)' : '0 1px 3px rgba(35, 25, 60, 0.04)',
                    }}
                  >
                    <Sparkles size={15} />
                    Remediation &amp; Diff Comparison
                  </button>
                </div>

                {reviewResult.summary && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#58516B' }}>
                      Total Issues: <strong style={{ color: '#1A1626' }}>{reviewResult.summary.total_findings}</strong>
                    </span>
                    <span style={{ color: '#16A34A' }}>
                      &bull; {reviewResult.summary.resolved} Resolved
                    </span>
                    {reviewResult.summary.unresolved > 0 && (
                      <span style={{ color: '#DC2626' }}>
                        &bull; {reviewResult.summary.unresolved} Unresolved
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'findings' ? (
                <div className="workspace-findings-grid">
                  {/* Left Column: Structured Findings List */}
                  <div>
                    <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: '#1A1626' }}>
                      Detected Issues ({reviewResult.findings?.length || 0})
                    </h4>
                    <FindingsList
                      findings={reviewResult.findings}
                      selectedFindingId={selectedFinding?.id}
                      onSelectFinding={setSelectedFinding}
                      summary={reviewResult.summary}
                    />
                  </div>

                  {/* Right Column: Finding Explanation & Context */}
                  <div>
                    <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: '#1A1626' }}>
                      Issue Details &amp; Remediation Guidance
                    </h4>
                    <FindingDetail finding={selectedFinding} />
                  </div>
                </div>
              ) : (
                /* Diff Viewer (BEFORE / AFTER & Verification State) */
                <DiffViewer
                  originalCode={code}
                  fixedCode={reviewResult.fixed_code}
                  fixAvailable={reviewResult.fix_available}
                  verificationAvailable={reviewResult.verification_available}
                  warnings={reviewResult.warnings}
                  summary={reviewResult.summary}
                  findings={reviewResult.findings}
                  onSelectFinding={setSelectedFinding}
                  onApplyFix={handleApplyFix}
                />
              )}
            </div>
          )}

          {/* Bottom Trust & Architecture Bar (Warm & Clean) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8E2F2',
              fontSize: '0.825rem',
              color: '#58516B',
              boxShadow: '0 2px 8px rgba(35, 25, 60, 0.03)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                🛡️ <strong style={{ color: '#1A1626' }}>Semgrep &amp; Bandit</strong> AST Ground Truth
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                🤖 <strong style={{ color: '#1A1626' }}>3-Agent Gemini</strong> Sequential Pipeline
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                ⚡ <strong style={{ color: '#1A1626' }}>Empirical Re-Analysis</strong> Verification
              </span>
            </div>

            <div>
              Supported: <strong style={{ color: '#5E4F98' }}>Python, JS, TS, Java, C, C++, Go</strong>
            </div>
          </div>
        </div>
      </main>

      {/* Global Clean Minimal Footer */}
      <footer
        style={{
          borderTop: '1px solid #E8E2F2',
          padding: '1.5rem 0',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          zIndex: 10,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '0.8rem', color: '#88809E', overflowWrap: 'anywhere' }}>
            CodeGuard &bull; CodeNeeti Hackathon 2026 &bull; Antigravity Multi-Agent Architecture
          </span>
          <span style={{ fontSize: '0.8rem', color: '#88809E', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }}>
            Pipeline: Deterministic AST &rarr; AnalyzerAgent &rarr; FixAgent &rarr; VerifierAgent &bull; API Contract v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
