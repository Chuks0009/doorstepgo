import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Copy, IdCard, MessageCircle, Phone, Search, SearchX, Star } from 'lucide-react';
import type { Driver, TimelineEvent } from '@/types';
import { Avatar, Badge, Button, ButtonLink } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { cn, formatDateTime, maskPhone } from '@/utils';

/* ---------- Clipboard ---------- */
export function useCopy() {
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string, label = 'Copied to clipboard') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        toast({ title: label, tone: 'success' });
      } catch {
        toast({ title: 'Copy not available', body: text, tone: 'info' });
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    },
    [toast],
  );
  return { copied, copy };
}

export const REF_PATTERN = (prefix: 'RD' | 'DL') => new RegExp(`^DSG-${prefix}-[A-Z0-9]{4}-[A-Z0-9]{4}$`, 'i');

/* ---------- Reference lookup ---------- */
export function TrackLookup({
  prefix,
  samples,
  initial = '',
  onSubmit,
  label,
}: {
  prefix: 'RD' | 'DL';
  samples: { ref: string; note: string }[];
  initial?: string;
  onSubmit: (ref: string) => void;
  label: string;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string>();
  useEffect(() => setValue(initial), [initial]);

  const submit = (e?: FormEvent, override?: string) => {
    e?.preventDefault();
    const v = (override ?? value).trim().toUpperCase();
    if (!v) return setError('Enter your booking reference.');
    if (!REF_PATTERN(prefix).test(v)) return setError(`References look like DSG-${prefix}-XXXX-XXXX.`);
    setError(undefined);
    setValue(v);
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} noValidate className="glass-dark mt-8 max-w-3xl rounded-3xl p-3 sm:p-4" role="search" aria-label={label}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id={id}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder={`DSG-${prefix}-XXXX-XXXX`}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${id}-err` : `${id}-hint`}
            className="field-input h-14 pl-12 font-mono text-base tracking-wider uppercase"
          />
        </div>
        <Button type="submit" size="lg" className="h-14" iconRight={<ArrowRight className="size-5" />}>Track</Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {error ? (
          <p id={`${id}-err`} role="alert" className="w-full text-sm font-medium text-red-300">{error}</p>
        ) : (
          <p id={`${id}-hint`} className="text-xs font-medium text-white/55">Try a demo reference:</p>
        )}
        {samples.map((s) => (
          <button
            key={s.ref}
            type="button"
            onClick={() => submit(undefined, s.ref)}
            className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-go-400/60 hover:bg-white/10 hover:text-white"
          >
            <span className="font-mono font-semibold tracking-wide">{s.ref}</span>
            <span className="text-white/45 group-hover:text-white/70">· {s.note}</span>
          </button>
        ))}
      </div>
    </form>
  );
}

/* ---------- Vertical timeline ---------- */
export function TrackingTimeline({ events, current, descriptions = {}, cancelled }: { events: TimelineEvent[]; current: number; descriptions?: Record<string, string>; cancelled?: boolean }) {
  return (
    <ol className="relative">
      {events.map((ev, i) => {
        const done = ev.done && i < current;
        const active = i === current && !cancelled;
        const isLast = i === events.length - 1;
        const complete = active && isLast && ev.done;
        return (
          <motion.li
            key={ev.key}
            layout
            className="relative flex gap-4 pb-7 last:pb-0"
            aria-current={active ? 'step' : undefined}
          >
            {!isLast && (
              <span className="absolute top-9 bottom-1 left-[17px] w-0.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <motion.span className="absolute inset-x-0 top-0 bg-gradient-to-b from-ok to-go-500" initial={false} animate={{ height: i < current ? '100%' : '0%' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
              </span>
            )}
            <span
              className={cn(
                'relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-500',
                (done || complete) && 'bg-ok text-white',
                active && !complete && 'bg-go-sheen text-white shadow-glow-go',
                !done && !active && 'bg-surface-2 text-muted ring-1 ring-line-strong',
                cancelled && i > current && 'opacity-50',
              )}
            >
              {done || complete ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
              {active && !complete && <span className="absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-go-500" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className={cn('font-semibold', done || active ? 'text-ink-900' : 'text-muted')}>
                  {ev.label}
                  {active && !complete && <span className="ml-2 align-middle"><Badge tone="go">Now</Badge></span>}
                </p>
                <p className="text-xs font-medium text-muted tabular-nums">{ev.done && ev.at ? formatDateTime(ev.at) : 'Pending'}</p>
              </div>
              {(active || done) && descriptions[ev.key] && <p className="mt-1 text-sm text-text-2">{descriptions[ev.key]}</p>}
              {ev.note && <p className="mt-1 text-sm text-text-2">{ev.note}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/* ---------- Driver / rider card ---------- */
export function DriverCard({ driver, role, pendingText }: { driver?: Driver; role: 'Rider' | 'Driver'; pendingText: string }) {
  const toast = useToast();
  if (!driver) {
    return (
      <div className="card p-5">
        <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Your {role.toLowerCase()}</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="relative grid size-14 place-items-center rounded-full bg-surface-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-brand-300" aria-hidden />
            <Search className="size-5 text-brand-600" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">Matching a {role.toLowerCase()}…</p>
            <p className="text-sm text-text-2">{pendingText}</p>
          </div>
        </div>
      </div>
    );
  }
  const demo = (what: string) => toast({ title: `${what} is simulated`, body: `In this demo we don't connect you to ${driver.name.split(' ')[0]}. Number shown: ${maskPhone(driver.phone.replace(/\s/g, ''))}.`, tone: 'info' });
  return (
    <div className="card overflow-hidden">
      <div className="relative bg-ink-radial p-5 text-white">
        <div className="grid-lines absolute inset-0 opacity-50" aria-hidden />
        <div className="relative flex items-center gap-4">
          <Avatar src={driver.avatar} name={driver.name} size={60} ring />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.14em] text-go-300 uppercase">Your {role.toLowerCase()}</p>
            <p className="truncate font-display text-lg font-bold">{driver.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              <Star className="size-3.5 fill-go-500 text-go-500" aria-hidden /> <span className="font-semibold text-white">{driver.rating.toFixed(2)}</span> · {driver.trips.toLocaleString()} trips
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Vehicle</p>
            <p className="truncate text-sm font-semibold text-ink-900">{driver.vehicle}</p>
          </div>
          <span className="shrink-0 rounded-lg border-2 border-ink-900 bg-white px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-ink-900 shadow-soft" aria-label={`Plate number ${driver.plate}`}>
            {driver.plate}
          </span>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-2">
          <IdCard className="size-4 shrink-0 text-brand-600" aria-hidden /> ID details shown for demo — always match the plate before you hand over or hop on.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" iconLeft={<Phone className="size-4" />} onClick={() => demo('Calling')}>Call</Button>
          <Button variant="soft" iconLeft={<MessageCircle className="size-4" />} onClick={() => demo('Messaging')}>Message</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Not found ---------- */
export function TrackNotFound({ reference, samples, onPick, kind }: { reference: string; samples: string[]; onPick: (ref: string) => void; kind: 'booking' | 'delivery' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-2xl p-8 text-center sm:p-10" role="alert">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-crit-bg text-crit"><SearchX className="size-7" aria-hidden /></span>
      <h2 className="mt-5 text-2xl font-bold text-ink-900">We couldn't find that {kind}</h2>
      <p className="mx-auto mt-2 max-w-md text-text-2">
        No {kind} with reference <span className="font-mono font-semibold text-ink-900">{reference}</span> exists in this browser. Check for typos — references use letters and numbers only (no O, I, 0 or 1 confusion) — or try a demo reference.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {samples.map((s) => (
          <button key={s} type="button" onClick={() => onPick(s)} className="min-h-10 rounded-full border border-line-strong bg-white px-4 font-mono text-sm font-semibold text-ink-900 transition hover:border-go-400 hover:bg-go-50">
            {s}
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/contact" variant="ink" iconRight={<ArrowRight className="size-4" />}>Contact support</ButtonLink>
        <ButtonLink to={kind === 'delivery' ? '/delivery' : '/booking'} variant="outline">{kind === 'delivery' ? 'Schedule a delivery' : 'Book a ride'}</ButtonLink>
      </div>
    </motion.div>
  );
}

/* ---------- Intro (no reference yet) ---------- */
export function TrackIntro({ steps, aside }: { steps: { icon: ReactNode; title: string; body: string }[]; aside?: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card relative overflow-hidden p-5">
            <span className="absolute top-3 right-4 font-display text-5xl font-extrabold text-surface-2" aria-hidden>{i + 1}</span>
            <span className="relative grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 [&>svg]:size-5">{s.icon}</span>
            <p className="relative mt-4 font-display font-bold text-ink-900">{s.title}</p>
            <p className="relative mt-1 text-sm text-text-2">{s.body}</p>
          </motion.div>
        ))}
      </div>
      {aside}
    </div>
  );
}

/* ---------- Small helpers ---------- */
export function CopyChip({ text, label }: { text: string; label: string }) {
  const { copied, copy } = useCopy();
  const done = copied === text;
  return (
    <button type="button" onClick={() => copy(text, `${label} copied`)} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 font-mono text-sm font-semibold tracking-wide text-white transition hover:bg-white/10" aria-label={`Copy ${label} ${text}`}>
      {text}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={done ? 'y' : 'n'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
          {done ? <Check className="size-4 text-emerald-400" aria-hidden /> : <Copy className="size-4 text-white/60" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LiveAnnouncer({ message }: { message: string }) {
  return <p className="sr-only" aria-live="polite" aria-atomic="true">{message}</p>;
}

export function SectionCard({ title, icon, action, children, className }: { title: ReactNode; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('card p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink-900">
          {icon && <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700 [&>svg]:size-[18px]">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm not-last:border-b not-last:border-line">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink-900">{children}</dd>
    </div>
  );
}

export const SupportLinkInline = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="font-semibold text-brand-700 underline-offset-4 hover:underline">{children}</Link>
);
