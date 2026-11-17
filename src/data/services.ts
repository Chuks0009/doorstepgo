/* Service catalogue — tiers, categories and marketing copy.
   Prices are illustrative demonstration values (NGN). */
import type { ServiceKind, ServiceTier } from '@/types';
import { images, type StockImage } from './images';

type Cat = keyof typeof images;
/** Safe image picker — falls back gracefully if a category has fewer images. */
export const pic = (cat: Cat, i: number): StockImage => {
  const list = images[cat] as StockImage[];
  return list[i % Math.max(list.length, 1)] ?? { id: 'fallback', src: '', alt: '', credit: '' };
};

const tier = (t: Omit<ServiceTier, 'image' | 'imageAlt'> & { img: StockImage }): ServiceTier => ({
  ...t,
  image: t.img.src,
  imageAlt: t.img.alt,
});

export const motorcycleTiers: ServiceTier[] = [
  tier({ id: 'moto-standard', kind: 'motorcycle', name: 'Standard Motorcycle', tagline: 'Everyday quick hops', description: 'Affordable point-to-point rides around Awka with a helmeted, trained rider — Ifite to campus, Temp Site to Eke Awka, wherever you need to be.', img: pic('motorcycle', 0), capacity: 1, capacityLabel: '1 passenger', eta: '3–6 min', baseFare: 200, perKm: 80, perMin: 5, minFare: 400, multiplier: 1, features: ['Spare helmet & hairnet', 'Cashless or cash', 'Live trip sharing'], popular: true, badge: 'Most booked' }),
  tier({ id: 'moto-premium', kind: 'motorcycle', name: 'Premium Motorcycle', tagline: 'Newer bikes, top-rated riders', description: 'Late-model motorcycles, 4.8★+ riders, fresh hygiene kits and a smoother ride for when comfort matters.', img: pic('motorcycle', 1), capacity: 1, capacityLabel: '1 passenger', eta: '5–9 min', baseFare: 300, perKm: 100, perMin: 6, minFare: 600, multiplier: 1.25, features: ['Late-model bikes', 'Top-rated riders', 'Rain cover on request'], badge: 'Comfort' }),
  tier({ id: 'moto-express', kind: 'motorcycle', name: 'Express Motorcycle', tagline: 'Priority dispatch', description: 'Jump the queue with priority matching and the fastest available rider when every minute counts.', img: pic('motorcycle', 2), capacity: 1, capacityLabel: '1 passenger', eta: '2–4 min', baseFare: 350, perKm: 110, perMin: 6, minFare: 700, multiplier: 1.4, features: ['Priority matching', 'Fastest route', 'Arrival guarantee window'], badge: 'Fastest' }),
  tier({ id: 'moto-scheduled', kind: 'motorcycle', name: 'Scheduled Motorcycle', tagline: 'Book ahead, ride on time', description: 'Reserve a rider up to 14 days ahead for 8 AM lectures, exams, early meetings or recurring trips between your lodge and campus.', img: pic('motorcycle', 3), capacity: 1, capacityLabel: '1 passenger', eta: 'At your time', baseFare: 250, perKm: 85, perMin: 5, minFare: 500, multiplier: 1.1, features: ['Up to 14 days ahead', 'Recurring trips', 'Reminder 30 min before'] }),
  tier({ id: 'moto-business', kind: 'motorcycle', name: 'Business Motorcycle', tagline: 'For teams & errands', description: 'Dedicated riders for staff movement, bank runs and errands with monthly invoicing and trip reports.', img: pic('motorcycle', 4), capacity: 1, capacityLabel: '1 passenger / errand', eta: 'Dedicated', baseFare: 300, perKm: 90, perMin: 5, minFare: 600, multiplier: 1.15, features: ['Monthly invoicing', 'Team accounts', 'Trip reports'], badge: 'Business' }),
];

