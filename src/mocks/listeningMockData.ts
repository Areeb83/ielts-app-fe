/**
 * Mock data for IELTS Listening API.
 * This file provides realistic dummy data that mirrors what the backend
 * API would return. Used by the mock interceptor during development.
 */
import type {
  BookData,
  ListeningBooksResponse,
  ApiResponse,
  SubmitTestResponse,
} from '../api/types';

// ─── Helper ──────────────────────────────────────────────────────────────────
const timestamp = () => new Date().toISOString();

// ─── Completed Test Results (simulates user progress) ────────────────────────
const userResults: Record<string, Record<number, { bandScore: number; correct: number; completedAt: string }>> = {
  'book-11': {
    1: { bandScore: 9, correct: 32, completedAt: '2026-03-15T10:30:00Z' },
    3: { bandScore: 6.5, correct: 27, completedAt: '2026-03-18T14:20:00Z' },
  },
  'book-12': {
    2: { bandScore: 8.0, correct: 35, completedAt: '2026-03-20T09:00:00Z' },
  },
  'book-15': {
    1: { bandScore: 7.0, correct: 30, completedAt: '2026-03-22T11:15:00Z' },
    4: { bandScore: 7.5, correct: 33, completedAt: '2026-03-25T16:45:00Z' },
  },
};

// ─── Build Book Data ─────────────────────────────────────────────────────────
function generateBooks(examType: 'academic' | 'general'): BookData[] {
  const bookNumbers = [11, 12, 13, 14, 15, 16, 17, 18, 19];

  return bookNumbers.map((num) => {
    const bookId = `book-${num}`;
    const results = userResults[bookId] || {};

    return {
      id: bookId,
      number: num,
      title: `Cambridge IELTS ${num}`,
      totalTests: 4,
      description: `Official Cambridge IELTS ${num} practice tests for the ${examType} module`,
      tests: [1, 2, 3, 4].map((testNum) => {
        const result = results[testNum];
        return {
          id: `${bookId}-test-${testNum}`,
          testNumber: testNum,
          bookNumber: num,
          examType,
          skill: 'listening' as const,
          duration: 30,
          totalQuestions: 40,
          sections: 4,
          status: result ? ('completed' as const) : ('not_started' as const),
          result: result
            ? {
              testNumber: testNum,
              bandScore: result.bandScore,
              correctAnswers: result.correct,
              totalQuestions: 40,
              completedAt: result.completedAt,
            }
            : undefined,
        };
      }),
    };
  });
}

// ─── Public Mock Generators ──────────────────────────────────────────────────

export function getMockListeningBooks(
  examType: 'academic' | 'general',
  page: number = 1,
  limit: number = 6
): ApiResponse<ListeningBooksResponse> {
  const allBooks = generateBooks(examType);
  const startIndex = (page - 1) * limit;
  const paginatedBooks = allBooks.slice(startIndex, startIndex + limit);

  const completedCount = allBooks.reduce(
    (acc, book) => acc + book.tests.filter((t) => t.status === 'completed').length,
    0
  );

  const allScores = allBooks
    .flatMap((b) => b.tests)
    .filter((t) => t.result)
    .map((t) => t.result!.bandScore);

  const avgScore =
    allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
      : null;

  return {
    success: true,
    timestamp: timestamp(),
    data: {
      books: paginatedBooks,
      pagination: {
        items: paginatedBooks,
        currentPage: page,
        totalPages: Math.ceil(allBooks.length / limit),
        totalItems: allBooks.length,
        itemsPerPage: limit,
      },
      stats: {
        totalBooks: allBooks.length,
        totalTests: allBooks.length * 4,
        completedTests: completedCount,
        averageBandScore: avgScore,
      },
    },
  };
}

export function getMockSubmitResult(): ApiResponse<SubmitTestResponse> {
  const bandScore = Number((Math.random() * 3 + 6).toFixed(1)); // 6.0 – 9.0
  const correct = Math.floor(bandScore * 4.2);

  return {
    success: true,
    timestamp: timestamp(),
    data: {
      bandScore,
      correctAnswers: correct,
      totalQuestions: 40,
      sectionScores: [1, 2, 3, 4].map((section) => ({
        section,
        correct: Math.floor(correct / 4) + (section <= correct % 4 ? 1 : 0),
        total: 10,
      })),
    },
  };
}
