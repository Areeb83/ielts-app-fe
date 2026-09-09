import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, ListeningBooksResponse, ListeningBooksParams } from '../api/types';

export function useWritingBooks(examType: 'academic' | 'general', itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<ListeningBooksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(
    (page: number) => {
      setLoading(true);
      axiosInstance
        .get(`/writing/${examType}/books`, { params: { page, limit: itemsPerPage } })
        .then((res) => {
          setData(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    },
    [examType, itemsPerPage]
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
    books: data?.books ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? null,
    loading,
    error,
    currentPage,
    changePage,
    refetch,
  };
}
