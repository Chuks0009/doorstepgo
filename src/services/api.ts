/* =====================================================================
   MOCK API LAYER
   ---------------------------------------------------------------------
   Every function here mirrors a future backend endpoint and returns a
   Promise, so swapping to real HTTP calls (fetch/axios to your API) is a
   drop-in change. Data persists only in this browser (localStorage).
   Nothing here dispatches real drivers, charges money or sends messages.
   ===================================================================== */
import type {
  AppNotification, BookingStatus, DeliveryBooking, DeliveryStage, Merchant, NotificationType, PaymentMethodKind,
  PaymentRecord, QuoteRequest, RideBooking, SavedAddress, ServiceResult, User,
} from '@/types';
import { KEYS, storage } from './storage';
import { demoDrivers, demoUser, deliveryStages, deliveryTimeline, seedBookings, seedDeliveries, seedMerchants, seedNotifications, seedPayments, seedQuotes } from '@/data/seed';
import { deliveryCode, makeReference, sleep, uid } from '@/utils';
import { pricing } from '@/config/pricing';

const LATENCY = 450;
const now = () => new Date().toISOString();

/* ---------- Seeding ---------- */
let seeded = false;
export function ensureSeed() {
  if (seeded) return;
  seeded = true;
  storage.seed(KEYS.bookings, seedBookings());
  storage.seed(KEYS.deliveries, seedDeliveries());
  storage.seed(KEYS.notifications, seedNotifications());
  storage.seed(KEYS.payments, seedPayments());
  storage.seed(KEYS.quotes, seedQuotes());
  storage.seed(KEYS.merchants, seedMerchants());
  storage.seed(KEYS.users, [{ ...demoUser, password: 'demo1234' }]);
}

const list = <T,>(key: string) => {
  ensureSeed();
  return storage.get<T[]>(key, []);
};

