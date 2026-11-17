import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpDown, BadgeCheck, Bike, Bus, CalendarDays, CarTaxiFront, Check, ClipboardCheck, Clock, CloudSun, Moon, Plus, Repeat,
  Route as RouteIcon, ShieldCheck, Sparkles, Trash2, TrafficCone, Undo2, Users, Zap,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, Checkbox, DemoNotice, Input, ProgressSteps, Segmented, Select, SmartImage, Stepper, Textarea, Toggle } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { LocationPicker, rememberLocation, type LocationValue } from '@/components/booking/LocationPicker';
import { locationFromParams, locationKeys, locationRules, pickErrors, samePlace } from '@/components/booking/locationRules';
import { PromoField } from '@/components/booking/PromoField';
import { RouteTimeline, type RoutePoint } from '@/components/booking/RouteTimeline';
import { FareAnnouncer, FormSection, MobileFareBar, ReviewBlock, ReviewGrid, StepHeader, StepPanel, WizardNav, useWizard } from '@/components/booking/Wizard';
import { pricing } from '@/config/pricing';
import { findTier, serviceOverview, tiersByKind } from '@/data/services';
import { img } from '@/data/images';
import { useForm, usePageMeta } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { bookingService } from '@/services/api';
import { estimateDistance, estimateRide } from '@/services/pricingService';
import { KEYS, storage } from '@/services/storage';
import type { LocationPoint, PromoCode, RideKind, ServiceTier, TripType } from '@/types';
import { addDays, cn, formatDate, formatTime, naira, nowTimePlus, pluralize, todayISO } from '@/utils';
import { notPastDate, required, validate, when, afterField, maxLen, hasErrors, type Schema } from '@/utils/validation';

/* ---------- Form model ---------- */
type Frequency = 'daily' | 'weekdays' | 'weekly';
type RideValues = {
  kind: RideKind;
  tierId: string;
  pickup: LocationValue;
  dropoff: LocationValue;
  stops: LocationValue[];
  when: 'now' | 'later';
  date: string;
  time: string;
  passengers: number;
  tripType: TripType;
  returnDate: string;
  returnTime: string;
  vehicles: number;
  shuttleType: string;
  recurring: boolean;
  frequency: Frequency;
  until: string;
  instructions: string;
  terms: boolean;
}

const STEPS = ['Service', 'Route', 'Schedule & details', 'Review'];
const MAX_STOPS = 3;
const MAX_VEHICLES = 10;
const DRAFT_KEY = KEYS.draft('ride');
const shuttleTypes = ['Standard minibus (14 seats)', 'Executive van (7 seats)', 'Coaster bus (30 seats)', 'Luxury coach (50+ seats)', 'Mixed fleet — advise me'];
const kindIcon = { motorcycle: Bike, tricycle: CarTaxiFront, shuttle: Bus } as const;
const kinds: RideKind[] = ['motorcycle', 'tricycle', 'shuttle'];

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const multiVehicle = (t?: ServiceTier) => t?.kind === 'shuttle' && t.id !== 'sh-group';
const passengerCap = (t: ServiceTier | undefined, vehicles: number) => (!t ? 1 : multiVehicle(t) ? t.capacity * vehicles : t.capacity);
const defaultTier = (k: RideKind) => (tiersByKind[k].find((t) => t.popular) ?? tiersByKind[k][0]).id;

function surchargeHint(time?: string) {
  if (!time) return null;
  const h = Number(time.split(':')[0]);
  const { night, peak } = pricing.surcharges;
  if (h >= night.from || h < night.to) return { icon: Moon, text: `${night.label} applies between 10 PM and 5 AM (+${night.rate * 100}%).` };
  if (peak.windows.some(([s, e]) => h >= s && h < e)) return { icon: TrafficCone, text: `${peak.label} pricing applies 7–9 AM and 5–8 PM (+${peak.rate * 100}%). Shift your time to save.` };
  return null;
}

function countTrips(start: string, until: string, freq: Frequency) {
  if (!start || !until || until < start) return 0;
  let n = 0;
  for (let d = start, i = 0; d <= until && i < 400; d = addDays(d, 1), i++) {
    const wd = new Date(d + 'T12:00:00').getDay();
    if (freq === 'daily' || (freq === 'weekdays' && wd > 0 && wd < 6) || (freq === 'weekly' && i % 7 === 0)) n++;
  }
  return n;
}

const toPoint = (l: LocationValue): LocationPoint => ({ cityId: l.cityId!, areaId: l.areaId, junctionId: l.junctionId!, address: (l.address ?? '').trim() });

