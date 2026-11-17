/* Brand motifs shared across homepage sections: speed lines, glowing orbs,
   animated route paths and small decorative primitives. Purely decorative —
   everything here is aria-hidden. */
import { cn } from '@/utils';

/** Diagonal orange "speed lines" echoing the logo's Go mark. */
export function SpeedLines({ className, count = 4, widths = [70, 95, 50, 80, 60], side = 'right' }: { className?: string; count?: number; widths?: number[]; side?: 'left' | 'right' }) {
  return (
    <div aria-hidden className={cn('pointer-events-none flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn('h-[3px] animate-speed rounded-full', side === 'right' ? 'ml-auto bg-gradient-to-l from-go-500 via-amber-glow/70 to-transparent' : 'mr-auto bg-gradient-to-r from-go-500 via-amber-glow/70 to-transparent')}
          style={{ width: `${widths[i % widths.length]}%`, animationDelay: `${i * 0.28}s` }}
        />
      ))}
    </div>
  );
}

/** Soft blurred orb used to light dark sections. */
export function Orb({ className, tone = 'brand' }: { className?: string; tone?: 'brand' | 'go' }) {
  return <div aria-hidden className={cn('pointer-events-none absolute rounded-full blur-[110px]', tone === 'brand' ? 'bg-brand-500/30' : 'bg-go-500/25', className)} />;
}

/** Skewed slash shapes (the "Go" speed stroke) as a section accent. */
export function Slashes({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none flex gap-2', className)}>
      <span className="h-full w-3 -skew-x-[24deg] rounded-sm bg-go-500" />
      <span className="h-full w-3 -skew-x-[24deg] rounded-sm bg-go-500/60" />
      <span className="h-full w-3 -skew-x-[24deg] rounded-sm bg-go-500/30" />
    </div>
  );
}

/** Pulsing location pin (pickup = blue, drop-off = orange). */
export function PulsePin({ tone = 'brand', className, size = 14 }: { tone?: 'brand' | 'go' | 'ok'; className?: string; size?: number }) {
  const bg = tone === 'brand' ? 'bg-brand-500' : tone === 'go' ? 'bg-go-500' : 'bg-ok';
  return (
    <span aria-hidden className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <span className={cn('absolute inset-0 animate-pulse-ring rounded-full', bg)} />
      <span className={cn('relative size-full rounded-full ring-[3px] ring-white', bg)} />
    </span>
  );
}

/** Section divider: a thin animated dashed route across the page. */
export function RouteDivider({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 1200 40" preserveAspectRatio="none" className={cn('h-10 w-full', className)}>
      <path d="M0 20 C 200 0, 400 40, 600 20 S 1000 0, 1200 20" fill="none" stroke={dark ? 'rgb(255 255 255 / 0.15)' : 'rgb(10 22 64 / 0.12)'} strokeWidth="2" />
      <path d="M0 20 C 200 0, 400 40, 600 20 S 1000 0, 1200 20" fill="none" stroke="var(--color-go-500)" strokeWidth="2.5" strokeDasharray="10 30" strokeLinecap="round" className="animate-dash" />
    </svg>
  );
}
