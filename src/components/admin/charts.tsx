/* Plain-SVG chart components for the admin console (no chart libraries).
   Thin marks, recessive grid, hover tooltips, legends + text alternatives. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/utils';
import { BLUE_RAMP } from './data';

/* ---------- Measure container width ---------- */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};

function Tip({ x, y, children, width }: { x: number; y: number; children: ReactNode; width: number }) {
  const left = Math.min(Math.max(x, 90), Math.max(90, width - 90));
  return (
    <div role="status" className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-ink-900/95 px-3 py-2 text-xs text-white shadow-lift backdrop-blur" style={{ left, top: y - 8 }}>
      {children}
    </div>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color = '#1F5FE6', className, label }: { data: number[]; color?: string; className?: string; label?: string }) {
  const id = useId().replace(/:/g, '');
  const w = 100;
  const h = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * w, h - 3 - ((v - min) / Math.max(1, max - min)) * (h - 6)] as const);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn('overflow-visible', className)} role="img" aria-label={label ?? 'Trend'}>
      <defs>
        <linearGradient id={`sg${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line}L${w},${h}L0,${h}Z`} fill={`url(#sg${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {last && <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/* ---------- Stacked vertical bars ---------- */
export interface SeriesSpec { key: string; label: string; color: string }
export function StackedBars({ data, series, height = 240, format = (n: number) => String(n), title }: { data: { label: string; sub?: string; values: Record<string, number> }[]; series: SeriesSpec[]; height?: number; format?: (n: number) => string; title: string }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 36, r: 8, t: 10, b: 26 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const totals = data.map((d) => series.reduce((s, x) => s + (d.values[x.key] ?? 0), 0));
  const max = niceMax(Math.max(...totals, 1));
  const step = data.length ? innerW / data.length : 0;
  const barW = Math.max(4, Math.min(28, step * 0.62));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const labelEvery = step < 34 ? 2 : 1;

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#e3e8f2" strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[10px] tabular-nums">{format(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + step * i + step / 2;
            let acc = 0;
            return (
              <g key={d.label + i}>
                {hover === i && <rect x={cx - step / 2 + 2} y={pad.t} width={step - 4} height={innerH} rx={6} fill="#eef4ff" />}
                {series.map((s, si) => {
                  const v = d.values[s.key] ?? 0;
                  if (!v) return null;
                  const y0 = y(acc);
                  acc += v;
                  const y1 = y(acc);
                  const h = Math.max(0, y0 - y1 - (si < series.length - 1 ? 2 : 0));
                  const isTop = series.slice(si + 1).every((n) => !(d.values[n.key] ?? 0));
                  return <path key={s.key} d={roundTopRect(cx - barW / 2, y1, barW, h, isTop ? Math.min(4, barW / 2, h) : 0)} fill={s.color} opacity={hover === null || hover === i ? 1 : 0.45} />;
                })}
                {i % labelEvery === 0 && <text x={cx} y={height - 8} textAnchor="middle" className="fill-muted text-[10px]">{d.label}</text>}
                <rect x={cx - step / 2} y={pad.t} width={step} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.sub ?? d.label}: ${series.map((s) => `${s.label} ${format(d.values[s.key] ?? 0)}`).join(', ')}`} className="outline-none focus-visible:stroke-brand-500" />
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tip x={pad.l + step * hover + step / 2} y={y(totals[hover])} width={width}>
          <p className="mb-1 font-semibold">{data[hover].sub ?? data[hover].label}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-white/70"><span className="size-2 rounded-sm" style={{ background: s.color }} />{s.label}</span>
              <span className="font-semibold tabular-nums">{format(data[hover].values[s.key] ?? 0)}</span>
            </p>
          ))}
          {series.length > 1 && <p className="mt-1 flex justify-between border-t border-white/10 pt-1 font-semibold"><span>Total</span><span className="tabular-nums">{format(totals[hover])}</span></p>}
        </Tip>
      )}
    </div>
  );
}

