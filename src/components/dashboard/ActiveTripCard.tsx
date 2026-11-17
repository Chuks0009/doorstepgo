import { useState } from 'react';
import { ArrowUpRight, Clock, Radio } from 'lucide-react';
import { ButtonLink, StatusBadge } from '@/components/ui';
import { useInterval } from '@/hooks';
import { deliveryStages } from '@/data/seed';
import type { DeliveryBooking, RideBooking } from '@/types';
import { cn } from '@/utils';
import { KindIcon, MiniRoute, PersonCard, RouteStack, categoryName, tierName } from './shared';

type Props = { ride: RideBooking; delivery?: never; compact?: boolean } | { delivery: DeliveryBooking; ride?: never; compact?: boolean };

function rideInfo(b: RideBooking) {
  const map: Partial<Record<RideBooking['status'], [string, number, string]>> = {
    driver_assigned: ['Your driver is on the way', 0.15, '~8 min to pickup'],
    driver_arriving: ['Your rider is almost there', 0.3, '~3 min to pickup'],
    in_progress: ['You are on your way', 0.65, `~${Math.max(3, Math.round(b.fare.durationMin * 0.4))} min to drop-off`],
  };
  return map[b.status] ?? ['Trip update', 0.1, 'ETA pending'];
}

function deliveryInfo(d: DeliveryBooking) {
  const idx = deliveryStages.findIndex((s) => s.key === d.stage);
  const label = deliveryStages[idx]?.label ?? 'Delivery update';
  const eta = d.stage === 'approaching' ? '~5 min to drop-off' : d.stage === 'in_transit' ? `~${Math.max(8, Math.round(d.fare.durationMin * 0.5))} min to drop-off` : d.stage === 'collected' ? `~${d.fare.durationMin} min to drop-off` : '~15 min to pickup';
  return [label, Math.max(0.08, idx / (deliveryStages.length - 1)), eta] as const;
}

/** Dark "live" hero card for an in-progress ride or delivery. */
export function ActiveTripCard(props: Props) {
  const [secs, setSecs] = useState(2);
  useInterval(() => setSecs((s) => (s >= 14 ? 1 : s + 1)), 1000);
  const isRide = !!props.ride;
  const b = props.ride;
  const d = props.delivery;
  const [headline, progress, eta] = isRide ? rideInfo(b!) : deliveryInfo(d!);
  const ref = (b ?? d)!.reference;
  const trackHref = isRide ? `/track-booking?ref=${ref}` : `/track-delivery?ref=${ref}`;
  const detailHref = isRide ? `/dashboard/bookings/${b!.id}` : `/dashboard/deliveries/${d!.id}`;

  return (
    <article className="noise relative overflow-hidden rounded-3xl bg-ink-radial text-white shadow-lift">
      <div aria-hidden className="absolute -top-24 -right-16 size-72 rounded-full bg-brand-500/30 blur-[90px]" />
      <div aria-hidden className="absolute -bottom-24 left-10 size-60 rounded-full bg-go-500/20 blur-[90px]" />
      <div aria-hidden className="absolute top-8 right-0 flex flex-col items-end gap-2 opacity-60">
        {[56, 88, 40].map((w, i) => <span key={i} className="h-1 rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: w }} />)}
      </div>

      <div className={cn('relative grid gap-6 p-5 sm:p-7', !props.compact && 'lg:grid-cols-[1.1fr_1fr]')}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-go-500/20 px-3 py-1 text-xs font-bold tracking-wider text-go-300 uppercase ring-1 ring-go-500/30">
              <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-go-400" /><span className="relative size-2 rounded-full bg-go-400" /></span>
              Live {isRide ? 'ride' : 'delivery'}
            </span>
            <StatusBadge status={isRide ? b!.status : d!.stage} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <KindIcon kind={isRide ? b!.kind : 'delivery'} className="bg-white/10 text-white ring-white/15" />
            <div className="min-w-0">
              <h2 className="text-xl leading-tight font-bold sm:text-2xl">{headline}</h2>
              <p className="truncate text-sm text-white/60">{isRide ? tierName(b!.tierId) : categoryName(d!.categoryId)} · <span className="font-mono">{ref}</span></p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p className="text-xs font-semibold tracking-wider text-white/45 uppercase">ETA (estimate)</p>
              <p className="flex items-center gap-2 font-display text-3xl font-extrabold"><Clock className="size-6 text-go-400" aria-hidden /> {eta.split(' ')[0]}</p>
              <p className="text-[13px] text-white/60">{eta.split(' ').slice(1).join(' ')}</p>
            </div>
            <p className="flex items-center gap-1.5 pb-1 text-xs text-white/45" aria-live="off"><Radio className="size-3.5" aria-hidden /> Simulated · updated {secs}s ago</p>
          </div>
          <div className="mt-5"><RouteStack from={(b ?? d)!.pickup} to={(b ?? d)!.dropoff} compact dark /></div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            <MiniRoute progress={progress} label={`Route progress for ${ref}, about ${Math.round(progress * 100)}% complete`} />
            <div className="h-1.5 bg-white/10"><div className="h-full bg-gradient-to-r from-brand-400 to-go-500" style={{ width: `${progress * 100}%` }} /></div>
          </div>
          <PersonCard person={isRide ? b!.driver : d!.rider} role={isRide ? 'Driver' : 'Rider'} dark />
          <div className="mt-auto flex flex-wrap gap-2">
            <ButtonLink to={trackHref} size="md" iconRight={<ArrowUpRight className="size-4" />} className="flex-1">Track live</ButtonLink>
            <ButtonLink to={detailHref} variant="glass" size="md" className="flex-1">View details</ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
