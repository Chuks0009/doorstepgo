import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Boxes, BriefcaseBusiness, CalendarClock, ClipboardList, Contact, FileText, Headset, History, ListChecks, MapPinned, Package, Rocket,
  Route, Store, Truck, Warehouse,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, ExternalButton, Reveal, SectionHeading, SmartImage, TiltCard, WhatsappGlyph } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { images, img } from '@/data/images';
import { site, whatsappLink } from '@/config/site';
import { DEFAULT_CITY, findCity } from '@/config/locations';
import { cn } from '@/utils';
import { CountStat, DemoChip, Orbs, SpeedLines, useHashScroll } from '@/components/company/shared';
import { MerchantDashboardPreview } from '@/components/company/MerchantDashboardPreview';
import { MerchantForm } from '@/components/company/MerchantForm';

const groups = [
  {
    title: 'Set up',
    blurb: 'Get your business on DoorstepGo in a day.',
    tone: 'bg-go-500',
    items: [
      { title: 'Merchant onboarding', body: 'Guided setup with a business specialist.', icon: Rocket },
      { title: 'Business profile', body: 'Brand name, logo and receipt details.', icon: BriefcaseBusiness },
      { title: 'Business contact details', body: 'Who riders and support should call.', icon: Contact },
      { title: 'Delivery requirements', body: 'Handling rules, windows, COD and proof of delivery.', icon: ListChecks },
    ],
  },
  {
    title: 'Ship',
    blurb: 'Move one parcel or five hundred.',
    tone: 'bg-brand-500',
    items: [
      { title: 'Bulk delivery requests', body: 'Upload many drops at once from a spreadsheet.', icon: Boxes },
      { title: 'Scheduled deliveries', body: 'Daily or weekly runs booked in advance.', icon: CalendarClock },
      { title: 'Multiple pickup locations', body: 'Stores, warehouses and branches.', icon: Warehouse },
      { title: 'Multiple destinations', body: 'Multi-drop routes with codes per recipient.', icon: MapPinned },
    ],
  },
  {
    title: 'Manage',
    blurb: 'Everything after the rider leaves.',
    tone: 'bg-ink-700',
    items: [
      { title: 'Order management', body: 'Live statuses for every order in one view.', icon: ClipboardList },
      { title: 'Delivery history', body: 'Searchable records with proof of delivery.', icon: History },
      { title: 'Quote requests', body: 'Custom pricing for volume and contracts.', icon: FileText, to: '/request-quote?type=business' },
      { title: 'Business support', body: 'Priority WhatsApp and a named account contact.', icon: Headset, to: '/contact' },
    ],
  },
];

const steps = [
  { title: 'Register interest', body: 'Tell us about your business with the form below.' },
  { title: 'Onboarding call', body: 'We map pickup points, delivery rules and pricing.' },
  { title: 'First deliveries', body: 'Start with a pilot week — we watch every drop.' },
  { title: 'Scale up', body: 'Bulk uploads, schedules and monthly invoicing.' },
];

