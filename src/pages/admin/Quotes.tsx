import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Building2, Check, Copy, Eye, FileText, Mail, MessageCircle, Package, Phone, Plus, Printer, Search, Trash2, Users, X } from 'lucide-react';
import type { QuoteRequest, QuoteStatus } from '@/types';
import { Avatar, Button, ExternalButton, Modal, StatusBadge } from '@/components/ui';
import { AdminHeader, ChipGroup, Kv, SearchField, ToolBtn } from '@/components/admin/kit';
import { QUOTE_DRAFTS_KEY, QuoteDocument, VAT_RATE, draftTotals, printElement, type QuoteDraft } from '@/components/admin/QuoteDocument';
import { customerWhatsapp, telHref } from '@/components/admin/data';
import { useQuotes } from '@/hooks/useData';
import { useMediaQuery, usePageMeta, useStore } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { quoteService } from '@/services/api';
import { storage } from '@/services/storage';
import { site } from '@/config/site';
import { cityName, junctionLabel } from '@/config/locations';
import { cn, formatDate, formatDateTime, formatTime, naira, timeAgo, titleCase } from '@/utils';

type Filter = 'all' | QuoteStatus;
const STATUSES: QuoteStatus[] = ['new', 'reviewing', 'quoted', 'accepted', 'declined'];
const readDrafts = () => storage.get<Record<string, QuoteDraft>>(QUOTE_DRAFTS_KEY, {});

function suggestLines(q: QuoteRequest): QuoteDraft['lines'] {
  if (q.packageDetails) {
    const p = q.packageDetails;
    return [
      { label: `Collection & handling — ${p.packages} package(s), ${p.weightKg} kg`, amount: Math.round(p.packages * 1500 + p.weightKg * 120) },
      { label: `${titleCase(q.arrangement)} delivery route`, amount: 18000 },
      { label: 'Proof of delivery & coordination', amount: 5000 },
    ];
  }
  const pax = q.passengers ?? 1;
  const vehicles = Math.max(1, Math.ceil(pax / 14));
  return [
    { label: `Vehicle hire — ${vehicles} × shuttle (${pax} passengers)`, amount: vehicles * 45000 },
    { label: 'Driver, fuel & tolls', amount: vehicles * 18000 },
    { label: q.returnDate || q.arrangement === 'round-trip' ? 'Return leg' : 'Trip coordination', amount: q.returnDate || q.arrangement === 'round-trip' ? vehicles * 30000 : 7500 },
  ];
}

