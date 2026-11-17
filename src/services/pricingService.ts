/* =====================================================================
   Fare estimation (MOCK).
   Deterministic, rule-based estimates from src/config/pricing.ts and tier
   rates. A future PricingService can call a backend /quotes endpoint with
   routing-engine distances; the interface stays the same.
   ===================================================================== */
import { pricing, promoCodes } from '@/config/pricing';
import { findCity, findJunction } from '@/config/locations';
import { findTier } from '@/data/services';
import type { DeliveryUrgency, FareEstimate, FareLine, LocationPoint, PackageSize, PromoCode, TripType } from '@/types';
import { haversineKm, roundTo } from '@/utils';

export interface RideQuoteInput {
  tierId: string;
  pickup: Partial<LocationPoint>;
  dropoff: Partial<LocationPoint>;
  passengers?: number;
  tripType?: TripType;
  time?: string;
  stops?: number;
  vehicles?: number;
  promo?: PromoCode | null;
}

export interface DeliveryQuoteInput {
  pickup: Partial<LocationPoint>;
  dropoff: Partial<LocationPoint>;
  size: PackageSize;
  weightKg: number;
  packages: number;
  urgency: DeliveryUrgency;
  handling: string[];
  market?: { task?: string } | null;
  extraDrops?: number;
  promo?: PromoCode | null;
}

/** Estimated road distance between two points (km). */
export function estimateDistance(a: Partial<LocationPoint>, b: Partial<LocationPoint>): { km: number; min: number } {
  const pa = findJunction(a.cityId, a.junctionId);
  const pb = findJunction(b.cityId, b.junctionId);
  const ca = findCity(a.cityId);
  const cb = findCity(b.cityId);
  if (!ca || !cb) return { km: 0, min: 0 };

  let km: number;
  if (pa && pb) {
    const straight = haversineKm(pa.area, pb.area);
    // same area → short local hop; otherwise straight-line × road factor
    km = pa.area.id === pb.area.id ? (pa.junction.id === pb.junction.id ? 1.6 : 3.2) : straight * 1.35 + 1.5;
  } else {
    km = ca.id === cb.id ? 7 : haversineKm(ca, cb) * 1.3;
  }
  km = Math.max(1.2, Math.round(km * 10) / 10);
  const speed = km > 60 ? 65 : km > 15 ? 26 : 18; // km/h — city traffic aware
  return { km, min: Math.max(6, Math.round((km / speed) * 60)) };
}

function surcharge(time?: string): FareLine | null {
  if (!time) return null;
  const h = Number(time.split(':')[0]);
  const { night, peak } = pricing.surcharges;
  if (h >= night.from || h < night.to) return { label: night.label, amount: night.rate, hint: '10 PM – 5 AM' };
  if (peak.windows.some(([s, e]) => h >= s && h < e)) return { label: peak.label, amount: peak.rate, hint: '7–9 AM, 5–8 PM' };
  return null;
}

export function applyPromo(subtotal: number, promo?: PromoCode | null) {
  if (!promo || !promo.active) return 0;
  if (promo.minSpend && subtotal < promo.minSpend) return 0;
  const raw = promo.type === 'percent' ? (subtotal * promo.value) / 100 : promo.value;
  return Math.min(raw, promo.maxDiscount ?? Infinity, subtotal);
}

function finalize(lines: FareLine[], distanceKm: number, durationMin: number, promo?: PromoCode | null): FareEstimate {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const serviceCharge = Math.max(pricing.serviceChargeMin, subtotal * pricing.serviceChargeRate);
  const discount = applyPromo(subtotal, promo);
  const total = Math.max(0, roundTo(subtotal + serviceCharge + pricing.bookingFee - discount, pricing.roundTo));
  return {
    distanceKm,
    durationMin,
    lines: lines.map((l) => ({ ...l, amount: Math.round(l.amount) })),
    subtotal: Math.round(subtotal),
    serviceCharge: Math.round(serviceCharge + pricing.bookingFee),
    discount: Math.round(discount),
    total,
    currency: 'NGN',
    isEstimate: true,
  };
}

