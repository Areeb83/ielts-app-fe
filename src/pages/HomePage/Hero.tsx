import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HeroIllustration } from '../../components/illustrations/HeroIllustration';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">IELTS Computer-Based Test</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your
              <span className="block text-orange-500">IELTS Exam</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Practice with realistic computer-based test simulations. Track your progress, improve your skills, and achieve your target band score.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-orange-500 text-white rounded-lg font-medium shadow-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-200 hover:border-orange-500 transition-colors"
              >
                View Demo
              </motion.button>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div>
                <div className="font-bold text-2xl text-gray-900">10,000+</div>
                <div className="text-gray-600">Practice Questions</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="font-bold text-2xl text-gray-900">50+</div>
                <div className="text-gray-600">Mock Tests</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="font-bold text-2xl text-gray-900">24/7</div>
                <div className="text-gray-600">Access</div>
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
            <HeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
