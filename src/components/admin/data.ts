/* =====================================================================
   Admin console helpers — deterministic synthetic history, fleet roster,
   ETA/delay heuristics and activity feed derivation.
   Everything here is SIMULATED for the demo console; real numbers will
   come from the analytics/dispatch backend later.
   ===================================================================== */
import type { BookingStatus, DeliveryBooking, DeliveryStage, Driver, Merchant, QuoteRequest, RideBooking, RideKind } from '@/types';
import type { ContactMessage } from '@/services/api';
import { demoDrivers, deliveryStages } from '@/data/seed';
import { DEFAULT_CITY, findCity, findJunction } from '@/config/locations';
import type { LocationPoint } from '@/types';
import { addDays, todayISO } from '@/utils';

/* ---------- Deterministic randomness ---------- */
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string | number) {
  let a = typeof seed === 'number' ? seed : hashStr(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Series (validated categorical order: blue, orange, teal, violet) ---------- */
export type SeriesKey = 'motorcycle' | 'tricycle' | 'delivery' | 'shuttle';
export interface SeriesDef { key: SeriesKey; label: string; color: string }
export const SERIES: SeriesDef[] = [
  { key: 'motorcycle', label: 'Motorcycle', color: '#1F5FE6' },
  { key: 'tricycle', label: 'Tricycle', color: '#FF6A13' },
  { key: 'delivery', label: 'Delivery', color: '#0EA5A4' },
  { key: 'shuttle', label: 'Shuttle', color: '#8B5CF6' },
];
export const seriesColor = Object.fromEntries(SERIES.map((s) => [s.key, s.color])) as Record<SeriesKey, string>;
export const kindLabel: Record<RideKind, string> = { motorcycle: 'Motorcycle', tricycle: 'Tricycle', shuttle: 'Shuttle' };

/** Sequential ramp (brand blue, light → dark) for heatmaps. */
export const BLUE_RAMP = ['#eef4ff', '#dbe7ff', '#bdd3ff', '#8fb4ff', '#5b8eff', '#2f7bff', '#1747c9', '#142f78'];

/* ---------- Area weights for synthetic demand (Awka launch market) ---------- */
export const areaWeight: Record<string, number> = {
  ifite: 1, unizik: 0.9, 'temp-site': 0.62, 'awka-town': 0.55, aroma: 0.42, okpuno: 0.3, 'agu-awka': 0.22, amansea: 0.16, amawbia: 0.14, mgbakwu: 0.1,
};
export const avgTicket: Record<SeriesKey, number> = { motorcycle: 2600, tricycle: 2100, delivery: 3200, shuttle: 28000 };

const zero = (): Record<SeriesKey, number> => ({ motorcycle: 0, tricycle: 0, delivery: 0, shuttle: 0 });

/** Synthetic network-wide volume for a date (stable across renders/sessions). */
export function syntheticDay(iso: string, areaId?: string): Record<SeriesKey, number> {
  const r = rng(`day:${iso}:${areaId ?? 'all'}`);
  const dow = new Date(iso + 'T12:00:00').getDay();
  const weekend = dow === 0 || dow === 6;
  const w = areaId ? (areaWeight[areaId] ?? 0) * 0.4 : 1.6;
  const base: Record<SeriesKey, number> = { motorcycle: 46, tricycle: 28, delivery: 38, shuttle: 6 };
  const out = zero();
  (Object.keys(base) as SeriesKey[]).forEach((k) => {
    const wk = k === 'shuttle' ? (weekend ? 1.4 : 1) : weekend ? 0.78 : 1;
    out[k] = Math.round(base[k] * wk * w * (0.78 + r() * 0.44));
  });
  return out;
}

const dayOf = (iso: string) => iso.slice(0, 10);

/** Bookings per day for the last `days` days — synthetic history + real records created in this browser. */
export function dailyVolume(bookings: RideBooking[], deliveries: DeliveryBooking[], days = 14) {
  const today = todayISO();
  return Array.from({ length: days }, (_, i) => {
    const iso = addDays(today, i - days + 1);
    const values = syntheticDay(iso);
    bookings.forEach((b) => dayOf(b.createdAt) === iso && (values[b.kind] += 1));
    deliveries.forEach((d) => dayOf(d.createdAt) === iso && (values.delivery += 1));
    return { iso, values };
  });
}

/** Revenue by service over 30 days (demo) — synthetic + real fares. */
export function revenueByService(bookings: RideBooking[], deliveries: DeliveryBooking[]) {
  const today = todayISO();
  const totals = zero();
  for (let i = 0; i < 30; i++) {
    const v = syntheticDay(addDays(today, -i));
    (Object.keys(v) as SeriesKey[]).forEach((k) => (totals[k] += v[k] * avgTicket[k]));
  }
  bookings.filter((b) => b.status !== 'cancelled').forEach((b) => (totals[b.kind] += b.fare.total));
  deliveries.filter((d) => d.status !== 'cancelled').forEach((d) => (totals.delivery += d.fare.total));
  return totals;
}

/** Area of a location point inside the launch city (explicit area or junction lookup). */
export const areaIdOf = (p: LocationPoint) => (p.cityId === DEFAULT_CITY ? p.areaId ?? findJunction(p.cityId, p.junctionId)?.area.id : undefined);

/** Service mix by Awka area (last 7 days). */
export function mixByArea(bookings: RideBooking[], deliveries: DeliveryBooking[]) {
  const today = todayISO();
  return (findCity(DEFAULT_CITY)?.areas ?? []).map((a) => {
    const values = zero();
    for (let i = 0; i < 7; i++) {
      const v = syntheticDay(addDays(today, -i), a.id);
      (Object.keys(v) as SeriesKey[]).forEach((k) => (values[k] += v[k]));
    }
    bookings.filter((b) => areaIdOf(b.pickup) === a.id).forEach((b) => (values[b.kind] += 1));
    deliveries.forEach((d) => areaIdOf(d.pickup) === a.id && (values.delivery += 1));
    return { id: a.id, label: a.name, values };
  });
}

/** 7×24 hourly demand heatmap (Mon..Sun × 00..23). */
export function hourlyDemand(bookings: RideBooking[], deliveries: DeliveryBooking[]) {
  const grid = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const r = rng(`heat:${d}:${h}`);
      const weekend = d >= 5;
      const night = h < 5 ? 0.05 : h < 6 ? 0.2 : 1;
      const am = Math.exp(-((h - 8) ** 2) / 3) * (weekend ? 0.35 : 1);
      const pm = Math.exp(-((h - 18) ** 2) / 4) * (weekend ? 0.6 : 0.95);
      const mid = Math.exp(-((h - 13) ** 2) / 10) * (weekend ? 0.85 : 0.45);
      return Math.round((am * 120 + pm * 110 + mid * 70 + 8) * night * (0.85 + r() * 0.3));
    }),
  );
  const add = (iso: string, time: string) => {
    const d = (new Date(iso + 'T12:00:00').getDay() + 6) % 7;
    const h = Number(time.slice(0, 2));
    if (grid[d]?.[h] !== undefined) grid[d][h] += 3;
  };
  bookings.forEach((b) => add(b.date, b.time));
  deliveries.forEach((d) => add(d.date, d.time));
  return grid;
}

