// ─── Generic API Response Wrapper ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'premium' | 'pro';
  createdAt: string;
}

// ─── Listening Test Types ────────────────────────────────────────────────────
export interface ListeningTestResult {
  testNumber: number;
  bandScore: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
}

export interface BookData {
  id: string;
  number: number;
  title: string;
  tests: TestData[];
  totalTests: number;
  description?: string;
}

export interface TestData {
  id: string;
  testNumber: number;
  bookNumber: number;
  examType: 'academic' | 'general';
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  duration: number; // in minutes
  totalQuestions: number;
  sections: number;
  status: 'not_started' | 'in_progress' | 'completed';
  result?: ListeningTestResult;
  locked?: boolean;
}

export interface ListeningBooksResponse {
  books: BookData[];
  pagination: PaginatedResponse<BookData>;
  stats: {
    totalBooks: number;
    totalTests: number;
    completedTests: number;
    averageBandScore: number | null;
  };
}

// ─── Request Params ──────────────────────────────────────────────────────────
export interface ListeningBooksParams {
  examType: 'academic' | 'general';
  page?: number;
  limit?: number;
}

export interface StartTestParams {
  bookId: string;
  testId: string;
  examType: 'academic' | 'general';
}

export interface SubmitTestPayload {
  testId: string;
  answers: Record<number, string>;
  timeSpent: number; // in seconds
}

export interface SubmitTestResponse {
  bandScore: number;
  correctAnswers: number;
  totalQuestions: number;
  sectionScores: {
    section: number;
    correct: number;
    total: number;
  }[];
}
