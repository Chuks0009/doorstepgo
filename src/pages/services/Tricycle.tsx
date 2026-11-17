import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calculator, Check, Clock, GitCompareArrows, Info, Minus, Package, ShoppingBag, Umbrella, Users } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, ButtonLink, Reveal, SectionHeading, SmartImage } from '@/components/ui';
import { BookingFlow, type FlowStep } from '@/components/services/BookingFlow';
import { CompareTable, cheapest, mostSeats, priceCell, type CompareRow } from '@/components/services/CompareTable';
import { FareEstimator } from '@/components/services/FareEstimator';
import { GlowOrbs, RoutePath } from '@/components/services/Motifs';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { TierInfoModal } from '@/components/services/TierInfoModal';
import { useHashScroll } from '@/components/services/useHashScroll';
import { images, img } from '@/data/images';
import { tricycleTiers } from '@/data/services';
import { usePageMeta } from '@/hooks';
import type { ServiceTier } from '@/types';
import { cn, naira } from '@/utils';

/** Extra comparison attributes per tricycle category. */
const meta: Record<string, { bestFor: string; cargo: string; cover: boolean; scheduling: boolean }> = {
  'tri-standard': { bestFor: 'Daily commutes & short errands', cargo: 'Shopping bags', cover: true, scheduling: false },
  'tri-premium': { bestFor: 'Comfort, meetings & longer trips', cargo: 'Shopping bags', cover: true, scheduling: false },
  'tri-commercial': { bestFor: 'Market loads, cartons & small furniture', cargo: 'Up to 250 kg', cover: true, scheduling: false },
  'tri-group': { bestFor: 'Families, friends & small teams', cargo: 'Bags per vehicle', cover: true, scheduling: false },
  'tri-scheduled': { bestFor: 'School runs & recurring office trips', cargo: 'Shopping bags', cover: true, scheduling: true },
};

const cargoKg = (t: ServiceTier) => (t.id === 'tri-commercial' ? 250 : t.id === 'tri-group' ? 60 : 20);
const yes = (v: boolean) => (v ? <Check className="size-5 text-ok" aria-label="Yes" /> : <Minus className="size-5 text-muted" aria-label="No" />);

