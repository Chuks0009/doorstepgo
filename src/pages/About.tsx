import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Bike, Briefcase, CarTaxiFront, Check, Clock, Compass, Eye, Globe, Handshake, Headset, MapPin, Quote, Receipt, Rocket,
  Route, ShieldCheck, Smartphone, Store, Target, Truck, Users, Wallet, X,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, ExternalButton, Icon, Reveal, SectionHeading, SmartImage, TiltCard } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { images, img } from '@/data/images';
import { stats, values } from '@/data/content';
import { site } from '@/config/site';
import { cn } from '@/utils';
import { CountStat, DemoChip, Orbs, RevealImage, SpeedLines, useHashScroll } from '@/components/company/shared';
import { TeamSection } from '@/components/company/TeamSection';
import { PartnerForm } from '@/components/company/PartnerForm';

const MISSION = 'To simplify mobility and logistics by connecting people, businesses and transportation providers through accessible, reliable and innovative technology.';
const VISION = 'To become a trusted mobility and logistics ecosystem that transforms how people move and how goods reach their destinations.';

const story = [
  { k: 'The wait', title: 'It started at Miracle Junction', body: 'Our founders were UNIZIK students living in Ifite. Every lecture morning was the same: standing at the junction, watching full kekes roll past, arriving late to an 8 AM class with no way to book ahead.' },
  { k: 'The errand', title: 'Then came the Eke Awka run', body: 'Foodstuff to buy, a lecture to attend and only one of you. Friends and neighbours kept asking the same favour — “abeg, help me collect it from the market” — and nobody had a reliable way to send someone.' },
  { k: 'The idea', title: 'What if the ride came to the lodge?', body: 'No haggling at the junction, no guessing the fare, no wondering where your parcel is. One platform where students, traders, merchants and keke and okada operators meet — with clear prices and honest updates.' },
  { k: 'Today', title: 'Built for how Awka actually moves', body: 'Okada, keke, shuttle and dispatch — the vehicles Awka already runs on — organised junction by junction, starting in Ifite and around UNIZIK, with technology that respects people’s time, money and safety.' },
];

const reasons = [
  { before: 'Walking to the junction to haggle with whoever is available.', after: 'A ride booked to your gate with the estimated fare shown upfront.', icon: MapPin },
  { before: 'Losing half a day to collect goods from the market.', after: 'Market pickup with seller details, delivery codes and live status.', icon: Store },
  { before: 'Small businesses improvising logistics through WhatsApp groups.', after: 'Bulk drops, scheduled pickups and one monthly statement.', icon: Truck },
  { before: 'Riders earning unpredictably with long idle hours.', after: 'Smarter dispatch that keeps good operators busy and paid fairly.', icon: Bike },
];

const commitments = [
  { title: 'Fares you can see before you go', body: 'Every estimate is itemised before you confirm — booking fee, service charge and any surcharge.', icon: Receipt },
  { title: 'Real humans when you need help', body: `WhatsApp, phone and email support during operating hours (${site.hours[0].days}, ${site.hours[0].time}).`, icon: Headset },
  { title: 'Safety designed into every trip', body: 'Helmets for passengers, trip sharing, rider identification on screen and an in-app support line.', icon: ShieldCheck },
  { title: 'Honest updates, early', body: 'If something changes — delays, re-assignments, route issues — you hear it from us first.', icon: Clock },
  { title: 'Your data, respected', body: 'We collect what we need to move you and nothing more. Read our privacy policy for the detail.', icon: Eye },
  { title: 'Every complaint closes a loop', body: 'Feedback is tracked to resolution and fed back into the product. No ticket left hanging.', icon: Check },
];

