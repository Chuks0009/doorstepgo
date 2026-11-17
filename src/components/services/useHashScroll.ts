import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to `#hash` targets after a lazy page mounts (runs after scroll-to-top). */
export function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(t);
  }, [hash, pathname]);
}
