import { useCallback, useEffect, useId, useRef } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { Bike, Car, Flag, MapPin, Package, Radar } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';

/**
 * Stylised, fully offline city map (pure SVG — no map API).
 * Progress `t` runs 0 → 2:
 *   0 … 1  rider/driver travelling from their origin to the pickup point (approach)
 *   1 … 2  pickup → destination (trip / delivery leg)
 * Pass `t < 0` to hide the vehicle marker (not yet assigned).
 */
const APPROACH = 'M 52 52 C 70 92, 46 132, 88 150 S 98 196, 70 214';
const TRIP = 'M 70 214 C 120 226, 142 178, 188 176 S 240 150, 262 130 S 300 104, 318 86 S 352 52, 372 58';
const PICKUP = { x: 70, y: 214 };
const DROP = { x: 372, y: 58 };
const ORIGIN = { x: 52, y: 52 };

const blocks = [
  [8, 8, 70, 30], [90, 8, 58, 54], [160, 8, 84, 40], [256, 8, 60, 34], [328, 8, 64, 24],
  [104, 74, 48, 44], [164, 60, 52, 48], [228, 56, 54, 38], [292, 50, 30, 22],
  [8, 168, 36, 30], [116, 116, 56, 42], [190, 112, 46, 34], [300, 128, 92, 44],
  [100, 196, 62, 56], [176, 200, 70, 52], [262, 186, 50, 66], [326, 188, 66, 30], [326, 226, 66, 26],
] as const;