type Phase = 'live' | 'building' | 'planned' | 'exploring';
const roadmap: { phase: Phase; when: string; title: string; body: string; icon: typeof Rocket }[] = [
  { phase: 'live', when: 'Now', title: 'Ifite & UNIZIK', body: 'Live junction by junction across Ifite-Awka, Temp Site and around the UNIZIK gates.', icon: MapPin },
  { phase: 'building', when: 'Next', title: 'All of Awka', body: 'Deeper coverage in Awka town, Aroma, Okpuno, Agu-Awka, Amawbia, Amansea and Mgbakwu.', icon: Compass },
  { phase: 'building', when: 'Next', title: 'Rider & driver app', body: 'A dedicated partner app for trip offers, navigation, earnings and payouts.', icon: Smartphone },
  { phase: 'planned', when: 'Later', title: 'Live GPS tracking', body: 'Real-time vehicle location on every ride and delivery, shareable with family.', icon: Route },
  { phase: 'planned', when: 'Later', title: 'DoorstepGo wallet', body: 'Top up once, pay in a tap, receive instant refunds and loyalty cash-back.', icon: Wallet },
  { phase: 'planned', when: 'Later', title: 'Merchant API', body: 'Plug deliveries straight into online stores and order systems.', icon: Store },
  { phase: 'planned', when: 'Later', title: 'Onitsha & Nnewi', body: 'Taking the doorstep model to Anambra’s commercial hubs — markets, merchants and commuters.', icon: Rocket },
  { phase: 'exploring', when: 'Horizon', title: 'Enugu & more of the South-East', body: 'Growing across the region once Anambra runs smoothly.', icon: Globe },
];
const phaseStyle: Record<Phase, string> = {
  live: 'bg-ok text-white',
  building: 'bg-go-500 text-white',
  planned: 'bg-brand-500 text-white',
  exploring: 'bg-white/15 text-white',
};

const roles = [
  { title: 'Senior Frontend Engineer', team: 'Technology', location: 'Awka · Hybrid', type: 'Full-time' },
  { title: 'Backend Engineer — Dispatch & Routing', team: 'Technology', location: 'Awka · Hybrid', type: 'Full-time' },
  { title: 'Product Designer', team: 'Product', location: 'Remote (Nigeria)', type: 'Full-time' },
  { title: 'Awka Operations Lead', team: 'Operations', location: 'Awka (Ifite)', type: 'Full-time' },
  { title: 'Merchant Partnerships Manager', team: 'Business', location: 'Awka', type: 'Full-time' },
  { title: 'Customer Experience Associate', team: 'Support', location: 'Awka · Shifts', type: 'Full-time' },
];
const careersMail = (role?: string) =>
  `mailto:${site.contact.careersEmail}?subject=${encodeURIComponent(role ? `Application — ${role}` : 'General application — DoorstepGo')}`;

/* ---------------------------------------------------------------- */

