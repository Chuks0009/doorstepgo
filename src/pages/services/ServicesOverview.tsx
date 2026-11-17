import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Briefcase, Calculator, Clock, Equal, MapPin, Package, Plus, User, Users, UsersRound, X } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, Icon, Reveal, SectionHeading, SmartImage, TiltCard } from '@/components/ui';
import { GlowOrbs, RoutePath, SpeedLines } from '@/components/services/Motifs';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { TrustShowcase } from '@/components/services/TrustShowcase';
import { cities } from '@/config/locations';
import { pricing } from '@/config/pricing';
import { images, img } from '@/data/images';
import { pic, serviceOverview } from '@/data/services';
import { usePageMeta } from '@/hooks';
import { cn, naira } from '@/utils';

const needs = [
  { id: 'solo', label: 'Just me', Icon: User, rec: 'motorcycle', why: 'A motorcycle is the fastest way through traffic for one passenger — from 3–6 minutes away.' },
  { id: 'few', label: '2–3 people', Icon: Users, rec: 'tricycle', why: 'A covered tricycle seats up to three with room for shopping bags, and you split one fare.' },
  { id: 'group', label: 'A group', Icon: UsersRound, rec: 'shuttle', why: 'Shuttles carry 7 to 30+ passengers with luggage space, for airport runs, events and staff movement.' },
  { id: 'goods', label: 'Goods / parcels', Icon: Package, rec: 'delivery', why: 'Send a rider to collect and deliver — parcels, documents, groceries and full market pickups.' },
] as const;

