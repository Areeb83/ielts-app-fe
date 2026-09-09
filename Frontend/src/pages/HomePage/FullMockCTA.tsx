import { motion } from 'motion/react';
import { ArrowRight, Clock, Award, BarChart3 } from 'lucide-react';

export function FullMockCTA() {
  return (
    <section className="px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12 lg:p-16">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Complete Test Experience</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Take a Full Mock Test
              </h2>
              <p className="text-xl text-orange-50 mb-8 leading-relaxed">
                Experience the complete IELTS exam under real test conditions. Get comprehensive feedback and band score predictions.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">3 Hours</div>
                    <div className="text-sm text-orange-100">Full exam duration</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">Detailed Report</div>
                    <div className="text-sm text-orange-100">Performance analysis</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-orange-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                Start Full Mock Test
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Right illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[400px]">
                <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
                  {/* Person taking test */}
                  <motion.g
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {/* Desk */}
                    <ellipse cx="200" cy="320" rx="120" ry="20" fill="rgba(255,255,255,0.2)" />
                    
                    {/* Computer screen */}
                    <rect x="130" y="180" width="140" height="100" rx="6" fill="white" />
                    <rect x="138" y="188" width="124" height="75" rx="3" fill="#F1F5F9" />
                    
                    {/* Screen content */}
                    <rect x="148" y="198" width="104" height="6" rx="3" fill="#CBD5E1" />
                    <rect x="148" y="210" width="90" height="4" rx="2" fill="#CBD5E1" />
                    <rect x="148" y="220" width="95" height="4" rx="2" fill="#CBD5E1" />
                    
                    {/* Progress indicator */}
                    <rect x="148" y="240" width="104" height="8" rx="4" fill="#E2E8F0" />
                    <rect x="148" y="240" width="70" height="8" rx="4" fill="#F97316" />
                    
                    {/* Stand */}
                    <rect x="195" y="280" width="10" height="40" fill="white" opacity="0.8" />
                    
                    {/* Person */}
                    <motion.g
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Body */}
                      <ellipse cx="200" cy="270" rx="30" ry="40" fill="white" />
                      
                      {/* Head */}
                      <circle cx="200" cy="220" r="25" fill="#FDBA74" />
                      
                      {/* Hair */}
                      <path d="M178 215 Q200 200 222 215" fill="#1F2937" />
                      <ellipse cx="200" cy="210" rx="27" ry="18" fill="#1F2937" />
                      
                      {/* Arms */}
                      <path d="M175 250 Q160 260 165 280" stroke="white" strokeWidth="14" strokeLinecap="round" />
                      <path d="M225 250 Q240 260 235 280" stroke="white" strokeWidth="14" strokeLinecap="round" />
                    </motion.g>
                  </motion.g>

                  {/* Floating elements */}
                  <motion.g
                    animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Trophy */}
                    <circle cx="320" cy="150" r="35" fill="white" opacity="0.9" />
                    <path d="M308 145 L308 155 Q308 162 315 162 L325 162 Q332 162 332 155 L332 145 M305 145 L335 145 M308 140 L332 140 M315 162 L315 170 M325 162 L325 170 M312 170 L328 170" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="320" cy="135" r="4" fill="#FFD700" />
                  </motion.g>

                  <motion.g
                    animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    {/* Checkmark badge */}
                    <circle cx="80" cy="200" r="30" fill="white" opacity="0.9" />
                    <circle cx="80" cy="200" r="20" fill="#10B981" />
                    <path d="M72 200 L78 206 L88 192" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </motion.g>

                  <motion.g
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "320px 280px" }}
                  >
                    {/* Star */}
                    <path d="M320 260 L323 270 L333 270 L325 276 L328 286 L320 280 L312 286 L315 276 L307 270 L317 270 Z" fill="white" opacity="0.9" />
                  </motion.g>

                  <motion.g
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    {/* Clock */}
                    <circle cx="100" cy="100" r="25" fill="white" opacity="0.9" />
                    <circle cx="100" cy="100" r="18" fill="none" stroke="#F97316" strokeWidth="2" />
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 100 100"
                        to="360 100 100"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                      <line x1="100" y1="100" x2="100" y2="86" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                    <line x1="100" y1="100" x2="109" y2="93" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="2" fill="#F97316" />
                  </motion.g>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
