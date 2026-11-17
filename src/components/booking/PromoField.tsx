import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent, CircleAlert, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { applyPromo, lookupPromo } from '@/services/pricingService';
import type { PromoCode } from '@/types';
import { cn, naira } from '@/utils';

/**
 * Promo code entry with apply / remove and live savings.
 * `subtotal` is the pre-charge fare subtotal the promo applies to.
 */
export function PromoField({ promo, onChange, subtotal, dark, className, hintCodes = ['UNIZIK10', 'WELCOME20', 'DOORSTEP200', 'GOBIZ10'] }: { promo: PromoCode | null; onChange: (p: PromoCode | null) => void; subtotal: number; dark?: boolean; className?: string; hintCodes?: string[] }) {
  const id = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const savings = applyPromo(subtotal, promo);
  const belowMin = !!promo && !!promo.minSpend && subtotal < promo.minSpend;

  const apply = (raw = code) => {
    if (!raw.trim()) {
      setError('Enter a promo code');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const r = lookupPromo(raw);
      setBusy(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setError(undefined);
      setCode('');
      onChange(r.promo);
    }, 350);
  };

  return (
    <div className={cn('rounded-2xl', dark ? 'bg-white/[0.06] p-4 ring-1 ring-white/10' : 'border border-dashed border-line-strong bg-surface-2/50 p-4', className)}>
      <label htmlFor={id} className={cn('flex items-center gap-2 text-sm font-semibold', dark ? 'text-white' : 'text-ink-900')}>
        <BadgePercent className="size-4 text-go-500" aria-hidden /> Promo code
      </label>
      <AnimatePresence mode="wait" initial={false}>
        {promo ? (
          <motion.div key="applied" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="mt-3">
            <div className={cn('flex items-center gap-3 rounded-xl p-3', belowMin ? 'bg-warn-bg' : 'bg-ok-bg')}>
              <Tag className={cn('size-4 shrink-0', belowMin ? 'text-warn' : 'text-ok')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold tracking-wide text-ink-900">{promo.code}</p>
                <p className="text-xs text-text-2">{promo.description}</p>
              </div>
              <button type="button" onClick={() => onChange(null)} className="grid size-11 shrink-0 place-items-center rounded-lg text-text-2 transition hover:bg-white/70 hover:text-crit" aria-label={`Remove promo code ${promo.code}`}>
                <X className="size-4" />
              </button>
            </div>
            <p aria-live="polite" className={cn('mt-2 text-[13px] font-semibold', belowMin ? 'text-warn' : 'text-ok')}>
              {belowMin ? `Add ${naira((promo.minSpend ?? 0) - subtotal)} more to unlock this code.` : `You save ${naira(savings)} on this booking.`}
            </p>
          </motion.div>
        ) : (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3">
            <div className="flex gap-2">
              <input
                id={id}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    apply();
                  }
                }}
                placeholder="e.g. WELCOME20"
                autoComplete="off"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? `${id}-err` : undefined}
                className="field-input min-w-0 flex-1 font-mono uppercase"
              />
              <Button variant={dark ? 'white' : 'ink'} onClick={() => apply()} loading={busy} className="h-auto min-h-12">
                Apply
              </Button>
            </div>
            {error && (
              <p id={`${id}-err`} role="alert" className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-crit">
                <CircleAlert className="size-3.5" aria-hidden /> {error}
              </p>
            )}
            {hintCodes.length > 0 && (
              <p className={cn('mt-2.5 flex flex-wrap items-center gap-1.5 text-xs', dark ? 'text-white/55' : 'text-muted')}>
                Demo codes:
                {hintCodes.map((c) => (
                  <button key={c} type="button" onClick={() => apply(c)} className={cn('rounded-md px-2 py-1 font-mono font-semibold transition', dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-brand-700 ring-1 ring-line hover:ring-brand-300')}>
                    {c}
                  </button>
                ))}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
