import { useState, useEffect, useCallback } from 'react';
import readingService from '../api/services/readingService';
import { useApi } from './useApi';
import type {
  ApiResponse,
  ListeningBooksResponse,
  ListeningBooksParams,
} from '../api/types';

export function useReadingBooks(examType: 'academic' | 'general', itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error, execute } = useApi<
    [ListeningBooksParams],
    ApiResponse<ListeningBooksResponse>
  >(readingService.getBooks);

  const fetchBooks = useCallback(
    (page: number) => {
      execute({ examType, page, limit: itemsPerPage });
    },
    [examType, itemsPerPage, execute]
  );

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
