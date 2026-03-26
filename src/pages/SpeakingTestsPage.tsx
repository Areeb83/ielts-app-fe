import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Clock, BookOpen, ChevronDown, ChevronRight, Play, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Footer } from '../components/Footer';

// Mock data for completed tests with band scores
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

function getBandColor(band: number) {
  if (band >= 8.0) return 'text-green-600 bg-green-50 border-green-200';
  if (band >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (band >= 6.0) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function SpeakingTestsPage() {
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  const toggleBook = (bookNumber: number) => {
    setExpandedBook(expandedBook === bookNumber ? null : bookNumber);
  };

  const getTestStatus = (bookNumber: number, testNumber: number) => {
    return completedTests[bookNumber as keyof typeof completedTests]?.[testNumber as 1 | 2 | 3 | 4];
  };

  const getBookProgress = (bookNumber: number) => {
    const bookTests = completedTests[bookNumber as keyof typeof completedTests];
    if (!bookTests) return { completed: 0, total: 4 };
    return { completed: Object.keys(bookTests).length, total: 4 };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-12 md:py-16 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-6">
              <Mic className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Speaking Practice Tests
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from Cambridge IELTS books 11-19. Each book contains 4 authentic practice tests.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-gray-900">9 Books</div>
                <div className="text-sm text-gray-600">Cambridge IELTS</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm">
              <Mic className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-gray-900">36 Tests</div>
                <div className="text-sm text-gray-600">Total available</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-gray-900">11-14 mins</div>
                <div className="text-sm text-gray-600">Per test</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {books.map((book, index) => {
              const isExpanded = expandedBook === book.number;
              const progress = getBookProgress(book.number);
              const hasProgress = progress.completed > 0;

              return (
                <motion.div
                  key={book.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleBook(book.number)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Book Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md flex items-center justify-center">
                          <span className="text-white font-bold text-xl">{book.number}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <Mic className="w-3 h-3 text-red-600" />
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Cambridge IELTS {book.number}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            4 Tests
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            11-14 min each
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Progress Badge */}
                      {hasProgress && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {progress.completed}/{progress.total} completed
                          </span>
                        </motion.div>
                      )}

                      {/* Expand Icon */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          <div className="space-y-3">
                            {book.tests.map((test, testIndex) => {
                              const bandScore = getTestStatus(book.number, test);
                              const isCompleted = !!bandScore;

                              return (
                                <motion.div
                                  key={test}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: testIndex * 0.1 }}
                                >
                                  <button
                                    className="w-full group bg-gray-50 hover:bg-red-50 border-2 border-gray-100 hover:border-red-500 rounded-xl p-4 transition-all"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        {/* Test Icon */}
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                          isCompleted 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-white border-2 border-gray-200 text-gray-600 group-hover:border-red-500 group-hover:text-red-600'
                                        }`}>
                                          {isCompleted ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                          ) : (
                                            <Play className="w-5 h-5" />
                                          )}
                                        </div>

                                        {/* Test Info */}
                                        <div className="text-left">
                                          <div className="font-semibold text-gray-900 mb-1">
                                            Speaking Test {test}
                                          </div>
                                          <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <span>3 Parts</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                            <span>Interview Format</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        {/* Band Score Badge */}
                                        {isCompleted && bandScore && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg ${getBandColor(bandScore)}`}
                                          >
                                            <Award className="w-4 h-4" />
                                            <span className="font-bold">Band {bandScore}</span>
                                          </motion.div>
                                        )}

                                        {/* Action Button */}
                                        <div className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                          isCompleted
                                            ? 'bg-white text-red-600 border-2 border-red-500'
                                            : 'bg-red-500 text-white group-hover:bg-red-600'
                                        }`}>
                                          {isCompleted ? 'Retake' : 'Start Test'}
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                      </div>
                                    </div>
                                  </button>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Book Footer Stats */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-gray-600">
                                {hasProgress 
                                  ? `You've completed ${progress.completed} out of ${progress.total} tests in this book`
                                  : 'Start your first test to track your progress'
                                }
                              </div>
                              {hasProgress && (
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                      transition={{ duration: 0.5, delay: 0.3 }}
                                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                    />
                                  </div>
                                  <span className="font-medium text-gray-700">
                                    {Math.round((progress.completed / progress.total) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

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
                <h3 className="text-xl font-bold text-gray-900 mb-2">About IELTS Speaking Tests</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Speaking test is a face-to-face interview that lasts 11-14 minutes. It consists of three parts and assesses your spoken English skills.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Part 1 (4-5 mins):</strong> Introduction and interview on familiar topics like home, family, work, or studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Part 2 (3-4 mins):</strong> Individual long turn where you speak about a specific topic for 1-2 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Part 3 (4-5 mins):</strong> Two-way discussion on more abstract ideas related to Part 2 topic</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
