import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Info, Route } from 'lucide-react';
import type { FareEstimate } from '@/types';
import { naira, cn } from '@/utils';

/** Itemised fare panel. Always labels the amount as an ESTIMATE. */
export function FareBreakdown({ fare, className, dark, title = 'Estimated fare', confirmed }: { fare: FareEstimate | null; className?: string; dark?: boolean; title?: string; confirmed?: boolean }) {
  return (
    <div className={cn('rounded-2xl', dark ? 'bg-white/[0.06] text-white ring-1 ring-white/10' : 'bg-white ring-1 ring-line', className)}>
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div>
          <p className={cn('text-xs font-bold tracking-[0.14em] uppercase', dark ? 'text-white/50' : 'text-muted')}>{title}</p>
          <AnimatePresence mode="popLayout">
            <motion.p key={fare?.total ?? 0} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="mt-1 font-display text-4xl font-extrabold tracking-tight">
              {fare ? naira(fare.total) : '₦ —'}
            </motion.p>
          </AnimatePresence>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase', confirmed ? 'bg-ok-bg text-ok' : dark ? 'bg-go-500/20 text-go-300' : 'bg-go-50 text-go-700')}>
          {confirmed ? 'Confirmed (demo)' : 'Estimate'}
        </span>
      </div>
      {fare ? (
        <>
          <div className={cn('mx-5 flex gap-4 rounded-xl px-3 py-2 text-[13px] font-medium', dark ? 'bg-white/5 text-white/70' : 'bg-surface-2 text-text-2')}>
            <span className="flex items-center gap-1.5"><Route className="size-3.5" aria-hidden /> ~{fare.distanceKm} km</span>
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden /> ~{fare.durationMin} min</span>
          </div>
          <dl className="space-y-2 p-5 text-sm">
            {fare.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-4">
                <dt className={dark ? 'text-white/65' : 'text-text-2'}>
                  {l.label}
                  {l.hint && <span className={cn('block text-xs', dark ? 'text-white/40' : 'text-muted')}>{l.hint}</span>}
                </dt>
                <dd className="font-semibold tabular-nums">{naira(l.amount)}</dd>
              </div>
            ))}
            <div className={cn('flex justify-between gap-4 border-t pt-2', dark ? 'border-white/10' : 'border-line')}>
              <dt className={dark ? 'text-white/65' : 'text-text-2'}>Service & booking charges</dt>
              <dd className="font-semibold tabular-nums">{naira(fare.serviceCharge)}</dd>
            </div>
            {fare.discount > 0 && (
              <div className="flex justify-between gap-4 text-ok">
                <dt>Promo discount</dt>
                <dd className="font-semibold tabular-nums">−{naira(fare.discount)}</dd>
              </div>
            )}
            <div className={cn('flex justify-between gap-4 border-t pt-3 text-base', dark ? 'border-white/10' : 'border-line')}>
              <dt className="font-bold">{confirmed ? 'Total' : 'Estimated total'}</dt>
              <dd className="font-display font-extrabold tabular-nums">{naira(fare.total)}</dd>
            </div>
          </dl>
          {!confirmed && (
            <p className={cn('flex gap-2 border-t px-5 py-3 text-xs leading-relaxed', dark ? 'border-white/10 text-white/50' : 'border-line text-muted')}>
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Estimate based on distance, time, tier and demand. Your confirmed fare appears on your receipt.
            </p>
          )}
        </>
      ) : (
        <p className={cn('px-5 pb-5 text-sm', dark ? 'text-white/55' : 'text-muted')}>Choose pickup and destination to see an itemised estimate.</p>
      )}
    </div>
  );
}
