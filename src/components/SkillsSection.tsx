import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const skills = [
  {
    title: 'Listening',
    description: 'Practice with authentic audio recordings and improve comprehension.',
    color: '#F97316',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
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
    ),
  },
  {
    title: 'Reading',
    description: 'Enhance reading speed and accuracy with varied passages.',
    color: '#10B981',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
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
    ),
  },
  {
    title: 'Writing',
    description: 'Master Task 1 and Task 2 with guided practice and feedback.',
    color: '#8B5CF6',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="#F5F3FF" />
        {/* Paper */}
        <rect x="40" y="35" width="45" height="55" rx="3" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="47" y1="45" x2="75" y2="45" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <line x1="47" y1="53" x2="78" y2="53" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <line x1="47" y1="61" x2="75" y2="61" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <line x1="47" y1="69" x2="70" y2="69" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        {/* Pen */}
        <motion.g
          animate={{ rotate: [0, -5, 0], x: [0, -2, 0], y: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "70px 70px" }}
        >
          <rect x="65" y="60" width="8" height="30" rx="2" fill="#8B5CF6" transform="rotate(-45 69 75)" />
          <path d="M65 85 L60 90 L65 88 Z" fill="#1F2937" />
        </motion.g>
        {/* Checkmark */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 1, repeat: Infinity, repeatDelay: 2 }}
        >
          <circle cx="80" cy="45" r="8" fill="#10B981" />
          <path d="M76 45 L79 48 L84 42" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.g>
      </svg>
    ),
  },
  {
    title: 'Speaking',
    description: 'Build confidence with simulated speaking tests and evaluation.',
    color: '#EF4444',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
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
    ),
  },
];

export function SkillsSection() {
  return (
    <section className="px-6 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Practice Individual Skills
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Focus on specific areas or practice all four skills
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 hover:border-orange-500"
            >
              {/* Icon */}
              <div className="mb-6 h-32">
                {skill.svg}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {skill.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {skill.description}
              </p>

              <Link 
                to={`/${skill.title.toLowerCase()}`}
                className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all"
              >
                Practice Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}