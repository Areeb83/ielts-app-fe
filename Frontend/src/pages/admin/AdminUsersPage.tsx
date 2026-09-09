import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../../components/AdminLayout';
import { Pagination } from '../../components/Pagination';
import { ListLoader } from '../../components/ListLoader';
import axiosInstance from '../../api/axiosInstance';

interface UserEntry {
  id: string;
  name: string;
  email: string;
  plan: string;
  isBlocked: boolean;
  testsTaken: number;
  joinedAt: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Applied filters (what's actually used in the API call)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedPlan, setAppliedPlan] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page: currentPage, limit: 15 };
    if (appliedSearch) params.search = appliedSearch;
    if (appliedPlan) params.plan = appliedPlan;
    if (appliedStatus) params.status = appliedStatus;

    axiosInstance.get('/admin/users', { params })
      .then((res) => {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.totalItems);
        setLoading(false);
      })
      .catch(() => { setLoading(false); toast.error('Failed to load users'); });
  };

  useEffect(() => { fetchUsers(); }, [currentPage, appliedSearch, appliedPlan, appliedStatus]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedSearch(search);
    setAppliedPlan(planFilter);
    setAppliedStatus(statusFilter);
  };

  const handleResetFilters = () => {
    setSearch('');
    setPlanFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    setAppliedSearch('');
    setAppliedPlan('');
    setAppliedStatus('');
  };

  const handleChangePlan = async (userId: string, plan: string) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/plan`, { plan });
      toast.success('Plan updated');
      fetchUsers();
    } catch { toast.error('Failed to update plan'); }
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/block`);
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
            <p className="text-sm text-gray-500">{totalItems} registered users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Apply
          </button>
          {(appliedSearch || appliedPlan || appliedStatus) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <ListLoader />
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-center px-3 py-3">Plan</th>
                    <th className="text-center px-3 py-3">Tests</th>
                    <th className="text-center px-3 py-3">Status</th>
                    <th className="text-center px-3 py-3">Joined</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <select
                          value={u.plan}
                          onChange={(e) => handleChangePlan(u.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${
                            u.plan === 'pro' ? 'bg-orange-100 text-orange-700'
                              : u.plan === 'premium' ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="text-center px-3 py-3 text-sm text-gray-700">{u.testsTaken}</td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-sm text-gray-500">{formatDate(u.joinedAt)}</td>
                      <td className="text-right px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                          >
                            {u.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
