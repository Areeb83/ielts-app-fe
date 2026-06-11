// ─── Route Path Constants ────────────────────────────────────────────────────
// All route patterns used in <Route> definitions

export const ROUTES = {
  HOME: '/',
  ACADEMIC: '/academic',
  GENERAL: '/general',
  PRICING: '/pricing',

  // Dynamic skill routes (use builder functions below for navigation)
  LISTENING: '/:examType/listening',
  LISTENING_TEST: '/:examType/listening/:testId',
  READING: '/:examType/reading',
  READING_TEST: '/:examType/reading/:testId',
  LISTENING_RESULT: '/:examType/listening/:testId/result',
  READING_RESULT: '/:examType/reading/:testId/result',
  LISTENING_REVIEW: '/:examType/listening/:testId/review',
  READING_REVIEW: '/:examType/reading/:testId/review',
  WRITING: '/:examType/writing',
  SPEAKING: '/:examType/speaking',
} as const;

// ─── Route Builder Functions ─────────────────────────────────────────────────
// Use these when navigating programmatically (e.g. navigate(...))

export const buildListeningRoute = (examType: string) =>
  `/${examType}/listening`;

export const buildListeningTestRoute = (examType: string, testId: string) =>
  `/${examType}/listening/${testId}`;

export const buildReadingRoute = (examType: string) =>
  `/${examType}/reading`;

export const buildReadingTestRoute = (examType: string, testId: string) =>
  `/${examType}/reading/${testId}`;

export const buildWritingRoute = (examType: string) =>
  `/${examType}/writing`;

export const buildSpeakingRoute = (examType: string) =>
  `/${examType}/speaking`;
