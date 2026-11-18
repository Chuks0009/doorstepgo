import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Backpack, Banknote, Bell, Bike, BookOpen, Bus, CalendarClock, CarTaxiFront, Church, Clock, CreditCard, Gift, GraduationCap,
  House, Landmark, MapPin, Navigation, Package, Phone, Repeat, Share2, ShieldCheck, ShoppingBasket, Smartphone, Star, Users, Wallet,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, ButtonLink, ExternalButton, Reveal, SectionHeading, Stars, TiltCard, Toggle, WhatsappGlyph } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { testimonials } from '@/data/content';
import { site } from '@/config/site';
import { loyalty, paymentMethods, promoCodes } from '@/config/pricing';
import { findTier } from '@/data/services';
import type { PaymentMethodKind } from '@/types';
import { cn, formatDate, naira } from '@/utils';
import { CopyButton, DemoChip, Orbs, SpeedLines, useHashScroll } from '@/components/company/shared';

const everyday = [
  { title: 'Motorcycle', body: 'Beat traffic on a bike', to: '/services/motorcycle', icon: Bike, color: 'bg-go-500' },
  { title: 'Tricycle', body: 'Covered keke trips', to: '/services/tricycle', icon: CarTaxiFront, color: 'bg-amber-500' },
  { title: 'Shuttle', body: 'Vans for groups & airports', to: '/services/shuttle', icon: Bus, color: 'bg-brand-500' },
  { title: 'Parcel delivery', body: 'Door-to-door same day', to: '/delivery', icon: Package, color: 'bg-ok' },
  { title: 'Market pickup', body: 'We fetch it from the stall', to: '/services/delivery', icon: ShoppingBasket, color: 'bg-ink-700' },
];

