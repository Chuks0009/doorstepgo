import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpDown, Bike, Bus, CalendarDays, CarTaxiFront, Clock, Gauge, Info, MapPin, Navigation, Package, Route, Users } from 'lucide-react';
import { Button, Input, Segmented, Select, Stepper, type Option } from '@/components/ui';
import { DEFAULT_CITY, activeCities, findCity } from '@/config/locations';
import { pricing, sizeOptions } from '@/config/pricing';
import { tiersByKind } from '@/data/services';
import { estimateDelivery, estimateRide } from '@/services/pricingService';
import type { DeliveryUrgency, PackageSize, RideKind } from '@/types';
import { cn, naira, todayISO } from '@/utils';

type Mode = 'ride' | 'delivery';
type Errors = Partial<Record<'pickupCity' | 'pickupJunction' | 'dropoffCity' | 'dropoffJunction' | 'date' | 'time', string>>;

const rideKinds: { value: RideKind; label: string; Icon: typeof Bike; hint: string }[] = [
  { value: 'motorcycle', label: 'Motorcycle', Icon: Bike, hint: '1 passenger' },
  { value: 'tricycle', label: 'Tricycle', Icon: CarTaxiFront, hint: 'Up to 3' },
  { value: 'shuttle', label: 'Shuttle', Icon: Bus, hint: 'Groups' },
];

const cityOptions: Option[] = activeCities.map((c) => ({ value: c.id, label: c.name }));
const junctionOptions = (cityId: string): Option[] =>
  (findCity(cityId)?.areas ?? []).flatMap((a) => a.junctions.map((j) => ({ value: j.id, label: j.name, group: a.name })));
const urgencyOptions: Option[] = (Object.keys(pricing.delivery.urgency) as DeliveryUrgency[]).map((k) => ({ value: k, label: pricing.delivery.urgency[k].label }));
const sizeSelect: Option[] = sizeOptions.map((s) => ({ value: s.id, label: `${s.label} — up to ${s.maxKg} kg` }));