export default function ServicesOverview() {
  usePageMeta('Services', 'Motorcycle and tricycle rides, shuttles for groups and businesses, and doorstep delivery & logistics in Awka — from Ifite and UNIZIK to Eke Awka.');
  const [need, setNeed] = useState<(typeof needs)[number]['id']>('solo');
  const current = needs.find((n) => n.id === need)!;
  const recService = serviceOverview.find((s) => s.kind === current.rec)!;
  const [moto, tri, shuttle, delivery] = serviceOverview;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services' }]}
        eyebrow="Everything that moves"
        title={<>One app for <span className="text-gradient-go">rides, shuttles</span> and doorstep delivery.</>}
        subtitle="From a quick motorcycle hop to a 60-seat event fleet or a market run you never have to make yourself — pick a service, see a transparent estimate and book in minutes."
        image={images.city[0].src}
        imageAlt={images.city[0].alt}
        actions={
          <>
            <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a ride</ButtonLink>
            <ButtonLink to="/delivery" variant="glass" size="lg">Schedule a delivery</ButtonLink>
          </>
        }
        aside={
          <div className="glass-dark hidden rounded-3xl p-3 lg:block">
            <ul className="grid gap-2">
              {serviceOverview.map((s) => (
                <li key={s.kind}>
                  <Link to={s.to} className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white/10">
                    <SmartImage src={img(s.img.src, 200)} alt="" className="size-12 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.title}</span>
                      <span className="block text-xs text-white/55">from {naira(s.from)} · {s.eta}</span>
                    </span>
                    <ArrowUpRight className="size-4 text-white/40 transition group-hover:text-go-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* Service lines bento */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading eyebrow="Our services" title="Four service lines. One standard of care." subtitle="Each line has its own categories, vehicles and pricing — explore the details or jump straight into booking." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[minmax(320px,auto)_minmax(320px,auto)]">
          <ServiceTile s={delivery} className="lg:col-span-5 lg:row-span-2" big />
          <ServiceTile s={moto} className="lg:col-span-7" />
          <ServiceTile s={tri} className="lg:col-span-4" />
          <ServiceTile s={shuttle} className="lg:col-span-3" compact />
        </div>

        {/* Business transportation */}
        <Reveal className="mt-4">
          <div className="noise relative isolate overflow-hidden rounded-3xl bg-brand-sheen p-6 text-white sm:p-10">
            <SpeedLines className="absolute top-1/2 right-0 w-1/2 -translate-y-1/2 opacity-40" />
            <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Briefcase className="size-7" aria-hidden /></span>
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-white/70 uppercase">Business transportation</p>
                <h3 className="mt-1 text-2xl font-bold sm:text-3xl">Staff shuttles, executive transfers & logistics contracts</h3>
                <p className="mt-2 max-w-2xl text-white/80">Dedicated riders and vehicles, monthly invoicing, team accounts and trip reports — tailored to how your organisation moves.</p>
              </div>
              <ButtonLink to="/request-quote?type=business" variant="white" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Request a business quote</ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Which service? */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Not sure where to start?" title="Tell us what you’re moving." subtitle="Pick one and we’ll point you to the best fit." />
            <div role="radiogroup" aria-label="What are you moving?" className="mt-8 grid grid-cols-2 gap-3">
              {needs.map(({ id, label, Icon: I }) => (
                <button key={id} type="button" role="radio" aria-checked={need === id} onClick={() => setNeed(id)} className={cn('flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition', need === id ? 'border-go-500 bg-go-50 text-ink-900' : 'border-line text-text-2 hover:border-brand-300')}>
                  <I className={cn('size-5 shrink-0', need === id ? 'text-go-600' : 'text-brand-600')} aria-hidden /> {label}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={need} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} aria-live="polite">
              <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-white shadow-lift">
                <SmartImage src={img(recService.img.src, 1000)} alt={recService.img.alt} className="aspect-[16/9]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-xs font-bold tracking-[0.14em] text-go-300 uppercase">We recommend</p>
                  <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{recService.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-white/75 sm:text-base">{current.why}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ButtonLink to={recService.to} variant="go" iconRight={<ArrowRight className="size-4" aria-hidden />}>Explore {recService.title}</ButtonLink>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* How pricing works */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div aria-hidden className="grid-lines-light absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container-x relative">
          <SectionHeading align="center" eyebrow="How pricing works" title="Transparent estimates, before you book." subtitle="No guesswork. Every estimate is itemised from the same simple rules, and you see it before you confirm." />
          <Reveal className="mt-12">
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
              {[
                { t: 'Base fare', d: 'Set per category', c: 'bg-white' },
                { op: Plus },
                { t: 'Distance & time', d: 'Per km + per minute in-city', c: 'bg-white' },
                { op: X },
                { t: 'Category tier', d: 'Premium, Express, etc.', c: 'bg-white' },
                { op: Plus },
                { t: 'Time-of-day', d: `Peak +${Math.round(pricing.surcharges.peak.rate * 100)}% · Night +${Math.round(pricing.surcharges.night.rate * 100)}%`, c: 'bg-white' },
                { op: Equal },
                { t: 'Your estimate', d: `Incl. ${Math.round(pricing.serviceChargeRate * 100)}% service + ${naira(pricing.bookingFee)} booking fee`, c: 'bg-ink-950 text-white' },
              ].map((x, i) =>
                'op' in x && x.op ? (
                  <span key={i} aria-hidden className="mx-auto grid size-9 shrink-0 place-items-center rounded-full bg-go-500 text-white shadow-glow-go">
                    <x.op className="size-4" strokeWidth={3} />
                  </span>
                ) : (
                  <div key={i} className={cn('flex-1 rounded-2xl border border-line p-5 shadow-soft', x.c)}>
                    <p className="font-display text-lg font-bold">{x.t}</p>
                    <p className={cn('mt-1 text-sm', x.c.includes('ink') ? 'text-white/65' : 'text-text-2')}>{x.d}</p>
                  </div>
                ),
              )}
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { k: 'Return trips', v: `${Math.round((2 - pricing.ride.returnTripMultiplier) * 50)}% less`, d: 'than two one-way journeys' },
              { k: 'Free cancellation', v: `${pricing.cancellation.freeWindowMinutes} min`, d: 'after booking, or before a rider is assigned' },
              { k: 'Fares rounded', v: `to ${naira(pricing.roundTo)}`, d: 'so totals are easy to pay' },
            ].map((s, i) => (
              <Reveal key={s.k} delay={i * 0.05} className="card p-5">
                <p className="text-sm font-semibold text-text-2">{s.k}</p>
                <p className="mt-1 font-display text-3xl font-extrabold text-gradient-brand">{s.v}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/services/motorcycle#estimator" variant="ink" iconLeft={<Calculator className="size-4" aria-hidden />}>Estimate a ride</ButtonLink>
            <ButtonLink to="/services/delivery#estimator" variant="outline" iconLeft={<Calculator className="size-4" aria-hidden />}>Estimate a delivery</ButtonLink>
          </Reveal>
          <p className="mt-4 text-center text-xs text-muted">Rates shown are illustrative demonstration values.</p>
        </div>
      </section>

      <TrustShowcase />

      {/* Coverage */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="Coverage" title="Where we move." subtitle="We're live across Awka, junction-by-junction — strongest in Ifite and around UNIZIK. Onitsha, Nnewi and Enugu are on the roadmap." />
            <Reveal delay={0.15} className="relative mt-8 overflow-hidden rounded-3xl">
              <SmartImage src={img(images.tricycle[1].src, 900)} alt={images.tricycle[1].alt} className="aspect-[16/10]" />
              <RoutePath className="absolute inset-x-6 bottom-6 h-20 w-[calc(100%-3rem)]" />
            </Reveal>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cities.map((c, i) => {
              const junctions = c.areas.reduce((n, a) => n + a.junctions.length, 0);
              return (
                <Reveal as="li" key={c.id} delay={i * 0.04} className={cn('relative overflow-hidden rounded-2xl border p-5', c.active ? 'border-line bg-white shadow-soft' : 'border-dashed border-line-strong bg-transparent')}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><MapPin className={cn('size-4', c.active ? 'text-go-500' : 'text-muted')} aria-hidden /> {c.name}</p>
                      <p className="text-sm text-muted">{c.state}, {c.country}</p>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase', c.active ? 'bg-ok-bg text-ok' : 'bg-surface-2 text-muted')}>{c.active ? 'Live (demo)' : 'Coming soon'}</span>
                  </div>
                  {c.active && <p className="mt-3 text-[13px] text-text-2">{c.areas.length} areas · {junctions} junctions</p>}
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <ServiceCTA
        title={<>Where are you headed <span className="text-gradient-go">today?</span></>}
        body="Book a ride or a delivery in under two minutes, with an itemised estimate before you confirm."
        image={pic('hero', 0).src}
        imageAlt={pic('hero', 0).alt}
        actions={
          <>
            <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a ride</ButtonLink>
            <ButtonLink to="/delivery" variant="white" size="lg">Send a package</ButtonLink>
          </>
        }
      />
    </>
  );
}

function ServiceTile({ s, className, big, compact }: { s: (typeof serviceOverview)[number]; className?: string; big?: boolean; compact?: boolean }) {
  return (
    <Reveal className={cn('min-h-80', className)}>
      <TiltCard max={4} className="h-full rounded-3xl">
        <Link to={s.to} className="group relative isolate flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-7">
          <SmartImage src={img(s.img.src, big ? 1200 : 900)} alt={s.img.alt} className="absolute inset-0 -z-10" imgClassName="transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/5" />
          {big && <GlowOrbs className="opacity-60" />}
          <span className="absolute top-5 left-5 grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-md transition group-hover:bg-go-500"><Icon name={s.icon} className="size-6" /></span>
          <span className="absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-white/20 transition group-hover:rotate-45 group-hover:border-go-400 group-hover:bg-go-500"><ArrowUpRight className="size-5" aria-hidden /></span>
          <p className="text-xs font-bold tracking-[0.14em] text-go-300 uppercase">{s.short}</p>
          <h3 className={cn('mt-1 font-bold', big ? 'text-3xl sm:text-4xl' : 'text-2xl')}>{s.title}</h3>
          {!compact && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{s.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">from {naira(s.from)}</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur"><Clock className="size-3" aria-hidden /> {s.eta}</span>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  );
}
