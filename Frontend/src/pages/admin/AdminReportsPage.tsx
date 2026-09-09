import { useState, useEffect } from 'react';
import { Bug, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../../components/AdminLayout';
import { Pagination } from '../../components/Pagination';
import { ListLoader } from '../../components/ListLoader';
import axiosInstance from '../../api/axiosInstance';

interface ReportEntry {
  _id: string;
  user: { name: string; email: string };
  testId: string;
  reportType: string;
  questionNumber: string;
  description: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-500',
};

export function AdminReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [stats, setStats] = useState({ open: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('open');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<ReportEntry | null>(null);

  const fetchReports = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page: currentPage, limit: 15 };
    if (filter) params.status = filter;

    axiosInstance.get('/admin/reports', { params })
      .then((res) => {
        setReports(res.data.data.reports);
        setStats(res.data.data.stats);
        setTotalPages(res.data.data.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchReports(); }, [currentPage, filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/admin/reports/${id}/status`, { status });
      toast.success(`Report marked as ${status}`);
      setSelected(null);
      fetchReports();
    } catch { toast.error('Failed to update'); }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  if (selected) {
    return (
      <AdminLayout>
        <div className="p-8 max-w-3xl">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer">
            ← Back to list
          </button>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selected.reportType.replace('-', ' ')}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {selected.user.name} ({selected.user.email}) · {formatDate(selected.createdAt)}
            </p>
            {selected.testId && <p className="text-sm text-gray-600 mb-1"><strong>Test:</strong> {selected.testId}</p>}
            {selected.questionNumber && <p className="text-sm text-gray-600 mb-4"><strong>Question:</strong> {selected.questionNumber}</p>}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap mb-6">
              {selected.description}
            </div>
            <div className="flex gap-2">
              {selected.status !== 'resolved' && (
                <button onClick={() => handleUpdateStatus(selected._id, 'resolved')} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer">
                  <CheckCircle className="w-4 h-4" /> Resolve
                </button>
              )}
              {selected.status !== 'dismissed' && (
                <button onClick={() => handleUpdateStatus(selected._id, 'dismissed')} className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer">
                  <XCircle className="w-4 h-4" /> Dismiss
                </button>
              )}
              {selected.status !== 'reviewed' && selected.status === 'open' && (
                <button onClick={() => handleUpdateStatus(selected._id, 'reviewed')} className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Eye className="w-4 h-4" /> Mark Reviewed
                </button>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bugs Reported</h1>
        <p className="text-sm text-gray-500 mb-8">{stats.open} open · {stats.total} total</p>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {['open', 'reviewed', 'resolved', 'dismissed', ''].map((f) => (
            <button
              key={f || 'all'}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                filter === f ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <ListLoader />
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bug className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No reports found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {reports.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => setSelected(r)}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 capitalize">{r.reportType.replace('-', ' ')}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {r.user.name} · {r.testId || 'No test'} · {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </button>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
