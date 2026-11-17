import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils';

/** Page header used inside the dashboard shell: eyebrow, title, subtitle and actions. */
export function DashPageHeader({ title, subtitle, actions, eyebrow, back, className }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode; back?: { to: string; label: string }; className?: string }) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="group mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-muted transition hover:text-ink-900">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-go-600 uppercase">{eyebrow}</p>}
        <h1 className="text-2xl leading-tight font-bold text-balance text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-text-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
    </header>
  );
}
