/* =====================================================================
   Domain types — shared between UI, mock services and (later) real APIs.
   ===================================================================== */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string;

/* ---------- Locations ---------- */
export interface Junction { id: ID; name: string; landmark?: string }
export interface Area { id: ID; name: string; lat: number; lng: number; junctions: Junction[] }
export interface City { id: ID; name: string; state: string; country: string; active: boolean; areas: Area[]; lat: number; lng: number }

export interface LocationPoint {
  cityId: ID;
  areaId?: ID;
  junctionId: ID;
  address: string;
}

export interface SavedAddress extends LocationPoint {
  id: ID;
  label: string; // "Home", "Office"
  icon?: 'home' | 'work' | 'star' | 'store';
}

/* ---------- Services & vehicles ---------- */
export type ServiceKind = 'motorcycle' | 'tricycle' | 'shuttle' | 'delivery';
export type RideKind = Exclude<ServiceKind, 'delivery'>;

export interface ServiceTier {
  id: ID;
  kind: ServiceKind;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  capacity: number; // passengers (or packages for delivery)
  capacityLabel: string;
  eta: string; // "3–6 min"
  baseFare: number; // NGN
  perKm: number;
  perMin?: number;
  minFare: number;
  multiplier: number;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export type TripType = 'one-way' | 'return';

/* ---------- Bookings ---------- */
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'cancellation_requested'
  | 'modification_requested';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid_demo' | 'refunded_demo' | 'failed';

export interface FareLine { label: string; amount: number; hint?: string }

export interface FareEstimate {
  distanceKm: number;
  durationMin: number;
  lines: FareLine[];
  subtotal: number;
  serviceCharge: number;
  discount: number;
  total: number;
  currency: 'NGN';
  isEstimate: true;
}

export interface Driver {
  id: ID;
  name: string;
  phone: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  avatar: string;
  verifiedDemo: boolean; // interface demo only — no real verification yet
}

export interface RideBooking {
  id: ID;
  reference: string;
  kind: RideKind;
  tierId: ID;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  stops?: LocationPoint[];
  date: ISODate;
  time: string; // HH:mm
  passengers: number;
  tripType: TripType;
  returnDate?: ISODate;
  returnTime?: string;
  vehicles?: number;
  shuttleType?: string;
  instructions?: string;
  recurring?: { frequency: 'daily' | 'weekdays' | 'weekly'; until?: ISODate };
  fare: FareEstimate;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  driver?: Driver;
  createdAt: ISODateTime;
  timeline: TimelineEvent[];
}

/* ---------- Deliveries ---------- */
export type PackageSize = 'envelope' | 'small' | 'medium' | 'large' | 'xl';
export type DeliveryUrgency = 'standard' | 'express' | 'same_day' | 'scheduled';
export type PickupMode = 'immediate' | 'scheduled';

export type DeliveryStage =
  | 'received'
  | 'rider_assigned'
  | 'heading_to_pickup'
  | 'collected'
  | 'in_transit'
  | 'approaching'
  | 'delivered';

export type MarketTask = 'already_purchased' | 'collect_from_seller' | 'purchase_items' | 'assist_collection';

export interface Contact { name: string; phone: string; email?: string }

export interface MarketPickupDetails {
  marketName: string;
  sellerName?: string;
  sellerPhone?: string;
  stallLocation?: string;
  task: MarketTask;
  itemsList?: string;
  budget?: number;
}

export interface DeliveryBooking {
  id: ID;
  reference: string;
  categoryId: ID;
  sender: Contact;
  recipient: Contact;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  extraDropoffs?: (LocationPoint & { recipient: Contact })[];
  packageDescription: string;
  packageCategory: string;
  packageSize: PackageSize;
  weightKg: number;
  packages: number;
  pickupMode: PickupMode;
  date: ISODate;
  time: string;
  urgency: DeliveryUrgency;
  handling: string[];
  instructions?: string;
  market?: MarketPickupDetails;
  fare: FareEstimate;
  stage: DeliveryStage;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  rider?: Driver;
  deliveryCode: string;
  proof?: { method: 'code' | 'photo' | 'signature'; at: ISODateTime; receivedBy?: string };
  createdAt: ISODateTime;
  timeline: TimelineEvent[];
}

export interface TimelineEvent { key: string; label: string; at?: ISODateTime; done: boolean; note?: string }

/* ---------- Quotes ---------- */
export type CustomerType = 'individual' | 'business';
export type TripArrangement = 'one-way' | 'round-trip' | 'shuttle' | 'multi-stop' | 'scheduled' | 'custom-business';
export type QuoteStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined';

export interface QuoteRequest {
  id: ID;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  companyName?: string;
  serviceCategory: string;
  passengers?: number;
  packageDetails?: { description: string; size: PackageSize; weightKg: number; packages: number };
  pickup: LocationPoint;
  dropoff: LocationPoint;
  date: ISODate;
  time: string;
  returnDate?: ISODate;
  arrangement: TripArrangement;
  requirements?: string;
  description: string;
  status: QuoteStatus;
  quotedAmount?: number;
  createdAt: ISODateTime;
}

/* ---------- Users & roles ---------- */
export type Role = 'customer' | 'merchant' | 'admin' | 'dispatcher' | 'driver';

export interface User {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  memberSince: ISODate;
  loyaltyPoints: number;
  referralCode: string;
  savedAddresses: SavedAddress[];
  favouriteServices: ID[];
  preferences: { sms: boolean; email: boolean; push: boolean; whatsapp: boolean; marketing: boolean };
}

/* ---------- Notifications ---------- */
export type NotificationType =
  | 'booking_confirmed'
  | 'driver_assigned'
  | 'driver_arrived'
  | 'ride_started'
  | 'ride_completed'
  | 'delivery_collected'
  | 'delivery_in_transit'
  | 'delivery_completed'
  | 'payment_confirmed'
  | 'booking_cancelled'
  | 'promo'
  | 'system';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'whatsapp';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
  channels: NotificationChannel[];
  link?: string;
  reference?: string;
}

