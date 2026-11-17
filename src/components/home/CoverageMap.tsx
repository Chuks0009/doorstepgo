import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, GraduationCap, MapPin } from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/ui';
import { DEFAULT_CITY, FOCUS_AREA, cities, findCity } from '@/config/locations';
import { site } from '@/config/site';
import { cn } from '@/utils';
import { Orb } from './motifs';

const W = 600;
const H = 440;
const PAD = 70;

/** Areas highlighted as the launch focus (Ifite + the UNIZIK campus). */
const FOCUS = new Set([FOCUS_AREA.id, 'unizik']);
/** Order the Enugu–Onitsha Expressway passes through (stylised). */
const EXPRESSWAY = ['amawbia', 'agu-awka', 'aroma', 'temp-site', 'amansea'];
/** Stylised local roads between areas. */
const ROADS: [string, string][] = [
  ['ifite', 'unizik'], ['unizik', 'temp-site'], ['ifite', 'aroma'], ['ifite', 'mgbakwu'], ['temp-site', 'mgbakwu'],
  ['temp-site', 'okpuno'], ['okpuno', 'awka-town'], ['aroma', 'awka-town'], ['awka-town', 'agu-awka'], ['ifite', 'amansea'],
];
/** Label offsets so neighbouring nodes don't collide. */
const LABEL: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  ifite: { dx: -14, dy: -12, anchor: 'end' },
  unizik: { dx: 14, dy: 16, anchor: 'start' },
  'temp-site': { dx: 12, dy: 18, anchor: 'start' },
  okpuno: { dx: -12, dy: -8, anchor: 'end' },
  aroma: { dx: 12, dy: 18, anchor: 'start' },
  'awka-town': { dx: -12, dy: -8, anchor: 'end' },
  'agu-awka': { dx: 12, dy: 16, anchor: 'start' },
  amawbia: { dx: -12, dy: 4, anchor: 'end' },
  amansea: { dx: -12, dy: -10, anchor: 'end' },
  mgbakwu: { dx: 12, dy: -6, anchor: 'start' },
};
const SHORT: Record<string, string> = { 'temp-site': 'Temp Site', aroma: 'Aroma / Regina', 'agu-awka': 'Agu-Awka', unizik: 'UNIZIK' };

