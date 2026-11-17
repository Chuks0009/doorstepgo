import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, Boxes, CalendarClock, Check, ClipboardCheck, Clock, HandCoins, Hand, Mail, MapPin, Package, PackageCheck, Phone, Plus,
  Route as RouteIcon, ShieldCheck, ShoppingBasket, ShoppingCart, Store, Trash2, Truck, User, UserRound, Weight, Zap,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, Checkbox, ChoiceCard, DemoNotice, Icon, Input, ProgressSteps, Segmented, Select, SmartImage, Stepper, Textarea } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { LocationPicker, rememberLocation, type LocationValue } from '@/components/booking/LocationPicker';
import { locationFromParams, locationKeys, locationRules, pickErrors, samePlace } from '@/components/booking/locationRules';
import { PromoField } from '@/components/booking/PromoField';
import { RouteTimeline, type RoutePoint } from '@/components/booking/RouteTimeline';
import { FareAnnouncer, FormSection, MobileFareBar, ReviewBlock, ReviewGrid, StepHeader, StepPanel, WizardNav, useWizard } from '@/components/booking/Wizard';
import { pricing, sizeOptions } from '@/config/pricing';
import { deliveryCategories, findDeliveryCategory, packageCategories } from '@/data/services';
import { img } from '@/data/images';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm, usePageMeta } from '@/hooks';
import { deliveryService } from '@/services/api';
import { estimateDelivery } from '@/services/pricingService';
import { KEYS, storage } from '@/services/storage';
import type { DeliveryUrgency, LocationPoint, MarketTask, PackageSize, PickupMode, PromoCode } from '@/types';
import { addDays, cn, formatDate, formatTime, naira, nowTimePlus, pluralize, todayISO } from '@/utils';
import { email, hasErrors, max, maxLen, min, minLen, notPastDate, phone, required, validate, when, type Schema } from '@/utils/validation';

/* ---------- Model ---------- */
type Drop = { loc: LocationValue; name: string; phone: string };
type DeliveryValues = {
  categoryId: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  pickup: LocationValue;
  recipientName: string;
  recipientPhone: string;
  dropoff: LocationValue;
  extraDrops: Drop[];
  packageDescription: string;
  packageCategory: string;
  size: PackageSize;
  weightKg: number | '';
  packages: number;
  pickupMode: PickupMode;
  date: string;
  time: string;
  urgency: DeliveryUrgency;
  handling: string[];
  instructions: string;
  marketName: string;
  sellerName: string;
  sellerPhone: string;
  stallLocation: string;
  itemsList: string;
  budget: number | '';
  task: MarketTask;
  marketAck: boolean;
  terms: boolean;
};

type StepId = 'type' | 'pickup' | 'market' | 'dropoff' | 'package' | 'timing' | 'review';
const STEP_LABEL: Record<StepId, string> = { type: 'Delivery type', pickup: 'Pickup', market: 'Market task', dropoff: 'Drop-off', package: 'Package', timing: 'Timing', review: 'Review' };
const MAX_DROPS = 4;

const marketTasks: { id: MarketTask; title: string; description: string; Icon: typeof Package }[] = [
  { id: 'already_purchased', title: 'Goods already purchased', description: 'You have paid the seller — we simply collect and deliver.', Icon: PackageCheck },
  { id: 'collect_from_seller', title: 'Rider collects from seller', description: 'Seller hands over the goods at their stall or shop.', Icon: Store },
  { id: 'purchase_items', title: 'Rider purchases specified items', description: 'We shop your list (cost of goods arranged separately).', Icon: ShoppingCart },
  { id: 'assist_collection', title: 'Help me with market collection', description: 'A rider assists you with collection, carrying and loading.', Icon: Hand },
];

const urgencyIcon: Record<DeliveryUrgency, typeof Zap> = { standard: Truck, express: Zap, same_day: Clock, scheduled: CalendarClock };
const sizeScale: Record<PackageSize, string> = { envelope: 'size-5', small: 'size-6', medium: 'size-7', large: 'size-8', xl: 'size-9' };

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const toPoint = (l: LocationValue): LocationPoint => ({ cityId: l.cityId!, areaId: l.areaId, junctionId: l.junctionId!, address: (l.address ?? '').trim() });
const isMarketCat = (id: string) => id === 'market-pickup';
const scheduled = (a: Record<string, unknown>) => a.pickupMode === 'scheduled' || a.urgency === 'scheduled';
const drops = (a: Record<string, unknown>) => (a.extraDrops as Drop[]) ?? [];

