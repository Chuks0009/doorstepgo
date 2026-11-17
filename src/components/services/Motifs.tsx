import { cn } from '@/utils';

/** Orange speed-line bars echoing the logo's "Go" mark. Decorative only. */
export function SpeedLines({ className, widths = [70, 100, 50, 85], align = 'right' }: { className?: string; widths?: number[]; align?: 'left' | 'right' }) {
  return (
    <div aria-hidden className={cn('pointer-events-none flex flex-col gap-2.5', className)}>
      {widths.map((w, i) => (
        <span
          key={i}
          className={cn('h-[3px] animate-speed rounded-full', align === 'right' ? 'ml-auto bg-gradient-to-l from-go-500 to-transparent' : 'bg-gradient-to-r from-go-500 to-transparent')}
          style={{ width: `${w}%`, animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}

/** Soft glowing orbs used behind dark sections. */
export function GlowOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute -top-40 -right-24 size-[460px] rounded-full bg-brand-500/25 blur-[130px]" />
      <div className="absolute -bottom-40 -left-24 size-[420px] rounded-full bg-go-500/20 blur-[130px]" />
      <div className="grid-lines absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  );
}

/** Curved route path with an animated dashed stroke + pickup/drop pins. */
export function RoutePath({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 400 160" fill="none" className={cn('pointer-events-none', className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id="dsg-route-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2F7BFF" />
          <stop offset="100%" stopColor="#FF6A13" />
        </linearGradient>
      </defs>
      <path d="M12 130 C 90 130, 110 30, 200 50 S 320 140, 388 28" stroke={dark ? 'rgb(255 255 255 / 0.08)' : 'rgb(10 22 64 / 0.06)'} strokeWidth="10" strokeLinecap="round" />
      <path d="M12 130 C 90 130, 110 30, 200 50 S 320 140, 388 28" stroke="url(#dsg-route-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 10" className="animate-dash" />
      <circle cx="12" cy="130" r="7" fill="#2F7BFF" />
      <circle cx="12" cy="130" r="13" stroke="#2F7BFF" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="388" cy="28" r="7" fill="#FF6A13" />
      <circle cx="388" cy="28" r="13" stroke="#FF6A13" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}

/** Diagonal divider between a dark and light section. */
export function DiagonalEdge({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 h-16 sm:h-24', className)}>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="size-full">
        <polygon points={flip ? '0,0 100,10 0,10' : '0,10 100,0 100,10'} className="fill-canvas" />
      </svg>
    </div>
  );
}
