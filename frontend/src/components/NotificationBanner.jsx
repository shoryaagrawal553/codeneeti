import React from 'react';

export default function NotificationBanner({ type = 'error', message, onDismiss }) {
  if (!message) return null;

  const isError = type === 'error';
  const isWarning = type === 'warning';

  const bgColor = isError
    ? 'rgba(239, 68, 68, 0.12)'
    : isWarning
    ? 'rgba(249, 115, 22, 0.12)'
    : 'rgba(99, 102, 241, 0.12)';

  const borderColor = isError
    ? 'rgba(239, 68, 68, 0.35)'
    : isWarning
    ? 'rgba(249, 115, 22, 0.35)'
    : 'rgba(99, 102, 241, 0.35)';

  const textColor = isError
    ? '#fca5a5'
    : isWarning
    ? '#fdba74'
    : '#a5b4fc';

  const icon = isError ? '✕' : isWarning ? '⚠' : 'ℹ';

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(12px)',
        color: textColor,
        fontSize: '0.875rem',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
        <span>{message}</span>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0.2rem',
            lineHeight: 1,
            borderRadius: '4px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      )}
    </div>
  );
}
