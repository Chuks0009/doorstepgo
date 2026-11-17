/* =====================================================================
   Local demo persistence.
   A tiny namespaced key/value store over localStorage with change events,
   so mock services can persist demo data and React hooks can subscribe.
   Swap the mock services for HTTP clients later; components won't change.
   ===================================================================== */

const NS = 'dsg:v2:'; // bumped when seed data changes (v2 = Awka launch)
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const memory = new Map<string, string>(); // fallback when storage is blocked

function rawGet(key: string): string | null {
  try {
    return window.localStorage.getItem(NS + key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function rawSet(key: string, value: string | null) {
  try {
    if (value == null) window.localStorage.removeItem(NS + key);
    else window.localStorage.setItem(NS + key, value);
  } catch {
    if (value == null) memory.delete(key);
    else memory.set(key, value);
  }
}

const cache = new Map<string, unknown>();

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (cache.has(key)) return cache.get(key) as T;
    const raw = rawGet(key);
    if (raw == null) return fallback;
    try {
      const parsed = JSON.parse(raw) as T;
      cache.set(key, parsed);
      return parsed;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    cache.set(key, value);
    rawSet(key, JSON.stringify(value));
    emit(key);
  },
  update<T>(key: string, fallback: T, fn: (prev: T) => T) {
    const next = fn(storage.get(key, fallback));
    storage.set(key, next);
    return next;
  },
  remove(key: string) {
    cache.delete(key);
    rawSet(key, null);
    emit(key);
  },
  /** Seed a key once (first visit) — never overwrites existing data. */
  seed<T>(key: string, value: T) {
    if (rawGet(key) == null && !cache.has(key)) storage.set(key, value);
  },
  subscribe(key: string, fn: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
    return () => listeners.get(key)?.delete(fn);
  },
  resetAll() {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(NS))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    memory.clear();
    const keys = [...cache.keys()];
    cache.clear();
    keys.forEach(emit);
  },
};

function emit(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

// keep tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(NS)) return;
    const key = e.key.slice(NS.length);
    cache.delete(key);
    emit(key);
  });
}

export const KEYS = {
  session: 'session',
  users: 'users',
  bookings: 'bookings',
  deliveries: 'deliveries',
  quotes: 'quotes',
  payments: 'payments',
  notifications: 'notifications',
  merchants: 'merchants',
  messages: 'contact-messages',
  newsletter: 'newsletter',
  complaints: 'complaints',
  recentLocations: 'recent-locations',
  draft: (name: string) => `draft:${name}`,
} as const;
