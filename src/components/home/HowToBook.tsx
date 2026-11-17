import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bike, Bus, CarTaxiFront, Check, CreditCard, MapPin, Navigation, Package, Wallet } from 'lucide-react';
import { ButtonLink, Logo, Reveal, SectionHeading } from '@/components/ui';
import { estimateRide } from '@/services/pricingService';
import { serviceOverview } from '@/data/services';
import { junctionLabel } from '@/config/locations';
import { useInterval, usePrefersReducedMotion } from '@/hooks';
import { cn, naira } from '@/utils';
import { PulsePin } from './motifs';

const steps = [
  { title: 'Pick your service', body: 'Choose motorcycle, tricycle, shuttle or delivery — and the tier that fits.' },
  { title: 'Set pickup & drop-off', body: 'Select the city, junction and exact address. Save favourites for later.' },
  { title: 'Review your estimate', body: 'Every charge itemised upfront. Choose how you would like to pay.' },
  { title: 'Track to the doorstep', body: 'Get a reference, follow your rider live and share your trip.' },
];

const DEMO = { tierId: 'tri-standard', pickup: { cityId: 'awka', junctionId: 'unizik-jn' }, dropoff: { cityId: 'awka', junctionId: 'eke-awka' }, time: '11:00' };
const STEP_MS = 5200;

