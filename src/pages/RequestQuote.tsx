import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight, ArrowRight, BadgeCheck, Briefcase, Building2, CalendarClock, CalendarDays, Check, Clock, Copy, FileText, FlaskConical, Headset, Home,
  Mail, MapPinned, Package, Phone, Repeat, Route as RouteIcon, Send, Sparkles, User, Users, Weight,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, ButtonLink, DemoNotice, ExternalButton, Input, Select, Stepper, Textarea, WhatsappGlyph } from '@/components/ui';
import { LocationPicker, type LocationValue } from '@/components/booking/LocationPicker';
import { locationFromParams, locationKeys, locationRules, pickErrors, placeLabel } from '@/components/booking/locationRules';
import { SuccessBadge } from '@/components/booking/Celebration';
import { sizeOptions } from '@/config/pricing';
import { site, whatsappLink } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm, usePageMeta } from '@/hooks';
import { quoteService } from '@/services/api';
import type { CustomerType, LocationPoint, PackageSize, QuoteRequest, TripArrangement } from '@/types';
import { addDays, cn, formatDate, formatTime, todayISO } from '@/utils';
import { afterField, email, max, maxLen, min, minLen, notPastDate, phone, required, validate, when, type Schema } from '@/utils/validation';

/* ---------- Service categories ---------- */
type QuoteCategory = { id: string; label: string; group: string; delivery?: boolean; aliases?: string[] };
const categories: QuoteCategory[] = [
  { id: 'motorcycle', label: 'Motorcycle rides', group: 'Rides', aliases: ['moto', 'bike', 'okada', 'moto-standard', 'moto-premium', 'moto-express', 'moto-scheduled', 'moto-business'] },
  { id: 'tricycle', label: 'Tricycle (keke) rides', group: 'Rides', aliases: ['keke', 'tri-standard', 'tri-premium', 'tri-commercial', 'tri-group', 'tri-scheduled', 'group-transportation'] },
  { id: 'private-shuttle', label: 'Private shuttle', group: 'Shuttles & groups', aliases: ['shuttle', 'sh-private'] },
  { id: 'group-shuttle', label: 'Group shuttle (per seat)', group: 'Shuttles & groups', aliases: ['sh-group'] },
  { id: 'airport', label: 'Airport pickup & drop-off', group: 'Shuttles & groups', aliases: ['sh-airport', 'airport-pickup'] },
  { id: 'event', label: 'Event transportation', group: 'Shuttles & groups', aliases: ['sh-event', 'events', 'wedding'] },
  { id: 'intercity', label: 'Intercity transportation', group: 'Shuttles & groups', aliases: ['sh-intercity'] },
  { id: 'scheduled-shuttle', label: 'Scheduled shuttle (school, church, estate)', group: 'Shuttles & groups', aliases: ['sh-scheduled'] },
  { id: 'parcel', label: 'Parcel & document delivery', group: 'Delivery & logistics', delivery: true, aliases: ['delivery', 'parcel-delivery', 'document', 'document-delivery', 'small-package', 'food-grocery', 'express', 'same-day'] },
  { id: 'market-pickup', label: 'Market pickup', group: 'Delivery & logistics', delivery: true, aliases: ['market'] },
  { id: 'business-delivery', label: 'Business deliveries', group: 'Delivery & logistics', delivery: true, aliases: ['business-deliveries'] },
  { id: 'merchant', label: 'Merchant & bulk deliveries', group: 'Delivery & logistics', delivery: true, aliases: ['merchant-deliveries', 'bulk'] },
  { id: 'scheduled-delivery', label: 'Scheduled & recurring deliveries', group: 'Delivery & logistics', delivery: true, aliases: ['scheduled', 'scheduled-deliveries'] },
  { id: 'corporate', label: 'Corporate staff transportation', group: 'Business', aliases: ['sh-corporate', 'corporate-transportation', 'staff'] },
  { id: 'custom-business', label: 'Customized business transportation', group: 'Business', aliases: ['business', 'business-transportation'] },
  { id: 'business-logistics', label: 'Business logistics contract', group: 'Business', delivery: true, aliases: ['logistics', 'business-logistics'] },
];
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function matchCategory(raw: string | null): QuoteCategory | undefined {
  if (!raw) return undefined;
  const s = slug(raw);
  return categories.find((c) => c.id === s || slug(c.label) === s || c.aliases?.includes(s)) ?? categories.find((c) => slug(c.label).includes(s) || s.includes(c.id));
}
const isDelivery = (id: unknown) => !!categories.find((c) => c.id === id)?.delivery;

