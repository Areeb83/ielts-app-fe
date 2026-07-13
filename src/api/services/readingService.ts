import axiosInstance from '../axiosInstance';
import { ENDPOINTS } from '../endpoints';
import { validateExamType, validatePagination, validateId } from '../validators';
import type {
  ApiResponse,
  ListeningBooksResponse,
  ListeningBooksParams,
  SubmitTestPayload,
  SubmitTestResponse,
} from '../types';

const readingService = {
  async getBooks(params: ListeningBooksParams): Promise<ApiResponse<ListeningBooksResponse>> {
    validateExamType(params.examType);
    validatePagination(params.page, params.limit);

    const { data } = await axiosInstance.get<ApiResponse<ListeningBooksResponse>>(
      ENDPOINTS.READING.BOOKS(params.examType),
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 6,
        },
      }
    );
    return data;
  },

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
      ENDPOINTS.READING.SUBMIT_TEST(examType, bookId, testId),
      payload
    );
    return data;
  },
};

export default readingService;
