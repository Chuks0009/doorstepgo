import { clsx, type ClassValue } from 'clsx';
import { site } from '@/config/site';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/* ---------- Money ---------- */
const nf = new Intl.NumberFormat(site.currency.locale, { maximumFractionDigits: 0 });
export const naira = (amount: number) => `${site.currency.symbol}${nf.format(Math.round(amount))}`;
export const compactNaira = (amount: number) =>
  amount >= 1_000_000 ? `${site.currency.symbol}${(amount / 1_000_000).toFixed(1)}M` : amount >= 10_000 ? `${site.currency.symbol}${Math.round(amount / 1000)}k` : naira(amount);
export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/* ---------- Dates ---------- */
export const todayISO = () => toISODate(new Date());
export const toISODate = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
};
export const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toISODate(d);
};
export const formatDate = (iso?: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!iso) return '—';
  const d = iso.length === 10 ? new Date(iso + 'T12:00:00') : new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', opts);
};
export const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
export const formatTime = (hhmm?: string) => {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};
export const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return formatDate(iso);
};
export const nowTimePlus = (minutes: number) => {
  const d = new Date(Date.now() + minutes * 60_000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); // rolls over the hour correctly
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/* ---------- References & IDs ---------- */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rand = (n: number) => Array.from({ length: n }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
/** Demonstration reference — e.g. DSG-RD-7KQ4-2M9P. Generated locally; not a real booking. */
export const makeReference = (prefix: 'RD' | 'DL' | 'QT' | 'PY' | 'MC' | 'TK' = 'RD') => `DSG-${prefix}-${rand(4)}-${rand(4)}`;
export const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${rand(8)}`);
export const deliveryCode = () => String(Math.floor(1000 + Math.random() * 9000));

/* ---------- Geo ---------- */
export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/* ---------- Strings ---------- */
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
export const titleCase = (s: string) => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const pluralize = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const maskPhone = (p: string) => p.replace(/(\d{3})\d{4}(\d{2,})$/, '$1••••$2');

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