export const tricycleTiers: ServiceTier[] = [
  tier({ id: 'tri-standard', kind: 'tricycle', name: 'Standard Tricycle', tagline: 'Shared comfort, low fares', description: 'Covered keke rides for up to three passengers — the everyday Ifite ↔ UNIZIK ride, sheltered from sun and rain at a student-friendly price.', img: pic('tricycle', 0), capacity: 3, capacityLabel: 'Up to 3 passengers', eta: '4–8 min', baseFare: 150, perKm: 60, perMin: 4, minFare: 300, multiplier: 1, features: ['Weather cover', 'Room for shopping bags', 'Split fare friendly'], popular: true, badge: 'Popular' }),
  tier({ id: 'tri-premium', kind: 'tricycle', name: 'Premium Tricycle', tagline: 'Cushioned seats & phone charging', description: 'Upgraded tricycles with padded seats, USB charging and side curtains for a cleaner, quieter trip.', img: pic('tricycle', 1), capacity: 3, capacityLabel: 'Up to 3 passengers', eta: '6–10 min', baseFare: 250, perKm: 80, perMin: 5, minFare: 500, multiplier: 1.25, features: ['USB charging', 'Side curtains', 'Top-rated operators'], badge: 'Comfort' }),
  tier({ id: 'tri-commercial', kind: 'tricycle', name: 'Commercial Tricycle', tagline: 'Cargo & market loads', description: 'Cargo-ready tricycles for Eke Awka market goods, cartons and lodge move-ins — with an operator who helps load.', img: pic('tricycle', 2), capacity: 1, capacityLabel: '1 passenger + cargo', eta: '8–15 min', baseFare: 400, perKm: 110, perMin: 6, minFare: 800, multiplier: 1.35, features: ['Up to 250 kg cargo', 'Loading help', 'Tarp cover'], badge: 'Cargo' }),
  tier({ id: 'tri-group', kind: 'tricycle', name: 'Group Transportation', tagline: 'Move your crew together', description: 'Book two or more tricycles that travel together — perfect for course mates, departmental outings and families.', img: pic('tricycle', 3), capacity: 9, capacityLabel: 'Up to 9 (3 vehicles)', eta: '10–15 min', baseFare: 450, perKm: 180, perMin: 12, minFare: 900, multiplier: 1, features: ['Convoy dispatch', 'One booking, one bill', 'Group tracking'] }),
  tier({ id: 'tri-scheduled', kind: 'tricycle', name: 'Scheduled Tricycle', tagline: 'Daily school & office runs', description: 'Plan recurring tricycle trips for lecture days, school pickups or weekly market runs.', img: pic('tricycle', 4), capacity: 3, capacityLabel: 'Up to 3 passengers', eta: 'At your time', baseFare: 200, perKm: 65, perMin: 4, minFare: 400, multiplier: 1.05, features: ['Recurring schedules', 'Same operator where possible', 'SMS reminders'] }),
];