const rows: CompareRow[] = [
  { label: 'Best for', render: (t) => <span className="text-[13px] leading-snug">{meta[t.id]?.bestFor}</span> },
  { label: 'Passengers', render: (t) => <span className="font-semibold">{t.capacityLabel}</span>, best: mostSeats },
  { label: 'Cargo', render: (t) => <span>{meta[t.id]?.cargo}</span>, best: (ts) => [...ts].sort((a, b) => cargoKg(b) - cargoKg(a))[0]?.id },
  { label: 'Price from', render: priceCell, best: cheapest },
  { label: 'Est. availability', render: (t) => <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-muted" aria-hidden /> {t.eta}</span> },
  { label: 'Weather cover', render: (t) => yes(!!meta[t.id]?.cover) },
  { label: 'Recurring schedules', render: (t) => yes(!!meta[t.id]?.scheduling) },
  { label: 'Highlights', render: (t) => <ul className="space-y-1 text-[13px] text-text-2">{t.features.map((f) => <li key={f}>• {f}</li>)}</ul> },
];

const triSteps: FlowStep[] = [
  { title: 'Pickup', icon: 'Navigation', body: 'Choose your city, nearest junction or landmark, then the detailed address — gate colour, building name, anything that helps.', detail: ['City', 'Junction', 'Address'] },
  { title: 'Destination', icon: 'MapPin', body: 'Set the drop-off city, junction and address. Add stops for school drop-offs or market runs.' },
  { title: 'Date', icon: 'CalendarClock', body: 'Ride today or pick a future date. Scheduled tricycles can repeat on weekdays.' },
  { title: 'Time', icon: 'Clock', body: 'Choose a pickup time. Peak (7–9 AM, 5–8 PM) and night-time surcharges are shown upfront.' },
  { title: 'Passengers', icon: 'Users', body: 'Up to three per tricycle. Group bookings dispatch several tricycles together.' },
  { title: 'One-way or round-trip', icon: 'Repeat', body: 'Round trips are discounted versus two separate one-way bookings.', detail: ['One-way', 'Round-trip'] },
  { title: 'Instructions', icon: 'FileText', body: 'Tell the operator about cargo, loading help, child passengers or who to call on arrival.' },
  { title: 'Review & confirm', icon: 'BadgeCheck', body: 'Check the itemised estimate, confirm and receive your booking reference immediately.' },
];

export default function TricyclePage() {
  usePageMeta('Tricycle Rides', 'Covered keke rides, premium tricycles, cargo-ready commercial tricycles, group convoys and scheduled school runs. Compare categories and book.');
  useHashScroll();
  const [activeId, setActiveId] = useState(tricycleTiers[0].id);
  const [infoOpen, setInfoOpen] = useState(false);
  const active = tricycleTiers.find((t) => t.id === activeId)!;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Tricycle' }]}
        eyebrow="Tricycle (keke) rides"
        title={<>Covered rides, <span className="text-gradient-go">cargo runs</span> and group convoys.</>}
        subtitle="Sheltered from sun and rain, room for your bags, and fares you can split. Compare five tricycle categories and book the one that fits your trip."
        image={images.tricycle[0].src}
        imageAlt={images.tricycle[0].alt}
        actions={
          <>
            <ButtonLink to="/booking?service=tricycle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a tricycle</ButtonLink>
            <ButtonLink to="#compare" variant="glass" size="lg" iconLeft={<GitCompareArrows className="size-5" aria-hidden />}>Compare categories</ButtonLink>
          </>
        }
        aside={
          <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { I: Umbrella, k: 'Weather cover', v: 'All categories' },
              { I: Users, k: 'Seats', v: 'Up to 3 each' },
              { I: Package, k: 'Cargo', v: 'Up to 250 kg' },
            ].map(({ I, k, v }) => (
              <div key={k} className="glass-dark rounded-2xl p-4">
                <I className="size-5 text-go-300" aria-hidden />
                <p className="mt-2 text-[11px] font-semibold tracking-wider text-white/55 uppercase">{k}</p>
                <p className="font-bold">{v}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Spotlight selector */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading eyebrow="Tricycle categories" title="Pick the keke that fits." subtitle="Select a category to see the details, or jump to the comparison table below." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div role="tablist" aria-label="Tricycle categories" aria-orientation="vertical" className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {tricycleTiers.map((t, i) => {
              const on = t.id === activeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tri-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls="tri-panel"
                  onClick={() => setActiveId(t.id)}
                  onKeyDown={(e) => {
                    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                    if (!dir) return;
                    e.preventDefault();
                    const next = tricycleTiers[(i + dir + tricycleTiers.length) % tricycleTiers.length];
                    setActiveId(next.id);
                    document.getElementById(`tri-tab-${next.id}`)?.focus();
                  }}
                  tabIndex={on ? 0 : -1}
                  className={cn('relative flex w-64 shrink-0 items-center gap-3 overflow-hidden rounded-2xl border-2 p-3 text-left transition-all lg:w-auto', on ? 'border-go-500 bg-white shadow-lift' : 'border-transparent bg-white/60 hover:bg-white')}
                >
                  {on && <motion.span layoutId="tri-active" className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-go-500" />}
                  <SmartImage src={img(t.image, 240)} alt="" className="size-16 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink-900">{t.name}</span>
                    <span className="block truncate text-xs text-muted">{t.tagline}</span>
                    <span className="mt-1 block text-[13px] font-semibold text-go-700">from {naira(t.minFare)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id="tri-panel" role="tabpanel" aria-labelledby={`tri-tab-${active.id}`} className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-ink-950 text-white shadow-lift">
            <AnimatePresence mode="wait">
              <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
                  <SmartImage src={img(active.image, 1400)} alt={active.imageAlt} className="size-full" />
                </motion.div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/10" />
              </motion.div>
            </AnimatePresence>
            <RoutePath className="absolute top-8 right-8 hidden h-24 w-64 opacity-70 md:block" />
            <AnimatePresence mode="wait">
              <motion.div key={active.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, delay: 0.1 }} className="relative flex h-full min-h-[520px] flex-col justify-end p-6 sm:p-10">
                <div className="flex flex-wrap gap-2">{active.badge && <Badge tone="go">{active.badge}</Badge>}<Badge tone="ink">{active.capacityLabel}</Badge></div>
                <h3 className="mt-3 text-3xl font-extrabold sm:text-4xl">{active.name}</h3>
                <p className="mt-2 max-w-xl text-white/75">{active.description}</p>
                <dl className="mt-6 grid max-w-xl grid-cols-3 gap-2">
                  {[
                    { k: 'From', v: naira(active.minFare) },
                    { k: 'Availability', v: active.eta },
                    { k: 'Cargo', v: meta[active.id]?.cargo ?? '—' },
                  ].map((x) => (
                    <div key={x.k} className="glass-dark rounded-xl p-3">
                      <dt className="text-[11px] font-semibold tracking-wider text-white/55 uppercase">{x.k}</dt>
                      <dd className="mt-0.5 text-sm font-bold sm:text-base">{x.v}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {active.features.map((f) => <li key={f} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><Check className="size-3 text-go-300" aria-hidden /> {f}</li>)}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink to={`/booking?service=tricycle&tier=${active.id}`} size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book {active.name}</ButtonLink>
                  <Button variant="glass" size="lg" onClick={() => setInfoOpen(true)} aria-haspopup="dialog" iconLeft={<Info className="size-5" aria-hidden />}>More info</Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <TierInfoModal tier={active} open={infoOpen} onClose={() => setInfoOpen(false)} />
      </section>

      {/* Comparison */}
      <section id="compare" className="scroll-mt-24 bg-white py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Compare before you book" title="Side-by-side, at a glance." subtitle="Toggle categories to compare passengers, cargo, starting price, availability and features. The best value in each row is highlighted." />
          <Reveal className="mt-10">
            <CompareTable tiers={tricycleTiers} rows={rows} initial={['tri-standard', 'tri-premium', 'tri-commercial']} />
          </Reveal>
        </div>
      </section>

      {/* Use cases bento */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading eyebrow="Made for real life" title="What people use tricycles for." />
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {[
            { t: 'Market & shopping runs', d: 'Commercial tricycles with loading help and a tarp cover for your goods.', imgI: 2, tier: 'tri-commercial', I: ShoppingBag, cls: 'md:row-span-2' },
            { t: 'School & office routines', d: 'Scheduled pickups on weekdays with SMS reminders.', imgI: 4, tier: 'tri-scheduled', I: Clock, cls: '' },
            { t: 'Moving together', d: 'Two or more tricycles dispatched as a convoy on one bill.', imgI: 3, tier: 'tri-group', I: Users, cls: '' },
          ].map((u, i) => (
            <Reveal key={u.t} delay={i * 0.06} className={cn('group relative min-h-64 overflow-hidden rounded-3xl text-white', u.cls)}>
              <SmartImage src={img(images.tricycle[u.imgI].src, 900)} alt={images.tricycle[u.imgI].alt} className="absolute inset-0" imgClassName="transition-transform duration-[1.2s] group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-6">
                <u.I className="size-6 text-go-300" aria-hidden />
                <h3 className="mt-2 text-xl font-bold">{u.t}</h3>
                <p className="mt-1 text-sm text-white/70">{u.d}</p>
                <ButtonLink to={`/booking?service=tricycle&tier=${u.tier}`} variant="glass" size="sm" className="mt-4 h-11 w-fit" iconRight={<ArrowRight className="size-4" aria-hidden />}>Book this</ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Booking workflow */}
      <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
        <GlowOrbs />
        <div className="container-x">
          <SectionHeading dark eyebrow="Booking workflow" title="From pickup to confirmation." subtitle="Here’s everything the booking form asks for — no surprises, and an estimate before you commit." />
          <div className="mt-12"><BookingFlow steps={triSteps} dark /></div>
        </div>
      </section>

      {/* Estimator */}
      <section id="estimator" className="container-x scroll-mt-24 py-16 sm:py-24">
        <SectionHeading eyebrow="Fare estimator" title="Estimate a tricycle fare." subtitle="Extra passengers, round trips and time of day are all reflected in the estimate (demonstration rates)." action={<ButtonLink to="#compare" variant="outline" iconLeft={<Calculator className="size-4" aria-hidden />}>Back to comparison</ButtonLink>} />
        <div className="mt-10"><FareEstimator tiers={tricycleTiers} /></div>
      </section>

      <ServiceFaq ids={['f3', 'f1', 'f16', 'f8', 'f15']} title="Tricycle FAQs" />

      <ServiceCTA
        eyebrow="Keke, on demand"
        title={<>Covered, comfortable, <span className="text-gradient-go">close by.</span></>}
        body="Book a tricycle for yourself, your family or your market load."
        image={images.tricycle[1].src}
        imageAlt={images.tricycle[1].alt}
        whatsappMessage="Hello DoorstepGo, I have a question about tricycle rides."
        actions={<ButtonLink to="/booking?service=tricycle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a tricycle</ButtonLink>}
      />
    </>
  );
}