export function estimateRide(input: RideQuoteInput): FareEstimate | null {
  const tier = findTier(input.tierId);
  if (!tier || !input.pickup.cityId || !input.dropoff.cityId) return null;
  const { km, min } = estimateDistance(input.pickup, input.dropoff);
  const lines: FareLine[] = [];

  lines.push({ label: 'Base fare', amount: tier.baseFare });
  const intercity = km > pricing.ride.intercityThresholdKm;
  const perKm = intercity ? Math.max(tier.perKm, pricing.ride.intercityPerKm) : tier.perKm;
  lines.push({ label: `Distance (${km} km × ₦${perKm})`, amount: km * perKm });
  if (tier.perMin && !intercity) lines.push({ label: `Time (~${min} min)`, amount: min * tier.perMin });

  let core = lines.reduce((s, l) => s + l.amount, 0);
  core = Math.max(core, tier.minFare);
  if (core > lines.reduce((s, l) => s + l.amount, 0)) {
    lines.push({ label: 'Minimum fare adjustment', amount: core - lines.reduce((s, l) => s + l.amount, 0) });
  }

  const passengers = Math.max(1, input.passengers ?? 1);
  if (tier.kind === 'tricycle' && passengers > 1 && tier.id !== 'tri-group') {
    lines.push({ label: `Extra passengers (${passengers - 1})`, amount: core * pricing.ride.extraPassengerRate * (passengers - 1) });
  }
  if (tier.id === 'sh-group') {
    lines[0] = { label: `Seats (${passengers} × base)`, amount: tier.baseFare * passengers };
  }
  const vehicles = Math.max(1, input.vehicles ?? 1);
  if (vehicles > 1) lines.push({ label: `Additional vehicles (${vehicles - 1})`, amount: core * (vehicles - 1) * pricing.ride.extraVehicleMultiplier });
  if (input.stops && input.stops > 0) lines.push({ label: `Extra stops (${input.stops})`, amount: input.stops * pricing.ride.multiStopFee });

  const s = surcharge(input.time);
  if (s) lines.push({ label: s.label, amount: core * s.amount, hint: s.hint });

  if (input.tripType === 'return') {
    const oneWay = lines.reduce((sum, l) => sum + l.amount, 0);
    lines.push({ label: 'Return journey', amount: oneWay * (pricing.ride.returnTripMultiplier - 1), hint: 'Discounted vs. two one-way trips' });
  }
  if (tier.multiplier !== 1) {
    const sub = lines.reduce((sum, l) => sum + l.amount, 0);
    lines.push({ label: `${tier.name} tier`, amount: sub * (tier.multiplier - 1) });
  }
  return finalize(lines, km, min, input.promo);
}

export function estimateDelivery(input: DeliveryQuoteInput): FareEstimate | null {
  if (!input.pickup.cityId || !input.dropoff.cityId) return null;
  const d = pricing.delivery;
  const { km, min } = estimateDistance(input.pickup, input.dropoff);
  const lines: FareLine[] = [
    { label: 'Pickup & base', amount: d.base },
    { label: `Distance (${km} km × ₦${d.perKm})`, amount: km * d.perKm },
  ];
  const sizeMul = d.sizeMultiplier[input.size] ?? 1;
  if (sizeMul !== 1) {
    const sub = lines.reduce((s, l) => s + l.amount, 0);
    lines.push({ label: `Package size (${input.size})`, amount: sub * (sizeMul - 1) });
  }
  const extraKg = Math.max(0, (input.weightKg || 0) - d.freeWeightKg);
  if (extraKg > 0) lines.push({ label: `Extra weight (${extraKg} kg)`, amount: extraKg * d.perExtraKg });
  if (input.packages > 1) {
    const sub = lines.reduce((s, l) => s + l.amount, 0);
    lines.push({ label: `Additional packages (${input.packages - 1})`, amount: sub * d.extraPackageRate * (input.packages - 1) * 0.5 });
  }
  const u = d.urgency[input.urgency];
  if (u && u.multiplier !== 1) {
    const sub = lines.reduce((s, l) => s + l.amount, 0);
    lines.push({ label: u.label, amount: sub * (u.multiplier - 1) });
  }
  for (const h of input.handling) {
    const fee = d.handling[h];
    if (fee) lines.push({ label: fee.label, amount: fee.fee });
  }
  if (input.market) {
    lines.push({ label: 'Market pickup service', amount: d.marketPickupFee });
    if (input.market.task === 'purchase_items' || input.market.task === 'assist_collection') {
      lines.push({ label: 'Purchase assistance', amount: d.marketPurchaseAssistFee, hint: 'Cost of goods paid separately' });
    }
  }
  if (input.extraDrops && input.extraDrops > 0) lines.push({ label: `Extra drop-offs (${input.extraDrops})`, amount: input.extraDrops * d.extraDropFee });
  return finalize(lines, km, min, input.promo);
}

export function lookupPromo(code: string): { ok: true; promo: PromoCode } | { ok: false; error: string } {
  const promo = promoCodes.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (!promo) return { ok: false, error: 'That code is not recognised.' };
  if (!promo.active) return { ok: false, error: 'This promotion has expired.' };
  return { ok: true, promo };
}

/** Starting price helper for marketing cards. */
export const fromPrice = (tierId: string) => findTier(tierId)?.minFare ?? 0;