function roundTopRect(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return '';
  if (r <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/* ---------- Donut ---------- */
export function Donut({ data, size = 180, thickness = 22, center, format = String, title }: { data: { key: string; label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: { label: string; value: string }; format?: (n: number) => string; title: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thickness / 2 - 2;
  const c = 2 * Math.PI * r;
  const gap = data.length > 1 ? 3 : 0;
  let offset = 0;
  const active = data.find((d) => d.key === hover);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f8" strokeWidth={thickness} />
          {data.map((d) => {
            const len = (d.value / total) * c;
            const seg = (
              <circle
                key={d.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hover === d.key ? thickness + 4 : thickness}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
                opacity={hover && hover !== d.key ? 0.4 : 1}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                onMouseEnter={() => setHover(d.key)}
                onMouseLeave={() => setHover(null)}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] font-medium text-muted">{active ? active.label : center?.label}</p>
            <p className="font-display text-lg font-bold text-ink-900 tabular-nums">{active ? format(active.value) : center?.value}</p>
            {active && <p className="text-[11px] font-semibold text-text-2 tabular-nums">{((active.value / total) * 100).toFixed(1)}%</p>}
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.key}>
            <button type="button" onMouseEnter={() => setHover(d.key)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d.key)} onBlur={() => setHover(null)} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition', hover === d.key && 'bg-surface-2')}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
              <span className="flex-1 truncate text-text-2">{d.label}</span>
              <span className="font-semibold text-ink-900 tabular-nums">{format(d.value)}</span>
              <span className="w-12 text-right text-xs text-muted tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Horizontal 100% stacked bars ---------- */
export function StackRows({ rows, series, title }: { rows: { id: string; label: string; values: Record<string, number> }[]; series: SeriesSpec[]; title: string }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<{ row: number; key: string } | null>(null);
  const labelW = 104;
  const totalW = 56;
  const barW = Math.max(0, width - labelW - totalW);
  const rowH = 30;
  const height = rows.length * rowH;
  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title}>
          {rows.map((r, ri) => {
            const total = series.reduce((s, x) => s + (r.values[x.key] ?? 0), 0) || 1;
            let acc = 0;
            const yy = ri * rowH + 7;
            return (
              <g key={r.id}>
                <text x={0} y={yy + 8} dy="0.32em" className="fill-text-2 text-[12px] font-medium">{r.label}</text>
                {series.map((s, si) => {
                  const v = r.values[s.key] ?? 0;
                  const x0 = labelW + (acc / total) * barW;
                  acc += v;
                  const w = Math.max(0, (v / total) * barW - (si < series.length - 1 ? 2 : 0));
                  const first = si === 0;
                  const last = si === series.length - 1;
                  return (
                    <rect
                      key={s.key}
                      x={x0}
                      y={yy}
                      width={w}
                      height={16}
                      rx={first || last ? 4 : 0}
                      fill={s.color}
                      opacity={hover && (hover.row !== ri || hover.key !== s.key) ? 0.45 : 1}
                      onMouseEnter={() => setHover({ row: ri, key: s.key })}
                      className="cursor-pointer"
                    >
                      <title>{`${r.label} · ${s.label}: ${v} (${((v / total) * 100).toFixed(0)}%)`}</title>
                    </rect>
                  );
                })}
                <text x={width} y={yy + 8} dy="0.32em" textAnchor="end" className="fill-ink-900 text-[12px] font-semibold tabular-nums">{total.toLocaleString('en-NG')}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover && (() => {
        const r = rows[hover.row];
        const s = series.find((x) => x.key === hover.key)!;
        const total = series.reduce((a, x) => a + (r.values[x.key] ?? 0), 0) || 1;
        const v = r.values[s.key] ?? 0;
        return (
          <Tip x={labelW + barW / 2} y={hover.row * rowH + 6} width={width}>
            <p className="font-semibold">{r.label}</p>
            <p className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-1.5 text-white/70"><span className="size-2 rounded-sm" style={{ background: s.color }} />{s.label}</span><span className="font-semibold tabular-nums">{v} · {((v / total) * 100).toFixed(0)}%</span></p>
          </Tip>
        );
      })()}
    </div>
  );
}

/* ---------- Heatmap ---------- */
export function Heatmap({ rows, cols, values, title, unit = 'requests' }: { rows: string[]; cols: string[]; values: number[][]; title: string; unit?: string }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<[number, number] | null>(null);
  const labelW = 34;
  const gap = 2;
  const cell = width ? Math.max(8, (width - labelW - gap * cols.length) / cols.length) : 0;
  const cellH = Math.min(22, Math.max(14, cell * 0.9));
  const max = Math.max(...values.flat(), 1);
  const color = (v: number) => BLUE_RAMP[Math.min(BLUE_RAMP.length - 1, Math.floor((v / max) * BLUE_RAMP.length))];
  const height = rows.length * (cellH + gap) + 18;
  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title}>
          {rows.map((r, ri) => (
            <g key={r}>
              <text x={0} y={ri * (cellH + gap) + cellH / 2} dy="0.32em" className="fill-muted text-[10px] font-medium">{r}</text>
              {cols.map((_, ci) => (
                <rect
                  key={ci}
                  x={labelW + ci * (cell + gap)}
                  y={ri * (cellH + gap)}
                  width={cell}
                  height={cellH}
                  rx={3}
                  fill={color(values[ri][ci])}
                  stroke={hover && hover[0] === ri && hover[1] === ci ? '#0a1640' : 'none'}
                  strokeWidth={1.5}
                  onMouseEnter={() => setHover([ri, ci])}
                />
              ))}
            </g>
          ))}
          {cols.map((c, ci) => (ci % (cell < 18 ? 3 : 2) === 0 ? <text key={c} x={labelW + ci * (cell + gap) + cell / 2} y={height - 4} textAnchor="middle" className="fill-muted text-[10px]">{c}</text> : null))}
        </svg>
      )}
      {hover && (
        <Tip x={labelW + hover[1] * (cell + gap) + cell / 2} y={hover[0] * (cellH + gap)} width={width}>
          <p className="font-semibold">{rows[hover[0]]} · {cols[hover[1]]}:00</p>
          <p className="text-white/70"><span className="font-semibold text-white tabular-nums">{values[hover[0]][hover[1]]}</span> {unit} (demo)</p>
        </Tip>
      )}
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-muted">
        Low
        <span className="flex gap-0.5">{BLUE_RAMP.map((c) => <span key={c} className="h-2.5 w-4 rounded-[2px]" style={{ background: c }} />)}</span>
        High
      </div>
    </div>
  );
}

/* ---------- Progress meter ---------- */
export function Meter({ value, color = '#1F5FE6', label, className }: { value: number; color?: string; label: string; className?: string }) {
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}