const arrangements: { value: TripArrangement; label: string; hint: string; Icon: typeof RouteIcon }[] = [
  { value: 'one-way', label: 'One-way', hint: 'A to B', Icon: ArrowRight },
  { value: 'round-trip', label: 'Round trip', hint: 'There and back', Icon: ArrowLeftRight },
  { value: 'shuttle', label: 'Shuttle service', hint: 'Loops or set routes', Icon: Users },
  { value: 'multi-stop', label: 'Multiple stops', hint: 'Several pickups / drops', Icon: RouteIcon },
  { value: 'scheduled', label: 'Scheduled transportation', hint: 'Recurring days & times', Icon: Repeat },
  { value: 'custom-business', label: 'Customized business', hint: 'Contracts, SLAs, fleets', Icon: Briefcase },
];

/* ---------- Form ---------- */
type QuoteValues = {
  fullName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  companyName: string;
  serviceCategory: string;
  passengers: number;
  packageDescription: string;
  packageSize: PackageSize;
  weightKg: number | '';
  packages: number;
  pickup: LocationValue;
  dropoff: LocationValue;
  date: string;
  time: string;
  returnDate: string;
  arrangement: TripArrangement;
  requirements: string;
  description: string;
};

const schema: Schema = {
  fullName: [required('Enter your full name'), minLen(2)],
  email: [required('Enter your email address'), email()],
  phone: [required('Enter a phone number'), phone()],
  companyName: [when((a) => a.customerType === 'business', [required('Enter your company name'), minLen(2)])],
  serviceCategory: [required('Choose a service category')],
  passengers: [when((a) => !isDelivery(a.serviceCategory), [min(1, 'At least one passenger'), max(500, 'For more than 500 passengers, describe your needs below')])],
  packageDescription: [when((a) => isDelivery(a.serviceCategory), [required('Describe what needs delivering'), minLen(3)])],
  weightKg: [when((a) => isDelivery(a.serviceCategory), [required('Enter an estimated weight'), min(0.1, 'Weight must be more than 0 kg'), max(20000)])],
  packages: [when((a) => isDelivery(a.serviceCategory), [min(1), max(10000)])],
  ...locationRules('pickup', (a) => a.pickup as LocationValue, 'pickup'),
  ...locationRules('dropoff', (a) => a.dropoff as LocationValue, 'destination'),
  date: [required('Choose a booking date'), notPastDate()],
  time: [required('Choose a pickup time')],
  returnDate: [when((a) => a.arrangement === 'round-trip', [required('Choose a return date'), notPastDate(), afterField('date', 'Return date must be on or after the booking date')])],
  arrangement: [required('Choose a trip arrangement')],
  requirements: [maxLen(500)],
  description: [required('Describe the service you need'), minLen(20, 'Tell us a little more — at least 20 characters'), maxLen(1200)],
};

const toPoint = (l: LocationValue): LocationPoint => ({ cityId: l.cityId!, areaId: l.areaId, junctionId: l.junctionId!, address: (l.address ?? '').trim() });

/* =====================================================================
   PAGE
   ===================================================================== */