export const shuttleTiers: ServiceTier[] = [
  tier({ id: 'sh-private', kind: 'shuttle', name: 'Private Shuttle', tagline: 'Your own air-conditioned van', description: 'A private air-conditioned minibus with a professional driver, for families and small groups.', img: pic('shuttle', 0), capacity: 14, capacityLabel: 'Up to 14 seats', eta: '20–40 min', baseFare: 5000, perKm: 300, minFare: 8000, multiplier: 1, features: ['Air-conditioned', 'Luggage space', 'Professional driver'], popular: true }),
  tier({ id: 'sh-group', kind: 'shuttle', name: 'Group Shuttle', tagline: 'Shared seats on set routes', description: 'Book seats on shared shuttle routes between busy hubs at a fraction of a private-hire fare.', img: pic('shuttle', 1), capacity: 18, capacityLabel: 'Per-seat booking', eta: 'Scheduled', baseFare: 500, perKm: 40, minFare: 700, multiplier: 1, features: ['Pay per seat', 'Fixed departure times', 'Hub-to-hub'] }),
  tier({ id: 'sh-corporate', kind: 'shuttle', name: 'Corporate Transportation', tagline: 'Staff buses & executive vans', description: 'Staff movement for Awka offices, ministries and businesses with scheduled routes and monthly invoicing.', img: pic('shuttle', 2), capacity: 30, capacityLabel: '7–30 seats', eta: 'Contracted', baseFare: 9000, perKm: 350, minFare: 15000, multiplier: 1.2, features: ['Monthly contracts', 'Branded vehicles', 'Dedicated account manager'], badge: 'Business' }),
  tier({ id: 'sh-airport', kind: 'shuttle', name: 'Airport Pickup', tagline: 'Meet & greet, flight-tracked', description: 'Airport runs between Awka and Anambra (Umueri) or Enugu airports — meet & greet, flight monitoring and luggage help.', img: pic('shuttle', 3), capacity: 7, capacityLabel: 'Up to 7 seats', eta: 'Flight-timed', baseFare: 12000, perKm: 320, minFare: 25000, multiplier: 1.1, features: ['Flight tracking', 'Meet & greet', '60 min free wait'] }),
  tier({ id: 'sh-event', kind: 'shuttle', name: 'Event Transportation', tagline: 'Weddings, conferences, concerts', description: 'Fleets for weddings, convocations, departmental events and conferences around Awka, with loop schedules and one point of contact.', img: pic('shuttle', 4), capacity: 60, capacityLabel: 'Multi-vehicle fleets', eta: 'Planned', baseFare: 15000, perKm: 400, minFare: 30000, multiplier: 1, features: ['Fleet coordination', 'On-site marshal', 'Loop schedules'], badge: 'Quote' }),
  tier({ id: 'sh-scheduled', kind: 'shuttle', name: 'Scheduled Shuttle', tagline: 'Recurring routes you can plan around', description: 'Weekly or daily scheduled shuttles for students, churches, estates and campus groups.', img: pic('shuttle', 5), capacity: 18, capacityLabel: 'Up to 18 seats', eta: 'Timetabled', baseFare: 5500, perKm: 280, minFare: 9000, multiplier: 0.95, features: ['Timetables', 'Term/month passes', 'Route planning'] }),
  tier({ id: 'sh-intercity', kind: 'shuttle', name: 'Intercity Transportation', tagline: 'City to city, door to door', description: 'Door-to-door trips from Awka to Onitsha, Nnewi, Enugu, Asaba and beyond — great for going home on holidays. Request a quote.', img: pic('city', 1), capacity: 14, capacityLabel: 'Up to 14 seats', eta: 'Same/next day', baseFare: 8000, perKm: 250, minFare: 15000, multiplier: 1, features: ['Door-to-door', 'Planned rest stops', 'Luggage included'] }),
];

export interface DeliveryCategory {
  id: string;
  name: string;
  short: string;
  description: string;
  icon: string; // lucide icon name, resolved in UI
  image: string;
  imageAlt: string;
  fromPrice: number;
  eta: string;
  highlight?: boolean;
}

const dc = (c: Omit<DeliveryCategory, 'image' | 'imageAlt'> & { img: StockImage }): DeliveryCategory => ({ ...c, image: c.img.src, imageAlt: c.img.alt });

