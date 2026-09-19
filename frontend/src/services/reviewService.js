/**
 * Review Service
 * Abstraction layer for CodeGuard API communication adhering strictly to API_CONTRACT.md.
 * In development / offline mode, serves mock fixtures with staged pipeline progression.
 */

import sampleReviewResult from '../mocks/sampleReviewResult.json';

export const MAX_CODE_BYTES = 100 * 1024; // 100 KB limit (DECISIONS.md & API_CONTRACT.md)

/**
 * Detect language from file extension or code content
 */
export function detectLanguage(filename = '', content = '') {
  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith('.py')) return 'python';
  if (lowerName.endsWith('.js') || lowerName.endsWith('.mjs') || lowerName.endsWith('.cjs')) return 'javascript';

  // Fallback to keyword heuristics if name is unknown
  if (content.includes('def ') || content.includes('import os') || content.includes('import sys') || content.includes('print(')) {
    return 'python';
  }
  if (content.includes('function ') || content.includes('const ') || content.includes('let ') || content.includes('console.log(')) {
    return 'javascript';
  }

  return 'python'; // Default fallback
}

/**
 * Validate file upload
 */
export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file provided' };

  const name = file.name.toLowerCase();
  const isPython = name.endsWith('.py');
  const isJS = name.endsWith('.js');

  if (!isPython && !isJS) {
    const ext = name.includes('.') ? `.${name.split('.').pop()}` : 'unknown';
    return {
      valid: false,
      error: `Unsupported file type '${ext}'. CodeGuard only analyzes Python (.py) and JavaScript (.js) files.`,
    };
  }

  if (file.size > MAX_CODE_BYTES) {
    const sizeKB = (file.size / 1024).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeKB} KB) exceeds the 100 KB limit. Please submit a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Sample vulnerable Python code fixture for quick demo loading
 */
export const SAMPLE_VULNERABLE_CODE = `import os
import sqlite3

DB_PASS = "super_secret_admin_password_123"

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # SQL Injection: Unsanitized input concatenation
    query = "SELECT * FROM users WHERE name = '" + username + "'"
    cursor.execute(query)
    return cursor.fetchall()

if __name__ == '__main__':
    user_input = "admin' OR '1'='1"
    print(get_user(user_input))
`;

/**
 * Execute code analysis
 * Supports stage progression callbacks for the 4 pipeline steps.
 */
export async function executeCodeReview(code, language, onStageChange) {
  // Step 1: Static Analysis
  if (onStageChange) onStageChange({ stage: 1, label: 'Running Semgrep & Bandit static analysis...' });
  await new Promise((r) => setTimeout(r, 650));

  // Step 2: Analyzer Agent
  if (onStageChange) onStageChange({ stage: 2, label: 'Gemini Analyzer: Explaining vulnerabilities and CWE mappings...' });
  await new Promise((r) => setTimeout(r, 750));

  // Step 3: Fix Agent
  if (onStageChange) onStageChange({ stage: 3, label: 'Gemini Fix Agent: Generating safe, minimal remediation...' });
  await new Promise((r) => setTimeout(r, 800));

  // Step 4: Verifier Agent
  if (onStageChange) onStageChange({ stage: 4, label: 'Gemini Verifier: Re-running static checks on remediated code...' });
  await new Promise((r) => setTimeout(r, 600));

  // Return the mock result conforming to API_CONTRACT.md
  return {
    ...sampleReviewResult,
    language: language === 'javascript' ? 'javascript' : 'python',
  };
}
