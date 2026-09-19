import React from 'react';
import { CheckCircle2, Loader2, Circle, ShieldCheck, Terminal, Sparkles, Cpu } from 'lucide-react';

const STAGES = [
  {
    id: 'scan',
    label: 'SCAN',
    title: 'Deterministic Static Scan',
    subtitle: 'Semgrep & Bandit AST pattern matching',
    icon: Terminal,
  },
  {
    id: 'understand',
    label: 'UNDERSTAND',
    title: 'Contextual AI Understanding',
    subtitle: 'Gemini AnalyzerAgent risk calibration & CWE triage',
    icon: Cpu,
  },
  {
    id: 'fix',
    label: 'FIX',
    title: 'Unified Code Repair',
    subtitle: 'Gemini FixAgent targeted minimal syntax remediation',
    icon: Sparkles,
  },
  {
    id: 'verify',
    label: 'VERIFY',
    title: 'Empirical Proof Verification',
    subtitle: 'Gemini VerifierAgent re-scans fix with static tools',
    icon: ShieldCheck,
  },
];

export default function PipelineProgress({ currentStageIndex = 0 }) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E2F2',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(35, 25, 60, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: '#EDE8F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5E4F98',
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1A1626' }}>
              Analysis Pipeline in Progress
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#58516B' }}>
              Deterministic AST Scan &rarr; Contextual Analysis &rarr; Code Repair &rarr; Empirical Verification
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#5E4F98',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#EDE8F8',
            borderRadius: '9999px',
            border: '1px solid #D8CFEA',
          }}
        >
          <span>STAGE {Math.min(currentStageIndex + 1, 4)} OF 4</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: isActive
                  ? '#FAF8FD'
                  : isDone
                  ? '#F7FDF9'
                  : '#FAF8FD',
                border: `1px solid ${
                  isActive
                    ? '#5E4F98'
                    : isDone
                    ? '#86EFAC'
                    : '#E8E2F2'
                }`,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: '#16A34A' }} />
                ) : isActive ? (
                  <Loader2 size={16} style={{ color: '#5E4F98', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Circle size={16} style={{ color: '#C8BFDB' }} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isActive ? '#5E4F98' : isDone ? '#16A34A' : '#88809E',
                      backgroundColor: isActive ? '#EDE8F8' : isDone ? '#DCFCE7' : '#EDE8F8',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                    }}
                  >
                    {stage.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1A1626',
                    }}
                  >
                    {stage.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#58516B', lineHeight: 1.35 }}>
                  {stage.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
