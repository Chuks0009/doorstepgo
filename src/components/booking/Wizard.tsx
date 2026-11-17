/* Shared building blocks for the multi-step booking wizards
   (ride, delivery) — step state, animated panels, headings that take focus,
   section cards, review blocks and the mobile bottom fare bar. */
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronUp, PencilLine } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import type { FareEstimate } from '@/types';
import { clamp, cn, naira } from '@/utils';
import { FareBreakdown } from './FareBreakdown';

/* ---------- Step state ---------- */
export function useWizard(total: number, topRef?: RefObject<HTMLElement | null>, initial = 0) {
  const [step, setStep] = useState(() => clamp(initial, 0, total - 1));
  const [dir, setDir] = useState(1);
  const [navigated, setNavigated] = useState(false);
  const [furthest, setFurthest] = useState(() => clamp(initial, 0, total - 1));

  const go = useCallback(
    (i: number) => {
      const target = clamp(i, 0, total - 1);
      setStep((cur) => {
        setDir(target >= cur ? 1 : -1);
        return target;
      });
      setFurthest((f) => Math.max(f, target));
      setNavigated(true);
      const el = topRef?.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 96;
        if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
      }
    },
    [total, topRef],
  );

  return {
    step,
    dir,
    go,
    next: () => go(step + 1),
    back: () => go(step - 1),
    /** true once the user has moved between steps — used to move focus to step headings. */
    navigated,
    furthest,
    isFirst: step === 0,
    isLast: step === total - 1,
  };
}

/* ---------- Animated step panel ---------- */
export function StepPanel({ stepKey, dir, children }: { stepKey: string | number; dir: number; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={stepKey}
        custom={dir}
        initial={{ opacity: 0, x: dir * 36 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: dir * -28 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Step heading (receives focus on step change) ---------- */
export function StepHeader({ index, total, title, subtitle, icon, focus }: { index: number; total: number; title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; focus?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mb-6 flex items-start gap-4">
      {icon && (
        <span className="relative hidden size-12 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white shadow-soft sm:grid [&>svg]:size-5">
          {icon}
          <span aria-hidden className="absolute -right-1 -bottom-1 h-1.5 w-6 skew-x-[-20deg] rounded-full bg-go-500" />
        </span>
      )}
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-go-600 uppercase">
          Step {index + 1} <span className="text-muted">/ {total}</span>
        </p>
        <h2 ref={ref} tabIndex={-1} className="mt-1 text-2xl font-bold text-ink-900 outline-none sm:text-[1.75rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 max-w-xl text-[15px] text-text-2">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ---------- Section card ---------- */
export function FormSection({ title, description, icon, children, className, action, tone = 'default' }: { title?: ReactNode; description?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string; action?: ReactNode; tone?: 'default' | 'go' | 'brand' }) {
  return (
    <section
      className={cn(
        'rounded-3xl border bg-white p-5 shadow-soft sm:p-7',
        tone === 'default' && 'border-line',
        tone === 'go' && 'border-go-200 bg-gradient-to-br from-go-50/70 to-white',
        tone === 'brand' && 'border-brand-100 bg-gradient-to-br from-brand-50/70 to-white',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 [&>svg]:size-[18px]">{icon}</span>}
            <div>
              {title && <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>}
              {description && <p className="mt-0.5 text-sm text-text-2">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Wizard navigation ---------- */
export function WizardNav({ onBack, isFirst, nextLabel = 'Continue', loading, nextIcon, hideNextOnMobile, extra }: { onBack: () => void; isFirst: boolean; nextLabel?: ReactNode; loading?: boolean; nextIcon?: ReactNode; hideNextOnMobile?: boolean; extra?: ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      {isFirst ? (
        <span />
      ) : (
        <Button variant="outline" size="lg" onClick={onBack} iconLeft={<ArrowLeft className="size-4" />}>
          Back
        </Button>
      )}
      <div className="flex items-center gap-3">
        {extra}
        <Button type="submit" size="lg" loading={loading} iconRight={nextIcon ?? <ArrowRight className="size-4" />} className={cn(hideNextOnMobile && 'max-lg:hidden')}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Review block ---------- */
export function ReviewBlock({ title, icon, onEdit, children, editLabel }: { title: string; icon?: ReactNode; onEdit?: () => void; children: ReactNode; editLabel?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 font-display text-base font-semibold text-ink-900">
          {icon && <span className="grid size-8 place-items-center rounded-lg bg-surface-2 text-brand-700 [&>svg]:size-4">{icon}</span>}
          {title}
        </h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50" aria-label={editLabel ?? `Edit ${title.toLowerCase()}`}>
            <PencilLine className="size-4" aria-hidden /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ReviewGrid({ items }: { items: { label: string; value: ReactNode; wide?: boolean }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className={cn('min-w-0', it.wide && 'sm:col-span-2')}>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{it.label}</dt>
          <dd className="mt-0.5 text-[15px] font-medium break-words text-ink-900">{it.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Mobile bottom fare bar + sheet ---------- */
export function MobileFareBar({ fare, cta, sheetExtra, label = 'Estimated total' }: { fare: FareEstimate | null; cta?: ReactNode; sheetExtra?: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_-16px_rgb(10_22_64/0.35)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 py-3 pr-20 pl-4 sm:pr-24">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-12 min-w-0 flex-1 flex-col items-start rounded-xl text-left" aria-label="View fare breakdown" aria-haspopup="dialog">
            <span className="flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              {label} <ChevronUp className="size-3.5" aria-hidden />
            </span>
            <span aria-live="polite" className="font-display text-xl font-extrabold text-ink-900 tabular-nums">
              {fare ? naira(fare.total) : '₦ —'}
            </span>
          </button>
          {cta}
        </div>
      </div>
      <Modal open={open} onClose={close} title="Fare breakdown" description="Illustrative estimate — confirmed at checkout (demo).">
        <FareBreakdown fare={fare} />
        {sheetExtra && <div className="mt-4">{sheetExtra}</div>}
      </Modal>
    </>
  );
}

/** Visually-hidden live region announcing the fare as it changes. */
export function FareAnnouncer({ fare }: { fare: FareEstimate | null }) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {fare ? `Estimated total ${naira(fare.total)}, about ${fare.distanceKm} kilometres.` : 'Fare estimate not available yet.'}
    </p>
  );
}

/** Small decorative speed-lines cluster (brand motif). */
export function SpeedLines({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none flex flex-col gap-1.5', className)}>
      {[100, 70, 85].map((w, i) => (
        <span key={i} className="h-[3px] animate-speed rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: `${w}%`, animationDelay: `${i * 0.3}s` }} />
      ))}
    </span>
  );
}