const defaultTime = () => {
  const d = new Date(Date.now() + 30 * 60_000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Hero quick-booking widget. Collects the essentials, shows a live fare
 * estimate from the pricing service and hands off to the full booking flow
 * via query params.
 */
export function QuickBookingWidget({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('ride');
  const [kind, setKind] = useState<RideKind>('motorcycle');
  const [pickupCity, setPickupCity] = useState(DEFAULT_CITY);
  const [pickupJunction, setPickupJunction] = useState('');
  const [dropoffCity, setDropoffCity] = useState(DEFAULT_CITY);
  const [dropoffJunction, setDropoffJunction] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(defaultTime());
  const [passengers, setPassengers] = useState(1);
  const [size, setSize] = useState<PackageSize>('small');
  const [urgency, setUrgency] = useState<DeliveryUrgency>('standard');
  const [errors, setErrors] = useState<Errors>({});

  const tier = tiersByKind[kind][0];
  const maxPassengers = kind === 'motorcycle' ? 1 : tier.capacity;
  const pax = Math.min(passengers, maxPassengers);

  const pickup = { cityId: pickupCity, junctionId: pickupJunction || undefined };
  const dropoff = { cityId: dropoffCity, junctionId: dropoffJunction || undefined };

  const estimate = useMemo(
    () =>
      mode === 'ride'
        ? estimateRide({ tierId: tier.id, pickup, dropoff, passengers: pax, time })
        : estimateDelivery({ pickup, dropoff, size, weightKg: 0, packages: 1, urgency, handling: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, tier.id, pickupCity, pickupJunction, dropoffCity, dropoffJunction, pax, time, size, urgency],
  );
  const routeReady = !!pickupJunction && !!dropoffJunction;

  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const swap = () => {
    setPickupCity(dropoffCity);
    setDropoffCity(pickupCity);
    setPickupJunction(dropoffJunction);
    setDropoffJunction(pickupJunction);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!pickupCity) next.pickupCity = 'Select a pickup city';
    if (!pickupJunction) next.pickupJunction = 'Select a pickup junction';
    if (!dropoffCity) next.dropoffCity = mode === 'ride' ? 'Select a destination city' : 'Select a drop-off city';
    if (!dropoffJunction) next.dropoffJunction = mode === 'ride' ? 'Select a destination junction' : 'Select a drop-off junction';
    if (pickupCity && pickupJunction && pickupCity === dropoffCity && pickupJunction === dropoffJunction) next.dropoffJunction = 'Destination must differ from pickup';
    if (mode === 'ride') {
      if (!date) next.date = 'Choose a date';
      else if (date < todayISO()) next.date = 'Date cannot be in the past';
      if (!time) next.time = 'Choose a time';
    }
    setErrors(next);
    const first = Object.keys(next).find((k) => next[k as keyof Errors]);
    if (first) {
      document.querySelector<HTMLElement>(`[name="qb-${first}"]`)?.focus();
      return;
    }
    const q = new URLSearchParams({ pickupCity, pickupJunction, dropoffCity, dropoffJunction });
    if (mode === 'ride') {
      const params = new URLSearchParams({ service: kind, tier: tier.id, pickupCity, pickupJunction, dropoffCity, dropoffJunction, date, time, passengers: String(pax) });
      navigate(`/booking?${params.toString()}`);
    } else {
      q.set('size', size);
      q.set('urgency', urgency);
      navigate(`/delivery?${q.toString()}`);
    }
  };

  const destWord = mode === 'ride' ? 'Destination' : 'Drop-off';

  return (
    <form onSubmit={submit} noValidate aria-label="Quick booking" className={cn('relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-4 shadow-[0_40px_100px_-40px_rgb(5_11_34/0.65)] backdrop-blur-xl sm:p-6 lg:p-7', className)}>
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-go-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="What do you need?"
            value={mode}
            onChange={(v) => {
              setMode(v);
              setErrors({});
            }}
            options={[
              { value: 'ride', label: 'Ride', icon: <Navigation className="size-4" aria-hidden /> },
              { value: 'delivery', label: 'Delivery', icon: <Package className="size-4" aria-hidden /> },
            ]}
          />
          <AnimatePresence initial={false} mode="popLayout">
            {mode === 'ride' && (
              <motion.div key="kinds" role="group" aria-label="Vehicle type" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex w-full gap-1.5 sm:w-auto">
                {rideKinds.map(({ value, label, Icon, hint }) => {
                  const active = kind === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setKind(value)}
                      className={cn('flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition sm:flex-none sm:justify-start sm:px-3', active ? 'border-go-400 bg-go-50 text-ink-900 shadow-[0_6px_18px_-8px_rgb(255_106_19/0.5)]' : 'border-line bg-white text-text-2 hover:border-brand-300')}
                    >
                      <Icon className={cn('hidden size-4.5 shrink-0 sm:block', active ? 'text-go-600' : 'text-brand-600')} aria-hidden />
                      <span className="leading-tight">
                        <span className="block text-[13px] font-semibold">{label}</span>
                        <span className="hidden text-[11px] text-muted sm:block">{hint}</span>
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Info className="size-3.5" aria-hidden /> Estimates are illustrative · confirm on the next step
        </p>
      </div>

      <div className="relative mt-5 grid gap-5 lg:grid-cols-[1fr_260px] lg:gap-6">
        <div className="grid gap-4">
          {/* Route */}
          <div className="relative grid gap-3 rounded-2xl border border-line bg-surface-2/50 p-3 sm:grid-cols-2 sm:p-4">
            <fieldset className="grid min-w-0 grid-cols-2 gap-3">
              <legend className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink-900">
                <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white"><Navigation className="size-3" aria-hidden /></span>
                Pickup
              </legend>
              <Select label="City" name="qb-pickupCity" required value={pickupCity} placeholder="City" options={cityOptions} error={errors.pickupCity} onChange={(e) => { setPickupCity(e.target.value); setPickupJunction(''); clear('pickupCity'); }} />
              <Select label="Junction" name="qb-pickupJunction" required value={pickupJunction} placeholder={pickupCity ? 'Select' : 'City first'} disabled={!pickupCity} options={junctionOptions(pickupCity)} error={errors.pickupJunction} onChange={(e) => { setPickupJunction(e.target.value); clear('pickupJunction'); }} />
            </fieldset>
            <button type="button" onClick={swap} aria-label="Swap pickup and destination" className="absolute top-1/2 left-1/2 z-10 hidden size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-brand-700 shadow-soft transition hover:rotate-180 hover:border-go-400 hover:text-go-600 sm:grid">
              <ArrowUpDown className="size-4 rotate-90" aria-hidden />
            </button>
            <fieldset className="grid min-w-0 grid-cols-2 gap-3 sm:pl-4">
              <legend className="mb-2 flex w-full items-center justify-between gap-2 text-[13px] font-bold text-ink-900">
                <span className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-go-500 text-white"><MapPin className="size-3" aria-hidden /></span>
                  {destWord}
                </span>
              </legend>
              <Select label="City" name="qb-dropoffCity" required value={dropoffCity} placeholder="City" options={cityOptions} error={errors.dropoffCity} onChange={(e) => { setDropoffCity(e.target.value); setDropoffJunction(''); clear('dropoffCity'); }} />
              <Select label="Junction" name="qb-dropoffJunction" required value={dropoffJunction} placeholder={dropoffCity ? 'Select' : 'City first'} disabled={!dropoffCity} options={junctionOptions(dropoffCity)} error={errors.dropoffJunction} onChange={(e) => { setDropoffJunction(e.target.value); clear('dropoffJunction'); }} />
            </fieldset>
            <button type="button" onClick={swap} className="flex min-h-11 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold text-brand-700 hover:bg-white sm:hidden">
              <ArrowUpDown className="size-4" aria-hidden /> Swap pickup & {destWord.toLowerCase()}
            </button>
          </div>

          {/* Mode-specific details */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'ride' ? (
              <motion.div key="ride" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Input label="Date" type="date" name="qb-date" required min={todayISO()} value={date} error={errors.date} icon={<CalendarDays />} onChange={(e) => { setDate(e.target.value); clear('date'); }} />
                <Input label="Time" type="time" name="qb-time" required value={time} error={errors.time} icon={<Clock />} onChange={(e) => { setTime(e.target.value); clear('time'); }} />
                <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-text"><Users className="size-4 text-muted" aria-hidden /> Passengers</span>
                  {kind === 'motorcycle' ? (
                    <p className="flex h-[50px] items-center rounded-xl border border-dashed border-line-strong px-3.5 text-[13px] text-text-2">1 rider seat</p>
                  ) : (
                    <Stepper label="passengers" value={pax} min={1} max={maxPassengers} onChange={setPassengers} />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="delivery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid gap-3 sm:grid-cols-2">
                <Select label="Package size" name="qb-size" value={size} options={sizeSelect} icon={<Package />} onChange={(e) => setSize(e.target.value as PackageSize)} />
                <Select label="Urgency" name="qb-urgency" value={urgency} options={urgencyOptions} icon={<Gauge />} onChange={(e) => setUrgency(e.target.value as DeliveryUrgency)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live estimate */}
        <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-ink-900 p-5 text-white">
          <div aria-hidden className="grid-lines absolute inset-0 opacity-50" />
          <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-go-500/30 blur-3xl" />
          <div className="relative">
            <p className="flex items-center justify-between text-[11px] font-bold tracking-[0.14em] text-white/60 uppercase">
              <span>Estimate</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wider text-go-300">{mode === 'ride' ? tier.name : pricing.delivery.urgency[urgency].eta}</span>
            </p>
            <div aria-live="polite" className="mt-2 min-h-[3.25rem]">
              <AnimatePresence mode="wait">
                <motion.p key={estimate?.total ?? 'none'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="font-display text-4xl font-extrabold tracking-tight">
                  {estimate ? naira(estimate.total) : '—'}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/60">
              <Route className="size-3.5" aria-hidden />
              {estimate && routeReady ? `${estimate.distanceKm} km · ~${estimate.durationMin} min` : 'Pick both junctions for a sharper estimate'}
            </p>
          </div>
          <Button type="submit" variant="go" size="lg" block iconRight={<ArrowRight className="size-4" />} className="relative">
            {mode === 'ride' ? 'Continue booking' : 'Schedule delivery'}
          </Button>
        </div>
      </div>
    </form>
  );
}
