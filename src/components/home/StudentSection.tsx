import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Backpack, Bus, CalendarClock, GraduationCap, ShoppingBasket, Store, TicketPercent } from 'lucide-react';
import { ButtonLink, Reveal, SectionHeading } from '@/components/ui';
import { CopyButton } from '@/components/company/shared';
import { promoCodes } from '@/config/pricing';
import { site } from '@/config/site';
import { findTier } from '@/data/services';
import { junctionLabel } from '@/config/locations';
import { estimateRide } from '@/services/pricingService';
import { cn, naira } from '@/utils';
import { Orb, SpeedLines } from './motifs';

const LECTURE_ROUTE = { tierId: 'tri-scheduled', pickup: { cityId: 'awka', junctionId: 'miracle-jn' }, dropoff: { cityId: 'awka', junctionId: 'unizik-main-gate' }, time: '07:30' };
const LECTURE_LINK = '/booking?service=tricycle&tier=tri-scheduled&pickupCity=awka&pickupJunction=miracle-jn&dropoffCity=awka&dropoffJunction=unizik-main-gate';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LECTURE_DAYS = new Set(['Mon', 'Wed', 'Thu']);

const perks = [
  { Icon: ShoppingBasket, title: 'Market runs while you’re in class', body: 'A rider collects your foodstuff from Eke Awka or Ifite First Market and drops it at your lodge.', to: '/delivery?category=market-pickup', cta: 'Send a rider' },
  { Icon: Bus, title: 'Excursions & going home after exams', body: 'Shared shuttles for departmental trips, and seats home to Onitsha, Nnewi or Enugu when the semester ends.', to: '/services/shuttle', cta: 'Shuttle options' },
  { Icon: Store, title: 'Campus vendor deliveries', body: 'Food spots, printing shops and campus vendors can deliver to hostels, lodges and faculties.', to: '/customers/merchants', cta: 'For vendors' },
];

/** "Made for UNIZIK students" — student angle on the homepage (not student-only). */
export function StudentSection() {
  const promo = promoCodes.find((p) => p.code === 'UNIZIK10' && p.active);
  const keke = findTier('tri-standard');
  const fare = estimateRide(LECTURE_ROUTE);

  return (
    <section aria-labelledby="students-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div aria-hidden className="grid-lines-light absolute inset-0 -z-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_70%,transparent)]" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow={<><GraduationCap className="size-3.5" aria-hidden /> For {site.market.campusShort} students</>}
          title={<span id="students-title">Made for <span className="text-gradient-go">{site.market.campusShort} students.</span></span>}
          subtitle={`Living in ${site.market.focus}, Temp Site or on campus? Book from your lodge, skip the junction wait and keep more of your allowance${keke ? ` — keke trips from ${naira(keke.minFare)} (estimate)` : ''}. Everyone else in Awka is welcome too.`}
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {/* Lecture-day keke — hero card */}
          <Reveal className="lg:col-span-7 lg:row-span-2">
            <div className="noise relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white sm:p-9">
              <Orb className="top-[-30%] right-[-20%] size-[420px]" />
              <Orb tone="go" className="bottom-[-30%] left-[-10%] size-[320px]" />
              <SpeedLines className="absolute top-8 right-0 w-1/3 opacity-50" />
              <span className="grid size-12 place-items-center rounded-2xl bg-go-500 shadow-glow-go"><Backpack className="size-6" aria-hidden /></span>
              <h3 className="mt-6 max-w-md text-2xl font-bold sm:text-3xl">Lecture-day keke, straight from your lodge.</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">Schedule a tricycle for your 8 AM — once, or on repeat for every lecture day. Your rider meets you at the lodge gate, not the junction.</p>

              {/* mock schedule */}
              <div aria-hidden className="mt-8 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-2 font-semibold text-white"><CalendarClock className="size-4 text-go-300" /> Repeats weekly · 7:30 AM</span>
                  <span>Sample schedule</span>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {WEEKDAYS.map((d) => (
                    <span key={d} className={cn('rounded-xl py-2 text-center text-xs font-bold', LECTURE_DAYS.has(d) ? 'bg-go-500 text-white' : 'bg-white/5 text-white/40')}>{d}</span>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  <p className="flex items-center gap-2.5"><span className="size-2.5 rounded-full bg-brand-400 ring-2 ring-white/30" /> {junctionLabel(LECTURE_ROUTE.pickup.cityId, LECTURE_ROUTE.pickup.junctionId)}</p>
                  <p className="flex items-center gap-2.5"><span className="size-2.5 rounded-[3px] bg-go-500 ring-2 ring-white/30" /> {junctionLabel(LECTURE_ROUTE.dropoff.cityId, LECTURE_ROUTE.dropoff.junctionId)}</p>
                </div>
                {fare && <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">Est. <strong className="font-display text-base text-white">{naira(fare.total)}</strong> per trip · {fare.distanceKm} km · ~{fare.durationMin} min</p>}
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <ButtonLink to={LECTURE_LINK} size="lg" iconRight={<ArrowRight className="size-4" />}>Schedule my lecture ride</ButtonLink>
                <ButtonLink to="/register" size="lg" variant="glass">Create free account</ButtonLink>
              </div>
            </div>
          </Reveal>

          {/* Promo */}
          {promo && (
            <Reveal delay={0.05} className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-[2rem] bg-go-sheen p-6 text-white shadow-glow-go sm:p-7">
                <div aria-hidden className="absolute -top-6 -right-6 size-32 rounded-full border-[14px] border-white/15" />
                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase"><TicketPercent className="size-4" aria-hidden /> Student promo</p>
                <p className="mt-3 font-mono text-3xl font-extrabold tracking-wider sm:text-4xl">{promo.code}</p>
                <p className="mt-2 text-sm text-white/85">{promo.description}. Enter it at checkout.</p>
                <CopyButton value={promo.code} label="Copy code" dark className="mt-5" />
                <p className="mt-4 text-[11px] text-white/70">Illustrative promo in this demo — terms may change.</p>
              </div>
            </Reveal>
          )}

          {/* Perks */}
          <ul className={cn('grid gap-4 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1', !promo && 'lg:row-span-2')}>
            {perks.map((p, i) => (
              <Reveal as="li" key={p.title} delay={0.08 + i * 0.05}>
                <Link to={p.to} className="group flex h-full gap-4 rounded-3xl border border-line bg-canvas p-5 transition hover:-translate-y-0.5 hover:border-go-300 hover:shadow-soft">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-go-300 transition-transform duration-500 group-hover:-rotate-6"><p.Icon className="size-5" aria-hidden /></span>
                  <span className="min-w-0">
                    <span className="block font-display font-bold text-ink-900">{p.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-text-2">{p.body}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">{p.cta} <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
