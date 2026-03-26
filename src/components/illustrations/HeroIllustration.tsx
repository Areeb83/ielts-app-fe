import { motion } from 'motion/react';

export function HeroIllustration() {
  return (
    <div className="relative w-full h-[500px]">
      <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background elements */}
        <motion.circle
          cx="400"
          cy="100"
          r="60"
          fill="#FFF7ED"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        <motion.circle
          cx="80"
          cy="400"
          r="40"
          fill="#F1F5F9"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />

        {/* Computer screen */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Screen frame */}
          <rect x="100" y="120" width="300" height="200" rx="8" fill="#F1F5F9" />
          <rect x="110" y="130" width="280" height="170" rx="4" fill="white" />
          
          {/* Screen content - IELTS interface */}
          <rect x="125" y="145" width="250" height="8" rx="4" fill="#E2E8F0" />
          <rect x="125" y="165" width="200" height="6" rx="3" fill="#E2E8F0" />
          <rect x="125" y="178" width="180" height="6" rx="3" fill="#E2E8F0" />
          
          {/* Answer boxes */}
          <rect x="125" y="200" width="60" height="40" rx="4" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
          <rect x="195" y="200" width="60" height="40" rx="4" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
          <rect x="265" y="200" width="60" height="40" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
          
          {/* Text in boxes */}
          <text x="155" y="225" fontSize="18" fill="#F97316" fontWeight="bold" textAnchor="middle">A</text>
          <text x="225" y="225" fontSize="18" fill="#F97316" fontWeight="bold" textAnchor="middle">B</text>
          <text x="295" y="225" fontSize="18" fill="#94A3B8" fontWeight="bold" textAnchor="middle">C</text>
          
          {/* Progress bar */}
          <rect x="125" y="260" width="250" height="12" rx="6" fill="#F1F5F9" />
          <rect x="125" y="260" width="180" height="12" rx="6" fill="#F97316" />
          
          {/* Timer icon */}
          <motion.circle
            cx="350"
            cy="155"
            r="15"
            fill="#FFF7ED"
            stroke="#F97316"
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <path d="M350 145 L350 155 L355 160" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Person sitting at desk */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Desk */}
          <rect x="80" y="320" width="340" height="12" rx="6" fill="#1F2937" />
          
          {/* Chair */}
          <ellipse cx="250" cy="370" rx="40" ry="20" fill="#64748B" />
          <rect x="235" y="340" width="30" height="40" rx="15" fill="#64748B" />
          
          {/* Body */}
          <ellipse cx="250" cy="290" rx="35" ry="45" fill="#F97316" />
          
          {/* Arms */}
          <motion.path
            d="M220 280 Q200 290 210 310"
            stroke="#F97316"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
            animate={{ d: "M220 280 Q200 295 210 315" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M280 280 Q300 290 290 310"
            stroke="#F97316"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
            animate={{ d: "M280 280 Q300 295 290 315" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
          />
          
          {/* Hand pointing */}
          <motion.circle
            cx="210"
            cy="310"
            r="10"
            fill="#FDBA74"
            animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          
          {/* Neck */}
          <rect x="240" y="250" width="20" height="20" fill="#FDBA74" />
          
          {/* Head */}
          <circle cx="250" cy="240" r="30" fill="#FDBA74" />
          
          {/* Hair */}
          <path d="M220 235 Q250 215 280 235" fill="#1F2937" />
          <ellipse cx="250" cy="225" rx="32" ry="20" fill="#1F2937" />
          
          {/* Eyes */}
          <circle cx="240" cy="240" r="3" fill="#1F2937" />
          <circle cx="260" cy="240" r="3" fill="#1F2937" />
          
          {/* Smile */}
          <path d="M235 250 Q250 258 265 250" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Floating elements */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Checkmark badge */}
          <circle cx="420" cy="280" r="25" fill="#10B981" />
          <path d="M410 280 L418 288 L430 272" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.g>

        <motion.g
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Headphones icon */}
          <rect x="40" y="180" width="50" height="50" rx="8" fill="#FFF7ED" />
          <path d="M50 205 Q50 195 65 195 Q80 195 80 205 M50 205 L50 215 M80 205 L80 215" stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none" />
        </motion.g>

        <motion.g
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "430px 370px" }}
        >
          {/* Star decoration */}
          <circle cx="430" cy="370" r="20" fill="#FFF7ED" />
          <path d="M430 355 L433 365 L443 365 L435 371 L438 381 L430 375 L422 381 L425 371 L417 365 L427 365 Z" fill="#F97316" />
        </motion.g>

        {/* Book/notebook */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <rect x="310" y="330" width="80" height="60" rx="4" fill="#F97316" />
          <rect x="315" y="335" width="70" height="50" rx="2" fill="white" />
          <line x1="350" y1="335" x2="350" y2="385" stroke="#F97316" strokeWidth="2" />
          <line x1="325" y1="345" x2="345" y2="345" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <line x1="325" y1="355" x2="345" y2="355" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <line x1="325" y1="365" x2="340" y2="365" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}