export const deliveryCategories: DeliveryCategory[] = [
  dc({ id: 'market-pickup', name: 'Market Pickup', short: 'We go to the market for you', description: 'Send a rider to Eke Awka or Ifite market to collect goods you have paid for, pick up from a seller, or buy listed items.', icon: 'ShoppingBasket', img: pic('market', 0), fromPrice: 900, eta: '1–3 hrs', highlight: true }),
  dc({ id: 'food-grocery', name: 'Food & Grocery Pickup', short: 'Restaurants, supermarkets, groceries', description: 'Hot meals and grocery runs from restaurants, supermarkets and stores, kept upright and delivered fast.', icon: 'ShoppingBag', img: pic('delivery', 4), fromPrice: 600, eta: '30–60 min' }),
  dc({ id: 'parcel', name: 'Parcel Delivery', short: 'Boxes and packages, door to door', description: 'Everyday parcels collected at your door and handed to your recipient with a delivery code.', icon: 'Package', img: pic('delivery', 1), fromPrice: 600, eta: '1–4 hrs' }),
  dc({ id: 'document', name: 'Document Delivery', short: 'Contracts, IDs, cheques', description: 'Sealed handling for documents with optional signature on delivery and confidential handling.', icon: 'FileText', img: pic('delivery', 3), fromPrice: 500, eta: '45–90 min' }),
  dc({ id: 'small-package', name: 'Small Package Delivery', short: 'Phones, gifts, accessories', description: 'Backpack-sized items moved quickly by motorcycle — ideal for gifts, gadgets and online orders.', icon: 'Gift', img: pic('delivery', 2), fromPrice: 500, eta: '45–90 min' }),
  dc({ id: 'business', name: 'Business Deliveries', short: 'Stock runs & B2B drops', description: 'Supplier runs from Onitsha-bound parks, shop restocks and B2B drops around Awka with proof of delivery.', icon: 'Building2', img: pic('delivery', 6), fromPrice: 1200, eta: 'Same day' }),
  dc({ id: 'merchant', name: 'Merchant Deliveries', short: 'Fulfil your customer orders', description: 'For campus vendors, online sellers and shops — bulk drops to many lodges at once and cash-on-delivery support (demo).', icon: 'Store', img: pic('people', 1), fromPrice: 700, eta: 'Same day' }),
  dc({ id: 'scheduled', name: 'Scheduled Deliveries', short: 'Pick a date and time slot', description: 'Book a collection window days in advance for planned deliveries and recurring drops.', icon: 'CalendarClock', img: pic('delivery', 5), fromPrice: 600, eta: 'Your slot' }),
  dc({ id: 'express', name: 'Express Deliveries', short: 'Priority rider, no stops', description: 'Dedicated rider goes straight from pickup to drop-off with no other stops in between.', icon: 'Zap', img: pic('motorcycle', 5), fromPrice: 1000, eta: '60–90 min', highlight: true }),
  dc({ id: 'same-day', name: 'Same-Day Delivery', short: 'Book by 2 PM, delivered by 8 PM', description: 'Within-city delivery guaranteed the same day for bookings made before 2 PM.', icon: 'Timer', img: pic('delivery', 7), fromPrice: 700, eta: 'Before 8 PM' }),
];

export const packageCategories = ['Documents', 'Electronics', 'Clothing & fashion', 'Food & groceries', 'Market goods', 'Health & pharmacy', 'Books & stationery', 'Household items', 'Gifts', 'Spare parts', 'Other'];

export const allTiers = [...motorcycleTiers, ...tricycleTiers, ...shuttleTiers];
export const tiersByKind: Record<Exclude<ServiceKind, 'delivery'>, ServiceTier[]> = {
  motorcycle: motorcycleTiers,
  tricycle: tricycleTiers,
  shuttle: shuttleTiers,
};
export const findTier = (id?: string) => allTiers.find((t) => t.id === id);
export const findDeliveryCategory = (id?: string) => deliveryCategories.find((c) => c.id === id);

/** Top-level service overview cards (Services page, nav, homepage). */
export const serviceOverview = [
  { kind: 'motorcycle' as const, to: '/services/motorcycle', title: 'Motorcycle Rides', short: 'Beat traffic on two wheels', description: 'Fast, affordable rides around Ifite, UNIZIK and Awka with trained, helmeted riders.', icon: 'Bike', img: pic('motorcycle', 0), from: 400, eta: '2–5 min' },
  { kind: 'tricycle' as const, to: '/services/tricycle', title: 'Tricycle Rides', short: 'Covered, shared & cargo keke', description: 'Covered keke for up to three passengers — the everyday Ifite ↔ campus ride — plus cargo keke for market loads.', icon: 'CarTaxiFront', img: pic('tricycle', 0), from: 300, eta: '3–6 min' },
  { kind: 'shuttle' as const, to: '/services/shuttle', title: 'Shuttles & Groups', short: 'Vans, campus groups & airport runs', description: 'Private and group shuttles for course mates and events, airport runs and trips home from Awka.', icon: 'Bus', img: pic('shuttle', 0), from: 700, eta: 'Scheduled' },
  { kind: 'delivery' as const, to: '/services/delivery', title: 'Delivery & Logistics', short: 'Parcels, market & business drops', description: 'Eke Awka market pickups, parcels, documents and food delivered to your lodge or doorstep.', icon: 'Package', img: pic('delivery', 0), from: 500, eta: '30 min+' },
];
