/* =====================================================================
   PRICING RULES (ILLUSTRATIVE — NGN)
   ---------------------------------------------------------------------
   These figures drive the demonstration fare estimator. They are NOT real
   tariffs. Final fares will be confirmed by the pricing service once a
   backend exists. Per-tier base/per-km rates live in src/data/services.ts.
   ===================================================================== */
import type { DeliveryUrgency, PackageSize, PaymentMethodOption, PromoCode } from '@/types';

export const pricing = {
  currency: 'NGN' as const,
  serviceChargeRate: 0.03, // 3% platform service charge
  serviceChargeMin: 50,
  bookingFee: 50,
  roundTo: 50, // round totals to nearest ₦50

  ride: {
    extraPassengerRate: 0.18, // +18% of distance fare per extra passenger (tricycle/shuttle shared tiers)
    returnTripMultiplier: 1.85, // return trip discount vs 2× one-way
    multiStopFee: 150, // per additional stop
    intercityThresholdKm: 25,
    intercityPerKm: 95,
    extraVehicleMultiplier: 1, // shuttle: each vehicle priced fully
  },

  surcharges: {
    night: { label: 'Night-time surcharge', from: 22, to: 5, rate: 0.2 },
    peak: { label: 'Peak-hour demand', windows: [[7, 9], [17, 20]] as [number, number][], rate: 0.15 },
    weekend: { label: 'Weekend', rate: 0 },
  },

  delivery: {
    base: 400,
    perKm: 90,
    sizeMultiplier: { envelope: 0.8, small: 1, medium: 1.25, large: 1.6, xl: 2.2 } satisfies Record<PackageSize, number>,
    freeWeightKg: 5,
    perExtraKg: 50,
    extraPackageRate: 0.35, // +35% per additional package
    urgency: {
      standard: { label: 'Standard (within 6 hrs)', multiplier: 1, eta: '3–6 hrs' },
      express: { label: 'Express (within 90 mins)', multiplier: 1.55, eta: '60–90 mins' },
      same_day: { label: 'Same-day', multiplier: 1.2, eta: 'Before 8 PM' },
      scheduled: { label: 'Scheduled', multiplier: 0.95, eta: 'At your chosen time' },
    } satisfies Record<DeliveryUrgency, { label: string; multiplier: number; eta: string }>,
    handling: {
      fragile: { label: 'Fragile — handle with care', fee: 200 },
      perishable: { label: 'Perishable / keep cool', fee: 150 },
      upright: { label: 'Keep upright', fee: 100 },
      documents: { label: 'Confidential documents', fee: 150 },
      insurance: { label: 'Goods-in-transit cover (demo)', fee: 300 },
      signature: { label: 'Signature on delivery', fee: 50 },
    } as Record<string, { label: string; fee: number }>,
    marketPickupFee: 400,
    marketPurchaseAssistFee: 600,
    extraDropFee: 300,
  },

  cancellation: {
    freeWindowMinutes: 5,
    lateFee: 200,
  },
};

export const sizeOptions: { id: PackageSize; label: string; hint: string; maxKg: number }[] = [
  { id: 'envelope', label: 'Envelope', hint: 'Documents, cards, letters', maxKg: 1 },
  { id: 'small', label: 'Small', hint: 'Fits in a backpack · phones, shoes', maxKg: 5 },
  { id: 'medium', label: 'Medium', hint: 'Fits in a delivery box · groceries', maxKg: 15 },
  { id: 'large', label: 'Large', hint: 'Bulky · small appliances, cartons', maxKg: 30 },
  { id: 'xl', label: 'Extra large', hint: 'Tricycle cargo · multiple cartons', maxKg: 80 },
];

export const promoCodes: PromoCode[] = [
  { code: 'WELCOME20', description: '20% off your first booking (max ₦500)', type: 'percent', value: 20, maxDiscount: 500, active: true },
  { code: 'UNIZIK10', description: 'UNIZIK students: 10% off every ride (max ₦300)', type: 'percent', value: 10, maxDiscount: 300, active: true },
  { code: 'DOORSTEP200', description: '₦200 off any delivery above ₦1,500', type: 'flat', value: 200, minSpend: 1500, active: true },
  { code: 'GOBIZ10', description: '10% off business & bulk bookings', type: 'percent', value: 10, maxDiscount: 5000, active: true },
  { code: 'OLDPROMO', description: 'Expired promotion', type: 'flat', value: 300, active: false },
];

/** Configure which payment methods are offered. Flip `enabled` per market. */
export const paymentMethods: PaymentMethodOption[] = [
  { id: 'card', label: 'Debit / credit card', description: 'Visa, Mastercard, Verve', enabled: true, badge: 'Instant' },
  { id: 'bank_transfer', label: 'Bank transfer', description: 'Pay to a one-time virtual account', enabled: true },
  { id: 'ussd', label: 'USSD', description: 'Dial a short code from any bank', enabled: true },
  { id: 'mobile_money', label: 'Mobile money', description: 'OPay, PalmPay, MoMo and more', enabled: true },
  { id: 'wallet', label: 'DoorstepGo wallet', description: 'Use your wallet balance', enabled: true, badge: 'Coming soon' },
  { id: 'cash', label: 'Cash on completion', description: 'Pay the rider in cash', enabled: true },
];

export const loyalty = {
  pointsPerNaira: 1 / 50, // 1 point per ₦50 spent
  redeemRate: 1, // 1 point = ₦1
  referralReward: 300,
  tiers: [
    { name: 'Go', min: 0 },
    { name: 'Go+', min: 1500 },
    { name: 'Go Gold', min: 5000 },
    { name: 'Go Platinum', min: 12000 },
  ],
};
