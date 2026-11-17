import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Ban, Calculator, Camera, CalendarClock, CircleAlert, ClipboardCheck, Clock, Flame, Gauge, HandCoins, KeyRound,
  MapPin, Package, PackageSearch, Pill, Radar, ShieldAlert, ShoppingBasket, Skull, Store, Timer, UserRound, Wallet, Zap, Building2, PawPrint, Scale,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, ButtonLink, Icon, Reveal, SectionHeading, SmartImage, TiltCard } from '@/components/ui';
import { DeliveryEstimator } from '@/components/services/DeliveryEstimator';
import { GlowOrbs, RoutePath, SpeedLines } from '@/components/services/Motifs';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { StageTimeline } from '@/components/services/StageTimeline';
import { useHashScroll } from '@/components/services/useHashScroll';
import { pricing, sizeOptions } from '@/config/pricing';
import { images, img } from '@/data/images';
import { deliveryCategories } from '@/data/services';
import { usePageMeta } from '@/hooks';
import { cn, naira } from '@/utils';

const marketModes = [
  { id: 'paid', title: 'Goods already purchased', I: Wallet, body: 'You’ve paid the seller. Share the receipt or order details and the rider simply collects and delivers.', note: 'Best when you buy from a regular trader by transfer.' },
  { id: 'seller', title: 'Rider collects from seller', I: Store, body: 'Name the seller, stall and phone number. The rider meets them, confirms the goods and brings them to you.', note: 'Seller hands over; rider checks item count against your description.' },
  { id: 'purchase', title: 'Rider purchases specified items', I: ShoppingBasket, body: 'List exactly what to buy — quantities, sizes, budget limits. The rider shops and delivers with the receipt.', note: `Purchase assistance fee from ${naira(pricing.delivery.marketPurchaseAssistFee)} plus cost of goods.` },
  { id: 'assist', title: 'Assistance with market collection', I: HandCoins, body: 'Need help with a bigger or more complex pickup? A rider assists with locating sellers, loading and transport.', note: 'Great for bulk foodstuff or multiple stalls in one market.' },
];

const marketInputs = [
  { I: Store, k: 'Market name', v: 'e.g. Eke Awka, Ifite First or Second Market' },
  { I: UserRound, k: 'Seller details', v: 'Name, stall number, phone' },
  { I: MapPin, k: 'Collection location', v: 'Line, block or nearest landmark' },
  { I: PackageSearch, k: 'Goods description', v: 'Items, quantities, size & weight' },
];

const proof = [
  { I: ClipboardCheck, t: 'Recipient confirmation', d: 'The recipient confirms receipt by name on hand-over, recorded against your delivery reference.', demo: <div className="flex items-center gap-2 rounded-xl bg-ok-bg px-3 py-2 text-sm font-semibold text-ok"><ClipboardCheck className="size-4" aria-hidden /> Received by: A. Bello</div> },
  { I: Camera, t: 'Photo evidence', d: 'The rider snaps a photo of the package at drop-off, visible in your delivery details.', demo: <div className="relative overflow-hidden rounded-xl"><SmartImage src={img(images.delivery[2].src, 500)} alt="Sample proof-of-delivery photo of a parcel being handed over" className="aspect-[16/8]" /><span className="absolute top-2 left-2 rounded-md bg-ink-950/70 px-2 py-0.5 text-[10px] font-bold text-white">PHOTO · SAMPLE</span></div> },
  { I: KeyRound, t: 'Delivery code', d: 'Your recipient gets a 4-digit code. The rider only completes hand-over when it matches.', demo: <div className="flex gap-2" aria-label="Sample delivery code 4 8 2 7">{['4', '8', '2', '7'].map((d, i) => <span key={i} className="grid size-11 place-items-center rounded-xl bg-ink-950 font-display text-xl font-extrabold text-white">{d}</span>)}</div> },
];

