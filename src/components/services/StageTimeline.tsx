import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Check, ClipboardCheck, MapPin, Navigation, Package, PackageCheck, Truck, UserCheck } from 'lucide-react';
import { deliveryStages } from '@/data/seed';
import { useInterval, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';

const stageIcons = [ClipboardCheck, UserCheck, Navigation, Package, Truck, MapPin, PackageCheck];

/** Auto-advancing visual of the 7 delivery tracking stages (sample data). */
export function StageTimeline() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [i, setI] = useState(reduced ? deliveryStages.length - 1 : 3);
  useInterval(() => setI((x) => (x + 1) % deliveryStages.length), reduced || paused ? null : 1800);
  const pct = (i / (deliveryStages.length - 1)) * 100;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {/* Horizontal (md+) */}
      <div className="relative hidden md:block">
        <div aria-hidden className="absolute top-7 right-7 left-7 h-1.5 rounded-full bg-white/10">
          <motion.div className="relative h-full rounded-full bg-gradient-to-r from-brand-500 to-go-500" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="absolute top-1/2 -right-4 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-go-500 text-white shadow-glow-go">
              <Bike className="size-4" />
            </span>
          </motion.div>
        </div>
        <ol className="relative grid grid-cols-7 gap-2">
          {deliveryStages.map((s, idx) => {
            const I = stageIcons[idx];
            const done = idx <= i;
            return (
              <li key={s.key} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Show stage ${idx + 1}: ${s.label}`}
                  aria-current={idx === i ? 'step' : undefined}
                  className={cn('grid size-14 place-items-center rounded-2xl transition-all duration-500', done ? 'bg-white text-ink-900 shadow-lift' : 'bg-ink-800 text-white/40 ring-1 ring-white/10', idx === i && 'scale-110 ring-4 ring-go-500/40')}
                >
                  {done && idx < i ? <Check className="size-5 text-ok" strokeWidth={3} aria-hidden /> : <I className="size-5" aria-hidden />}
                </button>
                <p className={cn('mt-3 text-xs leading-tight font-semibold', done ? 'text-white' : 'text-white/40')}>{s.label}</p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Vertical (mobile) */}
      <ol className="relative space-y-3 md:hidden">
        {deliveryStages.map((s, idx) => {
          const I = stageIcons[idx];
          const done = idx <= i;
          return (
            <li key={s.key} className="flex items-center gap-3">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition', done ? 'bg-white text-ink-900' : 'bg-ink-800 text-white/40', idx === i && 'ring-4 ring-go-500/40')}>
                {done && idx < i ? <Check className="size-4 text-ok" strokeWidth={3} aria-hidden /> : <I className="size-4" aria-hidden />}
              </span>
              <span className={cn('text-sm font-semibold', done ? 'text-white' : 'text-white/45')}>{s.label}</span>
              {idx === i && <span className="ml-auto rounded-full bg-go-500 px-2 py-0.5 text-[10px] font-bold uppercase">Now</span>}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">Current sample stage: {deliveryStages[i].label}</p>
    </div>
  );
}
