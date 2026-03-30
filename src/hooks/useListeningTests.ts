import { useState, useEffect, useCallback } from 'react';
import listeningService from '../api/services/listeningService';
import { useApi } from './useApi';
import type {
  ApiResponse,
  ListeningBooksResponse,
  ListeningBooksParams,
  SubmitTestPayload,
  SubmitTestResponse,
} from '../api/types';

/**
 * Hook to fetch listening books with pagination.
 *
 * Usage:
 *   const { books, stats, pagination, loading, error, changePage } =
 *     useListeningBooks('academic');
 */
export function useListeningBooks(examType: 'academic' | 'general', itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error, execute } = useApi<
    [ListeningBooksParams],
    ApiResponse<ListeningBooksResponse>
  >(listeningService.getBooks);

  const fetchBooks = useCallback(
    (page: number) => {
      execute({ examType, page, limit: itemsPerPage });
    },
    [examType, itemsPerPage, execute]
  );

  // Fetch on mount and when page / examType changes
  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, fetchBooks]);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refetch = useCallback(() => {
    fetchBooks(currentPage);
  }, [currentPage, fetchBooks]);

  return {
    books: data?.data?.books ?? [],
    stats: data?.data?.stats ?? null,
    pagination: data?.data?.pagination ?? null,
    loading,
    error,
    currentPage,
    changePage,
    refetch,
  };
}

/**
 * Hook to start a listening test.
 */
export function useStartTest() {
  const { data, loading, error, execute } = useApi(listeningService.startTest);

  const startTest = useCallback(
    (examType: string, bookId: string, testId: string) => {
      return execute(examType, bookId, testId);
    },
    [execute]
  );

  return {
    session: data?.data ?? null,
    loading,
    error,
    startTest,
  };
}

/**
 * Hook to submit a listening test.
 */
export function useSubmitTest() {
  const { data, loading, error, execute } = useApi(listeningService.submitTest);

  const submitTest = useCallback(
    (examType: string, bookId: string, testId: string, payload: SubmitTestPayload) => {
      return execute(examType, bookId, testId, payload);
    },
    [execute]
  );

  return {
    result: data?.data ?? null,
    loading,
    error,
    submitTest,
  };
}
