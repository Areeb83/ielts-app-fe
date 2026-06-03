
import { Headphones, Clock, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Globe, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useListeningBooks } from '../hooks';
import type { TestData } from '../api/types';
import { buildListeningTestRoute } from '../constants';

export function ListeningTestsPage() {
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const isAcademic = examType === 'academic';
  const examLabel = isAcademic ? 'Academic' : 'General Training';

  // ─── Fetch data via API hook ──────────────────────────────────────────
  const {
    books,
    stats,
    pagination,
    loading,
    error,
    currentPage,
    changePage,
    refetch,
  } = useListeningBooks((examType as 'academic' | 'general') || 'academic', 6);

  const totalPages = pagination?.totalPages ?? 1;

  // ─── Helper: get band score from API data ─────────────────────────────
  const getTestResult = (test: TestData) => {
    if (test.status === 'completed' && test.result) {
      return test.result;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl">
                  <Headphones className="w-8 h-8 text-orange-500" />
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  isAcademic
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {isAcademic ? <GraduationCap className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {examLabel}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Listening
                <span className="block text-orange-500">Practice Tests</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Choose from Cambridge IELTS books 11-19. Each book contains 4 authentic practice tests.
              </p>

              {/* Stats from API */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-orange-100">
                  <BookOpen className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {stats?.totalBooks ?? '—'} Books
                    </div>
                    <div className="text-sm text-gray-600">Cambridge IELTS</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-orange-100">
                  <Headphones className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {stats?.totalTests ?? '—'} Tests
                    </div>
                    <div className="text-sm text-gray-600">Total available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-orange-100">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">~30 mins</div>
                    <div className="text-sm text-gray-600">Per test</div>
                  </div>
                </div>
              </div>

              {/* Completion stats from API */}
              {stats && stats.completedTests > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-800 font-medium">
                    {stats.completedTests} of {stats.totalTests} completed
                    {stats.averageBandScore && ` · Avg band: ${stats.averageBandScore}`}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Right illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <svg viewBox="0 0 120 120" fill="none" className="w-full max-w-lg mx-auto drop-shadow-2xl">
                <circle cx="60" cy="60" r="50" fill="#FFF7ED" />
                {/* Headphones */}
                <motion.g
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M35 50 Q35 30 60 30 Q85 30 85 50" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <rect x="30" y="48" width="12" height="20" rx="4" fill="#F97316" />
                  <rect x="78" y="48" width="12" height="20" rx="4" fill="#F97316" />
                  {/* Sound waves */}
                  <motion.path
                    d="M95 45 Q100 50 95 55"
                    stroke="#F97316"
                    strokeWidth="2"
                    fill="none"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.path
                    d="M100 40 Q108 50 100 60"
                    stroke="#F97316"
                    strokeWidth="2"
                    fill="none"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </motion.g>
                {/* Person's head */}
                <circle cx="60" cy="75" r="15" fill="#FDBA74" />
                <path d="M50 70 Q60 60 70 70" fill="#1F2937" />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Test Cards */}
      <section className="py-12 md:py-16">
        <div className="page-container">
          {/* ── Loading State ──────────────────────────────────────────────── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-10 h-10 text-orange-500" />
              </motion.div>
              <p className="text-gray-500 font-medium">Loading practice tests...</p>
            </div>
          )}

          {/* ── Error State ───────────────────────────────────────────────── */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-5"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-500 max-w-md">{error}</p>
              </div>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </motion.div>
          )}

          {/* ── Data State ────────────────────────────────────────────────── */}
          {!loading && !error && (
            <div className="space-y-10">
              <div className="grid gap-8">
                <AnimatePresence mode="wait">
                  {books.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6"
                    >
                      <div className="flex items-start gap-6 mb-6">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{book.number}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <Headphones className="w-3 h-3 text-orange-600" />
                          </div>
                        </div>

                        <div className="text-left">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {book.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {book.totalTests} Tests
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              ~30 min each
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {book.tests.map((test) => {
                          const result = getTestResult(test);
                          const isCompleted = !!result;
                          const bandScore = result?.bandScore ?? 0;

                          const percent = isCompleted ? Math.max(0, Math.min(100, Math.round((bandScore / 9) * 100))) : 0;
                          const r = 45;
                          const circumference = 2 * Math.PI * r;
                          const dashOffset = circumference * (1 - percent / 100);
                          const ringStrokeClass = isCompleted ? 'text-orange-500' : 'text-gray-400';

                          return (
                            <div
                              key={test.id}
                              className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all p-4"
                            >
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">
                                  Listening Test {test.testNumber}
                                </div>
                                {isCompleted && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {result.correctAnswers}/{result.totalQuestions} correct
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 flex items-center justify-center">
                                <div className="relative w-28 h-28">
                                  <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r={r}
                                      stroke="currentColor"
                                      strokeWidth="10"
                                      fill="none"
                                      className="text-gray-200"
                                    />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r={r}
                                      stroke="currentColor"
                                      strokeWidth="10"
                                      strokeLinecap="round"
                                      fill="none"
                                      className={ringStrokeClass}
                                      strokeDasharray={circumference}
                                      strokeDashoffset={dashOffset}
                                      style={{ transition: 'stroke-dashoffset 600ms ease' }}
                                      transform="rotate(-90 50 50)"
                                    />
                                  </svg>

                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    {isCompleted ? (
                                      <div className="text-lg font-bold text-gray-900">
                                        {bandScore}
                                      </div>
                                    ) : (
                                      <>
                                        <div className="text-lg font-bold text-gray-700">0%</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Not taken</div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => navigate(buildListeningTestRoute(examType!, book.id, test.id))}
                                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 ${isCompleted
                                    ? 'bg-white text-orange-600 border-orange-500 hover:bg-orange-50'
                                    : 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                                    }`}
                                >
                                  {isCompleted ? 'Retake' : 'Start Test'}
                                </button>

                                {isCompleted && (
                                  <button
                                    type="button"
                                    className="w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                                  >
                                    Review
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => changePage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border-2 transition-all ${currentPage === 1
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-500'
                      }`}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => changePage(i + 1)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${currentPage === i + 1
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-110'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-orange-500 hover:text-orange-600'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border-2 transition-all ${currentPage === totalPages
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-500'
                      }`}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">About IELTS Listening Tests</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Each listening test contains 4 sections with 10 questions each (40 questions total). The test takes approximately 30 minutes, plus 10 minutes to transfer your answers.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Section 1:</strong> A conversation between two people in an everyday social context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Section 2:</strong> A monologue in an everyday social context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Section 3:</strong> A conversation between up to four people in an educational context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Section 4:</strong> A monologue on an academic subject</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
