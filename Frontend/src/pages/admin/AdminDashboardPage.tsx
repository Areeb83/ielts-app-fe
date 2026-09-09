import { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, PenLine, Bug, UserPlus, ClipboardCheck, AlertTriangle, FileText } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Pagination } from '../../components/Pagination';
import { ListLoader } from '../../components/ListLoader';
import axiosInstance from '../../api/axiosInstance';

interface DashboardStats {
  totalUsers: number;
  totalAttempts: number;
  pendingWriting: number;
  gradedWriting: number;
  openReports: number;
}

interface ActivityItem {
  type: 'signup' | 'test' | 'writing' | 'report';
  message: string;
  time: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const activityIcons: Record<string, { icon: typeof Users; color: string; bg: string }> = {
  signup: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  test: { icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
  writing: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  report: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const initialLoad = useRef(true);

  // Initial load — fetch stats + activity
  useEffect(() => {
    axiosInstance.get('/admin/dashboard', { params: { page: 1, limit: 15 } })
      .then((res) => {
        setStats(res.data.data.stats);
        setActivity(res.data.data.activity);
        setTotalPages(res.data.data.pagination.totalPages);
        setPageLoading(false);
        initialLoad.current = false;
      })
      .catch(() => setPageLoading(false));
  }, []);

  // Pagination change — only reload activity
  useEffect(() => {
    if (initialLoad.current) return;
    setActivityLoading(true);
    axiosInstance.get('/admin/dashboard', { params: { page: currentPage, limit: 15 } })
      .then((res) => {
        setActivity(res.data.data.activity);
        setTotalPages(res.data.data.pagination.totalPages);
        setActivityLoading(false);
      })
      .catch(() => setActivityLoading(false));
  }, [currentPage]);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Tests Taken', value: stats.totalAttempts, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Writing Pending', value: stats.pendingWriting, icon: PenLine, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Bugs Open', value: stats.openReports, icon: Bug, color: 'text-red-500', bg: 'bg-red-50' },
  ] : [];

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Overview of your platform</p>

        {pageLoading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>

              {activityLoading ? (
                <ListLoader />
              ) : activity.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No activity yet</div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {activity.map((item, idx) => {
                      const config = activityIcons[item.type] || activityIcons.test;
                      const Icon = config.icon;
                      return (
                        <div key={idx} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{item.message}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(item.time)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
