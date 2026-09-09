import { useState, useCallback, useRef, useEffect } from 'react';
import type { AxiosError } from 'axios';
import type { ApiError } from '../api/types';

/**
 * Generic hook for async API operations.
 *
 * Returns { data, loading, error, execute, reset }
 *
 *   const { data, loading, error, execute } = useApi(someServiceMethod);
 *
 * Call execute(...args) to trigger the request.
 * Automatically handles loading / error state.
 */
export function useApi<TArgs extends unknown[], TResult>(
  apiFn: (...args: TArgs) => Promise<TResult>
) {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFn(...args);

        if (mountedRef.current) {
          setData(result);
        }
        return result;
      } catch (err) {
        const axiosErr = err as AxiosError<ApiError>;
        const message =
          axiosErr.response?.data?.message ||
          axiosErr.message ||
          'An unexpected error occurred';

        if (mountedRef.current) {
          setError(message);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
