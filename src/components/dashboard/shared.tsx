/* Shared building blocks for the customer dashboard pages. */
import { useId, useState, type ReactNode } from 'react';
import {
  BadgeCheck, Bell, Bike, Bus, CarTaxiFront, Check, CircleX, Copy, CopyCheck, CreditCard, Gift, MessageSquareText, Package, PackageCheck,
  Phone, Navigation, MapPin, Megaphone, Star, Truck, UserRound, CalendarCheck, Flag, type LucideIcon,
} from 'lucide-react';
import { Avatar, Button, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { usePrefersReducedMotion } from '@/hooks';
import { junctionLabel } from '@/config/locations';
import { loyalty, paymentMethods } from '@/config/pricing';
import { findDeliveryCategory, findTier } from '@/data/services';
import { supportService } from '@/services/api';
import type { BookingStatus, DeliveryBooking, Driver, LocationPoint, NotificationType, PaymentMethodKind, RideBooking, ServiceKind, TimelineEvent } from '@/types';
import { cn, formatDateTime } from '@/utils';

/* ---------- Status buckets ---------- */
export type Bucket = 'upcoming' | 'active' | 'completed' | 'cancelled';

export const rideBucket = (s: BookingStatus): Bucket =>
  s === 'cancelled' ? 'cancelled' : s === 'completed' ? 'completed' : ['driver_assigned', 'driver_arriving', 'in_progress'].includes(s) ? 'active' : 'upcoming';

export const deliveryBucket = (d: DeliveryBooking): Bucket =>
  d.status === 'cancelled' ? 'cancelled' : d.status === 'completed' || d.stage === 'delivered' ? 'completed' : d.stage !== 'received' || ['driver_assigned', 'driver_arriving', 'in_progress'].includes(d.status) ? 'active' : 'upcoming';

/** Sort key combining date + time. */
export const whenKey = (x: { date: string; time: string }) => `${x.date}T${x.time}`;

/* ---------- Service kind visuals ---------- */
export const kindMeta: Record<ServiceKind, { icon: LucideIcon; label: string; tone: string }> = {
  motorcycle: { icon: Bike, label: 'Motorcycle', tone: 'bg-go-50 text-go-600 ring-go-100' },
  tricycle: { icon: CarTaxiFront, label: 'Tricycle', tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
  shuttle: { icon: Bus, label: 'Shuttle', tone: 'bg-brand-50 text-brand-700 ring-brand-100' },
  delivery: { icon: Package, label: 'Delivery', tone: 'bg-ink-900 text-white ring-ink-800' },
};

export function KindIcon({ kind, className, size = 'md' }: { kind: ServiceKind; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const m = kindMeta[kind];
  const I = m.icon;
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-xl ring-1 ring-inset', m.tone, size === 'sm' ? 'size-8' : size === 'lg' ? 'size-14 rounded-2xl' : 'size-11', className)} aria-hidden>
      <I className={size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'} />
    </span>
  );
}

export const tierName = (id: string) => findTier(id)?.name ?? 'Ride';
export const categoryName = (id: string) => findDeliveryCategory(id)?.name ?? 'Delivery';
export const methodLabel = (m: PaymentMethodKind) => paymentMethods.find((p) => p.id === m)?.label ?? m;

/* ---------- Rebook links ---------- */
const locParams = (prefix: string, l: LocationPoint) => ({
  [`${prefix}City`]: l.cityId,
  ...(l.areaId ? { [`${prefix}Area`]: l.areaId } : {}),
  [`${prefix}Junction`]: l.junctionId,
  [`${prefix}Address`]: l.address,
});

export const rebookHref = (b: RideBooking) =>
  `/booking?${new URLSearchParams({ service: b.kind, tier: b.tierId, passengers: String(b.passengers), ...locParams('pickup', b.pickup), ...locParams('dropoff', b.dropoff) })}`;

export const redeliverHref = (d: DeliveryBooking) =>
  `/delivery?${new URLSearchParams({ category: d.categoryId, size: d.packageSize, ...locParams('pickup', d.pickup), ...locParams('dropoff', d.dropoff) })}`;

/* ---------- Panel ---------- */
export function Panel({ title, subtitle, action, children, className, bodyClassName, icon }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; icon?: ReactNode }) {
  return (
    <section className={cn('card overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-800 [&>svg]:size-[18px]">{icon}</span>}
            <div className="min-w-0">
              {title && <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5 sm:p-6', (title || action) && 'pt-4 sm:pt-4', bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- KPI tile ---------- */
export function StatTile({ label, value, sub, icon, accent = 'brand' }: { label: string; value: ReactNode; sub?: ReactNode; icon: ReactNode; accent?: 'brand' | 'go' | 'ok' | 'ink' }) {
  const tone = { brand: 'bg-brand-50 text-brand-700', go: 'bg-go-50 text-go-600', ok: 'bg-ok-bg text-ok', ink: 'bg-ink-900 text-white' }[accent];
  return (
    <div className="card group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div aria-hidden className={cn('absolute -top-10 -right-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60', accent === 'go' ? 'bg-go-200' : 'bg-brand-200')} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-2">{label}</p>
        <span className={cn('grid size-10 place-items-center rounded-xl [&>svg]:size-5', tone)}>{icon}</span>
      </div>
      <p className="relative mt-3 font-display text-[1.75rem] leading-none font-extrabold tracking-tight text-ink-900 tabular-nums">{value}</p>
      {sub && <p className="relative mt-2 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}

/* ---------- Copy to clipboard ---------- */
export function CopyButton({ value, label = 'Copy', className, dark }: { value: string; label?: string; className?: string; dark?: boolean }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          toast({ title: 'Copy unavailable', body: `Your browser blocked clipboard access. The value is ${value}.`, tone: 'info' });
        }
      }}
      className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold transition', dark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-brand-700 hover:bg-brand-50', className)}
      aria-label={done ? 'Copied' : `${label}: ${value}`}
    >
      {done ? <CopyCheck className="size-4 text-ok" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{done ? 'Copied' : label}</span>
    </button>
  );
}

/* ---------- Pickup → drop-off ---------- */
export function RouteStack({ from, to, compact, dark, stops }: { from: LocationPoint; to: LocationPoint; compact?: boolean; dark?: boolean; stops?: LocationPoint[] }) {
  const rows: { tone: 'from' | 'stop' | 'to'; loc: LocationPoint; label: string }[] = [
    { tone: 'from', loc: from, label: 'Pickup' },
    ...(stops ?? []).map((s, i) => ({ tone: 'stop' as const, loc: s, label: `Stop ${i + 1}` })),
    { tone: 'to', loc: to, label: 'Drop-off' },
  ];
  return (
    <ol className="relative space-y-3">
      <span aria-hidden className={cn('absolute top-3 bottom-3 left-[7px] w-0.5 rounded-full', dark ? 'bg-white/15' : 'bg-gradient-to-b from-brand-300 via-line-strong to-go-300')} />
      {rows.map((r, i) => (
        <li key={i} className="relative flex gap-3">
          <span aria-hidden className={cn('relative z-10 mt-1 size-4 shrink-0 rounded-full ring-4', r.tone === 'from' ? 'bg-brand-500' : r.tone === 'to' ? 'bg-go-500' : 'bg-line-strong', dark ? 'ring-ink-900' : 'ring-white')} />
          <div className="min-w-0">
            <p className={cn('text-[11px] font-bold tracking-wider uppercase', dark ? 'text-white/45' : 'text-muted')}>{r.label}</p>
            <p className={cn('truncate font-semibold', compact ? 'text-sm' : 'text-[15px]', dark ? 'text-white' : 'text-ink-900')}>{junctionLabel(r.loc.cityId, r.loc.junctionId)}</p>
            {!compact && <p className={cn('text-[13px]', dark ? 'text-white/60' : 'text-text-2')}>{r.loc.address}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Mini route SVG ---------- */
export function MiniRoute({ progress = 0.5, className, label }: { progress?: number; className?: string; label?: string }) {
  const reduce = usePrefersReducedMotion();
  const id = useId().replace(/:/g, '');
  const d = 'M24 96 C 80 96, 70 30, 140 40 S 230 92, 276 28';
  return (
    <svg viewBox="0 0 300 120" className={cn('h-auto w-full', className)} role="img" aria-label={label ?? `Route map, about ${Math.round(progress * 100)}% complete`}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#5b8eff" />
          <stop offset="1" stopColor="#ff6a13" />
        </linearGradient>
        <pattern id={`p${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="300" height="120" fill={`url(#p${id})`} />
      {/* faux streets */}
      <path d="M0 70 H300 M110 0 V120 M200 0 V120" stroke="rgb(255 255 255 / 0.06)" strokeWidth="8" />
      <path d={d} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={`url(#g${id})`} strokeWidth="3.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} />
      <path d={d} fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 8" className="animate-dash" />
      <circle cx="24" cy="96" r="7" fill="#2f7bff" stroke="white" strokeWidth="2.5" />
      <circle cx="276" cy="28" r="7" fill="#ff6a13" stroke="white" strokeWidth="2.5" />
      <circle r="6" fill="white" stroke="#ff6a13" strokeWidth="3">
        {!reduce ? (
          <animateMotion dur="6s" repeatCount="indefinite" keyPoints={`0;${progress};${progress}`} keyTimes="0;0.7;1" calcMode="linear" path={d} />
        ) : (
          <animateMotion dur="0.01s" fill="freeze" keyPoints={`${progress};${progress}`} keyTimes="0;1" calcMode="linear" path={d} />
        )}
      </circle>
    </svg>
  );
}

/* ---------- Timeline ---------- */
export function TimelineList({ events }: { events: TimelineEvent[] }) {
  const current = events.findIndex((e) => !e.done);
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const active = i === current;
        return (
          <li key={e.key} className="relative flex gap-4 pb-5 last:pb-0">
            {i < events.length - 1 && <span aria-hidden className={cn('absolute top-7 bottom-0 left-[13px] w-0.5', e.done ? 'bg-ok' : 'bg-line')} />}
            <span className={cn('relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold', e.done ? 'bg-ok text-white' : active ? 'bg-go-500 text-white' : 'bg-surface-2 text-muted ring-1 ring-line-strong')}>
              {e.done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              {active && <span className="absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-go-500" aria-hidden />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn('text-sm font-semibold', e.done || active ? 'text-ink-900' : 'text-muted')}>
                {e.label}
                {active && <span className="ml-2 rounded-full bg-go-50 px-2 py-0.5 text-[11px] font-bold text-go-700">Next</span>}
              </p>
              <p className="text-[13px] text-muted">{e.done ? formatDateTime(e.at) : 'Pending'}</p>
              {e.note && <p className="mt-0.5 text-[13px] text-text-2">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Driver / rider card ---------- */
export function PersonCard({ person, role = 'Driver', dark }: { person?: Driver; role?: string; dark?: boolean }) {
  if (!person)
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl border border-dashed p-4', dark ? 'border-white/15 text-white/60' : 'border-line-strong text-text-2')}>
        <span className={cn('grid size-12 place-items-center rounded-full', dark ? 'bg-white/10' : 'bg-surface-2')}><UserRound className="size-5" aria-hidden /></span>
        <p className="text-sm">A {role.toLowerCase()} will be assigned closer to your pickup time. You will get a notification.</p>
      </div>
    );
  return (
    <div className={cn('flex flex-wrap items-center gap-3 rounded-2xl p-4', dark ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-surface-2/60 ring-1 ring-line')}>
      <Avatar src={person.avatar} name={person.name} size={52} ring />
      <div className="min-w-0 flex-1">
        <p className={cn('flex items-center gap-1.5 font-semibold', dark ? 'text-white' : 'text-ink-900')}>
          {person.name}
          {person.verifiedDemo && <BadgeCheck className="size-4 text-brand-400" aria-label="Profile checked (demo)" />}
        </p>
        <p className={cn('flex items-center gap-1 text-[13px]', dark ? 'text-white/60' : 'text-text-2')}>
          <Star className="size-3.5 fill-go-500 text-go-500" aria-hidden /> {person.rating} · {person.trips.toLocaleString()} trips · {role}
        </p>
        <p className={cn('mt-0.5 truncate text-[13px]', dark ? 'text-white/50' : 'text-muted')}>{person.vehicle} · <span className="font-mono font-semibold">{person.plate}</span></p>
      </div>
      <div className="flex gap-2">
        <a href={`tel:${person.phone.replace(/\s/g, '')}`} className={cn('grid size-11 place-items-center rounded-xl transition', dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-ink-900 shadow-soft hover:text-brand-700')} aria-label={`Call ${person.name} (demo number)`}><Phone className="size-[18px]" /></a>
        <a href={`sms:${person.phone.replace(/\s/g, '')}`} className={cn('grid size-11 place-items-center rounded-xl transition', dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-ink-900 shadow-soft hover:text-brand-700')} aria-label={`Message ${person.name} (demo number)`}><MessageSquareText className="size-[18px]" /></a>
      </div>
    </div>
  );
}

/* ---------- Notification visuals ---------- */
export type NotifGroup = 'rides' | 'deliveries' | 'payments' | 'promotions' | 'system';
export const notifMeta: Record<NotificationType, { icon: LucideIcon; tone: string; group: NotifGroup; label: string }> = {
  booking_confirmed: { icon: CalendarCheck, tone: 'bg-brand-50 text-brand-700', group: 'rides', label: 'Booking confirmation' },
  driver_assigned: { icon: UserRound, tone: 'bg-info-bg text-info', group: 'rides', label: 'Driver assignment' },
  driver_arrived: { icon: MapPin, tone: 'bg-go-50 text-go-600', group: 'rides', label: 'Driver arrival' },
  ride_started: { icon: Navigation, tone: 'bg-go-50 text-go-600', group: 'rides', label: 'Ride started' },
  ride_completed: { icon: Flag, tone: 'bg-ok-bg text-ok', group: 'rides', label: 'Ride completed' },
  delivery_collected: { icon: Package, tone: 'bg-amber-50 text-amber-700', group: 'deliveries', label: 'Delivery collected' },
  delivery_in_transit: { icon: Truck, tone: 'bg-go-50 text-go-600', group: 'deliveries', label: 'In transit' },
  delivery_completed: { icon: PackageCheck, tone: 'bg-ok-bg text-ok', group: 'deliveries', label: 'Delivery completed' },
  payment_confirmed: { icon: CreditCard, tone: 'bg-ok-bg text-ok', group: 'payments', label: 'Payment confirmation' },
  booking_cancelled: { icon: CircleX, tone: 'bg-crit-bg text-crit', group: 'rides', label: 'Cancellation' },
  promo: { icon: Gift, tone: 'bg-go-50 text-go-600', group: 'promotions', label: 'Promotion' },
  system: { icon: Bell, tone: 'bg-surface-2 text-ink-800', group: 'system', label: 'Account' },
};
export const notifGroupFor = (type: NotificationType, reference?: string): NotifGroup => {
  const g = notifMeta[type]?.group ?? 'system';
  if (g === 'rides' && reference?.includes('-DL-')) return 'deliveries';
  return g;
};

/* ---------- Loyalty ---------- */
export function loyaltyStatus(points: number) {
  const tiers = loyalty.tiers;
  let idx = 0;
  tiers.forEach((t, i) => { if (points >= t.min) idx = i; });
  const current = tiers[idx];
  const next = tiers[idx + 1];
  const progress = next ? (points - current.min) / (next.min - current.min) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)), toNext: next ? next.min - points : 0, index: idx };
}

/* ---------- Print helper (opens a clean printable window) ---------- */
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function printDocument(title: string, rows: [string, string][], opts: { heading: string; total?: string; note?: string }) {
  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#0b1330;margin:40px;}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #ff6a13;padding-bottom:16px}
.brand{font-weight:800;font-size:24px;color:#0a1640}.brand span{color:#ff6a13}
h1{font-size:18px;margin:24px 0 4px} .muted{color:#7f8aa8;font-size:13px}
table{width:100%;border-collapse:collapse;margin-top:16px} td{padding:10px 0;border-bottom:1px solid #e3e8f2;font-size:14px} td:last-child{text-align:right;font-weight:600}
.total td{font-size:18px;font-weight:800;border-bottom:none} .note{margin-top:24px;padding:12px;border:1px dashed #bdd3ff;background:#eef4ff;border-radius:8px;font-size:12px;color:#153a9c}
</style></head><body>
<div class="top"><div class="brand">Doorstep<span>Go</span></div><div class="muted">${esc(new Date().toLocaleString('en-GB'))}</div></div>
<h1>${esc(opts.heading)}</h1><p class="muted">${esc(title)}</p>
<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
${opts.total ? `<tr class="total"><td>Total</td><td>${esc(opts.total)}</td></tr>` : ''}</table>
<div class="note">${esc(opts.note ?? 'Demonstration receipt — simulated payment. No real money was charged.')}</div>
<script>window.onload=function(){window.focus();window.print();}</script>
</body></html>`);
  w.document.close();
  return true;
}

/* ---------- Confirm dialog ---------- */
export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel?: string; danger?: boolean; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<><Button variant="ghost" onClick={onClose}>Keep it</Button><Button variant={danger ? 'danger' : 'go'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></>}>
      <div className="text-[15px] text-text-2">{body}</div>
    </Modal>
  );
}

/* ---------- Report a problem ---------- */
const problemCategories = [
  { value: 'late', label: 'Driver/rider was late' },
  { value: 'missing', label: 'Package missing or not received' },
  { value: 'delayed', label: 'Delivery delayed' },
  { value: 'damaged', label: 'Item damaged' },
  { value: 'fare', label: 'Fare or payment issue' },
  { value: 'conduct', label: 'Driver/rider conduct' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'other', label: 'Something else' },
];

export function ReportProblemModal({ open, onClose, reference, kind = 'ride', references }: { open: boolean; onClose: () => void; reference?: string; kind?: 'ride' | 'delivery'; references?: { value: string; label: string }[] }) {
  const toast = useToast();
  const [ref, setRef] = useState(reference ?? '');
  const [category, setCategory] = useState(kind === 'delivery' ? 'delayed' : 'late');
  const [details, setDetails] = useState('');
  const [err, setErr] = useState<{ ref?: string; details?: string }>({});
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const e = { ref: (reference ?? ref) ? undefined : 'Choose the booking this is about', details: details.trim().length >= 10 ? undefined : 'Please describe the problem (at least 10 characters)' };
    setErr(e);
    if (e.ref || e.details) return;
    setBusy(true);
    const t = await supportService.complaint({ reference: reference ?? ref, category: problemCategories.find((c) => c.value === category)?.label ?? category, details: details.trim() });
    setBusy(false);
    toast({ title: `Ticket ${t.ticket} opened`, body: 'Our support team will respond shortly (demo).' });
    setDetails('');
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Report a problem" description={reference ? `About ${reference}` : 'Tell us what went wrong and we will look into it.'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={busy} iconLeft={<Megaphone className="size-4" />}>Submit report</Button></>}>
      <div className="space-y-4">
        {!reference && references && <Select label="Booking" required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Select a booking" options={references} error={err.ref} />}
        <Select label="What happened?" required value={category} onChange={(e) => setCategory(e.target.value)} options={problemCategories.filter((c) => kind === 'delivery' || !['missing', 'delayed', 'damaged'].includes(c.value))} />
        <Textarea label="Details" required value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Include times, locations and anything that helps us investigate." error={err.details} maxLength={800} hint={`${details.length}/800`} />
        <p className="text-[13px] text-muted">For urgent safety issues, call support immediately. This demo does not connect to emergency services.</p>
      </div>
    </Modal>
  );
}
