import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, GitCompareArrows, Plus } from 'lucide-react';
import { ButtonLink, SmartImage } from '@/components/ui';
import { img } from '@/data/images';
import type { ServiceTier } from '@/types';
import { cn, naira } from '@/utils';

export interface CompareRow {
  label: string;
  render: (t: ServiceTier) => ReactNode;
  /** Return the id of the tier that "wins" this row (highlighted). */
  best?: (tiers: ServiceTier[]) => string | undefined;
}

/**
 * Side-by-side tier comparison with select-to-compare toggles.
 * At least two tiers stay selected. Scrolls horizontally inside its own
 * container on small screens (sticky row labels).
 */
export function CompareTable({ tiers, rows, initial }: { tiers: ServiceTier[]; rows: CompareRow[]; initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial ?? tiers.slice(0, 3).map((t) => t.id));
  const shown = tiers.filter((t) => selected.includes(t.id));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? (s.length > 2 ? s.filter((x) => x !== id) : s) : [...s, id]));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose categories to compare">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-bold text-ink-900"><GitCompareArrows className="size-4 text-go-500" aria-hidden /> Compare:</span>
        {tiers.map((t) => {
          const on = selected.includes(t.id);
          const locked = on && selected.length <= 2;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t.id)}
              title={locked ? 'Keep at least two categories selected' : undefined}
              className={cn('flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition', on ? 'border-ink-900 bg-ink-900 text-white' : 'border-line-strong bg-white text-text-2 hover:border-brand-400 hover:text-ink-900')}
            >
              {on ? <Check className="size-4 text-go-400" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              {t.name.replace(' Tricycle', '').replace(' Transportation', '')}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">Comparing {shown.length} of {tiers.length} categories. Keep at least two selected.</p>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white shadow-soft">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Comparison of selected categories</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-36 bg-white p-4 text-left align-bottom text-xs font-bold tracking-widest text-muted uppercase sm:w-44">Category</th>
              <AnimatePresence initial={false}>
                {shown.map((t) => (
                  <motion.th
                    key={t.id}
                    scope="col"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-44 border-l border-line p-4 text-left align-top"
                  >
                    <SmartImage src={img(t.image, 500)} alt={t.imageAlt} className="aspect-[16/10] rounded-xl" />
                    <p className="mt-3 font-display text-base font-bold text-ink-900">{t.name}</p>
                    <p className="text-xs font-medium text-muted">{t.tagline}</p>
                  </motion.th>
                ))}
              </AnimatePresence>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const bestId = r.best?.(shown);
              return (
                <tr key={r.label} className="border-t border-line">
                  <th scope="row" className="sticky left-0 z-10 bg-white p-4 text-left text-[13px] font-semibold text-text-2">{r.label}</th>
                  {shown.map((t) => (
                    <td key={t.id} className={cn('border-l border-line p-4 align-top text-ink-900', bestId === t.id && 'bg-go-50/70')}>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">{r.render(t)}</div>
                        {bestId === t.id && <span className="shrink-0 rounded-full bg-go-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">Best</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t border-line bg-surface-2/50">
              <th scope="row" className="sticky left-0 z-10 bg-surface-2 p-4 text-left text-[13px] font-semibold text-text-2">Ready?</th>
              {shown.map((t) => (
                <td key={t.id} className="border-l border-line p-4">
                  <ButtonLink to={`/booking?service=${t.kind}&tier=${t.id}`} variant="go" size="sm" block iconRight={<ArrowRight className="size-4" aria-hidden />} className="h-11" aria-label={`Book ${t.name}`}>
                    Book
                  </ButtonLink>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const cheapest = (ts: ServiceTier[]) => [...ts].sort((a, b) => a.minFare - b.minFare)[0]?.id;
export const mostSeats = (ts: ServiceTier[]) => [...ts].sort((a, b) => b.capacity - a.capacity)[0]?.id;
export const priceCell = (t: ServiceTier) => <span className="font-display text-lg font-extrabold">{naira(t.minFare)}</span>;