function ValuesExplorer() {
  const [active, setActive] = useState(0);
  const v = values[active];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
      <div role="tablist" aria-label="Our values" aria-orientation="vertical" className="flex flex-col gap-1.5"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setActive((a) => (a + 1) % values.length); }
          if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setActive((a) => (a - 1 + values.length) % values.length); }
          requestAnimationFrame(() => (document.querySelector('[role=tab][aria-selected=true][data-value-tab]') as HTMLElement | null)?.focus());
        }}
      >
        {values.map((val, i) => {
          const on = i === active;
          return (
            <button
              key={val.title}
              role="tab"
              data-value-tab
              id={`value-tab-${i}`}
              aria-selected={on}
              aria-controls="value-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn('group relative flex min-h-14 items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors', on ? 'text-ink-900' : 'text-text-2 hover:text-ink-900')}
            >
              {on && <motion.span layoutId="value-pill" className="absolute inset-0 -z-10 rounded-2xl bg-white shadow-lift ring-1 ring-line" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
              <span className={cn('font-display text-sm font-bold tabular-nums transition-colors', on ? 'text-go-500' : 'text-muted')}>{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 font-display text-lg font-semibold sm:text-xl">{val.title}</span>
              <ArrowRight className={cn('size-4 transition-all', on ? 'translate-x-0 text-go-500 opacity-100' : '-translate-x-2 opacity-0')} aria-hidden />
            </button>
          );
        })}
      </div>
      <div id="value-panel" role="tabpanel" aria-labelledby={`value-tab-${active}`} className="noise relative min-h-[340px] overflow-hidden rounded-3xl bg-ink-950 p-8 text-white shadow-lift sm:p-10">
        <Orbs />
        <SpeedLines className="absolute top-10 right-0 w-1/2 opacity-60" />
        <AnimatePresence mode="wait">
          <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="relative flex h-full flex-col">
            <span className="grid size-16 place-items-center rounded-2xl bg-go-sheen shadow-glow-go">
              <Icon name={v.icon} className="size-8" />
            </span>
            <p className="mt-10 font-display text-[5rem] leading-none font-extrabold text-white/[0.06] select-none sm:text-[7rem]" aria-hidden>{String(active + 1).padStart(2, '0')}</p>
            <h3 className="-mt-10 text-3xl font-bold sm:-mt-14 sm:text-4xl">{v.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">{v.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="absolute right-8 bottom-8 left-8 flex gap-1.5" aria-hidden>
          {values.map((_, i) => <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-500', i <= active ? 'bg-go-500' : 'bg-white/15')} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export default function AboutPage() {
  usePageMeta('About us', `${site.name} is on a mission to simplify mobility and logistics — connecting people, businesses and transport providers in Awka, starting with Ifite and UNIZIK.`);
  useHashScroll();

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About DoorstepGo"
        title={<>We’re rebuilding how <span className="text-gradient-go">Awka moves</span> — one doorstep at a time.</>}
        subtitle="Rides, shuttles, parcels and market runs on one platform — born around UNIZIK and built for the way Ifite and the rest of Awka actually work."
        actions={
          <>
            <ButtonLink to="/about#story" size="lg" iconRight={<ArrowRight className="size-4" />}>Read our story</ButtonLink>
            <ButtonLink to="/about#careers" size="lg" variant="glass">We’re hiring</ButtonLink>
          </>
        }
        aside={
          <div className="relative mx-auto hidden h-[380px] w-full max-w-md sm:block">
            <motion.div className="absolute top-0 right-0 w-[78%]" animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <TiltCard className="rounded-3xl">
                <SmartImage src={img(images.tricycle[0].src, 800)} alt={images.tricycle[0].alt} className="aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/15" eager />
              </TiltCard>
            </motion.div>
            <motion.div className="absolute bottom-0 left-0 w-[58%]" animate={{ y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
              <TiltCard className="rounded-3xl">
                <SmartImage src={img(images.motorcycle[0].src, 600)} alt={images.motorcycle[0].alt} className="aspect-square overflow-hidden rounded-3xl ring-4 ring-ink-950" eager />
              </TiltCard>
            </motion.div>
            <div className="glass-dark absolute right-2 bottom-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
              <span className="relative grid size-10 place-items-center rounded-xl bg-go-500"><MapPin className="size-5" aria-hidden /><span className="absolute inset-0 animate-pulse-ring rounded-xl ring-2 ring-go-500" aria-hidden /></span>
              <div>
                <p className="text-xs text-white/60">Born in</p>
                <p className="font-display font-bold">Ifite-Awka, Anambra</p>
              </div>
            </div>
          </div>
        }
      />

      {/* ------------------------------------------------ STORY */}
      <section id="story" className="relative scroll-mt-20 py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal><span className="eyebrow">Our story</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 text-3xl leading-[1.1] font-bold text-ink-900 sm:text-4xl lg:text-5xl">From a junction wait to a <span className="slash-go relative z-0">platform</span>.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg leading-relaxed text-text-2">DoorstepGo exists to make mobility and logistics <strong className="text-ink-900">accessible, convenient and reliable</strong> for everyone — the student, the commuter, the trader, the small business and the rider who moves them all.</p>
            </Reveal>
            <Reveal delay={0.15}>
              <RevealImage src={img(images.market[0].src, 900)} alt={images.market[0].alt} className="mt-8 aspect-[16/10] rounded-3xl shadow-lift" />
            </Reveal>
          </div>

          <ol className="relative">
            <span aria-hidden className="absolute top-3 bottom-3 left-[19px] w-[3px] rounded-full bg-gradient-to-b from-go-500 via-brand-500 to-transparent" />
            {story.map((s, i) => (
              <Reveal as="li" key={s.k} delay={i * 0.05} className="relative pb-12 pl-16 last:pb-0">
                <span className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-white font-display text-sm font-bold text-ink-900 shadow-soft ring-4 ring-canvas">
                  {i + 1}
                </span>
                <p className="text-xs font-bold tracking-[0.18em] text-go-600 uppercase">{s.k}</p>
                <h3 className="mt-2 text-2xl font-bold text-ink-900">{s.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-text-2">{s.body}</p>
              </Reveal>
            ))}
            <Reveal as="li" className="relative mt-12 pl-16">
              <figure className="relative overflow-hidden rounded-3xl bg-brand-sheen p-7 text-white shadow-glow-brand">
                <Quote className="absolute -top-2 -right-2 size-28 text-white/10" aria-hidden />
                <blockquote className="relative font-display text-xl leading-snug font-semibold">“We didn’t need new vehicles. We needed the ones we already have to be bookable, trackable and fair.”</blockquote>
                <figcaption className="relative mt-4 text-sm text-white/75">— Founding team (illustrative quote)</figcaption>
              </figure>
            </Reveal>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ MISSION & VISION */}
      <section id="mission" className="noise relative isolate scroll-mt-20 overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
        <Orbs />
        <div className="container-x">
          <SectionHeading dark eyebrow="Mission & vision" title={<>Why we wake up <span className="text-gradient-go">early</span></>} align="center" />
          <div className="mt-14 grid gap-5 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <TiltCard max={4} className="h-full rounded-3xl">
                <article className="glass-dark relative h-full overflow-hidden rounded-3xl p-8 sm:p-12">
                  <SpeedLines className="absolute top-8 right-0 w-2/5 opacity-70" />
                  <span className="grid size-14 place-items-center rounded-2xl bg-go-sheen shadow-glow-go"><Target className="size-7" aria-hidden /></span>
                  <p className="mt-8 text-sm font-bold tracking-[0.2em] text-go-300 uppercase">Our mission</p>
                  <p className="mt-3 font-display text-2xl leading-snug font-semibold text-balance sm:text-3xl lg:text-[2.1rem]">{MISSION}</p>
                </article>
              </TiltCard>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-2">
              <TiltCard max={4} className="h-full rounded-3xl">
                <article className="relative h-full overflow-hidden rounded-3xl bg-brand-sheen p-8 shadow-glow-brand sm:p-10">
                  <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-10 -bottom-10 size-56 text-white/15 animate-spin-slow"><circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 10" /><circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                  <span className="grid size-14 place-items-center rounded-2xl bg-white/15"><Eye className="size-7" aria-hidden /></span>
                  <p className="mt-8 text-sm font-bold tracking-[0.2em] text-white/80 uppercase">Our vision</p>
                  <p className="relative mt-3 font-display text-xl leading-snug font-semibold text-balance sm:text-2xl">{VISION}</p>
                </article>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ VALUES */}
      <section className="relative py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Our values" title="Seven promises we build around" subtitle="Hover or tab through — each value shapes a real product decision, from how fares are shown to how riders are dispatched." />
          <div className="mt-12"><ValuesExplorer /></div>
        </div>
      </section>

      {/* ------------------------------------------------ WHY WE EXIST */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Why we exist" title={<>Moving around shouldn’t be the <span className="text-gradient-brand">hardest part</span> of your day.</>} />
          <div className="mt-12 overflow-hidden rounded-3xl border border-line">
            <div className="hidden grid-cols-[1fr_auto_1fr] bg-surface-2 px-6 py-3 text-xs font-bold tracking-wider text-muted uppercase md:grid">
              <span>Before</span><span className="w-12" /><span>With {site.name}</span>
            </div>
            {reasons.map((r, i) => (
              <Reveal key={i} delay={i * 0.05} className="group grid items-center gap-3 border-t border-line px-6 py-6 first:border-t-0 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:first:border-t">
                <p className="flex items-start gap-3 text-text-2"><X className="mt-0.5 size-5 shrink-0 text-crit" aria-hidden /><span><span className="sr-only">Before: </span>{r.before}</span></p>
                <span className="grid size-12 place-items-center rounded-2xl bg-ink-900 text-white transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-go-500" aria-hidden><r.icon className="size-5" /></span>
                <p className="flex items-start gap-3 font-semibold text-ink-900"><Check className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden /><span><span className="sr-only">With {site.name}: </span>{r.after}</span></p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ IMPACT */}
      <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white lg:py-24">
        <Orbs />
        <RoutePathBg />
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow-dark">Our impact</span>
              <h2 className="mt-4 max-w-xl text-3xl font-bold sm:text-4xl">Small trips. Big difference.</h2>
            </div>
            <DemoChip dark>Illustrative figures</DemoChip>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="relative bg-ink-950/90 p-8">
                <p className={cn('font-display text-5xl font-extrabold tracking-tight lg:text-6xl', i === 0 ? 'text-gradient-go' : 'text-white')}>
                  <CountStat value={s.value} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="mt-3 text-sm text-white/60">{s.label}</p>
                <span aria-hidden className="absolute top-8 right-8 h-[3px] w-8 rounded-full bg-gradient-to-l from-go-500 to-transparent" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ COMMITMENT */}
      <section className="relative py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative order-last lg:order-first">
            <TiltCard max={5} className="rounded-[2rem]">
              <SmartImage src={img(images.people[2].src, 900)} alt={images.people[2].alt} className="aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift" />
            </TiltCard>
            <div className="glass absolute -right-2 bottom-8 max-w-[240px] rounded-2xl p-4 shadow-lift lg:-right-8">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Headset className="size-4 text-go-500" aria-hidden /> Support hours</p>
              <ul className="mt-2 space-y-1 text-xs text-text-2">
                {site.hours.map((h) => <li key={h.days}><span className="font-semibold text-ink-800">{h.days}:</span> {h.time}</li>)}
              </ul>
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="Our commitment to customers" title="What you can always expect from us" />
            <ul className="mt-10 grid gap-x-6 gap-y-7 sm:grid-cols-2">
              {commitments.map((c, i) => (
                <Reveal as="li" key={c.title} delay={i * 0.04} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><c.icon className="size-5" aria-hidden /></span>
                  <div>
                    <h3 className="font-semibold text-ink-900">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-2">{c.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <TeamSection />

      {/* ------------------------------------------------ FUTURE */}
      <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
        <Orbs />
        <div className="container-x">
          <SectionHeading dark eyebrow="Our future" title={<>Where the road <span className="text-gradient-go">goes next</span></>} subtitle="An indicative roadmap — timelines will shift as we learn. Nothing here is a commitment to a date." />
          <div className="relative mt-14">
            <span aria-hidden className="absolute top-0 bottom-0 left-[23px] w-[2px] bg-gradient-to-b from-ok via-go-500 to-brand-500 lg:top-[23px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[2px] lg:w-full lg:bg-gradient-to-r" />
            <ol className="scrollbar-none relative grid gap-8 lg:flex lg:gap-5 lg:overflow-x-auto lg:pb-4">
              {roadmap.map((r, i) => (
                <Reveal as="li" key={r.title} delay={i * 0.06} className="relative pl-16 lg:w-64 lg:shrink-0 lg:pt-16 lg:pl-0">
                  <span className={cn('absolute top-0 left-0 grid size-12 place-items-center rounded-2xl ring-4 ring-ink-950', phaseStyle[r.phase])}>
                    <r.icon className="size-5" aria-hidden />
                    {r.phase === 'live' && <span className="absolute inset-0 animate-pulse-ring rounded-2xl ring-2 ring-ok" aria-hidden />}
                  </span>
                  <article className="glass-dark h-full rounded-2xl p-5 transition-colors hover:bg-white/[0.1]">
                    <p className="text-[11px] font-bold tracking-[0.18em] text-white/50 uppercase">{r.when} · <span className="text-go-300">{r.phase}</span></p>
                    <h3 className="mt-2 text-lg font-bold">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/65">{r.body}</p>
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ CAREERS */}
      <section id="careers" className="relative scroll-mt-20 py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Join our team" title="Help us move a nation" subtitle="We hire curious, kind and relentlessly practical people. Don’t see your role? Send us a note anyway." />
            <ul className="mt-8 flex flex-wrap gap-2">
              {['Hybrid working', 'Health cover', 'Learning budget', 'Free rides & deliveries', 'Equity for early hires'].map((p) => (
                <li key={p} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-text-2">{p}</li>
              ))}
            </ul>
            <ExternalButton href={careersMail()} variant="ink" size="lg" className="mt-8" iconRight={<ArrowUpRight className="size-4" />}>Send a general application</ExternalButton>
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-2"><span className="text-ink-900">{roles.length}</span> open roles</p>
              <DemoChip>Sample openings</DemoChip>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
              {roles.map((r, i) => (
                <Reveal as="li" key={r.title} delay={i * 0.04}>
                  <a href={careersMail(r.title)} className="group relative flex flex-col gap-3 p-5 transition-colors hover:bg-canvas sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                    <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-go-500 transition-transform duration-300 group-hover:scale-y-100" />
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-800 transition-colors group-hover:bg-ink-900 group-hover:text-white"><Briefcase className="size-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-900">{r.title}</span>
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                        <span>{r.team}</span><span aria-hidden>•</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{r.location}</span><span aria-hidden>•</span><span>{r.type}</span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">Apply by email <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
                  </a>
                </Reveal>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Applications go to <a className="font-semibold text-brand-700 hover:underline" href={careersMail()}>{site.contact.careersEmail}</a>.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ PARTNER */}
      <section id="partner" className="relative scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeading eyebrow="Become a partner" title={<>Grow with <span className="text-gradient-go">DoorstepGo</span></>} subtitle="Riders, drivers, fleet owners and merchants power everything we do. Register your interest and our partnerships team will reach out." />
            <div className="mt-10 grid gap-3">
              {[
                { icon: Bike, title: 'Riders & drivers', body: 'Steady trip offers, transparent earnings and support on the road.' },
                { icon: CarTaxiFront, title: 'Fleet owners', body: 'Put bikes, kekes and vans to work with utilisation reports.' },
                { icon: Store, title: 'Merchants', body: 'Bulk and scheduled deliveries with monthly invoicing.', to: '/customers/merchants' },
                { icon: Handshake, title: 'Corporate partners', body: 'Staff shuttles and logistics on a business account.', to: '/request-quote?type=business' },
              ].map((p) => {
                const inner = (
                  <>
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white transition-colors group-hover:bg-go-500"><p.icon className="size-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-900">{p.title}</span>
                      <span className="block text-sm text-text-2">{p.body}</span>
                    </span>
                    {p.to && <ArrowRight className="size-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden />}
                  </>
                );
                return p.to ? (
                  <Link key={p.title} to={p.to} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-brand-300 hover:shadow-soft">{inner}</Link>
                ) : (
                  <div key={p.title} className="group flex items-center gap-4 rounded-2xl border border-line p-4">{inner}</div>
                );
              })}
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-text-2"><Users className="size-4 text-go-500" aria-hidden /> Prefer email? <a href={`mailto:${site.contact.partnersEmail}`} className="font-semibold text-brand-700 hover:underline">{site.contact.partnersEmail}</a></p>
          </div>
          <Reveal>
            <div className="relative rounded-[2rem] border border-line bg-canvas p-6 shadow-lift sm:p-8">
              <span aria-hidden className="absolute -top-3 left-8 h-1.5 w-24 rounded-full bg-go-sheen" />
              <h3 className="text-2xl font-bold text-ink-900">Partner interest form</h3>
              <p className="mt-1 mb-6 text-sm text-text-2">Takes under a minute. We’ll never share your details.</p>
              <PartnerForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function RoutePathBg() {
  return (
    <svg aria-hidden viewBox="0 0 1200 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-10 size-full opacity-40">
      <path d="M-20 320 C 200 300, 260 120, 480 140 S 760 320, 940 220 S 1160 60, 1240 90" fill="none" stroke="#FF6A13" strokeWidth="2.5" strokeDasharray="10 12" className="animate-dash" />
      <path d="M-20 360 C 240 360, 320 220, 560 240 S 900 380, 1240 260" fill="none" stroke="#2F7BFF" strokeWidth="2" strokeDasharray="4 10" className="animate-dash" />
      {[[480, 140], [940, 220]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill="#FF6A13" />)}
    </svg>
  );
}