/* ---------- Notifications (channel-agnostic) ---------- */
export interface NotificationDispatcher {
  send(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification>;
}

/** In-app only. Real email/SMS/push/WhatsApp adapters plug in here later. */
export const notificationService: NotificationDispatcher & {
  list(): AppNotification[];
  markRead(id: string): void;
  markAllRead(): void;
  remove(id: string): void;
  clear(): void;
} = {
  async send(n) {
    const item: AppNotification = { ...n, id: uid(), createdAt: now(), read: false };
    storage.update<AppNotification[]>(KEYS.notifications, [], (prev) => [item, ...prev]);
    return item;
  },
  list: () => list<AppNotification>(KEYS.notifications),
  markRead: (id) => storage.update<AppNotification[]>(KEYS.notifications, [], (p) => p.map((x) => (x.id === id ? { ...x, read: true } : x))),
  markAllRead: () => storage.update<AppNotification[]>(KEYS.notifications, [], (p) => p.map((x) => ({ ...x, read: true }))),
  remove: (id) => storage.update<AppNotification[]>(KEYS.notifications, [], (p) => p.filter((x) => x.id !== id)),
  clear: () => storage.set(KEYS.notifications, []),
};

const notify = (type: NotificationType, title: string, body: string, extra: Partial<AppNotification> = {}) =>
  notificationService.send({ type, title, body, channels: ['in_app'], ...extra });

/* ---------- Rides ---------- */
export const bookingService = {
  list: () => list<RideBooking>(KEYS.bookings),
  get: (idOrRef: string) => list<RideBooking>(KEYS.bookings).find((b) => b.id === idOrRef || b.reference.toLowerCase() === idOrRef.toLowerCase()),

  async create(input: Omit<RideBooking, 'id' | 'reference' | 'status' | 'paymentStatus' | 'createdAt' | 'timeline'>): Promise<RideBooking> {
    await sleep(LATENCY);
    const booking: RideBooking = {
      ...input,
      id: uid(),
      reference: makeReference('RD'),
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: now(),
      timeline: [
        { key: 'r0', label: 'Booking received', done: true, at: now() },
        { key: 'r1', label: 'Driver assigned', done: false },
        { key: 'r2', label: 'Driver arriving', done: false },
        { key: 'r3', label: 'Trip started', done: false },
        { key: 'r4', label: 'Trip completed', done: false },
      ],
    };
    storage.update<RideBooking[]>(KEYS.bookings, [], (p) => [booking, ...p]);
    void notify('booking_confirmed', 'Booking received', `Your booking ${booking.reference} has been received (demo).`, { reference: booking.reference, link: `/dashboard/bookings/${booking.id}` });
    return booking;
  },

  update(id: string, patch: Partial<RideBooking>) {
    let out: RideBooking | undefined;
    storage.update<RideBooking[]>(KEYS.bookings, [], (p) => p.map((b) => (b.id === id ? (out = { ...b, ...patch }) : b)));
    return out;
  },

  canCancel: (b: RideBooking) => ['pending', 'confirmed', 'driver_assigned'].includes(b.status),
  canModify: (b: RideBooking) => ['pending', 'confirmed'].includes(b.status),

  async requestCancellation(id: string, reason: string): Promise<ServiceResult<RideBooking>> {
    await sleep(LATENCY);
    const b = bookingService.get(id);
    if (!b || !bookingService.canCancel(b)) return { ok: false, error: 'This booking can no longer be cancelled online.' };
    const freeWindow = (Date.now() - new Date(b.createdAt).getTime()) / 60000 <= pricing.cancellation.freeWindowMinutes || b.status !== 'driver_assigned';
    const next = bookingService.update(id, { status: 'cancelled', paymentStatus: b.paymentStatus === 'paid_demo' ? 'refunded_demo' : b.paymentStatus, instructions: `${b.instructions ?? ''}\n[Cancelled: ${reason}]`.trim() })!;
    void notify('booking_cancelled', 'Booking cancelled', `${b.reference} was cancelled${freeWindow ? ' free of charge' : ''}. ${b.paymentStatus === 'paid_demo' ? 'A simulated refund has been issued.' : ''}`, { reference: b.reference });
    return { ok: true, data: next };
  },

  async requestModification(id: string, changes: { date?: string; time?: string; passengers?: number; note?: string }): Promise<ServiceResult<RideBooking>> {
    await sleep(LATENCY);
    const b = bookingService.get(id);
    if (!b || !bookingService.canModify(b)) return { ok: false, error: 'This booking can no longer be modified online.' };
    const next = bookingService.update(id, { ...changes, status: 'modification_requested' })!;
    void notify('system', 'Modification requested', `We received your change request for ${b.reference}. You will be notified when it is confirmed.`, { reference: b.reference });
    return { ok: true, data: next };
  },

  setStatus(id: string, status: BookingStatus) {
    const b = bookingService.get(id);
    if (!b || b.status === 'cancelled') return; // never progress a cancelled trip
    const order: BookingStatus[] = ['pending', 'driver_assigned', 'driver_arriving', 'in_progress', 'completed'];
    const idx = order.indexOf(status);
    const timeline = b.timeline.map((t, i) => (i <= idx ? { ...t, done: true, at: t.at ?? now() } : t));
    const driver = idx >= 1 ? b.driver ?? demoDrivers[Math.floor(Math.random() * demoDrivers.length)] : b.driver;
    bookingService.update(id, { status, timeline, driver });
  },
};

/* ---------- Deliveries ---------- */
export const deliveryService = {
  list: () => list<DeliveryBooking>(KEYS.deliveries),
  get: (idOrRef: string) => list<DeliveryBooking>(KEYS.deliveries).find((d) => d.id === idOrRef || d.reference.toLowerCase() === idOrRef.toLowerCase()),

  async create(input: Omit<DeliveryBooking, 'id' | 'reference' | 'status' | 'paymentStatus' | 'createdAt' | 'timeline' | 'stage' | 'deliveryCode'>): Promise<DeliveryBooking> {
    await sleep(LATENCY);
    const d: DeliveryBooking = {
      ...input,
      id: uid(),
      reference: makeReference('DL'),
      stage: 'received',
      status: 'pending',
      paymentStatus: 'unpaid',
      deliveryCode: deliveryCode(),
      createdAt: now(),
      timeline: deliveryTimeline(0, 0),
    };
    storage.update<DeliveryBooking[]>(KEYS.deliveries, [], (p) => [d, ...p]);
    void notify('booking_confirmed', 'Delivery booked', `${d.reference} received. Share delivery code ${d.deliveryCode} with your recipient.`, { reference: d.reference, link: `/track-delivery?ref=${d.reference}` });
    return d;
  },

  update(id: string, patch: Partial<DeliveryBooking>) {
    let out: DeliveryBooking | undefined;
    storage.update<DeliveryBooking[]>(KEYS.deliveries, [], (p) => p.map((d) => (d.id === id ? (out = { ...d, ...patch }) : d)));
    return out;
  },

  /** Demo: advance a delivery to the next stage (used by tracking simulator & admin). */
  advance(id: string) {
    const d = deliveryService.get(id);
    if (!d || d.status === 'cancelled' || d.status === 'cancellation_requested') return d;
    const idx = deliveryStages.findIndex((s) => s.key === d.stage);
    if (idx >= deliveryStages.length - 1) return d;
    const next = deliveryStages[idx + 1].key as DeliveryStage;
    const timeline = d.timeline.map((t, i) => (i <= idx + 1 ? { ...t, done: true, at: t.at ?? now() } : t));
    const rider = d.rider ?? (idx + 1 >= 1 ? demoDrivers[4] : undefined);
    const status: BookingStatus = next === 'delivered' ? 'completed' : idx + 1 >= 3 ? 'in_progress' : 'driver_assigned';
    const labels: Partial<Record<DeliveryStage, [NotificationType, string]>> = {
      rider_assigned: ['driver_assigned', 'Rider assigned to your delivery'],
      collected: ['delivery_collected', 'Package collected'],
      in_transit: ['delivery_in_transit', 'Package in transit'],
      delivered: ['delivery_completed', 'Delivery completed'],
    };
    const n = labels[next];
    if (n) void notify(n[0], n[1], `${d.reference}: ${deliveryStages[idx + 1].label}.`, { reference: d.reference, link: `/track-delivery?ref=${d.reference}` });
    return deliveryService.update(id, { stage: next, timeline, rider, status });
  },

  async confirmDelivery(id: string, method: 'code' | 'photo' | 'signature', payload: { code?: string; receivedBy?: string }): Promise<ServiceResult<DeliveryBooking>> {
    await sleep(LATENCY);
    const d = deliveryService.get(id);
    if (!d) return { ok: false, error: 'Delivery not found.' };
    if (method === 'code' && payload.code?.trim() !== d.deliveryCode) return { ok: false, error: 'That delivery code does not match. Ask the recipient to check their SMS.' };
    const timeline = d.timeline.map((t) => ({ ...t, done: true, at: t.at ?? now() }));
    const next = deliveryService.update(id, { stage: 'delivered', status: 'completed', timeline, proof: { method, at: now(), receivedBy: payload.receivedBy } })!;
    void notify('delivery_completed', 'Delivery confirmed', `${d.reference} confirmed by ${method}.`, { reference: d.reference });
    return { ok: true, data: next };
  },
};

/* ---------- Quotes ---------- */
export const quoteService = {
  list: () => list<QuoteRequest>(KEYS.quotes),
  async create(input: Omit<QuoteRequest, 'id' | 'reference' | 'status' | 'createdAt'>): Promise<QuoteRequest> {
    await sleep(LATENCY + 300);
    const q: QuoteRequest = { ...input, id: uid(), reference: makeReference('QT'), status: 'new', createdAt: now() };
    storage.update<QuoteRequest[]>(KEYS.quotes, [], (p) => [q, ...p]);
    return q;
  },
  update(id: string, patch: Partial<QuoteRequest>) {
    storage.update<QuoteRequest[]>(KEYS.quotes, [], (p) => p.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  },
};

/* ---------- Payments (SIMULATED) ---------- */
export interface PaymentGateway {
  /** Real gateways (Paystack, Flutterwave, …) are initialised server-side; the client only receives a checkout URL/reference. */
  charge(input: { bookingReference: string; amount: number; method: PaymentMethodKind; description: string }): Promise<ServiceResult<PaymentRecord>>;
}

export const paymentService: PaymentGateway & { list(): PaymentRecord[] } = {
  list: () => list<PaymentRecord>(KEYS.payments),
  async charge({ bookingReference, amount, method, description }) {
    await sleep(1600);
    const record: PaymentRecord = { id: uid(), reference: makeReference('PY'), bookingReference, amount, method, status: method === 'cash' ? 'pending' : 'paid_demo', createdAt: now(), description, demo: true };
    storage.update<PaymentRecord[]>(KEYS.payments, [], (p) => [record, ...p]);
    const ride = bookingService.get(bookingReference);
    if (ride) bookingService.update(ride.id, { paymentStatus: record.status, status: ride.status === 'pending' ? 'confirmed' : ride.status });
    const del = deliveryService.get(bookingReference);
    if (del) deliveryService.update(del.id, { paymentStatus: record.status, status: del.status === 'pending' ? 'confirmed' : del.status });
    void notify('payment_confirmed', method === 'cash' ? 'Cash payment selected' : 'Payment successful (demo)', method === 'cash' ? `Pay the rider in cash on completion for ${bookingReference}.` : `Simulated payment for ${bookingReference} recorded. No real money was charged.`, { reference: bookingReference });
    return { ok: true, data: record };
  },
};

/* ---------- Auth (MOCK — replace with a real identity provider) ---------- */
type StoredUser = User & { password: string };
export interface Session { userId: string; token: string; createdAt: string }

export const authService = {
  current(): User | null {
    ensureSeed();
    const s = storage.get<Session | null>(KEYS.session, null);
    if (!s) return null;
    const u = storage.get<StoredUser[]>(KEYS.users, []).find((x) => x.id === s.userId);
    if (!u) return null;
    const { password: _pw, ...user } = u;
    void _pw;
    return user;
  },
  async login(email: string, password: string): Promise<ServiceResult<User>> {
    await sleep(LATENCY + 200);
    ensureSeed();
    const u = storage.get<StoredUser[]>(KEYS.users, []).find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) return { ok: false, error: 'Email or password is incorrect. Try the demo account below.' };
    storage.set<Session>(KEYS.session, { userId: u.id, token: `demo.${uid()}`, createdAt: now() });
    return { ok: true, data: authService.current()! };
  },
  async loginDemo(role: 'customer' | 'admin' = 'customer') {
    ensureSeed();
    if (role === 'admin') {
      const users = storage.get<StoredUser[]>(KEYS.users, []);
      if (!users.some((u) => u.id === 'u-admin')) {
        storage.set(KEYS.users, [...users, { ...demoUser, id: 'u-admin', name: 'Ops Admin', email: 'admin.demo@example.com', role: 'admin' as const, password: 'admin1234' }]);
      }
      storage.set<Session>(KEYS.session, { userId: 'u-admin', token: `demo.${uid()}`, createdAt: now() });
    } else {
      storage.set<Session>(KEYS.session, { userId: demoUser.id, token: `demo.${uid()}`, createdAt: now() });
    }
    return authService.current()!;
  },
  async register(input: { name: string; email: string; phone: string; password: string }): Promise<ServiceResult<User>> {
    await sleep(LATENCY + 300);
    ensureSeed();
    const users = storage.get<StoredUser[]>(KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) return { ok: false, error: 'An account with this email already exists.' };
    const user: StoredUser = {
      ...input,
      id: uid(),
      role: 'customer',
      memberSince: now().slice(0, 10),
      loyaltyPoints: 500,
      referralCode: `${input.name.split(' ')[0].toUpperCase().slice(0, 4)}-GO-${Math.floor(Math.random() * 90 + 10)}`,
      savedAddresses: [],
      favouriteServices: [],
      preferences: { sms: true, email: true, push: true, whatsapp: true, marketing: false },
    };
    storage.set(KEYS.users, [...users, user]);
    storage.set<Session>(KEYS.session, { userId: user.id, token: `demo.${uid()}`, createdAt: now() });
    void notify('system', `Welcome to DoorstepGo, ${input.name.split(' ')[0]}!`, 'You have 500 welcome loyalty points. Use WELCOME20 for 20% off your first booking.');
    return { ok: true, data: authService.current()! };
  },
  logout() {
    storage.remove(KEYS.session);
  },
  updateProfile(patch: Partial<User>) {
    const s = storage.get<Session | null>(KEYS.session, null);
    if (!s) return;
    storage.update<StoredUser[]>(KEYS.users, [], (p) => p.map((u) => (u.id === s.userId ? { ...u, ...patch } : u)));
  },
  saveAddress(addr: Omit<SavedAddress, 'id'> & { id?: string }) {
    const u = authService.current();
    if (!u) return;
    const exists = addr.id && u.savedAddresses.some((a) => a.id === addr.id);
    const savedAddresses = exists ? u.savedAddresses.map((a) => (a.id === addr.id ? { ...a, ...addr, id: a.id } : a)) : [...u.savedAddresses, { ...addr, id: uid() }];
    authService.updateProfile({ savedAddresses });
  },
  removeAddress(id: string) {
    const u = authService.current();
    if (u) authService.updateProfile({ savedAddresses: u.savedAddresses.filter((a) => a.id !== id) });
  },
};

/* ---------- Merchants, contact, newsletter, complaints ---------- */
export const merchantService = {
  list: () => list<Merchant>(KEYS.merchants),
  async register(input: Omit<Merchant, 'id' | 'status' | 'createdAt'>) {
    await sleep(LATENCY + 300);
    const m: Merchant = { ...input, id: uid(), status: 'lead', createdAt: now() };
    storage.update<Merchant[]>(KEYS.merchants, [], (p) => [m, ...p]);
    return { ...m, reference: makeReference('MC') };
  },
  update(id: string, patch: Partial<Merchant>) {
    storage.update<Merchant[]>(KEYS.merchants, [], (p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  },
};

export interface ContactMessage { id: string; reference: string; name: string; email: string; phone?: string; subject: string; category: string; message: string; createdAt: string; status: 'open' | 'resolved' }

export const supportService = {
  messages: () => list<ContactMessage>(KEYS.messages),
  async contact(input: Omit<ContactMessage, 'id' | 'reference' | 'createdAt' | 'status'>) {
    await sleep(LATENCY + 300);
    const m: ContactMessage = { ...input, id: uid(), reference: makeReference('TK'), createdAt: now(), status: 'open' };
    storage.update<ContactMessage[]>(KEYS.messages, [], (p) => [m, ...p]);
    return m;
  },
  resolve(id: string) {
    storage.update<ContactMessage[]>(KEYS.messages, [], (p) => p.map((m) => (m.id === id ? { ...m, status: 'resolved' as const } : m)));
  },
  async subscribe(email: string) {
    await sleep(LATENCY);
    const listNow = storage.get<string[]>(KEYS.newsletter, []);
    if (listNow.includes(email.toLowerCase())) return { ok: false as const, error: 'You are already subscribed.' };
    storage.set(KEYS.newsletter, [...listNow, email.toLowerCase()]);
    return { ok: true as const };
  },
  async complaint(input: { reference: string; category: string; details: string }) {
    await sleep(LATENCY);
    const ticket = { ...input, id: uid(), ticket: makeReference('TK'), createdAt: now() };
    storage.update<unknown[]>(KEYS.complaints, [], (p) => [ticket, ...p]);
    void notify('system', 'Complaint received', `Ticket ${ticket.ticket} opened for ${input.reference}. Our team will respond shortly.`);
    return ticket;
  },
};

/** Clears all demo data and reseeds — used by the "Reset demo" control. */
export function resetDemo() {
  storage.resetAll();
  seeded = false;
  ensureSeed();
}
