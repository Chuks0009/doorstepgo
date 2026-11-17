import { useMemo, useState } from 'react';
import { ChevronsRight, Clock, MapPinned, Package, Phone, Timer, TriangleAlert, UserPlus, X } from 'lucide-react';
import type { DeliveryBooking } from '@/types';
import { Avatar, Button, StatusBadge } from '@/components/ui';
import { AdminHeader, ChipGroup, Kv, MiniSelect, Panel, SearchField, Th, Tick, ToolBtn, tableCls } from '@/components/admin/kit';
import { CityMap } from '@/components/admin/CityMap';
import { deliveryEta, fleet, stageIndex, stageLabel, telHref } from '@/components/admin/data';
import { useDeliveries } from '@/hooks/useData';
import { useInterval, useDebounced, usePageMeta } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { deliveryService } from '@/services/api';
import { deliveryStages } from '@/data/seed';
import { deliveryCategories, findDeliveryCategory } from '@/data/services';
import { DEFAULT_CITY, activeCities, cityName, junctionLabel } from '@/config/locations';
import { cn, formatDate, formatTime, naira, titleCase, todayISO } from '@/utils';

const URGENCY = [
  { value: 'all', label: 'All urgencies' },
  { value: 'express', label: 'Express' },
  { value: 'same_day', label: 'Same day' },
  { value: 'standard', label: 'Standard' },
  { value: 'scheduled', label: 'Scheduled' },
];

