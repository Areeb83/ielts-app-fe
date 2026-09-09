import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userAtom, isAuthLoadingAtom } from '../store/authStore';
import authService from '../api/services/authService';
import { getAccessToken, clearTokens } from '../api/axiosInstance';

function useReturnTo() {
  const [searchParams] = useSearchParams();
  return searchParams.get('returnTo') || '/';
}

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const isLoading = useAtomValue(isAuthLoadingAtom);
  const setIsLoading = useSetAtom(isAuthLoadingAtom);
  const navigate = useNavigate();
  const returnTo = useReturnTo();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login(email, password);
      setUser(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : returnTo);
    },
    [setUser, navigate, returnTo]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authService.register(name, email, password);
      setUser(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : returnTo);
    },
    [setUser, navigate, returnTo]
  );

  const googleLogin = useCallback(
    async (credential: string) => {
      const res = await authService.googleAuth(credential);
      setUser(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : returnTo);
    },
    [setUser, navigate, returnTo]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  }, [setUser, navigate]);

  const hydrate = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    hydrate,
  };
}
