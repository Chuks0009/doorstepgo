import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, Moon, Sun, Sunrise } from 'lucide-react';
import { ButtonLink, Segmented, SmartImage, Stepper } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { img } from '@/data/images';
import { estimateRide } from '@/services/pricingService';
import type { ServiceTier, TripType } from '@/types';
import { cn, naira } from '@/utils';
import { QuickLocation, type QuickLoc } from './QuickLocation';

const timePresets = [
  { value: '13:00', label: 'Off-peak', hint: '1:00 PM', Icon: Sun },
  { value: '08:00', label: 'Peak', hint: '8:00 AM', Icon: Sunrise },
  { value: '23:00', label: 'Night', hint: '11:00 PM', Icon: Moon },
];

/**
 * Interactive ride fare estimator: tier picker, quick pickup/destination,
 * time, passengers and trip type → itemised FareBreakdown + Book link.
 */
export function FareEstimator({ tiers, defaultPickup, defaultDropoff, showPassengers = true, maxPassengers }: { tiers: ServiceTier[]; defaultPickup?: QuickLoc; defaultDropoff?: QuickLoc; showPassengers?: boolean; maxPassengers?: number }) {
  const [tierId, setTierId] = useState(tiers[0].id);
  const [pickup, setPickup] = useState<QuickLoc>(defaultPickup ?? { cityId: 'awka', areaId: 'ifite', junctionId: 'miracle-jn' });
  const [dropoff, setDropoff] = useState<QuickLoc>(defaultDropoff ?? { cityId: 'awka', areaId: 'unizik', junctionId: 'unizik-main-gate' });
  const [time, setTime] = useState('13:00');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<TripType>('one-way');

  const tier = tiers.find((t) => t.id === tierId) ?? tiers[0];
  const cap = Math.max(1, maxPassengers ?? tier.capacity);
  const pax = Math.min(passengers, cap);
  const fare = useMemo(() => estimateRide({ tierId, pickup, dropoff, time, passengers: pax, tripType }), [tierId, pickup, dropoff, time, pax, tripType]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="card space-y-7 p-5 sm:p-7">
        <div role="radiogroup" aria-label="Choose a category">
          <p className="mb-3 text-sm font-bold text-ink-900">1 · Category</p>
          <div className="scrollbar-none -mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible xl:grid-cols-5">
            {tiers.map((t) => {
              const on = t.id === tierId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTierId(t.id)}
                  className={cn('group w-36 shrink-0 snap-start overflow-hidden rounded-2xl border-2 bg-white text-left transition-all sm:w-auto', on ? 'border-go-500 shadow-[0_10px_30px_-12px_rgb(255_106_19/0.55)]' : 'border-line hover:border-brand-300')}
                >
                  <SmartImage src={img(t.image, 400)} alt="" className="aspect-[16/9]" />
                  <span className="block p-2.5">
                    <span className="block truncate text-[13px] font-bold text-ink-900">{t.name.replace(/ (Motorcycle|Tricycle)$/, '')}</span>
                    <span className="block text-xs text-muted">from {naira(t.minFare)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-ink-900">2 · Route</p>
          <div className="relative grid gap-4">
            <QuickLocation label="Pickup" value={pickup} onChange={setPickup} />
            <button
              type="button"
              onClick={() => { setPickup(dropoff); setDropoff(pickup); }}
              aria-label="Swap pickup and destination"
              className="absolute top-1/2 right-0 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-800 shadow-soft transition hover:rotate-180 hover:text-go-600 sm:grid"
            >
              <ArrowUpDown className="size-4" aria-hidden />
            </button>
            <QuickLocation label="Destination" tone="dropoff" value={dropoff} onChange={setDropoff} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p id="fe-time" className="mb-3 text-sm font-bold text-ink-900">3 · Time of travel</p>
            <div role="radiogroup" aria-labelledby="fe-time" className="grid grid-cols-3 gap-2">
              {timePresets.map(({ value, label, hint, Icon }) => (
                <button key={value} type="button" role="radio" aria-checked={time === value} onClick={() => setTime(value)} className={cn('flex min-h-11 flex-col items-center rounded-xl border px-2 py-2 text-center transition', time === value ? 'border-go-500 bg-go-50 text-go-800' : 'border-line hover:border-brand-300')}>
                  <Icon className="size-4" aria-hidden />
                  <span className="mt-0.5 text-xs font-bold">{label}</span>
                  <span className="text-[11px] text-muted">{hint}</span>
                </button>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              Or exact time
              <input type="time" value={time} onChange={(e) => setTime(e.target.value || '13:00')} className="field-input !w-auto !py-1.5 !text-sm" />
            </label>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-bold text-ink-900">4 · Trip type</p>
              <Segmented<TripType> label="Trip type" value={tripType} onChange={setTripType} options={[{ value: 'one-way', label: 'One-way' }, { value: 'return', label: 'Return' }]} className="w-full" />
            </div>
            {showPassengers && cap > 1 && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink-900">Passengers <span className="font-normal text-muted">(max {cap})</span></p>
                <Stepper label="passengers" value={pax} min={1} max={cap} onChange={setPassengers} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="noise relative overflow-hidden rounded-3xl bg-ink-950 p-2 shadow-lift">
          <div aria-hidden className="absolute -top-20 -right-10 size-60 rounded-full bg-go-500/25 blur-3xl" />
          <div className="relative flex items-center gap-3 px-3 pt-3 pb-4 text-white">
            <SmartImage src={img(tier.image, 200)} alt="" className="size-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="truncate font-bold">{tier.name}</p>
              <p className="text-xs text-white/60">{tier.capacityLabel} · {tier.eta}</p>
            </div>
          </div>
          <FareBreakdown fare={fare} dark />
          <div className="p-3">
            <ButtonLink to={`/booking?service=${tier.kind}&tier=${tier.id}`} variant="go" size="lg" block iconRight={<ArrowRight className="size-5" aria-hidden />}>
              Book {tier.name}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
