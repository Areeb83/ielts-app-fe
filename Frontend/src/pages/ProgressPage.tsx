import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { BookOpen, Clock, Trophy, Target, Headphones, BookText, PenLine, Eye, Loader2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { ListLoader } from '../components/ListLoader';
import { userAtom, isAuthLoadingAtom } from '../store/authStore';
import axiosInstance from '../api/axiosInstance';

interface ProgressStats {
  totalAttempts: number;
  avgBandScore: number;
  bestScore: number;
  totalTimeSpent: number;
  listening: { attempts: number; avgBand: number; bestBand: number };
  reading: { attempts: number; avgBand: number; bestBand: number };
  writing: { submissions: number; pending: number; graded: number; avgBand: number; bestBand: number };
}

interface AttemptEntry {
  id: string;
  testId: string;
  skill: string;
  displayName: string;
  bookNumber: number;
  testNumber: number;
  score: number;
  bandScore: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt: string;
  status?: string;
}

function formatTime(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  }
  const h = (seconds / 3600).toFixed(1);
  return `${h} hrs`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date}, ${time}`;
}

function formatTimeSpent(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ProgressPage() {
  const user = useAtomValue(userAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  const navigate = useNavigate();

  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [history, setHistory] = useState<AttemptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'listening' | 'reading' | 'writing'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleReview = async (attempt: AttemptEntry) => {
    setReviewingId(attempt.id);
    try {
      const { data } = await axiosInstance.get(`/attempts/${attempt.id}`);
      const full = data.data;
      const routeTestId = attempt.skill === 'reading'
        ? `book-${attempt.bookNumber}-test-${attempt.testNumber}`
        : attempt.testId;

      navigate(`/academic/${attempt.skill}/${routeTestId}/review`, {
        state: {
          testTitle: attempt.displayName,
          testType: attempt.skill,
          userAnswers: full.answers || {},
          scoreResult: {
            correct: full.score,
            total: 40,
            bandScore: full.bandScore,
            results: full.results || [],
          },
        },
      });
    } catch {
      toast.error('Failed to load review data');
    } finally {
      setReviewingId(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    const params: Record<string, string | number> = { page: currentPage, limit: 15 };
    if (activeTab !== 'all') params.skill = activeTab;

    setHistoryLoading(true);
    axiosInstance
      .get('/user/progress', { params })
      .then((res) => {
        setStats(res.data.data.stats);
        setHistory(res.data.data.history);
        setTotalPages(res.data.data.pagination.totalPages);
        setLoading(false);
        setHistoryLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load progress:', err);
        setLoading(false);
        setHistoryLoading(false);
      });
  }, [user, activeTab, currentPage]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading progress...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tests Taken',
      value: stats?.totalAttempts ?? 0,
      icon: Target,
      color: 'bg-orange-50 text-orange-500',
    },
    {
      label: 'Avg Band Score',
      value: stats?.avgBandScore ?? 0,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      label: 'Best Score',
      value: stats?.bestScore ?? 0,
      icon: Trophy,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Time Spent',
      value: formatTime(stats?.totalTimeSpent ?? 0),
      icon: Clock,
      color: 'bg-purple-50 text-purple-500',
    },
  ];

  const tabs = [
    { key: 'all' as const, label: 'All' },
    { key: 'listening' as const, label: 'Listening', icon: Headphones },
    { key: 'reading' as const, label: 'Reading', icon: BookText },
    { key: 'writing' as const, label: 'Writing', icon: PenLine },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Progress</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Skill Breakdown */}
        {stats && (stats.listening.attempts > 0 || stats.reading.attempts > 0 || stats.writing.submissions > 0) && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Headphones className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Listening</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-gray-900">{stats.listening.avgBand}</span>
                <span className="text-xs text-gray-500">avg</span>
                <span className="text-lg font-bold text-green-600">{stats.listening.bestBand}</span>
                <span className="text-xs text-gray-500">best</span>
                <span className="text-xs text-gray-400 ml-auto">{stats.listening.attempts} tests</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookText className="w-4 h-4 text-green-700" />
                <span className="text-sm font-semibold text-gray-700">Reading</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-gray-900">{stats.reading.avgBand}</span>
                <span className="text-xs text-gray-500">avg</span>
                <span className="text-lg font-bold text-green-600">{stats.reading.bestBand}</span>
                <span className="text-xs text-gray-500">best</span>
                <span className="text-xs text-gray-400 ml-auto">{stats.reading.attempts} tests</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="w-4 h-4 text-purple-700" />
                <span className="text-sm font-semibold text-gray-700">Writing</span>
              </div>
              <div className="flex items-baseline gap-3">
                {stats.writing.graded > 0 ? (
                  <>
                    <span className="text-lg font-bold text-gray-900">{stats.writing.avgBand}</span>
                    <span className="text-xs text-gray-500">avg</span>
                    <span className="text-lg font-bold text-green-600">{stats.writing.bestBand}</span>
                    <span className="text-xs text-gray-500">best</span>
                  </>
                ) : null}
                <span className="text-xs text-gray-400 ml-auto">
                  {stats.writing.pending > 0 ? `${stats.writing.pending} pending` : `${stats.writing.submissions} submitted`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* History List */}
          {historyLoading ? (
            <ListLoader />
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No tests taken yet</p>
              <p className="text-sm mt-1">Complete a test to see your results here</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-13 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">Test</div>
                <div className="col-span-2 text-center">Band Score</div>
                <div className="col-span-2 text-center">Correct</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-2 text-center">Date</div>
                <div className="col-span-2 text-center">Action</div>
              </div>

              {/* Rows */}
              {history.map((attempt, idx) => (
                <div
                  key={attempt.id}
                  className={`grid grid-cols-13 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors ${
                    idx < history.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Test Name */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      attempt.skill === 'listening' ? 'bg-orange-50'
                        : attempt.skill === 'writing' ? 'bg-purple-50'
                        : 'bg-green-50'
                    }`}>
                      {attempt.skill === 'listening'
                        ? <Headphones className="w-4 h-4 text-orange-500" />
                        : attempt.skill === 'writing'
                        ? <PenLine className="w-4 h-4 text-purple-700" />
                        : <BookText className="w-4 h-4 text-green-700" />
                      }
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{attempt.displayName}</div>
                      <div className="text-xs text-gray-400 capitalize md:hidden">{attempt.skill}</div>
                    </div>
                  </div>

                  {/* Band Score */}
                  <div className="col-span-3 md:col-span-2 text-center">
                    {attempt.skill === 'writing' && attempt.status === 'pending' ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : (
                      <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-bold ${
                        attempt.bandScore >= 7 ? 'bg-green-100 text-green-700'
                          : attempt.bandScore >= 5.5 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {attempt.bandScore}
                      </span>
                    )}
                  </div>

                  {/* Correct / Word count */}
                  <div className="col-span-3 md:col-span-2 text-center text-sm text-gray-700">
                    {attempt.skill === 'writing'
                      ? `${attempt.score} words`
                      : `${attempt.score}/${attempt.totalQuestions}`
                    }
                  </div>

                  {/* Time */}
                  <div className="col-span-3 md:col-span-2 text-center text-sm text-gray-500">
                    {formatTimeSpent(attempt.timeSpent)}
                  </div>

                  {/* Date */}
                  <div className="col-span-3 md:col-span-2 text-center text-sm text-gray-500">
                    {formatDate(attempt.submittedAt)}
                  </div>

                  {/* Review */}
                  <div className="col-span-12 md:col-span-2 text-center">
                    {attempt.skill !== 'writing' ? (
                      <button
                        onClick={() => handleReview(attempt)}
                        disabled={reviewingId === attempt.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {reviewingId === attempt.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Eye className="w-3.5 h-3.5" />
                        }
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {attempt.status === 'pending' ? 'Awaiting review' : 'Graded'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
