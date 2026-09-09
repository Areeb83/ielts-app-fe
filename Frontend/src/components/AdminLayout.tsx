import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom, isAuthLoadingAtom } from '../store/authStore';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAtomValue(userAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
