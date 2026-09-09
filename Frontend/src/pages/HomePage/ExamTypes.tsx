import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ExamTypes() {
  return (
    <section className="px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mock Tests by Full Test Sets
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take IELTS practice tests online with Cambridge
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Academic IELTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500"
          >
            {/* Illustration */}
            <div className="mb-6 h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                {/* Graduation cap background circle */}
                <circle cx="100" cy="100" r="80" fill="#FFF7ED" />
                
                {/* Book */}
                <rect x="70" y="110" width="60" height="50" rx="4" fill="#F97316" />
                <rect x="75" y="115" width="50" height="40" rx="2" fill="white" />
                <line x1="100" y1="115" x2="100" y2="155" stroke="#F97316" strokeWidth="2" />
                
                {/* Graduation cap */}
                <motion.g
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <rect x="75" y="60" width="50" height="8" rx="2" fill="#1F2937" />
                  <path d="M65 68 L100 75 L135 68 L100 61 Z" fill="#1F2937" />
                  <rect x="98" y="75" width="4" height="20" fill="#F97316" />
                  <circle cx="100" cy="97" r="4" fill="#F97316" />
                </motion.g>
                
                {/* Floating A+ */}
                <motion.g
                  animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <circle cx="150" cy="80" r="18" fill="#10B981" />
                  <text x="150" y="88" fontSize="16" fill="white" fontWeight="bold" textAnchor="middle">A+</text>
                </motion.g>
              </svg>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Academic IELTS
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              For university admissions and professional registration in English-speaking countries.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Higher education applications</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Professional certification</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Academic contexts</span>
              </li>
            </ul>

            <Link to="/academic" className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
              Start Academic Practice
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* General IELTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500"
          >
            {/* Illustration */}
            <div className="mb-6 h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                {/* Background circle */}
                <circle cx="100" cy="100" r="80" fill="#F1F5F9" />
                
                {/* Briefcase */}
                <rect x="70" y="100" width="60" height="50" rx="4" fill="#F97316" />
                <rect x="75" y="105" width="50" height="40" rx="2" fill="#EA580C" />
                <rect x="95" y="95" width="10" height="15" rx="2" fill="#F97316" />
                <circle cx="100" cy="125" r="3" fill="white" />
                
                {/* Globe/World */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "100px 60px" }}
                >
                  <circle cx="100" cy="60" r="25" fill="white" stroke="#1F2937" strokeWidth="2" />
                  <ellipse cx="100" cy="60" rx="25" ry="12" fill="none" stroke="#1F2937" strokeWidth="2" />
                  <line x1="100" y1="35" x2="100" y2="85" stroke="#1F2937" strokeWidth="2" />
                  <path d="M85 50 Q100 55 115 50" stroke="#1F2937" strokeWidth="2" fill="none" />
                  <path d="M85 70 Q100 65 115 70" stroke="#1F2937" strokeWidth="2" fill="none" />
                </motion.g>
                
                {/* Airplane */}
                <motion.g
                  animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M150 130 L165 125 L158 130 L165 135 Z" fill="#64748B" />
                  <circle cx="147" cy="130" r="2" fill="#64748B" />
                </motion.g>
              </svg>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              General IELTS
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              For migration, work experience, and training programs in English-speaking countries.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Immigration applications</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Work experience programs</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span>Training opportunities</span>
              </li>
            </ul>

            <Link to="/general" className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
              Start General Practice
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
