/* Admin console UI kit — dense, Linear/Stripe-style building blocks. */
import { useId, useRef, useState, type ReactNode, type SelectHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, FlaskConical, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { cn } from '@/utils';
import { useDismiss } from '@/hooks';
import { Sparkline } from './charts';

/* ---------- Demo indicator ---------- */
export function DemoPill({ className }: { className?: string }) {
  return (
    <span role="note" className={cn('inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-300 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700', className)}>
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-60 motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-brand-500" />
      </span>
      <FlaskConical className="size-3" aria-hidden />
      Demo console — simulated data
    </span>
  );
}

/* ---------- Page header ---------- */
export function AdminHeader({ eyebrow, title, description, actions, children }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow && <span className="text-[11px] font-bold tracking-[0.14em] text-brand-700 uppercase">{eyebrow}</span>}
            <DemoPill />
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-text-2">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

/* ---------- Panel ---------- */
export function Panel({ title, subtitle, action, children, className, bodyClassName, id }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string }) {
  return (
    <section id={id} aria-label={typeof title === 'string' ? title : undefined} className={cn('min-w-0 rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgb(10_22_64/0.04)]', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-[15px] font-semibold text-ink-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- KPI tile ---------- */
export function KpiTile({ label, value, delta, series, icon, hint, invert, color = '#1F5FE6' }: { label: string; value: ReactNode; delta?: number; series?: number[]; icon?: ReactNode; hint?: string; invert?: boolean; color?: string }) {
  const up = (delta ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(10_22_64/0.04)] transition hover:border-brand-200 hover:shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold text-text-2">{label}</p>
        {icon && <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 [&>svg]:size-3.5">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 tabular-nums">{value}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {delta !== undefined && (
            <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums', good ? 'text-ok' : 'text-crit')}>
              {up ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
              {up ? '+' : ''}
              {delta.toFixed(1)}%
              <span className="sr-only">{good ? '(improving)' : '(worsening)'}</span>
            </span>
          )}
          {hint && <p className="truncate text-[11px] text-muted">{hint}</p>}
        </div>
        {series && <Sparkline data={series} color={color} className="h-8 w-20 shrink-0" label={`${label} trend`} />}
      </div>
    </div>
  );
}

/* ---------- Controls ---------- */
export function SearchField({ value, onChange, placeholder = 'Search…', label = 'Search', className }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; className?: string }) {
  const id = useId();
  return (
    <div className={cn('relative min-w-0', className)}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-line-strong bg-white pr-9 pl-9 text-sm text-text outline-none placeholder:text-muted hover:border-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function MiniSelect({ label, options, className, srLabel = true, ...rest }: { label: string; options: { value: string; label: string }[]; srLabel?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={cn('relative flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={id} className={srLabel ? 'sr-only' : 'text-xs font-semibold text-text-2'}>{label}</label>
      <div className="relative">
        <select id={id} className="h-10 w-full appearance-none rounded-xl border border-line-strong bg-white pr-8 pl-3 text-sm font-medium text-text outline-none hover:border-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15" {...rest}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </div>
  );
}

export function ToolBtn({ children, onClick, active, label, className, disabled, type = 'button', ...rest }: { children: ReactNode; onClick?: () => void; active?: boolean; label?: string; className?: string; disabled?: boolean; type?: 'button' | 'submit' } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-45 [&>svg]:size-4',
        active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line-strong bg-white text-text-2 hover:border-brand-300 hover:text-ink-900',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** View switcher (radiogroup). */
export function ViewSwitch<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line-strong bg-surface-2 p-0.5">
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onChange(options[(i + 1) % options.length].value);
              if (e.key === 'ArrowLeft') onChange(options[(i - 1 + options.length) % options.length].value);
            }}
            className={cn('relative inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold transition [&>svg]:size-4', active ? 'text-ink-900' : 'text-text-2 hover:text-ink-900')}
          >
            {active && <motion.span layoutId={`vs-${label}`} className="absolute inset-0 rounded-[10px] bg-white shadow-soft" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative inline-flex items-center gap-1.5">{o.icon}{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Chip-style filter group (single select). */
export function ChipGroup<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="scrollbar-none flex gap-1.5 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn('inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition', o.value === value ? 'border-ink-900 bg-ink-900 text-white' : 'border-line-strong bg-white text-text-2 hover:border-brand-300 hover:text-ink-900')}
        >
          {o.label}
          {o.count !== undefined && <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', o.value === value ? 'bg-white/20' : 'bg-surface-2')}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Table helpers ---------- */
export type SortDir = 'asc' | 'desc';
export function SortTh<K extends string>({ k, sort, onSort, children, className, align = 'left' }: { k: K; sort: { key: K; dir: SortDir }; onSort: (k: K) => void; children: ReactNode; className?: string; align?: 'left' | 'right' }) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-3 py-2.5 font-semibold', align === 'right' && 'text-right', className)}>
      <button type="button" onClick={() => onSort(k)} className={cn('inline-flex items-center gap-1 rounded hover:text-ink-900', active && 'text-ink-900', align === 'right' && 'flex-row-reverse')}>
        {children}
        <Icon className={cn('size-3', !active && 'opacity-40')} aria-hidden />
      </button>
    </th>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th scope="col" className={cn('px-3 py-2.5 font-semibold', className)}>{children}</th>;
}

export const tableCls = {
  wrap: 'overflow-x-auto',
  table: 'w-full min-w-[760px] border-collapse text-left text-sm',
  head: 'sticky top-0 z-[1] border-b border-line bg-surface-2/70 text-[11px] tracking-wide text-muted uppercase backdrop-blur',
  row: 'border-b border-line last:border-0 transition-colors hover:bg-brand-50/40',
  td: 'px-3 py-2.5 align-middle',
};

export function Pagination({ page, pages, onPage, total, pageSize }: { page: number; pages: number; onPage: (p: number) => void; total: number; pageSize: number }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-text-2">
      <span className="tabular-nums">{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <ToolBtn label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-2"><ChevronLeft /></ToolBtn>
        <span className="px-2 font-semibold tabular-nums" aria-current="page">{page} / {Math.max(1, pages)}</span>
        <ToolBtn label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="px-2"><ChevronRight /></ToolBtn>
      </div>
    </nav>
  );
}

/* ---------- Dropdown menu ---------- */
export function Menu({ trigger, items, label, align = 'right' }: { trigger: ReactNode; items: { label: string; onSelect: () => void; icon?: ReactNode; disabled?: boolean; danger?: boolean }[]; label: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useDismiss(ref, () => setOpen(false), open);
  const focusItem = (dir: 1 | -1) => {
    const els = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])];
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    els[(i + dir + els.length) % els.length]?.focus();
  };
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          requestAnimationFrame(() => listRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
        }}
        className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink-900"
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(1); }
              if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(-1); }
            }}
            className={cn('absolute top-9 z-30 min-w-52 rounded-xl border border-line bg-white p-1 shadow-lift', align === 'right' ? 'right-0' : 'left-0')}
          >
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  it.onSelect();
                }}
                className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition disabled:opacity-40 [&>svg]:size-4', it.danger ? 'text-crit hover:bg-crit-bg' : 'text-text hover:bg-surface-2')}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Key/value ---------- */
export function Kv({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={cn('min-w-0 text-right font-medium text-ink-900', mono && 'font-mono text-[13px]')}>{children}</dd>
    </div>
  );
}

export function DrawerSection({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Small native checkbox, styled. */
export function Tick({ checked, onChange, label, indeterminate }: { checked: boolean; onChange: (v: boolean) => void; label: string; indeterminate?: boolean }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate;
      }}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="size-4 cursor-pointer rounded border-line-strong accent-brand-600"
    />
  );
}

export function Dot({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-2 shrink-0 rounded-full', className)} style={{ background: color }} />;
}

export function Legend({ items, className }: { items: { label: string; color: string; value?: ReactNode }[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-2', className)}>
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
          {i.value !== undefined && <span className="font-semibold text-ink-900 tabular-nums">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}
