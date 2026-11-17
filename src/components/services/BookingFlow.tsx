import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Icon, Reveal } from '@/components/ui';
import { cn } from '@/utils';

export interface FlowStep {
  title: string;
  body: string;
  icon: string; // iconRegistry name
  detail?: string[];
}

/**
 * Interactive booking-process explainer. Desktop: horizontal rail of steps with
 * an animated progress bar + detail panel. Mobile: vertical timeline.
 */
export function BookingFlow({ steps, dark }: { steps: FlowStep[]; dark?: boolean }) {
  const [active, setActive] = useState(0);
  const s = steps[active];
  const pct = steps.length > 1 ? (active / (steps.length - 1)) * 100 : 100;

  return (
    <div>
      {/* Desktop rail */}
      <div className="hidden lg:block">
        <div className="relative">
          <div aria-hidden className={cn('absolute top-6 right-6 left-6 h-1 rounded-full', dark ? 'bg-white/10' : 'bg-surface-2')} />
          <div aria-hidden className="absolute top-6 right-6 left-6 h-1">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-go-500"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <ol className="relative flex justify-between" role="tablist" aria-label="Booking steps">
            {steps.map((st, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <li key={st.title} className="flex w-0 flex-1 flex-col items-center first:items-start last:items-end">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="flow-panel"
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') setActive((a) => Math.min(steps.length - 1, a + 1));
                      if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, a - 1));
                    }}
                    className="group flex flex-col items-center gap-2 rounded-xl"
                  >
                    <span
                      className={cn(
                        'relative grid size-12 place-items-center rounded-2xl transition-all duration-300',
                        on ? 'bg-go-sheen text-white shadow-glow-go' : done ? 'bg-brand-sheen text-white' : dark ? 'bg-ink-800 text-white/60 ring-1 ring-white/10 group-hover:text-white' : 'bg-white text-muted ring-1 ring-line-strong group-hover:text-ink-900',
                      )}
                    >
                      <Icon name={st.icon} className="size-5" />
                      {on && <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-2xl ring-2 ring-go-500" />}
                    </span>
                    <span className={cn('max-w-24 text-center text-xs font-semibold leading-tight', on ? (dark ? 'text-white' : 'text-ink-900') : dark ? 'text-white/50' : 'text-muted')}>
                      {st.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.div
          key={active}
          id="flow-panel"
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn('mt-10 grid grid-cols-[auto_1fr_auto] items-center gap-8 rounded-3xl p-8', dark ? 'glass-dark' : 'card')}
        >
          <span className={cn('font-display text-7xl font-extrabold', dark ? 'text-white/10' : 'text-ink-900/10')}>{String(active + 1).padStart(2, '0')}</span>
          <div>
            <h3 className={cn('text-2xl font-bold', dark ? 'text-white' : 'text-ink-900')}>{s.title}</h3>
            <p className={cn('mt-2 max-w-2xl leading-relaxed', dark ? 'text-white/70' : 'text-text-2')}>{s.body}</p>
            {s.detail && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.detail.map((d) => (
                  <li key={d} className={cn('rounded-full px-3 py-1 text-xs font-semibold', dark ? 'bg-white/10 text-white/80' : 'bg-brand-50 text-brand-800')}>{d}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous step" disabled={active === 0} onClick={() => setActive((a) => a - 1)} className={cn('grid size-11 place-items-center rounded-xl transition disabled:opacity-30', dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-2 text-ink-900 hover:bg-line')}>
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next step" disabled={active === steps.length - 1} onClick={() => setActive((a) => a + 1)} className="grid size-11 place-items-center rounded-xl bg-go-500 text-white transition hover:bg-go-600 disabled:opacity-30">
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile vertical timeline */}
      <ol className="relative space-y-4 lg:hidden">
        <span aria-hidden className={cn('absolute top-2 bottom-2 left-[21px] w-0.5', dark ? 'bg-gradient-to-b from-brand-500 via-go-500 to-transparent' : 'bg-gradient-to-b from-brand-400 via-go-400 to-transparent')} />
        {steps.map((st, i) => (
          <Reveal as="li" key={st.title} delay={i * 0.03} className="relative flex gap-4">
            <span className={cn('relative z-10 grid size-11 shrink-0 place-items-center rounded-xl', i === 0 ? 'bg-go-sheen text-white' : 'bg-brand-sheen text-white')}>
              <Icon name={st.icon} className="size-5" />
            </span>
            <div className={cn('flex-1 rounded-2xl p-4', dark ? 'glass-dark' : 'card')}>
              <p className={cn('text-[11px] font-bold tracking-widest uppercase', dark ? 'text-go-300' : 'text-go-600')}>Step {i + 1}</p>
              <h3 className={cn('mt-0.5 font-bold', dark ? 'text-white' : 'text-ink-900')}>{st.title}</h3>
              <p className={cn('mt-1 text-sm leading-relaxed', dark ? 'text-white/65' : 'text-text-2')}>{st.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/** Shared ride booking steps (motorcycle / tricycle). */
export const rideFlowSteps = (serviceLabel: string): FlowStep[] => [
  { title: 'Select service', icon: 'LayoutGrid', body: `Choose the ${serviceLabel} category that fits your trip — compare capacity, availability and starting price.`, detail: ['Category', 'Starting price', 'Capacity'] },
  { title: 'Pickup', icon: 'Navigation', body: 'Pick your city, then the nearest junction or landmark, and add a detailed street address so your rider finds you first time.', detail: ['City', 'Junction / landmark', 'Street address'] },
  { title: 'Destination', icon: 'MapPin', body: 'Set the drop-off the same way — city, junction and address. Add extra stops if you need them.', detail: ['City', 'Junction', 'Address', 'Stops'] },
  { title: 'Date & time', icon: 'CalendarClock', body: 'Ride now or schedule ahead. Peak and night-time surcharges are shown up front in your estimate.', detail: ['Ride now', 'Schedule ahead'] },
  { title: 'Passengers', icon: 'Users', body: 'Tell us how many people are travelling so we match the right vehicle and seat count.' },
  { title: 'Trip type', icon: 'Repeat', body: 'One-way or return. Return journeys are priced lower than two separate one-way trips.', detail: ['One-way', 'Return'] },
  { title: 'Instructions', icon: 'FileText', body: 'Add gate codes, landmarks, luggage notes or the name of the person you’re booking for.' },
  { title: 'Review & estimate', icon: 'Receipt', body: 'Check every detail alongside an itemised fare estimate before you confirm.', detail: ['Itemised estimate', 'Promo codes'] },
  { title: 'Confirmation', icon: 'BadgeCheck', body: 'Get a booking reference instantly, then follow status updates from your dashboard or the Track Booking page.', detail: ['Booking reference', 'Status updates'] },
];
