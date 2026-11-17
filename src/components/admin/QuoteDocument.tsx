import { forwardRef } from 'react';
import type { QuoteRequest } from '@/types';
import { Logo } from '@/components/ui';
import { site } from '@/config/site';
import { junctionLabel } from '@/config/locations';
import { addDays, formatDate, formatTime, naira, titleCase } from '@/utils';

export interface QuoteDraft { lines: { label: string; amount: number }[]; notes: string; vat: boolean; validDays: number; preparedAt: string }
export const QUOTE_DRAFTS_KEY = 'admin-quote-drafts';
export const VAT_RATE = 0.075;

export const draftTotals = (d: QuoteDraft) => {
  const subtotal = d.lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const vat = d.vat ? Math.round(subtotal * VAT_RATE) : 0;
  return { subtotal, vat, total: subtotal + vat };
};

/** Branded, printable quotation (demo — not a tax invoice). */
export const QuoteDocument = forwardRef<HTMLDivElement, { quote: QuoteRequest; draft: QuoteDraft }>(function QuoteDocument({ quote: q, draft }, ref) {
  const t = draftTotals(draft);
  const issued = draft.preparedAt.slice(0, 10);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-xl border border-line bg-white p-6 text-[13px] text-text sm:p-10" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="-rotate-[28deg] font-display text-[120px] font-black tracking-widest text-ink-900/[0.05] sm:text-[160px]">DEMO</span>
      </div>
      <div aria-hidden className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-brand-700 via-brand-500 to-go-500" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Logo className="h-9 w-auto" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-2">{site.legalName}<br />{site.contact.address.line1}, {site.contact.address.line2}<br />{site.contact.address.city}, {site.contact.address.country}<br />{site.contact.businessEmail} · {site.contact.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold tracking-tight text-ink-900">QUOTATION</p>
            <dl className="mt-2 space-y-0.5 text-xs">
              <div className="flex justify-end gap-3"><dt className="text-muted">Reference</dt><dd className="font-mono font-semibold">{q.reference}</dd></div>
              <div className="flex justify-end gap-3"><dt className="text-muted">Issued</dt><dd>{formatDate(issued)}</dd></div>
              <div className="flex justify-end gap-3"><dt className="text-muted">Valid until</dt><dd>{formatDate(addDays(issued, draft.validDays))}</dd></div>
            </dl>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">Prepared for</p>
            <p className="mt-1.5 font-semibold text-ink-900">{q.fullName}</p>
            {q.companyName && <p>{q.companyName}</p>}
            <p className="text-text-2">{q.email}</p>
            <p className="text-text-2">{q.phone}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">Service</p>
            <p className="mt-1.5 font-semibold text-ink-900">{q.serviceCategory} · {titleCase(q.arrangement)}</p>
            <p className="text-text-2">{junctionLabel(q.pickup.cityId, q.pickup.junctionId)} → {junctionLabel(q.dropoff.cityId, q.dropoff.junctionId)}</p>
            <p className="text-text-2">{formatDate(q.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {formatTime(q.time)}{q.returnDate ? ` · return ${formatDate(q.returnDate)}` : ''}</p>
            {q.passengers ? <p className="text-text-2">{q.passengers} passengers</p> : null}
            {q.packageDetails && <p className="text-text-2">{q.packageDetails.packages} × {q.packageDetails.size} · {q.packageDetails.weightKg} kg</p>}
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-ink-900/80 text-[11px] tracking-wide text-ink-900 uppercase">
              <th className="py-2 font-semibold">#</th>
              <th className="py-2 font-semibold">Description</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {draft.lines.map((l, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2.5 pr-3 text-muted tabular-nums">{i + 1}</td>
                <td className="py-2.5">{l.label || '—'}</td>
                <td className="py-2.5 text-right tabular-nums">{naira(Number(l.amount) || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto w-full max-w-64 space-y-1.5">
          <div className="flex justify-between"><span className="text-text-2">Subtotal</span><span className="tabular-nums">{naira(t.subtotal)}</span></div>
          {draft.vat && <div className="flex justify-between"><span className="text-text-2">VAT (7.5%)</span><span className="tabular-nums">{naira(t.vat)}</span></div>}
          <div className="flex justify-between border-t-2 border-ink-900 pt-2 font-display text-lg font-bold text-ink-900"><span>Total</span><span className="tabular-nums">{naira(t.total)}</span></div>
        </div>

        {draft.notes && (
          <div className="mt-8 rounded-lg bg-surface-2 p-4">
            <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">Notes</p>
            <p className="mt-1 whitespace-pre-line text-text-2">{draft.notes}</p>
          </div>
        )}
        <p className="mt-8 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          DEMONSTRATION DOCUMENT — generated by the {site.name} demo console. Not a tax invoice and not a binding offer; prices are illustrative estimates. No payment details are requested on this document.
        </p>
      </div>
    </div>
  );
});

/** Print a single element via an isolated iframe that inherits the app's stylesheets. */
export function printElement(el: HTMLElement, title: string) {
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) return;
  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((n) => n.outerHTML).join('');
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${styles}<style>body{background:#fff;margin:24px}@page{margin:12mm}</style></head><body>${el.outerHTML}</body></html>`);
  doc.close();
  const go = () => {
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 1000);
  };
  setTimeout(go, 350);
}