/** Service coverage — stylised SVG map of Awka with Ifite & UNIZIK as the focus, plus coming-soon cities. */
export function CoverageMap() {
  const [focus, setFocus] = useState<string | null>(null);
  const city = findCity(DEFAULT_CITY);
  const areas = city?.areas ?? [];
  const soon = cities.filter((c) => !c.active);
  const junctionCount = areas.reduce((n, a) => n + a.junctions.length, 0);

  // fit areas into the viewBox (equal scale on both axes)
  const lats = areas.map((a) => a.lat);
  const lngs = areas.map((a) => a.lng);
  const [minLat, maxLat, minLng, maxLng] = areas.length ? [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)] : [0, 1, 0, 1];
  const s = Math.min((W - PAD * 2) / Math.max(maxLng - minLng, 1e-6), (H - PAD * 2) / Math.max(maxLat - minLat, 1e-6));
  const ox = (W - (maxLng - minLng) * s) / 2;
  const oy = (H - (maxLat - minLat) * s) / 2;
  const proj = (lat: number, lng: number) => ({ x: ox + (lng - minLng) * s, y: oy + (maxLat - lat) * s });
  const pos = Object.fromEntries(areas.map((a) => [a.id, proj(a.lat, a.lng)]));

  const expressPts = EXPRESSWAY.map((id) => pos[id]).filter(Boolean);
  let expressPath = '';
  if (expressPts.length > 1) {
    // extend both ends off the edge, towards Onitsha (SW) and Enugu (NE)
    const [a, b] = [expressPts[0], expressPts[1]];
    const [y, z] = [expressPts[expressPts.length - 2], expressPts[expressPts.length - 1]];
    const start = { x: a.x - (b.x - a.x) * 1.6, y: a.y - (b.y - a.y) * 1.6 };
    const end = { x: z.x + (z.x - y.x) * 1.8, y: z.y + (z.y - y.y) * 1.8 };
    expressPath = [start, ...expressPts, end].map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }

  // focus zone ellipse around Ifite + UNIZIK
  const focusPts = areas.filter((a) => FOCUS.has(a.id)).map((a) => pos[a.id]);
  const fz = focusPts.length
    ? { cx: focusPts.reduce((t, p) => t + p.x, 0) / focusPts.length, cy: focusPts.reduce((t, p) => t + p.y, 0) / focusPts.length }
    : null;

  // coming-soon cities as arrows on the map edge, by bearing from Awka
  const center = { x: W / 2, y: H / 2 };
  const edgeArrows = city
    ? soon.map((c) => {
        const dx = c.lng - city.lng;
        const dy = city.lat - c.lat;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const k = Math.min((W / 2 - 26) / Math.abs(ux || 1e-6), (H / 2 - 26) / Math.abs(uy || 1e-6));
        const tip = { x: center.x + ux * k, y: center.y + uy * k };
        const tail = { x: tip.x - ux * 34, y: tip.y - uy * 34 };
        const angle = (Math.atan2(uy, ux) * 180) / Math.PI;
        return { c, tip, tail, angle, right: ux > 0.2, bottom: uy > 0.6 };
      })
    : [];

  return (
    <section aria-labelledby="coverage-title" className="noise relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Orb className="top-[20%] left-[30%] size-[600px]" />
        <Orb tone="go" className="right-[-10%] bottom-[-20%] size-[400px]" />
      </div>
      <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            dark
            eyebrow="Service coverage"
            title={<span id="coverage-title">Live in {site.market.city}. <span className="text-gradient-go">Junction by junction.</span></span>}
            subtitle={`${areas.length} areas and ${junctionCount} junctions across ${site.market.city}, with ${site.market.focus} and the ${site.market.campusShort} corridor as our focus. ${soon.map((c) => c.name).join(', ')} are on the roadmap.`}
          />
          <ul className="mt-10 grid gap-2.5 sm:grid-cols-2">
            {[...areas].sort((a, b) => Number(FOCUS.has(b.id)) - Number(FOCUS.has(a.id))).map((a, i) => {
              const isFocus = FOCUS.has(a.id);
              const first = a.junctions[0];
              return (
                <Reveal as="li" key={a.id} delay={i * 0.03} onMouseEnter={() => setFocus(a.id)} onMouseLeave={() => setFocus(null)}>
                  <Link
                    to={`/booking?pickupCity=${DEFAULT_CITY}${first ? `&pickupJunction=${first.id}` : ''}`}
                    onFocus={() => setFocus(a.id)}
                    onBlur={() => setFocus(null)}
                    aria-label={`Book a ride from ${a.name}`}
                    className={cn(
                      'group flex min-h-14 items-center gap-3 rounded-2xl p-3 ring-1 transition',
                      isFocus ? 'bg-go-500/10 ring-go-500/30 hover:bg-go-500/15' : 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08] hover:ring-go-500/40',
                      focus === a.id && 'bg-white/[0.08] ring-go-500/50',
                    )}
                  >
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', isFocus ? 'bg-go-500 text-white' : 'bg-go-500/15 text-go-300')}>
                      {a.id === 'unizik' ? <GraduationCap className="size-5" aria-hidden /> : <MapPin className="size-5" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{a.name}</span>
                      <span className="block truncate text-xs text-white/50">{isFocus ? 'Focus area · ' : ''}{a.junctions.length} junction{a.junctions.length === 1 ? '' : 's'}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-white/30 transition group-hover:text-go-300" aria-hidden />
                  </Link>
                </Reveal>
              );
            })}
          </ul>
          {soon.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/55">
              <span className="font-semibold text-white/70">Coming soon:</span>
              {soon.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1"><Clock className="size-3" aria-hidden />{c.name}</span>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="relative rounded-[2rem] bg-white/[0.03] p-3 ring-1 ring-white/10 sm:p-6">
            {areas.length === 0 ? (
              <div className="grid aspect-[15/11] place-items-center text-sm text-white/60">Coverage map coming soon.</div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Stylised map of ${site.market.city}: ${areas.length} live areas with Ifite-Awka and UNIZIK highlighted, the Enugu–Onitsha Expressway, and ${soon.map((c) => c.name).join(', ')} marked as coming soon`}>
                <defs>
                  <pattern id="cov-dots" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="6" cy="6" r="1.3" fill="rgb(143 180 255 / 0.18)" />
                  </pattern>
                  <radialGradient id="cov-glow">
                    <stop offset="0" stopColor="#ff6a13" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#ff6a13" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="cov-focus">
                    <stop offset="0" stopColor="#ff6a13" stopOpacity="0.22" />
                    <stop offset="0.7" stopColor="#ff6a13" stopOpacity="0.06" />
                    <stop offset="1" stopColor="#ff6a13" stopOpacity="0" />
                  </radialGradient>
                  <marker id="cov-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="rgb(255 255 255 / 0.55)" />
                  </marker>
                </defs>
                <rect width={W} height={H} rx="24" fill="url(#cov-dots)" />

                {/* focus zone */}
                {fz && (
                  <g>
                    <ellipse cx={fz.cx} cy={fz.cy} rx="104" ry="76" fill="url(#cov-focus)" />
                    <ellipse cx={fz.cx} cy={fz.cy} rx="78" ry="54" fill="none" stroke="#ff8a3d" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="5 6" className="animate-dash" />
                    <text x={fz.cx} y={fz.cy - 62} textAnchor="middle" className="fill-go-300 text-[11px] font-bold tracking-[0.14em] uppercase">Focus zone</text>
                  </g>
                )}

                {/* expressway */}
                {expressPath && (
                  <g>
                    <path d={expressPath} fill="none" stroke="#132a6b" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                    <motion.path d={expressPath} fill="none" stroke="rgb(255 154 46 / 0.6)" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
                    <text x={W - 16} y={expressPts[expressPts.length - 1].y + 40} textAnchor="end" className="fill-white/35 text-[10px] font-semibold">Enugu–Onitsha Expressway</text>
                  </g>
                )}

                {/* local roads */}
                {ROADS.filter(([a, b]) => pos[a] && pos[b]).map(([a, b], i) => {
                  const hot = focus === a || focus === b;
                  return (
                    <motion.line key={`${a}-${b}`} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke={hot ? 'rgb(255 138 61 / 0.7)' : 'rgb(143 180 255 / 0.28)'} strokeWidth={hot ? 3 : 2} strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 + i * 0.05 }} />
                  );
                })}

                {/* coming-soon cities off the edge */}
                {edgeArrows.map(({ c, tip, tail, right, bottom }) => (
                  <g key={c.id} opacity="0.85">
                    <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke="rgb(255 255 255 / 0.55)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#cov-arrow)" />
                    <text x={tail.x + (right ? -6 : 6)} y={tail.y + (bottom ? -8 : 16)} textAnchor={right ? 'end' : 'start'} className="fill-white/55 text-[11px] font-semibold">
                      {c.name} · soon
                    </text>
                  </g>
                ))}

                {/* area nodes */}
                {areas.map((a) => {
                  const p = pos[a.id];
                  const lp = LABEL[a.id] ?? { dx: 12, dy: 4, anchor: 'start' as const };
                  const isFocus = FOCUS.has(a.id);
                  const hot = focus === a.id;
                  return (
                    <g key={a.id} transform={`translate(${p.x} ${p.y})`}>
                      {(isFocus || hot) && <circle r={hot ? 30 : 22} fill="url(#cov-glow)" className="transition-all duration-300" />}
                      <circle r={isFocus ? 7.5 : 5.5} fill={isFocus ? '#ff6a13' : '#5b8eff'} stroke="white" strokeWidth={isFocus ? 2.5 : 2} />
                      <text x={lp.dx} y={lp.dy} textAnchor={lp.anchor} className={cn('font-sans font-semibold', isFocus ? 'text-[13px]' : 'text-[11.5px]', hot ? 'fill-go-300' : isFocus ? 'fill-white' : 'fill-white/70')} style={{ paintOrder: 'stroke', stroke: '#050b22', strokeWidth: 3 }}>
                        {SHORT[a.id] ?? a.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-xs text-white/55">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-go-500 ring-2 ring-white" /> Focus area</span>
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand-400 ring-2 ring-white" /> Live area</span>
              <span className="flex items-center gap-2"><span className="h-0.5 w-4 border-t-2 border-dashed border-white/50" /> Coming soon</span>
              <span className="ml-auto">Stylised map · not to scale</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
