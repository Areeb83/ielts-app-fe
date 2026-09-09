import { useState } from 'react';
import { BookText, Clock, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Globe, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { buildReadingTestRoute } from '../constants';
import { motion } from 'motion/react';
import { useReadingBooks } from '../hooks/useReadingTests';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { AuthRequiredModal } from '../components/AuthRequiredModal';
import axiosInstance from '../api/axiosInstance';

export function ReadingTestsPage() {
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const { guardedNavigate, showAuthModal, onLogin, onRegister, onCloseModal } = useAuthGuard();
  const isAcademic = examType === 'academic';
  const examLabel = isAcademic ? 'Academic' : 'General Training';
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleReview = async (test: any) => {
    const attemptId = test.result?.attemptId;
    if (!attemptId) {
      navigate(`/${examType}/reading/${test.id}/result`, {
        state: { testTitle: `C${test.bookNumber} Reading Test ${test.testNumber}`, testType: 'reading', totalQuestions: 40, timeSpent: '--:--', userAnswers: {}, bandScore: test.result?.bandScore, correctAnswers: test.result?.correctAnswers },
      });
      return;
    }
    setReviewingId(test.id);
    try {
      const { data } = await axiosInstance.get(`/attempts/${attemptId}`);
      const full = data.data;
      navigate(`/${examType}/reading/${test.id}/result`, {
        state: {
          testTitle: `C${test.bookNumber} Reading Test ${test.testNumber}`,
          testType: 'reading',
          totalQuestions: 40,
          timeSpent: full.timeSpent ? `${String(Math.floor(full.timeSpent / 60)).padStart(2, '0')}:${String(full.timeSpent % 60).padStart(2, '0')}` : '--:--',
          userAnswers: full.answers || {},
          bandScore: full.bandScore,
          correctAnswers: full.score,
          results: full.results,
        },
      });
    } catch {
      toast.error('Failed to load review data');
    } finally {
      setReviewingId(null);
    }
  };

  const { books: currentBooks, stats, pagination, loading, currentPage, changePage } = useReadingBooks(
    (examType as 'academic' | 'general') || 'academic',
    6
  );

  const totalPages = pagination?.totalPages ?? 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading reading tests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-green-100 to-white">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl">
                  <BookText className="w-8 h-8 text-green-800" />
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  isAcademic
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {isAcademic ? <GraduationCap className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {examLabel}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Reading
                <span className="block text-green-800">Practice Tests</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Choose from Cambridge IELTS books 11-19. Each book contains 4 authentic practice tests.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <BookOpen className="w-6 h-6 text-green-800" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">{stats?.totalBooks ?? 9} Books</div>
                    <div className="text-sm text-gray-600">Cambridge IELTS</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <BookText className="w-6 h-6 text-green-800" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">{stats?.totalTests ?? 36} Tests</div>
                    <div className="text-sm text-gray-600">Total available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <Clock className="w-6 h-6 text-green-800" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">60 mins</div>
                    <div className="text-sm text-gray-600">Per test</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <svg viewBox="0 0 120 120" fill="none" className="w-full max-w-lg mx-auto drop-shadow-2xl">
                <circle cx="60" cy="60" r="50" fill="#ECFDF5" />
                {/* Book */}
                <motion.g
                  animate={{ rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "60px 65px" }}
                >
                  <rect x="35" y="45" width="50" height="40" rx="3" fill="#10B981" />
                  <rect x="38" y="48" width="44" height="34" rx="2" fill="white" />
                  <line x1="60" y1="48" x2="60" y2="82" stroke="#10B981" strokeWidth="2" />
                  <line x1="43" y1="55" x2="57" y2="55" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="43" y1="62" x2="57" y2="62" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="43" y1="69" x2="55" y2="69" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="63" y1="55" x2="77" y2="55" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="63" y1="62" x2="77" y2="62" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="63" y1="69" x2="75" y2="69" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
                {/* Magnifying glass */}
                <motion.g
                  animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="75" cy="35" r="10" fill="none" stroke="#1F2937" strokeWidth="3" />
                  <line x1="82" y1="42" x2="88" y2="48" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-container">
          <div className="space-y-10">
            <div className="grid gap-8">
              {currentBooks.map((book, index) => (
                <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-16 bg-green-800 rounded-lg shadow-md flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{book.number}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <BookText className="w-3 h-3 text-green-800" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-green-800" />{book.totalTests} Tests</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-green-800" />60 min each</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {book.tests.map((test) => {
                      const bandScore = test.result?.bandScore ?? null;
                      const isCompleted = test.status === 'completed';
                      const percent = isCompleted && bandScore !== null ? Math.max(0, Math.min(100, Math.round((bandScore / 9) * 100))) : 0;
                      const r = 45;
                      const circumference = 2 * Math.PI * r;
                      const dashOffset = circumference * (1 - percent / 100);
                      const ringStrokeClass = isCompleted ? 'text-green-700' : 'text-gray-400';
                      return (
                        <div key={test.id} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
                          <div className="text-left"><div className="font-semibold text-gray-900">Reading Test {test.testNumber}</div></div>
                          <div className="mt-6 flex items-center justify-center">
                            <div className="relative w-28 h-28">
                              <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
                                <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200" />
                                <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" className={ringStrokeClass} strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 300ms ease' }} transform="rotate(-90 50 50)" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                {isCompleted ? <div className="text-lg font-bold text-gray-900">{bandScore ?? 0}</div> : <div className="text-lg font-bold text-gray-700">0%</div>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-col gap-2">
                            {test.locked ? (
                              <button type="button" disabled className="w-full px-4 py-2 rounded-lg font-medium border-2 border-gray-200 bg-gray-100 text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
                                <Lock className="w-4 h-4" />
                                Upgrade to Pro
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={() => guardedNavigate(buildReadingTestRoute(examType || 'academic', test.id))} className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 ${isCompleted ? 'bg-white text-green-800 border-green-700 hover:bg-green-50' : 'bg-green-800 text-white border-green-800 hover:bg-green-900'}`}>
                                  {isCompleted ? 'Retake' : 'Start Test'}
                                </button>
                                {isCompleted && <button type="button" onClick={() => handleReview(test)} disabled={reviewingId === test.id} className="w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">{reviewingId === test.id ? 'Loading...' : 'Review'}</button>}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-12">
              <button onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg border-2 transition-all ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-green-100 text-green-800 hover:bg-green-50 hover:border-green-700'}`}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => changePage(i + 1)} className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${currentPage === i + 1 ? 'bg-green-800 text-white border-green-800 shadow-md scale-110' : 'bg-white text-gray-600 border-gray-100 hover:border-green-700 hover:text-green-800'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg border-2 transition-all ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-green-100 text-green-800 hover:bg-green-50 hover:border-green-700'}`}>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">About IELTS Reading Tests</h3>
                <p className="text-gray-700 leading-relaxed mb-4">Each reading test contains 3 passages with 40 questions total. The test takes 60 minutes.</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Passage 1:</strong> Generally the easiest, from books, magazines, or newspapers</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Passage 2:</strong> Moderate difficulty with work-related or general interest topics</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Passage 3:</strong> Most difficult, dealing with complex ideas and vocabulary</span></li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AuthRequiredModal
        open={showAuthModal}
        onClose={onCloseModal}
        onLogin={onLogin}
        onRegister={onRegister}
      />
    </div>
  );
}
