import { Mic, Clock, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Globe } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Footer } from '../components/Footer';

const completedTests = {
  11: { 1: 6.5, 2: 7.0 },
  14: { 3: 8.0 },
  18: { 1: 6.0, 2: 7.5, 4: 7.0 },
};

const books = [
  { number: 11, tests: [1, 2, 3, 4] },
  { number: 12, tests: [1, 2, 3, 4] },
  { number: 13, tests: [1, 2, 3, 4] },
  { number: 14, tests: [1, 2, 3, 4] },
  { number: 15, tests: [1, 2, 3, 4] },
  { number: 16, tests: [1, 2, 3, 4] },
  { number: 17, tests: [1, 2, 3, 4] },
  { number: 18, tests: [1, 2, 3, 4] },
  { number: 19, tests: [1, 2, 3, 4] },
];

export function SpeakingTestsPage() {
  const { examType } = useParams<{ examType: string }>();
  const isAcademic = examType === 'academic';
  const examLabel = isAcademic ? 'Academic' : 'General Training';

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  const getTestStatus = (bookNumber: number, testNumber: number) => {
    return completedTests[bookNumber as keyof typeof completedTests]?.[testNumber as 1 | 2 | 3 | 4];
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-red-100 to-white">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl">
                  <Mic className="w-8 h-8 text-red-500" />
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  isAcademic
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {isAcademic ? <GraduationCap className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {examLabel}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Speaking
                <span className="block text-red-500">Practice Tests</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Choose from Cambridge IELTS books 11-19. Each book contains 4 authentic practice tests.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-red-100">
                  <BookOpen className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">9 Books</div>
                    <div className="text-sm text-gray-600">Cambridge IELTS</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-red-100">
                  <Mic className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">36 Tests</div>
                    <div className="text-sm text-gray-600">Total available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm border border-red-100">
                  <Clock className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-bold text-lg text-gray-900">11-14 mins</div>
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
                <circle cx="60" cy="60" r="50" fill="#FEF2F2" />
                {/* Person head */}
                <circle cx="60" cy="55" r="18" fill="#FDBA74" />
                <path d="M48 50 Q60 40 72 50" fill="#1F2937" />
                <circle cx="54" cy="55" r="2" fill="#1F2937" />
                <circle cx="66" cy="55" r="2" fill="#1F2937" />
                {/* Mouth */}
                <motion.path
                  d="M52 62 Q60 66 68 62"
                  stroke="#1F2937"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  animate={{ d: ["M52 62 Q60 66 68 62", "M52 64 Q60 68 68 64", "M52 62 Q60 66 68 62"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Microphone */}
                <motion.g
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <rect x="75" y="55" width="10" height="18" rx="5" fill="#EF4444" />
                  <path d="M70 73 Q80 78 90 73" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <line x1="80" y1="73" x2="80" y2="78" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
                {/* Sound waves */}
                <motion.g
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path d="M35 50 Q30 55 35 60" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M28 45 Q20 55 28 65" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
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
                <motion.div key={book.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-16 bg-red-500 rounded-lg shadow-md flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{book.number}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <Mic className="w-3 h-3 text-red-500" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cambridge IELTS {book.number}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-red-500" />4 Tests</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-red-500" />11-14 min each</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {book.tests.map((test) => {
                      const bandScore = getTestStatus(book.number, test);
                      const isCompleted = typeof bandScore === 'number';
                      const percent = isCompleted ? Math.max(0, Math.min(100, Math.round((bandScore / 9) * 100))) : 0;
                      const r = 45;
                      const circumference = 2 * Math.PI * r;
                      const dashOffset = circumference * (1 - percent / 100);
                      const ringStrokeClass = isCompleted ? 'text-red-400' : 'text-gray-400';
                      return (
                        <div key={test} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
                          <div className="text-left"><div className="font-semibold text-gray-900">Speaking Test {test}</div></div>
                          <div className="mt-6 flex items-center justify-center">
                            <div className="relative w-28 h-28">
                              <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
                                <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200" />
                                <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" className={ringStrokeClass} strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 300ms ease' }} transform="rotate(-90 50 50)" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                {isCompleted && bandScore ? <div className="text-lg font-bold text-gray-900">{bandScore}</div> : <><div className="text-lg font-bold text-gray-700">0%</div><div className="text-xs text-gray-500 mt-0.5">Not taken</div></>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-col gap-2">
                            <button type="button" className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 ${isCompleted ? 'bg-white text-red-500 border-red-400 hover:bg-red-50' : 'bg-red-500 text-white border-red-500 hover:bg-red-600'}`}>
                              {isCompleted ? 'Retake' : 'Start Test'}
                            </button>
                            {isCompleted && <button type="button" className="w-full px-4 py-2 rounded-lg font-medium transition-colors border-2 border-gray-200 text-gray-700 hover:bg-gray-50">Review</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-12">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg border-2 transition-all ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-red-100 text-red-500 hover:bg-red-50 hover:border-red-400'}`}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${currentPage === i + 1 ? 'bg-red-500 text-white border-red-500 shadow-md scale-110' : 'bg-white text-gray-600 border-gray-100 hover:border-red-400 hover:text-red-500'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg border-2 transition-all ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-red-100 text-red-500 hover:bg-red-50 hover:border-red-400'}`}>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">About IELTS Speaking Tests</h3>
                <p className="text-gray-700 leading-relaxed mb-4">The Speaking test is a face-to-face interview that lasts 11-14 minutes. It consists of three parts and assesses your spoken English skills.</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Part 1 (4-5 mins):</strong> Introduction and interview on familiar topics like home, family, work, or studies</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Part 2 (3-4 mins):</strong> Individual long turn where you speak about a specific topic for 1-2 minutes</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span><strong>Part 3 (4-5 mins):</strong> Two-way discussion on more abstract ideas related to Part 2 topic</span></li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
