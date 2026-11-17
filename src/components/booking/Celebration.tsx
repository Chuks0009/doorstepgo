import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';

const COLORS = ['#FF6A13', '#FF9A2E', '#2F7BFF', '#1747C9', '#ffffff', '#0f9d58'];

/** Confetti burst (skipped under reduced motion). */
export function Confetti({ count = 42, className }: { count?: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 140 + Math.random() * 220;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 80,
          r: Math.random() * 540 - 270,
          c: COLORS[i % COLORS.length],
          w: 6 + Math.random() * 6,
          h: 10 + Math.random() * 10,
          d: Math.random() * 0.25,
          round: i % 4 === 0,
        };
      }),
    [count],
  );
  if (reduced) return null;
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 grid place-items-center overflow-visible', className)}>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ width: b.w, height: b.round ? b.w : b.h, background: b.c, borderRadius: b.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 260], opacity: [1, 1, 0], rotate: b.r, scale: 1 }}
          transition={{ duration: 2.2, delay: b.d, ease: [0.16, 1, 0.3, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}

/** Animated success badge: ring pulse + drawn check. */
export function SuccessBadge({ tone = 'ok', className }: { tone?: 'ok' | 'warn'; className?: string }) {
  return (
    <div className={cn('relative grid size-24 place-items-center', className)}>
      <motion.span aria-hidden className={cn('absolute inset-0 rounded-full', tone === 'ok' ? 'bg-ok/20' : 'bg-warn/20')} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: [0.4, 1.35, 1], opacity: [0, 1, 0.6] }} transition={{ duration: 1 }} />
      <motion.span
        className={cn('relative grid size-20 place-items-center rounded-full text-white shadow-lift', tone === 'ok' ? 'bg-gradient-to-br from-emerald-400 to-ok' : 'bg-go-sheen')}
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
      >
        <Check className="size-10" strokeWidth={3.2} aria-hidden />
      </motion.span>
    </div>
  );
}

/** Route path that draws itself from pickup to destination with a moving dot. */
export function RouteDraw({ className }: { className?: string }) {
  const d = 'M 16 70 C 90 10, 150 110, 220 50 S 330 20, 384 40';
  return (
    <svg viewBox="0 0 400 90" className={cn('h-auto w-full', className)} aria-hidden>
      <path d={d} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth={6} strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke="url(#dsg-route)" strokeWidth={4} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.3 }} />
      <defs>
        <linearGradient id="dsg-route" x1="0" x2="1">
          <stop offset="0" stopColor="#2F7BFF" />
          <stop offset="1" stopColor="#FF6A13" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="70" r="8" fill="#1f5fe6" stroke="white" strokeWidth={3} />
      <motion.circle cx="384" cy="40" r="9" fill="#FF6A13" stroke="white" strokeWidth={3} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }} style={{ transformOrigin: '384px 40px' }} />
    </svg>
  );
}
