import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * FlowForge-Inspired Clean Horizontal Pill Navigation Bar
 * Reference: input_file_3.png
 * [ CODEGUARD ]   Machine Experience   Review Workspace   Reset   ● OPERATIONAL
 */
export default function Header({ onReset, onScrollToHero, onScrollToWorkspace, backendHealth }) {
  const isOnline = backendHealth?.status === 'ok';

  return (
    <header
      style={{
        position: 'sticky',
        top: '1.25rem',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 1rem',
        pointerEvents: 'none', // Allow clicking through outside the pill
      }}
    >
      <nav
        aria-label="Primary Navigation"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #E8E2F2',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem 0.5rem 1.25rem',
          boxShadow: '0 4px 24px rgba(35, 25, 60, 0.08), 0 1px 4px rgba(35, 25, 60, 0.04)',
          width: '100%',
          maxWidth: '960px',
        }}
      >
        {/* Brand: Clean, bold, developer-focused */}
        <div
          onClick={onScrollToHero || onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: '#5E4F98',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#FFFFFF',
              fontSize: '0.8rem',
              letterSpacing: '-0.02em',
            }}
          >
            CG
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.04em',
              color: '#1A1626',
            }}
          >
            CODEGUARD
          </span>
        </div>

        {/* Horizontal Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {onScrollToHero && (
            <button
              type="button"
              onClick={onScrollToHero}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#58516B',
                cursor: 'pointer',
                padding: '0.3rem 0.5rem',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#5E4F98')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#58516B')}
            >
              Machine Experience
            </button>
          )}

          {onScrollToWorkspace && (
            <button
              type="button"
              onClick={onScrollToWorkspace}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#58516B',
                cursor: 'pointer',
                padding: '0.3rem 0.5rem',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#5E4F98')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#58516B')}
            >
              Review Workspace
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#88809E',
                cursor: 'pointer',
                padding: '0.3rem 0.5rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#88809E')}
              title="Reset code and clear findings"
            >
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>

        {/* Right Status Pill: FlowForge-Style Operational Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.75rem',
            backgroundColor: isOnline ? '#ECFDF5' : '#F5F3FF',
            border: `1px solid ${isOnline ? '#A7F3D0' : '#DDD6FE'}`,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: isOnline ? '#059669' : '#6D28D9',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10B981' : '#7C3AED',
            }}
          />
          {isOnline ? 'OPERATIONAL' : 'MOCK MODE'}
        </div>
      </nav>
    </header>
  );
}