const saved = [
  { id: 'home', label: 'Lodge', address: 'Off Miracle Junction, Ifite-Awka', icon: House },
  { id: 'work', label: 'Faculty', address: 'UNIZIK Main Gate, Enugu–Onitsha Expressway', icon: GraduationCap },
  { id: 'market', label: 'Market', address: 'Eke Awka Market, Awka town', icon: ShoppingBasket },
  { id: 'church', label: 'Church', address: 'Sunday service, Ifite Road', icon: Church },
];
const recent = [
  { id: 'r1', label: 'Second Market', address: 'Ifite-Awka', when: 'Yesterday · 6:40 PM' },
  { id: 'r2', label: 'Regina Caeli Junction', address: 'Enugu–Onitsha Expressway, Awka', when: 'Mon · 11:15 AM' },
  { id: 'r3', label: 'Alex Ekwueme Square', address: 'Awka town', when: 'Sat · 8:05 PM' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const payIcon: Record<PaymentMethodKind, typeof CreditCard> = {
  card: CreditCard, bank_transfer: Landmark, ussd: Phone, mobile_money: Smartphone, wallet: Wallet, cash: Banknote,
};

/* ------------------------------------------------------------ hero phone */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[290px]">
      <div className="absolute -inset-10 rounded-full bg-go-500/20 blur-3xl" aria-hidden />
      <TiltCard max={10} className="rounded-[2.6rem]">
        <div className="relative rounded-[2.6rem] border border-white/15 bg-ink-900 p-2.5 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)]" aria-hidden>
          <div className="overflow-hidden rounded-[2.1rem] bg-canvas text-text">
            <div className="relative h-40 overflow-hidden bg-ink-800">
              <svg viewBox="0 0 280 160" className="absolute inset-0 size-full">
                <defs><pattern id="rgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#ffffff10" /></pattern></defs>
                <rect width="280" height="160" fill="url(#rgrid)" />
                <path d="M-10 120 L80 100 L140 130 L290 60" stroke="#ffffff22" strokeWidth="14" fill="none" />
                <path d="M40 150 C 80 90, 160 120, 220 40" stroke="#FF6A13" strokeWidth="4" strokeDasharray="8 8" fill="none" className="animate-dash" strokeLinecap="round" />
                <circle cx="40" cy="150" r="7" fill="#2F7BFF" stroke="#fff" strokeWidth="3" />
                <circle cx="220" cy="40" r="7" fill="#FF6A13" stroke="#fff" strokeWidth="3" />
              </svg>
              <motion.div className="absolute top-[78px] left-[118px] grid size-8 place-items-center rounded-full bg-white shadow-lift" animate={{ x: [0, 18, 36], y: [0, -10, -26] }} transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}>
                <Bike className="size-4 text-go-600" />
              </motion.div>
            </div>
            <div className="space-y-2.5 p-4">
              <p className="text-[11px] font-semibold text-muted">Good morning 👋</p>
              <p className="font-display text-base font-bold text-ink-900">Where to today?</p>
              {saved.slice(0, 2).map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-soft">
                  <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700"><s.icon className="size-3.5" /></span>
                  <span className="min-w-0"><span className="block text-xs font-bold text-ink-900">{s.label}</span><span className="block truncate text-[10px] text-muted">{s.address}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-go-sheen px-3 py-2.5 text-white">
                <span className="text-xs font-bold">Express bike · est. {naira(900)}</span>
                <ArrowRight className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
      <motion.div className="glass absolute top-10 -left-16 hidden items-center gap-2 rounded-2xl px-3 py-2 shadow-lift sm:flex" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} aria-hidden>
        <ShieldCheck className="size-4 text-ok" /><span className="text-xs font-bold text-ink-900">Trip shared with Mum</span>
      </motion.div>
      <motion.div className="glass absolute -right-12 bottom-16 hidden items-center gap-2 rounded-2xl px-3 py-2 shadow-lift sm:flex" animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden>
        <Gift className="size-4 text-go-500" /><span className="text-xs font-bold text-ink-900">+24 pts earned</span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------ saved places */
function PlacesDemo() {
  const [tab, setTab] = useState<'saved' | 'recent'>('saved');
  const [selected, setSelected] = useState<string>('home');
  const list = tab === 'saved' ? saved.map((s) => ({ ...s, when: undefined as string | undefined })) : recent.map((r) => ({ ...r, icon: Clock }));
  const current = list.find((l) => l.id === selected) ?? list[0];
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-lift sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div role="tablist" aria-label="Places" className="inline-flex rounded-xl bg-surface-2 p-1">
          {(['saved', 'recent'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setSelected(t === 'saved' ? 'home' : 'r1'); }} className={cn('relative min-h-10 rounded-lg px-4 text-sm font-semibold capitalize transition-colors', tab === t ? 'text-ink-900' : 'text-muted hover:text-text')}>
              {tab === t && <motion.span layoutId="places-tab" className="absolute inset-0 -z-0 rounded-lg bg-white shadow-soft" />}
              <span className="relative">{t === 'saved' ? 'Saved places' : 'Recent'}</span>
            </button>
          ))}
        </div>
        <DemoChip />
      </div>
      <ul role="listbox" aria-label={tab === 'saved' ? 'Saved places' : 'Recent locations'} className="mt-4 space-y-2">
        {list.map((l) => {
          const on = l.id === current.id;
          return (
            <li key={l.id}>
              <button role="option" aria-selected={on} onClick={() => setSelected(l.id)} className={cn('flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all', on ? 'border-go-300 bg-go-50/70' : 'border-transparent hover:bg-surface-2')}>
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition-colors', on ? 'bg-go-500 text-white' : 'bg-surface-2 text-ink-800')}><l.icon className="size-4" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink-900">{l.label}</span>
                  <span className="block truncate text-sm text-muted">{l.address}</span>
                </span>
                {l.when && <span className="hidden text-xs text-muted sm:block">{l.when}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-950 p-4 text-white">
        <p className="flex min-w-0 items-center gap-2 text-sm"><MapPin className="size-4 shrink-0 text-go-400" aria-hidden /><span className="truncate">From <strong>{current.label}</strong></span></p>
        <ButtonLink to="/booking" size="sm" iconRight={<ArrowRight className="size-3.5" />}>Book from here</ButtonLink>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ schedule */
function ScheduleDemo() {
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [time, setTime] = useState('07:30');
  const [ret, setRet] = useState(true);
  const summary = useMemo(() => {
    if (!picked.length) return 'Pick at least one day.';
    const order = days.filter((d) => picked.includes(d));
    const label = order.length === 5 && !order.includes('Sat') && !order.includes('Sun') ? 'every weekday' : order.length === 7 ? 'every day' : `every ${order.join(', ')}`;
    return `Pickup ${label} at ${time}${ret ? ', with a return trip at 5:30 PM' : ''}.`;
  }, [picked, time, ret]);
  return (
    <div className="glass-dark rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold"><Repeat className="size-4 text-go-300" aria-hidden /> Recurring trip</p>
        <DemoChip dark />
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm text-white/60">Repeat on</legend>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const on = picked.includes(d);
            return (
              <button key={d} type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d) : [...p, d]))} className={cn('min-h-11 rounded-xl text-xs font-bold transition-all sm:text-sm', on ? 'bg-go-500 text-white shadow-glow-go' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                {d}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="mt-5 block text-sm text-white/60" htmlFor="rec-time">Pickup time</label>
      <input id="rec-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-white [color-scheme:dark] focus:border-brand-400 focus:outline-none" />
      <div className="mt-3 rounded-xl bg-white px-3 text-ink-900">
        <Toggle checked={ret} onChange={setRet} label="Add return trip" description="Same route, evening pickup" />
      </div>
      <p className="mt-4 rounded-xl border border-white/10 bg-ink-950/60 p-3 text-sm text-white/80" aria-live="polite"><CalendarClock className="mr-1.5 inline size-4 text-go-300" aria-hidden />{summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink to="/booking" size="sm" variant="white">Schedule a real trip</ButtonLink>
        <button type="button" disabled={!picked.length} onClick={() => toast({ title: 'Schedule preview saved (demo)', body: summary, tone: 'info' })} className="min-h-9 rounded-xl px-3 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline disabled:opacity-40">
          Save preview
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ students at UNIZIK */
const STUDENT_PROMO = promoCodes.find((p) => p.code === 'UNIZIK10' && p.active);
const STUDENT_BOOKING = '/booking?service=tricycle&tier=tri-scheduled&pickupCity=awka&pickupJunction=miracle-jn&dropoffCity=awka&dropoffJunction=unizik-main-gate';

function StudentsBlock() {
  const keke = findTier('tri-standard');
  const perks = [
    { icon: Backpack, title: 'Lodge to lecture', body: 'Schedule a keke from your Ifite lodge to the Main Gate or Back Gate for 8 AM classes — set it once for every lecture day.' },
    { icon: ShoppingBasket, title: 'Market runs while you’re in class', body: 'Send a rider to Eke Awka or Ifite First Market and get your foodstuff dropped at your lodge.' },
    { icon: BookOpen, title: 'Exams, excursions & going home', body: 'Shared shuttles for departmental trips, and seats home to Onitsha, Nnewi or Enugu after exams (by quote).' },
  ];
  return (
    <section aria-labelledby="students-title" className="relative overflow-hidden bg-white py-20 lg:py-24">
      <SpeedLines className="absolute top-10 right-0 w-72 opacity-60 max-lg:hidden" />
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow={`Students at ${site.market.campusShort}`}
            title={<span id="students-title">Lodge to lecture, <span className="text-gradient-go">sorted.</span></span>}
            subtitle={`Most of our early riders are ${site.market.campusShort} students living around Ifite and Temp Site. Fares are student-friendly${keke ? ` — keke trips from ${naira(keke.minFare)} (estimate)` : ''}.`}
          />
          {STUDENT_PROMO && (
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-go-300 bg-go-50/60 p-4">
              <GraduationCap className="size-6 shrink-0 text-go-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-lg font-bold tracking-wider text-ink-900">{STUDENT_PROMO.code}</p>
                <p className="text-sm text-text-2">{STUDENT_PROMO.description}</p>
              </div>
              <CopyButton value={STUDENT_PROMO.code} label="Copy code" />
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={STUDENT_BOOKING} iconRight={<ArrowRight className="size-4" />}>Schedule a lecture-day keke</ButtonLink>
            <ButtonLink to="/register" variant="outline">Create free account</ButtonLink>
          </div>
        </div>
        <ul className="grid gap-3">
          {perks.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.06} className="flex gap-4 rounded-3xl border border-line bg-canvas p-5 shadow-soft">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-go-300"><p.icon className="size-5" aria-hidden /></span>
              <div>
                <p className="font-display font-bold text-ink-900">{p.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-2">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ page */
export default function RidersPage() {
  usePageMeta('Individual riders', `Everyday rides and deliveries with saved places, scheduled trips, trip sharing, rewards and flexible payments on ${site.name}.`);
  useHashScroll();
  const { user } = useAuth();
  const referralCode = user?.referralCode ?? 'GO-AMAKA24';
  const [shareOn, setShareOn] = useState(true);
  const toast = useToast();
  const referralMsg = `Ride and send packages with ${site.name}! Use my code ${referralCode} on your first booking and we both get ${naira(loyalty.referralReward)} credit.`;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Customers', to: '/customers' }, { label: 'Individual riders' }]}
        eyebrow="For individual riders"
        title={<>Awka, <span className="text-gradient-go">on demand</span>.</>}
        subtitle="Book bikes, kekes and shuttles from your lodge or doorstep in Ifite, Temp Site or anywhere in Awka, send parcels across town and earn rewards on every move."
        actions={
          <>
            <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-4" />}>Book a ride</ButtonLink>
            <ButtonLink to="/register" size="lg" variant="glass">Create free account</ButtonLink>
          </>
        }
        aside={<div className="py-6 lg:py-0"><PhoneMock /></div>}
      />

      {/* ----------------------------------- everyday */}
      <section className="relative -mt-px bg-ink-950 pb-16">
        <div className="container-x">
          <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
            {everyday.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.05} className="w-56 shrink-0 snap-start sm:w-auto">
                <Link to={e.to} className="group glass-dark flex h-full flex-col rounded-2xl p-5 text-white transition hover:-translate-y-1 hover:bg-white/10">
                  <span className={cn('grid size-11 place-items-center rounded-xl text-white transition-transform duration-500 group-hover:-rotate-6', e.color)}><e.icon className="size-5" aria-hidden /></span>
                  <span className="mt-4 font-semibold">{e.title}</span>
                  <span className="text-sm text-white/55">{e.body}</span>
                  <ArrowRight className="mt-3 size-4 text-go-300 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------- saved / recent */}
      <section className="py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Saved places & recent locations" title="Two taps from your front door" subtitle="Save your lodge, faculty, market and church — the places you go every week. Recent pickups and drop-offs appear automatically, so rebooking takes seconds." />
            <ul className="mt-8 space-y-3 text-text-2">
              {['Name your places — “My lodge”, “Shop”, “Back gate”', 'Add landmarks so riders find you first time', 'Manage everything from your dashboard'].map((t) => (
                <li key={t} className="flex items-start gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-go-500" aria-hidden />{t}</li>
              ))}
            </ul>
            <ButtonLink to="/dashboard/addresses" variant="outline" className="mt-8" iconRight={<ArrowRight className="size-4" />}>Manage saved places</ButtonLink>
          </div>
          <Reveal><PlacesDemo /></Reveal>
        </div>
      </section>

      {/* ----------------------------------- students at UNIZIK */}
      <StudentsBlock />

      {/* ----------------------------------- scheduled + safety (ink) */}
      <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
        <Orbs />
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading dark eyebrow="Scheduled & recurring trips" title="Set it once. Ride every week." subtitle="Lecture-day kekes, office commutes and weekly market trips — book days ahead or repeat on a schedule." />
              <Reveal delay={0.1} className="mt-10"><ScheduleDemo /></Reveal>
            </div>
            <div id="safety" className="scroll-mt-20">
              <SectionHeading dark eyebrow="Trip sharing & safety" title="Peace of mind, built in" subtitle="Safety tools are designed into every journey. These are interface previews — rider identity checks are not yet live in this demo." />
              <Reveal delay={0.1} className="mt-10 space-y-3">
                <div className="glass-dark rounded-3xl p-5">
                  <div className="flex items-center gap-3">
                    <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-ok/20 text-emerald-300"><Share2 className="size-5" aria-hidden /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Share my trip</p>
                      <p className="text-sm text-white/60">Send live status to trusted contacts</p>
                    </div>
                    <button type="button" role="switch" aria-checked={shareOn} aria-label="Share my trip automatically" onClick={() => { setShareOn(!shareOn); toast({ title: shareOn ? 'Auto-share turned off (demo)' : 'Auto-share turned on (demo)', tone: 'info' }); }} className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', shareOn ? 'bg-ok' : 'bg-white/20')}>
                      <motion.span layout className={cn('absolute top-1 size-5 rounded-full bg-white shadow', shareOn ? 'right-1' : 'left-1')} />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {shareOn && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 flex flex-wrap gap-2">
                          {['Mum', 'Ada (sister)', 'Office'].map((c) => <span key={c} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{c}</span>)}
                          <span className="rounded-full border border-dashed border-white/30 px-3 py-1 text-xs text-white/60">+ Add contact</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Users, title: 'Rider details on screen', body: 'Name, photo, plate & vehicle before pickup.' },
                    { icon: ShieldCheck, title: 'Passenger helmets', body: 'Bike riders are asked to carry a spare.' },
                    { icon: Bell, title: 'Status alerts', body: 'Assigned, arriving, started, completed.' },
                    { icon: Phone, title: 'In-app support line', body: `${site.contact.phone} during hours.` },
                  ].map((f) => (
                    <li key={f.title} className="glass-dark flex gap-3 rounded-2xl p-4">
                      <f.icon className="mt-0.5 size-5 shrink-0 text-go-300" aria-hidden />
                      <div><p className="text-sm font-semibold">{f.title}</p><p className="text-[13px] text-white/55">{f.body}</p></div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-white/45">The safety line is a placeholder and is not connected to emergency services. In an emergency, contact local emergency services directly.</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------- rewards */}
      <section id="rewards" className="scroll-mt-20 py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Loyalty & referrals" title="Ride more, pay less" subtitle={`Earn 1 point for every ${naira(1 / loyalty.pointsPerNaira)} you spend and redeem against future trips. Invite friends and you both get ${naira(loyalty.referralReward)}.`} />
          <div className="mt-12 grid gap-5 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <TiltCard max={4} className="h-full rounded-[2rem]">
                <div className="relative h-full overflow-hidden rounded-[2rem] bg-go-sheen p-7 text-white shadow-glow-go sm:p-10">
                  <SpeedLines className="absolute top-8 right-0 w-1/3" count={3} />
                  <svg aria-hidden viewBox="0 0 200 200" className="absolute -bottom-16 -left-10 size-64 text-white/10"><circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="24" /></svg>
                  <div className="relative">
                    <p className="flex items-center gap-2 text-sm font-bold text-white/85"><Gift className="size-4" aria-hidden /> Your referral code {!user && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">sample</span>}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <code className="rounded-2xl border-2 border-dashed border-white/60 bg-white/10 px-5 py-3 font-display text-3xl font-extrabold tracking-[0.12em] sm:text-4xl">{referralCode}</code>
                      <CopyButton value={referralCode} label="Copy code" dark className="bg-ink-950/30 hover:bg-ink-950/50" />
                    </div>
                    <p className="mt-6 max-w-md text-white/85">Share it with friends. When they complete their first ride or delivery, {naira(loyalty.referralReward)} lands in both your accounts.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <ExternalButton href={`https://wa.me/?text=${encodeURIComponent(referralMsg)}`} target="_blank" rel="noreferrer noopener" variant="white" iconLeft={<WhatsappGlyph className="size-4" />}>Share on WhatsApp</ExternalButton>
                      {!user && <ButtonLink to="/register" variant="glass">Get your own code</ButtonLink>}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-2">
              <div className="flex h-full flex-col rounded-[2rem] border border-line bg-white p-7 shadow-soft">
                <p className="text-sm font-bold text-ink-900">Loyalty tiers</p>
                <ol className="mt-4 flex-1 space-y-2">
                  {loyalty.tiers.map((t, i) => (
                    <li key={t.name} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                      <span className={cn('grid size-9 place-items-center rounded-xl font-display text-sm font-bold text-white', ['bg-ink-700', 'bg-brand-500', 'bg-amber-500', 'bg-go-sheen'][i])}>{i + 1}</span>
                      <span className="flex-1 font-semibold text-ink-900">{t.name}</span>
                      <span className="text-sm text-muted tabular-nums">{t.min.toLocaleString('en-NG')}+ pts</span>
                    </li>
                  ))}
                </ol>
                <ButtonLink to={user ? '/dashboard/rewards' : '/login'} variant="soft" className="mt-5" iconRight={<ArrowRight className="size-4" />}>{user ? 'View my rewards' : 'Sign in to see points'}</ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------- payments */}
      <section className="bg-white py-20 lg:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Payment options" title="Pay the way you already do" subtitle="Choose at checkout. Payments in this demonstration build are simulated — no money is charged." />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.filter((p) => p.enabled).map((p, i) => {
              const I = payIcon[p.id] ?? CreditCard;
              return (
                <Reveal as="li" key={p.id} delay={i * 0.04} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-brand-300 hover:shadow-soft">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-ink-800 transition-colors group-hover:bg-brand-sheen group-hover:text-white"><I className="size-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold text-ink-900">{p.label}{p.badge && <Badge tone={p.badge === 'Coming soon' ? 'neutral' : 'ok'}>{p.badge}</Badge>}</span>
                    <span className="block text-sm text-text-2">{p.description}</span>
                  </span>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ----------------------------------- reviews */}
      <section className="overflow-hidden py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Reviews" title="What riders tell us" action={<DemoChip>Sample reviews — demonstration content</DemoChip>} />
        </div>
        <div className="group relative mt-12 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-4">
            {[...testimonials, ...testimonials].map((t, i) => (
              <figure key={`${t.id}-${i}`} aria-hidden={i >= testimonials.length || undefined} className={cn('flex w-[320px] shrink-0 flex-col rounded-3xl border border-line bg-white p-6 shadow-soft sm:w-[380px]', i >= testimonials.length && 'motion-reduce:hidden')}>
                <div className="flex items-center justify-between">
                  <Stars value={t.rating} />
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-text-2">{t.service}</span>
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-text">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img src={t.avatar} alt="" className="size-10 rounded-full bg-go-100" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{t.name}</span>
                    <span className="block text-xs text-muted">{t.location} · {formatDate(t.date)}</span>
                  </span>
                  <Star className="size-4 fill-go-500 text-go-500" aria-hidden />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <p className="container-x mt-6 text-xs text-muted">Reviews shown are fictional demonstration content, not real customer feedback.</p>
      </section>

      {/* ----------------------------------- CTA */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <div className="noise relative isolate overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-14 text-center text-white sm:px-12">
            <Orbs />
            <Navigation className="mx-auto size-10 text-go-400" aria-hidden />
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold sm:text-5xl">Your next trip is <span className="text-gradient-go">one tap</span> away.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">Create a free account to save places, track trips and start earning points.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/register" size="lg" iconRight={<ArrowRight className="size-4" />}>Create free account</ButtonLink>
              <ButtonLink to="/booking" size="lg" variant="glass">Book a ride</ButtonLink>
              <ButtonLink to="/delivery" size="lg" variant="glass" iconLeft={<Package className="size-4" />}>Send a parcel</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
