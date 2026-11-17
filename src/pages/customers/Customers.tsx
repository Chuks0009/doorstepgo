import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BadgePercent, Building2, CalendarClock, CircleQuestionMark, ClipboardList, Crown, FileText, Gift, Headset, LayoutDashboard,
  Mail, MapPinned, Package, Phone, Receipt, Search, Store, Users,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink, ExternalButton, Reveal, SectionHeading, SmartImage, TiltCard, WhatsappGlyph } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { images, img } from '@/data/images';
import { site, whatsappLink } from '@/config/site';
import { loyalty, promoCodes } from '@/config/pricing';
import { cn, naira } from '@/utils';
import { CopyButton, DemoChip, Orbs, SpeedLines, useHashScroll } from '@/components/company/shared';

const audiences = [
  { title: 'Individual riders', body: 'Everyday rides, saved places, scheduled trips and rewards.', to: '/customers/riders', cta: 'Rider services', icon: Users, image: images.people[0], tone: 'from-go-600/90' },
  { title: 'Merchants', body: 'Bulk drops, scheduled pickups and multi-location deliveries.', to: '/customers/merchants', cta: 'Merchant services', icon: Store, image: images.people[1], tone: 'from-brand-700/90' },
  { title: 'Business customers', body: 'Corporate accounts, staff shuttles and monthly invoicing.', to: '/customers#business', cta: 'Business accounts', icon: Building2, image: images.shuttle[1], tone: 'from-ink-900/95' },
  { title: 'Customer support', body: 'WhatsApp, phone, email and a searchable help centre.', to: '/contact', cta: 'Get support', icon: Headset, image: images.people[2], tone: 'from-ink-950/95' },
];

const businessFeatures = [
  { title: 'Corporate accounts', body: 'One account, many staff — with spend controls and approvers.', icon: Building2 },
  { title: 'Staff shuttles', body: 'Fixed routes and pickup points for daily commutes.', icon: Users },
  { title: 'Scheduled logistics', body: 'Recurring branch transfers, documents and stock runs.', icon: CalendarClock },
  { title: 'Monthly invoicing', body: 'Consolidated statements with cost-centre breakdowns.', icon: Receipt },
  { title: 'Bulk booking', body: 'Upload many trips or drops at once from a spreadsheet.', icon: ClipboardList },
];

const tierPerks: Record<string, string[]> = {
  Go: ['Earn 1 pt per ₦100', 'Birthday surprise'],
  'Go+': ['Priority matching at peak', '5% off scheduled trips'],
  'Go Gold': ['Free cancellation window +10 min', 'Dedicated WhatsApp line'],
  'Go Platinum': ['Monthly free express delivery', 'Early access to new cities'],
};

