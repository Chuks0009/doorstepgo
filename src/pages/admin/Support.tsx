import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCheck, Copy, Inbox, Mail, MessageSquareWarning, Phone, Send, Sparkles } from 'lucide-react';
import { Avatar, Button, EmptyState, StatusBadge } from '@/components/ui';
import { AdminHeader, ChipGroup, MiniSelect, SearchField, ToolBtn } from '@/components/admin/kit';
import { telHref } from '@/components/admin/data';
import { useMessages } from '@/hooks/useData';
import { useMediaQuery, usePageMeta, useStore } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { supportService } from '@/services/api';
import { KEYS, storage } from '@/services/storage';
import { site } from '@/config/site';
import { cn, formatDateTime, timeAgo, titleCase } from '@/utils';

interface Complaint { id: string; ticket: string; reference: string; category: string; details: string; createdAt: string }
interface Ticket { id: string; kind: 'message' | 'complaint'; ref: string; name: string; email?: string; phone?: string; subject: string; category: string; body: string; createdAt: string; status: 'open' | 'resolved'; bookingRef?: string }
interface Reply { at: string; body: string; author: string }

const RESOLVED_KEY = 'admin-complaints-resolved';
const REPLIES_KEY = 'admin-support-replies';
const readComplaints = () => storage.get<Complaint[]>(KEYS.complaints, []);
const readResolved = () => storage.get<string[]>(RESOLVED_KEY, []);
const readReplies = () => storage.get<Record<string, Reply[]>>(REPLIES_KEY, {});

const TEMPLATES = [
  { label: 'Acknowledge', body: 'Thanks for reaching out — we have received your message and a member of our operations team is looking into it now.' },
  { label: 'Refund (demo)', body: 'We have issued a simulated refund for this booking. In the live service, refunds reach your account within 3–5 working days.' },
  { label: 'Need details', body: 'Could you share your booking reference and the approximate time of the trip so we can investigate?' },
];

const SAMPLES = [
  { name: 'Tolu Bankole', email: 'tolu@example.com', phone: '0803 555 2121', subject: 'Rider arrived late for school run', category: 'Ride issue', message: 'Our tricycle arrived 20 minutes late this morning and the kids missed assembly. Can this be prevented going forward?' },
  { name: 'Emeka Obi', email: 'emeka@example.com', phone: '0805 222 8787', subject: 'Business account for 3 branches', category: 'Business enquiry', message: 'We run three pharmacies in Awka (Ifite, Temp Site and Eke Awka) and want daily inter-branch deliveries. Do you offer monthly invoicing?' },
  { name: 'Hauwa Sani', email: 'hauwa@example.com', subject: 'Delivery code not received', category: 'Delivery issue', message: 'My sister has not received the SMS with the delivery code for her parcel. The rider is waiting outside.' },
];

