import type { ReactNode } from 'react';
import { FlaskConical, Info } from 'lucide-react';
import { Logo, StatusBadge } from '@/components/ui';
import type { FareLine, PaymentRecord } from '@/types';
import { cn, formatDateTime, naira } from '@/utils';
import { RouteTimeline, type RoutePoint } from './RouteTimeline';

export interface ReceiptProps {
  title?: string;
  bookingReference: string;
  payment: PaymentRecord;
  methodLabel: string;
  serviceName: string;
  bookedAt: string;
  routePoints: RoutePoint[];
  details: { label: string; value: ReactNode }[];
  lines: FareLine[];
  serviceCharge: number;
  discount: number;
  promoCode?: string;
  estimatedTotal: number;
  extraRefs?: { label: string; value: ReactNode }[];
  className?: string;
}

/** Itemised, printable booking receipt (demonstration). */
export function Receipt({ title = 'Booking receipt', bookingReference, payment, methodLabel, serviceName, bookedAt, routePoints, details, lines, serviceCharge, discount, promoCode, estimatedTotal, extraRefs = [], className }: ReceiptProps) {
  const confirmed = payment.amount;
  const diff = confirmed - estimatedTotal;
  const cash = payment.method === 'cash';
  return (
    <article aria-label={title} className={cn('overflow-hidden rounded-3xl border border-line bg-white shadow-lift print:rounded-none print:border-0 print:shadow-none', className)}>
      <header className="relative overflow-hidden bg-ink-900 px-6 py-6 text-white sm:px-8 print:bg-white print:text-ink-900">
        <span aria-hidden className="absolute -top-20 -right-10 size-56 rounded-full bg-go-500/25 blur-3xl print:hidden" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <Logo tone="light" className="w-36 print:hidden" />
            <Logo className="w-36 not-print:hidden" />
            <p className="mt-4 text-xs font-bold tracking-[0.16em] text-go-300 uppercase print:text-go-700">{title}</p>
            <p className="font-mono text-lg font-bold tracking-wide">{payment.reference}</p>
          </div>
          <div className="rotate-[-6deg] rounded-xl border-2 border-dashed border-go-400 px-3 py-1.5 text-center text-go-300 print:text-go-700">
            <p className="flex items-center gap-1 text-xs font-extrabold tracking-[0.2em] uppercase"><FlaskConical className="size-3.5" aria-hidden /> Demo</p>
            <p className="text-[10px] font-semibold">No real money</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {[
            { label: 'Booking reference', value: <span className="font-mono font-bold">{bookingReference}</span> },
            { label: 'Payment reference', value: <span className="font-mono font-bold">{payment.reference}</span> },
            { label: 'Payment method', value: methodLabel },
            { label: 'Payment status', value: <StatusBadge status={payment.status} /> },
            { label: 'Booked', value: formatDateTime(bookedAt) },
            { label: cash ? 'Payment selected' : 'Paid', value: formatDateTime(payment.createdAt) },
            ...extraRefs,
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-2.5">
              <dt className="text-text-2">{r.label}</dt>
              <dd className="text-right font-medium text-ink-900">{r.value}</dd>
            </div>
          ))}
        </dl>

        <section className="grid gap-6 rounded-2xl bg-surface-2/60 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Service</p>
            <p className="mt-1 font-display font-semibold text-ink-900">{serviceName}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              {details.map((d) => (
                <div key={d.label} className="flex gap-2">
                  <dt className="text-text-2">{d.label}:</dt>
                  <dd className="font-medium text-ink-900">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <RouteTimeline points={routePoints} animate={false} />
        </section>

        <section aria-label="Itemised charges">
          <table className="w-full text-sm">
            <caption className="sr-only">Itemised charges</caption>
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                <th scope="col" className="pb-2 font-semibold">Item</th>
                <th scope="col" className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.label} className="border-b border-line/70">
                  <td className="py-2 text-text-2">{l.label}</td>
                  <td className="py-2 text-right font-medium tabular-nums">{naira(l.amount)}</td>
                </tr>
              ))}
              <tr className="border-b border-line/70">
                <td className="py-2 text-text-2">Service & booking charges</td>
                <td className="py-2 text-right font-medium tabular-nums">{naira(serviceCharge)}</td>
              </tr>
              {discount > 0 && (
                <tr className="border-b border-line/70 text-ok">
                  <td className="py-2">Discount{promoCode ? ` (${promoCode})` : ''}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">−{naira(discount)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="pt-3 text-left font-display text-base font-bold text-ink-900">{cash ? 'Due in cash on completion' : 'Total paid (demo)'}</th>
                <td className="pt-3 text-right font-display text-xl font-extrabold text-ink-900 tabular-nums">{naira(confirmed)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line p-4">
            <p className="text-xs font-semibold text-muted">Estimated at booking</p>
            <p className="mt-1 font-display text-lg font-bold text-text-2 tabular-nums">{naira(estimatedTotal)}</p>
          </div>
          <div className="rounded-2xl border-2 border-ok/40 bg-ok-bg/50 p-4">
            <p className="text-xs font-semibold text-ok">Confirmed amount (demo)</p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900 tabular-nums">{naira(confirmed)}</p>
          </div>
          <div className="rounded-2xl border border-line p-4">
            <p className="text-xs font-semibold text-muted">Difference</p>
            <p className={cn('mt-1 font-display text-lg font-bold tabular-nums', diff < 0 ? 'text-ok' : diff > 0 ? 'text-warn' : 'text-text-2')}>{diff === 0 ? 'None' : `${diff < 0 ? '−' : '+'}${naira(Math.abs(diff))}`}</p>
          </div>
        </section>

        <p className="flex gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-brand-800">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Simulated transaction for demonstration only. No real money was charged and no real driver or rider has been dispatched. The estimate was calculated from distance, time, tier and demand; the confirmed amount reflects checkout adjustments such as promo codes.
        </p>
      </div>
    </article>
  );
}