/* ---------- Payments ---------- */
export type PaymentMethodKind = 'card' | 'bank_transfer' | 'mobile_money' | 'wallet' | 'ussd' | 'cash';

export interface PaymentMethodOption {
  id: PaymentMethodKind;
  label: string;
  description: string;
  enabled: boolean;
  badge?: string;
}

export interface PaymentRecord {
  id: ID;
  reference: string;
  bookingReference: string;
  amount: number;
  method: PaymentMethodKind;
  status: PaymentStatus;
  createdAt: ISODateTime;
  description: string;
  demo: true;
}

export interface PromoCode { code: string; description: string; type: 'percent' | 'flat'; value: number; maxDiscount?: number; minSpend?: number; active: boolean }

/* ---------- Content ---------- */
export interface Testimonial {
  id: ID;
  name: string;
  location: string;
  avatar: string;
  service: string;
  rating: number;
  date: ISODate;
  quote: string;
  demo: true; // fictional demonstration content
}

export interface FaqItem { id: ID; category: string; question: string; answer: string }

export interface TeamMember { id: ID; name: string; role: string; bio: string; avatarSeed: string; skin: string; hair: string; accent: string; links?: { linkedin?: string; x?: string } }

/* ---------- Merchants ---------- */
export interface Merchant {
  id: ID;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  cityId: ID;
  monthlyVolume: string;
  status: 'lead' | 'onboarding' | 'active' | 'paused';
  createdAt: ISODateTime;
}

/* ---------- Generic ---------- */
export interface NavLink { label: string; to: string; description?: string; icon?: string; badge?: string }
export interface Result<T> { ok: true; data: T }
export interface Failure { ok: false; error: string }
export type ServiceResult<T> = Result<T> | Failure;
