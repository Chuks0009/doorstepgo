import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Check, Circle, ChevronRight, FlaskConical, Home, ImageOff, Star } from 'lucide-react';
import { iconRegistry } from './iconRegistry';
import { cn, initials } from '@/utils';
import { site } from '@/config/site';
import type { BookingStatus, DeliveryStage, PaymentStatus, QuoteStatus } from '@/types';
import { useTilt } from '@/hooks';

/* ---------- Dynamic lucide icon by name (used by data-driven content) ---------- */
export function Icon({ name, className, ...rest }: { name: string; className?: string; strokeWidth?: number }) {
  const C = iconRegistry[name] ?? Circle;
  return <C className={className} aria-hidden {...rest} />;
}

/* ---------- Logo ---------- */
export function Logo({ variant = 'full', className, tone = 'dark' }: { variant?: 'full' | 'mark'; className?: string; tone?: 'dark' | 'light' }) {
  const src = variant === 'mark' ? site.logo.mark : tone === 'light' ? site.logo.light : site.logo.full;
  return <img src={src} alt={site.logo.alt} className={cn('block max-w-full select-none', className)} draggable={false} />;
}

/* ---------- Badges ---------- */
type Tone = 'neutral' | 'brand' | 'go' | 'ok' | 'warn' | 'crit' | 'info' | 'ink';
const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-text-2 ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  go: 'bg-go-50 text-go-700 ring-go-100',
  ok: 'bg-ok-bg text-ok ring-emerald-100',
  warn: 'bg-warn-bg text-warn ring-amber-100',
  crit: 'bg-crit-bg text-crit ring-red-100',
  info: 'bg-info-bg text-info ring-brand-100',
  ink: 'bg-ink-900 text-white ring-ink-800',
};

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const statusMap: Record<BookingStatus | DeliveryStage | PaymentStatus | QuoteStatus | string, [Tone, string]> = {
  pending: ['warn', 'Pending'],
  confirmed: ['brand', 'Confirmed'],
  driver_assigned: ['info', 'Driver assigned'],
  driver_arriving: ['go', 'Driver arriving'],
  in_progress: ['go', 'In progress'],
  completed: ['ok', 'Completed'],
  cancelled: ['crit', 'Cancelled'],
  cancellation_requested: ['warn', 'Cancellation requested'],
  modification_requested: ['warn', 'Change requested'],
  received: ['brand', 'Received'],
  rider_assigned: ['info', 'Rider assigned'],
  heading_to_pickup: ['info', 'Heading to pickup'],
  collected: ['go', 'Collected'],
  in_transit: ['go', 'In transit'],
  approaching: ['go', 'Approaching'],
  delivered: ['ok', 'Delivered'],
  unpaid: ['neutral', 'Unpaid'],
  paid_demo: ['ok', 'Paid (demo)'],
  refunded_demo: ['neutral', 'Refunded (demo)'],
  failed: ['crit', 'Failed'],
  new: ['go', 'New'],
  reviewing: ['info', 'Reviewing'],
  quoted: ['brand', 'Quoted'],
  accepted: ['ok', 'Accepted'],
  declined: ['crit', 'Declined'],
  lead: ['go', 'Lead'],
  onboarding: ['info', 'Onboarding'],
  active: ['ok', 'Active'],
  paused: ['neutral', 'Paused'],
  open: ['warn', 'Open'],
  resolved: ['ok', 'Resolved'],
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const [tone, label] = statusMap[status] ?? ['neutral', status];
  return <Badge tone={tone} dot className={className}>{label}</Badge>;
}

/* ---------- Section heading ---------- */
export function SectionHeading({ eyebrow, title, subtitle, align = 'left', dark, className, action }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; align?: 'left' | 'center'; dark?: boolean; className?: string; action?: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <Reveal><span className={dark ? 'eyebrow-dark' : 'eyebrow'}>{eyebrow}</span></Reveal>}
        <Reveal delay={0.05}>
          <h2 className={cn('mt-4 text-3xl leading-[1.1] font-bold text-balance sm:text-4xl lg:text-[2.75rem]', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className={cn('mt-4 text-base leading-relaxed text-pretty sm:text-lg', dark ? 'text-white/70' : 'text-text-2')}>{subtitle}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.15} className="shrink-0">{action}</Reveal>}
    </div>
  );
}

/* ---------- Scroll reveal ---------- */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div', ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const M = as === 'li' ? motion.li : as === 'section' ? motion.section : motion.div;
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...(rest as object)}
    >
      {children}
    </M>
  );
}

/* ---------- 3D tilt card with glare ---------- */
export function TiltCard({ children, className, max = 8, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useTilt<HTMLDivElement>(max);
  return (
    <div ref={ref} className={cn('group/tilt relative transition-transform duration-300 ease-out will-change-transform preserve-3d', className)}>
      {children}
      {glare && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgb(255 255 255 / 0.22), transparent 45%)' }}
        />
      )}
    </div>
  );
}

