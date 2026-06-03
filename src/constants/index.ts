// ─── App-wide Constants ──────────────────────────────────────────────────────

export const APP_NAME = 'Orange IELTS';

// Exam types
export const EXAM_TYPES = {
  ACADEMIC: 'academic',
  GENERAL: 'general',
} as const;

export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];

// Exam labels (display text)
export const EXAM_LABELS: Record<ExamType, string> = {
  [EXAM_TYPES.ACADEMIC]: 'Academic',
  [EXAM_TYPES.GENERAL]: 'General Training',
};

// Test durations (in minutes)
export const TEST_DURATIONS = {
  LISTENING: 30,
  READING: 60,
  WRITING: 60,
  SPEAKING: 15,
} as const;

// External asset URLs
export const ASSETS = {
  IELTS_LOGO: 'https://d2snzxottmona5.cloudfront.net/releases/3.58.1/images/logo/ielts.svg',
} as const;

// Re-export routes for convenience
export * from './routes';
