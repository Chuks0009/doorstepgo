import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Briefcase, Building2, Bus, CalendarDays, CalendarRange, Car, ClipboardList, Clock, FileText, Hash, MapPin, Navigation, User, Users } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, Reveal, SectionHeading, SmartImage, Stepper } from '@/components/ui';
import { GlowOrbs, SpeedLines } from '@/components/services/Motifs';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { ServiceTierCard } from '@/components/services/ServiceTierCard';
import { images, img } from '@/data/images';
import { shuttleTiers } from '@/data/services';
import { usePageMeta } from '@/hooks';
import type { ServiceTier } from '@/types';
import { cn, naira } from '@/utils';

const quoteHref = (t: ServiceTier) => `/request-quote?service=${encodeURIComponent(t.name)}`;
const byId = (id: string) => shuttleTiers.find((t) => t.id === id)!;

const audiences = [
  { I: User, t: 'Individuals', d: 'Airport runs and intercity trips with your luggage.' },
  { I: Users, t: 'Groups & families', d: 'One private van for everyone — no splitting up.' },
  { I: Briefcase, t: 'Businesses', d: 'Staff buses, executive transfers, client hosting.' },
  { I: Building2, t: 'Organisations', d: 'Schools, churches, NGOs, estates and events.' },
];

const purposes = [
  { id: 'general', label: 'General trip' },
  { id: 'airport', label: 'Airport' },
  { id: 'event', label: 'Event' },
  { id: 'corporate', label: 'Staff / corporate' },
  { id: 'intercity', label: 'Intercity' },
] as const;
type Purpose = (typeof purposes)[number]['id'];

const specify = [
  { I: Users, t: 'Number of passengers' },
  { I: Navigation, t: 'Pickup location' },
  { I: MapPin, t: 'Destination' },
  { I: CalendarDays, t: 'Date' },
  { I: Clock, t: 'Time' },
  { I: CalendarRange, t: 'Return date (if any)' },
  { I: Hash, t: 'Number of vehicles' },
  { I: Bus, t: 'Shuttle type' },
  { I: FileText, t: 'Special requirements' },
];

/** Pure planner logic: passengers + purpose → suggested tier & vehicle mix. */
function plan(passengers: number, purpose: Purpose) {
  const seatSizes = [30, 18, 14, 7];
  let tier: ServiceTier;
  if (purpose === 'airport' && passengers <= 7) tier = byId('sh-airport');
  else if (purpose === 'intercity') tier = byId('sh-intercity');
  else if (purpose === 'corporate') tier = byId('sh-corporate');
  else if (purpose === 'event' || passengers > 30) tier = byId('sh-event');
  else if (passengers <= 14) tier = byId('sh-private');
  else tier = byId('sh-corporate');

  // vehicle mix: greedily fill large vehicles, finish with the smallest that fits
  const maxSeat = purpose === 'intercity' ? 14 : purpose === 'airport' && passengers <= 7 ? 7 : 30;
  const sizes = seatSizes.filter((s) => s <= maxSeat);
  const vehicles: number[] = [];
  let left = passengers;
  while (left > 0) {
    const fit = [...sizes].reverse().find((s) => s >= left);
    if (fit) { vehicles.push(fit); left = 0; } else { vehicles.push(sizes[0]); left -= sizes[0]; }
  }
  const quote = passengers > 30 || vehicles.length > 2 || tier.id === 'sh-event' || tier.id === 'sh-corporate';
  return { tier, vehicles, quote };
}

