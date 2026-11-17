import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, CircleAlert, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  id: string;
  children: ReactNode;
  optional?: boolean;
}

export function FieldShell({ label, hint, error, required, optional, className, id, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-center justify-between gap-2 text-sm font-semibold text-text">
          <span>
            {label}
            {required && <span className="ml-0.5 text-go-600" aria-hidden>*</span>}
          </span>
          {optional && <span className="text-xs font-medium text-muted">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-crit">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type Base = { label?: ReactNode; hint?: ReactNode; error?: string; optional?: boolean; wrapperClassName?: string; icon?: ReactNode };

export function Input({ label, hint, error, optional, wrapperClassName, icon, className, id, required, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted [&>svg]:size-[18px]">{icon}</span>}
        <input
          id={fid}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={cn('field-input', icon && 'pl-10', className)}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function Textarea({ label, hint, error, optional, wrapperClassName, className, id, required, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <textarea
        id={fid}
        required={required}
        rows={4}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn('field-input min-h-28 resize-y leading-relaxed', className)}
        {...rest}
      />
    </FieldShell>
  );
}

export interface Option { value: string; label: string; disabled?: boolean; group?: string }

export function Select({ label, hint, error, optional, wrapperClassName, className, id, required, options, placeholder, icon, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const groups = [...new Set(options.map((o) => o.group).filter(Boolean))] as string[];
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted [&>svg]:size-[18px]">{icon}</span>}
        <select
          id={fid}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={cn('field-input appearance-none pr-10', icon && 'pl-10', !rest.value && 'text-muted', className)}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {groups.length
            ? groups.map((g) => (
                <optgroup key={g} label={g}>
                  {options.filter((o) => o.group === g).map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
                </optgroup>
              ))
            : options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </FieldShell>
  );
}

export function Checkbox({ label, description, checked, onChange, name, className }: { label: ReactNode; description?: ReactNode; checked: boolean; onChange: (v: boolean) => void; name?: string; className?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('group flex cursor-pointer items-start gap-3 rounded-xl p-1', className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input id={id} name={name} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border-2 border-line-strong bg-white transition checked:border-go-500 checked:bg-go-500 focus-visible:outline-3 focus-visible:outline-brand-500" />
        <Check className="pointer-events-none relative size-3.5 scale-0 text-white transition peer-checked:scale-100" strokeWidth={3.5} aria-hidden />
      </span>
      <span className="text-sm">
        <span className="font-medium text-text">{label}</span>
        {description && <span className="block text-[13px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        {description && <p className="text-[13px] text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-go-500' : 'bg-line-strong')}
      >
        <span className="sr-only">{label}</span>
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={cn('absolute top-1 size-5 rounded-full bg-white shadow', checked ? 'right-1' : 'left-1')} />
      </button>
    </div>
  );
}

/** Segmented control — accessible radio group with animated thumb. */
export function Segmented<T extends string>({ value, onChange, options, label, size = 'md', className, dark }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; icon?: ReactNode }[]; label: string; size?: 'sm' | 'md'; className?: string; dark?: boolean }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn('relative inline-flex gap-1 rounded-2xl p-1', dark ? 'bg-white/10' : 'bg-surface-2', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const i = options.findIndex((x) => x.value === value);
              if (e.key === 'ArrowRight') onChange(options[(i + 1) % options.length].value);
              if (e.key === 'ArrowLeft') onChange(options[(i - 1 + options.length) % options.length].value);
            }}
            tabIndex={active ? 0 : -1}
            className={cn(
              'relative z-0 flex flex-1 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2.5 text-sm',
              active ? (dark ? 'text-ink-900' : 'text-ink-900') : dark ? 'text-white/70 hover:text-white' : 'text-text-2 hover:text-text',
            )}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 -z-10 rounded-xl bg-white shadow-soft" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Large selectable card used in radio-style choices. */
export function ChoiceCard({ selected, onSelect, title, description, icon, meta, badge, className, disabled }: { selected: boolean; onSelect: () => void; title: ReactNode; description?: ReactNode; icon?: ReactNode; meta?: ReactNode; badge?: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-2xl border-2 bg-white p-4 text-left transition-all duration-300',
        selected ? 'border-go-500 bg-go-50/60 shadow-[0_8px_28px_-12px_rgb(255_106_19/0.45)]' : 'border-line hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft',
        disabled && 'opacity-50',
        className,
      )}
    >
      {icon && <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition-colors [&>svg]:size-5', selected ? 'bg-go-500 text-white' : 'bg-brand-50 text-brand-700 group-hover:bg-brand-100')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-text">{title}</span>
          {badge}
        </span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-text-2">{description}</span>}
        {meta && <span className="mt-2 block text-[13px] font-semibold text-ink-700">{meta}</span>}
      </span>
      <span className={cn('mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition', selected ? 'border-go-500 bg-go-500' : 'border-line-strong')}>
        {selected && <Check className="size-3 text-white" strokeWidth={4} />}
      </span>
    </button>
  );
}

export function Stepper({ value, onChange, min = 1, max = 99, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line-strong bg-white p-1" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="grid size-10 place-items-center rounded-lg text-lg font-bold text-ink-800 transition hover:bg-surface-2 disabled:opacity-30">−</button>
      <output aria-live="polite" className="min-w-10 text-center font-display text-lg font-bold">{value}</output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="grid size-10 place-items-center rounded-lg text-lg font-bold text-ink-800 transition hover:bg-surface-2 disabled:opacity-30">+</button>
    </div>
  );
}
