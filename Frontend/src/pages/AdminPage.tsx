import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { ClipboardCopy, Check, ChevronLeft, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { userAtom } from '../store/authStore';
import { AdminLayout } from '../components/AdminLayout';
import { Pagination } from '../components/Pagination';
import { ListLoader } from '../components/ListLoader';
import axiosInstance from '../api/axiosInstance';

interface TaskInSubmission {
  _id: string;
  taskNumber: number;
  prompt: string;
  response: string;
  wordCount: number;
  bandScore?: number;
  feedback?: {
    taskAchievement: number;
    coherence: number;
    lexicalResource: number;
    grammar: number;
    comments: string;
  };
}

interface Submission {
  _id: string;
  user: { name: string; email: string };
  testId: string;
  tasks: TaskInSubmission[];
  status: 'pending' | 'graded';
  bandScore?: number;
  submittedAt: string;
  gradedAt?: string;
}

export function AdminPage() {
  const user = useAtomValue(userAtom);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ pending: 0, graded: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('pending');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [grading, setGrading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Per-task grade forms: { [taskNumber]: { ta, cc, lr, gra, comments } }
  interface TaskGrade { ta: string; cc: string; lr: string; gra: string; comments: string; }
  const [taskGrades, setTaskGrades] = useState<Record<number, TaskGrade>>({
    1: { ta: '', cc: '', lr: '', gra: '', comments: '' },
    2: { ta: '', cc: '', lr: '', gra: '', comments: '' },
  });

  const updateTaskGrade = (taskNum: number, field: keyof TaskGrade, value: string) => {
    setTaskGrades(prev => ({ ...prev, [taskNum]: { ...prev[taskNum], [field]: value } }));
  };

  const getTaskBand = (taskNum: number): number | null => {
    const g = taskGrades[taskNum];
    const scores = [parseFloat(g.ta), parseFloat(g.cc), parseFloat(g.lr), parseFloat(g.gra)];
    if (scores.some(s => isNaN(s))) return null;
    return Math.round((scores.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
  };

  const getFinalBand = (): number | null => {
    const t1 = getTaskBand(1);
    const t2 = getTaskBand(2);
    if (t1 === null || t2 === null) return null;
    return Math.round(((t1 * 1 / 3) + (t2 * 2 / 3)) * 2) / 2;
  };

  const fetchSubmissions = () => {
    const params: Record<string, string | number> = { page: currentPage, limit: 15 };
    if (filter !== 'all') params.status = filter;

    setLoading(true);
    axiosInstance.get('/admin/submissions', { params })
      .then((res) => {
        setSubmissions(res.data.data.submissions);
        setStats(res.data.data.stats);
        setTotalPages(res.data.data.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) fetchSubmissions();
  }, [user, filter, currentPage]);

  const handleSelectSubmission = (id: string) => {
    axiosInstance.get(`/admin/submissions/${id}`)
      .then((res) => {
        setSelected(res.data.data);
        const s = res.data.data;
        const newGrades: Record<number, TaskGrade> = {
          1: { ta: '', cc: '', lr: '', gra: '', comments: '' },
          2: { ta: '', cc: '', lr: '', gra: '', comments: '' },
        };
        for (const task of s.tasks || []) {
          if (task.feedback) {
            newGrades[task.taskNumber] = {
              ta: String(task.feedback.taskAchievement || ''),
              cc: String(task.feedback.coherence || ''),
              lr: String(task.feedback.lexicalResource || ''),
              gra: String(task.feedback.grammar || ''),
              comments: task.feedback.comments || '',
            };
          }
        }
        setTaskGrades(newGrades);
      })
      .catch(() => toast.error('Failed to load submission'));
  };

  const handleCopy = () => {
    if (!selected) return;
    const parts = selected.tasks.map(t =>
      `IELTS Writing Task ${t.taskNumber}\n\nPrompt:\n${t.prompt}\n\nStudent's Response (${t.wordCount} words):\n${t.response}`
    );
    navigator.clipboard.writeText(parts.join('\n\n---\n\n'));
    toast.success('Copied to clipboard — paste into Claude');
  };

  const handleGrade = async () => {
    if (!selected) return;

    // Validate all task scores
    for (const taskNum of [1, 2]) {
      const g = taskGrades[taskNum];
      const scores = [parseFloat(g.ta), parseFloat(g.cc), parseFloat(g.lr), parseFloat(g.gra)];
      if (scores.some(s => isNaN(s) || s < 0 || s > 9)) {
        toast.error(`All scores for Task ${taskNum} must be between 0 and 9`);
        return;
      }
    }

    const finalBand = getFinalBand();
    if (finalBand === null) {
      toast.error('Please fill all scores for both tasks');
      return;
    }

    const tasksPayload = [1, 2].map(taskNum => {
      const g = taskGrades[taskNum];
      return {
        taskNumber: taskNum,
        bandScore: getTaskBand(taskNum),
        taskAchievement: parseFloat(g.ta),
        coherence: parseFloat(g.cc),
        lexicalResource: parseFloat(g.lr),
        grammar: parseFloat(g.gra),
        comments: g.comments,
      };
    });

    setGrading(true);
    try {
      await axiosInstance.patch(`/admin/submissions/${selected._id}/grade`, {
        bandScore: finalBand,
        feedback: { tasks: tasksPayload },
      });
      toast.success('Submission graded!');
      setSelected(null);
      fetchSubmissions();
    } catch {
      toast.error('Failed to grade');
    } finally {
      setGrading(false);
    }
  };

  // Detail view
  if (selected) {
    const formatDate = (iso: string) => new Date(iso).toLocaleString();
    return (
      <AdminLayout>
        <div className="p-8">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Back to list
          </button>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.testId}</h2>
                <p className="text-sm text-gray-500">{selected.user.name} ({selected.user.email}) · {formatDate(selected.submittedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 cursor-pointer">
                  <ClipboardCopy className="w-3.5 h-3.5" /> Copy All for Claude
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selected.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {selected.status}
                </span>
              </div>
            </div>

            {selected.tasks.sort((a, b) => a.taskNumber - b.taskNumber).map((task) => (
              <div key={task._id} className="mb-6 last:mb-0">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Task {task.taskNumber} — {task.wordCount} words</h3>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Prompt</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{task.prompt}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Response</p>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {task.response || '(empty)'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grade Forms — per task */}
          {[1, 2].map(taskNum => {
            const g = taskGrades[taskNum];
            const taskBand = getTaskBand(taskNum);
            const fields = [
              { label: 'Task Achievement', key: 'ta' as const },
              { label: 'Coherence & Cohesion', key: 'cc' as const },
              { label: 'Lexical Resource', key: 'lr' as const },
              { label: 'Grammar Range & Accuracy', key: 'gra' as const },
            ];
            return (
              <div key={taskNum} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Grade Task {taskNum} <span className="text-sm font-normal text-gray-500">({taskNum === 1 ? '33% weight' : '67% weight'})</span>
                  </h3>
                  {taskBand !== null && (
                    <span className="text-sm font-bold text-purple-700">Band {taskBand}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="9"
                        step="0.5"
                        value={g[field.key]}
                        onChange={(e) => updateTaskGrade(taskNum, field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0 - 9"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Comments</label>
                  <textarea
                    value={g.comments}
                    onChange={(e) => updateTaskGrade(taskNum, 'comments', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder={`Paste Claude's feedback for Task ${taskNum}...`}
                  />
                </div>
              </div>
            );
          })}

          {/* Final Score + Submit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Final Score</h3>
                <p className="text-xs text-gray-500">Task 1 (33%) + Task 2 (67%)</p>
              </div>
              <div className="text-right">
                {getTaskBand(1) !== null && <div className="text-sm text-gray-600">Task 1: <strong>{getTaskBand(1)}</strong></div>}
                {getTaskBand(2) !== null && <div className="text-sm text-gray-600">Task 2: <strong>{getTaskBand(2)}</strong></div>}
                {getFinalBand() !== null && (
                  <div className="text-lg font-bold text-purple-700 mt-1">Overall: {getFinalBand()}</div>
                )}
              </div>
            </div>

            <button
              onClick={handleGrade}
              disabled={grading}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {grading ? 'Saving...' : 'Submit Grade'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // List view
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Writing Submissions</h1>
        <p className="text-sm text-gray-500 mb-6">
          {stats.pending} pending · {stats.graded} graded · {stats.total} total
        </p>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(['pending', 'graded', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                filter === f ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f} {f === 'pending' && stats.pending > 0 ? `(${stats.pending})` : ''}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <ListLoader />
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No {filter === 'all' ? '' : filter} submissions</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Student</th>
                    <th className="text-left px-3 py-3">Test</th>
                    <th className="text-center px-3 py-3">Words</th>
                    <th className="text-center px-3 py-3">Band</th>
                    <th className="text-center px-3 py-3">Status</th>
                    <th className="text-center px-3 py-3">Date</th>
                    <th className="text-right px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s) => {
                    const totalWords = s.tasks?.reduce((sum, t) => sum + (t.wordCount || 0), 0) ?? 0;
                    return (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900">{s.user.name}</div>
                          <div className="text-xs text-gray-500">{s.user.email}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">{s.testId}</td>
                        <td className="text-center px-3 py-3 text-sm text-gray-700">{totalWords}</td>
                        <td className="text-center px-3 py-3">
                          {s.bandScore != null && s.bandScore > 0 ? (
                            <span className="text-sm font-bold text-purple-700">{s.bandScore}</span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3 text-sm text-gray-500">
                          {new Date(s.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="text-right px-5 py-3">
                          <button
                            onClick={() => handleSelectSubmission(s._id)}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            {s.status === 'pending' ? 'Grade' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

export default AdminPage;
