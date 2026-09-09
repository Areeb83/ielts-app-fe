import axiosInstance from '../axiosInstance';
import { ENDPOINTS } from '../endpoints';
import { validateExamType, validatePagination, validateId } from '../validators';
import type {
  ApiResponse,
  ListeningBooksResponse,
  ListeningBooksParams,
  TestData,
  SubmitTestPayload,
  SubmitTestResponse,
} from '../types';

/**
 * Listening Tests API Service
 *
 * Provides methods for fetching book/test data,
 * starting tests, and submitting answers.
 */
const listeningService = {
  /**
   * Fetch all listening books with pagination and user progress.
   */
  async getBooks(params: ListeningBooksParams): Promise<ApiResponse<ListeningBooksResponse>> {
    // Validate inputs before making the request
    validateExamType(params.examType);
    validatePagination(params.page, params.limit);

    const { data } = await axiosInstance.get<ApiResponse<ListeningBooksResponse>>(
      ENDPOINTS.LISTENING.BOOKS(params.examType),
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 6,
        },
      }
    );
    return data;
  },

  /**
   * Fetch details for a specific test.
   */
  async getTestDetail(
    examType: string,
    bookId: string,
    testId: string
  ): Promise<ApiResponse<TestData>> {
    validateExamType(examType);
    validateId(bookId, 'bookId');
    validateId(testId, 'testId');

    const { data } = await axiosInstance.get<ApiResponse<TestData>>(
      ENDPOINTS.LISTENING.TEST_DETAIL(examType, bookId, testId)
    );
    return data;
  },

  /**
   * Start a listening test (creates a test session on the backend).
   */
  async startTest(
    examType: string,
    bookId: string,
    testId: string
  ): Promise<ApiResponse<{ sessionId: string; expiresAt: string }>> {
    validateExamType(examType);
    validateId(bookId, 'bookId');
    validateId(testId, 'testId');

    const { data } = await axiosInstance.post<
      ApiResponse<{ sessionId: string; expiresAt: string }>
    >(ENDPOINTS.LISTENING.START_TEST(examType, bookId, testId));
    return data;
  },

  /**
   * Submit answers for a listening test.
   */
  async submitTest(
    examType: string,
    bookId: string,
    testId: string,
    payload: SubmitTestPayload
  ): Promise<ApiResponse<SubmitTestResponse>> {
    validateExamType(examType);
    validateId(bookId, 'bookId');
    validateId(testId, 'testId');

    const { data } = await axiosInstance.post<ApiResponse<SubmitTestResponse>>(
      ENDPOINTS.LISTENING.SUBMIT_TEST(examType, bookId, testId),
      payload
    );
    return data;
  },
};

export default listeningService;
