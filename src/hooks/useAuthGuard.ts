import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from '../store/authStore';

/**
 * Returns a guarded navigate function + modal state.
 * If user is not authenticated, opens a modal instead of navigating.
 * Call `guardedNavigate(path)` on button click.
 */
export function useAuthGuard() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const guardedNavigate = useCallback(
    (path: string) => {
      if (isAuthenticated) {
        navigate(path);
      } else {
        setPendingPath(path);
        setShowModal(true);
      }
    },
    [isAuthenticated, navigate]
  );

  const handleLogin = useCallback(() => {
    setShowModal(false);
    navigate(`/login?returnTo=${encodeURIComponent(pendingPath || '/')}`);
  }, [navigate, pendingPath]);

  const handleRegister = useCallback(() => {
    setShowModal(false);
    navigate(`/register?returnTo=${encodeURIComponent(pendingPath || '/')}`);
  }, [navigate, pendingPath]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setPendingPath(null);
  }, []);

  return {
    guardedNavigate,
    showAuthModal: showModal,
    onLogin: handleLogin,
    onRegister: handleRegister,
    onCloseModal: handleClose,
  };
}