const prohibited = [
  { I: Ban, t: 'Illegal items & drugs' },
  { I: ShieldAlert, t: 'Weapons & ammunition' },
  { I: Flame, t: 'Flammable & hazardous chemicals' },
  { I: Wallet, t: 'Cash & negotiable instruments' },
  { I: PawPrint, t: 'Live animals' },
  { I: Skull, t: 'Toxic or corrosive substances' },
  { I: Pill, t: 'Prescription drugs without documentation' },
  { I: Scale, t: `Items over ${sizeOptions[sizeOptions.length - 1].maxKg} kg or beyond size limits` },
];

export default function DeliveryServices() {
  usePageMeta('Delivery & Logistics', 'Market pickups, parcels, documents, groceries, business and merchant deliveries — collected and delivered to the doorstep with tracking and proof of delivery.');
  useHashScroll();
  const [mode, setMode] = useState(marketModes[0].id);
  const activeMode = marketModes.find((m) => m.id === mode)!;
  const u = pricing.delivery.urgency;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Delivery & Logistics' }]}
        eyebrow="Delivery & logistics"
        title={<>Stay where you are. <span className="text-gradient-go">We’ll go get it.</span></>}
        subtitle="Arrange collection and transport of your goods without ever visiting the collection point — from a single envelope to a full market run or daily business drops."
        image={images.delivery[0].src}
        imageAlt={images.delivery[0].alt}
        actions={
          <>
            <ButtonLink to="/delivery" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Schedule a delivery</ButtonLink>
            <ButtonLink to="/track-delivery" variant="glass" size="lg" iconLeft={<Radar className="size-5" aria-hidden />}>Track a delivery</ButtonLink>
          </>
        }
        aside={
          <div className="glass-dark relative hidden overflow-hidden rounded-3xl p-5 lg:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-white/50 uppercase">Delivery · sample</p>
                <p className="font-mono text-sm font-bold">DSG-DL-XXXX-XXXX</p>
              </div>
              <Badge tone="go" dot>In transit</Badge>
            </div>
            <RoutePath className="mt-4 h-28 w-full" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/5 p-3"><p className="text-white/50">From</p><p className="font-semibold">Eke Awka Market</p></div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-white/50">To</p><p className="font-semibold">Miracle Junction, Ifite</p></div>
            </div>
          </div>
        }
      />

      {/* Categories bento */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading
          eyebrow="Ten ways to deliver"
          title="Whatever needs moving, there’s a category for it."
          subtitle="Tap a category to start a delivery with it pre-selected."
          action={<ButtonLink to="/delivery" variant="ink" iconRight={<ArrowRight className="size-4" aria-hidden />}>Start a delivery</ButtonLink>}
        />
        <ul className="mt-12 grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryCategories.map((c, i) => (
            <Reveal as="li" key={c.id} delay={(i % 4) * 0.05} className={cn(c.highlight && 'sm:col-span-2 lg:row-span-2')}>
              <TiltCard max={4} className="h-full rounded-3xl">
                <Link
                  to={`/delivery?category=${c.id}`}
                  className={cn('group relative isolate flex h-full flex-col overflow-hidden rounded-3xl text-white', c.highlight ? 'min-h-80 lg:min-h-[28rem]' : 'min-h-60')}
                >
                  <SmartImage src={img(c.image, c.highlight ? 1100 : 600)} alt={c.imageAlt} className="absolute inset-0 -z-10" imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
                  <div aria-hidden className={cn('absolute inset-0 -z-10', c.highlight ? 'bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10' : 'bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/30')} />
                  <div className="flex items-start justify-between p-5">
                    <span className={cn('grid place-items-center rounded-2xl backdrop-blur-md transition group-hover:bg-go-500', c.highlight ? 'size-14 bg-go-500' : 'size-11 bg-white/15')}>
                      <Icon name={c.icon} className={c.highlight ? 'size-7' : 'size-5'} />
                    </span>
                    {c.highlight && <Badge tone="go">Popular</Badge>}
                  </div>
                  <div className="mt-auto p-5 pt-0">
                    <h3 className={cn('font-bold', c.highlight ? 'text-3xl' : 'text-lg')}>{c.name}</h3>
                    <p className={cn('mt-1 text-white/70', c.highlight ? 'max-w-md text-base' : 'text-sm')}>{c.highlight ? c.description : c.short}</p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                        <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">from {naira(c.fromPrice)}</span>
                        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Clock className="size-3" aria-hidden /> {c.eta}</span>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 transition group-hover:rotate-45 group-hover:border-go-400 group-hover:bg-go-500"><ArrowUpRight className="size-4" aria-hidden /></span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Pickup & speed options */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading align="center" eyebrow="Pickup & speed" title="When we collect. How fast we deliver." subtitle="Mix and match: collect now or at a scheduled slot, then choose the delivery speed that fits your budget." />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="grid gap-4">
              {[
                { I: Zap, t: 'Immediate pickup', d: 'A rider is assigned straight away and heads to your collection point.', tag: 'Now' },
                { I: CalendarClock, t: 'Scheduled pickup', d: 'Pick a date and time window — ideal for planned drops and recurring deliveries.', tag: u.scheduled.eta },
              ].map((p, i) => (
                <Reveal key={p.t} delay={i * 0.06} className="group relative overflow-hidden rounded-3xl border border-line bg-canvas p-6 transition hover:border-go-200 hover:shadow-soft">
                  <SpeedLines className="absolute top-6 right-0 w-1/3 opacity-0 transition group-hover:opacity-60" widths={[60, 90, 40]} />
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-sheen text-white"><p.I className="size-6" aria-hidden /></span>
                  <p className="mt-4 text-[11px] font-bold tracking-widest text-go-600 uppercase">Pickup option</p>
                  <h3 className="text-xl font-bold text-ink-900">{p.t}</h3>
                  <p className="mt-1 text-sm text-text-2">{p.d}</p>
                  <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-900 ring-1 ring-line">{p.tag}</span>
                </Reveal>
              ))}
            </div>
            <Reveal className="noise relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
              <GlowOrbs />
              <p className="flex items-center gap-2 text-sm font-bold text-go-300"><Gauge className="size-4" aria-hidden /> Delivery speed</p>
              <ul className="mt-6 space-y-5">
                {[
                  { k: 'express' as const, I: Zap, speed: 100, d: 'Dedicated rider, no other stops.' },
                  { k: 'same_day' as const, I: Timer, speed: 70, d: 'Book before 2 PM for delivery the same day.' },
                  { k: 'standard' as const, I: Package, speed: 50, d: 'Our best-value everyday option.' },
                  { k: 'scheduled' as const, I: CalendarClock, speed: 35, d: 'Collected and delivered at your chosen time.' },
                ].map(({ k, I, speed, d }, i) => (
                  <li key={k}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 font-bold"><I className="size-4 text-go-300" aria-hidden /> {u[k].label}</p>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold">ETA {u[k].eta}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-go-500" initial={{ width: 0 }} whileInView={{ width: `${speed}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} />
                    </div>
                    <p className="mt-1.5 text-xs text-white/55">{d} {u[k].multiplier !== 1 && <>· ×{u[k].multiplier} vs standard</>}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Market pickup feature */}
      <section id="market-pickup" className="noise relative isolate scroll-mt-24 overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
        <GlowOrbs />
        <div className="container-x">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="relative lg:sticky lg:top-28">
              <span className="eyebrow-dark"><ShoppingBasket className="size-3.5" aria-hidden /> Market pickup</span>
              <h2 className="mt-5 text-3xl leading-[1.08] font-extrabold text-balance sm:text-4xl lg:text-5xl">Skip the market. <span className="text-gradient-go">Keep the bargain.</span></h2>
              <p className="mt-4 max-w-lg text-white/70 sm:text-lg">Our riders go to the market for you — collecting goods you’ve paid for, meeting your trusted seller, or shopping from your list.</p>
              <div className="relative mt-8 grid grid-cols-5 grid-rows-2 gap-3">
                <SmartImage src={img(images.market[0].src, 800)} alt={images.market[0].alt} className="col-span-3 row-span-2 aspect-[4/5] rounded-2xl" />
                <SmartImage src={img(images.market[1].src, 500)} alt={images.market[1].alt} className="col-span-2 rounded-2xl" />
                <SmartImage src={img(images.market[2].src, 500)} alt={images.market[2].alt} className="col-span-2 rounded-2xl" />
                <span className="absolute -bottom-4 left-4 rounded-2xl bg-go-sheen px-4 py-2 text-sm font-bold shadow-glow-go">From {naira(deliveryCategories[0].fromPrice)} · {deliveryCategories[0].eta}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-dark rounded-3xl p-6">
                <h3 className="text-lg font-bold">What you tell us</h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {marketInputs.map(({ I, k, v }) => (
                    <div key={k} className="flex gap-3 rounded-2xl bg-white/5 p-3.5">
                      <I className="mt-0.5 size-5 shrink-0 text-go-300" aria-hidden />
                      <div><dt className="text-sm font-bold">{k}</dt><dd className="text-xs text-white/55">{v}</dd></div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="glass-dark rounded-3xl p-6">
                <h3 className="text-lg font-bold">Choose how the rider helps</h3>
                <div role="tablist" aria-label="Market pickup modes" className="mt-4 grid grid-cols-2 gap-2">
                  {marketModes.map((m) => (
                    <button key={m.id} type="button" role="tab" id={`mm-${m.id}`} aria-selected={mode === m.id} aria-controls="mm-panel" onClick={() => setMode(m.id)} className={cn('flex min-h-14 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition', mode === m.id ? 'bg-white text-ink-900 shadow-lift' : 'bg-white/5 text-white/75 hover:bg-white/10')}>
                      <m.I className={cn('size-5 shrink-0', mode === m.id ? 'text-go-500' : 'text-white/50')} aria-hidden /> {m.title}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={activeMode.id} id="mm-panel" role="tabpanel" aria-labelledby={`mm-${activeMode.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-5 rounded-2xl border border-white/10 p-5">
                    <p className="font-bold">{activeMode.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{activeMode.body}</p>
                    <p className="mt-3 text-xs font-semibold text-go-300">{activeMode.note}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div role="note" className="flex gap-3 rounded-2xl border border-go-500/40 bg-go-500/10 p-5">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-go-300" aria-hidden />
                <p className="text-sm leading-relaxed text-white/85">
                  <strong className="text-white">Please note:</strong> purchases and payments to sellers may require separate arrangements. Your delivery fee covers collection and transport only — the cost of goods is settled separately, and riders never pay sellers on your behalf without a confirmed arrangement.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink to="/delivery?category=market-pickup" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Book a market pickup</ButtonLink>
                <ButtonLink to="/faq" variant="glass" size="lg">Market pickup FAQs</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking teaser */}
      <section className="container-x py-16 sm:py-24">
        <div className="noise relative isolate overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white sm:p-10 lg:p-14">
          <GlowOrbs />
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow-dark"><Radar className="size-3.5" aria-hidden /> Tracking</span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Seven stages. Always in the loop.</h2>
              <p className="mt-3 max-w-xl text-white/65">Follow every delivery from booking to doorstep with your reference number. (Sample animation.)</p>
            </div>
            <ButtonLink to="/track-delivery" variant="white" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Track a delivery</ButtonLink>
          </div>
          <div className="mt-12"><StageTimeline /></div>
        </div>
      </section>

      {/* Proof of delivery */}
      <section className="container-x pb-16 sm:pb-24">
        <SectionHeading eyebrow="Proof of delivery" title="Hand-over you can verify." subtitle="Choose the proof that suits the package — or combine them for valuable items." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {proof.map(({ I, t, d, demo }, i) => (
            <Reveal key={t} delay={i * 0.06} className="card flex flex-col p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-go-50 text-go-600"><I className="size-5" aria-hidden /></span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{t}</h3>
              <p className="mt-1 mb-5 text-sm leading-relaxed text-text-2">{d}</p>
              <div className="mt-auto">{demo}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Size guide + prohibited */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading eyebrow="Package size guide" title="Which size is my package?" subtitle={`The first ${pricing.delivery.freeWeightKg} kg is included; heavier items add ${naira(pricing.delivery.perExtraKg)} per kg.`} />
            <ol className="mt-10 grid grid-cols-2 items-end gap-3 sm:grid-cols-5">
              {sizeOptions.map((s, i) => (
                <Reveal as="li" key={s.id} delay={i * 0.05} className="flex flex-col items-center rounded-2xl border border-line p-4 text-center">
                  <div className="flex h-24 items-end justify-center" aria-hidden>
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: 22 + i * 12, height: 18 + i * 17, transformOrigin: 'bottom' }}
                      className={cn('rounded-md', i === 0 ? 'bg-brand-200' : 'bg-gradient-to-t from-go-500 to-amber-glow', 'shadow-soft')}
                    />
                  </div>
                  <p className="mt-3 font-bold text-ink-900">{s.label}</p>
                  <p className="text-xs font-semibold text-go-700">up to {s.maxKg} kg</p>
                  <p className="mt-1 text-xs text-muted">{s.hint}</p>
                  <p className="mt-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-text-2">×{pricing.delivery.sizeMultiplier[s.id]} price</p>
                </Reveal>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading eyebrow="Prohibited items" title="What we can’t carry." />
            <Reveal delay={0.1} className="mt-8 rounded-3xl border border-crit/20 bg-crit-bg/50 p-5">
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {prohibited.map(({ I, t }) => (
                  <li key={t} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-ink-900 shadow-soft">
                    <I className="size-4 shrink-0 text-crit" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-text-2">Riders may decline packages that appear unsafe or don’t match their description.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Estimator */}
      <section id="estimator" className="container-x scroll-mt-24 py-16 sm:py-24">
        <SectionHeading eyebrow="Price estimator" title="Estimate your delivery fee." subtitle="Choose route, size, speed and extras for an itemised estimate (demonstration rates)." action={<span className="flex items-center gap-2 text-sm font-semibold text-text-2"><Calculator className="size-4 text-go-500" aria-hidden /> Updates as you go</span>} />
        <div className="mt-10"><DeliveryEstimator /></div>
      </section>

      {/* Business teaser */}
      <section className="container-x pb-4">
        <Reveal>
          <div className="relative grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft md:grid-cols-2">
            <div className="relative min-h-64">
              <SmartImage src={img(images.delivery[7].src, 1000)} alt={images.delivery[7].alt} className="absolute inset-0" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent to-white/0 md:to-white/10" />
            </div>
            <div className="p-8 sm:p-10">
              <span className="eyebrow"><Building2 className="size-3.5" aria-hidden /> Business & bulk</span>
              <h2 className="mt-4 text-3xl font-extrabold text-ink-900">Deliveries for merchants & businesses</h2>
              <ul className="mt-5 grid gap-2 text-sm text-text-2 sm:grid-cols-2">
                {['Bulk & multi-drop routes', 'Scheduled daily pickups', 'Multiple pickup locations', 'Monthly invoicing', 'Proof of delivery on every drop', 'Dedicated account support'].map((x) => (
                  <li key={x} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-go-500" aria-hidden /> {x}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink to="/customers/merchants" variant="ink" iconRight={<ArrowRight className="size-4" aria-hidden />}>For merchants</ButtonLink>
                <ButtonLink to="/request-quote?type=business" variant="outline">Request a business quote</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ServiceFaq ids={['f4', 'f5', 'f6', 'f17', 'f14']} title="Delivery FAQs" />

      <ServiceCTA
        eyebrow="Doorstep, delivered"
        title={<>Send it now. <span className="text-gradient-go">We’ll handle the rest.</span></>}
        body="Book a pickup in minutes — your recipient gets a delivery code and you can follow every stage."
        image={images.delivery[3].src}
        imageAlt={images.delivery[3].alt}
        whatsappMessage="Hello DoorstepGo, I need help with a delivery."
        actions={<ButtonLink to="/delivery" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />}>Schedule a delivery</ButtonLink>}
      />
    </>
  );
}