/* ---------- Validation schema (rules read sibling values via `all`) ---------- */
const getStops = (all: Record<string, unknown>) => (all.stops as LocationValue[]) ?? [];
const schema: Schema = {
  tierId: [required('Choose a service tier to continue')],
  ...locationRules('pickup', (a) => a.pickup as LocationValue, 'pickup'),
  ...locationRules('dropoff', (a) => a.dropoff as LocationValue, 'destination'),
  ...Object.assign({}, ...Array.from({ length: MAX_STOPS }, (_, i) => locationRules(`stop${i}`, (a) => getStops(a)[i], `stop ${i + 1}`))),
  route: [(_, all) => (samePlace(all.pickup as LocationValue, all.dropoff as LocationValue) ? 'Pickup and destination look identical — please check your route.' : undefined)],
  date: [required('Choose a travel date'), notPastDate('Travel date cannot be in the past')],
  time: [
    when((a) => a.when === 'later', [
      required('Choose a pickup time'),
      (v, all) => (all.date === todayISO() && String(v) < nowHHMM() ? 'That time has already passed — choose a later time' : undefined),
    ]),
  ],
  passengers: [(v, all) => {
    const t = findTier(all.tierId as string);
    const cap = passengerCap(t, Number(all.vehicles) || 1);
    return Number(v) < 1 ? 'At least one passenger' : Number(v) > cap ? `This option carries up to ${cap} passengers` : undefined;
  }],
  shuttleType: [when((a) => a.kind === 'shuttle', [required('Choose a shuttle type')])],
  returnDate: [when((a) => a.tripType === 'return', [required('Choose a return date'), notPastDate(), afterField('date', 'Return date must be on or after the travel date')])],
  returnTime: [
    when((a) => a.tripType === 'return', [
      required('Choose a return time'),
      (v, all) => (all.returnDate === all.date && String(v) <= String(all.when === 'now' ? nowTimePlus(10) : all.time) ? 'Return time must be after the pickup time' : undefined),
    ]),
  ],
  until: [
    when((a) => !!a.recurring, [
      required('Choose when the recurring trips should end'),
      (v, all) => (String(v) <= String(all.date) ? 'End date must be after the first trip' : undefined),
      (v, all) => (String(v) > addDays(String(all.date), 90) ? 'Recurring bookings can run for up to 90 days' : undefined),
    ]),
  ],
  instructions: [maxLen(300)],
  terms: [(v) => (v ? undefined : 'Please accept the booking terms to continue')],
};

function stepFields(step: number, stops: number) {
  if (step === 0) return ['tierId'];
  if (step === 1) return [...locationKeys('pickup'), ...Array.from({ length: stops }, (_, i) => locationKeys(`stop${i}`)).flat(), ...locationKeys('dropoff'), 'route'];
  if (step === 2) return ['date', 'time', 'passengers', 'shuttleType', 'returnDate', 'returnTime', 'until', 'instructions'];
  return ['terms'];
}

/* ---------- Initial values from URL params, else saved draft ---------- */
function buildInitial(params: URLSearchParams): { values: RideValues; fromDraft: boolean; startStep: number } {
  const today = todayISO();
  const tierParam = findTier(params.get('tier') ?? undefined);
  const svc = params.get('service') as RideKind | null;
  const kind: RideKind = tierParam && tierParam.kind !== 'delivery' ? (tierParam.kind as RideKind) : svc && kinds.includes(svc) ? svc : 'motorcycle';
  const tier = tierParam && tierParam.kind === kind ? tierParam : findTier(defaultTier(kind))!;
  const base: RideValues = {
    kind,
    tierId: tier.id,
    pickup: {},
    dropoff: {},
    stops: [],
    when: 'later',
    date: today,
    time: nowTimePlus(30),
    passengers: 1,
    tripType: 'one-way',
    returnDate: '',
    returnTime: '',
    vehicles: 1,
    shuttleType: kind === 'shuttle' ? shuttleTypes[0] : '',
    recurring: false,
    frequency: 'weekdays',
    until: '',
    instructions: '',
    terms: false,
  };
  const keys = ['service', 'tier', 'pickupCity', 'pickupJunction', 'dropoffCity', 'dropoffJunction', 'date', 'time', 'passengers'];
  const hasParams = keys.some((k) => params.has(k));

  if (!hasParams) {
    const draft = storage.get<Partial<RideValues> | null>(DRAFT_KEY, null);
    if (draft && findTier(draft.tierId)) {
      const merged = { ...base, ...draft, terms: false };
      if (merged.date < today) merged.date = today;
      return { values: merged, fromDraft: true, startStep: 0 };
    }
    return { values: base, fromDraft: false, startStep: 0 };
  }

  const date = params.get('date');
  const time = params.get('time');
  const pax = Number(params.get('passengers'));
  const values: RideValues = {
    ...base,
    pickup: locationFromParams(params.get('pickupCity'), params.get('pickupJunction')),
    dropoff: locationFromParams(params.get('dropoffCity'), params.get('dropoffJunction')),
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today ? date : today,
    time: time && /^\d{2}:\d{2}$/.test(time) ? time : base.time,
    passengers: pax > 0 ? Math.min(pax, multiVehicle(tier) ? tier.capacity * MAX_VEHICLES : tier.capacity) : 1,
  };
  if (multiVehicle(tier)) values.vehicles = Math.max(1, Math.ceil(values.passengers / tier.capacity));
  // Service & tier already chosen from a service page → jump straight to the route.
  return { values, fromDraft: false, startStep: params.get('tier') && tierParam ? 1 : 0 };
}