export default function SupportPage() {
  usePageMeta('Support inbox');
  const messages = useMessages();
  const complaints = useStore(KEYS.complaints, readComplaints);
  const resolved = useStore(RESOLVED_KEY, readResolved);
  const replies = useStore(REPLIES_KEY, readReplies);
  const toast = useToast();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [status, setStatus] = useState<'open' | 'resolved' | 'all'>('open');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [seeding, setSeeding] = useState(false);

  const tickets = useMemo<Ticket[]>(
    () =>
      [
        ...messages.map((m): Ticket => ({ id: m.id, kind: 'message', ref: m.reference, name: m.name, email: m.email, phone: m.phone, subject: m.subject, category: m.category, body: m.message, createdAt: m.createdAt, status: m.status })),
        ...complaints.map((c): Ticket => ({ id: c.id, kind: 'complaint', ref: c.ticket, name: 'Signed-in customer', subject: `Complaint about ${c.reference}`, category: c.category, body: c.details, createdAt: c.createdAt, status: resolved.includes(c.id) ? 'resolved' : 'open', bookingRef: c.reference })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [messages, complaints, resolved],
  );
  const categories = [...new Set(tickets.map((t) => t.category))].sort();
  const list = tickets.filter((t) => (status === 'all' || t.status === status) && (type === 'all' || t.kind === type) && (category === 'all' || t.category === category) && (!q.trim() || [t.name, t.subject, t.body, t.ref, t.email].join(' ').toLowerCase().includes(q.trim().toLowerCase())));
  useEffect(() => {
    if (wide && !selId && list[0]) setSelId(list[0].id);
  }, [wide, selId, list]);
  const sel = tickets.find((t) => t.id === selId) ?? null;
  useEffect(() => setDraft(''), [selId]);

  const resolve = (t: Ticket) => {
    if (t.kind === 'message') supportService.resolve(t.id);
    else storage.update<string[]>(RESOLVED_KEY, [], (p) => [...new Set([...p, t.id])]);
    toast({ title: 'Ticket resolved', body: t.ref });
  };
  const send = (andResolve: boolean) => {
    if (!sel || !draft.trim()) return;
    storage.update<Record<string, Reply[]>>(REPLIES_KEY, {}, (p) => ({ ...p, [sel.id]: [...(p[sel.id] ?? []), { at: new Date().toISOString(), body: draft.trim(), author: 'Ops Admin' }] }));
    setDraft('');
    if (andResolve) resolve(sel);
    toast({ title: 'Reply sent (demo)', body: `Saved to ${sel.ref}. No email or SMS was actually delivered.`, tone: 'info' });
  };
  const loadSamples = async () => {
    setSeeding(true);
    await Promise.all(SAMPLES.map((s) => supportService.contact(s)));
    setSeeding(false);
    setStatus('open');
    toast({ title: 'Sample tickets added', body: '3 demo contact-form submissions created.' });
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const showList = wide || !sel;
  const showDetail = wide || !!sel;

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Customer care"
        title="Support inbox"
        description="Contact-form messages and booking complaints. Replies are stored locally for the demo — nothing is emailed."
        actions={<ToolBtn onClick={loadSamples} disabled={seeding}><Sparkles /> {seeding ? 'Adding…' : 'Add sample tickets'}</ToolBtn>}
      />

      {!tickets.length ? (
        <EmptyState icon="Inbox" title="Inbox zero" body="No contact messages or complaints yet. Submit the public contact form or a complaint from a booking — or add sample tickets to explore the workflow." action={<Button variant="brand" size="sm" loading={seeding} onClick={loadSamples}>Add sample tickets</Button>} />
      ) : (
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white lg:h-[calc(100dvh-230px)] lg:min-h-[600px] lg:grid-cols-[380px_minmax(0,1fr)]">
          {showList && (
            <aside aria-label="Tickets" className="flex min-h-0 flex-col border-line lg:border-r">
              <div className="space-y-2.5 border-b border-line p-3">
                <SearchField value={q} onChange={setQ} placeholder="Search tickets…" label="Search tickets" />
                <ChipGroup label="Status" value={status} onChange={setStatus} options={[{ value: 'open', label: 'Open', count: openCount }, { value: 'resolved', label: 'Resolved', count: tickets.length - openCount }, { value: 'all', label: 'All', count: tickets.length }]} />
                <div className="grid grid-cols-2 gap-2">
                  <MiniSelect label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: 'all', label: 'All types' }, { value: 'message', label: 'Messages' }, { value: 'complaint', label: 'Complaints' }]} />
                  <MiniSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
                </div>
              </div>
              <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto" role="listbox" aria-label="Tickets">
                {list.map((t) => (
                  <li key={t.id} role="option" aria-selected={t.id === selId}>
                    <button type="button" onClick={() => setSelId(t.id)} className={cn('relative flex w-full gap-3 px-4 py-3 text-left transition', t.id === selId ? 'bg-brand-50' : 'hover:bg-surface-2/60')}>
                      {t.id === selId && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" />}
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', t.kind === 'complaint' ? 'bg-crit-bg text-crit' : 'bg-brand-50 text-brand-700')}>{t.kind === 'complaint' ? <MessageSquareWarning className="size-4" aria-hidden /> : <Mail className="size-4" aria-hidden />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn('truncate text-sm text-ink-900', t.status === 'open' ? 'font-bold' : 'font-medium')}>{t.subject}</span>
                          <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(t.createdAt)}</span>
                        </span>
                        <span className="block truncate text-xs text-text-2">{t.name} · {t.body}</span>
                        <span className="mt-1.5 flex items-center gap-2"><StatusBadge status={t.status} /><span className="truncate text-[11px] text-muted">{t.category}</span>{(replies[t.id]?.length ?? 0) > 0 && <span className="ml-auto text-[11px] text-muted">{replies[t.id].length} repl{replies[t.id].length === 1 ? 'y' : 'ies'}</span>}</span>
                      </span>
                    </button>
                  </li>
                ))}
                {!list.length && <li className="grid place-items-center px-6 py-16 text-center text-sm text-muted"><Inbox className="mb-2 size-5" aria-hidden />Nothing here — all caught up.</li>}
              </ul>
            </aside>
          )}

          {showDetail && (
            <section aria-label="Ticket detail" className="flex min-h-0 flex-col">
              {sel ? (
                <>
                  <div className="border-b border-line px-4 py-3 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {!wide && <ToolBtn label="Back to tickets" onClick={() => setSelId(null)} className="px-2"><ArrowLeft /></ToolBtn>}
                      <h2 className="min-w-0 font-display text-lg font-bold text-ink-900">{sel.subject}</h2>
                      <StatusBadge status={sel.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{sel.ref}</span>·<span>{titleCase(sel.kind)}</span>·<span>{sel.category}</span>{sel.bookingRef && <>·<span className="font-mono">{sel.bookingRef}</span></>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="brand" className="h-9" disabled={sel.status === 'resolved'} iconLeft={<CheckCheck className="size-4" />} onClick={() => resolve(sel)}>{sel.status === 'resolved' ? 'Resolved' : 'Resolve'}</Button>
                      <ToolBtn onClick={() => { void navigator.clipboard?.writeText(sel.ref); toast({ title: 'Ticket ID copied', body: sel.ref, tone: 'info' }); }}><Copy /> Copy ID</ToolBtn>
                      {sel.email && <a className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[13px] font-semibold text-text-2 hover:border-brand-300 hover:text-ink-900" href={`mailto:${sel.email}?subject=${encodeURIComponent(`Re: ${sel.subject} [${sel.ref}]`)}`}><Mail className="size-4" aria-hidden />Email</a>}
                      {sel.phone && <a className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[13px] font-semibold text-text-2 hover:border-brand-300 hover:text-ink-900" href={telHref(sel.phone)}><Phone className="size-4" aria-hidden />Call</a>}
                    </div>
                  </div>

                  <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-2/30 px-4 py-5 sm:px-6" aria-label="Conversation">
                    <li className="flex gap-3">
                      <Avatar name={sel.name} size={34} />
                      <div className="max-w-[640px] min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-white p-4">
                        <p className="text-sm font-semibold text-ink-900">{sel.name} {sel.email && <span className="font-normal text-muted">&lt;{sel.email}&gt;</span>}</p>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-text">{sel.body}</p>
                        <p className="mt-2 text-[11px] text-muted">{formatDateTime(sel.createdAt)}</p>
                      </div>
                    </li>
                    {(replies[sel.id] ?? []).map((r, i) => (
                      <li key={i} className="flex flex-row-reverse gap-3">
                        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-ink-900 font-display text-xs font-bold text-white">OA</span>
                        <div className="max-w-[640px] min-w-0 rounded-2xl rounded-tr-md bg-brand-600 p-4 text-white">
                          <p className="text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
                          <p className="mt-2 text-[11px] text-white/70">{r.author} · {formatDateTime(r.at)} · demo, not delivered</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <form className="border-t border-line p-3 sm:p-4" onSubmit={(e) => { e.preventDefault(); send(false); }}>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {TEMPLATES.map((t) => <button key={t.label} type="button" onClick={() => setDraft(t.body)} className="h-7 rounded-full border border-line-strong px-2.5 text-[11px] font-semibold text-text-2 hover:border-brand-300 hover:text-brand-700">{t.label}</button>)}
                    </div>
                    <label htmlFor="reply" className="sr-only">Reply to {sel.name}</label>
                    <textarea
                      id="reply"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(false); } }}
                      rows={3}
                      placeholder={`Reply as ${site.name} support… (Ctrl+Enter to send)`}
                      className="w-full resize-y rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                      <span className="mr-auto text-[11px] text-muted">Demo: replies are saved locally and not sent.</span>
                      <ToolBtn disabled={!draft.trim() || sel.status === 'resolved'} onClick={() => send(true)}>Send & resolve</ToolBtn>
                      <Button type="submit" size="sm" variant="brand" className="h-9" disabled={!draft.trim()} iconLeft={<Send className="size-4" />}>Send reply</Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="grid flex-1 place-items-center p-10 text-sm text-muted">Select a ticket.</div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
