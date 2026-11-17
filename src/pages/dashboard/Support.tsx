import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Headset, LifeBuoy, Mail, MessagesSquare, Phone, Send, Ticket } from 'lucide-react';
import { AccordionItem, Button, ButtonLink, EmptyState, Input, Segmented, Select, StatusBadge, Textarea, WhatsappGlyph } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { Panel, categoryName, tierName } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta, useStore } from '@/hooks';
import { useBookings, useDeliveries, useMessages } from '@/hooks/useData';
import { supportService } from '@/services/api';
import { KEYS, storage } from '@/services/storage';
import { site, whatsappLink } from '@/config/site';
import { faqCategories, faqs } from '@/data/content';
import { cn, formatDate, timeAgo } from '@/utils';

interface Complaint { id: string; ticket: string; reference: string; category: string; details: string; createdAt: string }
const readComplaints = () => storage.get<Complaint[]>(KEYS.complaints, []);

const categories = [
  { value: 'Driver/rider was late', label: 'Driver/rider was late' },
  { value: 'Package missing or delayed', label: 'Package missing or delayed' },
  { value: 'Item damaged', label: 'Item damaged' },
  { value: 'Fare or payment issue', label: 'Fare or payment issue' },
  { value: 'Driver/rider conduct', label: 'Driver/rider conduct' },
  { value: 'Lost item', label: 'I left something behind' },
  { value: 'Other', label: 'Something else' },
];

type Mode = 'booking' | 'general';

