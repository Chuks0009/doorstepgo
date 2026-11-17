import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bike, Check, Coins, Crown, Gift, Package, Share2, Sparkles, TicketPercent, Trophy, UserPlus } from 'lucide-react';
import { Badge, Button, ExternalButton, WhatsappGlyph } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { CopyButton, Panel, loyaltyStatus } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks';
import { useBookings, useDeliveries } from '@/hooks/useData';
import { loyalty, promoCodes } from '@/config/pricing';
import { site } from '@/config/site';
import { cn, formatDate, naira } from '@/utils';

export default function RewardsPage() {
  usePageMeta('Rewards & referrals');
  const { user } = useAuth();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const toast = useToast();

  const history = useMemo(() => {
    if (!user) return [];
    const earn = (amount: number) => Math.floor(amount * loyalty.pointsPerNaira);
    const rows = [
      ...bookings.filter((b) => b.status === 'completed').map((b) => ({ id: b.id, date: b.date, label: `Ride ${b.reference}`, points: earn(b.fare.total), kind: 'ride' as const })),
      ...deliveries.filter((d) => d.status === 'completed').map((d) => ({ id: d.id, date: d.date, label: `Delivery ${d.reference}`, points: earn(d.fare.total), kind: 'delivery' as const })),
      { id: 'welcome', date: user.memberSince, label: 'Welcome bonus', points: 500, kind: 'bonus' as const },
    ];
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, deliveries, user]);

  if (!user) return null;
  const status = loyaltyStatus(user.loyaltyPoints);
  const shareText = `Join me on ${site.name}! Use my code ${user.referralCode} when you sign up and we both get ${loyalty.referralReward.toLocaleString()} points. ${site.url}/register?ref=${user.referralCode}`;
  const maxTier = loyalty.tiers[loyalty.tiers.length - 1].min;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${site.name} invite`, text: shareText });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Invite copied', body: 'Paste it anywhere to share your code.' });
      } catch {
        toast({ title: 'Sharing unavailable', body: `Your code is ${user.referralCode}.`, tone: 'info' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <DashPageHeader title="Rewards & referrals" subtitle="Earn points on every trip, climb tiers and invite friends." />

      {/* Points hero */}
      <section className="noise relative overflow-hidden rounded-3xl bg-ink-radial p-6 text-white shadow-lift sm:p-8">
        <div aria-hidden className="absolute -top-24 right-0 size-80 rounded-full bg-go-500/25 blur-[100px]" />
        <div aria-hidden className="absolute -bottom-20 -left-10 size-64 rounded-full bg-brand-500/30 blur-[90px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="eyebrow-dark"><Crown className="size-3.5" aria-hidden /> {status.current.name} member</p>
            <p className="mt-4 font-display text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">{user.loyaltyPoints.toLocaleString()}</p>
            <p className="mt-1 text-white/65">points · worth about {naira(user.loyaltyPoints * loyalty.redeemRate)} off future trips (demo)</p>
            <p className="mt-4 text-sm text-white/80">{status.next ? <>Only <strong className="text-go-300">{status.toNext.toLocaleString()} points</strong> to reach <strong>{status.next.name}</strong>.</> : 'You have reached our top tier — thank you!'}</p>
          </div>
          <div>
            <div className="relative pt-8 pb-2">
              <div className="h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Loyalty tier progress" aria-valuemin={0} aria-valuemax={maxTier} aria-valuenow={Math.min(user.loyaltyPoints, maxTier)}>
                <motion.div className="h-full rounded-full bg-go-sheen" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (user.loyaltyPoints / maxTier) * 100)}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              {loyalty.tiers.map((t, i) => {
                const left = (t.min / maxTier) * 100;
                const reached = user.loyaltyPoints >= t.min;
                return (
                  <div key={t.name} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${Math.min(97, Math.max(3, left))}%` }}>
                    <span className={cn('mx-auto grid size-6 place-items-center rounded-full text-[10px] font-bold ring-4 ring-ink-900', reached ? 'bg-go-500 text-white' : 'bg-white/15 text-white/60')}>{reached ? <Check className="size-3" strokeWidth={3} aria-hidden /> : i + 1}</span>
                  </div>
                );
              })}
            </div>
            <ol className="mt-3 grid grid-cols-4 gap-2">
              {loyalty.tiers.map((t, i) => (
                <li key={t.name} className={cn('rounded-xl p-3 text-center ring-1', i === status.index ? 'bg-white/10 ring-go-400/50' : 'ring-white/10')}>
                  <p className={cn('text-sm font-bold', i <= status.index ? 'text-white' : 'text-white/50')}>{t.name}</p>
                  <p className="text-[11px] text-white/50">{t.min.toLocaleString()}+</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Referral */}
        <Panel title="Invite friends" subtitle={`You both get ${loyalty.referralReward.toLocaleString()} points`} icon={<UserPlus />} className="xl:col-span-1">
          <div className="rounded-2xl border-2 border-dashed border-go-200 bg-go-50/50 p-5 text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-go-700 uppercase">Your referral code</p>
            <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-ink-900">{user.referralCode}</p>
            <CopyButton value={user.referralCode} label="Copy code" className="mt-2" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ExternalButton href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" variant="outline" size="sm" iconLeft={<WhatsappGlyph className="size-4" />}>WhatsApp</ExternalButton>
            <Button variant="soft" size="sm" iconLeft={<Share2 className="size-4" />} onClick={share}>Share invite</Button>
          </div>
          <ol className="mt-5 space-y-3 text-sm">
            {['Share your code with a friend', 'They sign up and complete a first trip', `You both get ${loyalty.referralReward.toLocaleString()} points`].map((s, i) => (
              <li key={s} className="flex items-start gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">{i + 1}</span><span className="pt-0.5 text-text-2">{s}</span></li>
            ))}
          </ol>
        </Panel>

        {/* Promo codes */}
        <Panel title="Promo codes" subtitle="Apply at checkout" icon={<TicketPercent />} className="xl:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            {promoCodes.map((p) => (
              <li key={p.code} className={cn('relative flex overflow-hidden rounded-2xl border', p.active ? 'border-line bg-white' : 'border-line bg-surface-2/60 opacity-70')}>
                <div className={cn('flex w-20 shrink-0 flex-col items-center justify-center p-3 text-center text-white', p.active ? 'bg-go-sheen' : 'bg-line-strong')}>
                  <span className="font-display text-xl leading-none font-extrabold">{p.type === 'percent' ? `${p.value}%` : naira(p.value)}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">off</span>
                </div>
                <span aria-hidden className="absolute top-1/2 left-[74px] size-3 -translate-y-1/2 rounded-full bg-canvas" />
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold tracking-wider text-ink-900">{p.code}</p>
                    <Badge tone={p.active ? 'ok' : 'neutral'}>{p.active ? 'Active' : 'Expired'}</Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-text-2">{p.description}</p>
                  {p.minSpend && <p className="text-xs text-muted">Min. spend {naira(p.minSpend)}</p>}
                  {p.active && <CopyButton value={p.code} className="-ml-2.5 mt-1" />}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Points history" subtitle="Derived from your completed trips on this device" icon={<Coins />} className="xl:col-span-2" bodyClassName="px-3 pb-3 sm:px-3 sm:pb-3">
          <ul className="divide-y divide-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-3 py-3">
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', h.kind === 'ride' ? 'bg-go-50 text-go-600' : h.kind === 'delivery' ? 'bg-brand-50 text-brand-700' : 'bg-ok-bg text-ok')}>
                  {h.kind === 'ride' ? <Bike className="size-[18px]" aria-hidden /> : h.kind === 'delivery' ? <Package className="size-[18px]" aria-hidden /> : <Gift className="size-[18px]" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{h.label}</p>
                  <p className="text-xs text-muted">{formatDate(h.date)}</p>
                </div>
                <span className="font-display font-bold text-ok tabular-nums">+{h.points.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="px-3 pt-2 text-xs text-muted">Your balance also includes points from earlier activity and referrals.</p>
        </Panel>

        <Panel title="Ways to earn" icon={<Trophy />}>
          <ul className="space-y-3 text-sm">
            {[
              [Bike, `1 point for every ${naira(1 / loyalty.pointsPerNaira)} spent on rides`],
              [Package, 'Same rate on deliveries & market pickups'],
              [UserPlus, `${loyalty.referralReward.toLocaleString()} points per successful referral`],
              [Sparkles, 'Bonus points during promos and on your birthday'],
            ].map(([I, t], i) => {
              const Ico = I as typeof Bike;
              return <li key={i} className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-800"><Ico className="size-4" aria-hidden /></span><span className="pt-1.5 text-text-2">{t as string}</span></li>;
            })}
          </ul>
          <p className="mt-4 rounded-xl bg-brand-50/70 p-3 text-xs text-brand-800">Points and redemption are illustrative in this demo build.</p>
        </Panel>
      </div>
    </div>
  );
}