export function RouteMap({
  t,
  vehicle = 'bike',
  pickupLabel,
  dropLabel,
  etaLabel,
  className,
  live = true,
}: {
  t: number;
  vehicle?: 'bike' | 'car' | 'parcel';
  pickupLabel: string;
  dropLabel: string;
  etaLabel?: string;
  className?: string;
  live?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const reduced = usePrefersReducedMotion();
  const approachRef = useRef<SVGPathElement>(null);
  const tripRef = useRef<SVGPathElement>(null);

  const progress = useMotionValue(t);
  const x = useMotionValue(ORIGIN.x);
  const y = useMotionValue(ORIGIN.y);
  const approachDrawn = useMotionValue(0);
  const tripDrawn = useMotionValue(0);
  const markerOpacity = useMotionValue(t < 0 ? 0 : 1);

  const place = useCallback(
    (v: number) => {
      const a = approachRef.current;
      const b = tripRef.current;
      if (!a || !b) return;
      markerOpacity.set(v < 0 ? 0 : 1);
      const c = Math.max(0, Math.min(2, v));
      const path = c <= 1 ? a : b;
      const local = c <= 1 ? c : c - 1;
      const pt = path.getPointAtLength(path.getTotalLength() * local);
      x.set(pt.x);
      y.set(pt.y);
      approachDrawn.set(Math.min(1, c));
      tripDrawn.set(Math.max(0, c - 1));
    },
    [x, y, approachDrawn, tripDrawn, markerOpacity],
  );

  useMotionValueEvent(progress, 'change', place);
  useEffect(() => place(progress.get()), [place, progress]);

  useEffect(() => {
    if (reduced || progress.get() < 0 || t < 0) {
      progress.set(t);
      place(t);
      return;
    }
    const controls = animate(progress, t, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [t, reduced, progress, place]);

  const VehicleIcon = vehicle === 'car' ? Car : vehicle === 'parcel' ? Package : Bike;

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-950 shadow-lift', className)}>
      <div className="relative">
      <svg viewBox="0 0 400 260" className="block h-auto w-full" role="img" aria-label={`Simulated route map from ${pickupLabel} to ${dropLabel}`}>
        <defs>
          <linearGradient id={`${uid}-route`} x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#2F7BFF" />
            <stop offset="100%" stopColor="#FF6A13" />
          </linearGradient>
          <linearGradient id={`${uid}-green`} x1="0" x2="1">
            <stop offset="0%" stopColor="#0f9d58" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0f9d58" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0%" stopColor="#FF6A13" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF6A13" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(255 255 255 / 0.035)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="400" height="260" fill="#071233" />
        <rect width="400" height="260" fill={`url(#${uid}-grid)`} />

        {/* Green belt */}
        <path d="M 0 236 C 60 226, 90 252, 150 262 L 0 262 Z" fill={`url(#${uid}-green)`} />
        <path d="M 250 260 C 290 236, 340 250, 400 232 L 400 260 Z" fill={`url(#${uid}-green)`} />
        {/* Park */}
        <rect x="232" y="104" width="54" height="22" rx="6" fill="#0f9d58" opacity="0.18" />

        {/* City blocks */}
        {blocks.map(([bx, by, w, h], i) => (
          <rect key={i} x={bx} y={by} width={w} height={h} rx="5" fill="#0f1f55" opacity={0.75 - (i % 3) * 0.12} />
        ))}

        {/* Major roads */}
        <g stroke="#16296b" strokeLinecap="round" fill="none">
          <path d="M 0 160 L 400 160" strokeWidth="7" />
          <path d="M 0 52 C 120 52, 200 46, 400 40" strokeWidth="6" />
          <path d="M 96 0 L 96 260" strokeWidth="5" />
          <path d="M 250 0 C 252 90, 256 170, 252 260" strokeWidth="6" />
          <path d="M 0 104 L 400 98" strokeWidth="3.5" />
          <path d="M 160 0 L 172 260" strokeWidth="3" />
          <path d="M 320 0 L 318 260" strokeWidth="3" />
        </g>

        {/* Approach leg */}
        <path ref={approachRef} d={APPROACH} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round" />
        <motion.path d={APPROACH} fill="none" stroke="#5b8eff" strokeWidth="3" strokeLinecap="round" style={{ pathLength: approachDrawn }} />

        {/* Trip leg — glow, remaining dashed, travelled solid */}
        <path d={TRIP} fill="none" stroke={`url(#${uid}-route)`} strokeWidth="9" opacity="0.28" filter={`url(#${uid}-blur)`} />
        <path ref={tripRef} d={TRIP} fill="none" stroke="rgb(255 255 255 / 0.4)" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" className={live ? 'animate-dash' : undefined} />
        <motion.path d={TRIP} fill="none" stroke={`url(#${uid}-route)`} strokeWidth="4.5" strokeLinecap="round" style={{ pathLength: tripDrawn }} />

        {/* Rider origin */}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="4" fill="#5b8eff" opacity="0.6" />

        {/* Pickup pin */}
        <g transform={`translate(${PICKUP.x} ${PICKUP.y})`}>
          <circle r="13" fill="#2F7BFF" opacity="0.18" />
          <circle r="7" fill="#2F7BFF" stroke="white" strokeWidth="2.5" />
        </g>

        {/* Drop pin */}
        <g transform={`translate(${DROP.x} ${DROP.y})`}>
          <circle r="16" fill={`url(#${uid}-glow)`} />
          <path d="M 0 2 C -9 -8, -9 -22, 0 -24 C 9 -22, 9 -8, 0 2 Z" fill="#FF6A13" stroke="white" strokeWidth="2" />
          <circle cy="-15" r="3.2" fill="white" />
        </g>

        {/* Vehicle marker */}
        <motion.g style={{ x, y, opacity: markerOpacity }}>
          <circle r="20" fill="#FF6A13" opacity="0.18" className={live ? 'animate-pulse-ring' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle r="12.5" fill="#FF6A13" stroke="white" strokeWidth="2.5" />
          <VehicleIcon x={-7} y={-7} width={14} height={14} color="white" strokeWidth={2.4} aria-hidden />
        </motion.g>
      </svg>

      {/* Overlays */}
      <span className="pointer-events-none absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/75 px-2.5 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
        <Radar className="size-3.5 shrink-0 text-go-400" aria-hidden /> <span className="truncate">Live map coming soon — simulated position</span>
      </span>
      {etaLabel && (
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-go-sheen px-3 py-1 text-xs font-bold text-white shadow-glow-go">{etaLabel}</span>
      )}
      </div>
      <div className="grid gap-2 border-t border-white/10 bg-ink-900 p-3 sm:grid-cols-2">
        <span className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white">
          <MapPin className="size-3.5 shrink-0 text-brand-300" aria-hidden />
          <span className="truncate"><span className="text-white/55">From </span>{pickupLabel}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white">
          <Flag className="size-3.5 shrink-0 text-go-400" aria-hidden />
          <span className="truncate"><span className="text-white/55">To </span>{dropLabel}</span>
        </span>
      </div>
    </div>
  );
}
