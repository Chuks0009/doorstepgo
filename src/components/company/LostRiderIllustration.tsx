import { motion } from 'framer-motion';

/** Animated "rider lost on the route" scene for the 404 page. Decorative. */
export function LostRiderIllustration({ className }: { className?: string }) {
  const route = 'M30 300 C 90 300, 110 220, 180 220 S 260 300, 320 260 S 360 150, 300 130 S 200 160, 210 90 S 330 40, 380 70';
  return (
    <svg viewBox="0 0 420 360" className={className} aria-hidden>
      <defs>
        <radialGradient id="lr-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2F7BFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#2F7BFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lr-go" x1="0" x2="1">
          <stop offset="0" stopColor="#E85508" />
          <stop offset="1" stopColor="#FF9A2E" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="180" r="180" fill="url(#lr-glow)" />

      {/* city blocks */}
      <g fill="#ffffff" fillOpacity="0.05">
        <rect x="40" y="60" width="90" height="70" rx="12" />
        <rect x="250" y="180" width="60" height="50" rx="10" />
        <rect x="60" y="160" width="60" height="40" rx="10" />
        <rect x="330" y="290" width="70" height="50" rx="10" />
      </g>

      {/* route */}
      <path d={route} fill="none" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="22" strokeLinecap="round" />
      <path d={route} fill="none" stroke="url(#lr-go)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 12" className="animate-dash" />
      {/* dead-end branches */}
      <path d="M180 220 L150 170" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />
      <path d="M320 260 L370 230" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />
      <g stroke="#FF6A13" strokeWidth="3" strokeLinecap="round">
        <path d="M144 160 l12 12 M156 160 l-12 12" />
        <path d="M364 222 l12 12 M376 222 l-12 12" />
      </g>

      {/* start + destination pins */}
      <circle cx="30" cy="300" r="9" fill="#2F7BFF" stroke="#fff" strokeWidth="3" />
      <g transform="translate(380 70)">
        <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M0 -34 C -14 -34, -20 -22, -20 -16 C -20 -2, 0 10, 0 10 C 0 10, 20 -2, 20 -16 C 20 -22, 14 -34, 0 -34 Z" fill="#FF6A13" />
          <text x="0" y="-12" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="Sora, sans-serif">?</text>
        </motion.g>
        <ellipse cx="0" cy="12" rx="10" ry="3" fill="#000" opacity="0.3" />
      </g>

      {/* rider (bobbing, wobbling) */}
      <motion.g
        initial={{ x: 196, y: 190 }}
        animate={{ x: [196, 214, 196], y: [190, 186, 190], rotate: [-3, 3, -3] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <g transform="translate(-40 -46)">
          {/* speed lines */}
          <g stroke="#FF6A13" strokeLinecap="round" strokeWidth="3">
            <line x1="-26" y1="44" x2="-6" y2="44" opacity="0.9" />
            <line x1="-34" y1="54" x2="-10" y2="54" opacity="0.5" />
          </g>
          {/* wheels */}
          <circle cx="12" cy="62" r="13" fill="#0a1640" stroke="#fff" strokeWidth="4" />
          <circle cx="70" cy="62" r="13" fill="#0a1640" stroke="#fff" strokeWidth="4" />
          {/* body */}
          <path d="M8 56 L30 40 L58 40 L76 56 Z" fill="#1747C9" />
          <rect x="22" y="26" width="30" height="18" rx="5" fill="url(#lr-go)" />
          <path d="M62 40 L70 22" stroke="#cdd5e4" strokeWidth="4" strokeLinecap="round" />
          {/* rider */}
          <path d="M34 28 C 34 14, 52 10, 56 22 L52 34 Z" fill="#0f1f55" />
          <circle cx="50" cy="6" r="11" fill="#FF6A13" />
          <rect x="47" y="2" width="14" height="6" rx="3" fill="#0a1640" />
          <path d="M54 22 L68 22" stroke="#0f1f55" strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* confused bubbles */}
        <motion.text x="18" y="-58" fontSize="22" fontWeight="800" fill="#fff" fontFamily="Sora, sans-serif" animate={{ opacity: [0, 1, 0], y: [-50, -64, -70] }} transition={{ duration: 2.4, repeat: Infinity }}>?</motion.text>
        <motion.text x="-2" y="-50" fontSize="16" fontWeight="800" fill="#FF9A2E" fontFamily="Sora, sans-serif" animate={{ opacity: [0, 1, 0], y: [-42, -56, -62] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.8 }}>?</motion.text>
      </motion.g>

      {/* compass */}
      <g transform="translate(70 95)">
        <circle r="26" fill="#0f1f55" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
        <motion.g animate={{ rotate: [0, 160, -120, 40, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M0 -18 L5 0 L0 18 L-5 0 Z" fill="#FF6A13" />
          <path d="M0 0 L5 0 L0 18 L-5 0 Z" fill="#ffffff" opacity="0.8" />
        </motion.g>
      </g>
    </svg>
  );
}