export default function RequestQuotePage() {
  usePageMeta('Request a quote', 'Get a tailored quote for business transportation, shuttles, events, airport runs, bulk deliveries and logistics contracts.');
  const [params] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const [submitted, setSubmitted] = useState<QuoteRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const initial = useMemo<QuoteValues>(() => {
    const business = params.get('type') === 'business';
    const cat = matchCategory(params.get('service')) ?? (business ? categories.find((c) => c.id === 'custom-business') : undefined);
    return {
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      customerType: business || cat?.group === 'Business' ? 'business' : 'individual',
      companyName: '',
      serviceCategory: cat?.id ?? '',
      passengers: 1,
      packageDescription: '',
      packageSize: 'medium',
      weightKg: '',
      packages: 1,
      pickup: locationFromParams(params.get('pickupCity'), params.get('pickupJunction')),
      dropoff: locationFromParams(params.get('dropoffCity'), params.get('dropoffJunction')),
      date: addDays(todayISO(), 1),
      time: '08:00',
      returnDate: '',
      arrangement: cat?.id === 'custom-business' || cat?.id === 'corporate' || cat?.id === 'business-logistics' ? 'custom-business' : cat?.id === 'scheduled-shuttle' || cat?.id === 'scheduled-delivery' ? 'scheduled' : 'one-way',
      requirements: '',
      description: '',
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { values: v, errors, field, patch, check, setErrors, reset } = useForm<QuoteValues>(initial, schema);
  const cat = categories.find((c) => c.id === v.serviceCategory);
  const delivery = !!cat?.delivery;
  const groups = [...new Set(categories.map((c) => c.group))];

  const update = (p: Partial<QuoteValues>, keys: string[]) => {
    const next = { ...v, ...p };
    patch(p);
    const live = keys.filter((k) => errors[k]);
    if (live.length) setErrors((e) => ({ ...e, ...Object.fromEntries(live.map((k) => [k, undefined])), ...validate(next, schema, live) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!check()) {
      toast({ title: 'Please check the highlighted fields', tone: 'error' });
      return;
    }
    setBusy(true);
    try {
      const q = await quoteService.create({
        fullName: v.fullName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        customerType: v.customerType,
        companyName: v.customerType === 'business' ? v.companyName.trim() : undefined,
        serviceCategory: cat?.label ?? v.serviceCategory,
        passengers: delivery ? undefined : v.passengers,
        packageDetails: delivery ? { description: v.packageDescription.trim(), size: v.packageSize, weightKg: Number(v.weightKg) || 0, packages: v.packages } : undefined,
        pickup: toPoint(v.pickup),
        dropoff: toPoint(v.dropoff),
        date: v.date,
        time: v.time,
        returnDate: v.returnDate || undefined,
        arrangement: v.arrangement,
        requirements: v.requirements.trim() || undefined,
        description: v.description.trim(),
      });
      setSubmitted(q);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({ title: 'Quote request received', body: `Reference ${q.reference} (demo).` });
    } catch {
      toast({ title: 'Something went wrong', body: 'Please try again.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (submitted) return <Confirmation q={submitted} onNew={() => { reset(); setSubmitted(null); }} />;

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Request a quote' }]}
        eyebrow={<><Briefcase className="size-3.5" aria-hidden /> Tailored pricing</>}
        title={<>Request a <span className="text-gradient-go">custom quote</span></>}
        subtitle="Staff movement, events, airport runs, intercity trips, bulk deliveries or a logistics contract — tell us what you need and a specialist will price it for you."
        aside={
          <div className="glass-dark grid grid-cols-3 divide-x divide-white/10 rounded-3xl p-5 text-center">
            {[['2 hrs', 'First response*'], ['24 hrs', 'Detailed quote*'], ['0', 'Obligation']].map(([n, l]) => (
              <div key={l} className="px-2">
                <p className="font-display text-2xl font-extrabold text-white">{n}</p>
                <p className="text-xs text-white/60">{l}</p>
              </div>
            ))}
            <p className="col-span-3 mt-3 border-t border-white/10 pt-3 text-[11px] text-white/45">*Target times during operating hours (demonstration).</p>
          </div>
        }
      />

      <section className="bg-canvas pb-24">
        <div className="container-x">
          <div className="relative z-10 mt-[-2rem] grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form noValidate onSubmit={onSubmit} className="min-w-0 space-y-6" aria-label="Quote request form">
              {/* 1 — About you */}
              <QuoteSection n={1} title="About you" icon={<User />}>
                <div role="radiogroup" aria-label="Customer type" className="mb-5 grid grid-cols-2 gap-3">
                  {([['individual', 'Individual', 'Personal or family trips', Home], ['business', 'Business', 'Company, school, church, NGO', Building2]] as const).map(([val, label, hint, I]) => {
                    const active = v.customerType === val;
                    return (
                      <button key={val} type="button" role="radio" aria-checked={active} onClick={() => update({ customerType: val }, ['companyName'])} className={cn('flex min-h-16 items-center gap-3 rounded-2xl border-2 p-3 text-left transition', active ? 'border-go-500 bg-go-50/60' : 'border-line bg-white hover:border-brand-300')}>
                        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', active ? 'bg-go-500 text-white' : 'bg-brand-50 text-brand-700')}><I className="size-5" aria-hidden /></span>
                        <span>
                          <span className="block font-semibold text-ink-900">{label}</span>
                          <span className="block text-xs text-text-2">{hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" required autoComplete="name" icon={<User />} {...field('fullName')} />
                  {v.customerType === 'business' && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                      <Input label="Company name" required autoComplete="organization" icon={<Building2 />} {...field('companyName')} />
                    </motion.div>
                  )}
                  <Input label="Email" required type="email" autoComplete="email" icon={<Mail />} {...field('email')} />
                  <Input label="Phone" required type="tel" inputMode="tel" autoComplete="tel" icon={<Phone />} placeholder="0803 123 4567" {...field('phone')} />
                </div>
              </QuoteSection>

              {/* 2 — Service */}
              <QuoteSection n={2} title="What do you need?" icon={<Sparkles />}>
                <Select
                  label="Service category"
                  required
                  placeholder="Choose a service"
                  options={groups.flatMap((g) => categories.filter((c) => c.group === g).map((c) => ({ value: c.id, label: c.label, group: g })))}
                  {...field('serviceCategory')}
                />
                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm font-semibold text-text">Trip arrangement <span className="text-go-600" aria-hidden>*</span></legend>
                  <div role="radiogroup" aria-label="Trip arrangement" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {arrangements.map((a) => {
                      const active = v.arrangement === a.value;
                      return (
                        <button key={a.value} type="button" role="radio" aria-checked={active} onClick={() => update({ arrangement: a.value, returnDate: a.value === 'round-trip' ? v.returnDate || v.date : v.returnDate }, ['arrangement', 'returnDate'])} className={cn('flex min-h-[4.5rem] flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition', active ? 'border-go-500 bg-go-50/60' : 'border-line bg-white hover:border-brand-300')}>
                          <a.Icon className={cn('size-4', active ? 'text-go-600' : 'text-brand-600')} aria-hidden />
                          <span className="text-sm font-semibold text-ink-900">{a.label}</span>
                          <span className="text-[11px] text-muted">{a.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <motion.div key={delivery ? 'pkg' : 'pax'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-surface-2/60 p-4 sm:p-5">
                  {delivery ? (
                    <>
                      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900"><Package className="size-4 text-brand-600" aria-hidden /> Package details</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input wrapperClassName="sm:col-span-2" label="Package description" required placeholder="e.g. 40 cartons of bottled water, weekly" {...field('packageDescription')} />
                        <Select label="Typical package size" options={sizeOptions.map((s) => ({ value: s.id, label: `${s.label} — up to ${s.maxKg} kg` }))} {...field('packageSize')} />
                        <Input label="Estimated total weight (kg)" required type="number" inputMode="decimal" min={0.1} step={0.5} icon={<Weight />} {...field('weightKg')} />
                        <div>
                          <p className="mb-1.5 text-sm font-semibold text-text">Number of packages</p>
                          <Stepper label="packages" value={v.packages} min={1} max={10000} onChange={(n) => update({ packages: n }, ['packages'])} />
                          {errors.packages && <p role="alert" className="mt-1 text-[13px] font-medium text-crit">{errors.packages}</p>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4" data-field="passengers">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Users className="size-4 text-brand-600" aria-hidden /> Number of passengers</p>
                        <p className="text-[13px] text-text-2">Rough numbers are fine — we’ll size the fleet.</p>
                      </div>
                      <Stepper label="passengers" value={v.passengers} min={1} max={500} onChange={(n) => update({ passengers: n }, ['passengers'])} />
                      {errors.passengers && <p role="alert" className="w-full text-[13px] font-medium text-crit">{errors.passengers}</p>}
                    </div>
                  )}
                </motion.div>
              </QuoteSection>

              {/* 3 — Route & schedule */}
              <QuoteSection n={3} title="Route & schedule" icon={<MapPinned />}>
                <LocationPicker name="pickup" label="Pickup" tone="pickup" value={v.pickup} errors={pickErrors(errors, 'pickup')} onChange={(loc) => update({ pickup: loc }, locationKeys('pickup'))} />
                <div className="my-6 h-px bg-line" aria-hidden />
                <LocationPicker name="dropoff" label="Destination" tone="dropoff" value={v.dropoff} errors={pickErrors(errors, 'dropoff')} onChange={(loc) => update({ dropoff: loc }, locationKeys('dropoff'))} />
                <div className={cn('mt-6 grid gap-4', v.arrangement === 'round-trip' || v.arrangement === 'scheduled' ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
                  <Input label="Booking date" required type="date" min={todayISO()} icon={<CalendarDays />} {...field('date')} />
                  <Input label="Pickup time" required type="time" step={900} icon={<Clock />} {...field('time')} />
                  {(v.arrangement === 'round-trip' || v.arrangement === 'scheduled') && (
                    <Input label={v.arrangement === 'round-trip' ? 'Return date' : 'Schedule ends'} required={v.arrangement === 'round-trip'} optional={v.arrangement !== 'round-trip'} type="date" min={v.date || todayISO()} icon={<CalendarClock />} {...field('returnDate')} />
                  )}
                </div>
              </QuoteSection>

              {/* 4 — Details */}
              <QuoteSection n={4} title="Tell us more" icon={<FileText />}>
                <div className="grid gap-4">
                  <Textarea label="Description of the requested service" required placeholder="e.g. Departmental excursion for 40 UNIZIK students from the Main Gate to Enugu and back, or a daily staff shuttle from Ifite to Agu-Awka, Mon–Fri, 7 AM pickup and 5 PM return." hint={`${v.description.length}/1200 — the more detail, the more accurate your quote`} maxLength={1200} {...field('description')} />
                  <Textarea label="Additional requirements" optional placeholder="e.g. Branded vehicles, air-conditioning, insurance certificates, invoicing terms, accessibility needs" hint={`${v.requirements.length}/500`} maxLength={500} {...field('requirements')} />
                </div>
              </QuoteSection>

              <div className="flex flex-col gap-4 rounded-3xl bg-ink-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="flex items-start gap-2.5 text-sm text-white/70">
                  <FlaskConical className="mt-0.5 size-4 shrink-0 text-go-300" aria-hidden />
                  Demonstration form — your request is saved in this browser only. No backend is connected yet.
                </p>
                <Button type="submit" size="lg" loading={busy} iconRight={<Send className="size-4" />} className="shrink-0">Request my quote</Button>
              </div>
            </form>

            <QuoteAside />
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Pieces ---------- */
function QuoteSection({ n, title, icon, children }: { n: number; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={`qs-${n}`} className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="relative grid size-10 place-items-center rounded-xl bg-ink-900 font-display text-sm font-bold text-white">
          {n}
          <span aria-hidden className="absolute -right-1 -bottom-1 h-1.5 w-5 skew-x-[-20deg] rounded-full bg-go-500" />
        </span>
        <h2 id={`qs-${n}`} className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
          {title} <span className="text-brand-600 [&>svg]:size-4" aria-hidden>{icon}</span>
        </h2>
      </div>
      {children}
    </section>
  );
}

function QuoteAside() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24" aria-label="About quotes">
      <div className="overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-lift">
        <p className="text-xs font-bold tracking-[0.16em] text-go-300 uppercase">Why request a quote?</p>
        <ul className="mt-4 space-y-3.5 text-sm">
          {[
            ['Fleet-sized pricing', 'Volume and multi-vehicle rates the instant estimator can’t show.'],
            ['Dedicated coordinator', 'One point of contact for events, contracts and recurring schedules.'],
            ['Flexible billing', 'Monthly invoicing and purchase orders for businesses (planned).'],
            ['No obligation', 'Review the quote, ask questions, then decide.'],
          ].map(([t, s]) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-go-500"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span>
              <span>
                <span className="block font-semibold">{t}</span>
                <span className="block text-white/60">{s}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 font-display font-semibold text-ink-900"><Clock className="size-4 text-brand-600" aria-hidden /> Response time</p>
        <p className="mt-1.5 text-sm text-text-2">We aim to acknowledge requests within 2 hours and send a detailed quote within 24 hours during operating hours (demonstration targets).</p>
        <dl className="mt-3 space-y-1 text-[13px]">
          {site.hours.map((h) => (
            <div key={h.days} className="flex justify-between gap-3"><dt className="text-text-2">{h.days}</dt><dd className="font-medium text-ink-900">{h.time}</dd></div>
          ))}
        </dl>
      </div>
      <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 font-display font-semibold text-ink-900"><Headset className="size-4 text-brand-600" aria-hidden /> Prefer to talk?</p>
        <div className="mt-3 grid gap-2">
          <ExternalButton href={whatsappLink("Hello DoorstepGo 👋 I'd like to discuss a quote.")} target="_blank" rel="noopener noreferrer" variant="outline" iconLeft={<WhatsappGlyph className="size-4 text-[#25D366]" />}>WhatsApp {site.whatsapp.displayNumber}</ExternalButton>
          <ExternalButton href={`tel:${site.contact.phoneHref}`} variant="outline" iconLeft={<Phone className="size-4" />}>{site.contact.phone}</ExternalButton>
          <ExternalButton href={`mailto:${site.contact.businessEmail}`} variant="outline" iconLeft={<Mail className="size-4" />}>{site.contact.businessEmail}</ExternalButton>
        </div>
      </div>
    </aside>
  );
}

function Confirmation({ q, onNew }: { q: QuoteRequest; onNew: () => void }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(q.reference);
      toast({ title: 'Reference copied', body: q.reference, tone: 'info' });
    } catch {
      toast({ title: 'Copy not available', body: q.reference, tone: 'info' });
    }
  };
  const steps = [
    { t: 'Request received', s: 'Saved just now with your reference', done: true, Icon: BadgeCheck },
    { t: 'Specialist review', s: 'We check routes, fleet and timing — target within 2 hours', done: false, Icon: Users },
    { t: 'Your tailored quote', s: `Sent to ${q.email} and WhatsApp — target within 24 hours`, done: false, Icon: Mail },
    { t: 'Accept & schedule', s: 'Confirm and we lock in vehicles and drivers', done: false, Icon: CalendarClock },
  ];
  return (
    <>
      <section className="noise relative isolate overflow-hidden bg-ink-950 text-white">
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink-radial" />
        <div className="container-x pt-[calc(72px+3rem)] pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <SuccessBadge />
            <h1 className="mt-6 text-3xl font-extrabold sm:text-5xl">Quote request <span className="text-gradient-go">received</span></h1>
            <p className="mt-4 max-w-xl text-white/70">Thanks, {q.fullName.split(' ')[0]}. A DoorstepGo specialist will review your {q.serviceCategory.toLowerCase()} request.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
              <span className="text-xs font-bold tracking-[0.16em] text-white/50 uppercase">Reference</span>
              <span className="font-mono text-xl font-bold tracking-wider">{q.reference}</span>
              <Button size="sm" variant="glass" onClick={copy} iconLeft={<Copy className="size-4" />}>Copy</Button>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="bg-canvas pb-24">
        <div className="container-x relative z-10 -mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-lift sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink-900">What happens next</h2>
            <ol className="mt-6 space-y-0">
              {steps.map((s, i) => (
                <motion.li key={s.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < steps.length - 1 && <span aria-hidden className={cn('absolute top-11 bottom-1 left-[19px] w-0.5', s.done ? 'bg-ok' : 'bg-line')} />}
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', s.done ? 'bg-ok text-white' : 'bg-surface-2 text-brand-700 ring-1 ring-line')}><s.Icon className="size-[18px]" aria-hidden /></span>
                  <div>
                    <p className="font-semibold text-ink-900">{s.t} {s.done && <Badge tone="ok" className="ml-1">Done</Badge>}</p>
                    <p className="text-sm text-text-2">{s.s}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold text-ink-900">Your request</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  ['Service', q.serviceCategory],
                  ['Customer', q.customerType === 'business' ? `Business · ${q.companyName}` : 'Individual'],
                  ['Arrangement', arrangements.find((a) => a.value === q.arrangement)?.label],
                  ['From', placeLabel(q.pickup)],
                  ['To', placeLabel(q.dropoff)],
                  ['When', `${formatDate(q.date)} · ${formatTime(q.time)}${q.returnDate ? ` → ${formatDate(q.returnDate)}` : ''}`],
                  [q.packageDetails ? 'Packages' : 'Passengers', q.packageDetails ? `${q.packageDetails.packages} · ${q.packageDetails.weightKg} kg` : String(q.passengers)],
                ].map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-dashed border-line pb-2">
                    <dt className="text-text-2">{k}</dt>
                    <dd className="text-right font-medium text-ink-900">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <DemoNotice>Demonstration submission — no backend connected yet. Your request is stored only in this browser and no one will contact you.</DemoNotice>
            <div className="grid gap-2">
              <Button size="lg" variant="ink" onClick={onNew} iconLeft={<Repeat className="size-4" />}>Submit another request</Button>
              <ExternalButton size="lg" variant="outline" href={whatsappLink(`Hello DoorstepGo 👋 Following up on quote ${q.reference}.`)} target="_blank" rel="noopener noreferrer" iconLeft={<WhatsappGlyph className="size-4 text-[#25D366]" />}>Follow up on WhatsApp</ExternalButton>
              <ButtonLink size="lg" variant="ghost" to="/" iconLeft={<Home className="size-4" />}>Back to home</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