/* ---------- Schema ---------- */
const schema: Schema = {
  categoryId: [required('Choose what kind of delivery this is')],
  senderName: [required('Enter the sender’s full name'), minLen(2)],
  senderPhone: [required('Enter a phone number we can reach'), phone()],
  senderEmail: [email()],
  ...locationRules('pickup', (a) => a.pickup as LocationValue, 'pickup'),
  marketName: [when((a) => isMarketCat(String(a.categoryId)), [required('Enter the market name'), minLen(2)])],
  sellerPhone: [phone()],
  itemsList: [when((a) => isMarketCat(String(a.categoryId)) && a.task === 'purchase_items', [required('List the items the rider should buy'), minLen(5, 'Add a little more detail so the rider buys the right items')])],
  budget: [min(0, 'Budget cannot be negative')],
  marketAck: [when((a) => isMarketCat(String(a.categoryId)), [(v) => (v ? undefined : 'Please confirm you understand how goods are paid for')])],
  recipientName: [required('Enter the recipient’s full name'), minLen(2)],
  recipientPhone: [required('Enter the recipient’s phone number'), phone()],
  ...locationRules('dropoff', (a) => a.dropoff as LocationValue, 'drop-off'),
  route: [(_, all) => (samePlace(all.pickup as LocationValue, all.dropoff as LocationValue) ? 'Pickup and drop-off look identical — please check the addresses.' : undefined)],
  ...Object.assign(
    {},
    ...Array.from({ length: MAX_DROPS }, (_, i) => ({
      ...locationRules(`drop${i}`, (a) => drops(a)[i]?.loc, `drop-off ${i + 2}`),
      [`drop${i}Name`]: [(_v: unknown, a: Record<string, unknown>) => (drops(a)[i] && (drops(a)[i].name ?? '').trim().length < 2 ? 'Enter the recipient’s name' : undefined)],
      [`drop${i}Phone`]: [(_v: unknown, a: Record<string, unknown>) => {
        const d = drops(a)[i];
        if (!d) return undefined;
        if (!d.phone.trim()) return 'Enter the recipient’s phone';
        return phone()(d.phone, a);
      }],
    })),
  ),
  packageDescription: [required('Describe what we are delivering'), minLen(3), maxLen(160)],
  packageCategory: [required('Choose a package category')],
  size: [required('Choose a package size')],
  weightKg: [required('Enter an estimated weight'), min(0.1, 'Weight must be more than 0 kg'), max(200, 'For loads over 200 kg, request a quote')],
  packages: [min(1), max(50, 'For more than 50 packages, request a business quote')],
  date: [when(scheduled, [required('Choose a pickup date'), notPastDate()])],
  time: [when(scheduled, [required('Choose a pickup time'), (v, a) => (a.date === todayISO() && String(v) < nowHHMM() ? 'That time has already passed' : undefined)])],
  instructions: [maxLen(300)],
  terms: [(v) => (v ? undefined : 'Please accept the delivery terms to continue')],
};

function fieldsFor(id: StepId, nDrops: number): string[] {
  switch (id) {
    case 'type': return ['categoryId'];
    case 'pickup': return ['senderName', 'senderPhone', 'senderEmail', ...locationKeys('pickup')];
    case 'market': return ['marketName', 'sellerPhone', 'itemsList', 'budget', 'marketAck'];
    case 'dropoff': return ['recipientName', 'recipientPhone', ...locationKeys('dropoff'), 'route', ...Array.from({ length: nDrops }, (_, i) => [...locationKeys(`drop${i}`), `drop${i}Name`, `drop${i}Phone`]).flat()];
    case 'package': return ['packageDescription', 'packageCategory', 'size', 'weightKg', 'packages', 'instructions'];
    case 'timing': return ['date', 'time'];
    default: return ['terms'];
  }
}

/** Category → sensible defaults for package type & urgency. */
function categoryDefaults(id: string): Partial<DeliveryValues> {
  const map: Record<string, Partial<DeliveryValues>> = {
    'market-pickup': { packageCategory: 'Market goods', size: 'medium' },
    'food-grocery': { packageCategory: 'Food & groceries', size: 'medium', handling: ['upright'] },
    document: { packageCategory: 'Documents', size: 'envelope', weightKg: 0.5 },
    'small-package': { size: 'small' },
    business: { size: 'large' },
    merchant: { size: 'small' },
    express: { urgency: 'express', pickupMode: 'immediate' },
    'same-day': { urgency: 'same_day' },
    scheduled: { urgency: 'scheduled', pickupMode: 'scheduled' },
  };
  return map[id] ?? {};
}

/* =====================================================================
   PAGE
   ===================================================================== */
