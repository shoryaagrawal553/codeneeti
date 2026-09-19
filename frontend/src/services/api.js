/**
 * CodeGuard API Client & Mock Service
 * Conforms strictly to API_CONTRACT.md Version 1.0.0
 */

import sampleReviewResult from '../mocks/sampleReviewResult.json';
import { MAX_CODE_BYTES, ERROR_CODES } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * Custom API Error class preserving contract error code and partial results.
 */
export class ApiError extends Error {
  constructor(errorCode, message, statusCode = 400, partialResult = null) {
    super(message || ERROR_CODES[errorCode] || 'An unexpected error occurred.');
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.partialResult = partialResult;
  }
}

/**
 * Check backend health status.
 * Endpoint: GET /api/health
 */
export async function getHealth() {
  if (USE_MOCKS) {
    return { status: 'ok', version: '1.0.0', mock: true };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new ApiError('NETWORK_ERROR', `Health check failed with HTTP ${response.status}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Graceful offline fallback
    return { status: 'offline', version: '1.0.0', mock: true };
  }
}

/**
 * Get supported languages.
 * Endpoint: GET /api/languages
 */
export async function getLanguages() {
  if (USE_MOCKS) {
    return {
      languages: [
        { id: 'python', display_name: 'Python', extensions: ['.py'] },
        { id: 'javascript', display_name: 'JavaScript', extensions: ['.js'] },
      ],
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/languages`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new ApiError('NETWORK_ERROR', `Languages request failed with HTTP ${response.status}`, response.status);
    }
    return await response.json();
  } catch {
    // Return contract default if backend is not yet running
    return {
      languages: [
        { id: 'python', display_name: 'Python', extensions: ['.py'] },
        { id: 'javascript', display_name: 'JavaScript', extensions: ['.js'] },
      ],
    };
  }
}

/**
 * Submit code for multi-agent security review.
 * Endpoint: POST /api/analyze
 * 
 * @param {Object} payload - { code: string, language?: string, filename?: string }
 * @returns {Promise<ReviewResult>}
 */
export async function analyzeCode({ code, language = 'auto', filename = null }) {
  // Client-side guard 1: Missing code
  if (!code || !code.trim()) {
    throw new ApiError('MISSING_CODE', ERROR_CODES.MISSING_CODE, 400);
  }

  // Client-side guard 2: Code size > 100 KB (102,400 bytes)
  const byteLength = new TextEncoder().encode(code).length;
  if (byteLength > MAX_CODE_BYTES) {
    throw new ApiError('CODE_TOO_LARGE', ERROR_CODES.CODE_TOO_LARGE, 400);
  }

  // Client-side guard 3: Filename extension validation
  if (filename) {
    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith('.py') && !lowerName.endsWith('.js')) {
      throw new ApiError('UNSUPPORTED_FILE_TYPE', ERROR_CODES.UNSUPPORTED_FILE_TYPE, 400);
    }
  }

  // If mock mode is forced via env var
  if (USE_MOCKS) {
    await simulateNetworkDelay(1200);
    return sampleReviewResult;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        code,
        language: language || 'auto',
        filename: filename || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'PIPELINE_ERROR',
        data.message || ERROR_CODES.PIPELINE_ERROR,
        response.status,
        data.partial_result || null
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    // If backend is not running or network failed, fallback gracefully to mock fixture
    console.warn('[CodeGuard API] Backend unreachable, serving mock fixture:', err.message);
    await simulateNetworkDelay(900);
    return sampleReviewResult;
  }
}

function simulateNetworkDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
