/* Stylised SVG city map for dispatch — no external map API.
   Areas are projected from approximate lat/lng; routes are drawn as curves
   and rider markers are interpolated by delivery stage (simulated). */
import { useMemo } from 'react';
import type { Area, LocationPoint } from '@/types';
import { findCity, findJunction } from '@/config/locations';
import { cn } from '@/utils';

export interface MapMarker { id: string; from: LocationPoint; to: LocationPoint; progress: number; late?: boolean; label: string; done?: boolean }

const W = 640;
const H = 400;
const PAD = 64;

const areaOf = (p: LocationPoint): Area | undefined => findCity(p.cityId)?.areas.find((a) => a.id === p.areaId) ?? findJunction(p.cityId, p.junctionId)?.area;

export function CityMap({ cityId, markers, selected, onSelect, className }: { cityId: string; markers: MapMarker[]; selected?: string | null; onSelect?: (id: string) => void; className?: string }) {
  const city = findCity(cityId);
  const proj = useMemo(() => {
    const areas = city?.areas ?? [];
    const lats = areas.map((a) => a.lat);
    const lngs = areas.map((a) => a.lng);
    let [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const span = Math.max(maxLat - minLat, maxLng - minLng, 0.06);
    const cLat = (minLat + maxLat) / 2;
    const cLng = (minLng + maxLng) / 2;
    minLat = cLat - span / 2; maxLat = cLat + span / 2; minLng = cLng - span / 2; maxLng = cLng + span / 2;
    const sx = (W - PAD * 2) / (maxLng - minLng);
    const sy = (H - PAD * 2) / (maxLat - minLat);
    const s = Math.min(sx, sy);
    const ox = (W - (maxLng - minLng) * s) / 2;
    const oy = (H - (maxLat - minLat) * s) / 2;
    return (lat: number, lng: number) => [ox + (lng - minLng) * s, oy + (maxLat - lat) * s] as const;
  }, [city]);

  if (!city || !city.areas.length) {
    return <div className={cn('grid aspect-[16/10] place-items-center rounded-2xl bg-ink-950 text-sm text-white/60', className)}>No map coverage for this city yet.</div>;
  }

  const pts = city.areas.map((a) => ({ a, p: proj(a.lat, a.lng) }));
  // Awka: trace the expressway corridor through the areas it passes (stylised)
  const expressway = cityId === 'awka'
    ? ['amawbia', 'agu-awka', 'aroma', 'temp-site', 'amansea'].map((id) => pts.find((x) => x.a.id === id)?.p).filter((p): p is readonly [number, number] => !!p)
    : [];
  // roads: connect each area to its 2 nearest neighbours
  const roads = new Set<string>();
  pts.forEach((x, i) => {
    pts
      .map((y, j) => ({ j, d: Math.hypot(x.p[0] - y.p[0], x.p[1] - y.p[1]) }))
      .filter((o) => o.j !== i)
      .sort((m, n) => m.d - n.d)
      .slice(0, 2)
      .forEach((o) => roads.add([i, o.j].sort().join('-')));
  });

  const locate = (lp: LocationPoint): { xy: readonly [number, number]; external?: string } => {
    if (lp.cityId !== cityId) {
      const other = findCity(lp.cityId);
      const cx = W / 2;
      const cy = H / 2;
      if (!other) return { xy: [W - 24, cy] };
      const dx = other.lng - city.lng;
      const dy = city.lat - other.lat;
      const k = Math.min((W / 2 - 22) / Math.abs(dx || 1e-6), (H / 2 - 22) / Math.abs(dy || 1e-6));
      return { xy: [cx + dx * k, cy + dy * k], external: other.name };
    }
    const a = areaOf(lp);
    return { xy: a ? proj(a.lat, a.lng) : [W / 2, H / 2] };
  };

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-ink-950', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Stylised dispatch map of ${city.name} with ${markers.length} active deliveries (simulated positions)`}>
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="rgb(255 255 255 / 0.05)" />
          </pattern>
          <radialGradient id="map-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1747c9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#050b22" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#map-grid)" />
        <rect width={W} height={H} fill="url(#map-glow)" />
        {expressway.length > 1 && (
          <g aria-hidden>
            <polyline points={expressway.map((p) => p.join(',')).join(' ')} fill="none" stroke="#0f1f55" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={expressway.map((p) => p.join(',')).join(' ')} fill="none" stroke="rgb(255 154 46 / 0.35)" strokeWidth={2} strokeDasharray="10 8" strokeLinecap="round" strokeLinejoin="round" />
            <text x={expressway[0][0] + 8} y={expressway[0][1] + 18} className="fill-white/35 text-[10px] font-semibold">Enugu–Onitsha Expressway</text>
          </g>
        )}
        {[...roads].map((key) => {
          const [i, j] = key.split('-').map(Number);
          const [a, b] = [pts[i].p, pts[j].p];
          return <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgb(143 180 255 / 0.18)" strokeWidth={6} strokeLinecap="round" />;
        })}
        {pts.map(({ a, p }) => (
          <g key={a.id}>
            <circle cx={p[0]} cy={p[1]} r={16} fill="rgb(47 123 255 / 0.08)" />
            <circle cx={p[0]} cy={p[1]} r={4} fill="#5b8eff" />
            <text x={p[0]} y={p[1] + 22} textAnchor="middle" className="fill-white/60 text-[11px] font-semibold">{a.name}</text>
          </g>
        ))}
        {markers.map((m) => {
          const from = locate(m.from);
          const to = locate(m.to);
          const [x0, y0] = from.xy;
          const [x2, y2] = to.xy;
          const mx = (x0 + x2) / 2;
          const my = (y0 + y2) / 2;
          const nx = -(y2 - y0) * 0.22;
          const ny = (x2 - x0) * 0.22;
          const [cx, cy] = [mx + nx, my + ny];
          const t = Math.max(0, Math.min(1, m.progress));
          const rx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x2;
          const ry = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y2;
          const sel = selected === m.id;
          const tone = m.done ? '#0f9d58' : m.late ? '#ff5a5a' : '#ff6a13';
          return (
            <g key={m.id} opacity={selected && !sel ? 0.4 : 1}>
              <path d={`M${x0},${y0} Q${cx},${cy} ${x2},${y2}`} fill="none" stroke={sel ? '#8fb4ff' : 'rgb(143 180 255 / 0.55)'} strokeWidth={sel ? 2.5 : 1.75} strokeDasharray="6 6" className="animate-dash" />
              <circle cx={x0} cy={y0} r={5} fill="#050b22" stroke="#8fb4ff" strokeWidth={2} />
              <rect x={x2 - 5} y={y2 - 5} width={10} height={10} rx={2} fill="#050b22" stroke="#ff8a3d" strokeWidth={2} />
              {to.external && <text x={x2} y={y2 - 10} textAnchor={x2 > W / 2 ? 'end' : 'start'} className="fill-go-300 text-[11px] font-semibold">→ {to.external}</text>}
              <g
                role="button"
                tabIndex={0}
                aria-label={`Select ${m.label}`}
                aria-pressed={sel}
                onClick={() => onSelect?.(m.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect?.(m.id))}
                className="cursor-pointer outline-none"
              >
                <circle cx={rx} cy={ry} r={14} fill={tone} opacity={0.25} className={m.done ? undefined : 'animate-pulse'} />
                <circle cx={rx} cy={ry} r={7} fill={tone} stroke="#fff" strokeWidth={2} />
                {sel && <circle cx={rx} cy={ry} r={18} fill="none" stroke="#fff" strokeWidth={1.5} />}
                <text x={rx + 12} y={ry - 10} className="fill-white text-[10.5px] font-bold" style={{ paintOrder: 'stroke', stroke: '#050b22', strokeWidth: 3 }}>{m.label}</text>
              </g>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">{city.name} · stylised map (simulated positions)</div>
      <ul className="pointer-events-none absolute right-3 bottom-3 flex flex-wrap gap-3 rounded-lg bg-ink-900/80 px-2.5 py-1.5 text-[10.5px] text-white/75 backdrop-blur">
        <li className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border-2 border-brand-300" />Pickup</li>
        <li className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[2px] border-2 border-go-400" />Drop-off</li>
        <li className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-go-500" />Rider</li>
        <li className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#ff5a5a]" />Delayed</li>
      </ul>
    </div>
  );
}