export default function DeliveryBookingPage() {
  usePageMeta('Send a delivery', 'Book parcel, document, grocery, business and market-pickup deliveries with live itemised pricing and multiple drop-offs.');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const init = useMemo(() => {
    const cat = findDeliveryCategory(params.get('category') ?? undefined);
    const sizeP = params.get('size') as PackageSize | null;
    const urgRaw = (params.get('urgency') ?? '').replace('-', '_') as DeliveryUrgency;
    const base: DeliveryValues = {
      categoryId: cat?.id ?? '',
      senderName: user?.name ?? '',
      senderPhone: user?.phone ?? '',
      senderEmail: user?.email ?? '',
      pickup: locationFromParams(params.get('pickupCity'), params.get('pickupJunction')),
      recipientName: '',
      recipientPhone: '',
      dropoff: locationFromParams(params.get('dropoffCity'), params.get('dropoffJunction')),
      extraDrops: [],
      packageDescription: '',
      packageCategory: '',
      size: 'small',
      weightKg: 2,
      packages: 1,
      pickupMode: 'immediate',
      date: todayISO(),
      time: nowTimePlus(45),
      urgency: 'standard',
      handling: [],
      instructions: '',
      marketName: '',
      sellerName: '',
      sellerPhone: '',
      stallLocation: '',
      itemsList: '',
      budget: '',
      task: 'already_purchased',
      marketAck: false,
      terms: false,
      ...(cat ? categoryDefaults(cat.id) : {}),
    };
    if (sizeP && sizeOptions.some((s) => s.id === sizeP)) base.size = sizeP;
    if (urgRaw && urgRaw in pricing.delivery.urgency) {
      base.urgency = urgRaw;
      if (urgRaw === 'scheduled') base.pickupMode = 'scheduled';
    }
    return { values: base, start: cat ? 1 : 0 };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { values: v, errors, set, patch, field, check, setErrors } = useForm<DeliveryValues>(init.values, schema);
  const isMarket = isMarketCat(v.categoryId);
  const stepIds: StepId[] = isMarket ? ['type', 'pickup', 'market', 'dropoff', 'package', 'timing', 'review'] : ['type', 'pickup', 'dropoff', 'package', 'timing', 'review'];
  const topRef = useRef<HTMLDivElement>(null);
  const wiz = useWizard(stepIds.length, topRef, init.start);
  const current = stepIds[wiz.step] ?? 'type';
  const goTo = (id: StepId) => wiz.go(stepIds.indexOf(id));
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [busy, setBusy] = useState(false);

  const cat = findDeliveryCategory(v.categoryId);
  const validDrops = v.extraDrops.filter((d) => d.loc.cityId);
  const fare = useMemo(
    () => estimateDelivery({ pickup: v.pickup, dropoff: v.dropoff, size: v.size, weightKg: Number(v.weightKg) || 0, packages: v.packages, urgency: v.urgency, handling: v.handling, market: isMarket ? { task: v.task } : null, extraDrops: validDrops.length, promo }),
    [v.pickup, v.dropoff, v.size, v.weightKg, v.packages, v.urgency, v.handling, isMarket, v.task, validDrops.length, promo],
  );
  const sizeInfo = sizeOptions.find((s) => s.id === v.size)!;
  const overweight = Number(v.weightKg) > sizeInfo.maxKg;

  const update = (p: Partial<DeliveryValues>, keys: string[]) => {
    const next = { ...v, ...p };
    patch(p);
    const live = keys.filter((k) => errors[k]);
    if (live.length) setErrors((e) => ({ ...e, ...Object.fromEntries(live.map((k) => [k, undefined])), ...validate(next, schema, live) }));
  };

  const chooseCategory = (id: string) => update({ categoryId: id, ...categoryDefaults(id) }, ['categoryId']);
  const addDrop = () => v.extraDrops.length < MAX_DROPS && patch({ extraDrops: [...v.extraDrops, { loc: { cityId: v.dropoff.cityId }, name: '', phone: '' }] });
  const setDrop = (i: number, d: Partial<Drop>) => update({ extraDrops: v.extraDrops.map((x, j) => (j === i ? { ...x, ...d } : x)) }, [...locationKeys(`drop${i}`), `drop${i}Name`, `drop${i}Phone`]);
  const removeDrop = (i: number) => {
    setErrors((e) => {
      const n = { ...e };
      for (let j = 0; j < MAX_DROPS; j++) [...locationKeys(`drop${j}`), `drop${j}Name`, `drop${j}Phone`].forEach((k) => delete n[k]);
      return n;
    });
    patch({ extraDrops: v.extraDrops.filter((_, j) => j !== i) });
  };
  const toggleHandling = (id: string, on: boolean) => patch({ handling: on ? [...v.handling, id] : v.handling.filter((h) => h !== id) });
  const iAmRecipient = () => update({ recipientName: v.senderName, recipientPhone: v.senderPhone }, ['recipientName', 'recipientPhone']);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!check(fieldsFor(current, v.extraDrops.length))) return;
    if (!wiz.isLast) {
      wiz.next();
      return;
    }
    for (const id of stepIds.slice(0, -1)) {
      const errs = validate(v, schema, fieldsFor(id, v.extraDrops.length));
      if (hasErrors(errs)) {
        setErrors((p) => ({ ...p, ...errs }));
        goTo(id);
        toast({ title: 'A few details need attention', body: `Please review “${STEP_LABEL[id]}”.`, tone: 'error' });
        return;
      }
    }
    if (!fare) return;
    setBusy(true);
    try {
      const sched = v.pickupMode === 'scheduled' || v.urgency === 'scheduled';
      const d = await deliveryService.create({
        categoryId: v.categoryId,
        sender: { name: v.senderName.trim(), phone: v.senderPhone.trim(), email: v.senderEmail.trim() || undefined },
        recipient: { name: v.recipientName.trim(), phone: v.recipientPhone.trim() },
        pickup: toPoint(v.pickup),
        dropoff: toPoint(v.dropoff),
        extraDropoffs: validDrops.length ? validDrops.map((x) => ({ ...toPoint(x.loc), recipient: { name: x.name.trim(), phone: x.phone.trim() } })) : undefined,
        packageDescription: v.packageDescription.trim(),
        packageCategory: v.packageCategory,
        packageSize: v.size,
        weightKg: Number(v.weightKg) || 0,
        packages: v.packages,
        pickupMode: sched ? 'scheduled' : 'immediate',
        date: sched ? v.date : todayISO(),
        time: sched ? v.time : nowTimePlus(15),
        urgency: v.urgency,
        handling: v.handling,
        instructions: v.instructions.trim() || undefined,
        market: isMarket
          ? { marketName: v.marketName.trim(), sellerName: v.sellerName.trim() || undefined, sellerPhone: v.sellerPhone.trim() || undefined, stallLocation: v.stallLocation.trim() || undefined, task: v.task, itemsList: v.itemsList.trim() || undefined, budget: v.budget === '' ? undefined : Number(v.budget) }
          : undefined,
        fare,
      });
      rememberLocation(v.pickup);
      rememberLocation(v.dropoff);
      if (promo) storage.set(KEYS.draft(`checkout:${d.reference}`), { promoCode: promo.code });
      toast({ title: 'Delivery booked', body: `Reference ${d.reference}. Delivery code ${d.deliveryCode} — share it with your recipient.` });
      navigate(`/checkout/${d.reference}`);
    } catch {
      toast({ title: 'Something went wrong', body: 'Your delivery could not be created. Please try again.', tone: 'error' });
      setBusy(false);
    }
  };

  const routePoints: RoutePoint[] = [
    { kind: 'pickup', title: isMarket ? 'Market pickup' : 'Pickup', loc: v.pickup, note: isMarket && v.marketName ? v.marketName : undefined },
    { kind: v.extraDrops.length ? 'stop' : 'dropoff', title: v.extraDrops.length ? 'Drop-off 1' : 'Drop-off', loc: v.dropoff, note: v.recipientName ? `For ${v.recipientName}` : undefined },
    ...v.extraDrops.map((d, i) => ({ kind: (i === v.extraDrops.length - 1 ? 'dropoff' : 'stop') as RoutePoint['kind'], title: `Drop-off ${i + 2}`, loc: d.loc, note: d.name ? `For ${d.name}` : undefined })),
  ];
  const urgencyInfo = pricing.delivery.urgency[v.urgency];
  const total = stepIds.length;

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Delivery', to: '/services/delivery' }, { label: 'Send a delivery' }]}
        eyebrow={<><Package className="size-3.5" aria-hidden /> Delivery booking</>}
        title={<>Send it. <span className="text-gradient-go">We’ll Go.</span></>}
        subtitle="Parcels, documents, groceries, business drops and market pickups — collected and delivered with a secure delivery code."
        aside={
          <div className="glass-dark rounded-3xl p-5">
            <p className="text-xs font-bold tracking-[0.16em] text-go-300 uppercase">How it works</p>
            <ol className="mt-3 space-y-3 text-sm">
              {['Tell us what, where & when', 'See your itemised estimate', 'Pay (simulated) and track live', 'Recipient confirms with a code'].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-go-500 text-xs font-bold">{i + 1}</span>
                  <span className="text-white/85">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        }
      />

      <section className="relative bg-canvas pb-32 lg:pb-24">
        <div className="container-x">
          <div ref={topRef} className="relative z-10 -mt-8 rounded-3xl border border-line bg-white p-4 shadow-lift sm:p-6">
            <ProgressSteps steps={stepIds.map((s) => STEP_LABEL[s])} current={wiz.step} onStepClick={(i) => wiz.go(i)} />
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <form id="delivery-form" noValidate onSubmit={onSubmit} className="min-w-0">
              <FareAnnouncer fare={fare} />
              <StepPanel stepKey={current} dir={wiz.dir}>
                {/* ---------- TYPE ---------- */}
                {current === 'type' && (
                  <div>
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<Boxes />} title="What are we delivering?" subtitle="Pick the service that fits best — you can fine-tune size, urgency and handling later." />
                    <div role="radiogroup" aria-label="Delivery type" data-field="categoryId" className="grid gap-3 sm:grid-cols-2">
                      {deliveryCategories.map((c) => {
                        const active = c.id === v.categoryId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => chooseCategory(c.id)}
                            className={cn('group flex items-stretch gap-0 overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-300', active ? 'border-go-500 shadow-[0_12px_32px_-14px_rgb(255_106_19/0.55)]' : 'border-line hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft', c.highlight && !active && 'border-go-200')}
                          >
                            <span className="relative w-24 shrink-0 sm:w-28">
                              <SmartImage src={img(c.image, 320)} alt="" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-110" />
                              <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                              <span className={cn('absolute top-2 left-2 grid size-8 place-items-center rounded-lg text-white', active ? 'bg-go-500' : 'bg-ink-900/80')}><Icon name={c.icon} className="size-4" /></span>
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col justify-center p-3.5">
                              <span className="flex items-center gap-2">
                                <span className="font-semibold text-ink-900">{c.name}</span>
                                {c.highlight && <Badge tone="go">Popular</Badge>}
                              </span>
                              <span className="text-[13px] leading-snug text-text-2">{c.short}</span>
                              <span className="mt-1.5 text-xs font-semibold text-ink-700">from {naira(c.fromPrice)} · {c.eta}</span>
                            </span>
                            <span className={cn('m-3 mt-3.5 grid size-5 shrink-0 place-items-center rounded-full border-2', active ? 'border-go-500 bg-go-500' : 'border-line-strong')}>{active && <Check className="size-3 text-white" strokeWidth={4} aria-hidden />}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.categoryId && <p role="alert" className="mt-3 text-sm font-medium text-crit">{errors.categoryId}</p>}
                  </div>
                )}

                {/* ---------- PICKUP ---------- */}
                {current === 'pickup' && (
                  <div className="space-y-5">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<UserRound />} title={isMarket ? 'Your details & the market' : 'Who’s sending, and from where?'} subtitle={isMarket ? 'Tell us how to reach you and which market the rider should go to.' : 'We’ll keep the sender updated at every stage.'} />
                    <FormSection title="Sender" icon={<User />} description={user ? 'Prefilled from your account — edit if someone else is sending.' : undefined}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Full name" required autoComplete="name" icon={<User />} {...field('senderName')} />
                        <Input label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" icon={<Phone />} placeholder="0803 123 4567" {...field('senderPhone')} />
                        <Input wrapperClassName="sm:col-span-2" label="Email" optional type="email" autoComplete="email" icon={<Mail />} placeholder="For your receipt and updates" {...field('senderEmail')} />
                      </div>
                    </FormSection>
                    <FormSection>
                      <LocationPicker
                        name="pickup"
                        label={isMarket ? 'Market location' : 'Pickup location'}
                        tone="pickup"
                        value={v.pickup}
                        errors={pickErrors(errors, 'pickup')}
                        addressPlaceholder={isMarket ? 'Market name, line/section and nearest gate' : undefined}
                        onChange={(loc) => update({ pickup: loc }, [...locationKeys('pickup'), 'route'])}
                      />
                    </FormSection>
                  </div>
                )}

                {/* ---------- MARKET ---------- */}
                {current === 'market' && (
                  <div className="space-y-5">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<ShoppingBasket />} title="Market pickup details" subtitle="Tell the rider who to meet, where to find them and what to do." />

                    <div role="note" className="relative overflow-hidden rounded-3xl bg-ink-900 p-5 text-white sm:p-6">
                      <span aria-hidden className="absolute -top-16 -right-10 size-48 rounded-full bg-go-500/30 blur-3xl" />
                      <div className="relative flex gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-go-500"><HandCoins className="size-5" aria-hidden /></span>
                        <div>
                          <p className="font-display text-lg font-bold">Delivery fee ≠ cost of goods</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/75">
                            Your DoorstepGo fee covers the pickup, any purchase assistance and delivery only. <strong className="text-white">Purchases and payment to sellers may require separate arrangements</strong> — pay the seller directly or agree the arrangement with our support team before the rider buys anything.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormSection title="Market & seller" icon={<Store />}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input wrapperClassName="sm:col-span-2" label="Market name" required placeholder="e.g. Eke Awka Market, Ifite Second Market" {...field('marketName')} />
                        <Input label="Seller’s name" optional placeholder="Who should the rider meet?" {...field('sellerName')} />
                        <Input label="Seller’s phone" optional type="tel" inputMode="tel" icon={<Phone />} {...field('sellerPhone')} />
                        <Input wrapperClassName="sm:col-span-2" label="Stall / shop or collection point" optional placeholder="e.g. Line 4, Shop 12 — opposite the mosque gate" {...field('stallLocation')} />
                      </div>
                    </FormSection>

                    <FormSection title="What should the rider do?" icon={<ClipboardCheck />}>
                      <div role="radiogroup" aria-label="Market task" className="grid gap-3 sm:grid-cols-2">
                        {marketTasks.map((t) => (
                          <ChoiceCard key={t.id} selected={v.task === t.id} onSelect={() => update({ task: t.id }, ['itemsList'])} title={t.title} description={t.description} icon={<t.Icon />} meta={t.id === 'purchase_items' || t.id === 'assist_collection' ? `+${naira(pricing.delivery.marketPurchaseAssistFee)} assistance` : undefined} />
                        ))}
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_200px]">
                        <Textarea
                          label={v.task === 'purchase_items' ? 'Items to buy' : 'Goods description / items list'}
                          required={v.task === 'purchase_items'}
                          optional={v.task !== 'purchase_items'}
                          placeholder={'e.g.\n• 1 bag of rice (50kg, Mama Gold)\n• 2 baskets of tomatoes\n• 5 litres groundnut oil'}
                          {...field('itemsList')}
                        />
                        <Input label="Budget for goods (₦)" optional type="number" inputMode="numeric" min={0} step={500} placeholder="e.g. 45000" hint="Helps the rider shop within your limit" {...field('budget')} />
                      </div>
                    </FormSection>

                    <div className={cn('rounded-2xl border-2 p-4', errors.marketAck ? 'border-crit bg-crit-bg/40' : 'border-go-200 bg-go-50/60')} data-field="marketAck">
                      <Checkbox name="marketAck" checked={v.marketAck} onChange={(c) => set('marketAck', c)} label="I understand the delivery fee does not include the cost of goods" description="Payment to sellers is arranged separately from this booking (demo)." />
                      {errors.marketAck && <p role="alert" className="mt-2 text-[13px] font-medium text-crit">{errors.marketAck}</p>}
                    </div>
                  </div>
                )}

                {/* ---------- DROP-OFF ---------- */}
                {current === 'dropoff' && (
                  <div className="space-y-5">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<MapPin />} title="Where should it go?" subtitle="Add the recipient and drop-off. Sending to several places? Add extra drop-offs." />
                    <FormSection title="Recipient" icon={<UserRound />} action={<Button size="sm" variant="ghost" onClick={iAmRecipient} className="min-h-11">I’m the recipient</Button>}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Recipient full name" required icon={<User />} {...field('recipientName')} />
                        <Input label="Recipient phone" required type="tel" inputMode="tel" icon={<Phone />} hint="They’ll receive the delivery code (demo)" {...field('recipientPhone')} />
                      </div>
                    </FormSection>
                    <FormSection>
                      <LocationPicker name="dropoff" label="Drop-off location" tone="dropoff" value={v.dropoff} errors={pickErrors(errors, 'dropoff')} onChange={(loc) => update({ dropoff: loc }, [...locationKeys('dropoff'), 'route'])} />
                      {errors.route && <p role="alert" className="mt-4 rounded-xl bg-crit-bg px-4 py-3 text-sm font-medium text-crit">{errors.route}</p>}
                    </FormSection>

                    {v.extraDrops.map((d, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <FormSection
                          tone="brand"
                          title={`Drop-off ${i + 2}`}
                          icon={<Truck />}
                          action={<Button size="sm" variant="ghost" onClick={() => removeDrop(i)} iconLeft={<Trash2 className="size-4" />} className="min-h-11 text-crit hover:bg-crit-bg hover:text-crit" aria-label={`Remove drop-off ${i + 2}`}>Remove</Button>}
                        >
                          <div className="mb-5 grid gap-4 sm:grid-cols-2">
                            <Input label="Recipient name" required name={`drop${i}Name`} value={d.name} error={errors[`drop${i}Name`]} onChange={(e) => setDrop(i, { name: e.target.value })} />
                            <Input label="Recipient phone" required type="tel" inputMode="tel" name={`drop${i}Phone`} value={d.phone} error={errors[`drop${i}Phone`]} onChange={(e) => setDrop(i, { phone: e.target.value })} />
                          </div>
                          <LocationPicker name={`drop${i}`} label="Location" tone="dropoff" compact showSaved={false} value={d.loc} errors={pickErrors(errors, `drop${i}`)} onChange={(loc) => setDrop(i, { loc })} />
                        </FormSection>
                      </motion.div>
                    ))}

                    <button type="button" onClick={addDrop} disabled={v.extraDrops.length >= MAX_DROPS} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 text-sm font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50">
                      <Plus className="size-4" aria-hidden />
                      {v.extraDrops.length >= MAX_DROPS ? `Maximum ${MAX_DROPS} extra drop-offs — request a quote for bulk routes` : `Add another drop-off (+${naira(pricing.delivery.extraDropFee)} each)`}
                    </button>
                  </div>
                )}

                {/* ---------- PACKAGE ---------- */}
                {current === 'package' && (
                  <div className="space-y-5">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<Package />} title="Tell us about the package" subtitle="Accurate details help us send the right rider and vehicle." />
                    <FormSection title="Contents" icon={<Boxes />}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input wrapperClassName="sm:col-span-2" label="Package description" required placeholder="e.g. Sealed box with 2 pairs of shoes" maxLength={160} {...field('packageDescription')} />
                        <Select label="Package category" required placeholder="Select a category" options={packageCategories.map((c) => ({ value: c, label: c }))} {...field('packageCategory')} />
                        <div>
                          <p className="mb-1.5 text-sm font-semibold text-text">Number of packages</p>
                          <Stepper label="packages" value={v.packages} min={1} max={50} onChange={(n) => update({ packages: n }, ['packages'])} />
                          {errors.packages && <p role="alert" className="mt-1 text-[13px] font-medium text-crit">{errors.packages}</p>}
                        </div>
                      </div>
                    </FormSection>

                    <FormSection title="Size & weight" icon={<Weight />}>
                      <div role="radiogroup" aria-label="Package size" data-field="size" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {sizeOptions.map((s) => {
                          const active = s.id === v.size;
                          const I = s.id === 'envelope' ? Mail : Package;
                          return (
                            <button key={s.id} type="button" role="radio" aria-checked={active} onClick={() => update({ size: s.id }, ['size'])} className={cn('flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all', active ? 'border-go-500 bg-go-50/60 shadow-soft' : 'border-line bg-white hover:border-brand-300')}>
                              <span className={cn('grid size-14 place-items-center rounded-xl transition', active ? 'bg-go-500 text-white' : 'bg-brand-50 text-brand-700')}><I className={sizeScale[s.id]} aria-hidden /></span>
                              <span className="text-sm font-semibold text-ink-900">{s.label}</span>
                              <span className="text-[11px] leading-tight text-muted">{s.hint}</span>
                              <span className="text-[11px] font-bold text-ink-700">up to {s.maxKg} kg</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Input label="Estimated weight (kg)" required type="number" inputMode="decimal" min={0.1} step={0.5} icon={<Weight />} hint={`First ${pricing.delivery.freeWeightKg} kg included · ${naira(pricing.delivery.perExtraKg)}/kg after`} {...field('weightKg')} />
                        {overweight && (
                          <p role="status" className="flex items-start gap-2 self-end rounded-xl bg-warn-bg px-3 py-2.5 text-[13px] text-warn">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> That’s heavy for “{sizeInfo.label}”. Consider a larger size so we send the right vehicle.
                          </p>
                        )}
                      </div>
                    </FormSection>

                    <FormSection title="Special handling" icon={<ShieldCheck />} description="Optional add-ons — each is itemised in your estimate.">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(pricing.delivery.handling).map(([id, h]) => (
                          <div key={id} className={cn('rounded-xl border px-3 py-2 transition', v.handling.includes(id) ? 'border-go-300 bg-go-50/50' : 'border-line')}>
                            <Checkbox checked={v.handling.includes(id)} onChange={(c) => toggleHandling(id, c)} label={h.label} description={`+${naira(h.fee)}`} />
                          </div>
                        ))}
                      </div>
                      <Textarea wrapperClassName="mt-5" label="Instructions for the rider" optional maxLength={300} placeholder="e.g. Call the gateman on arrival, leave with reception…" hint={`${v.instructions.length}/300`} {...field('instructions')} />
                    </FormSection>
                  </div>
                )}

                {/* ---------- TIMING ---------- */}
                {current === 'timing' && (
                  <div className="space-y-5">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<Clock />} title="When should we pick it up?" subtitle="Go now, or choose a pickup slot — then pick how fast it should arrive." />
                    <FormSection title="Pickup" icon={<CalendarClock />}>
                      <Segmented
                        label="Pickup mode"
                        value={v.pickupMode}
                        onChange={(m) => update({ pickupMode: m, urgency: m === 'immediate' && v.urgency === 'scheduled' ? 'standard' : v.urgency }, ['date', 'time'])}
                        options={[{ value: 'immediate', label: 'Immediate', icon: <Zap className="size-4" aria-hidden /> }, { value: 'scheduled', label: 'Scheduled', icon: <CalendarClock className="size-4" aria-hidden /> }]}
                      />
                      {v.pickupMode === 'immediate' && v.urgency !== 'scheduled' ? (
                        <p className="mt-4 rounded-xl bg-ok-bg px-4 py-3 text-sm font-medium text-ok">A rider heads to the pickup as soon as you confirm (demo dispatch).</p>
                      ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Input label="Pickup date" type="date" required min={todayISO()} max={addDays(todayISO(), 30)} {...field('date')} />
                          <Input label="Pickup time" type="time" required step={900} {...field('time')} />
                        </div>
                      )}
                    </FormSection>
                    <FormSection title="Delivery speed" icon={<Zap />}>
                      <div role="radiogroup" aria-label="Delivery urgency" className="grid gap-3 sm:grid-cols-2">
                        {(Object.keys(pricing.delivery.urgency) as DeliveryUrgency[]).map((u) => {
                          const info = pricing.delivery.urgency[u];
                          const UI = urgencyIcon[u];
                          const pct = Math.round((info.multiplier - 1) * 100);
                          return (
                            <ChoiceCard
                              key={u}
                              selected={v.urgency === u}
                              onSelect={() => update({ urgency: u, pickupMode: u === 'scheduled' ? 'scheduled' : v.pickupMode }, ['date', 'time'])}
                              icon={<UI />}
                              title={info.label}
                              description={`ETA ${info.eta}`}
                              badge={pct !== 0 ? <Badge tone={pct > 0 ? 'go' : 'ok'}>{pct > 0 ? `+${pct}%` : `${pct}%`}</Badge> : <Badge tone="neutral">Base</Badge>}
                            />
                          );
                        })}
                      </div>
                      {v.urgency === 'same_day' && <p className="mt-3 text-[13px] text-text-2">Same-day is guaranteed for bookings made before 2 PM within the same city.</p>}
                    </FormSection>
                  </div>
                )}

                {/* ---------- REVIEW ---------- */}
                {current === 'review' && (
                  <div className="space-y-4">
                    <StepHeader index={wiz.step} total={total} focus={wiz.navigated} icon={<ClipboardCheck />} title="Review & confirm" subtitle="Make sure everything is right — edit any section before confirming." />
                    <ReviewBlock title="Delivery type" icon={<Boxes />} onEdit={() => goTo('type')}>
                      <p className="font-semibold text-ink-900">{cat?.name}</p>
                      <p className="text-sm text-text-2">{cat?.short}</p>
                    </ReviewBlock>
                    <ReviewBlock title="Sender & pickup" icon={<UserRound />} onEdit={() => goTo('pickup')}>
                      <ReviewGrid items={[{ label: 'Sender', value: v.senderName }, { label: 'Phone', value: v.senderPhone }, ...(v.senderEmail ? [{ label: 'Email', value: v.senderEmail }] : [])]} />
                    </ReviewBlock>
                    {isMarket && (
                      <ReviewBlock title="Market task" icon={<ShoppingBasket />} onEdit={() => goTo('market')}>
                        <ReviewGrid
                          items={[
                            { label: 'Market', value: v.marketName },
                            { label: 'Task', value: marketTasks.find((t) => t.id === v.task)?.title },
                            ...(v.sellerName || v.sellerPhone ? [{ label: 'Seller', value: [v.sellerName, v.sellerPhone].filter(Boolean).join(' · ') }] : []),
                            ...(v.stallLocation ? [{ label: 'Stall / collection point', value: v.stallLocation }] : []),
                            ...(v.budget !== '' ? [{ label: 'Goods budget', value: `${naira(Number(v.budget))} (paid separately)` }] : []),
                            ...(v.itemsList ? [{ label: 'Items', value: <span className="whitespace-pre-line">{v.itemsList}</span>, wide: true }] : []),
                          ]}
                        />
                      </ReviewBlock>
                    )}
                    <ReviewBlock title="Route & recipients" icon={<RouteIcon />} onEdit={() => goTo('dropoff')}>
                      <RouteTimeline points={routePoints} />
                    </ReviewBlock>
                    <ReviewBlock title="Package" icon={<Package />} onEdit={() => goTo('package')}>
                      <ReviewGrid
                        items={[
                          { label: 'Description', value: v.packageDescription, wide: true },
                          { label: 'Category', value: v.packageCategory },
                          { label: 'Size & weight', value: `${sizeInfo.label} · ${v.weightKg || 0} kg` },
                          { label: 'Packages', value: pluralize(v.packages, 'package') },
                          { label: 'Handling', value: v.handling.length ? v.handling.map((h) => pricing.delivery.handling[h]?.label).join(', ') : 'None' },
                          ...(v.instructions ? [{ label: 'Instructions', value: v.instructions, wide: true }] : []),
                        ]}
                      />
                    </ReviewBlock>
                    <ReviewBlock title="Timing" icon={<Clock />} onEdit={() => goTo('timing')}>
                      <ReviewGrid
                        items={[
                          { label: 'Pickup', value: v.pickupMode === 'scheduled' || v.urgency === 'scheduled' ? `${formatDate(v.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(v.time)}` : 'Immediately' },
                          { label: 'Speed', value: `${urgencyInfo.label} · ETA ${urgencyInfo.eta}` },
                        ]}
                      />
                    </ReviewBlock>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <FareBreakdown fare={fare} />
                      <div className="space-y-4">
                        <PromoField promo={promo} onChange={setPromo} subtotal={fare?.subtotal ?? 0} />
                        <div className="rounded-2xl border border-line bg-white p-4" data-field="terms">
                          <Checkbox name="terms" checked={v.terms} onChange={(c) => set('terms', c)} label="I agree to the delivery terms" description="I confirm the package contains no prohibited, illegal or dangerous items. Fares are estimates until confirmed at checkout." />
                          {errors.terms && <p role="alert" className="mt-2 text-[13px] font-medium text-crit">{errors.terms}</p>}
                        </div>
                        <DemoNotice compact />
                      </div>
                    </div>
                  </div>
                )}
              </StepPanel>

              <WizardNav onBack={wiz.back} isFirst={wiz.isFirst} hideNextOnMobile loading={busy} nextLabel={wiz.isLast ? 'Confirm delivery' : 'Continue'} nextIcon={wiz.isLast ? <ShieldCheck className="size-4" /> : undefined} />
            </form>

            {/* Sticky summary */}
            <aside className="hidden lg:block" aria-label="Delivery summary">
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-3xl bg-ink-900 text-white shadow-lift">
                  <div className="relative h-28">
                    {cat ? <SmartImage src={img(cat.image, 760)} alt="" className="absolute inset-0" /> : <div className="absolute inset-0 bg-ink-radial" />}
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
                    <div className="absolute inset-x-5 bottom-3">
                      <p className="text-[11px] font-bold tracking-[0.16em] text-go-300 uppercase">Your delivery</p>
                      <p className="font-display text-lg font-bold">{cat?.name ?? 'Choose a delivery type'}</p>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <RouteTimeline dark points={routePoints} animate={false} />
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5"><Package className="size-3.5" aria-hidden /> {sizeInfo.label} · {v.weightKg || 0} kg</span>
                      {v.packages > 1 && <span className="rounded-lg bg-white/10 px-2.5 py-1.5">× {v.packages}</span>}
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5"><Clock className="size-3.5" aria-hidden /> {urgencyInfo.eta}</span>
                    </div>
                    {isMarket && (
                      <p className="flex gap-2 rounded-xl bg-go-500/15 px-3 py-2.5 text-xs text-go-100">
                        <HandCoins className="mt-0.5 size-4 shrink-0 text-go-300" aria-hidden /> Cost of goods is not included — paid to sellers separately.
                      </p>
                    )}
                  </div>
                </div>
                <FareBreakdown fare={fare} />
                {current !== 'review' && <DemoNotice compact />}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <MobileFareBar
        fare={fare}
        cta={
          <Button type="submit" form="delivery-form" size="lg" loading={busy} iconRight={wiz.isLast ? undefined : <ArrowRight className="size-4" />}>
            {wiz.isLast ? 'Confirm' : 'Continue'}
          </Button>
        }
        sheetExtra={isMarket ? <p className="rounded-xl bg-go-50 px-4 py-3 text-[13px] text-go-800">Cost of goods is not included in this estimate — purchases and payment to sellers may require separate arrangements.</p> : <DemoNotice compact />}
      />
    </>
  );
}

