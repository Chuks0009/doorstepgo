import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/utils';
import type { LocationValue } from './LocationPicker';
import { placeLabel } from './locationRules';

export interface RoutePoint {
  kind: 'pickup' | 'stop' | 'dropoff';
  title: string;
  loc?: LocationValue;
  note?: string;
}

/** Vertical route visual (pickup → stops → destination) with an animated dashed connector. */
export function RouteTimeline({ points, dark, className, animate = true }: { points: RoutePoint[]; dark?: boolean; className?: string; animate?: boolean }) {
  return (
    <ol className={cn('relative', className)}>
      {points.map((p, i) => {
        const last = i === points.length - 1;
        const set = !!p.loc?.cityId;
        return (
          <motion.li
            key={`${p.kind}-${i}`}
            initial={animate ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {!last && (
              <span aria-hidden className={cn('absolute top-8 bottom-0 left-[13px] w-0.5', dark ? 'bg-[linear-gradient(to_bottom,rgb(255_255_255/0.35)_50%,transparent_50%)]' : 'bg-[linear-gradient(to_bottom,var(--color-line-strong)_50%,transparent_50%)]', 'bg-[length:2px_8px]')} />
            )}
            <span
              className={cn(
                'relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ring-4',
                p.kind === 'pickup' && cn('bg-brand-600 text-white', dark ? 'ring-brand-500/25' : 'ring-brand-100'),
                p.kind === 'stop' && cn('bg-white text-ink-900 ring-1', dark ? 'ring-white/30' : 'ring-line-strong'),
                p.kind === 'dropoff' && cn('bg-go-500 text-white', dark ? 'ring-go-500/25' : 'ring-go-100'),
              )}
            >
              {p.kind === 'pickup' ? <Navigation className="size-3.5" aria-hidden /> : p.kind === 'dropoff' ? <MapPin className="size-3.5" aria-hidden /> : <span className="text-[11px] font-bold">{i}</span>}
            </span>
            <div className="min-w-0">
              <p className={cn('text-[11px] font-bold tracking-[0.14em] uppercase', dark ? 'text-white/45' : 'text-muted')}>{p.title}</p>
              <p className={cn('text-sm font-semibold', set ? (dark ? 'text-white' : 'text-ink-900') : dark ? 'text-white/40 italic' : 'text-muted italic')}>{set ? placeLabel(p.loc) : 'Not set yet'}</p>
              {p.loc?.address && <p className={cn('truncate text-xs', dark ? 'text-white/55' : 'text-text-2')}>{p.loc.address}</p>}
              {p.note && <p className={cn('text-xs', dark ? 'text-white/55' : 'text-text-2')}>{p.note}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