export default function MerchantsPage() {
  usePageMeta('Merchant delivery services', `Bulk, scheduled and multi-location deliveries for merchants — with order management, delivery history and business support from ${site.name}.`);
  useHashScroll();

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Customers', to: '/customers' }, { label: 'Merchants' }]}
        eyebrow="For merchants"
        title={<>Deliveries that <span className="text-gradient-go">scale</span> with your business.</>}
        subtitle="From your first ten orders to your first ten thousand — bulk drops, scheduled pickups and multi-location logistics with one dashboard and one monthly statement."
        image={img(images.delivery[4].src, 1600)}
        imageAlt={images.delivery[4].alt}
        actions={
          <>
            <ButtonLink to="/customers/merchants#register" size="lg" iconRight={<ArrowRight className="size-4" />}>Register your business</ButtonLink>
            <ButtonLink to="/customers/merchants#console" size="lg" variant="glass">See the dashboard</ButtonLink>
          </>
        }
        aside={
          <div className="hidden gap-3 lg:grid lg:grid-cols-2">
            {[
              { v: 96, s: '%', l: 'On-time target' },
              { v: 500, s: '', l: 'Drops per upload' },
              { v: findCity(DEFAULT_CITY)?.areas.length ?? 0, s: '', l: 'Awka areas live' },
              { v: 24, s: 'h', l: 'Onboarding goal' },
            ].map((k, i) => (
              <motion.div key={k.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className={cn('glass-dark rounded-2xl p-5', i === 1 && 'translate-y-6', i === 3 && 'translate-y-6')}>
                <p className="font-display text-3xl font-bold"><CountStat value={k.v} suffix={k.s} /></p>
                <p className="mt-1 text-sm text-white/60">{k.l}</p>
              </motion.div>
            ))}
            <p className="col-span-2 mt-6 text-right text-[11px] text-white/45">Illustrative targets for the demo</p>
          </div>
        }
      />

      {/* ------------------------------------------------ SERVICES */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Merchant services" title="Everything a growing seller needs" subtitle="Twelve building blocks, one account. Use as many or as few as your business needs." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {groups.map((g, gi) => (
              <Reveal key={g.title} delay={gi * 0.08}>
                <div className={cn('relative h-full rounded-3xl border border-line bg-white p-6 shadow-soft', gi === 1 && 'lg:-translate-y-6 lg:shadow-lift')}>
                  <div className="flex items-center gap-3">
                    <span className={cn('grid size-10 place-items-center rounded-xl font-display font-bold text-white', g.tone)}>{gi + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold text-ink-900">{g.title}</h3>
                      <p className="text-sm text-muted">{g.blurb}</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-1">
                    {g.items.map((it) => {
                      const inner = (
                        <>
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-800 transition-colors group-hover:bg-ink-900 group-hover:text-white"><it.icon className="size-[18px]" aria-hidden /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-ink-900">{it.title}</span>
                            <span className="block text-sm text-text-2">{it.body}</span>
                          </span>
                          {'to' in it && it.to && <ArrowRight className="size-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden />}
                        </>
                      );
                      return (
                        <li key={it.title}>
                          {'to' in it && it.to ? (
                            <ButtonLinkRow to={it.to}>{inner}</ButtonLinkRow>
                          ) : (
                            <div className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-canvas">{inner}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ DASHBOARD PREVIEW */}
      <section id="console" className="noise relative isolate scroll-mt-20 overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
        <Orbs />
        <SpeedLines className="absolute top-24 right-0 w-1/4 opacity-60 max-lg:hidden" />
        <div className="container-x">
          <SectionHeading
            dark
            align="center"
            eyebrow="Merchant console"
            title={<>Your whole delivery operation, <span className="text-gradient-go">at a glance</span></>}
            subtitle="Track orders, spot trends, manage multiple pickup points and upload bulk drops. Switch the date range, filter orders and try the sample upload."
          />
          <Reveal delay={0.1} className="perspective mt-14">
            <motion.div initial={{ rotateX: 14, y: 40, opacity: 0 }} whileInView={{ rotateX: 0, y: 0, opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
              <MerchantDashboardPreview />
            </motion.div>
          </Reveal>
          <p className="mt-6 text-center text-xs text-white/50">Interface preview with sample data — the full merchant console is on our roadmap.</p>
        </div>
      </section>

      {/* ------------------------------------------------ HOW ONBOARDING WORKS */}
      <section className="relative py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Merchant onboarding" title="Live in four steps" />
            <ol className="relative mt-10 space-y-6">
              <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-gradient-to-b from-go-500 to-brand-500" />
              {steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 0.06} className="relative flex gap-5">
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-white font-display font-bold text-ink-900 shadow-soft ring-4 ring-canvas">{i + 1}</span>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-ink-900">{s.title}</h3>
                    <p className="mt-0.5 text-text-2">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal className="relative">
            <TiltCard max={5} className="rounded-[2rem]">
              <SmartImage src={img(images.people[1].src, 900)} alt={images.people[1].alt} className="aspect-[4/5] rounded-[2rem] shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]" />
            </TiltCard>
            <div className="glass absolute bottom-6 left-4 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-lift sm:-left-6">
              <span className="grid size-11 place-items-center rounded-xl bg-go-sheen text-white"><Truck className="size-5" aria-hidden /></span>
              <div>
                <p className="text-xs text-muted">Today’s pickups (sample)</p>
                <p className="font-display text-lg font-bold text-ink-900">3 locations · 47 drops</p>
              </div>
            </div>
            <div className="glass absolute top-6 right-4 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lift sm:-right-4">
              <Route className="size-4 text-brand-600" aria-hidden /><span className="text-xs font-bold text-ink-900">Multi-drop route optimised</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ REGISTRATION */}
      <section id="register" className="relative scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Merchant interest" title={<>Let’s move your <span className="text-gradient-brand">products</span></>} subtitle="Register your interest and a business specialist will help you set up pickups, delivery rules and invoicing." />
            <ul className="mt-8 space-y-3">
              {[
                { icon: Store, t: 'Built for shops, kitchens & online stores' },
                { icon: Package, t: 'Envelopes to tricycle-sized cargo' },
                { icon: FileText, t: 'One consolidated monthly statement' },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-3 text-text-2"><span className="grid size-9 place-items-center rounded-lg bg-go-50 text-go-600"><x.icon className="size-4" aria-hidden /></span>{x.t}</li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-line bg-canvas p-5">
              <p className="text-sm font-semibold text-ink-900">Need to talk first?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ExternalButton href={whatsappLink(`Hello ${site.name}, I'd like to talk about merchant deliveries.`)} target="_blank" rel="noreferrer noopener" size="sm" variant="ink" iconLeft={<WhatsappGlyph className="size-4" />}>WhatsApp</ExternalButton>
                <ExternalButton href={`mailto:${site.contact.businessEmail}`} size="sm" variant="outline">{site.contact.businessEmail}</ExternalButton>
              </div>
            </div>
          </div>
          <Reveal>
            <div className="relative rounded-[2rem] border border-line bg-canvas p-6 shadow-lift sm:p-8">
              <span aria-hidden className="absolute -top-3 left-8 h-1.5 w-24 rounded-full bg-go-sheen" />
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-ink-900">Merchant registration</h3>
                  <p className="mt-1 text-sm text-text-2">About two minutes. Fields marked * are required.</p>
                </div>
                <DemoChip>Demo form</DemoChip>
              </div>
              <MerchantForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ButtonLinkRow({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-canvas">
      {children}
    </Link>
  );
}
