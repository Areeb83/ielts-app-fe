// ─── Route Path Constants ────────────────────────────────────────────────────
// All route patterns used in <Route> definitions

export const ROUTES = {
  HOME: '/',
  ACADEMIC: '/academic',
  GENERAL: '/general',
  PRICING: '/pricing',

  // Dynamic skill routes (use builder functions below for navigation)
  LISTENING: '/:examType/listening',
  LISTENING_TEST: '/:examType/listening/:bookId/test/:testId',
  READING: '/:examType/reading',
  READING_TEST: '/:examType/reading/:bookId/test/:testId',
  WRITING: '/:examType/writing',
  SPEAKING: '/:examType/speaking',
} as const;

// ─── Route Builder Functions ─────────────────────────────────────────────────
// Use these when navigating programmatically (e.g. navigate(...))

export const buildListeningRoute = (examType: string) =>
  `/${examType}/listening`;

export const buildListeningTestRoute = (examType: string, bookId: string, testId: string) =>
  `/${examType}/listening/${bookId}/test/${testId}`;

export const buildReadingRoute = (examType: string) =>
  `/${examType}/reading`;

export const buildReadingTestRoute = (examType: string, bookId: string, testId: string) =>
  `/${examType}/reading/${bookId}/test/${testId}`;

export const buildWritingRoute = (examType: string) =>
  `/${examType}/writing`;

export const buildSpeakingRoute = (examType: string) =>
  `/${examType}/speaking`;
