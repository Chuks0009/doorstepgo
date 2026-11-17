import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { storage } from '@/services/storage';
import { ensureSeed } from '@/services/api';
import { validate, type Errors, type Schema } from '@/utils/validation';
import { site } from '@/config/site';

/* ---------- Subscribe to a persisted collection ---------- */
export function useStore<T>(key: string, read: () => T): T {
  ensureSeed();
  const cacheRef = useRef<{ v: T; stamp: number } | null>(null);
  const stampRef = useRef(0);
  const subscribe = useCallback(
    (cb: () => void) =>
      storage.subscribe(key, () => {
        stampRef.current++;
        cb();
      }),
    [key],
  );
  const getSnapshot = () => {
    if (!cacheRef.current || cacheRef.current.stamp !== stampRef.current) cacheRef.current = { v: read(), stamp: stampRef.current };
    return cacheRef.current.v;
  };
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ---------- Generic form state + validation ---------- */
export function useForm<V extends Record<string, any>>(initial: V, schema: Schema = {}) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      setErrors((e) => (e[key as string] ? { ...e, ...validate(next, schema, [key as string]) } : e));
      return next;
    });
  }, [schema]);

  const patch = useCallback((p: Partial<V>) => setValues((prev) => ({ ...prev, ...p })), []);

  const blur = useCallback((key: keyof V) => {
    setTouched((t) => ({ ...t, [key as string]: true }));
    setValues((v) => {
      setErrors((e) => ({ ...e, ...validate(v, schema, [key as string]) }));
      return v;
    });
  }, [schema]);

  /** Validate a subset (e.g. one wizard step) or everything. Focuses first invalid field. */
  const check = useCallback((only?: string[]) => {
    const e = validate(values, schema, only);
    setErrors((prev) => {
      const cleared = { ...prev };
      (only ?? Object.keys(schema)).forEach((k) => delete cleared[k]);
      return { ...cleared, ...e };
    });
    const first = Object.keys(e).find((k) => e[k]);
    if (first) {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[name="${first}"], [data-field="${first}"] input, [data-field="${first}"] button, [data-field="${first}"] select`);
        el?.focus({ preventScroll: false });
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }
    return !first;
  }, [values, schema]);

  /** Spread onto <Input/Select/Textarea>: name, value, onChange, onBlur, error. */
  const field = useCallback(<K extends keyof V & string>(key: K) => ({
    name: key,
    value: values[key] ?? '',
    error: errors[key],
    onChange: (e: { target: { value: string; type?: string; checked?: boolean } }) => {
      const t = e.target;
      set(key, (t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? '' : Number(t.value)) : t.value) as V[K]);
    },
    onBlur: () => blur(key),
  }), [values, errors, set, blur]);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  return { values, errors, touched, set, patch, field, check, reset, setErrors };
}

/* ---------- Page title & meta ---------- */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
    const d = description ?? site.description;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = d;
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', d);
  }, [title, description]);
}

/* ---------- Scroll state ---------- */
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return scrolled;
}

/** Scroll to top on route change, or to the #hash target once it renders (lazy pages). */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    let tries = 0;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      if (el || ++tries > 30) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);
}

/* ---------- Media ---------- */
export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/* ---------- Click outside / escape ---------- */
export function useDismiss(ref: RefObject<HTMLElement | null>, onDismiss: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const down = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss();
    document.addEventListener('mousedown', down);
    document.addEventListener('touchstart', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('touchstart', down);
      document.removeEventListener('keydown', key);
    };
  }, [ref, onDismiss, active]);
}

export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/* ---------- Animated number ---------- */
export function useCountUp(target: number, run: boolean, duration = 1600, decimals = 0) {
  const [v, setV] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduced) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setV(Number((target * eased).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration, decimals, reduced]);
  return v;
}

/* ---------- 3D tilt on pointer ---------- */
export function useTilt<T extends HTMLElement>(max = 10) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || window.matchMedia('(hover: none)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max, reduced]);
  return ref;
}

/* ---------- Simple interval ---------- */
export function useInterval(fn: () => void, ms: number | null) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (ms == null) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export const useStableMemo = useMemo;
