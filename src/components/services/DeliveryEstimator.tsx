import { useMemo, useState } from 'react';
import { ArrowRight, Box, FileText, Package, ShoppingBasket, Truck } from 'lucide-react';
import { ButtonLink, Checkbox, Select, Stepper, Toggle } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { pricing, sizeOptions } from '@/config/pricing';
import { estimateDelivery } from '@/services/pricingService';
import type { DeliveryUrgency, PackageSize } from '@/types';
import { cn } from '@/utils';
import { QuickLocation, type QuickLoc } from './QuickLocation';

const sizeIcon: Record<PackageSize, typeof Box> = { envelope: FileText, small: Package, medium: Box, large: Box, xl: Truck };
const urgencyToCategory: Record<DeliveryUrgency, string> = { standard: 'parcel', express: 'express', same_day: 'same-day', scheduled: 'scheduled' };
const handlingShown = ['fragile', 'perishable', 'signature', 'insurance'];
export const marketTasks = [
  { value: 'already_paid', label: 'Goods already purchased — collect them' },
  { value: 'collect_from_seller', label: 'Rider collects from a named seller' },
  { value: 'purchase_items', label: 'Rider purchases specified items' },
  { value: 'assist_collection', label: 'Assistance with market collection' },
];

/** Delivery price estimator built on estimateDelivery + FareBreakdown. */
export function DeliveryEstimator() {
  const [pickup, setPickup] = useState<QuickLoc>({ cityId: 'awka', areaId: 'awka-town', junctionId: 'eke-awka' });
  const [dropoff, setDropoff] = useState<QuickLoc>({ cityId: 'awka', areaId: 'ifite', junctionId: 'miracle-jn' });
  const [size, setSize] = useState<PackageSize>('small');
  const [weightKg, setWeight] = useState(3);
  const [urgency, setUrgency] = useState<DeliveryUrgency>('standard');
  const [handling, setHandling] = useState<string[]>([]);
  const [market, setMarket] = useState(false);
  const [task, setTask] = useState('already_paid');

  const fare = useMemo(
    () => estimateDelivery({ pickup, dropoff, size, weightKg, packages: 1, urgency, handling, market: market ? { task } : null }),
    [pickup, dropoff, size, weightKg, urgency, handling, market, task],
  );
  const maxKg = sizeOptions.find((s) => s.id === size)?.maxKg ?? 80;
  const category = market ? 'market-pickup' : urgencyToCategory[urgency];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="card space-y-7 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLocation label="Collect from" value={pickup} onChange={setPickup} />
          <QuickLocation label="Deliver to" tone="dropoff" value={dropoff} onChange={setDropoff} />
        </div>

        <div role="radiogroup" aria-label="Package size">
          <p className="mb-3 text-sm font-bold text-ink-900">Package size</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {sizeOptions.map((s) => {
              const I = sizeIcon[s.id];
              const on = s.id === size;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => { setSize(s.id); setWeight((w) => Math.min(w, s.maxKg)); }} className={cn('flex min-h-11 flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition', on ? 'border-go-500 bg-go-50' : 'border-line hover:border-brand-300')}>
                  <I className={cn('size-5', on ? 'text-go-600' : 'text-brand-600')} aria-hidden />
                  <span className="text-xs font-bold text-ink-900">{s.label}</span>
                  <span className="text-[11px] text-muted">≤ {s.maxKg} kg</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-2">Weight (kg) <span className="text-muted">— first {pricing.delivery.freeWeightKg} kg included</span></p>
            <Stepper label="weight in kilograms" value={weightKg} min={1} max={maxKg} onChange={setWeight} />
          </div>
        </div>

        <div role="radiogroup" aria-label="Delivery speed">
          <p className="mb-3 text-sm font-bold text-ink-900">Speed</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(pricing.delivery.urgency) as DeliveryUrgency[]).map((u) => {
              const o = pricing.delivery.urgency[u];
              const on = u === urgency;
              return (
                <button key={u} type="button" role="radio" aria-checked={on} onClick={() => setUrgency(u)} className={cn('flex min-h-11 items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition', on ? 'border-go-500 bg-go-50' : 'border-line hover:border-brand-300')}>
                  <span className="text-sm font-semibold text-ink-900">{o.label}</span>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold', on ? 'bg-go-500 text-white' : 'bg-surface-2 text-text-2')}>{o.eta}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink-900">Handling extras</legend>
            {handlingShown.map((h) => (
              <Checkbox
                key={h}
                label={pricing.delivery.handling[h].label}
                checked={handling.includes(h)}
                onChange={(v) => setHandling((prev) => (v ? [...prev, h] : prev.filter((x) => x !== h)))}
              />
            ))}
          </fieldset>
          <div className="rounded-2xl bg-go-50/60 p-4 ring-1 ring-go-100">
            <div className="flex items-start gap-2">
              <ShoppingBasket className="mt-2.5 size-4 shrink-0 text-go-600" aria-hidden />
              <div className="flex-1"><Toggle checked={market} onChange={setMarket} label="Market pickup" description="Rider goes to the market for you" /></div>
            </div>
            {market && (
              <Select label="What should the rider do?" value={task} onChange={(e) => setTask(e.target.value)} options={marketTasks} wrapperClassName="mt-2" />
            )}
            {market && <p className="mt-2 text-xs text-go-800">Cost of goods is not included — purchases and payments to sellers may require separate arrangements.</p>}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="noise relative overflow-hidden rounded-3xl bg-ink-950 p-2 shadow-lift">
          <div aria-hidden className="absolute -top-20 -right-10 size-60 rounded-full bg-brand-500/30 blur-3xl" />
          <FareBreakdown fare={fare} dark title="Estimated delivery fee" />
          <div className="p-3">
            <ButtonLink to={`/delivery?category=${category}`} variant="go" size="lg" block iconRight={<ArrowRight className="size-5" aria-hidden />}>
              Schedule this delivery
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
