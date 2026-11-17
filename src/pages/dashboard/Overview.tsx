import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Bike, Briefcase, CalendarClock, ChevronRight, Coins, FileText, Headset, House, MapPin, Package, Plus,
  Radar, ShoppingBasket, Sparkles, Star, Store, TicketPercent, TrendingUp, Wallet,
} from 'lucide-react';
import { Avatar, ButtonLink, DemoNotice, EmptyState, ExternalButton, Icon, StatusBadge, WhatsappGlyph } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { ActiveTripCard } from '@/components/dashboard/ActiveTripCard';
import { BarChart } from '@/components/dashboard/charts';
import { CopyButton, KindIcon, Panel, StatTile, categoryName, deliveryBucket, loyaltyStatus, notifMeta, rideBucket, tierName, whenKey } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks';
import { useBookings, useDeliveries, useNotifications, usePayments } from '@/hooks/useData';
import { junctionLabel } from '@/config/locations';
import { promoCodes } from '@/config/pricing';
import { site, whatsappLink } from '@/config/site';
import { findDeliveryCategory, findTier } from '@/data/services';
import { cn, formatDate, formatTime, naira, timeAgo } from '@/utils';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const quickActions = [
  { to: '/booking', label: 'Book a ride', sub: 'Moto, keke or shuttle', icon: Bike, tone: 'bg-go-sheen text-white shadow-glow-go' },
  { to: '/delivery', label: 'Send a package', sub: 'Door-to-door delivery', icon: Package, tone: 'bg-brand-sheen text-white shadow-glow-brand' },
  { to: '/delivery?category=market-pickup', label: 'Market pickup', sub: 'We shop & collect', icon: ShoppingBasket, tone: 'bg-amber-50 text-amber-700' },
  { to: '/request-quote', label: 'Request a quote', sub: 'Groups & business', icon: FileText, tone: 'bg-surface-2 text-ink-800' },
  { to: '/track-booking', label: 'Track a trip', sub: 'Enter a reference', icon: Radar, tone: 'bg-ink-900 text-white' },
];

const placeIcon = { home: House, work: Briefcase, star: Star, store: Store };