export default function ShuttlePage() {
  usePageMeta('Shuttles & Group Transportation', 'Private and group shuttles, corporate staff transport, airport pickups, event fleets, scheduled routes and intercity travel. Book or request a quote.');
  const [pax, setPax] = useState(12);
  const [purpose, setPurpose] = useState<Purpose>('general');
  const result = useMemo(() => plan(pax, purpose), [pax, purpose]);
  const sliderId = useId();
  const seats = result.vehicles.reduce((a, b) => a + b, 0);

  const order = ['sh-private', 'sh-airport', 'sh-group', 'sh-corporate', 'sh-event', 'sh-scheduled', 'sh-intercity'];
  const tiers = order.map(byId);
  // bento spans for 7 cards on a 3-col grid: wide, tall | tall, tall, tall | tall, wide
  const spans = ['lg:col-span-2', '', '', '', '', '', 'lg:col-span-2'];

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Shuttle' }]}
        eyebrow="Shuttle & passenger transportation"
        title={<>Move your whole group, <span className="text-gradient-go">together.</span></>}
        subtitle="Air-conditioned vans, minibuses and coordinated fleets for families, teams, airport arrivals, events and intercity travel — with professional drivers and planned schedules."
        image={images.shuttle[1].src}
        imageAlt={images.shuttle[1].alt}
        actions={
          <>
            <ButtonLink to="/booking?service=shuttle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a shuttle</ButtonLink>
            <ButtonLink to="/request-quote?service=Shuttle" variant="glass" size="lg" iconLeft={<ClipboardList className="size-5" aria-hidden />}>Request a quote</ButtonLink>
          </>
        }
      />

      {/* Audiences strip */}
      <section className="relative z-10 container-x -mt-8 sm:-mt-10">
        <Reveal>
          <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line shadow-lift sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ I, t, d }) => (
              <li key={t} className="flex gap-4 bg-white p-5 sm:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-sheen text-white"><I className="size-5" aria-hidden /></span>
                <div>
                  <p className="font-bold text-ink-900">{t}</p>
                  <p className="mt-0.5 text-sm text-text-2">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Tiers bento */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading eyebrow="Seven ways to travel" title="Shuttle categories." subtitle="Book directly, or request a tailored quote for large groups, contracts and custom arrangements." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.06} className={cn(spans[i], spans[i] && 'sm:col-span-2')}>
              <ServiceTierCard
                tier={t}
                index={i}
                variant={spans[i] ? 'wide' : 'tall'}
                extraAction={
                  <ButtonLink to={quoteHref(t)} variant="ghost" block className="text-brand-700" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                    Request a quote
                  </ButtonLink>
                }
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Group-size planner */}
      <section id="planner" className="noise relative isolate scroll-mt-24 overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
        <GlowOrbs />
        <SpeedLines className="absolute top-20 right-0 w-1/4 opacity-40 max-lg:hidden" />
        <div className="container-x">
          <SectionHeading dark eyebrow="Group-size planner" title="How many vehicles do you need?" subtitle="Slide to your passenger count and pick a purpose — we’ll suggest a shuttle type and vehicle mix." />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="glass-dark space-y-8 rounded-3xl p-6 sm:p-8">
              <div>
                <div className="flex items-end justify-between gap-4">
                  <label htmlFor={sliderId} className="text-sm font-bold">Passengers</label>
                  <p className="font-display text-5xl font-extrabold tabular-nums" aria-hidden>{pax}</p>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min={1}
                  max={150}
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value))}
                  aria-valuetext={`${pax} passengers`}
                  className="mt-4 h-11 w-full cursor-pointer accent-go-500"
                />
                <div className="mt-1 flex justify-between text-xs text-white/50"><span>1</span><span>150</span></div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-1 text-ink-900">
                  <span className="pl-3 text-sm font-semibold">Fine-tune</span>
                  <Stepper label="passengers" value={pax} min={1} max={150} onChange={setPax} />
                </div>
              </div>
              <div>
                <p id="purpose-l" className="text-sm font-bold">Purpose</p>
                <div role="radiogroup" aria-labelledby="purpose-l" className="mt-3 flex flex-wrap gap-2">
                  {purposes.map((p) => (
                    <button key={p.id} type="button" role="radio" aria-checked={purpose === p.id} onClick={() => setPurpose(p.id)} className={cn('min-h-11 rounded-full px-4 text-sm font-semibold transition', purpose === p.id ? 'bg-go-500 text-white shadow-glow-go' : 'bg-white/10 text-white/75 hover:bg-white/20')}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white text-ink-900 shadow-lift" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={result.tier.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                  <SmartImage src={img(result.tier.image, 900)} alt={result.tier.imageAlt} className="aspect-[16/6]" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/85 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-[11px] font-bold tracking-[0.14em] text-go-300 uppercase">Suggested</p>
                    <p className="font-display text-2xl font-bold">{result.tier.name}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="p-6">
                <p className="text-sm font-semibold text-text-2">{result.vehicles.length} vehicle{result.vehicles.length > 1 ? 's' : ''} · {seats} seats for {pax} passenger{pax > 1 ? 's' : ''}</p>
                <ul className="mt-4 flex flex-wrap gap-3" aria-label="Suggested vehicle mix">
                  {result.vehicles.map((s, i) => {
                    const filled = i === result.vehicles.length - 1 ? pax - result.vehicles.slice(0, -1).reduce((a, b) => a + b, 0) : s;
                    const VI = s <= 7 ? Car : Bus;
                    return (
                      <motion.li layout key={`${i}-${s}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-24 rounded-2xl border border-line p-3 text-center">
                        <VI className="mx-auto size-6 text-brand-600" aria-hidden />
                        <p className="mt-1 text-xs font-bold">{s}-seater</p>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-go-500" style={{ width: `${(filled / s) * 100}%` }} /></span>
                        <span className="sr-only">{filled} of {s} seats used</span>
                      </motion.li>
                    );
                  })}
                </ul>
                <p className="mt-5 text-sm text-text-2">Starting from <strong className="text-ink-900">{naira(result.tier.minFare * (result.tier.id === 'sh-event' ? 1 : result.vehicles.length))}</strong> {result.tier.id === 'sh-event' ? 'for a coordinated fleet' : `for ${result.vehicles.length} vehicle${result.vehicles.length > 1 ? 's' : ''}`} — illustrative estimate; your quote reflects route and schedule.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {result.quote ? (
                    <>
                      <ButtonLink to={quoteHref(result.tier)} iconRight={<ArrowRight className="size-4" aria-hidden />}>Request a quote</ButtonLink>
                      <ButtonLink to={`/booking?service=shuttle&tier=${result.tier.id}`} variant="outline">Book directly</ButtonLink>
                    </>
                  ) : (
                    <>
                      <ButtonLink to={`/booking?service=shuttle&tier=${result.tier.id}`} iconRight={<ArrowRight className="size-4" aria-hidden />}>Book {result.tier.name}</ButtonLink>
                      <ButtonLink to={quoteHref(result.tier)} variant="outline">Request a quote</ButtonLink>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you specify */}
      <section className="container-x grid items-start gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeading eyebrow="What you’ll tell us" title="Everything we need to plan your trip." subtitle="Whether you book directly or request a quote, these details let us match the right vehicles and drivers." />
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/booking?service=shuttle" iconRight={<ArrowRight className="size-4" aria-hidden />}>Book a shuttle</ButtonLink>
            <ButtonLink to="/request-quote?service=Shuttle" variant="outline">Request a quote</ButtonLink>
          </Reveal>
        </div>
        <Reveal>
          <div className="card relative overflow-hidden p-2">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-2.5 rounded-full bg-crit/70" /><span className="size-2.5 rounded-full bg-warn/70" /><span className="size-2.5 rounded-full bg-ok/70" />
              <span className="ml-2 text-xs font-semibold text-muted">Shuttle booking · preview</span>
            </div>
            <ol className="grid gap-2 p-3 sm:grid-cols-2">
              {specify.map(({ I, t }, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={cn('flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-3', i === specify.length - 1 && 'sm:col-span-2')}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-soft"><I className="size-4" aria-hidden /></span>
                  <span className="text-sm font-semibold text-ink-900">{t}</span>
                  <span className="ml-auto text-xs font-bold text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      <ServiceFaq ids={['f12', 'f1', 'f16', 'f8', 'f18']} title="Shuttle FAQs" />

      <ServiceCTA
        eyebrow="Groups, events & contracts"
        title={<>Planning something <span className="text-gradient-go">bigger?</span></>}
        body="Weddings, conferences, staff transport and multi-day itineraries — tell us what you need and we’ll come back with a tailored quote."
        image={images.shuttle[4].src}
        imageAlt={images.shuttle[4].alt}
        whatsappMessage="Hello DoorstepGo, I'd like a shuttle quote."
        actions={
          <>
            <ButtonLink to="/request-quote?service=Shuttle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Request a quote</ButtonLink>
            <ButtonLink to="/booking?service=shuttle" variant="white" size="lg">Book a shuttle</ButtonLink>
          </>
        }
      />
    </>
  );
}