export default function DispatchPage() {
  usePageMeta('Delivery dispatch');
  const deliveries = useDeliveries();
  const toast = useToast();
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), 30_000);
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 150).trim().toLowerCase();
  const [urgency, setUrgency] = useState('all');
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [scope, setScope] = useState<'open' | 'all' | 'late'>('open');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [selId, setSelId] = useState<string | null>(null);
  const [mapCity, setMapCity] = useState(DEFAULT_CITY);
  const [bulkRider, setBulkRider] = useState('');

  const enriched = useMemo(() => deliveries.map((d) => ({ d, eta: deliveryEta(d, now) })), [deliveries, now]);
  const filtered = enriched.filter(({ d, eta }) => {
    if (scope === 'open' && !eta.open) return false;
    if (scope === 'late' && !eta.late) return false;
    if (urgency !== 'all' && d.urgency !== urgency) return false;
    if (category !== 'all' && d.categoryId !== category) return false;
    if (city !== 'all' && d.pickup.cityId !== city) return false;
    if (!dq) return true;
    return [d.reference, d.packageDescription, d.sender.name, d.recipient.name, d.rider?.name, d.pickup.address, d.dropoff.address].join(' ').toLowerCase().includes(dq);
  });

  const stats = {
    open: enriched.filter((x) => x.eta.open).length,
    late: enriched.filter((x) => x.eta.late).length,
    unassigned: enriched.filter((x) => x.eta.open && !x.d.rider).length,
    delivered: deliveries.filter((d) => d.stage === 'delivered' && d.timeline[d.timeline.length - 1]?.at?.slice(0, 10) === todayISO()).length,
  };

  const effectiveMapCity = city !== 'all' ? city : mapCity;
  const mapMarkers = enriched
    .filter(({ d, eta }) => d.pickup.cityId === effectiveMapCity && (eta.open || d.id === selId) && filtered.some((f) => f.d.id === d.id))
    .map(({ d, eta }) => ({ id: d.id, from: d.pickup, to: d.dropoff, progress: d.stage === 'received' ? 0 : eta.progress, late: eta.late, done: d.stage === 'delivered', label: d.reference.slice(-4) }));

  const advance = (ids: string[]) => {
    let n = 0;
    ids.forEach((id) => {
      const d = deliveries.find((x) => x.id === id);
      if (!d || d.stage === 'delivered' || d.status === 'cancelled') return;
      deliveryService.advance(id);
      n++;
    });
    toast({ title: n ? `Advanced ${n} deliver${n === 1 ? 'y' : 'ies'}` : 'Nothing to advance', body: n ? 'Customers notified in-app (demo).' : 'Selected deliveries are completed or cancelled.', tone: n ? 'success' : 'info' });
  };

  const assign = (ids: string[], riderId: string) => {
    const rider = fleet.find((r) => r.id === riderId);
    if (!rider) return;
    ids.forEach((id) => {
      const d = deliveries.find((x) => x.id === id);
      if (!d || d.stage === 'delivered' || d.status === 'cancelled') return;
      deliveryService.update(id, { rider });
      if (d.stage === 'received') deliveryService.advance(id);
    });
    toast({ title: 'Rider assigned', body: `${rider.name} → ${ids.length} deliver${ids.length === 1 ? 'y' : 'ies'} (demo dispatch).` });
  };

  const visibleIds = filtered.map((x) => x.d.id);
  const allPicked = visibleIds.length > 0 && visibleIds.every((id) => picked.has(id));
  const somePicked = visibleIds.some((id) => picked.has(id));
  const toggle = (id: string, v: boolean) => setPicked((p) => { const n = new Set(p); if (v) n.add(id); else n.delete(id); return n; });
  const pickedIds = [...picked].filter((id) => visibleIds.includes(id));
  const sel = enriched.find((x) => x.d.id === selId) ?? null;

  const byStage = deliveryStages.map((s) => ({ ...s, items: filtered.filter((x) => x.d.stage === s.key) })).filter((g) => g.items.length);

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader eyebrow="Logistics" title="Delivery dispatch" description="Live board of parcel, market and business deliveries. Assign riders, advance stages and watch delays — positions and ETAs are simulated.">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Open deliveries', value: stats.open, icon: <Package className="size-4" /> },
            { label: 'Running late', value: stats.late, icon: <TriangleAlert className="size-4" />, crit: stats.late > 0 },
            { label: 'Awaiting rider', value: stats.unassigned, icon: <UserPlus className="size-4" /> },
            { label: 'Delivered today', value: stats.delivered, icon: <MapPinned className="size-4" /> },
          ].map((s) => (
            <div key={s.label} className={cn('flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5', s.crit ? 'border-crit/30' : 'border-line')}>
              <span className={cn('grid size-8 place-items-center rounded-lg', s.crit ? 'bg-crit-bg text-crit' : 'bg-brand-50 text-brand-700')}>{s.icon}</span>
              <div><dt className="text-[11px] font-semibold text-muted">{s.label}</dt><dd className="font-display text-lg leading-tight font-bold text-ink-900 tabular-nums">{s.value}</dd></div>
            </div>
          ))}
        </dl>
      </AdminHeader>

      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
        <SearchField className="lg:w-72" value={q} onChange={setQ} placeholder="Search ref, package, people…" label="Search deliveries" />
        <div className="grid grid-cols-3 gap-2 lg:flex">
          <MiniSelect label="Urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} options={URGENCY} />
          <MiniSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: 'all', label: 'All categories' }, ...deliveryCategories.map((c) => ({ value: c.id, label: c.name }))]} />
          <MiniSelect label="City" value={city} onChange={(e) => setCity(e.target.value)} options={[{ value: 'all', label: 'All cities' }, ...activeCities.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
        <div className="lg:ml-auto">
          <ChipGroup label="Scope" value={scope} onChange={setScope} options={[{ value: 'open', label: 'Open', count: stats.open }, { value: 'late', label: 'Late', count: stats.late }, { value: 'all', label: 'All', count: deliveries.length }]} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Dispatch map"
          subtitle="Stylised — no live GPS. Select a rider marker to inspect."
          action={city === 'all' ? <ChipGroup label="Map city" value={mapCity} onChange={setMapCity} options={activeCities.slice(0, 4).map((c) => ({ value: c.id, label: c.name, count: enriched.filter((x) => x.eta.open && x.d.pickup.cityId === c.id).length }))} /> : undefined}
          bodyClassName="p-3"
        >
          <CityMap cityId={effectiveMapCity} markers={mapMarkers} selected={selId} onSelect={(id) => setSelId((s) => (s === id ? null : id))} />
        </Panel>

        <Panel title={sel ? <span className="font-mono">{sel.d.reference}</span> : 'Delivery detail'} action={sel && <button type="button" onClick={() => setSelId(null)} aria-label="Close detail" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2"><X className="size-4" /></button>}>
          {sel ? <DeliveryDetail key={sel.d.id} d={sel.d} eta={sel.eta} onAdvance={() => advance([sel.d.id])} onAssign={(rid) => assign([sel.d.id], rid)} /> : (
            <div className="grid min-h-60 place-items-center text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MapPinned className="size-5" aria-hidden /></span>
                <p className="mt-3 font-semibold text-ink-900">Select a delivery</p>
                <p className="mt-1 text-xs text-muted">Click a marker on the map or a row below.</p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <section aria-label="Deliveries by stage" className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="text-[15px] font-semibold text-ink-900">Deliveries by stage</h2>
          <span className="text-xs text-muted">{filtered.length} shown</span>
          {pickedIds.length > 0 && (
            <div role="toolbar" aria-label="Bulk actions" className="ml-auto flex flex-wrap items-center gap-2 rounded-xl bg-ink-900 px-2 py-1.5 text-white">
              <span className="px-2 text-xs font-semibold">{pickedIds.length} selected</span>
              <Button size="sm" variant="brand" className="h-8" iconLeft={<ChevronsRight className="size-4" />} onClick={() => advance(pickedIds)}>Advance stage</Button>
              <label className="sr-only" htmlFor="bulk-rider">Assign rider to selected</label>
              <select id="bulk-rider" value={bulkRider} onChange={(e) => setBulkRider(e.target.value)} className="h-8 rounded-lg border-0 bg-white/10 px-2 text-xs text-white outline-none focus:ring-2 focus:ring-brand-400 [&>option]:text-ink-900">
                <option value="">Assign rider…</option>
                {fleet.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <Button size="sm" variant="white" className="h-8" disabled={!bulkRider} onClick={() => { assign(pickedIds, bulkRider); setBulkRider(''); }}>Assign</Button>
              <button type="button" onClick={() => setPicked(new Set())} className="rounded-lg px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white">Clear</button>
            </div>
          )}
        </div>
        <div className={tableCls.wrap}>
          <table className={cn(tableCls.table, 'min-w-[1040px]')}>
            <thead className={tableCls.head}>
              <tr>
                <th scope="col" className="w-10 py-2.5 pl-4"><Tick label="Select all visible deliveries" checked={allPicked} indeterminate={!allPicked && somePicked} onChange={(v) => setPicked(v ? new Set(visibleIds) : new Set())} /></th>
                <Th>Reference</Th>
                <Th>Category</Th>
                <Th>Route</Th>
                <Th>Urgency</Th>
                <Th>Progress</Th>
                <Th>ETA</Th>
                <Th>Rider</Th>
                <Th className="pr-4 text-right">Action</Th>
              </tr>
            </thead>
            {byStage.map((g) => (
              <tbody key={g.key}>
                <tr className="bg-surface-2/40">
                  <th scope="rowgroup" colSpan={9} className="px-4 py-1.5 text-left text-[11px] font-bold tracking-wide text-text-2 uppercase">{g.label} <span className="ml-1 text-muted">{g.items.length}</span></th>
                </tr>
                {g.items.map(({ d, eta }) => (
                  <tr key={d.id} className={cn(tableCls.row, 'cursor-pointer', selId === d.id && 'bg-brand-50/60')} onClick={() => { setSelId(d.id); setMapCity(d.pickup.cityId); }}>
                    <td className="py-2.5 pl-4" onClick={(e) => e.stopPropagation()}><Tick label={`Select ${d.reference}`} checked={picked.has(d.id)} onChange={(v) => toggle(d.id, v)} /></td>
                    <td className={tableCls.td}>
                      <button type="button" className="font-mono text-[12px] font-semibold text-brand-700 hover:underline" onClick={(e) => { e.stopPropagation(); setSelId(d.id); setMapCity(d.pickup.cityId); }}>{d.reference}</button>
                      <p className="text-xs text-muted">{cityName(d.pickup.cityId)}</p>
                    </td>
                    <td className={tableCls.td}><p className="font-medium text-ink-900">{findDeliveryCategory(d.categoryId)?.name ?? d.categoryId}</p><p className="max-w-[180px] truncate text-xs text-muted">{d.packageDescription}</p></td>
                    <td className={cn(tableCls.td, 'max-w-[220px]')}><p className="truncate">{junctionLabel(d.pickup.cityId, d.pickup.junctionId)}</p><p className="truncate text-xs text-muted">→ {junctionLabel(d.dropoff.cityId, d.dropoff.junctionId)}</p></td>
                    <td className={tableCls.td}><UrgencyChip u={d.urgency} /></td>
                    <td className={cn(tableCls.td, 'w-36')}><StageDots idx={eta.idx} late={eta.late} /><p className="mt-1 text-[11px] text-muted">{stageLabel(d.stage)}</p></td>
                    <td className={cn(tableCls.td, 'whitespace-nowrap')}><EtaCell eta={eta} d={d} /></td>
                    <td className={tableCls.td}>{d.rider ? <span className="flex items-center gap-2"><Avatar src={d.rider.avatar} name={d.rider.name} size={24} /><span className="max-w-28 truncate">{d.rider.name}</span></span> : <span className="text-xs font-semibold text-crit">Unassigned</span>}</td>
                    <td className="py-2.5 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <ToolBtn disabled={!eta.open} onClick={() => advance([d.id])}><ChevronsRight /> Advance</ToolBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
            {!byStage.length && (
              <tbody><tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-muted">No deliveries match these filters.</td></tr></tbody>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}

function UrgencyChip({ u }: { u: DeliveryBooking['urgency'] }) {
  const cls = { express: 'bg-go-50 text-go-700 ring-go-100', same_day: 'bg-brand-50 text-brand-700 ring-brand-100', standard: 'bg-surface-2 text-text-2 ring-line', scheduled: 'bg-[#f3efff] text-[#6d3fd6] ring-[#e4dbff]' }[u];
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', cls)}>{u === 'express' && <Timer className="size-3" aria-hidden />}{titleCase(u)}</span>;
}

function StageDots({ idx, late }: { idx: number; late?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Stage ${idx + 1} of ${deliveryStages.length}`}>
      {deliveryStages.map((s, i) => <span key={s.key} className={cn('h-1.5 flex-1 rounded-full', i <= idx ? (late ? 'bg-crit' : i === deliveryStages.length - 1 ? 'bg-ok' : 'bg-brand-500') : 'bg-surface-2')} />)}
    </div>
  );
}

function EtaCell({ eta, d }: { eta: ReturnType<typeof deliveryEta>; d: DeliveryBooking }) {
  if (d.status === 'cancelled') return <span className="text-xs text-muted">Cancelled</span>;
  if (!eta.open) return <span className="text-xs font-semibold text-ok">Delivered</span>;
  if (eta.upcoming) return <span className="inline-flex items-center gap-1 text-xs text-text-2"><Clock className="size-3.5" aria-hidden />{formatDate(d.date, { day: 'numeric', month: 'short' })} {formatTime(d.time)}</span>;
  if (eta.late) return <span className="inline-flex items-center gap-1 rounded-full bg-crit-bg px-2 py-0.5 text-xs font-semibold text-crit"><TriangleAlert className="size-3" aria-hidden />+{eta.lateBy} min late</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-900"><Timer className="size-3.5 text-brand-600" aria-hidden />~{eta.etaMin} min</span>;
}

function DeliveryDetail({ d, eta, onAdvance, onAssign }: { d: DeliveryBooking; eta: ReturnType<typeof deliveryEta>; onAdvance: () => void; onAssign: (riderId: string) => void }) {
  const [rider, setRider] = useState(d.rider?.id ?? '');
  const idx = stageIndex(d.stage);
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={d.stage} />
        <UrgencyChip u={d.urgency} />
        <EtaCell eta={eta} d={d} />
      </div>
      <ol className="mt-4 space-y-1.5" aria-label="Delivery stages">
        {deliveryStages.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2 text-xs">
            <span className={cn('size-2 rounded-full', i < idx ? 'bg-ok' : i === idx ? 'bg-brand-500 ring-4 ring-brand-500/20' : 'bg-line-strong')} aria-hidden />
            <span className={cn(i === idx ? 'font-semibold text-ink-900' : i < idx ? 'text-text-2' : 'text-muted')}>{s.label}</span>
            {i === idx && <span className="sr-only">(current)</span>}
          </li>
        ))}
      </ol>
      <dl className="mt-3 divide-y divide-line border-t border-line">
        <Kv label="Pickup">{junctionLabel(d.pickup.cityId, d.pickup.junctionId)}</Kv>
        <Kv label="Drop-off">{junctionLabel(d.dropoff.cityId, d.dropoff.junctionId)}</Kv>
        <Kv label="Sender">{d.sender.name}</Kv>
        <Kv label="Recipient">{d.recipient.name} · {d.recipient.phone}</Kv>
        <Kv label="Package">{d.packages} × {titleCase(d.packageSize)} · {d.weightKg} kg</Kv>
        {d.handling.length > 0 && <Kv label="Handling">{d.handling.map(titleCase).join(', ')}</Kv>}
        {d.market && <Kv label="Market">{d.market.marketName}{d.market.stallLocation ? ` · ${d.market.stallLocation}` : ''}</Kv>}
        <Kv label="Delivery code" mono>{d.deliveryCode}</Kv>
        <Kv label="Fare (estimate)">{naira(d.fare.total)}</Kv>
      </dl>
      <div className="mt-3 flex items-end gap-2">
        <MiniSelect className="flex-1" label="Rider" srLabel={false} value={rider} onChange={(e) => setRider(e.target.value)} options={[{ value: '', label: 'Select rider…' }, ...fleet.map((r) => ({ value: r.id, label: `${r.name} · ${r.rating}★` }))]} />
        <Button size="sm" variant="outline" className="h-10" disabled={!rider || rider === d.rider?.id || !eta.open} onClick={() => onAssign(rider)}>Assign</Button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="brand" block disabled={!eta.open} iconLeft={<ChevronsRight className="size-4" />} onClick={onAdvance}>{eta.open && idx < deliveryStages.length - 1 ? `Advance to “${deliveryStages[idx + 1].label}”` : 'Completed'}</Button>
        {d.rider && <a href={telHref(d.rider.phone)} aria-label={`Call ${d.rider.name}`} className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-text-2 hover:text-brand-700"><Phone className="size-4" /></a>}
      </div>
    </div>
  );
}
