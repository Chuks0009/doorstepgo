/* Interactive (but simulated) merchant console preview. All figures are illustrative. */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CircleCheck, FileSpreadsheet, LayoutDashboard, Package, Search, Store, TrendingUp, Truck, Upload } from 'lucide-react';
import { Segmented, StatusBadge } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { cn, naira } from '@/utils';
import { DemoChip } from './shared';

type Range = '7d' | '30d';

const series: Record<Range, { label: string; value: number }[]> = {
  '7d': [
    { label: 'Mon', value: 42 }, { label: 'Tue', value: 58 }, { label: 'Wed', value: 51 }, { label: 'Thu', value: 73 },
    { label: 'Fri', value: 96 }, { label: 'Sat', value: 88 }, { label: 'Sun', value: 34 },
  ],
  '30d': [
    { label: 'W1', value: 286 }, { label: 'W2', value: 341 }, { label: 'W3', value: 318 }, { label: 'W4', value: 402 },
  ],
};

const kpis: Record<Range, { label: string; value: string; delta: string; icon: typeof Package }[]> = {
  '7d': [
    { label: 'Deliveries', value: '442', delta: '+12%', icon: Package },
    { label: 'On-time rate', value: '96.4%', delta: '+1.8pt', icon: CircleCheck },
    { label: 'Avg cost / drop', value: naira(1150), delta: '−4%', icon: TrendingUp },
    { label: 'Active riders', value: '18', delta: '+3', icon: Truck },
  ],
  '30d': [
    { label: 'Deliveries', value: '1,347', delta: '+21%', icon: Package },
    { label: 'On-time rate', value: '95.1%', delta: '+0.9pt', icon: CircleCheck },
    { label: 'Avg cost / drop', value: naira(1200), delta: '−2%', icon: TrendingUp },
    { label: 'Active riders', value: '27', delta: '+6', icon: Truck },
  ],
};

const orders = [
  { id: 'DSG-DL-7Q2M-K81A', to: 'Ada N. · Miracle Junction, Ifite', items: '2 parcels', status: 'in_transit', eta: '14 min', fee: 1200 },
  { id: 'DSG-DL-3PL9-XR4C', to: 'Obinna F. · UNIZIK Back Gate', items: '1 parcel', status: 'delivered', eta: '—', fee: 900 },
  { id: 'DSG-DL-H6TW-02NB', to: 'Kitchen 21 · Aroma Junction', items: '6 cartons', status: 'rider_assigned', eta: '38 min', fee: 2600 },
  { id: 'DSG-DL-9VFE-LM7D', to: 'Chioma O. · Temp Site', items: '1 envelope', status: 'delivered', eta: '—', fee: 700 },
  { id: 'DSG-DL-B1KZ-5QSE', to: 'Musa A. · Agu-Awka', items: '3 parcels', status: 'received', eta: 'Today 4 PM', fee: 1500 },
];
type Filter = 'all' | 'active' | 'delivered';

