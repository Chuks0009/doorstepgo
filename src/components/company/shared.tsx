/* Shared building blocks for company / customer pages (About, Customers, Legal, 404). */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useCountUp } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils';

/**
 * Scrolls to `location.hash` after mount / hash change. MainLayout scrolls to top
 * on pathname change (parent effect runs after ours), so we wait a beat.
 */
export function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
    return () => window.clearTimeout(t);
  }, [hash, pathname]);
}

/** Orange speed lines that echo the logo. Decorative only. */
export function SpeedLines({ className, count = 4, align = 'right' }: { className?: string; count?: number; align?: 'left' | 'right' }) {
  const widths = [70, 100, 52, 84, 62, 90];
  return (
    <div aria-hidden className={cn('pointer-events-none flex flex-col gap-2.5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn('h-[3px] animate-speed rounded-full', align === 'right' ? 'ml-auto bg-gradient-to-l from-go-500 to-transparent' : 'mr-auto bg-gradient-to-r from-go-500 to-transparent')}
          style={{ width: `${widths[i % widths.length]}%`, animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}

/** Glowing orbs for ink sections. */
export function Orbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute -top-40 -right-20 size-[480px] rounded-full bg-brand-500/25 blur-[130px]" />
      <div className="absolute -bottom-48 -left-24 size-[420px] rounded-full bg-go-500/20 blur-[130px]" />
      <div className="grid-lines absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  );
}

/** Animated count-up figure that starts when scrolled into view. */
export function CountStat({ value, suffix = '', prefix = '', decimals = 0, className }: { value: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const v = useCountUp(value, inView, 1800, decimals);
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {v.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Image that reveals with a diagonal wipe and a gentle parallax. */
export function RevealImage({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative overflow-hidden bg-ink-900', className)}
    >
      {!loaded && <div className="skeleton absolute inset-0 opacity-20" aria-hidden />}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ y, scale: 1.18 }}
        className={cn('size-full object-cover', imgClassName)}
      />
    </motion.div>
  );
}

/** Copy-to-clipboard button with a toast + inline confirmation. */
export function CopyButton({ value, label = 'Copy', className, dark }: { value: string; label?: string; className?: string; dark?: boolean }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      toast({ title: 'Copied to clipboard', body: value });
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      toast({ title: 'Could not copy automatically', body: `Select and copy: ${value}`, tone: 'info' });
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label}: ${value}`}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition',
        dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-ink-900 text-white hover:bg-ink-800',
        className,
      )}
    >
      {done ? <Check className="size-4 text-emerald-400" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{done ? 'Copied' : label}</span>
    </button>
  );
}

/** Small "interface demo" chip used on simulated UI. */
export function DemoChip({ children = 'Interface demo', dark, className }: { children?: ReactNode; dark?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase', dark ? 'border-white/25 text-white/70' : 'border-brand-300 bg-brand-50/60 text-brand-700', className)}>
      <span className="size-1.5 rounded-full bg-go-500" aria-hidden />
      {children}
    </span>
  );
}

/** Animated dashed route path (SVG) — decorative. */
export function RoutePath({ d, className, color = '#FF6A13', width = 3, dur = 1.8 }: { d: string; className?: string; color?: string; width?: number; dur?: number }) {
  return (
    <svg aria-hidden className={cn('pointer-events-none', className)} viewBox="0 0 400 200" preserveAspectRatio="none" fill="none">
      <path d={d} stroke="currentColor" strokeOpacity={0.15} strokeWidth={width + 6} strokeLinecap="round" className="text-white" />
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray="10 10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: dur, ease: 'easeInOut' }}
        className="animate-dash"
      />
    </svg>
  );
}
