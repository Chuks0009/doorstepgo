import { ArrowRight, BadgeCheck, Calculator, HardHat, Share2, ShieldCheck, Shirt, Star, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, Reveal, SectionHeading, SmartImage } from '@/components/ui';
import { BookingFlow, rideFlowSteps } from '@/components/services/BookingFlow';
import { FareEstimator } from '@/components/services/FareEstimator';
import { GlowOrbs, SpeedLines } from '@/components/services/Motifs';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { ServiceTierCard } from '@/components/services/ServiceTierCard';
import { useHashScroll } from '@/components/services/useHashScroll';
import { images, img } from '@/data/images';
import { motorcycleTiers } from '@/data/services';
import { usePageMeta } from '@/hooks';
import { naira } from '@/utils';

const safety = [
  { Icon: HardHat, t: 'Helmets for every passenger', d: 'Riders carry a spare passenger helmet and hairnet. Please wear it for the whole trip.' },
  { Icon: BadgeCheck, t: 'Rider details before pickup', d: 'Name, photo, rating, bike and plate number appear on your booking so you know who to expect.' },
  { Icon: Share2, t: 'Share your trip', d: 'Send your booking reference or status link to someone you trust while you ride.' },
  { Icon: Shirt, t: 'Ride-ready etiquette', d: 'Keep one small bag, hold the grab rail, and let your rider know if you want them to slow down.' },
];

export default function MotorcyclePage() {
  usePageMeta('Motorcycle Rides', 'Book Standard, Premium, Express, Scheduled or Business motorcycle rides with trained, helmeted riders. See estimated fares before you confirm.');
  useHashScroll();
  const [featured, ...rest] = motorcycleTiers;
  const minFrom = Math.min(...motorcycleTiers.map((t) => t.minFare));

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Motorcycle' }]}
        eyebrow="Motorcycle rides"
        title={<>Beat the traffic. <span className="text-gradient-go">Arrive on time.</span></>}
        subtitle="Five ways to ride — from everyday hops to priority express dispatch and dedicated business riders. Every trip comes with a spare helmet and an itemised fare estimate."
        image={images.hero[0].src}
        imageAlt={images.hero[0].alt}
        actions={
          <>
            <ButtonLink to="/booking?service=motorcycle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a motorcycle</ButtonLink>
            <ButtonLink to="#estimator" variant="glass" size="lg" iconLeft={<Calculator className="size-5" aria-hidden />}>Estimate a fare</ButtonLink>
          </>
        }
        aside={
          <div className="glass-dark grid grid-cols-3 divide-x divide-white/10 rounded-3xl p-2 text-center">
            {[
              { v: String(motorcycleTiers.length), k: 'Categories' },
              { v: naira(minFrom), k: 'Starting from' },
              { v: motorcycleTiers.find((t) => t.id === 'moto-express')?.eta ?? '2–4 min', k: 'Express pickup' },
            ].map((s) => (
              <div key={s.k} className="px-2 py-4">
                <p className="font-display text-xl font-extrabold sm:text-2xl">{s.v}</p>
                <p className="mt-1 text-[11px] font-semibold tracking-wider text-white/55 uppercase">{s.k}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Categories */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading
          eyebrow="Choose your ride"
          title="Five motorcycle categories."
          subtitle="Compare capacity, availability and starting price. Tap More info for features, pricing and safety notes."
        />
        <Reveal className="mt-12">
          <ServiceTierCard tier={featured} index={0} variant="wide" />
        </Reveal>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {rest.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.06}>
              <ServiceTierCard tier={t} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Booking process */}
      <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
        <GlowOrbs />
        <SpeedLines className="absolute top-24 right-0 w-1/4 opacity-40 max-lg:hidden" />
        <div className="container-x">
          <SectionHeading dark eyebrow="How booking works" title="Nine simple steps, about two minutes." subtitle="Explore each step — this is exactly what you’ll see in the booking flow." />
          <div className="mt-12">
            <BookingFlow steps={rideFlowSteps('motorcycle')} dark />
          </div>
          <Reveal className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/booking?service=motorcycle" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Start booking</ButtonLink>
            <ButtonLink to="/track-booking" variant="glass" size="lg">Track a booking</ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Estimator */}
      <section id="estimator" className="container-x scroll-mt-24 py-16 sm:py-24">
        <SectionHeading eyebrow="Fare estimator" title="See your fare before you ride." subtitle="Pick a category, route and time of travel. Estimates use the same rules as the booking flow (demonstration rates)." />
        <div className="mt-10">
          <FareEstimator tiers={motorcycleTiers} showPassengers={false} />
        </div>
      </section>

      {/* Safety */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-[2rem]">
              <SmartImage src={img(images.motorcycle[0].src, 1000)} alt={images.motorcycle[0].alt} className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
            </div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="glass absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-lift sm:left-8">
              <span className="grid size-11 place-items-center rounded-xl bg-go-500 text-white"><HardHat className="size-5" aria-hidden /></span>
              <div>
                <p className="text-sm font-bold text-ink-900">Spare helmet on board</p>
                <p className="text-xs text-text-2">Every motorcycle category</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.45 }} className="glass absolute top-6 right-4 hidden items-center gap-2 rounded-2xl px-4 py-3 shadow-lift sm:flex">
              <Star className="size-4 fill-go-500 text-go-500" aria-hidden />
              <span className="text-sm font-bold text-ink-900">Rate every ride</span>
            </motion.div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="Ride safe" title="Safety on two wheels." subtitle="Simple, visible safety habits on every trip — no surprises." />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {safety.map(({ Icon: I, t, d }, i) => (
                <Reveal as="li" key={t} delay={i * 0.06} className="rounded-2xl border border-line p-5 transition hover:border-go-200 hover:shadow-soft">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><I className="size-5" aria-hidden /></span>
                  <p className="mt-3 font-bold text-ink-900">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-2">{d}</p>
                </Reveal>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-surface-2 px-4 py-3 text-xs text-text-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              Demonstration build: rider details shown are sample data. Partner document checks and emergency-service integration are not active yet.
            </p>
          </div>
        </div>
      </section>

      <ServiceFaq ids={['f2', 'f1', 'f16', 'f8', 'f15']} title="Motorcycle ride FAQs" />

      <ServiceCTA
        eyebrow="Ride in minutes"
        title={<>Your rider is <span className="text-gradient-go">minutes away.</span></>}
        body="Pick a category, set your route and get an itemised estimate before you confirm."
        image={images.motorcycle[5].src}
        imageAlt={images.motorcycle[5].alt}
        whatsappMessage="Hello DoorstepGo, I have a question about motorcycle rides."
        actions={<ButtonLink to="/booking?service=motorcycle" size="lg" iconLeft={<Timer className="size-5" aria-hidden />}>Book a motorcycle</ButtonLink>}
      />
    </>
  );
}
