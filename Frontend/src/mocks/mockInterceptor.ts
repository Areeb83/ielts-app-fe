/**
 * Axios Mock Interceptor
 *
 * Intercepts API calls and returns mock data during development.
 * This allows the frontend to be developed independently of the backend.
 *
 * Set VITE_USE_MOCK_API=true in your .env to enable.
 * When disabled, real API calls pass through normally.
 */
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { getMockListeningBooks, getMockSubmitResult } from './listeningMockData';

// Simulate network delay (ms)
const MOCK_DELAY_MIN = 300;
const MOCK_DELAY_MAX = 800;

function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN)) + MOCK_DELAY_MIN;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createMockResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  };
}

/**
 * Register the mock interceptor on the global axios instance.
 * Call this once at app initialisation (e.g. in main.tsx).
 */
export function setupMockInterceptor(): void {
  axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const method = config.method?.toLowerCase() || 'get';

    // ── Listening Books ────────────────────────────────────────────────
    const listeningBooksMatch = url.match(/^\/listening\/(academic|general)\/books$/);
    if (listeningBooksMatch && method === 'get') {
      const examType = listeningBooksMatch[1] as 'academic' | 'general';
      const page = Number(config.params?.page) || 1;
      const limit = Number(config.params?.limit) || 6;

      await randomDelay();

      const mockData = getMockListeningBooks(examType, page, limit);

      if (import.meta.env.DEV) {
        console.log('🎭 [Mock API]', method.toUpperCase(), url, { page, limit });
      }

      // We throw a "cancel" with the response so axios doesn't actually
      // send a network request. The response interceptor below catches it.
      return Promise.reject({
        __isMockResponse: true,
        response: createMockResponse(config, mockData),
      });
    }

    // ── Start Test ─────────────────────────────────────────────────────
    const startTestMatch = url.match(
      /^\/listening\/(academic|general)\/books\/([^/]+)\/tests\/([^/]+)\/start$/
    );
    if (startTestMatch && method === 'post') {
      await randomDelay();

      const mockData = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          sessionId: `session-${Date.now()}`,
          expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        },
      };

      if (import.meta.env.DEV) {
        console.log('🎭 [Mock API]', method.toUpperCase(), url);
      }

      return Promise.reject({
        __isMockResponse: true,
        response: createMockResponse(config, mockData),
      });
    }

    // ── Submit Test ────────────────────────────────────────────────────
    const submitTestMatch = url.match(
      /^\/listening\/(academic|general)\/books\/([^/]+)\/tests\/([^/]+)\/submit$/
    );
    if (submitTestMatch && method === 'post') {
      await randomDelay();
      const mockData = getMockSubmitResult();

      if (import.meta.env.DEV) {
        console.log('🎭 [Mock API]', method.toUpperCase(), url);
      }

      return Promise.reject({
        __isMockResponse: true,
        response: createMockResponse(config, mockData),
      });
    }

    // No mock match – let the request pass through
    return config;
  });

  // Catch the mock "rejections" and turn them into successful responses
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.__isMockResponse) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );

  if (import.meta.env.DEV) {
    console.log('🎭 Mock API interceptor registered');
  }
}
