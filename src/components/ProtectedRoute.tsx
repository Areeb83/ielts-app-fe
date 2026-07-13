import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom, isAuthLoadingAtom } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isLoading = useAtomValue(isAuthLoadingAtom);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