function Chart({ range }: { range: Range }) {
  const data = series[range];
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  const W = 320, H = 150, pad = 20;
  const slot = (W - pad) / data.length;
  const bw = Math.min(26, slot * 0.46);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full overflow-visible" role="img" aria-label={`Deliveries per ${range === '7d' ? 'day' : 'week'}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={pad} x2={W} y1={H - H * g} y2={H - H * g} stroke="#e3e8f2" strokeWidth="1" strokeDasharray={g === 1 ? undefined : '3 4'} />
        ))}
        <line x1={pad} x2={W} y1={H} y2={H} stroke="#cdd5e4" />
        {data.map((d, i) => {
          const h = (d.value / max) * H;
          const x = pad + slot * i + (slot - bw) / 2;
          const on = hover === i;
          return (
            <g key={`${range}-${d.label}`}>
              <rect x={pad + slot * i} y={0} width={slot} height={H + 22} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
              <motion.path
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${x + bw / 2}px ${H}px` }}
                d={`M${x} ${H} V${H - h + 4} Q${x} ${H - h} ${x + 4} ${H - h} H${x + bw - 4} Q${x + bw} ${H - h} ${x + bw} ${H - h + 4} V${H} Z`}
                fill={on ? '#FF6A13' : '#2F7BFF'}
                className="pointer-events-none transition-colors"
              />
              <text x={x + bw / 2} y={H + 16} textAnchor="middle" className="fill-muted text-[10px] font-semibold">{d.label}</text>
            </g>
          );
        })}
      </svg>
      <AnimatePresence>
        {hover !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink-950 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lift"
            style={{ left: `${((pad + slot * hover + slot / 2) / W) * 100}%` }}
          >
            <span className="font-bold">{data[hover].value}</span> deliveries · {data[hover].label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RouteMap() {
  const pickups = [{ x: 70, y: 70, label: 'Ifite shop' }, { x: 120, y: 150, label: 'Eke Awka store' }];
  const drops = [{ x: 250, y: 40 }, { x: 290, y: 110 }, { x: 230, y: 170 }, { x: 180, y: 95 }];
  return (
    <svg viewBox="0 0 340 210" className="size-full" role="img" aria-label="Route map preview: 2 pickup locations serving 4 delivery destinations">
      <defs>
        <pattern id="mgrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ffffff0d" /></pattern>
      </defs>
      <rect width="340" height="210" fill="url(#mgrid)" />
      <path d="M0 130 C 80 120, 140 60, 340 80" stroke="#ffffff14" strokeWidth="16" fill="none" />
      <path d="M150 0 C 160 80, 200 140, 190 210" stroke="#ffffff10" strokeWidth="12" fill="none" />
      {drops.map((d, i) => {
        const p = pickups[i % 2];
        return <path key={i} d={`M${p.x} ${p.y} Q ${(p.x + d.x) / 2} ${Math.min(p.y, d.y) - 30} ${d.x} ${d.y}`} fill="none" stroke={i % 2 ? '#2F7BFF' : '#FF6A13'} strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" className="animate-dash" />;
      })}
      {drops.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r="11" fill="#ffffff" fillOpacity="0.1" />
          <circle cx={d.x} cy={d.y} r="5" fill="#ffffff" />
        </g>
      ))}
      {pickups.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="16" fill="#FF6A13" fillOpacity="0.25" className="animate-pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          <rect x={p.x - 9} y={p.y - 9} width="18" height="18" rx="5" fill="#FF6A13" />
          <text x={p.x} y={p.y + 26} textAnchor="middle" className="fill-white/70 text-[9px] font-semibold">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function BulkUpload() {
  const toast = useToast();
  const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const run = () => {
    setState('uploading');
    setProgress(0);
    let p = 0;
    const id = window.setInterval(() => {
      p += 12 + Math.random() * 18;
      if (p >= 100) {
        window.clearInterval(id);
        setProgress(100);
        setState('done');
        toast({ title: 'Sample sheet parsed (demo)', body: '24 drops ready for review — nothing was booked.' });
      } else setProgress(p);
    }, 220);
  };
  return (
    <div className="flex h-full flex-col rounded-2xl border-2 border-dashed border-line-strong bg-canvas p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-ok-bg text-ok"><FileSpreadsheet className="size-5" aria-hidden /></span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-900">Bulk upload</p>
          <p className="truncate text-xs text-muted">{state === 'done' ? 'march-orders.csv · 24 rows' : 'CSV / Excel · up to 500 drops'}</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="Upload progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className={cn('h-full rounded-full', state === 'done' ? 'bg-ok' : 'bg-go-sheen')} animate={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        onClick={state === 'done' ? () => { setState('idle'); setProgress(0); } : run}
        disabled={state === 'uploading'}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
      >
        <Upload className="size-4" aria-hidden />
        {state === 'idle' ? 'Try a sample upload' : state === 'uploading' ? `Parsing… ${Math.round(progress)}%` : 'Reset demo'}
      </button>
    </div>
  );
}

export function MerchantDashboardPreview() {
  const [range, setRange] = useState<Range>('7d');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const rows = useMemo(
    () =>
      orders
        .filter((o) => (filter === 'all' ? true : filter === 'delivered' ? o.status === 'delivered' : o.status !== 'delivered'))
        .filter((o) => !q || `${o.id} ${o.to}`.toLowerCase().includes(q.toLowerCase())),
    [filter, q],
  );

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-900 p-1.5 shadow-[0_50px_100px_-30px_rgb(5_11_34/0.8)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden><span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" /></span>
        <span className="mx-auto hidden truncate rounded-lg bg-white/5 px-4 py-1 text-[11px] text-white/50 sm:block">business.doorstepgo · Merchant console</span>
        <DemoChip dark className="ml-auto sm:ml-0">Preview</DemoChip>
      </div>

      <div className="rounded-[1.4rem] bg-canvas p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-go-sheen text-white"><Store className="size-5" aria-hidden /></span>
            <div>
              <p className="font-display font-bold text-ink-900">Mama Ngozi Provisions <span className="text-xs font-medium text-muted">(sample)</span></p>
              <p className="flex items-center gap-1.5 text-xs text-muted"><LayoutDashboard className="size-3.5" aria-hidden /> Overview · 2 pickup locations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Segmented size="sm" label="Date range" value={range} onChange={setRange} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]} />
            <span className="relative grid size-9 place-items-center rounded-xl bg-white text-ink-800 shadow-soft" aria-hidden>
              <Bell className="size-4" /><span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-go-500" />
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {kpis[range].map((k) => (
            <AnimatePresence key={k.label} mode="wait">
              <motion.div key={`${range}-${k.label}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-white p-3.5 shadow-soft">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted"><k.icon className="size-3.5" aria-hidden />{k.label}</p>
                <p className="mt-1.5 font-display text-xl font-bold text-ink-900 tabular-nums sm:text-2xl">{k.value}</p>
                <p className="text-[11px] font-semibold text-ok">{k.delta} vs prev.</p>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-4 shadow-soft lg:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink-900">Deliveries per {range === '7d' ? 'day' : 'week'}</p>
              <span className="text-[11px] text-muted">Hover a bar</span>
            </div>
            <div className="mt-3"><Chart range={range} /></div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 shadow-soft lg:col-span-2">
            <p className="absolute top-3 left-4 z-10 text-sm font-bold text-white">Live routes</p>
            <span className="absolute top-3 right-4 z-10 flex items-center gap-1.5 text-[11px] text-white/60"><span className="size-2 rounded-full bg-go-500" aria-hidden />Pickup <span className="ml-1 size-2 rounded-full bg-white" aria-hidden />Drop</span>
            <div className="aspect-[340/210] w-full pt-6 lg:h-full lg:pt-8"><RouteMap /></div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0 rounded-2xl bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div role="tablist" aria-label="Filter orders" className="flex gap-1 rounded-xl bg-surface-2 p-1">
                {(['all', 'active', 'delivered'] as Filter[]).map((f) => (
                  <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('min-h-8 rounded-lg px-3 text-xs font-semibold capitalize transition', filter === f ? 'bg-white text-ink-900 shadow-soft' : 'text-muted hover:text-text')}>
                    {f}
                  </button>
                ))}
              </div>
              <label className="relative">
                <span className="sr-only">Search orders</span>
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders" className="h-9 w-40 rounded-lg border border-line bg-canvas pr-2 pl-8 text-xs outline-none focus:border-brand-400" />
              </label>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-[11px] text-muted uppercase">
                  <tr><th className="py-2 font-semibold">Order</th><th className="font-semibold">Recipient</th><th className="font-semibold">Status</th><th className="font-semibold">ETA</th><th className="text-right font-semibold">Fee</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {rows.map((o) => (
                      <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-canvas">
                        <td className="py-2.5 pr-2 font-mono text-[11px] font-semibold text-ink-900">{o.id}</td>
                        <td className="pr-2"><span className="block font-medium text-ink-900">{o.to}</span><span className="text-muted">{o.items}</span></td>
                        <td className="pr-2"><StatusBadge status={o.status} /></td>
                        <td className="pr-2 text-text-2">{o.eta}</td>
                        <td className="text-right font-semibold tabular-nums">{naira(o.fee)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-muted">No orders match.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <BulkUpload />
        </div>
      </div>
    </div>
  );
}