function LoyaltyTiers() {
  const [points, setPoints] = useState(3200);
  const maxPts = loyalty.tiers[loyalty.tiers.length - 1].min * 1.15;
  const currentIdx = loyalty.tiers.reduce((acc, t, i) => (points >= t.min ? i : acc), 0);
  const next = loyalty.tiers[currentIdx + 1];
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-go-600"><Crown className="size-4" aria-hidden /> Loyalty tiers</p>
          <h3 className="mt-1 text-2xl font-bold text-ink-900">Every trip moves you up</h3>
          <p className="mt-1 text-sm text-text-2">1 point per {naira(1 / loyalty.pointsPerNaira)} spent · 1 point = {naira(loyalty.redeemRate)} off.</p>
        </div>
        <DemoChip>Try the slider</DemoChip>
      </div>

      <div className="mt-8">
        <label htmlFor="pts" className="flex items-baseline justify-between text-sm font-semibold text-text">
          <span>Your points (sample)</span>
          <span className="font-display text-2xl font-bold text-ink-900 tabular-nums">{points.toLocaleString('en-NG')}</span>
        </label>
        <div className="relative mt-4 h-3 rounded-full bg-surface-2">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-go-sheen" animate={{ width: `${Math.min(100, (points / maxPts) * 100)}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
          {loyalty.tiers.map((t) => (
            <span key={t.name} aria-hidden className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink-900 shadow" style={{ left: `${(t.min / maxPts) * 100}%` }} />
          ))}
        </div>
        <input id="pts" type="range" min={0} max={Math.round(maxPts)} step={100} value={points} onChange={(e) => setPoints(Number(e.target.value))} className="mt-3 w-full accent-go-500" aria-valuetext={`${points} points, ${loyalty.tiers[currentIdx].name} tier`} />
        <p className="mt-2 text-sm text-text-2" aria-live="polite">
          You’re on <strong className="text-ink-900">{loyalty.tiers[currentIdx].name}</strong>
          {next ? <> — {(next.min - points).toLocaleString('en-NG')} pts to {next.name}.</> : <> — the top tier. 🎉</>}
        </p>
      </div>

      <ol className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {loyalty.tiers.map((t, i) => {
          const on = i === currentIdx;
          return (
            <li key={t.name} className={cn('relative rounded-2xl border p-4 transition-all duration-500', on ? 'border-transparent bg-ink-950 text-white shadow-lift' : i < currentIdx ? 'border-line bg-surface-2' : 'border-dashed border-line-strong')}>
              <p className={cn('font-display font-bold', on ? 'text-go-300' : 'text-ink-900')}>{t.name}</p>
              <p className={cn('text-xs', on ? 'text-white/60' : 'text-muted')}>{t.min.toLocaleString('en-NG')}+ pts</p>
              <ul className={cn('mt-3 space-y-1 text-[13px]', on ? 'text-white/80' : 'text-text-2')}>
                {(tierPerks[t.name] ?? []).map((p) => <li key={p}>• {p}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted">Tier perks are illustrative and may change. Track real points in your <Link to="/dashboard/rewards" className="font-semibold text-brand-700 hover:underline">rewards dashboard</Link>.</p>
    </div>
  );
}

export default function CustomersPage() {
  usePageMeta('Customer services', `Services for individual riders, merchants and businesses — plus promotions, rewards and support from ${site.name}.`);
  useHashScroll();
  const activePromos = promoCodes.filter((p) => p.active);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Customers' }]}
        eyebrow="Customer services"
        title={<>Built for everyone who needs to <span className="text-gradient-go">get somewhere</span>.</>}
        subtitle="Whether you’re heading to work, shipping 200 orders a week or moving a whole team — there’s a DoorstepGo service shaped around you."
        actions={
          <>
            <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-4" />}>Book a ride</ButtonLink>
            <ButtonLink to="/delivery" size="lg" variant="glass">Schedule a delivery</ButtonLink>
          </>
        }
        aside={
          <nav aria-label="Customer types" className="glass-dark rounded-3xl p-3">
            {audiences.map((a, i) => (
              <Link key={a.title} to={a.to} className="group flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-white/10">
                <span className={cn('grid size-10 place-items-center rounded-xl', i === 0 ? 'bg-go-500' : 'bg-white/10 group-hover:bg-white/20')}><a.icon className="size-5" aria-hidden /></span>
                <span className="flex-1">
                  <span className="block font-semibold">{a.title}</span>
                  <span className="block text-xs text-white/55">{a.cta}</span>
                </span>
                <ArrowRight className="size-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden />
              </Link>
            ))}
          </nav>
        }
      />

      {/* ------------------------------------------- WHO WE SERVE (bento) */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Who we serve" title="Four ways to move with us" subtitle="Pick the lane that fits — every one of them shares the same upfront estimates, live status updates and human support." />
          <div className="mt-12 grid auto-rows-[260px] gap-4 md:grid-cols-6 lg:auto-rows-[300px]">
            {audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06} className={cn(i === 0 && 'md:col-span-4 md:row-span-2', i === 1 && 'md:col-span-2 md:row-span-2', i === 2 && 'md:col-span-3', i === 3 && 'md:col-span-3')}>
                <TiltCard max={5} className="h-full rounded-3xl">
                  <Link to={a.to} className="group relative flex h-full flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-lift sm:p-8">
                    <div className="absolute inset-0" aria-hidden>
                      <SmartImage src={img(a.image.src, i === 0 ? 1200 : 800)} alt="" className="size-full bg-ink-900" imgClassName="group-hover:scale-110 duration-[1.2s]" />
                    </div>
                    <div className={cn('absolute inset-0 bg-gradient-to-t via-ink-950/40 to-transparent', a.tone)} aria-hidden />
                    <div className="relative">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur transition-colors group-hover:bg-go-500"><a.icon className="size-6" aria-hidden /></span>
                      <h3 className={cn('mt-4 font-bold', i === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl')}>{a.title}</h3>
                      <p className="mt-2 max-w-md text-white/75">{a.body}</p>
                      <span className="mt-4 inline-flex items-center gap-2 font-semibold text-go-300">{a.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- BUSINESS */}
      <section id="business" className="noise relative isolate scroll-mt-20 overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
        <Orbs />
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading dark eyebrow="Business customers" title={<>Mobility & logistics on <span className="text-gradient-go">one invoice</span></>} subtitle="Move staff, documents and stock across the city with a business account built for finance teams and ops managers alike." />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {businessFeatures.map((f, i) => (
                <Reveal as="li" key={f.title} delay={i * 0.05} className={cn('glass-dark flex gap-3 rounded-2xl p-4', i === businessFeatures.length - 1 && 'sm:col-span-2')}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-go-500/15 text-go-300"><f.icon className="size-5" aria-hidden /></span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-white/60">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink to="/request-quote?type=business" size="lg" iconRight={<ArrowRight className="size-4" />}>Request a business quote</ButtonLink>
              <ExternalButton href={`mailto:${site.contact.businessEmail}`} size="lg" variant="glass" iconLeft={<Mail className="size-4" />}>{site.contact.businessEmail}</ExternalButton>
            </div>
          </div>

          {/* Invoice mock */}
          <Reveal delay={0.1} className="relative">
            <SpeedLines className="absolute -top-6 -left-10 w-40 opacity-70" align="left" />
            <TiltCard max={6} className="rounded-3xl">
              <div className="rounded-3xl bg-white p-6 text-text shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-muted uppercase">Monthly statement</p>
                    <p className="font-display text-xl font-bold text-ink-900">Acme Foods Ltd <span className="text-sm font-medium text-muted">(sample)</span></p>
                  </div>
                  <DemoChip />
                </div>
                <div className="mt-6 divide-y divide-line text-sm">
                  {[
                    ['Staff shuttle · Ifite ⇄ Agu-Awka', '22 trips', 264000],
                    ['Branch transfers · scheduled', '64 drops', 76800],
                    ['Express documents', '18 drops', 21600],
                    ['Market pickups · Eke Awka', '9 runs', 13500],
                  ].map(([label, qty, amt]) => (
                    <div key={label as string} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0"><span className="block truncate font-medium text-ink-900">{label}</span><span className="text-xs text-muted">{qty}</span></span>
                      <span className="font-semibold tabular-nums">{naira(amt as number)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-950 px-5 py-4 text-white">
                  <span className="text-sm text-white/70">Total (illustrative)</span>
                  <span className="font-display text-2xl font-bold tabular-nums">{naira(375900)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {['Finance', 'Operations', 'HR'].map((c, i) => (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 font-semibold text-text-2">
                      <span className={cn('size-2 rounded-full', ['bg-go-500', 'bg-brand-500', 'bg-ok'][i])} aria-hidden />{c}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------- PROMOTIONS */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Promotions & rewards" title="More moves, more rewards" subtitle="Current promo codes, referral rewards and loyalty tiers. Apply codes at checkout — discounts are shown before you confirm." />

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {activePromos.map((p, i) => (
              <Reveal key={p.code} delay={i * 0.06}>
                <article className={cn('relative flex h-full flex-col overflow-hidden rounded-3xl p-6 text-white shadow-lift', ['bg-go-sheen', 'bg-brand-sheen', 'bg-ink-900'][i % 3])}>
                  <BadgePercent className="absolute -top-4 -right-4 size-32 text-white/10" aria-hidden />
                  <p className="text-xs font-bold tracking-[0.18em] text-white/70 uppercase">Promo code</p>
                  <p className="mt-2 flex-1 font-display text-xl leading-snug font-bold">{p.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-white/40 bg-white/10 p-2 pl-4">
                    <code className="font-display text-lg font-bold tracking-widest">{p.code}</code>
                    <CopyButton value={p.code} dark />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <Reveal>
              <article className="noise relative flex h-full flex-col overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
                <Orbs />
                <span className="grid size-14 place-items-center rounded-2xl bg-go-sheen shadow-glow-go"><Gift className="size-7" aria-hidden /></span>
                <h3 className="mt-6 text-2xl font-bold">Give {naira(loyalty.referralReward)}, get {naira(loyalty.referralReward)}</h3>
                <p className="mt-2 text-white/70">Invite friends with your referral code. When they complete their first trip, you both get {naira(loyalty.referralReward)} in ride credit (demo programme).</p>
                <ol className="mt-6 space-y-3 text-sm">
                  {['Share your code from the dashboard', 'Friend books their first ride or delivery', 'Credit lands in both accounts'].map((s, i) => (
                    <li key={s} className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-go-300">{i + 1}</span>{s}</li>
                  ))}
                </ol>
                <div className="mt-auto flex flex-wrap gap-3 pt-8">
                  <ButtonLink to="/customers/riders#rewards" variant="white">See my referral code</ButtonLink>
                  <ButtonLink to="/register" variant="glass">Create an account</ButtonLink>
                </div>
              </article>
            </Reveal>
            <Reveal delay={0.08}><LoyaltyTiers /></Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- MANAGE BOOKINGS */}
      <section className="bg-white py-20 lg:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Manage your bookings" title="Everything in one place" action={<ButtonLink to="/dashboard" variant="ink" iconLeft={<LayoutDashboard className="size-4" />}>Open dashboard</ButtonLink>} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'My dashboard', body: 'Upcoming trips, deliveries, payments and receipts.', to: '/dashboard', icon: LayoutDashboard },
              { title: 'Track a booking', body: 'Follow a ride with your booking reference.', to: '/track-booking', icon: Search },
              { title: 'Track a delivery', body: 'See every stage from pickup to doorstep.', to: '/track-delivery', icon: Package },
              { title: 'Saved addresses', body: 'Home, work and favourite pickup points.', to: '/dashboard/addresses', icon: MapPinned },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <Link to={c.to} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-ink-950 hover:text-white hover:shadow-lift">
                  <span className="grid size-11 place-items-center rounded-xl bg-white text-ink-900 shadow-soft transition-colors group-hover:bg-go-500 group-hover:text-white"><c.icon className="size-5" aria-hidden /></span>
                  <h3 className="mt-5 font-semibold">{c.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-text-2 transition-colors group-hover:text-white/65">{c.body}</p>
                  <ArrowUpRight className="mt-5 size-5 text-brand-700 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-go-300" aria-hidden />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- SUPPORT */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-sheen p-8 text-white shadow-glow-brand sm:p-12">
            <SpeedLines className="absolute top-10 right-0 w-1/3 opacity-60" />
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <span className="eyebrow-dark">Customer support</span>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Stuck? Talk to a real person.</h2>
                <p className="mt-3 max-w-lg text-white/80">{site.supportNote}</p>
                <ul className="mt-5 space-y-1 text-sm text-white/80">
                  {site.hours.map((h) => <li key={h.days}><strong className="text-white">{h.days}</strong> · {h.time}</li>)}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappLink()} target="_blank" rel="noreferrer noopener" className="group flex items-center gap-3 rounded-2xl bg-white p-4 text-ink-900 transition hover:-translate-y-0.5 hover:shadow-lift sm:col-span-2">
                  <span className="grid size-12 place-items-center rounded-xl bg-[#25D366] text-white"><WhatsappGlyph className="size-6" /></span>
                  <span className="flex-1"><span className="block font-bold">Chat on WhatsApp</span><span className="text-sm text-text-2">{site.whatsapp.displayNumber}</span></span>
                  <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink-900" aria-hidden />
                </a>
                <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/20">
                  <Phone className="size-5" aria-hidden /><span><span className="block font-semibold">Call us</span><span className="text-sm text-white/70">{site.contact.phone}</span></span>
                </a>
                <Link to="/contact" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/20">
                  <FileText className="size-5" aria-hidden /><span><span className="block font-semibold">Contact form</span><span className="text-sm text-white/70">Reply by email</span></span>
                </Link>
                <Link to="/faq" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/20 sm:col-span-2">
                  <CircleQuestionMark className="size-5" aria-hidden /><span className="flex-1"><span className="block font-semibold">Browse FAQs</span><span className="text-sm text-white/70">Booking, payments, refunds & more</span></span><ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