/** How to book — interactive stepper driving a phone mock-up. */
export function HowToBook() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  useInterval(() => setStep((s) => (s + 1) % steps.length), paused || reduced ? null : STEP_MS);
  const fare = estimateRide(DEMO);

  return (
    <section aria-labelledby="htb-title" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <SectionHeading eyebrow="How to book" title={<span id="htb-title">Book in under a minute.</span>} subtitle="Four quick steps — the same for a 5-minute bike ride or a 300-guest event shuttle." />
          <ol className="mt-10 space-y-3">
            {steps.map((s, i) => {
              const on = i === step;
              const done = i < step;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={on ? 'step' : undefined}
                    className={cn('group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left transition sm:p-5', on ? 'border-go-200 bg-white shadow-lift' : 'border-transparent hover:bg-white/70')}
                  >
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold transition', on ? 'bg-go-sheen text-white shadow-glow-go' : done ? 'bg-ok text-white' : 'bg-surface-2 text-text-2 ring-1 ring-line-strong')}>
                      {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
                    </span>
                    <span>
                      <span className={cn('block font-display text-lg font-bold', on ? 'text-ink-900' : 'text-text-2')}>{s.title}</span>
                      <span className={cn('mt-1 block text-[15px] leading-relaxed text-text-2 transition-all', on ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 sm:max-h-20 sm:opacity-60')}>{s.body}</span>
                    </span>
                    {on && !reduced && (
                      <motion.span key={`${step}-${paused}`} aria-hidden className="absolute bottom-0 left-0 h-0.5 bg-go-500" initial={{ width: '0%' }} animate={{ width: paused ? '0%' : '100%' }} transition={{ duration: paused ? 0 : STEP_MS / 1000, ease: 'linear' }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-4" />}>Start booking</ButtonLink>
            <ButtonLink to="/track-booking" size="lg" variant="outline">Track a booking</ButtonLink>
          </div>
        </div>

        {/* Phone */}
        <Reveal className="relative mx-auto w-full max-w-[340px]">
          <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,rgb(47_123_255/0.25),transparent_65%)]" />
          <div aria-hidden className="absolute top-1/2 -right-14 -z-10 hidden h-64 w-24 -translate-y-1/2 -skew-x-[24deg] bg-go-sheen opacity-90 sm:block" />
          <div role="img" aria-label={`Phone preview: ${steps[step].title}`} className="relative rounded-[3rem] bg-ink-950 p-3 shadow-[0_50px_100px_-30px_rgb(5_11_34/0.6)] ring-1 ring-ink-700">
            <div className="relative h-[600px] overflow-hidden rounded-[2.4rem] bg-canvas">
              <div className="absolute top-2 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink-950" />
              <div className="flex items-center justify-between px-6 pt-10 pb-3">
                <Logo className="w-24" />
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase">Step {step + 1}/4</span>
              </div>
              <div className="px-5">
                <div className="flex gap-1">{steps.map((_, i) => <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-500', i <= step ? 'bg-go-500' : 'bg-line')} />)}</div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="px-5 pt-5">
                  <p className="font-display text-xl font-bold text-ink-900">{steps[step].title}</p>
                  {step === 0 && <ScreenService />}
                  {step === 1 && <ScreenRoute />}
                  {step === 2 && <ScreenFare total={fare?.total ?? 0} lines={fare?.lines.slice(0, 3) ?? []} service={fare ? fare.serviceCharge : 0} />}
                  {step === 3 && <ScreenTrack />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ScreenService() {
  const opts = [
    { Icon: Bike, label: 'Motorcycle', sub: `from ${naira(serviceOverview[0].from)}` },
    { Icon: CarTaxiFront, label: 'Tricycle', sub: `from ${naira(serviceOverview[1].from)}`, on: true },
    { Icon: Bus, label: 'Shuttle', sub: 'Groups' },
    { Icon: Package, label: 'Delivery', sub: 'Parcels' },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      {opts.map(({ Icon, label, sub, on }) => (
        <div key={label} className={cn('rounded-2xl border-2 p-3.5', on ? 'border-go-500 bg-go-50' : 'border-line bg-white')}>
          <span className={cn('grid size-10 place-items-center rounded-xl', on ? 'bg-go-500 text-white' : 'bg-brand-50 text-brand-700')}><Icon className="size-5" /></span>
          <p className="mt-3 text-sm font-bold text-ink-900">{label}</p>
          <p className="text-[11px] text-muted">{sub}</p>
        </div>
      ))}
      <div className="col-span-2 mt-2 rounded-2xl bg-ink-900 p-4 text-white">
        <p className="text-[11px] text-white/60">Selected</p>
        <p className="font-semibold">Standard Tricycle · up to 3</p>
      </div>
    </div>
  );
}

function ScreenRoute() {
  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-2 rounded-2xl bg-white p-3.5 shadow-soft">
        <div className="flex items-center gap-3 text-[13px]"><span className="grid size-7 place-items-center rounded-full bg-brand-600 text-white"><Navigation className="size-3.5" /></span><span className="truncate font-medium text-ink-900">{junctionLabel(DEMO.pickup.cityId, DEMO.pickup.junctionId)}</span></div>
        <div className="ml-3.5 h-4 border-l-2 border-dashed border-line-strong" />
        <div className="flex items-center gap-3 text-[13px]"><span className="grid size-7 place-items-center rounded-full bg-go-500 text-white"><MapPin className="size-3.5" /></span><span className="truncate font-medium text-ink-900">{junctionLabel(DEMO.dropoff.cityId, DEMO.dropoff.junctionId)}</span></div>
      </div>
      <div className="relative h-56 overflow-hidden rounded-2xl bg-ink-900">
        <div className="grid-lines absolute inset-0" />
        <svg viewBox="0 0 260 220" className="absolute inset-0 size-full">
          <path d="M0 160 L260 80 M80 0 L130 220 M190 0 L170 220" stroke="rgb(255 255 255 / 0.08)" strokeWidth="12" fill="none" />
          <path d="M40 180 C 80 170, 90 120, 130 115 S 200 70, 220 40" fill="none" stroke="#ff6a13" strokeWidth="4" strokeLinecap="round" />
          <path d="M40 180 C 80 170, 90 120, 130 115 S 200 70, 220 40" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 12" className="animate-dash" />
        </svg>
        <PulsePin className="absolute bottom-[14%] left-[13%]" />
        <PulsePin tone="go" className="absolute top-[15%] right-[13%]" />
      </div>
      <div className="flex gap-2">
        {['Home', 'Office', 'Mum’s place'].map((s) => <span key={s} className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-text-2">{s}</span>)}
      </div>
    </div>
  );
}

function ScreenFare({ total, lines, service }: { total: number; lines: { label: string; amount: number }[]; service: number }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <ul className="space-y-2 text-[12px]">
          {lines.map((l) => <li key={l.label} className="flex justify-between gap-3"><span className="truncate text-text-2">{l.label}</span><span className="font-semibold text-ink-900">{naira(l.amount)}</span></li>)}
          <li className="flex justify-between gap-3"><span className="text-text-2">Service & booking fee</span><span className="font-semibold text-ink-900">{naira(service)}</span></li>
        </ul>
        <div className="mt-3 flex items-end justify-between border-t border-dashed border-line-strong pt-3">
          <span className="text-[11px] font-bold tracking-wider text-muted uppercase">Estimated total</span>
          <span className="font-display text-2xl font-extrabold text-ink-900">{naira(total)}</span>
        </div>
      </div>
      <div className="space-y-2">
        {[{ Icon: CreditCard, l: 'Card', on: true }, { Icon: Wallet, l: 'Wallet' }].map(({ Icon, l, on }) => (
          <div key={l} className={cn('flex items-center gap-3 rounded-xl border-2 bg-white px-3 py-2.5 text-[13px] font-semibold', on ? 'border-go-500' : 'border-line')}>
            <Icon className="size-4 text-brand-700" /> {l}
            <span className={cn('ml-auto size-4 rounded-full border-2', on ? 'border-go-500 bg-go-500' : 'border-line-strong')} />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-go-sheen py-3 text-center text-sm font-bold text-white shadow-glow-go">Confirm booking</div>
      <p className="text-center text-[10px] text-muted">Demo — no real payment is taken</p>
    </div>
  );
}

function ScreenTrack() {
  const stages = ['Booking confirmed', 'Rider assigned', 'Rider arriving', 'Trip in progress', 'Arrived'];
  const current = 2;
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-ink-900 p-4 text-white">
        <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase">Reference</p>
        <p className="font-mono text-sm font-bold">DSG-RD-7KQ4-2M9P</p>
        <p className="mt-2 text-[12px] text-go-300">Rider arriving in ~4 min</p>
      </div>
      <ol className="space-y-0 rounded-2xl bg-white p-4 shadow-soft">
        {stages.map((s, i) => (
          <li key={s} className="relative flex items-center gap-3 pb-3 last:pb-0">
            {i < stages.length - 1 && <span className={cn('absolute top-5 left-[9px] h-full w-0.5', i < current ? 'bg-ok' : 'bg-line')} />}
            <span className={cn('relative grid size-5 shrink-0 place-items-center rounded-full', i < current ? 'bg-ok text-white' : i === current ? 'bg-go-500' : 'bg-line')}>
              {i < current && <Check className="size-3" strokeWidth={3} />}
              {i === current && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-go-500" />}
            </span>
            <span className={cn('text-[13px]', i <= current ? 'font-semibold text-ink-900' : 'text-muted')}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-line bg-white py-2.5 text-center text-[13px] font-semibold text-brand-700">Share trip link</div>
    </div>
  );
}