/** Deterministic trend series ending at `last`. */
export function trend(seed: string, last: number, n = 14, volatility = 0.18) {
  const r = rng(`trend:${seed}`);
  const out: number[] = [];
  let v = last;
  for (let i = 0; i < n; i++) {
    out.unshift(Math.max(0, v));
    v = v * (1 + (r() - 0.55) * volatility);
  }
  out[out.length - 1] = last;
  return out;
}

export const pctDelta = (series: number[]) => {
  const a = series[series.length - 2] ?? 0;
  const b = series[series.length - 1] ?? 0;
  return a === 0 ? 0 : ((b - a) / a) * 100;
};

/* ---------- Fleet roster (demo drivers + synthetic riders) ---------- */
export type RiderStatus = 'online' | 'on_trip' | 'offline';
export type DocState = 'verified' | 'pending' | 'missing' | 'expiring';
export interface RiderMeta { cityId: string; areaId: string; kind: SeriesKey; joined: string; acceptance: number; cancelRate: number; docs: { key: string; label: string; state: DocState }[] }

const face = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c8dcff,ffd5b8`;
const extraRiders: Driver[] = [
  { id: 'x1', name: 'Chinedu Eze', phone: '0803 000 6606', rating: 4.82, trips: 1874, vehicle: 'Bajaj Boxer 150 · Blue', plate: 'AWK-118-PL', avatar: face('Chinedu'), verifiedDemo: true },
  { id: 'x2', name: 'Uchenna Nwosu', phone: '0805 000 7707', rating: 4.91, trips: 1422, vehicle: 'TVS King Keke · Green', plate: 'AWK-503-HY', avatar: face('Uchenna'), verifiedDemo: true },
  { id: 'x3', name: 'Tobenna Agu', phone: '0807 000 8808', rating: 4.62, trips: 2655, vehicle: 'Honda ACE 125 · Red', plate: 'AWK-771-TB', avatar: face('Tobenna'), verifiedDemo: false },
  { id: 'x4', name: 'Ifeoma Obi', phone: '0809 000 9909', rating: 4.88, trips: 640, vehicle: 'Qlink Delivery 150 · Orange box', plate: 'AWK-214-IO', avatar: face('Ifeoma'), verifiedDemo: true },
  { id: 'x5', name: 'Emeka Nnaji', phone: '0802 000 1010', rating: 4.74, trips: 1190, vehicle: 'Toyota Hiace · Silver', plate: 'AWK-332-EN', avatar: face('Emeka'), verifiedDemo: true },
  { id: 'x6', name: 'Chiamaka Okeke', phone: '0813 000 1212', rating: 4.97, trips: 510, vehicle: 'Bajaj RE Keke · Yellow', plate: 'AWK-640-CO', avatar: face('Chiamaka'), verifiedDemo: false },
  { id: 'x7', name: 'Kelechi Okonkwo', phone: '0814 000 1313', rating: 4.55, trips: 3380, vehicle: 'Bajaj Boxer 150 · Black', plate: 'AWK-985-IM', avatar: face('Kelechi'), verifiedDemo: true },
  { id: 'x8', name: 'Obinna Igwe', phone: '0815 000 1414', rating: 4.8, trips: 870, vehicle: 'Qlink Delivery 150 · Orange box', plate: 'AWK-127-OG', avatar: face('Obinna'), verifiedDemo: true },
  { id: 'x9', name: 'Adaeze Okafor', phone: '0816 000 1515', rating: 4.86, trips: 290, vehicle: 'Toyota Coaster · White', plate: 'AWK-402-AO', avatar: face('Adaeze'), verifiedDemo: false },
];

export const fleet: Driver[] = [...demoDrivers, ...extraRiders];

const metaSeed: Record<string, [string, SeriesKey]> = {
  d1: ['ifite', 'motorcycle'], d2: ['unizik', 'tricycle'], d3: ['temp-site', 'shuttle'], d4: ['awka-town', 'motorcycle'], d5: ['ifite', 'delivery'],
  x1: ['ifite', 'motorcycle'], x2: ['unizik', 'tricycle'], x3: ['aroma', 'motorcycle'], x4: ['awka-town', 'delivery'], x5: ['temp-site', 'shuttle'],
  x6: ['ifite', 'tricycle'], x7: ['okpuno', 'motorcycle'], x8: ['agu-awka', 'delivery'], x9: ['unizik', 'shuttle'],
};

export const DOC_TYPES = [
  { key: 'licence', label: "Driver's licence" },
  { key: 'vehicle', label: 'Vehicle registration' },
  { key: 'insurance', label: 'Insurance certificate' },
  { key: 'guarantor', label: 'Guarantor form' },
  { key: 'background', label: 'Background check' },
];

export function riderMeta(d: Driver): RiderMeta {
  const r = rng(`rider:${d.id}`);
  const [areaId, kind] = metaSeed[d.id] ?? ['ifite', 'motorcycle'];
  const states: DocState[] = ['verified', 'verified', 'verified', 'pending', 'expiring', 'missing'];
  return {
    cityId: DEFAULT_CITY,
    areaId,
    kind,
    joined: addDays(todayISO(), -Math.round(120 + r() * 900)),
    acceptance: Math.round(82 + r() * 17),
    cancelRate: Math.round(r() * 60) / 10,
    docs: DOC_TYPES.map((t) => ({ ...t, state: d.verifiedDemo ? (r() > 0.82 ? 'expiring' : 'verified') : states[Math.floor(r() * states.length)] })),
  };
}

/** Weekly trips for the last n weeks (synthetic). */
export function riderWeekly(d: Driver, n = 12) {
  const r = rng(`weekly:${d.id}`);
  const base = Math.max(12, d.trips / 70);
  return Array.from({ length: n }, () => Math.round(base * (0.7 + r() * 0.6)));
}

const ACTIVE_RIDE: BookingStatus[] = ['driver_assigned', 'driver_arriving', 'in_progress'];

export function riderStatus(d: Driver, bookings: RideBooking[], deliveries: DeliveryBooking[], overrides: Record<string, RiderStatus>): RiderStatus {
  if (overrides[d.id]) return overrides[d.id];
  if (bookings.some((b) => b.driver?.id === d.id && ACTIVE_RIDE.includes(b.status))) return 'on_trip';
  if (deliveries.some((x) => x.rider?.id === d.id && x.stage !== 'delivered' && x.status !== 'cancelled' && x.stage !== 'received')) return 'on_trip';
  const r = rng(`status:${d.id}:${todayISO()}`)();
  return r > 0.7 ? 'offline' : 'online';
}

/* ---------- Deliveries: stage, ETA & delay heuristics (demo) ---------- */
export const stageIndex = (s: DeliveryStage) => deliveryStages.findIndex((x) => x.key === s);
export const stageLabel = (s: DeliveryStage) => deliveryStages.find((x) => x.key === s)?.label ?? s;
const WINDOW_MIN: Record<DeliveryBooking['urgency'], number> = { express: 90, same_day: 420, standard: 240, scheduled: 180 };

export function deliveryEta(d: DeliveryBooking, now = Date.now()) {
  const idx = stageIndex(d.stage);
  const remaining = deliveryStages.length - 1 - idx;
  const scheduled = new Date(`${d.date}T${d.time}:00`).getTime();
  const due = scheduled + WINDOW_MIN[d.urgency] * 60_000;
  const etaMin = remaining * 11;
  const open = d.stage !== 'delivered' && d.status !== 'cancelled';
  const upcoming = scheduled > now;
  const projected = Math.max(now, scheduled) + etaMin * 60_000;
  const late = open && !upcoming && projected > due;
  return { idx, etaMin, due, upcoming, open, late, lateBy: Math.max(0, Math.round((projected - due) / 60_000)), progress: idx / (deliveryStages.length - 1) };
}

/* ---------- Bookings ---------- */
export const needsApproval = (b: RideBooking) => b.status === 'modification_requested' || b.status === 'cancellation_requested';
export const isUnassigned = (b: RideBooking) => !b.driver && ['pending', 'confirmed', 'modification_requested'].includes(b.status);

/* ---------- Activity feed ---------- */
export interface ActivityItem { id: string; at: string; tone: 'brand' | 'go' | 'ok' | 'warn' | 'crit'; title: string; meta: string; to?: string }

export function buildActivity({ bookings, deliveries, quotes, messages, merchants }: { bookings: RideBooking[]; deliveries: DeliveryBooking[]; quotes: QuoteRequest[]; messages: ContactMessage[]; merchants: Merchant[] }): ActivityItem[] {
  const items: ActivityItem[] = [];
  bookings.forEach((b) =>
    b.timeline.forEach((t) => t.done && t.at && items.push({ id: `${b.id}-${t.key}`, at: t.at, tone: t.key === 'r4' ? 'ok' : 'brand', title: `${t.label}`, meta: `${b.reference} · ${kindLabel[b.kind]}`, to: '/admin/bookings' })),
  );
  deliveries.forEach((d) =>
    d.timeline.forEach((t) => t.done && t.at && items.push({ id: `${d.id}-${t.key}`, at: t.at, tone: t.key === 'delivered' ? 'ok' : 'go', title: t.label, meta: `${d.reference} · ${d.packageCategory}`, to: '/admin/dispatch' })),
  );
  quotes.forEach((q) => items.push({ id: `q-${q.id}`, at: q.createdAt, tone: 'warn', title: `Quote request from ${q.fullName}`, meta: `${q.reference} · ${q.serviceCategory}`, to: '/admin/quotes' }));
  messages.forEach((m) => items.push({ id: `m-${m.id}`, at: m.createdAt, tone: m.status === 'open' ? 'crit' : 'ok', title: `Support: ${m.subject}`, meta: `${m.reference} · ${m.name}`, to: '/admin/support' }));
  merchants.forEach((m) => items.push({ id: `mc-${m.id}`, at: m.createdAt, tone: 'brand', title: `Merchant ${m.status === 'lead' ? 'lead' : 'record'}: ${m.businessName}`, meta: `${m.industry}`, to: '/admin/merchants' }));
  return items.filter((i) => new Date(i.at).getTime() <= Date.now() + 60_000).sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------- Misc ---------- */
export const fmtInt = (n: number) => new Intl.NumberFormat('en-NG').format(Math.round(n));
export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`;
/** wa.me link for a Nigerian local number (0803… → 234803…). */
export const customerWhatsapp = (phone: string, message: string) => {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
};
