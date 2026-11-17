import { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Building, Clock, Handshake, Headset, LifeBuoy, Mail, MessageSquareText, Phone, SearchCheck, ShieldCheck, Sparkles,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { AccordionItem, Badge, ButtonLink, DemoNotice, ExternalButton, Reveal, SectionHeading, socialGlyphs, WhatsappGlyph } from '@/components/ui';
import { ContactForm, enquiryCategories } from '@/components/support/ContactForm';
import { ComplaintForm } from '@/components/support/ComplaintForm';
import { FeedbackWidget } from '@/components/support/FeedbackWidget';
import { LiveChatDemo } from '@/components/support/LiveChatDemo';
import { OfficeMap } from '@/components/support/OfficeMap';
import { site, whatsappLink, type SocialKey } from '@/config/site';
import { faqs } from '@/data/content';
import { usePageMeta } from '@/hooks';
import { cn } from '@/utils';

/* ---------- Opening hours helpers (reads site.hours: [Mon–Fri, Sat, Sun/holidays]) ---------- */
const toMinutes = (s: string) => {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
};
function useOpenState() {
  return useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const rowIndex = day === 0 ? 2 : day === 6 ? 1 : 0;
    const row = site.hours[Math.min(rowIndex, site.hours.length - 1)];
    const [from, to] = row.time.split(/[–-]/).map((x) => toMinutes(x.trim()));
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = from != null && to != null && mins >= from && mins < to;
    return { rowIndex, open, today: row };
  }, []);
}

const topicToCategory: Record<string, (typeof enquiryCategories)[number]> = {
  general: 'General',
  business: 'Business',
  partnership: 'Partnership',
  partners: 'Partnership',
  support: 'Customer support',
  complaint: 'Complaint/feedback',
  feedback: 'Complaint/feedback',
};

const channels = [
  { key: 'general', title: 'General enquiries', body: 'Questions about DoorstepGo, our services and coverage.', email: site.contact.email, icon: Mail, tone: 'bg-brand-50 text-brand-700' },
  { key: 'business', title: 'Business enquiries', body: 'Corporate accounts, bulk deliveries and staff shuttles.', email: site.contact.businessEmail, icon: Building, tone: 'bg-ink-900 text-white' },
  { key: 'partnership', title: 'Partnership enquiries', body: 'Fleet owners, merchants, schools and integrations.', email: site.contact.partnersEmail, icon: Handshake, tone: 'bg-go-50 text-go-700' },
  { key: 'support', title: 'Customer support', body: 'Help with an active ride, delivery, payment or refund.', email: site.contact.supportEmail, icon: Headset, tone: 'bg-ok-bg text-ok' },
];

