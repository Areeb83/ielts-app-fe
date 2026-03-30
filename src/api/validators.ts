/**
 * Runtime validation helpers for API request parameters.
 * These run before requests are sent to catch issues early.
 */

export class ValidationError extends Error {
  public field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// ─── Exam-Type Validation ────────────────────────────────────────────────────
const VALID_EXAM_TYPES = ['academic', 'general'] as const;
type ExamType = (typeof VALID_EXAM_TYPES)[number];

export function validateExamType(value: unknown): asserts value is ExamType {
  if (typeof value !== 'string' || !VALID_EXAM_TYPES.includes(value as ExamType)) {
    throw new ValidationError(
      'examType',
      `Invalid exam type "${value}". Must be one of: ${VALID_EXAM_TYPES.join(', ')}`
    );
  }
}

// ─── Pagination Validation ──────────────────────────────────────────────────
export function validatePagination(page?: number, limit?: number) {
  if (page !== undefined) {
    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationError('page', 'Page must be a positive integer');
    }
  }
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('limit', 'Limit must be an integer between 1 and 100');
    }
  }
}

// ─── Answers Validation ─────────────────────────────────────────────────────
export function validateAnswers(answers: Record<number, string>, totalQuestions: number) {
  const questionNumbers = Object.keys(answers).map(Number);

  if (questionNumbers.length === 0) {
    throw new ValidationError('answers', 'At least one answer must be provided');
  }

  for (const num of questionNumbers) {
    if (!Number.isInteger(num) || num < 1 || num > totalQuestions) {
      throw new ValidationError(
        'answers',
        `Question number ${num} is out of range (1-${totalQuestions})`
      );
    }
  }
}

// ─── ID Validation ──────────────────────────────────────────────────────────
export function validateId(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(fieldName, `${fieldName} is required and must be a non-empty string`);
  }
}
