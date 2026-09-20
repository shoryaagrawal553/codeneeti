/**
 * CodeGuard API Client & Mock Service
 * Conforms strictly to API_CONTRACT.md Version 1.0.0
 */

import sampleReviewResult from '../mocks/sampleReviewResult.json';
import { MAX_CODE_BYTES, ERROR_CODES } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
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
      languages: SUPPORTED_LANGUAGES.filter((l) => l.id !== 'auto'),
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
      languages: SUPPORTED_LANGUAGES.filter((l) => l.id !== 'auto'),
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

  // Client-side guard 3: Filename extension validation across all 7 supported languages
  if (filename) {
    const lowerName = filename.toLowerCase();
    const validExtensions = [
      '.py', '.pyw',
      '.js', '.jsx', '.mjs', '.cjs',
      '.ts', '.tsx', '.mts', '.cts',
      '.java',
      '.c', '.h',
      '.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx',
      '.go',
    ];
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
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

    let data = {};
    try {
      data = await response.json();
    } catch {
      // Non-JSON response (e.g. HTML 502/504 error from proxy/host)
    }

    console.debug('[CodeGuard] POST /analyze response:', response.status, data);

    if (!response.ok) {
      const serverMessage = data.message || data.detail || (response.status === 404 ? 'API route not found (404). Check backend URL.' : response.status === 503 || response.status === 502 ? 'Backend service is starting up (cold start). Please wait 60 seconds and try again.' : null);
      console.error('[CodeGuard] Backend error:', response.status, data);
      throw new ApiError(
        data.error || 'PIPELINE_ERROR',
        serverMessage || `Server returned HTTP ${response.status}. Check Render backend logs.`,
        response.status,
        data.partial_result || null
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    console.error('[CodeGuard] Network/fetch error:', err);

    if (USE_MOCKS) {
      console.warn('[CodeGuard API] Serving mock fixture:', err.message);
      await simulateNetworkDelay(900);
      return sampleReviewResult;
    }

    throw new ApiError(
      'NETWORK_ERROR',
      `Cannot reach backend (${err.message || 'network error'}). Check that VITE_API_URL is set correctly in Render and backend is running.`,
      503
    );
  }
}

function simulateNetworkDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