export default function SupportPage() {
  usePageMeta('Support');
  const { user } = useAuth();
  const toast = useToast();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const messages = useMessages();
  const complaints = useStore(KEYS.complaints, readComplaints);

  const [mode, setMode] = useState<Mode>('booking');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  const refOptions = useMemo(
    () => [
      ...bookings.map((b) => ({ value: b.reference, label: `${b.reference} · ${tierName(b.tierId)} · ${formatDate(b.date, { day: 'numeric', month: 'short' })}`, group: 'Rides' })),
      ...deliveries.map((d) => ({ value: d.reference, label: `${d.reference} · ${categoryName(d.categoryId)} · ${formatDate(d.date, { day: 'numeric', month: 'short' })}`, group: 'Deliveries' })),
    ],
    [bookings, deliveries],
  );

  const tickets = useMemo(() => {
    const mine = messages.filter((m) => !user || m.email.toLowerCase() === user.email.toLowerCase());
    return [
      ...complaints.map((c) => ({ id: c.id, ticket: c.ticket, title: c.category, sub: `About ${c.reference}`, body: c.details, createdAt: c.createdAt, status: 'open' })),
      ...mine.map((m) => ({ id: m.id, ticket: m.reference, title: m.subject, sub: m.category, body: m.message, createdAt: m.createdAt, status: m.status })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [complaints, messages, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string | undefined> = {
      reference: mode === 'booking' && !reference ? 'Choose the booking this is about' : undefined,
      subject: mode === 'general' && subject.trim().length < 4 ? 'Add a short subject' : undefined,
      details: details.trim().length < 10 ? 'Please describe the issue (at least 10 characters)' : undefined,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    if (mode === 'booking') {
      const t = await supportService.complaint({ reference, category, details: details.trim() });
      toast({ title: `Ticket ${t.ticket} opened`, body: 'We aim to respond within 2 hours during operating hours (demo).' });
    } else {
      const m = await supportService.contact({ name: user?.name ?? 'Customer', email: user?.email ?? '', phone: user?.phone, subject: subject.trim(), category: 'General', message: details.trim() });
      toast({ title: `Message ${m.reference} sent`, body: 'Our team will reply by email (demo).' });
    }
    setBusy(false);
    setDetails('');
    setSubject('');
    setReference('');
  };

  const topFaqs = faqs.filter((f) => ['Cancellations & refunds', 'Payments', 'Delivery'].includes(f.category)).slice(0, 5);

  return (
    <div className="space-y-6">
      <DashPageHeader title="Support" subtitle="We're here to help with rides, deliveries and payments." actions={<ButtonLink to="/faq" variant="outline" iconLeft={<LifeBuoy className="size-4" />}>Help centre</ButtonLink>} />

      {/* Channels */}
      <div className="grid gap-4 md:grid-cols-3">
        <a href={whatsappLink()} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-3xl bg-[#0f9d58] p-6 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
          <div aria-hidden className="absolute -top-10 -right-10 size-36 rounded-full bg-white/15 blur-2xl" />
          <WhatsappGlyph className="size-9" />
          <p className="mt-4 font-display text-lg font-bold">Chat on WhatsApp</p>
          <p className="text-sm text-white/80">{site.whatsapp.displayNumber} · fastest response</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Start chat <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden /></span>
        </a>
        <a href={`tel:${site.contact.phoneHref}`} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Phone className="size-5" aria-hidden /></span>
          <p className="mt-4 font-display text-lg font-bold text-ink-900">Call support</p>
          <p className="text-sm text-text-2">{site.contact.phone}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Call now <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden /></span>
        </a>
        <a href={`mailto:${site.contact.supportEmail}`} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
          <span className="grid size-11 place-items-center rounded-xl bg-go-50 text-go-600"><Mail className="size-5" aria-hidden /></span>
          <p className="mt-4 font-display text-lg font-bold text-ink-900">Email us</p>
          <p className="text-sm text-text-2">{site.contact.supportEmail}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-go-600">Write an email <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden /></span>
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Ticket form */}
        <Panel title="Raise a ticket" subtitle="Tell us what happened and we'll get on it." icon={<Ticket />} className="xl:col-span-3">
          <form onSubmit={submit} noValidate className="space-y-4">
            <Segmented<Mode> label="Ticket type" value={mode} onChange={(m) => { setMode(m); setErrors({}); }} options={[{ value: 'booking', label: 'About a booking' }, { value: 'general', label: 'General question' }]} />
            {mode === 'booking' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Booking" required name="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Select a booking" options={refOptions} error={errors.reference} />
                <Select label="Issue" required value={category} onChange={(e) => setCategory(e.target.value)} options={categories} />
              </div>
            ) : (
              <Input label="Subject" required name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Business account for my shop" error={errors.subject} maxLength={80} />
            )}
            <Textarea label="Details" required name="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Include times, places and anything that helps us investigate." error={errors.details} maxLength={1000} hint={`${details.length}/1000`} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-muted">Replies go to {user?.email}. This demo does not connect to emergency services.</p>
              <Button type="submit" loading={busy} iconLeft={<Send className="size-4" />}>Submit ticket</Button>
            </div>
          </form>
        </Panel>

        {/* Live chat teaser + hours */}
        <div className="space-y-6 xl:col-span-2">
          <div className="relative overflow-hidden rounded-3xl bg-ink-radial p-6 text-white">
            <div aria-hidden className="absolute -right-10 -bottom-16 size-48 rounded-full bg-brand-500/30 blur-[70px]" />
            <p className="eyebrow-dark"><MessagesSquare className="size-3.5" aria-hidden /> Live chat · preview</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2">Hi {user?.name.split(' ')[0] ?? 'there'} 👋 How can we help today?</p>
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-go-500 px-3.5 py-2">My rider hasn't arrived yet</p>
              <p className="flex w-fit items-center gap-1 rounded-2xl bg-white/10 px-3.5 py-2.5" aria-label="Agent typing">
                {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </p>
            </div>
            <ButtonLink to="/contact" variant="white" size="sm" className="mt-5" iconRight={<ArrowRight className="size-4" />}>Open live chat demo</ButtonLink>
          </div>
          <Panel title="Support hours" icon={<Clock />}>
            <dl className="space-y-2 text-sm">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-3"><dt className="text-text-2">{h.days}</dt><dd className="font-semibold text-ink-900">{h.time}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">{site.supportNote}</p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Your tickets" subtitle={`${tickets.length} submitted from this device`} icon={<Headset />} className="xl:col-span-3" bodyClassName="px-3 pb-3 sm:px-3 sm:pb-3">
          {tickets.length === 0 ? (
            <div className="p-2"><EmptyState icon="Inbox" title="No tickets yet" body="Anything you report shows up here so you can follow it." /></div>
          ) : (
            <ul className="divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id} className="px-3 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{t.title}</p>
                      <p className="text-xs text-muted"><span className="font-mono">{t.ticket}</span> · {t.sub} · {timeAgo(t.createdAt)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-text-2">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Quick answers" subtitle="Most asked questions" icon={<LifeBuoy />} className="xl:col-span-2">
          <div className="space-y-2">
            {topFaqs.map((f) => <AccordionItem key={f.id} question={f.question}>{f.answer}</AccordionItem>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {faqCategories.map((c) => (
              <Link key={c} to={`/faq?cat=${encodeURIComponent(c)}`} className={cn('rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text-2 transition hover:bg-brand-50 hover:text-brand-700')}>{c}</Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