export default function ContactPage() {
  usePageMeta('Contact us', `Reach ${site.name} for general, business and partnership enquiries, customer support, complaints and feedback. WhatsApp, phone, email and live chat.`);
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const topic = (params.get('topic') ?? '').toLowerCase();
  const prefRef = params.get('ref') ?? '';
  const subject = params.get('subject') ?? '';
  const { rowIndex, open, today } = useOpenState();

  useEffect(() => {
    const id = hash ? hash.slice(1) : topic === 'complaint' ? 'complaint' : '';
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    return () => clearTimeout(t);
  }, [hash, topic]);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        eyebrow="Contact & support"
        title={<>Real people, <span className="text-gradient-go">ready to help.</span></>}
        subtitle="Whether you're mid-ride, tracking a parcel or planning a fleet for your business — reach the right team in one tap."
        actions={
          <>
            <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" size="lg" iconLeft={<WhatsappGlyph className="size-5" />}>Chat on WhatsApp</ExternalButton>
            <ExternalButton href={`tel:${site.contact.phoneHref}`} variant="glass" size="lg" iconLeft={<Phone className="size-5" />}>{site.contact.phone}</ExternalButton>
          </>
        }
        aside={
          <div className="glass-dark rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-bold">Support desk</p>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold', open ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/70')}>
                <span className={cn('relative size-2 rounded-full', open ? 'bg-emerald-400' : 'bg-white/50')}>
                  {open && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400" aria-hidden />}
                </span>
                {open ? 'Open now' : 'Closed now'}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/60">Today · {today.time}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { icon: <WhatsappGlyph className="size-4" />, label: 'WhatsApp', value: '~5 min' },
                { icon: <Phone className="size-4" />, label: 'Phone', value: 'Instant' },
                { icon: <MessageSquareText className="size-4" />, label: 'Contact form', value: '< 24 hrs' },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="flex items-center gap-2.5 text-white/80"><span className="text-go-300">{r.icon}</span>{r.label}</span>
                  <span className="font-semibold">{r.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-white/45">Response times are demonstration targets.</p>
          </div>
        }
      />

      {/* Channels */}
      <section className="bg-canvas py-14 lg:py-20" aria-labelledby="channels-title">
        <div className="container-x">
          <h2 id="channels-title" className="sr-only">Contact channels</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.05} className="card group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute -top-10 -right-10 size-28 rounded-full bg-go-500/0 blur-2xl transition group-hover:bg-go-500/15" aria-hidden />
                <span className={cn('grid size-12 place-items-center rounded-2xl', c.tone)}><c.icon className="size-5" aria-hidden /></span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{c.title}</h3>
                <p className="mt-1 flex-1 text-sm text-text-2">{c.body}</p>
                <a href={`mailto:${c.email}`} className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 rounded-xl bg-surface-2 px-4 text-sm font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-white">
                  <span className="truncate">{c.email}</span>
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="noise relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-ink-radial p-7 text-white shadow-lift">
              <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden />
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-go-300"><Phone className="size-5" aria-hidden /></span>
                <h3 className="mt-5 text-2xl font-bold">Call our support line</h3>
                <p className="mt-1 text-white/65">{site.supportNote}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href={`tel:${site.contact.phoneHref}`} className="font-display text-2xl font-extrabold tracking-tight hover:text-go-300 sm:text-3xl">{site.contact.phone}</a>
                <Badge tone="go">Placeholder number</Badge>
              </div>
            </Reveal>
            <Reveal delay={0.06} className="relative isolate overflow-hidden rounded-3xl bg-go-sheen p-7 text-white shadow-glow-go">
              <div className="absolute top-8 right-0 -z-10 flex w-1/2 flex-col gap-3 opacity-40" aria-hidden>
                {[80, 55, 95, 40].map((w, i) => <span key={i} className="ml-auto h-1 animate-speed rounded-full bg-gradient-to-l from-white to-transparent" style={{ width: `${w}%`, animationDelay: `${i * 0.3}s` }} />)}
              </div>
              <WhatsappGlyph className="size-11" />
              <h3 className="mt-4 max-w-md text-2xl font-bold sm:text-3xl">The fastest way to reach us is WhatsApp.</h3>
              <p className="mt-2 max-w-md text-white/85">Send your booking reference and a quick note — we'll pick it up from there.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="white" size="lg" iconRight={<ArrowRight className="size-4" />}>Start a WhatsApp chat</ExternalButton>
                <span className="text-sm font-semibold text-white/85">{site.whatsapp.displayNumber}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Form + office */}
      <section className="bg-white py-14 lg:py-20" aria-labelledby="form-title">
        <div className="container-x grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          <div>
            <span className="eyebrow">Send a message</span>
            <h2 id="form-title" className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">Tell us how we can help</h2>
            <p className="mt-3 text-text-2">Pick an enquiry type so your message lands with the right team. You'll get a ticket reference straight away.</p>
            <div className="card mt-8 p-5 sm:p-8">
              <ContactForm key={`${topic}|${subject}`} initialCategory={topicToCategory[topic] ?? ''} initialSubject={subject} />
            </div>
          </div>

          <div className="space-y-6 lg:pt-4">
            <OfficeMap />

            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink-900"><Clock className="size-5 text-go-500" aria-hidden /> Business hours</h3>
              <ul className="mt-4 divide-y divide-line">
                {site.hours.map((h, i) => (
                  <li key={h.days} className={cn('flex items-center justify-between gap-4 py-3 text-sm', i === rowIndex && 'font-semibold')}>
                    <span className="flex items-center gap-2 text-text-2">
                      {h.days}
                      {i === rowIndex && <Badge tone={open ? 'ok' : 'neutral'} dot>Today</Badge>}
                    </span>
                    <span className="text-right text-ink-900 tabular-nums">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">{site.supportNote}</p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-ink-900">Follow {site.name}</h3>
              <p className="mt-1 text-sm text-text-2">Service updates, new Awka areas and promos.</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(site.social) as SocialKey[]).map((k) => {
                  const { label, Glyph } = socialGlyphs[k];
                  return (
                    <li key={k}>
                      <a href={site.social[k]} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${label}`} className="grid size-12 place-items-center rounded-xl border border-line bg-white text-ink-900 transition hover:-translate-y-0.5 hover:border-ink-900 hover:bg-ink-900 hover:text-white">
                        <Glyph className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live chat + feedback */}
      <section id="live-chat" className="noise relative isolate scroll-mt-20 overflow-hidden bg-ink-950 py-16 text-white lg:py-24" aria-labelledby="chat-title">
        <div className="bg-ink-radial absolute inset-0 -z-10" aria-hidden />
        <div className="grid-lines absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden />
        <div className="container-x">
          <SectionHeading
            dark
            eyebrow="Support centre"
            title={<span id="chat-title">Live chat, <span className="text-gradient-go">built in.</span></span>}
            subtitle="A preview of in-app chat: instant scripted answers, reference lookups and a hand-off to a human on WhatsApp."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            <Reveal><LiveChatDemo /></Reveal>
            <div className="space-y-6">
              <Reveal delay={0.05}><FeedbackWidget /></Reveal>
              <Reveal delay={0.1} className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <SearchCheck className="size-5" />, title: 'Reference lookups', body: 'Paste DSG-… and get the latest status.' },
                  { icon: <ShieldCheck className="size-5" />, title: 'Safe hand-off', body: 'Escalate to a human with context.' },
                  { icon: <Sparkles className="size-5" />, title: 'Quick replies', body: 'One-tap answers for common issues.' },
                  { icon: <LifeBuoy className="size-5" />, title: '24/7 roadmap', body: 'Round-the-clock agents planned.' },
                ].map((x) => (
                  <div key={x.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="text-go-300">{x.icon}</span>
                    <p className="mt-2 text-sm font-semibold">{x.title}</p>
                    <p className="text-xs text-white/55">{x.body}</p>
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint */}
      <section id="complaint" className="scroll-mt-20 bg-canvas py-16 lg:py-24" aria-labelledby="complaint-title">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
          <div>
            <span className="eyebrow">Complaints</span>
            <h2 id="complaint-title" className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">Something went wrong? We'll make it right.</h2>
            <p className="mt-3 text-text-2">Every complaint is reviewed by a support lead and tracked to resolution. Include your booking reference so we can see the full trip history.</p>
            <ol className="mt-8 space-y-5">
              {[
                ['Acknowledge', 'You get a ticket reference immediately.'],
                ['Investigate', 'We review the timeline, rider notes and proof of delivery.'],
                ['Resolve', 'Refund, redelivery or follow-up — and we tell you what changed.'],
              ].map(([t, b], i) => (
                <motion.li key={t} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-900 font-display font-bold text-white">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-ink-900">{t}</p>
                    <p className="text-sm text-text-2">{b}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
            <DemoNotice compact className="mt-8">Safety emergency? This demo is not connected to emergency services — call 112.</DemoNotice>
          </div>
          <div className="card relative overflow-hidden p-5 sm:p-8">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-go-500 to-amber-glow" aria-hidden />
            <ComplaintForm key={prefRef} initialRef={prefRef} />
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="bg-white py-16 lg:py-20" aria-labelledby="faq-teaser">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <span className="eyebrow">Quick answers</span>
            <h2 id="faq-teaser" className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">Most questions are answered in seconds</h2>
            <p className="mt-3 text-text-2">Browse {faqs.length}+ answers on booking, tracking, payments, cancellations and partnering.</p>
            <ButtonLink to="/faq" variant="ink" size="lg" className="mt-6" iconRight={<ArrowRight className="size-4" />}>Visit the help centre</ButtonLink>
          </div>
          <div className="space-y-3">
            {['f6', 'f8', 'f9', 'f14'].map((id) => faqs.find((f) => f.id === id)).filter(Boolean).map((f) => (
              <AccordionItem key={f!.id} question={f!.question}>
                {f!.answer}
                <div className="mt-3"><ButtonLink to={`/faq#${f!.id}`} variant="ghost" size="sm" className="px-2">Open in help centre</ButtonLink></div>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
