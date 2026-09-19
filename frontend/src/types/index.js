/**
 * Common types and constants matching API_CONTRACT.md v1.0.0
 */

export const SUPPORTED_LANGUAGES = [
  { id: 'auto', display_name: 'Auto-detect', extensions: [] },
  { id: 'python', display_name: 'Python', extensions: ['.py'] },
  { id: 'javascript', display_name: 'JavaScript', extensions: ['.js'] },
];

export const MAX_CODE_BYTES = 102400; // 100 KB limit from API_CONTRACT.md

export const SEVERITY_LEVELS = {
  Critical: { label: 'Critical', color: 'var(--severity-critical)', bg: 'var(--severity-critical-bg)', border: 'var(--severity-critical-border)' },
  High: { label: 'High', color: 'var(--severity-high)', bg: 'var(--severity-high-bg)', border: 'var(--severity-high-border)' },
  Medium: { label: 'Medium', color: 'var(--severity-medium)', bg: 'var(--severity-medium-bg)', border: 'var(--severity-medium-border)' },
  Low: { label: 'Low', color: 'var(--severity-low)', bg: 'var(--severity-low-bg)', border: 'var(--severity-low-border)' },
  Info: { label: 'Info', color: 'var(--severity-info)', bg: 'var(--severity-info-bg)', border: 'var(--severity-info-border)' },
};

export const VERIFICATION_STATUS = {
  Resolved: { label: 'Resolved', color: 'var(--status-resolved)', bg: 'var(--status-resolved-bg)' },
  Unresolved: { label: 'Unresolved', color: 'var(--severity-critical)', bg: 'var(--severity-critical-bg)' },
  Regression: { label: 'Regression', color: 'var(--severity-high)', bg: 'var(--severity-high-bg)' },
  Unavailable: { label: 'Unavailable', color: 'var(--text-muted)', bg: 'rgba(100, 116, 139, 0.15)' },
};

export const ERROR_CODES = {
  MISSING_CODE: 'Please enter or upload code before submitting.',
  CODE_TOO_LARGE: 'Code exceeds maximum size of 100 KB (102,400 bytes).',
  UNSUPPORTED_LANGUAGE: 'Selected language is not supported. Choose Python, JavaScript, or Auto-detect.',
  UNSUPPORTED_FILE_TYPE: 'Invalid file format. Only .py and .js files are accepted.',
  ANALYSIS_PARSE_ERROR: 'Failed to parse static analysis findings.',
  ANALYSIS_TOOL_ERROR: 'Static analysis engine encountered an unexpected error.',
  PIPELINE_ERROR: 'Internal pipeline review failure.',
  PIPELINE_TIMEOUT: 'The analysis pipeline timed out (exceeded 90s limit).',
  NETWORK_ERROR: 'Unable to reach backend server. Running in mock/offline mode.',
};
