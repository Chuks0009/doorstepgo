/* =====================================================================
   DEMO SEED DATA — fictional customer account & history.
   Dates are generated relative to "now" so the demo always looks current.
   ===================================================================== */
import type { AppNotification, DeliveryBooking, Driver, Merchant, PaymentRecord, QuoteRequest, RideBooking, TimelineEvent, User } from '@/types';
import { estimateDelivery, estimateRide } from '@/services/pricingService';
import { addDays, todayISO } from '@/utils';

const isoAgo = (days: number, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();
const dateIn = (days: number) => addDays(todayISO(), days);
const face = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c8dcff,ffd5b8`;

export const demoDrivers: Driver[] = [
  { id: 'd1', name: 'Ikenna Obi', phone: '0803 000 1101', rating: 4.9, trips: 2140, vehicle: 'Bajaj Boxer 150 · Red', plate: 'AWK-482-KJ', avatar: face('Ikenna'), verifiedDemo: true },
  { id: 'd2', name: 'Chukwudi Eze', phone: '0805 000 2202', rating: 4.8, trips: 1630, vehicle: 'TVS King Keke · Yellow', plate: 'AWK-913-AB', avatar: face('Chukwudi'), verifiedDemo: true },
  { id: 'd3', name: 'Ngozi Okafor', phone: '0807 000 3303', rating: 4.95, trips: 980, vehicle: 'Toyota Hiace · White', plate: 'AWK-221-XY', avatar: face('NgoziO'), verifiedDemo: true },
  { id: 'd4', name: 'Emeka Nwankwo', phone: '0809 000 4404', rating: 4.7, trips: 3120, vehicle: 'Honda ACE 125 · Black', plate: 'AWK-377-GG', avatar: face('EmekaN'), verifiedDemo: true },
  { id: 'd5', name: 'Blessing Udeh', phone: '0802 000 5505', rating: 4.85, trips: 1210, vehicle: 'Qlink Delivery 150 · Orange box', plate: 'AWK-640-DS', avatar: face('Blessing'), verifiedDemo: true },
];

export const demoUser: User = {
  id: 'u-demo',
  name: 'Ada Nwosu',
  email: 'ada.demo@example.com',
  phone: '0803 123 4567',
  role: 'customer',
  avatar: face('AdaNwosu'),
  memberSince: '2025-03-14',
  loyaltyPoints: 3260,
  referralCode: 'ADA-UNIZIK-27',
  savedAddresses: [
    { id: 'sa1', label: 'My lodge', icon: 'home', cityId: 'awka', areaId: 'ifite', junctionId: 'miracle-jn', address: 'Peace Lodge, Room 14, off Miracle Junction, Ifite-Awka' },
    { id: 'sa2', label: 'Faculty', icon: 'work', cityId: 'awka', areaId: 'unizik', junctionId: 'unizik-main-gate', address: 'Faculty of Management Sciences, UNIZIK' },
    { id: 'sa3', label: "Aunty's house", icon: 'star', cityId: 'awka', areaId: 'awka-town', junctionId: 'ziks-ave', address: "9 Zik's Avenue, Awka" },
    { id: 'sa4', label: 'Fabric seller', icon: 'store', cityId: 'awka', areaId: 'awka-town', junctionId: 'eke-awka', address: 'Line B, Shop 14, Eke Awka Market' },
  ],
  favouriteServices: ['moto-express', 'tri-standard', 'market-pickup'],
  preferences: { sms: true, email: true, push: true, whatsapp: true, marketing: false },
};

const rideTimeline = (stage: number, base: number): TimelineEvent[] =>
  ['Booking confirmed', 'Driver assigned', 'Driver arriving', 'Trip started', 'Trip completed'].map((label, i) => ({
    key: `r${i}`,
    label,
    done: i <= stage,
    at: i <= stage ? isoAgo(base, -i * 0.15) : undefined,
  }));

export const deliveryStages = [
  { key: 'received', label: 'Booking received' },
  { key: 'rider_assigned', label: 'Rider assigned' },
  { key: 'heading_to_pickup', label: 'Rider heading to pickup' },
  { key: 'collected', label: 'Package collected' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'approaching', label: 'Rider approaching destination' },
  { key: 'delivered', label: 'Delivery completed' },
] as const;

export const deliveryTimeline = (stageIndex: number, baseDaysAgo: number): TimelineEvent[] =>
  deliveryStages.map((s, i) => ({ key: s.key, label: s.label, done: i <= stageIndex, at: i <= stageIndex ? isoAgo(baseDaysAgo, -i * 0.25) : undefined }));

function ride(partial: Omit<RideBooking, 'fare' | 'timeline'> & { stage: number; ago: number }): RideBooking {
  const { stage, ago, ...rest } = partial;
  const fare = estimateRide({ tierId: rest.tierId, pickup: rest.pickup, dropoff: rest.dropoff, passengers: rest.passengers, tripType: rest.tripType, time: rest.time, vehicles: rest.vehicles })!;
  return { ...rest, fare, timeline: rideTimeline(stage, ago) };
}

export const seedBookings = (): RideBooking[] => [
  ride({ id: 'b1', reference: 'DSG-RD-7KQ4-2M9P', kind: 'motorcycle', tierId: 'moto-express', pickup: demoUser.savedAddresses[0], dropoff: demoUser.savedAddresses[1], date: todayISO(), time: '08:10', passengers: 1, tripType: 'one-way', status: 'driver_arriving', paymentStatus: 'paid_demo', driver: demoDrivers[0], createdAt: isoAgo(0, 1), stage: 2, ago: 0.05 }),
  ride({ id: 'b2', reference: 'DSG-RD-H3TX-8WQ2', kind: 'tricycle', tierId: 'tri-scheduled', pickup: demoUser.savedAddresses[0], dropoff: demoUser.savedAddresses[1], date: dateIn(2), time: '07:15', passengers: 2, tripType: 'return', returnDate: dateIn(2), returnTime: '14:30', recurring: { frequency: 'weekdays', until: dateIn(60) }, status: 'confirmed', paymentStatus: 'unpaid', createdAt: isoAgo(1), stage: 0, ago: 1 }),
  ride({ id: 'b3', reference: 'DSG-RD-P9LM-4CZ7', kind: 'shuttle', tierId: 'sh-group', pickup: demoUser.savedAddresses[0], dropoff: { cityId: 'awka', areaId: 'amansea', junctionId: 'amansea-jn', address: 'Departmental excursion pickup point, Amansea' }, date: dateIn(6), time: '07:30', passengers: 12, tripType: 'return', returnDate: dateIn(6), returnTime: '17:00', vehicles: 1, shuttleType: 'Group Shuttle', instructions: 'Accounting Dept 300L excursion — 12 students. Class rep: 0803 555 0101.', status: 'confirmed', paymentStatus: 'paid_demo', createdAt: isoAgo(2), stage: 0, ago: 2 }),
  ride({ id: 'b4', reference: 'DSG-RD-2NBV-6YHK', kind: 'motorcycle', tierId: 'moto-standard', pickup: demoUser.savedAddresses[1], dropoff: demoUser.savedAddresses[2], date: dateIn(-3), time: '17:45', passengers: 1, tripType: 'one-way', status: 'completed', paymentStatus: 'paid_demo', driver: demoDrivers[3], createdAt: isoAgo(3), stage: 4, ago: 3 }),
  ride({ id: 'b5', reference: 'DSG-RD-Q8RS-1JDE', kind: 'tricycle', tierId: 'tri-commercial', pickup: demoUser.savedAddresses[3], dropoff: demoUser.savedAddresses[0], date: dateIn(-9), time: '11:00', passengers: 1, tripType: 'one-way', instructions: 'Two bales of fabric, please help load.', status: 'completed', paymentStatus: 'paid_demo', driver: demoDrivers[1], createdAt: isoAgo(9), stage: 4, ago: 9 }),
  ride({ id: 'b6', reference: 'DSG-RD-W4KA-9PTF', kind: 'motorcycle', tierId: 'moto-premium', pickup: demoUser.savedAddresses[0], dropoff: { cityId: 'awka', areaId: 'aroma', junctionId: 'regina-jn', address: 'Regina Caeli Junction, Awka' }, date: dateIn(-14), time: '09:30', passengers: 1, tripType: 'one-way', status: 'cancelled', paymentStatus: 'refunded_demo', createdAt: isoAgo(14), stage: 0, ago: 14 }),
  ride({ id: 'b7', reference: 'DSG-RD-C6ZE-3MXN', kind: 'shuttle', tierId: 'sh-private', pickup: demoUser.savedAddresses[0], dropoff: { cityId: 'awka', areaId: 'amawbia', junctionId: 'amawbia-rbt', address: 'Amawbia Roundabout (connect to Onitsha bus)' }, date: dateIn(-21), time: '06:30', passengers: 6, tripType: 'one-way', vehicles: 1, shuttleType: 'Private Shuttle', status: 'completed', paymentStatus: 'paid_demo', driver: demoDrivers[2], createdAt: isoAgo(22), stage: 4, ago: 21 }),
];

function delivery(partial: Omit<DeliveryBooking, 'fare' | 'timeline'> & { stageIndex: number; ago: number }): DeliveryBooking {
  const { stageIndex, ago, ...rest } = partial;
  const fare = estimateDelivery({ pickup: rest.pickup, dropoff: rest.dropoff, size: rest.packageSize, weightKg: rest.weightKg, packages: rest.packages, urgency: rest.urgency, handling: rest.handling, market: rest.market ?? null })!;
  return { ...rest, fare, timeline: deliveryTimeline(stageIndex, ago) };
}

const me = { name: demoUser.name, phone: demoUser.phone, email: demoUser.email };

export const seedDeliveries = (): DeliveryBooking[] => [
  delivery({ id: 'd1', reference: 'DSG-DL-4XKP-7RT2', categoryId: 'market-pickup', sender: me, recipient: me, pickup: demoUser.savedAddresses[3], dropoff: demoUser.savedAddresses[0], packageDescription: '6 yards Ankara fabric (paid) + lining', packageCategory: 'Market goods', packageSize: 'medium', weightKg: 4, packages: 1, pickupMode: 'immediate', date: todayISO(), time: '10:30', urgency: 'express', handling: [], market: { marketName: 'Eke Awka Market', sellerName: 'Mama Uche Fabrics', sellerPhone: '0806 000 7788', stallLocation: 'Line B, Shop 14', task: 'already_purchased' }, stage: 'in_transit', status: 'in_progress', paymentStatus: 'paid_demo', rider: demoDrivers[4], deliveryCode: '4821', createdAt: isoAgo(0, 2), stageIndex: 4, ago: 0.08 }),
  delivery({ id: 'd2', reference: 'DSG-DL-9MZQ-2HWB', categoryId: 'document', sender: me, recipient: { name: 'Mr. K. Obi (Lodge landlord)', phone: '0809 111 2233' }, pickup: demoUser.savedAddresses[1], dropoff: { cityId: 'awka', areaId: 'agu-awka', junctionId: 'secretariat', address: 'Jerome Udoji Secretariat, Awka' }, packageDescription: 'Signed accommodation agreement (sealed envelope)', packageCategory: 'Documents', packageSize: 'envelope', weightKg: 0.3, packages: 1, pickupMode: 'scheduled', date: dateIn(1), time: '09:00', urgency: 'scheduled', handling: ['documents', 'signature'], stage: 'received', status: 'confirmed', paymentStatus: 'unpaid', deliveryCode: '7314', createdAt: isoAgo(0, 5), stageIndex: 0, ago: 0.2 }),
  delivery({ id: 'd3', reference: 'DSG-DL-K2RT-5NVX', categoryId: 'food-grocery', sender: { name: 'Temp Site Foods', phone: '0701 000 3344' }, recipient: me, pickup: { cityId: 'awka', areaId: 'temp-site', junctionId: 'unizik-jn', address: 'Temp Site Foods, UNIZIK Junction' }, dropoff: demoUser.savedAddresses[0], packageDescription: 'Foodstuff & provisions — 3 bags', packageCategory: 'Food & groceries', packageSize: 'medium', weightKg: 9, packages: 3, pickupMode: 'immediate', date: dateIn(-2), time: '16:00', urgency: 'express', handling: ['perishable', 'upright'], stage: 'delivered', status: 'completed', paymentStatus: 'paid_demo', rider: demoDrivers[4], deliveryCode: '1180', proof: { method: 'code', at: isoAgo(2), receivedBy: 'Ada N.' }, createdAt: isoAgo(2, 2), stageIndex: 6, ago: 2 }),
  delivery({ id: 'd4', reference: 'DSG-DL-T7GH-3QPL', categoryId: 'parcel', sender: me, recipient: { name: 'Uche Nwosu', phone: '0812 555 0101' }, pickup: demoUser.savedAddresses[0], dropoff: { cityId: 'awka', areaId: 'okpuno', junctionId: 'goodwill-jn', address: 'Off Goodwill Junction, Okpuno' }, packageDescription: 'Birthday gift box — fragile ceramics', packageCategory: 'Gifts', packageSize: 'small', weightKg: 2, packages: 1, pickupMode: 'scheduled', date: dateIn(-8), time: '10:00', urgency: 'standard', handling: ['fragile', 'insurance'], stage: 'delivered', status: 'completed', paymentStatus: 'paid_demo', rider: demoDrivers[3], deliveryCode: '5530', proof: { method: 'photo', at: isoAgo(6), receivedBy: 'Uche N.' }, createdAt: isoAgo(8), stageIndex: 6, ago: 8 }),
  delivery({ id: 'd5', reference: 'DSG-DL-B5WN-8KCE', categoryId: 'small-package', sender: me, recipient: { name: 'Zainab Y.', phone: '0816 222 9090' }, pickup: demoUser.savedAddresses[1], dropoff: { cityId: 'awka', areaId: 'unizik', junctionId: 'unizik-back-gate', address: 'Female hostel, UNIZIK back gate' }, packageDescription: 'Phone charger & power bank', packageCategory: 'Electronics', packageSize: 'small', weightKg: 1, packages: 1, pickupMode: 'immediate', date: dateIn(-16), time: '13:20', urgency: 'standard', handling: [], stage: 'received', status: 'cancelled', paymentStatus: 'refunded_demo', deliveryCode: '6612', createdAt: isoAgo(16), stageIndex: 0, ago: 16 }),
];

export const seedNotifications = (): AppNotification[] => [
  { id: 'n1', type: 'driver_arrived', title: 'Your rider is 2 minutes away', body: 'Ikenna (AWK-482-KJ, red Bajaj Boxer) is approaching Miracle Junction, Ifite.', createdAt: isoAgo(0, 0.05), read: false, channels: ['in_app', 'push', 'sms'], link: '/dashboard/bookings/b1', reference: 'DSG-RD-7KQ4-2M9P' },
  { id: 'n2', type: 'delivery_in_transit', title: 'Market pickup in transit', body: 'Your fabric from Eke Awka Market has been collected and is on the way to Ifite. Delivery code: 4821.', createdAt: isoAgo(0, 0.6), read: false, channels: ['in_app', 'whatsapp'], link: '/track-delivery?ref=DSG-DL-4XKP-7RT2', reference: 'DSG-DL-4XKP-7RT2' },
  { id: 'n3', type: 'driver_assigned', title: 'Rider assigned', body: 'Ikenna Obi (4.9★) has accepted your Express Motorcycle booking.', createdAt: isoAgo(0, 0.4), read: false, channels: ['in_app', 'push'], link: '/dashboard/bookings/b1', reference: 'DSG-RD-7KQ4-2M9P' },
  { id: 'n4', type: 'payment_confirmed', title: 'Payment received (demo)', body: '₦1,150 simulated payment for DSG-RD-7KQ4-2M9P. No real money was charged.', createdAt: isoAgo(0, 1), read: true, channels: ['in_app', 'email'], reference: 'DSG-RD-7KQ4-2M9P' },
  { id: 'n5', type: 'booking_confirmed', title: 'Lecture-day keke confirmed', body: 'Weekday tricycle trips from your lodge to campus start in 2 days at 7:15 AM. We will remind you 30 minutes before.', createdAt: isoAgo(1), read: true, channels: ['in_app', 'email', 'sms'], link: '/dashboard/bookings/b2', reference: 'DSG-RD-H3TX-8WQ2' },
  { id: 'n6', type: 'delivery_completed', title: 'Groceries delivered', body: 'Temp Site Foods order delivered and confirmed with code 1180. Rate your rider?', createdAt: isoAgo(2), read: true, channels: ['in_app', 'push'], reference: 'DSG-DL-K2RT-5NVX' },
  { id: 'n7', type: 'ride_completed', title: 'Trip completed', body: "You arrived at Zik's Avenue. Thanks for riding with Emeka!", createdAt: isoAgo(3), read: true, channels: ['in_app'], reference: 'DSG-RD-2NBV-6YHK' },
  { id: 'n8', type: 'promo', title: 'Weekend market runs: ₦200 off', body: 'Use DOORSTEP200 on any delivery above ₦1,500 this weekend. Students: UNIZIK10 saves 10% on rides.', createdAt: isoAgo(4), read: true, channels: ['in_app', 'email'] },
  { id: 'n9', type: 'booking_cancelled', title: 'Booking cancelled & refunded (demo)', body: 'DSG-RD-W4KA-9PTF was cancelled within the free window. Simulated refund issued.', createdAt: isoAgo(14), read: true, channels: ['in_app', 'email'], reference: 'DSG-RD-W4KA-9PTF' },
];

export const seedPayments = (): PaymentRecord[] => [
  { id: 'p1', reference: 'DSG-PY-A1B2-C3D4', bookingReference: 'DSG-RD-7KQ4-2M9P', amount: 1150, method: 'card', status: 'paid_demo', createdAt: isoAgo(0, 1), description: 'Express Motorcycle · Ifite → UNIZIK', demo: true },
  { id: 'p2', reference: 'DSG-PY-E5F6-G7H8', bookingReference: 'DSG-DL-4XKP-7RT2', amount: 1850, method: 'bank_transfer', status: 'paid_demo', createdAt: isoAgo(0, 2), description: 'Market Pickup · Eke Awka → Ifite', demo: true },
  { id: 'p3', reference: 'DSG-PY-J9K2-L3M4', bookingReference: 'DSG-RD-P9LM-4CZ7', amount: 14200, method: 'card', status: 'paid_demo', createdAt: isoAgo(2), description: 'Group Shuttle · Ifite → Amansea excursion', demo: true },
  { id: 'p4', reference: 'DSG-PY-N5P6-Q7R8', bookingReference: 'DSG-DL-K2RT-5NVX', amount: 1600, method: 'mobile_money', status: 'paid_demo', createdAt: isoAgo(2, 2), description: 'Food & Grocery · Temp Site → Ifite', demo: true },
  { id: 'p5', reference: 'DSG-PY-S9T2-U3V4', bookingReference: 'DSG-RD-2NBV-6YHK', amount: 750, method: 'cash', status: 'paid_demo', createdAt: isoAgo(3), description: "Standard Motorcycle · UNIZIK → Zik's Avenue", demo: true },
  { id: 'p6', reference: 'DSG-PY-W5X6-Y7Z8', bookingReference: 'DSG-RD-W4KA-9PTF', amount: 950, method: 'card', status: 'refunded_demo', createdAt: isoAgo(14), description: 'Premium Motorcycle · refunded', demo: true },
];

export const seedQuotes = (): QuoteRequest[] => [
  { id: 'q1', reference: 'DSG-QT-8HJK-2LMN', fullName: 'Folake Adeyemi', email: 'folake@example.com', phone: '0803 444 1212', customerType: 'business', companyName: 'UNIZIK Accounting Students Association', serviceCategory: 'Scheduled Shuttle', passengers: 45, pickup: { cityId: 'awka', junctionId: 'unizik-main-gate', address: 'UNIZIK main gate' }, dropoff: { cityId: 'awka', junctionId: 'ekwueme-square', address: 'Alex Ekwueme Square, Awka' }, date: dateIn(10), time: '06:45', arrangement: 'scheduled', description: 'Shuttles for departmental week events — 3 days, morning & evening loops.', requirements: 'Branded banner on each bus', status: 'new', createdAt: isoAgo(0, 3) },
  { id: 'q2', reference: 'DSG-QT-3PQR-7STU', fullName: 'Daniel Okeke', email: 'daniel@example.com', phone: '0805 777 9898', customerType: 'business', companyName: 'Okeke Pharmacy Awka', serviceCategory: 'Business Deliveries', packageDetails: { description: 'Pharmacy restock cartons', size: 'large', weightKg: 25, packages: 12 }, pickup: { cityId: 'awka', junctionId: 'eke-awka', address: 'Okeke Pharmacy store, Eke Awka' }, dropoff: { cityId: 'awka', junctionId: 'miracle-jn', address: '6 partner pharmacies across Ifite & Temp Site' }, date: dateIn(4), time: '08:00', arrangement: 'multi-stop', description: 'Twice-weekly multi-drop pharmacy restock.', status: 'reviewing', createdAt: isoAgo(1) },
  { id: 'q3', reference: 'DSG-QT-5VWX-9YZA', fullName: 'Ruth Bassey', email: 'ruth@example.com', phone: '0807 222 3434', customerType: 'individual', serviceCategory: 'Event Transportation', passengers: 120, pickup: { cityId: 'awka', junctionId: 'regina-jn', address: 'Guest hotel near Regina Caeli' }, dropoff: { cityId: 'awka', junctionId: 'ekwueme-square', address: 'Event venue, Alex Ekwueme Square' }, date: dateIn(18), time: '13:00', returnDate: dateIn(18), arrangement: 'round-trip', description: 'Wedding guests shuttle — loops between hotel and venue.', status: 'quoted', quotedAmount: 185000, createdAt: isoAgo(3) },
  { id: 'q4', reference: 'DSG-QT-1BCD-4EFG', fullName: 'Samuel Ade', email: 'sam@example.com', phone: '0809 101 2020', customerType: 'business', companyName: 'Ade Ventures Awka', serviceCategory: 'Corporate Transportation', passengers: 22, pickup: { cityId: 'awka', junctionId: 'amawbia-rbt', address: 'Staff pickup points, Amawbia' }, dropoff: { cityId: 'awka', junctionId: 'secretariat', address: 'Office near Jerome Udoji Secretariat' }, date: dateIn(7), time: '06:30', arrangement: 'custom-business', description: 'Staff bus, Mon–Fri.', status: 'accepted', quotedAmount: 620000, createdAt: isoAgo(6) },
  { id: 'q5', reference: 'DSG-QT-6HIJ-8KLM', fullName: 'Aisha Lawal', email: 'aisha@example.com', phone: '0811 333 4545', customerType: 'individual', serviceCategory: 'Private Shuttle', passengers: 9, pickup: { cityId: 'awka', junctionId: 'yahoo-jn', address: 'Yahoo Junction, Ifite' }, dropoff: { cityId: 'awka', junctionId: 'amansea-jn', address: 'Amansea (then on to Enugu)' }, date: dateIn(12), time: '07:00', arrangement: 'one-way', description: 'Students travelling home together at end of semester.', status: 'declined', createdAt: isoAgo(9) },
];

export const seedMerchants = (): Merchant[] => [
  { id: 'm1', businessName: 'Mama Uche Fabrics', contactName: 'Uche Okonkwo', email: 'uche@example.com', phone: '0806 000 7788', industry: 'Fashion & textiles', cityId: 'awka', monthlyVolume: '100–500 deliveries', status: 'active', createdAt: isoAgo(40) },
  { id: 'm2', businessName: 'Temp Site Foods', contactName: 'Chidi Okeke', email: 'chidi@example.com', phone: '0701 000 3344', industry: 'Food & provisions', cityId: 'awka', monthlyVolume: '500+ deliveries', status: 'active', createdAt: isoAgo(65) },
  { id: 'm3', businessName: 'Okeke Pharmacy Awka', contactName: 'Daniel Okeke', email: 'daniel@example.com', phone: '0805 777 9898', industry: 'Health & pharmacy', cityId: 'awka', monthlyVolume: '100–500 deliveries', status: 'onboarding', createdAt: isoAgo(5) },
  { id: 'm4', businessName: 'Ifite Gadget Hub', contactName: 'Somto Eze', email: 'somto@example.com', phone: '0803 909 1111', industry: 'Phones & electronics', cityId: 'awka', monthlyVolume: '20–100 deliveries', status: 'lead', createdAt: isoAgo(1) },
];