/* ---------- Image with skeleton + branded fallback ---------- */
export function SmartImage({ src, alt, className, imgClassName, eager, sizes }: { src: string; alt: string; className?: string; imgClassName?: string; eager?: boolean; sizes?: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error');
  return (
    <div className={cn(!/\b(absolute|fixed|sticky)\b/.test(className ?? '') && 'relative', 'overflow-hidden bg-surface-2', className)}>
      {state === 'loading' && <div className="skeleton absolute inset-0" aria-hidden />}
      {state === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-ink-radial text-white/60" role="img" aria-label={alt}>
          <div className="flex flex-col items-center gap-2">
            <ImageOff className="size-7" aria-hidden />
            <Logo variant="mark" className="w-14 opacity-80" />
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cn('size-full object-cover transition-all duration-700 ease-out-expo', state === 'ok' ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm', imgClassName)}
        />
      )}
    </div>
  );
}

/* ---------- Breadcrumbs ---------- */
export function Breadcrumbs({ items, dark }: { items: { label: string; to?: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-[13px] font-medium', dark ? 'text-white/60' : 'text-muted')}>
        <li>
          <Link to="/" className={cn('flex items-center gap-1 rounded-md transition', dark ? 'hover:text-white' : 'hover:text-ink-900')}>
            <Home className="size-3.5" aria-hidden /> <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 opacity-50" aria-hidden />
            {it.to && i < items.length - 1 ? (
              <Link to={it.to} className={cn('rounded-md transition', dark ? 'hover:text-white' : 'hover:text-ink-900')}>{it.label}</Link>
            ) : (
              <span aria-current="page" className={dark ? 'text-white' : 'text-ink-900'}>{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------- Demo notice ---------- */
export function DemoNotice({ children, className, compact }: { children?: ReactNode; className?: string; compact?: boolean }) {
  return (
    <div role="note" className={cn('flex items-start gap-2.5 rounded-xl border border-dashed border-brand-200 bg-brand-50/70 text-brand-800', compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-[13px]', className)}>
      <FlaskConical className={cn('mt-0.5 shrink-0', compact ? 'size-3.5' : 'size-4')} aria-hidden />
      <p className="leading-relaxed">{children ?? site.demoNotice}</p>
    </div>
  );
}

/* ---------- Stars ---------- */
export function Stars({ value, size = 'sm', className }: { value: number; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={cn(size === 'sm' ? 'size-3.5' : 'size-5', i <= Math.round(value) ? 'fill-go-500 text-go-500' : 'fill-line text-line')} />
      ))}
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ src, name, size = 40, className, ring }: { src?: string; name: string; size?: number; className?: string; ring?: boolean }) {
  const [err, setErr] = useState(false);
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-sheen font-display font-bold text-white', ring && 'ring-2 ring-white', className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {src && !err ? <img src={src} alt="" className="size-full object-cover" onError={() => setErr(true)} loading="lazy" /> : initials(name)}
    </span>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = 'Inbox', title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon name={icon} className="size-6" /></span>
      <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
      {body && <p className="max-w-sm text-sm text-text-2">{body}</p>}
      {action}
    </div>
  );
}

/* ---------- Progress steps (wizard indicator) ---------- */
export function ProgressSteps({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (i: number) => void }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none sm:gap-2">
              <button
                type="button"
                disabled={!done || !onStepClick}
                onClick={() => onStepClick?.(i)}
                aria-current={active ? 'step' : undefined}
                className="flex items-center gap-2.5 disabled:cursor-default"
              >
                <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold sm:size-9 sm:text-sm transition-all duration-500', done && 'bg-ok text-white', active && 'bg-go-sheen text-white shadow-glow-go', !done && !active && 'bg-surface-2 text-muted ring-1 ring-line-strong')}>
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  {active && <span className="absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-go-500" aria-hidden />}
                </span>
                <span className={cn('hidden text-sm font-semibold lg:block', active ? 'text-ink-900' : done ? 'text-text-2' : 'text-muted')}>{s}</span>
              </button>
              {i < steps.length - 1 && (
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <motion.span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ok to-go-500" initial={false} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold text-ink-900 lg:hidden">Step {current + 1} of {steps.length}: <span className="text-text-2">{steps[current]}</span></p>
    </nav>
  );
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('scrollbar-none flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={active} onClick={() => onChange(t.value)} className={cn('relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors', active ? 'text-ink-900' : 'text-muted hover:text-text')}>
            {t.label}
            {t.count !== undefined && <span className={cn('rounded-full px-2 py-0.5 text-[11px]', active ? 'bg-go-500 text-white' : 'bg-surface-2 text-text-2')}>{t.count}</span>}
            {active && <motion.span layoutId={`tab-underline-${tabs.map((x) => x.value).join('')}`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-go-500" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...rest}>{children}</div>;
}
