/**
 * Centralised API endpoint constants.
 * Using a single source of truth avoids scattered magic strings.
 */

export const ENDPOINTS = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  // ─── Listening Tests ─────────────────────────────────────────────────────
  LISTENING: {
    BOOKS: (examType: string) => `/listening/${examType}/books`,
    TEST_DETAIL: (examType: string, bookId: string, testId: string) =>
      `/listening/${examType}/books/${bookId}/tests/${testId}`,
    START_TEST: (examType: string, bookId: string, testId: string) =>
      `/listening/${examType}/books/${bookId}/tests/${testId}/start`,
    SUBMIT_TEST: (examType: string, bookId: string, testId: string) =>
      `/listening/${examType}/books/${bookId}/tests/${testId}/submit`,
    USER_RESULTS: (examType: string) => `/listening/${examType}/results`,
  },

  // ─── Reading Tests ───────────────────────────────────────────────────────
  READING: {
    BOOKS: (examType: string) => `/reading/${examType}/books`,
    TEST_DETAIL: (examType: string, bookId: string, testId: string) =>
      `/reading/${examType}/books/${bookId}/tests/${testId}`,
    SUBMIT_TEST: (examType: string, bookId: string, testId: string) =>
      `/reading/${examType}/books/${bookId}/tests/${testId}/submit`,
    USER_RESULTS: (examType: string) => `/reading/${examType}/results`,
  },

  // ─── Writing Tests ───────────────────────────────────────────────────────
  WRITING: {
    BOOKS: (examType: string) => `/writing/${examType}/books`,
  },

  // ─── Speaking Tests ──────────────────────────────────────────────────────
  SPEAKING: {
    BOOKS: (examType: string) => `/speaking/${examType}/books`,
  },

  // ─── User / Profile ──────────────────────────────────────────────────────
  USER: {
    PROFILE: '/user/profile',
    PROGRESS: '/user/progress',
    SETTINGS: '/user/settings',
  },
} as const;