export default function OverviewPage() {
  usePageMeta('Dashboard');
  const { user } = useAuth();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const notifications = useNotifications();
  const payments = usePayments();

  const data = useMemo(() => {
    const activeRides = bookings.filter((b) => rideBucket(b.status) === 'active');
    const activeDeliveries = deliveries.filter((d) => deliveryBucket(d) === 'active');
    const upcoming = [
      ...bookings.filter((b) => rideBucket(b.status) === 'upcoming').map((b) => ({ kind: 'ride' as const, key: whenKey(b), item: b })),
      ...deliveries.filter((d) => deliveryBucket(d) === 'upcoming').map((d) => ({ kind: 'delivery' as const, key: whenKey(d), item: d })),
    ].sort((a, b) => a.key.localeCompare(b.key));
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const tripsMonth = bookings.filter((b) => b.date.startsWith(monthKey) && b.status !== 'cancelled').length;
    const deliveriesDone = deliveries.filter((d) => d.status === 'completed').length;
    const paid = payments.filter((p) => p.status === 'paid_demo' || p.status === 'pending');
    const spend = paid.reduce((s, p) => s + p.amount, 0);

    // Weekly spend for the last 8 weeks
    const weekMs = 7 * 864e5;
    const start = new Date(now);
    start.setHours(23, 59, 59, 999);
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const end = start.getTime() - (7 - i) * weekMs;
      const from = end - weekMs;
      const value = paid.filter((p) => { const t = new Date(p.createdAt).getTime(); return t > from && t <= end; }).reduce((s, p) => s + p.amount, 0);
      const label = i === 7 ? 'This wk' : formatDate(new Date(from + 864e5).toISOString(), { day: 'numeric', month: 'short' });
      return { key: `w${i}`, label, value, detail: `Week of ${formatDate(new Date(from + 864e5).toISOString(), { day: 'numeric', month: 'short' })}` };
    });
    const thisWeek = weeks[7].value;
    return { activeRides, activeDeliveries, upcoming, tripsMonth, deliveriesDone, spend, weeks, thisWeek, paidCount: paid.length };
  }, [bookings, deliveries, payments]);

  if (!user) return null;
  const first = user.name.split(' ')[0];
  const loyal = loyaltyStatus(user.loyaltyPoints);
  const promo = promoCodes.find((p) => p.active && p.code === 'DOORSTEP200') ?? promoCodes.find((p) => p.active);
  const unread = notifications.filter((n) => !n.read).length;
  const actives = [
    ...data.activeRides.map((b) => ({ id: b.id, node: <ActiveTripCard ride={b} /> })),
    ...data.activeDeliveries.map((d) => ({ id: d.id, node: <ActiveTripCard delivery={d} /> })),
  ];

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow={<><Sparkles className="size-3.5" aria-hidden /> {formatDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}</>}
        title={<>{greeting()}, {first}</>}
        subtitle={
          actives.length
            ? `You have ${actives.length} trip${actives.length > 1 ? 's' : ''} in motion and ${data.upcoming.length} coming up.`
            : data.upcoming.length
              ? `Nothing on the move right now — ${data.upcoming.length} booking${data.upcoming.length > 1 ? 's' : ''} coming up.`
              : 'Where are we going today?'
        }
        actions={
          <>
            <ButtonLink to="/delivery" variant="outline" iconLeft={<Package className="size-4" />}>Send package</ButtonLink>
            <ButtonLink to="/booking" iconLeft={<Plus className="size-4" />}>Book a ride</ButtonLink>
          </>
        }
      />

      {/* Quick actions */}
      <nav aria-label="Quick actions" className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-5">
        {quickActions.map((a, i) => (
          <motion.div key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.4 }} className="w-[44%] shrink-0 snap-start sm:w-auto">
            <Link to={a.to} className="card group flex h-full flex-col gap-3 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className={cn('grid size-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6', a.tone)}><a.icon className="size-5" aria-hidden /></span>
              <span>
                <span className="flex items-center gap-1 font-semibold text-ink-900">{a.label}<ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden /></span>
                <span className="block text-[13px] text-muted">{a.sub}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 xl:col-span-2">
          {actives.length > 0 ? (
            <div className="space-y-4">
              {actives.slice(0, 2).map((a) => <div key={a.id}>{a.node}</div>)}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-ink-radial p-7 text-white">
              <div aria-hidden className="absolute -top-20 -right-10 size-64 rounded-full bg-go-500/25 blur-[90px]" />
              <p className="eyebrow-dark">Nothing in motion</p>
              <h2 className="mt-3 text-2xl font-bold">Ready when you are.</h2>
              <p className="mt-1 max-w-md text-white/65">Book a ride or send a package — live status, rider details and ETA will show up right here.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink to="/booking">Book a ride</ButtonLink>
                <ButtonLink to="/delivery" variant="glass">Send a package</ButtonLink>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Trips this month" value={data.tripsMonth} sub={`${bookings.length} rides all time`} icon={<Bike />} accent="go" />
            <StatTile label="Deliveries done" value={data.deliveriesDone} sub={`${deliveries.length} booked all time`} icon={<Package />} accent="brand" />
            <StatTile label="Total spend" value={naira(data.spend)} sub={`${data.paidCount} payments · demo`} icon={<Wallet />} accent="ink" />
            <StatTile label="Loyalty points" value={user.loyaltyPoints.toLocaleString()} sub={`${loyal.current.name} member`} icon={<Coins />} accent="ok" />
          </div>

          {/* Spend chart */}
          <Panel
            title="Spending"
            subtitle="Weekly total of simulated payments, last 8 weeks"
            icon={<TrendingUp />}
            action={<Link to="/dashboard/payments" className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Payments <ChevronRight className="size-4" aria-hidden /></Link>}
          >
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
              <p className="font-display text-3xl font-extrabold text-ink-900 tabular-nums">{naira(data.thisWeek)}</p>
              <p className="text-sm text-muted">spent this week</p>
            </div>
            <BarChart data={data.weeks} title="Weekly spend, last 8 weeks" />
          </Panel>

          {/* Upcoming */}
          <Panel
            title="Upcoming"
            subtitle="Scheduled rides and deliveries"
            icon={<CalendarClock />}
            action={<Link to="/dashboard/bookings" className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">All bookings <ChevronRight className="size-4" aria-hidden /></Link>}
            bodyClassName="px-2 pb-2 sm:px-3 sm:pb-3"
          >
            {data.upcoming.length === 0 ? (
              <div className="p-3"><EmptyState icon="CalendarClock" title="Nothing scheduled" body="Plan ahead — schedule a ride or delivery up to 14 days in advance." action={<ButtonLink to="/booking" size="sm">Schedule a ride</ButtonLink>} /></div>
            ) : (
              <ul className="divide-y divide-line">
                {data.upcoming.slice(0, 4).map(({ kind, item }) => {
                  const href = kind === 'ride' ? `/dashboard/bookings/${item.id}` : `/dashboard/deliveries/${item.id}`;
                  const days = Math.round((new Date(item.date + 'T12:00:00').getTime() - new Date(new Date().toISOString().slice(0, 10) + 'T12:00:00').getTime()) / 864e5);
                  return (
                    <li key={item.id}>
                      <Link to={href} className="group flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-surface-2/70">
                        <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-surface-2 py-1.5 text-center">
                          <span className="text-[11px] font-bold text-go-600 uppercase">{formatDate(item.date, { month: 'short' })}</span>
                          <span className="font-display text-xl leading-none font-extrabold text-ink-900">{formatDate(item.date, { day: 'numeric' })}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 truncate font-semibold text-ink-900">
                            {kind === 'ride' ? tierName((item as typeof bookings[number]).tierId) : categoryName((item as typeof deliveries[number]).categoryId)}
                            <span className="hidden text-xs font-medium text-muted sm:inline">{days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}</span>
                          </p>
                          <p className="truncate text-[13px] text-text-2">{formatTime(item.time)} · {junctionLabel(item.pickup.cityId, item.pickup.junctionId)} → {junctionLabel(item.dropoff.cityId, item.dropoff.junctionId)}</p>
                        </div>
                        <div className="hidden flex-col items-end gap-1 sm:flex">
                          <StatusBadge status={item.status} />
                          {item.paymentStatus === 'unpaid' && <span className="text-xs font-semibold text-warn">Payment due</span>}
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink-900" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Favourite services */}
          <Panel title="Favourite services" subtitle="One tap to book what you use most" icon={<Star />} action={<Link to="/dashboard/profile#favourites" className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Manage</Link>}>
            {user.favouriteServices.length === 0 ? (
              <EmptyState icon="Heart" title="No favourites yet" body="Add favourites from your profile to book them in one tap." action={<ButtonLink to="/dashboard/profile#favourites" size="sm" variant="outline">Choose favourites</ButtonLink>} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {user.favouriteServices.map((id) => {
                  const tier = findTier(id);
                  const cat = findDeliveryCategory(id);
                  if (!tier && !cat) return null;
                  const href = tier ? `/booking?service=${tier.kind}&tier=${tier.id}` : `/delivery?category=${cat!.id}`;
                  return (
                    <Link key={id} to={href} className="group relative overflow-hidden rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-go-200 hover:shadow-soft">
                      <div className="flex items-center gap-3">
                        {tier ? <KindIcon kind={tier.kind} size="sm" /> : <span className="grid size-8 place-items-center rounded-xl bg-ink-900 text-white"><Icon name={cat!.icon} className="size-4" /></span>}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">{tier?.name ?? cat!.name}</p>
                          <p className="text-xs text-muted">{tier ? `ETA ${tier.eta}` : `From ${naira(cat!.fromPrice)}`}</p>
                        </div>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-go-600">Book now <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden /></span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile */}
          <section className="card overflow-hidden">
            <div className="relative h-20 bg-brand-sheen">
              <div aria-hidden className="absolute inset-0 opacity-40 grid-lines" />
              <div aria-hidden className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                {[48, 72, 32].map((w, i) => <span key={i} className="h-1 rounded-full bg-gradient-to-l from-go-400 to-transparent" style={{ width: w }} />)}
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="-mt-9 flex items-end justify-between gap-3">
                <Avatar src={user.avatar} name={user.name} size={72} className="ring-4 ring-white" />
                <Link to="/dashboard/profile" className="mb-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">Edit profile</Link>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-ink-900">{user.name}</p>
              <p className="text-sm text-muted">{user.email} · Member since {formatDate(user.memberSince, { month: 'short', year: 'numeric' })}</p>
              <div className="mt-4 rounded-2xl bg-surface-2/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-900">{loyal.current.name}</span>
                  <span className="text-muted">{loyal.next ? `${loyal.toNext.toLocaleString()} pts to ${loyal.next.name}` : 'Top tier'}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.round(loyal.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next loyalty tier">
                  <motion.div className="h-full rounded-full bg-go-sheen" initial={{ width: 0 }} animate={{ width: `${loyal.progress * 100}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] text-text-2">Referral <span className="font-mono font-semibold text-ink-900">{user.referralCode}</span></span>
                  <CopyButton value={user.referralCode} />
                </div>
              </div>
            </div>
          </section>

          {/* Recent activity */}
          <Panel title="Recent activity" subtitle={unread ? `${unread} unread` : 'All caught up'} action={<Link to="/dashboard/notifications" className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">View all</Link>} bodyClassName="px-3 pb-3 sm:px-3 sm:pb-3">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">No activity yet.</p>
            ) : (
              <ol className="relative">
                {notifications.slice(0, 5).map((n) => {
                  const m = notifMeta[n.type] ?? notifMeta.system;
                  return (
                    <li key={n.id}>
                      <Link to={n.link ?? '/dashboard/notifications'} className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2/70">
                        <span className={cn('relative grid size-9 shrink-0 place-items-center rounded-xl', m.tone)}>
                          <m.icon className="size-4" aria-hidden />
                          {!n.read && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-go-500 ring-2 ring-white" aria-label="Unread" />}
                        </span>
                        <div className="min-w-0">
                          <p className={cn('truncate text-sm', n.read ? 'font-medium text-text' : 'font-semibold text-ink-900')}>{n.title}</p>
                          <p className="text-xs text-muted">{timeAgo(n.createdAt)}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>

          {/* Saved places */}
          <Panel title="Saved places" icon={<MapPin />} action={<Link to="/dashboard/addresses" className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Manage</Link>} bodyClassName="px-3 pb-3 sm:px-3 sm:pb-3">
            {user.savedAddresses.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">No saved places yet. <Link to="/dashboard/addresses" className="font-semibold text-brand-700">Add one</Link></p>
            ) : (
              <ul>
                {user.savedAddresses.slice(0, 4).map((a) => {
                  const I = placeIcon[a.icon ?? 'star'] ?? MapPin;
                  const q = new URLSearchParams({ pickupCity: a.cityId, pickupJunction: a.junctionId, pickupAddress: a.address, ...(a.areaId ? { pickupArea: a.areaId } : {}) });
                  return (
                    <li key={a.id}>
                      <Link to={`/booking?${q}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2/70" aria-label={`Book a ride from ${a.label}`}>
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><I className="size-4" aria-hidden /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                          <p className="truncate text-xs text-muted">{a.address}</p>
                        </div>
                        <span className="text-xs font-semibold text-go-600 opacity-0 transition group-hover:opacity-100">Ride from here</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Promo */}
          {promo && (
            <div className="relative overflow-hidden rounded-3xl bg-go-sheen p-6 text-white shadow-glow-go">
              <div aria-hidden className="absolute -right-6 -bottom-8 size-40 rounded-full bg-white/15 blur-2xl" />
              <TicketPercent className="absolute top-5 right-5 size-16 -rotate-12 text-white/20" aria-hidden />
              <p className="text-xs font-bold tracking-[0.14em] text-white/80 uppercase">Your offer</p>
              <p className="mt-2 max-w-[16rem] font-display text-xl leading-snug font-bold">{promo.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-xl border border-dashed border-white/60 bg-white/15 px-3 py-2 font-mono font-bold tracking-wider">{promo.code}</span>
                <CopyButton value={promo.code} dark className="text-white" />
              </div>
              <Link to="/dashboard/rewards" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white">See all rewards <ArrowRight className="size-3.5" aria-hidden /></Link>
            </div>
          )}

          {/* Support */}
          <section className="card p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-white"><Headset className="size-5" aria-hidden /></span>
              <div>
                <p className="font-display font-bold text-ink-900">Need help with a trip?</p>
                <p className="text-sm text-text-2">Our team is on WhatsApp during operating hours.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ExternalButton href={whatsappLink()} target="_blank" rel="noreferrer" variant="outline" size="sm" iconLeft={<WhatsappGlyph className="size-4" />}>WhatsApp</ExternalButton>
              <ButtonLink to="/dashboard/support" variant="soft" size="sm">Get support</ButtonLink>
            </div>
            <p className="mt-3 text-xs text-muted">{site.hours[0].days}: {site.hours[0].time}</p>
          </section>

          <DemoNotice compact />
        </div>
      </div>
    </div>
  );
}