/* =====================================================================
   PAGE
   ===================================================================== */
export default function RideBookingPage() {
  usePageMeta('Book a ride', 'Book a motorcycle, tricycle (keke) or shuttle ride with a live itemised fare estimate, multiple stops, return trips and recurring schedules.');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const init = useMemo(() => buildInitial(params), []); // eslint-disable-line react-hooks/exhaustive-deps
  const { values: v, errors, set, patch, field, check, setErrors } = useForm<RideValues>(init.values, schema);
  const topRef = useRef<HTMLDivElement>(null);
  const wiz = useWizard(STEPS.length, topRef, init.startStep);
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftBanner, setDraftBanner] = useState(init.fromDraft);

  const tier = findTier(v.tierId);
  const tiers = tiersByKind[v.kind];
  const effTime = v.when === 'now' ? nowTimePlus(10) : v.time;
  const validStops = v.stops.filter((s) => s.cityId);

  const fare = useMemo(
    () => estimateRide({ tierId: v.tierId, pickup: v.pickup, dropoff: v.dropoff, passengers: v.passengers, tripType: v.tripType, time: effTime, stops: validStops.length, vehicles: multiVehicle(tier) ? v.vehicles : 1, promo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v.tierId, v.pickup, v.dropoff, v.passengers, v.tripType, effTime, validStops.length, v.vehicles, promo, tier],
  );
  const dist = v.pickup.cityId && v.dropoff.cityId ? estimateDistance(v.pickup, v.dropoff) : null;

  /* Persist draft (debounced) */
  useEffect(() => {
    if (!v.pickup.cityId && !v.dropoff.cityId) return;
    const id = setTimeout(() => {
      const { terms: _t, ...rest } = v;
      void _t;
      storage.set(DRAFT_KEY, rest);
    }, 500);
    return () => clearTimeout(id);
  }, [v]);

  /** Patch values and re-validate any of `keys` that currently show an error. */
  const update = (p: Partial<RideValues>, keys: string[]) => {
    const next = { ...v, ...p };
    patch(p);
    const live = keys.filter((k) => errors[k]);
    if (live.length) setErrors((e) => ({ ...e, ...Object.fromEntries(live.map((k) => [k, undefined])), ...validate(next, schema, live) }));
  };

  const chooseKind = (k: RideKind) => {
    if (k === v.kind) return;
    const t = findTier(defaultTier(k))!;
    update({ kind: k, tierId: t.id, passengers: Math.min(v.passengers, t.capacity), vehicles: 1, shuttleType: k === 'shuttle' ? v.shuttleType || shuttleTypes[0] : '' }, ['tierId']);
  };
  const chooseTier = (t: ServiceTier) => {
    const vehicles = multiVehicle(t) ? Math.max(1, Math.ceil(v.passengers / t.capacity)) : 1;
    update({ tierId: t.id, passengers: Math.min(v.passengers, passengerCap(t, multiVehicle(t) ? MAX_VEHICLES : 1)), vehicles }, ['tierId', 'passengers']);
  };
  const setPassengers = (n: number) => {
    const vehicles = multiVehicle(tier) ? Math.max(v.vehicles, Math.ceil(n / tier!.capacity)) : v.vehicles;
    update({ passengers: n, vehicles }, ['passengers']);
  };

  const swap = () => update({ pickup: { ...v.dropoff }, dropoff: { ...v.pickup } }, [...locationKeys('pickup'), ...locationKeys('dropoff'), 'route']);
  const addStop = () => v.stops.length < MAX_STOPS && update({ stops: [...v.stops, {}] }, []);
  const removeStop = (i: number) => {
    const stops = v.stops.filter((_, j) => j !== i);
    setErrors((e) => {
      const next = { ...e };
      for (let j = 0; j < MAX_STOPS; j++) locationKeys(`stop${j}`).forEach((k) => delete next[k]);
      return next;
    });
    patch({ stops });
  };
  const setStop = (i: number, loc: LocationValue) => update({ stops: v.stops.map((s, j) => (j === i ? loc : s)) }, locationKeys(`stop${i}`));

  const startFresh = () => {
    storage.remove(DRAFT_KEY);
    const fresh = buildInitial(new URLSearchParams()).values;
    patch(fresh);
    setErrors({});
    setPromo(null);
    setDraftBanner(false);
    wiz.go(0);
    toast({ title: 'Started a fresh booking', tone: 'info' });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!check(stepFields(wiz.step, v.stops.length))) return;
    if (!wiz.isLast) {
      wiz.next();
      return;
    }
    // Final guard: re-validate every earlier step without stealing focus.
    for (let i = 0; i < STEPS.length - 1; i++) {
      const errs = validate(v, schema, stepFields(i, v.stops.length));
      if (hasErrors(errs)) {
        setErrors((p) => ({ ...p, ...errs }));
        wiz.go(i);
        toast({ title: 'A few details need attention', body: `Please review “${STEPS[i]}”.`, tone: 'error' });
        return;
      }
    }
    if (!fare || !tier) return;
    setBusy(true);
    try {
      const booking = await bookingService.create({
        kind: v.kind,
        tierId: v.tierId,
        pickup: toPoint(v.pickup),
        dropoff: toPoint(v.dropoff),
        stops: validStops.length ? validStops.map(toPoint) : undefined,
        date: v.when === 'now' ? todayISO() : v.date,
        time: effTime,
        passengers: v.passengers,
        tripType: v.tripType,
        returnDate: v.tripType === 'return' ? v.returnDate : undefined,
        returnTime: v.tripType === 'return' ? v.returnTime : undefined,
        vehicles: multiVehicle(tier) ? v.vehicles : undefined,
        shuttleType: v.kind === 'shuttle' ? v.shuttleType : undefined,
        instructions: v.instructions.trim() || undefined,
        recurring: v.recurring ? { frequency: v.frequency, until: v.until } : undefined,
        fare,
      });
      rememberLocation(v.pickup);
      rememberLocation(v.dropoff);
      if (promo) storage.set(KEYS.draft(`checkout:${booking.reference}`), { promoCode: promo.code });
      storage.remove(DRAFT_KEY);
      toast({ title: 'Booking created', body: `Reference ${booking.reference}. Continue to secure your ride (demo payment).` });
      navigate(`/checkout/${booking.reference}`);
    } catch {
      toast({ title: 'Something went wrong', body: 'Your booking could not be created. Please try again.', tone: 'error' });
      setBusy(false);
    }
  };

  const ctaLabel = wiz.isLast ? 'Confirm booking' : 'Continue';
  const routePoints: RoutePoint[] = [
    { kind: 'pickup', title: 'Pickup', loc: v.pickup },
    ...v.stops.map((s, i) => ({ kind: 'stop' as const, title: `Stop ${i + 1}`, loc: s })),
    { kind: 'dropoff', title: 'Destination', loc: v.dropoff },
  ];
  const sur = surchargeHint(effTime);

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Book a ride' }]}
        eyebrow={<><Zap className="size-3.5" aria-hidden /> Ride booking</>}
        title={<>Your ride, <span className="text-gradient-go">right to the doorstep</span></>}
        subtitle="Motorcycle, keke or shuttle — pick your ride, set your route and see an itemised fare update live as you go."
        aside={
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { Icon: Sparkles, t: 'Live itemised estimate', s: 'No surprises at checkout' },
              { Icon: ShieldCheck, t: 'Free cancellation', s: `Within ${pricing.cancellation.freeWindowMinutes} min of booking` },
              { Icon: Repeat, t: 'Return & recurring', s: 'School, office & market runs' },
            ].map(({ Icon, t, s }) => (
              <li key={t} className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-go-500/15 text-go-300"><Icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block text-sm font-semibold">{t}</span>
                  <span className="block text-xs text-white/55">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        }
      />

      <section className="relative bg-canvas pb-32 lg:pb-24">
        <div className="container-x">
          {/* Progress card overlapping the hero */}
          <div ref={topRef} className="relative z-10 -mt-8 rounded-3xl border border-line bg-white p-4 shadow-lift sm:p-6">
            <ProgressSteps steps={STEPS} current={wiz.step} onStepClick={(i) => wiz.go(i)} />
          </div>

          {draftBanner && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">
              <span className="flex items-center gap-2"><Undo2 className="size-4" aria-hidden /> We restored your unfinished booking from this device.</span>
              <span className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={startFresh}>Start fresh</Button>
                <Button size="sm" variant="soft" onClick={() => setDraftBanner(false)}>Keep going</Button>
              </span>
            </motion.div>
          )}

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <form id="ride-form" noValidate onSubmit={onSubmit} className="min-w-0">
              <FareAnnouncer fare={fare} />
              <StepPanel stepKey={wiz.step} dir={wiz.dir}>
                {/* ---------------- STEP 1: SERVICE ---------------- */}
                {wiz.step === 0 && (
                  <div>
                    <StepHeader index={0} total={STEPS.length} focus={wiz.navigated} icon={<Sparkles />} title="How would you like to travel?" subtitle="Choose a vehicle type, then the tier that fits your trip." />
                    <div role="radiogroup" aria-label="Vehicle type" className="grid gap-3 sm:grid-cols-3">
                      {kinds.map((k) => {
                        const o = serviceOverview.find((s) => s.kind === k)!;
                        const Icon = kindIcon[k];
                        const active = v.kind === k;
                        return (
                          <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => chooseKind(k)}
                            className={cn('group relative isolate h-36 overflow-hidden rounded-2xl text-left text-white ring-2 transition-all duration-300 sm:h-44', active ? 'ring-go-500 shadow-glow-go' : 'ring-transparent hover:-translate-y-0.5 hover:shadow-lift')}
                          >
                            <SmartImage src={img(o.img.src, 600)} alt="" className="absolute inset-0 -z-10" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                            <span aria-hidden className={cn('absolute inset-0 -z-10 transition', active ? 'bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20' : 'bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/40')} />
                            <span className="flex h-full flex-col justify-between p-4">
                              <span className="flex items-center justify-between">
                                <span className={cn('grid size-10 place-items-center rounded-xl backdrop-blur', active ? 'bg-go-500' : 'bg-white/15')}><Icon className="size-5" aria-hidden /></span>
                                <span className={cn('grid size-6 place-items-center rounded-full border-2', active ? 'border-go-500 bg-go-500' : 'border-white/60')}>{active && <Check className="size-3.5" strokeWidth={4} aria-hidden />}</span>
                              </span>
                              <span>
                                <span className="block font-display text-lg font-bold">{o.title}</span>
                                <span className="block text-xs text-white/70">{o.short} · from {naira(o.from)}</span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <h3 className="mt-8 mb-3 font-display text-lg font-semibold text-ink-900">Choose your {v.kind === 'shuttle' ? 'shuttle service' : `${v.kind} tier`}</h3>
                    <div role="radiogroup" aria-label="Service tier" data-field="tierId" className="grid gap-4 sm:grid-cols-2">
                      {tiers.map((t) => {
                        const active = t.id === v.tierId;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => chooseTier(t)}
                            className={cn('group flex flex-col overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-300', active ? 'border-go-500 shadow-[0_12px_32px_-14px_rgb(255_106_19/0.55)]' : 'border-line hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft')}
                          >
                            <span className="relative block h-32">
                              <SmartImage src={img(t.image, 640)} alt={t.imageAlt} className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                              {t.badge && <Badge tone={active ? 'go' : 'ink'} className="absolute top-3 left-3">{t.badge}</Badge>}
                              <span className={cn('absolute top-3 right-3 grid size-7 place-items-center rounded-full border-2 bg-white/90', active ? 'border-go-500 bg-go-500 text-white' : 'border-white')}>{active && <Check className="size-4" strokeWidth={4} aria-hidden />}</span>
                              <span className="absolute bottom-2.5 left-3 rounded-lg bg-white/95 px-2 py-0.5 text-xs font-bold text-ink-900">from {naira(t.minFare)}</span>
                            </span>
                            <span className="flex flex-1 flex-col p-4">
                              <span className="font-display text-base font-semibold text-ink-900">{t.name}</span>
                              <span className="text-[13px] text-text-2">{t.tagline}</span>
                              <span className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-ink-700">
                                <span className="flex items-center gap-1"><Users className="size-3.5 text-brand-600" aria-hidden /> {t.capacityLabel}</span>
                                <span className="flex items-center gap-1"><Clock className="size-3.5 text-brand-600" aria-hidden /> {t.eta}</span>
                              </span>
                              <span className="mt-3 flex flex-wrap gap-1.5">
                                {t.features.slice(0, 2).map((f) => <span key={f} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2">{f}</span>)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.tierId && <p role="alert" className="mt-3 text-sm font-medium text-crit">{errors.tierId}</p>}
                  </div>
                )}

                {/* ---------------- STEP 2: ROUTE ---------------- */}
                {wiz.step === 1 && (
                  <div>
                    <StepHeader index={1} total={STEPS.length} focus={wiz.navigated} icon={<RouteIcon />} title="Where are we going?" subtitle="Pick a city, junction or landmark, then add the exact address so your driver finds you first time." />
                    <FormSection>
                      <LocationPicker name="pickup" label="Pickup point" tone="pickup" value={v.pickup} errors={pickErrors(errors, 'pickup')} onChange={(loc) => update({ pickup: loc }, [...locationKeys('pickup'), 'route'])} />

                      {v.stops.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative mt-6 overflow-hidden rounded-2xl border border-dashed border-line-strong bg-surface-2/40 p-4">
                          <div className="absolute top-3 right-3">
                            <Button size="sm" variant="ghost" onClick={() => removeStop(i)} iconLeft={<Trash2 className="size-4" />} aria-label={`Remove stop ${i + 1}`} className="min-h-11 text-crit hover:bg-crit-bg hover:text-crit">
                              Remove
                            </Button>
                          </div>
                          <LocationPicker name={`stop${i}`} label={`Stop ${i + 1}`} tone="dropoff" compact showSaved={false} value={s} errors={pickErrors(errors, `stop${i}`)} onChange={(loc) => setStop(i, loc)} addressPlaceholder="Where should the driver stop?" />
                        </motion.div>
                      ))}

                      <div className="my-6 flex flex-wrap items-center gap-3">
                        <span aria-hidden className="h-px flex-1 bg-line" />
                        <Button size="sm" variant="outline" onClick={swap} iconLeft={<ArrowUpDown className="size-4" />} className="min-h-11">
                          Swap
                        </Button>
                        <Button size="sm" variant="soft" onClick={addStop} disabled={v.stops.length >= MAX_STOPS} iconLeft={<Plus className="size-4" />} className="min-h-11">
                          Add stop {v.stops.length < MAX_STOPS && <span className="text-xs opacity-70">(+{naira(pricing.ride.multiStopFee)})</span>}
                        </Button>
                        <span aria-hidden className="h-px flex-1 bg-line" />
                      </div>

                      <LocationPicker name="dropoff" label="Destination" tone="dropoff" value={v.dropoff} errors={pickErrors(errors, 'dropoff')} onChange={(loc) => update({ dropoff: loc }, [...locationKeys('dropoff'), 'route'])} />
                      {errors.route && <p role="alert" className="mt-4 rounded-xl bg-crit-bg px-4 py-3 text-sm font-medium text-crit">{errors.route}</p>}
                    </FormSection>

                    {dist && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-ink-900 px-5 py-4 text-sm text-white">
                        <span className="flex items-center gap-2"><RouteIcon className="size-4 text-go-400" aria-hidden /> Approx. <strong>{dist.km} km</strong></span>
                        <span className="flex items-center gap-2"><Clock className="size-4 text-go-400" aria-hidden /> ~<strong>{dist.min} min</strong> in typical traffic</span>
                        {dist.km > pricing.ride.intercityThresholdKm && <Badge tone="go">Intercity rate</Badge>}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ---------------- STEP 3: SCHEDULE ---------------- */}
                {wiz.step === 2 && (
                  <div className="space-y-5">
                    <StepHeader index={2} total={STEPS.length} focus={wiz.navigated} icon={<CalendarDays />} title="When, and who's riding?" subtitle="Ride now or schedule ahead, then tell us about passengers and any return trip." />

                    <FormSection title="Pickup time" icon={<Clock />}>
                      <Segmented
                        label="Pickup timing"
                        value={v.when}
                        onChange={(w) => update(w === 'now' ? { when: w, date: todayISO(), recurring: false } : { when: w }, ['date', 'time'])}
                        options={[{ value: 'now', label: 'Ride now', icon: <Zap className="size-4" aria-hidden /> }, { value: 'later', label: 'Schedule', icon: <CalendarDays className="size-4" aria-hidden /> }]}
                        className="w-full sm:w-auto"
                      />
                      {v.when === 'now' ? (
                        <p className="mt-4 flex items-center gap-2 rounded-xl bg-ok-bg px-4 py-3 text-sm font-medium text-ok">
                          <BadgeCheck className="size-4" aria-hidden /> Pickup today in about {tier?.eta ?? '10–15 min'} once a driver accepts (demo).
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Input label="Travel date" type="date" required min={todayISO()} max={addDays(todayISO(), 60)} {...field('date')} />
                          <Input label="Pickup time" type="time" required step={300} {...field('time')} />
                        </div>
                      )}
                      {sur && (
                        <p className="mt-3 flex items-start gap-2 text-[13px] text-warn">
                          <sur.icon className="mt-0.5 size-4 shrink-0" aria-hidden /> {sur.text}
                        </p>
                      )}
                      {!sur && v.time && v.when === 'later' && (
                        <p className="mt-3 flex items-center gap-2 text-[13px] text-ok"><CloudSun className="size-4" aria-hidden /> Off-peak time — no demand surcharge.</p>
                      )}
                    </FormSection>

                    <FormSection title={v.kind === 'shuttle' ? 'Passengers & fleet' : 'Passengers'} icon={<Users />}>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div data-field="passengers">
                          <p className="mb-1.5 text-sm font-semibold text-text">Number of passengers</p>
                          <Stepper label="passengers" value={v.passengers} min={1} max={multiVehicle(tier) ? tier!.capacity * MAX_VEHICLES : (tier?.capacity ?? 1)} onChange={setPassengers} />
                          <p className="mt-1.5 text-[13px] text-muted">{tier?.capacityLabel}{multiVehicle(tier) && ` per vehicle`}</p>
                          {errors.passengers && <p role="alert" className="mt-1 text-[13px] font-medium text-crit">{errors.passengers}</p>}
                        </div>
                        {multiVehicle(tier) && (
                          <div>
                            <p className="mb-1.5 text-sm font-semibold text-text">Number of vehicles</p>
                            <Stepper label="vehicles" value={v.vehicles} min={Math.max(1, Math.ceil(v.passengers / tier!.capacity))} max={MAX_VEHICLES} onChange={(n) => update({ vehicles: n }, ['passengers'])} />
                            <p className="mt-1.5 text-[13px] text-muted">{pluralize(v.vehicles, 'vehicle')} · {passengerCap(tier, v.vehicles)} seats total</p>
                          </div>
                        )}
                        {v.kind === 'shuttle' && (
                          <Select wrapperClassName="sm:col-span-2" label="Shuttle type" required placeholder="Select a shuttle type" options={shuttleTypes.map((s) => ({ value: s, label: s }))} {...field('shuttleType')} />
                        )}
                      </div>
                    </FormSection>

                    <FormSection title="Trip type" icon={<ArrowRight />}>
                      <Segmented
                        label="Trip type"
                        value={v.tripType}
                        onChange={(t) => update({ tripType: t, returnDate: t === 'return' ? v.returnDate || v.date : '' }, ['returnDate', 'returnTime'])}
                        options={[{ value: 'one-way', label: 'One-way' }, { value: 'return', label: 'Return trip' }]}
                      />
                      {v.tripType === 'return' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Input label="Return date" type="date" required min={v.date || todayISO()} {...field('returnDate')} />
                            <Input label="Return pickup time" type="time" required step={300} {...field('returnTime')} />
                          </div>
                          <p className="mt-3 text-[13px] text-text-2">Return trips are priced at {pricing.ride.returnTripMultiplier}× a single fare — cheaper than two one-way bookings.</p>
                        </motion.div>
                      )}
                    </FormSection>

                    <FormSection title="Recurring booking" icon={<Repeat />} description={v.when === 'now' ? 'Schedule your first trip to make it recurring.' : 'Perfect for school runs, office commutes and weekly market trips.'}>
                      <Toggle checked={v.recurring} onChange={(on) => update({ recurring: on, when: on ? 'later' : v.when, until: on ? v.until || addDays(v.date, 27) : v.until }, ['until'])} label="Repeat this trip" description="We'll book the same route and time on a schedule." />
                      {v.recurring && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
                            <div>
                              <p className="mb-1.5 text-sm font-semibold text-text">Frequency</p>
                              <Segmented label="Frequency" size="sm" value={v.frequency} onChange={(f) => update({ frequency: f }, [])} options={[{ value: 'daily', label: 'Daily' }, { value: 'weekdays', label: 'Weekdays' }, { value: 'weekly', label: 'Weekly' }]} />
                            </div>
                            <Input label="Repeat until" type="date" required min={addDays(v.date, 1)} max={addDays(v.date, 90)} {...field('until')} />
                          </div>
                          {countTrips(v.date, v.until, v.frequency) > 0 && (
                            <p className="mt-3 rounded-xl bg-brand-50 px-4 py-2.5 text-[13px] font-medium text-brand-800">
                              ≈ {pluralize(countTrips(v.date, v.until, v.frequency), 'trip')} between {formatDate(v.date)} and {formatDate(v.until)}. Each trip is billed individually (demo).
                            </p>
                          )}
                        </motion.div>
                      )}
                    </FormSection>

                    <FormSection title="Special instructions" icon={<ClipboardCheck />}>
                      <Textarea label="Notes for your driver" optional placeholder="e.g. Gate code, luggage, child seat, call on arrival…" hint={`${v.instructions.length}/300`} maxLength={300} {...field('instructions')} />
                    </FormSection>
                  </div>
                )}

                {/* ---------------- STEP 4: REVIEW ---------------- */}
                {wiz.step === 3 && (
                  <div className="space-y-4">
                    <StepHeader index={3} total={STEPS.length} focus={wiz.navigated} icon={<ClipboardCheck />} title="Review & confirm" subtitle="Check everything looks right. You can edit any section before confirming." />

                    <ReviewBlock title="Service" icon={<Sparkles />} onEdit={() => wiz.go(0)}>
                      {tier && (
                        <div className="flex items-center gap-4">
                          <SmartImage src={img(tier.image, 240)} alt={tier.imageAlt} className="size-16 shrink-0 rounded-xl" />
                          <div>
                            <p className="font-display font-semibold text-ink-900">{tier.name}</p>
                            <p className="text-sm text-text-2">{tier.tagline} · {tier.capacityLabel} · ETA {tier.eta}</p>
                          </div>
                        </div>
                      )}
                    </ReviewBlock>

                    <ReviewBlock title="Route" icon={<RouteIcon />} onEdit={() => wiz.go(1)}>
                      <RouteTimeline points={routePoints} />
                      {fare && <p className="mt-3 text-[13px] text-muted">~{fare.distanceKm} km · ~{fare.durationMin} min</p>}
                    </ReviewBlock>

                    <ReviewBlock title="Schedule & details" icon={<CalendarDays />} onEdit={() => wiz.go(2)}>
                      <ReviewGrid
                        items={[
                          { label: 'Pickup', value: v.when === 'now' ? `Now · ${formatDate(todayISO())}` : `${formatDate(v.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${formatTime(v.time)}` },
                          { label: 'Passengers', value: `${pluralize(v.passengers, 'passenger')}${multiVehicle(tier) ? ` · ${pluralize(v.vehicles, 'vehicle')}` : ''}` },
                          { label: 'Trip type', value: v.tripType === 'return' ? `Return · ${formatDate(v.returnDate)} at ${formatTime(v.returnTime)}` : 'One-way' },
                          ...(v.kind === 'shuttle' ? [{ label: 'Shuttle type', value: v.shuttleType }] : []),
                          ...(v.recurring ? [{ label: 'Recurring', value: `${v.frequency === 'weekdays' ? 'Weekdays' : v.frequency === 'daily' ? 'Daily' : 'Weekly'} until ${formatDate(v.until)}` }] : []),
                          ...(v.instructions.trim() ? [{ label: 'Instructions', value: v.instructions, wide: true }] : []),
                        ]}
                      />
                    </ReviewBlock>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <FareBreakdown fare={fare} />
                      <div className="space-y-4">
                        <PromoField promo={promo} onChange={setPromo} subtotal={fare?.subtotal ?? 0} />
                        <div className="rounded-2xl border border-line bg-white p-4" data-field="terms">
                          <Checkbox
                            name="terms"
                            checked={v.terms}
                            onChange={(c) => set('terms', c)}
                            label="I agree to the booking terms"
                            description={<>Fares are estimates until confirmed at checkout. Free cancellation within {pricing.cancellation.freeWindowMinutes} minutes; a {naira(pricing.cancellation.lateFee)} late fee may apply after a driver is assigned.</>}
                          />
                          {errors.terms && <p role="alert" className="mt-2 text-[13px] font-medium text-crit">{errors.terms}</p>}
                        </div>
                        <DemoNotice compact />
                      </div>
                    </div>
                  </div>
                )}
              </StepPanel>

              <WizardNav
                onBack={wiz.back}
                isFirst={wiz.isFirst}
                hideNextOnMobile
                loading={busy}
                nextLabel={ctaLabel}
                nextIcon={wiz.isLast ? <ShieldCheck className="size-4" /> : undefined}
              />
            </form>

            {/* Sticky live summary (desktop) */}
            <aside className="hidden lg:block" aria-label="Booking summary">
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-3xl bg-ink-900 text-white shadow-lift">
                  {tier && (
                    <div className="relative h-32">
                      <SmartImage src={img(tier.image, 760)} alt="" className="absolute inset-0" />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
                      <div className="absolute inset-x-5 bottom-3">
                        <p className="text-[11px] font-bold tracking-[0.16em] text-go-300 uppercase">Your ride</p>
                        <p className="font-display text-lg font-bold">{tier.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4 p-5">
                    <RouteTimeline dark points={routePoints} animate={false} />
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5"><CalendarDays className="size-3.5" aria-hidden /> {v.when === 'now' ? 'Now' : `${formatDate(v.date, { day: 'numeric', month: 'short' })} · ${formatTime(v.time)}`}</span>
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5"><Users className="size-3.5" aria-hidden /> {v.passengers}</span>
                      {v.tripType === 'return' && <span className="rounded-lg bg-white/10 px-2.5 py-1.5">Return</span>}
                      {v.recurring && <span className="flex items-center gap-1.5 rounded-lg bg-go-500/20 px-2.5 py-1.5 text-go-200"><Repeat className="size-3.5" aria-hidden /> Recurring</span>}
                    </div>
                  </div>
                </div>
                <FareBreakdown fare={fare} />
                {wiz.step !== 3 && <DemoNotice compact />}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <MobileFareBar
        fare={fare}
        cta={
          <Button type="submit" form="ride-form" size="lg" loading={busy} iconRight={wiz.isLast ? undefined : <ArrowRight className="size-4" />}>
            {wiz.isLast ? 'Confirm' : 'Continue'}
          </Button>
        }
        sheetExtra={<DemoNotice compact />}
      />
    </>
  );
}