export default function QuotesPage() {
  usePageMeta('Quote requests');
  const quotes = useQuotes();
  const drafts = useStore(QUOTE_DRAFTS_KEY, readDrafts);
  const toast = useToast();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [prep, setPrep] = useState(false);
  const [preview, setPreview] = useState(false);
  const closePrep = useCallback(() => setPrep(false), []);
  const closePreview = useCallback(() => setPreview(false), []);

  const sorted = useMemo(() => [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [quotes]);
  const list = sorted.filter((x) => (filter === 'all' || x.status === filter) && (!q.trim() || [x.fullName, x.companyName, x.reference, x.serviceCategory, x.email].join(' ').toLowerCase().includes(q.trim().toLowerCase())));
  useEffect(() => {
    if (wide && !selId && sorted[0]) setSelId(sorted[0].id);
  }, [wide, selId, sorted]);
  const sel = quotes.find((x) => x.id === selId) ?? null;
  const draft: QuoteDraft | undefined = sel
    ? drafts[sel.id] ?? (sel.quotedAmount ? { lines: [{ label: `${sel.serviceCategory} — ${titleCase(sel.arrangement)}`, amount: sel.quotedAmount }], notes: '', vat: false, validDays: 14, preparedAt: sel.createdAt } : undefined)
    : undefined;

  const setStatus = (x: QuoteRequest, status: QuoteStatus, msg: string) => {
    quoteService.update(x.id, { status });
    toast({ title: msg, body: x.reference });
  };

  const counts = Object.fromEntries(STATUSES.map((s) => [s, quotes.filter((x) => x.status === s).length])) as Record<QuoteStatus, number>;
  const pipeline = quotes.filter((x) => x.status === 'quoted').reduce((s, x) => s + (x.quotedAmount ?? 0), 0);
  const won = quotes.filter((x) => x.status === 'accepted').reduce((s, x) => s + (x.quotedAmount ?? 0), 0);

  const showList = wide || !sel;
  const showDetail = wide || !!sel;

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Sales"
        title="Quote requests"
        description="Shuttle, event, corporate and business delivery enquiries. Review, price and send branded quotations."
        actions={
          <div className="flex gap-2 text-xs">
            <span className="rounded-xl border border-line bg-white px-3 py-2"><span className="text-muted">Open pipeline</span> <b className="ml-1 text-ink-900 tabular-nums">{naira(pipeline)}</b></span>
            <span className="rounded-xl border border-line bg-white px-3 py-2"><span className="text-muted">Won</span> <b className="ml-1 text-ok tabular-nums">{naira(won)}</b></span>
          </div>
        }
      />

      <div className="grid overflow-hidden rounded-2xl border border-line bg-white lg:h-[calc(100dvh-230px)] lg:min-h-[620px] lg:grid-cols-[380px_minmax(0,1fr)]">
        {showList && (
          <aside aria-label="Quote list" className="flex min-h-0 flex-col border-line lg:border-r">
            <div className="space-y-2.5 border-b border-line p-3">
              <SearchField value={q} onChange={setQ} placeholder="Search name, company, ref…" label="Search quotes" />
              <ChipGroup label="Filter by status" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All', count: quotes.length }, ...STATUSES.map((s) => ({ value: s, label: titleCase(s), count: counts[s] }))]} />
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto" role="listbox" aria-label="Quote requests">
              {list.map((x) => (
                <li key={x.id} role="option" aria-selected={x.id === selId}>
                  <button type="button" onClick={() => setSelId(x.id)} className={cn('relative flex w-full gap-3 px-4 py-3 text-left transition', x.id === selId ? 'bg-brand-50' : 'hover:bg-surface-2/60')}>
                    {x.id === selId && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" />}
                    <Avatar name={x.fullName} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn('truncate text-sm text-ink-900', x.status === 'new' ? 'font-bold' : 'font-semibold')}>{x.fullName}</span>
                        {x.status === 'new' && <span className="size-2 shrink-0 rounded-full bg-go-500" aria-label="Unread" />}
                        <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(x.createdAt)}</span>
                      </span>
                      <span className="block truncate text-xs text-text-2">{x.companyName ?? 'Individual'} · {x.serviceCategory}</span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={x.status} />
                        {x.quotedAmount ? <span className="text-xs font-semibold text-ink-900 tabular-nums">{naira(x.quotedAmount)}</span> : null}
                        <span className="ml-auto truncate font-mono text-[10px] text-muted">{x.reference.slice(-9)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {!list.length && (
                <li className="grid place-items-center px-6 py-16 text-center text-sm text-muted"><Search className="mb-2 size-5" aria-hidden />No quotes match.</li>
              )}
            </ul>
          </aside>
        )}

        {showDetail && (
          <section aria-label="Quote detail" className="min-h-0 overflow-y-auto">
            {sel ? (
              <div>
                <div className="sticky top-0 z-[2] border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {!wide && <ToolBtn label="Back to list" onClick={() => setSelId(null)} className="px-2"><ArrowLeft /></ToolBtn>}
                    <h2 className="font-display text-lg font-bold text-ink-900">{sel.fullName}</h2>
                    <StatusBadge status={sel.status} />
                    <span className="font-mono text-xs text-muted">{sel.reference}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ToolBtn disabled={sel.status !== 'new'} onClick={() => setStatus(sel, 'reviewing', 'Marked as reviewing')}><Eye /> Mark reviewing</ToolBtn>
                    <Button size="sm" variant="brand" className="h-9" iconLeft={<FileText className="size-4" />} disabled={sel.status === 'accepted' || sel.status === 'declined'} onClick={() => setPrep(true)}>{sel.status === 'quoted' ? 'Revise quote' : 'Prepare quote'}</Button>
                    <ToolBtn disabled={sel.status !== 'quoted'} onClick={() => setStatus(sel, 'accepted', 'Quote accepted')}><Check /> Accept</ToolBtn>
                    <ToolBtn disabled={sel.status === 'declined' || sel.status === 'accepted'} onClick={() => setStatus(sel, 'declined', 'Quote declined')}><X /> Decline</ToolBtn>
                    <ToolBtn disabled={!draft} onClick={() => setPreview(true)} title={draft ? undefined : 'Prepare a quote first'}><Printer /> Document</ToolBtn>
                    <ToolBtn onClick={() => { void navigator.clipboard?.writeText(sel.reference); toast({ title: 'Reference copied', body: sel.reference, tone: 'info' }); }}><Copy /> Copy ref</ToolBtn>
                  </div>
                </div>

                <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Request</h3>
                      <div className="mt-3 rounded-2xl border border-line p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{sel.packageDetails ? <Package className="size-3.5" aria-hidden /> : <Users className="size-3.5" aria-hidden />}{sel.serviceCategory}</span>
                          <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text-2">{titleCase(sel.arrangement)}</span>
                          {sel.passengers ? <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text-2">{sel.passengers} passengers</span> : null}
                        </div>
                        <ol className="relative mt-4 space-y-4 pl-6">
                          <span aria-hidden className="absolute top-2 bottom-2 left-[7px] border-l-2 border-dashed border-line-strong" />
                          <li className="relative"><span aria-hidden className="absolute top-1 -left-6 size-3.5 rounded-full border-[3px] border-brand-500 bg-white" /><p className="text-sm font-semibold text-ink-900">{junctionLabel(sel.pickup.cityId, sel.pickup.junctionId)}</p><p className="text-xs text-muted">{sel.pickup.address} · {cityName(sel.pickup.cityId)}</p></li>
                          <li className="relative"><span aria-hidden className="absolute top-1 -left-6 size-3.5 rounded-[4px] border-[3px] border-go-500 bg-white" /><p className="text-sm font-semibold text-ink-900">{junctionLabel(sel.dropoff.cityId, sel.dropoff.junctionId)}</p><p className="text-xs text-muted">{sel.dropoff.address} · {cityName(sel.dropoff.cityId)}</p></li>
                        </ol>
                        <dl className="mt-4 grid gap-x-6 border-t border-line pt-2 sm:grid-cols-2">
                          <Kv label="Date">{formatDate(sel.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Kv>
                          <Kv label="Time">{formatTime(sel.time)}</Kv>
                          {sel.returnDate && <Kv label="Return">{formatDate(sel.returnDate)}</Kv>}
                          {sel.packageDetails && (
                            <>
                              <Kv label="Package">{sel.packageDetails.description}</Kv>
                              <Kv label="Size / weight">{titleCase(sel.packageDetails.size)} · {sel.packageDetails.weightKg} kg</Kv>
                              <Kv label="Packages">{sel.packageDetails.packages}</Kv>
                            </>
                          )}
                        </dl>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Description</h3>
                      <p className="mt-2 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed whitespace-pre-line text-text">{sel.description}</p>
                      {sel.requirements && (
                        <>
                          <h3 className="mt-5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Special requirements</h3>
                          <p className="mt-2 rounded-2xl border border-go-100 bg-go-50/60 p-4 text-sm text-text">{sel.requirements}</p>
                        </>
                      )}
                    </section>
                    {draft && (
                      <section>
                        <div className="flex items-center justify-between">
                          <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Prepared quote</h3>
                          <span className="text-xs text-muted">{formatDateTime(draft.preparedAt)}</span>
                        </div>
                        <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
                          {draft.lines.map((l, i) => <li key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm"><span className="text-text-2">{l.label}</span><span className="font-medium tabular-nums">{naira(l.amount)}</span></li>)}
                          {draft.vat && <li className="flex justify-between px-4 py-2.5 text-sm"><span className="text-text-2">VAT (7.5%)</span><span className="tabular-nums">{naira(draftTotals(draft).vat)}</span></li>}
                          <li className="flex justify-between bg-surface-2/60 px-4 py-3 font-semibold"><span>Total</span><span className="font-display text-ink-900 tabular-nums">{naira(draftTotals(draft).total)}</span></li>
                        </ul>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-line p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={sel.fullName} size={44} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{sel.fullName}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted">{sel.customerType === 'business' && <Building2 className="size-3" aria-hidden />}{sel.companyName ?? 'Individual customer'}</p>
                        </div>
                      </div>
                      <dl className="mt-3 divide-y divide-line border-t border-line">
                        <Kv label="Email"><a className="text-brand-700 hover:underline" href={`mailto:${sel.email}`}>{sel.email}</a></Kv>
                        <Kv label="Phone"><a className="text-brand-700 hover:underline" href={telHref(sel.phone)}>{sel.phone}</a></Kv>
                        <Kv label="Type">{titleCase(sel.customerType)}</Kv>
                        <Kv label="Received">{formatDateTime(sel.createdAt)}</Kv>
                        {sel.quotedAmount ? <Kv label="Quoted">{naira(sel.quotedAmount)}</Kv> : null}
                      </dl>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <ExternalButton size="sm" variant="outline" href={`mailto:${sel.email}?subject=${encodeURIComponent(`Your ${site.name} quote ${sel.reference}`)}&body=${encodeURIComponent(`Hello ${sel.fullName.split(' ')[0]},\n\nThank you for your ${sel.serviceCategory} request.${sel.quotedAmount ? ` Our quote is ${naira(sel.quotedAmount)} (estimate).` : ''}\n\nKind regards,\n${site.name} Operations`)}`} iconLeft={<Mail className="size-4" />}>Email</ExternalButton>
                        <ExternalButton size="sm" variant="outline" target="_blank" rel="noreferrer" href={customerWhatsapp(sel.phone, `Hello ${sel.fullName.split(' ')[0]}, this is ${site.name} about your quote request ${sel.reference}.`)} iconLeft={<MessageCircle className="size-4" />}>WhatsApp</ExternalButton>
                      </div>
                      <a href={telHref(sel.phone)} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-text-2 hover:bg-surface-2"><Phone className="size-3.5" aria-hidden />Call {sel.phone}</a>
                    </div>
                    <div className="rounded-2xl border border-line p-4">
                      <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Progress</h3>
                      <ol className="mt-3 space-y-2.5">
                        {(['new', 'reviewing', 'quoted', sel.status === 'declined' ? 'declined' : 'accepted'] as QuoteStatus[]).map((s) => {
                          const order = ['new', 'reviewing', 'quoted', 'accepted'];
                          const cur = sel.status === 'declined' ? -1 : order.indexOf(sel.status);
                          const done = s === 'declined' ? true : order.indexOf(s) <= cur;
                          return (
                            <li key={s} className="flex items-center gap-2.5 text-sm">
                              <span className={cn('grid size-5 place-items-center rounded-full', done ? (s === 'declined' ? 'bg-crit text-white' : 'bg-ok text-white') : 'bg-surface-2 ring-1 ring-line-strong')}>{done && (s === 'declined' ? <X className="size-3" aria-hidden /> : <Check className="size-3" strokeWidth={3} aria-hidden />)}</span>
                              <span className={done ? 'font-medium text-ink-900' : 'text-muted'}>{titleCase(s === 'new' ? 'received' : s)}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </aside>
                </div>
              </div>
            ) : (
              <div className="grid h-full min-h-80 place-items-center p-10 text-center text-sm text-muted">Select a quote request to view details.</div>
            )}
          </section>
        )}
      </div>

      {sel && <PrepareQuoteModal key={sel.id + String(prep)} open={prep} onClose={closePrep} quote={sel} existing={draft} onSaved={() => { setPrep(false); setPreview(true); }} />}
      {sel && draft && <PreviewModal open={preview} onClose={closePreview} quote={sel} draft={draft} />}
    </div>
  );
}

function PrepareQuoteModal({ open, onClose, quote, existing, onSaved }: { open: boolean; onClose: () => void; quote: QuoteRequest; existing?: QuoteDraft; onSaved: () => void }) {
  const toast = useToast();
  const [lines, setLines] = useState(existing?.lines ?? suggestLines(quote));
  const [notes, setNotes] = useState(existing?.notes ?? 'Prices are estimates and include driver, fuel and coordination. Final confirmation subject to vehicle availability.');
  const [vat, setVat] = useState(existing?.vat ?? true);
  const [validDays, setValidDays] = useState(existing?.validDays ?? 14);
  const t = draftTotals({ lines, notes, vat, validDays, preparedAt: '' });
  const valid = lines.length > 0 && lines.every((l) => l.label.trim() && Number(l.amount) > 0);

  const save = () => {
    if (!valid) return;
    const draft: QuoteDraft = { lines: lines.map((l) => ({ label: l.label.trim(), amount: Number(l.amount) })), notes, vat, validDays, preparedAt: new Date().toISOString() };
    storage.update<Record<string, QuoteDraft>>(QUOTE_DRAFTS_KEY, {}, (p) => ({ ...p, [quote.id]: draft }));
    quoteService.update(quote.id, { status: 'quoted', quotedAmount: t.total });
    toast({ title: 'Quote prepared', body: `${quote.reference} · ${naira(t.total)} — status set to Quoted.` });
    onSaved();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Prepare quote"
      description={`${quote.fullName}${quote.companyName ? ` · ${quote.companyName}` : ''} — ${quote.serviceCategory}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" disabled={!valid} onClick={save}>Save & mark quoted · {naira(t.total)}</Button>
        </>
      }
    >
      <fieldset>
        <legend className="text-sm font-semibold text-ink-900">Line items</legend>
        <ul className="mt-2 space-y-2">
          {lines.map((l, i) => (
            <li key={i} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`ql-${i}`}>Line {i + 1} description</label>
              <input id={`ql-${i}`} value={l.label} onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Description" className="h-10 min-w-0 flex-1 rounded-xl border border-line-strong px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15" />
              <label className="sr-only" htmlFor={`qa-${i}`}>Line {i + 1} amount in naira</label>
              <div className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">{site.currency.symbol}</span>
                <input id={`qa-${i}`} type="number" min={0} step={500} inputMode="numeric" value={l.amount || ''} onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))} className="h-10 w-full rounded-xl border border-line-strong pr-2 pl-7 text-right text-sm tabular-nums outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15" />
              </div>
              <button type="button" aria-label={`Remove line ${i + 1}`} disabled={lines.length <= 1} onClick={() => setLines((p) => p.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-crit-bg hover:text-crit disabled:opacity-30"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
        <ToolBtn className="mt-2" onClick={() => setLines((p) => [...p, { label: '', amount: 0 }])}><Plus /> Add line</ToolBtn>
      </fieldset>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-900"><input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} className="size-4 accent-brand-600" /> Add VAT ({(VAT_RATE * 100).toFixed(1)}%)</label>
        <label className="flex items-center justify-end gap-2 text-sm font-medium text-ink-900">Valid for
          <select value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} className="h-9 rounded-lg border border-line-strong px-2 text-sm">
            {[7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </label>
      </div>
      <label htmlFor="q-notes" className="mt-4 block text-sm font-semibold text-ink-900">Notes to customer</label>
      <textarea id="q-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="field-input mt-1.5 min-h-20 text-sm" />
      <dl className="mt-4 space-y-1 rounded-xl bg-surface-2 p-4 text-sm">
        <div className="flex justify-between"><dt className="text-text-2">Subtotal</dt><dd className="tabular-nums">{naira(t.subtotal)}</dd></div>
        {vat && <div className="flex justify-between"><dt className="text-text-2">VAT</dt><dd className="tabular-nums">{naira(t.vat)}</dd></div>}
        <div className="flex justify-between border-t border-line-strong pt-2 font-semibold"><dt>Total (estimate)</dt><dd className="font-display text-lg text-ink-900 tabular-nums">{naira(t.total)}</dd></div>
      </dl>
      {!valid && <p className="mt-2 text-xs font-medium text-crit">Every line needs a description and an amount above zero.</p>}
    </Modal>
  );
}

function PreviewModal({ open, onClose, quote, draft }: { open: boolean; onClose: () => void; quote: QuoteRequest; draft: QuoteDraft }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Quotation preview"
      description="Branded demo document — not a tax invoice."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <ExternalButton size="sm" variant="outline" href={`mailto:${quote.email}?subject=${encodeURIComponent(`Quotation ${quote.reference}`)}&body=${encodeURIComponent(`Hello ${quote.fullName.split(' ')[0]},\n\nPlease find our quotation ${quote.reference} for ${naira(draftTotals(draft).total)} (estimate). The PDF is attached.\n\n${site.name} Operations`)}`} iconLeft={<Mail className="size-4" />}>Email customer</ExternalButton>
          <Button size="sm" variant="brand" iconLeft={<Printer className="size-4" />} onClick={() => ref.current && printElement(ref.current, `Quotation ${quote.reference}`)}>Print / Save PDF</Button>
        </>
      }
    >
      <QuoteDocument ref={ref} quote={quote} draft={draft} />
    </Modal>
  );
}
