/* Lightweight SVG charts for the dashboard — no chart library. */
import { useState } from 'react';
import { cn, compactNaira, naira } from '@/utils';

export interface BarDatum { key: string; label: string; value: number; detail?: string }

/** Single-series column chart with hover/focus tooltips and a screen-reader table. */
export function BarChart({ data, height = 190, className, title, valueFormat = naira }: { data: BarDatum[]; height?: number; className?: string; title: string; valueFormat?: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = height;
  const padL = 44;
  const padB = 26;
  const padT = 14;
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = (() => {
    const p = 10 ** Math.floor(Math.log10(max));
    const n = Math.ceil(max / p);
    return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  })();
  const plotH = H - padT - padB;
  const slot = (W - padL) / Math.max(1, data.length);
  const barW = Math.min(36, slot * 0.56);
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  const ticks = [0, nice / 2, nice];

  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={`${title}. ${data.map((d) => `${d.label}: ${valueFormat(d.value)}`).join('; ')}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeDasharray={t === 0 ? undefined : '3 5'} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[11px]">{compactNaira(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + slot * i + slot / 2;
          const top = y(d.value);
          const h = Math.max(d.value > 0 ? 3 : 0, padT + plotH - top);
          const r = Math.min(4, h / 2, barW / 2);
          const x0 = cx - barW / 2;
          const yb = padT + plotH;
          const path = h > 0 ? `M${x0},${yb} V${yb - h + r} Q${x0},${yb - h} ${x0 + r},${yb - h} H${x0 + barW - r} Q${x0 + barW},${yb - h} ${x0 + barW},${yb - h + r} V${yb} Z` : '';
          const active = hover === i;
          return (
            <g key={d.key}>
              {active && <rect x={cx - slot / 2 + 2} y={padT} width={slot - 4} height={plotH} rx={8} fill="var(--color-brand-50)" />}
              {path && <path d={path} className={cn('transition-[fill] duration-200', active ? 'fill-go-500' : 'fill-brand-600')} />}
              <text x={cx} y={H - 6} textAnchor="middle" className={cn('text-[11px]', active ? 'fill-ink-900 font-semibold' : 'fill-muted')}>{d.label}</text>
              <rect
                x={cx - slot / 2}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${d.label}: ${valueFormat(d.value)}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-crosshair outline-none"
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lift"
          style={{ left: `${((padL + slot * hover + slot / 2) / W) * 100}%`, top: `${(Math.max(padT, y(data[hover].value)) / H) * 100}%`, marginTop: -8 }}
        >
          <p className="font-semibold">{valueFormat(data[hover].value)}</p>
          <p className="text-white/60">{data[hover].detail ?? data[hover].label}</p>
        </div>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{data.map((d) => <tr key={d.key}><th scope="row">{d.detail ?? d.label}</th><td>{valueFormat(d.value)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export interface DonutSlice { key: string; label: string; value: number; color: string; meta?: string }

/** Donut with 2px surface gaps, hover/focus highlight, centre total and a labelled legend. */
export function Donut({ slices, size = 200, centerLabel = 'Total', format = naira, className }: { slices: DonutSlice[]; size?: number; centerLabel?: string; format?: (n: number) => string; className?: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 80;
  const stroke = 22;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const active = slices.find((s) => s.key === hover);
  return (
    <div className={cn('flex flex-col items-center gap-6 sm:flex-row sm:items-center', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="size-full -rotate-90" role="img" aria-label={`Breakdown: ${slices.map((s) => `${s.label} ${format(s.value)}`).join(', ')}`}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
          {total > 0 &&
            slices.map((s) => {
              const len = (s.value / total) * C;
              const gap = slices.length > 1 ? Math.min(2.5, len / 2) : 0;
              const el = (
                <circle
                  key={s.key}
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.key ? stroke + 6 : stroke}
                  strokeDasharray={`${Math.max(0, len - gap)} ${C}`}
                  strokeDashoffset={-acc}
                  opacity={hover && hover !== s.key ? 0.35 : 1}
                  className="transition-all duration-300"
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                />
              );
              acc += len;
              return el;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs font-medium text-muted">{active ? active.label : centerLabel}</p>
            <p className="font-display text-xl font-extrabold text-ink-900 tabular-nums">{format(active ? active.value : total)}</p>
            {active && total > 0 && <p className="text-xs font-semibold text-text-2">{Math.round((active.value / total) * 100)}%</p>}
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-1">
        {slices.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.key)}
              onBlur={() => setHover(null)}
              className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition', hover === s.key ? 'bg-surface-2' : 'hover:bg-surface-2/60')}
            >
              <span className="size-3 shrink-0 rounded-[4px]" style={{ background: s.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-medium text-text">{s.label}</span>
              <span className="font-semibold text-ink-900 tabular-nums">{format(s.value)}</span>
              <span className="w-10 text-right text-xs text-muted tabular-nums">{total ? Math.round((s.value / total) * 100) : 0}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Validated categorical order (brand blue, go orange, cyan, violet, green, amber). */
export const chartPalette = ['#1f5fe6', '#ff6a13', '#0ab3c4', '#8b5cf6', '#0f9d58', '#c77700'];
