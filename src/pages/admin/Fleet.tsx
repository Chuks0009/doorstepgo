import { useCallback, useMemo, useState } from 'react';
import { Clock, Ellipsis, FileWarning, Phone, ShieldAlert, ShieldCheck, Shuffle, Star, Upload, Users } from 'lucide-react';
import type { Driver } from '@/types';
import { Avatar, Drawer, StatusBadge, Stars } from '@/components/ui';
import { AdminHeader, ChipGroup, DrawerSection, Kv, Menu, MiniSelect, SearchField, SortTh, Th, ToolBtn, tableCls, type SortDir } from '@/components/admin/kit';
import { Sparkline, StackedBars } from '@/components/admin/charts';
import { SERIES, fleet, fmtInt, riderMeta, riderStatus, riderWeekly, rng, seriesColor, telHref, trend, type DocState, type RiderStatus } from '@/components/admin/data';
import { useBookings, useDeliveries } from '@/hooks/useData';
import { usePageMeta } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { activeCities, cityName, findArea } from '@/config/locations';
import { addDays, cn, formatDate, todayISO } from '@/utils';

const STATUS_META: Record<RiderStatus, { label: string; cls: string; dot: string }> = {
  online: { label: 'Online', cls: 'bg-ok-bg text-ok ring-emerald-100', dot: 'bg-ok' },
  on_trip: { label: 'On trip', cls: 'bg-go-50 text-go-700 ring-go-100', dot: 'bg-go-500' },
  offline: { label: 'Offline', cls: 'bg-surface-2 text-text-2 ring-line', dot: 'bg-muted' },
};
const DOC_META: Record<DocState, { label: string; cls: string }> = {
  verified: { label: 'Approved (demo)', cls: 'bg-ok-bg text-ok' },
  pending: { label: 'Awaiting review', cls: 'bg-warn-bg text-warn' },
  expiring: { label: 'Expiring soon', cls: 'bg-go-50 text-go-700' },
  missing: { label: 'Not uploaded', cls: 'bg-crit-bg text-crit' },
};

type SortKey = 'name' | 'rating' | 'trips' | 'acceptance' | 'docs';

export default function FleetPage() {
  usePageMeta('Riders & fleet');
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const toast = useToast();
  const [overrides, setOverrides] = useState<Record<string, RiderStatus>>({});
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [kind, setKind] = useState('all');
  const [st, setSt] = useState<'all' | RiderStatus>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'rating', dir: 'desc' });
  const [selId, setSelId] = useState<string | null>(null);
  const close = useCallback(() => setSelId(null), []);
  const [shift, setShift] = useState(0);

  const rows = useMemo(
    () =>
      fleet.map((d) => {
        const meta = riderMeta(d);
        return { d, meta, status: riderStatus(d, bookings, deliveries, overrides), docsOk: meta.docs.filter((x) => x.state === 'verified').length };
      }),
    [bookings, deliveries, overrides],
  );
  const filtered = rows
    .filter((r) => (city === 'all' || r.meta.cityId === city) && (kind === 'all' || r.meta.kind === kind) && (st === 'all' || r.status === st) && (!q.trim() || [r.d.name, r.d.plate, r.d.vehicle, r.d.phone].join(' ').toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => {
      const v = (r: typeof a) => ({ name: r.d.name, rating: r.d.rating, trips: r.d.trips, acceptance: r.meta.acceptance, docs: r.docsOk })[sort.key];
      const x = v(a);
      const y = v(b);
      const res = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? res : -res;
    });
  const onSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  const count = (s: RiderStatus) => rows.filter((r) => r.status === s).length;
  const docsPending = rows.reduce((s, r) => s + r.meta.docs.filter((x) => x.state !== 'verified').length, 0);
  const setStatus = (d: Driver, s: RiderStatus) => {
    setOverrides((o) => ({ ...o, [d.id]: s }));
    toast({ title: `${d.name} set ${STATUS_META[s].label.toLowerCase()}`, body: 'Simulated availability — no rider app connected yet.', tone: 'info' });
  };
  const simulateShift = () => {
    const n = shift + 1;
    setShift(n);
    const r = rng(`shift:${n}`);
    const next: Record<string, RiderStatus> = {};
    fleet.forEach((d) => (next[d.id] = r() > 0.72 ? 'offline' : r() > 0.65 ? 'on_trip' : 'online'));
    setOverrides(next);
    toast({ title: 'Shift change simulated', body: 'Rider availability reshuffled (demo).', tone: 'info' });
  };

  const sel = rows.find((r) => r.d.id === selId) ?? null;

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Supply"
        title="Riders & fleet"
        description="Roster of riders and drivers across cities. Availability is simulated; document checks below preview a future verification workflow."
        actions={<ToolBtn onClick={simulateShift}><Shuffle /> Simulate shift change</ToolBtn>}
      >
        <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { l: 'Riders', v: rows.length, i: <Users className="size-4" /> },
            { l: 'Online', v: count('online'), dot: 'bg-ok' },
            { l: 'On trip', v: count('on_trip'), dot: 'bg-go-500' },
            { l: 'Offline', v: count('offline'), dot: 'bg-muted' },
            { l: 'Avg rating', v: (rows.reduce((s, r) => s + r.d.rating, 0) / rows.length).toFixed(2), i: <Star className="size-4" /> },
            { l: 'Docs to review', v: docsPending, i: <FileWarning className="size-4" /> },
          ].map((k) => (
            <div key={k.l} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2">
              {k.i ? <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">{k.i}</span> : <span aria-hidden className={cn('ml-1 size-2.5 rounded-full', k.dot)} />}
              <div><dt className="text-[11px] font-semibold text-muted">{k.l}</dt><dd className="font-display text-lg leading-tight font-bold text-ink-900 tabular-nums">{k.v}</dd></div>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <SearchField className="lg:w-72" value={q} onChange={setQ} placeholder="Search name, plate, vehicle…" label="Search riders" />
          <div className="grid grid-cols-2 gap-2 lg:flex">
            <MiniSelect label="City" value={city} onChange={(e) => setCity(e.target.value)} options={[{ value: 'all', label: 'All cities' }, ...activeCities.map((c) => ({ value: c.id, label: c.name }))]} />
            <MiniSelect label="Service" value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: 'all', label: 'All services' }, ...SERIES.map((s) => ({ value: s.key, label: s.label }))]} />
          </div>
          <div className="lg:ml-auto">
            <ChipGroup label="Availability" value={st} onChange={setSt} options={[{ value: 'all', label: 'All' }, { value: 'online', label: 'Online', count: count('online') }, { value: 'on_trip', label: 'On trip', count: count('on_trip') }, { value: 'offline', label: 'Offline', count: count('offline') }]} />
          </div>
        </div>
      </AdminHeader>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className={tableCls.wrap}>
          <table className={cn(tableCls.table, 'min-w-[1000px]')}>
            <thead className={tableCls.head}>
              <tr>
                <SortTh k="name" sort={sort} onSort={onSort} className="pl-4">Rider</SortTh>
                <Th>Vehicle</Th>
                <Th>Area</Th>
                <SortTh k="rating" sort={sort} onSort={onSort}>Rating</SortTh>
                <SortTh k="trips" sort={sort} onSort={onSort} align="right">Trips</SortTh>
                <SortTh k="acceptance" sort={sort} onSort={onSort} align="right">Acceptance</SortTh>
                <Th>Status</Th>
                <SortTh k="docs" sort={sort} onSort={onSort}>Documents</SortTh>
                <Th className="pr-4"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ d, meta, status, docsOk }) => (
                <tr key={d.id} className={cn(tableCls.row, 'cursor-pointer')} onClick={() => setSelId(d.id)}>
                  <td className="py-2.5 pr-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <span className="relative">
                        <Avatar src={d.avatar} name={d.name} size={34} />
                        <span aria-hidden className={cn('absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-white', STATUS_META[status].dot)} />
                      </span>
                      <div className="min-w-0">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelId(d.id); }} className="block truncate font-semibold text-ink-900 hover:text-brand-700">{d.name}</button>
                        <p className="text-xs text-muted">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tableCls.td}>
                    <p className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ background: seriesColor[meta.kind] }} /><span className="max-w-44 truncate">{d.vehicle}</span></p>
                    <p className="font-mono text-[11px] text-muted">{d.plate}</p>
                  </td>
                  <td className={tableCls.td}><p>{findArea(meta.cityId, meta.areaId)?.name ?? cityName(meta.cityId)}</p><p className="text-[11px] text-muted">{cityName(meta.cityId)}</p></td>
                  <td className={tableCls.td}><span className="inline-flex items-center gap-1.5 font-semibold tabular-nums"><Star className="size-3.5 fill-go-500 text-go-500" aria-hidden />{d.rating.toFixed(2)}</span></td>
                  <td className={cn(tableCls.td, 'text-right tabular-nums')}>{fmtInt(d.trips)}</td>
                  <td className={cn(tableCls.td, 'text-right tabular-nums')}>{meta.acceptance}%</td>
                  <td className={tableCls.td}><span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', STATUS_META[status].cls)}><span aria-hidden className={cn('size-1.5 rounded-full', STATUS_META[status].dot)} />{STATUS_META[status].label}</span></td>
                  <td className={tableCls.td}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5" aria-hidden>{meta.docs.map((x) => <span key={x.key} className={cn('h-2 w-3 rounded-sm', x.state === 'verified' ? 'bg-ok' : x.state === 'missing' ? 'bg-crit' : 'bg-warn')} />)}</div>
                      <span className="text-xs text-text-2 tabular-nums">{docsOk}/{meta.docs.length}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                    <Menu label={`Actions for ${d.name}`} trigger={<Ellipsis className="size-4" />} items={[{ label: 'Open profile', onSelect: () => setSelId(d.id) }, ...(['online', 'on_trip', 'offline'] as RiderStatus[]).filter((s) => s !== status).map((s) => ({ label: `Set ${STATUS_META[s].label.toLowerCase()}`, onSelect: () => setStatus(d, s) }))]} />
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-muted">No riders match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={!!sel} onClose={close} title={sel?.d.name ?? 'Rider'}>
        {sel && <RiderDetail row={sel} jobs={[...bookings.filter((b) => b.driver?.id === sel.d.id).map((b) => ({ id: b.id, ref: b.reference, date: b.date, status: b.status })), ...deliveries.filter((x) => x.rider?.id === sel.d.id).map((x) => ({ id: x.id, ref: x.reference, date: x.date, status: x.stage as string }))]} onStatus={(s) => setStatus(sel.d, s)} />}
      </Drawer>
    </div>
  );
}

function RiderDetail({ row, jobs, onStatus }: { row: { d: Driver; meta: ReturnType<typeof riderMeta>; status: RiderStatus; docsOk: number }; jobs: { id: string; ref: string; date: string; status: string }[]; onStatus: (s: RiderStatus) => void }) {
  const { d, meta, status } = row;
  const toast = useToast();
  const weekly = riderWeekly(d);
  const today = todayISO();
  const ratingTrend = trend(`rating-${d.id}`, d.rating, 12, 0.015);
  return (
    <div className="text-sm">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <Avatar src={d.avatar} name={d.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold text-ink-900">{d.name}</p>
          <p className="truncate text-xs text-muted">{d.vehicle} · <span className="font-mono">{d.plate}</span></p>
          <Stars value={d.rating} />
        </div>
        <a href={telHref(d.phone)} aria-label={`Call ${d.name}`} className="grid size-10 place-items-center rounded-xl border border-line text-text-2 hover:text-brand-700"><Phone className="size-4" /></a>
      </div>

      <DrawerSection title="Availability (simulated)">
        <div role="radiogroup" aria-label="Rider availability" className="grid grid-cols-3 gap-1">
          {(['online', 'on_trip', 'offline'] as RiderStatus[]).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => status !== s && onStatus(s)} className={cn('flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition', status === s ? 'bg-ink-900 text-white' : 'bg-surface-2 text-text-2 hover:bg-brand-50')}>
              <span aria-hidden className={cn('size-1.5 rounded-full', STATUS_META[s].dot)} />{STATUS_META[s].label}
            </button>
          ))}
        </div>
      </DrawerSection>

      <DrawerSection title="Performance">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ['Rating', d.rating.toFixed(2)],
            ['Trips', fmtInt(d.trips)],
            ['Accept', `${meta.acceptance}%`],
            ['Cancel', `${meta.cancelRate}%`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-surface-2 px-1 py-2"><p className="text-[10px] font-semibold text-muted uppercase">{l}</p><p className="font-display text-sm font-bold text-ink-900 tabular-nums">{v}</p></div>
          ))}
        </div>
        <p className="mt-4 mb-1 text-xs font-semibold text-text-2">Trips per week · last 12 weeks</p>
        <StackedBars title={`${d.name} trips per week`} height={150} series={[{ key: 'trips', label: 'Trips', color: seriesColor[meta.kind] }]} data={weekly.map((v, i) => ({ label: `W${i + 1}`, sub: `Week of ${formatDate(addDays(today, (i - 11) * 7), { day: 'numeric', month: 'short' })}`, values: { trips: v } }))} />
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2">
          <div><p className="text-xs font-semibold text-text-2">Rating trend</p><p className="text-[11px] text-muted">12 weeks · simulated</p></div>
          <Sparkline data={ratingTrend} color="#FF6A13" className="h-8 w-28" label="Rating trend" />
        </div>
        <dl className="mt-2 divide-y divide-line">
          <Kv label="Base area">{findArea(meta.cityId, meta.areaId)?.name ?? '—'}, {cityName(meta.cityId)}</Kv>
          <Kv label="Joined">{formatDate(meta.joined)}</Kv>
        </dl>
      </DrawerSection>

      <DrawerSection title="Documents">
        <div role="note" className="mb-3 flex gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/70 p-3 text-xs text-brand-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p><b>Future workflow — preview only.</b> No documents are stored and no identity or background verification is performed in this demo. Statuses are placeholders.</p>
        </div>
        <ul className="space-y-1.5">
          {meta.docs.map((x) => (
            <li key={x.key} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
              {x.state === 'verified' ? <ShieldCheck className="size-4 text-ok" aria-hidden /> : x.state === 'expiring' ? <Clock className="size-4 text-go-600" aria-hidden /> : <FileWarning className={cn('size-4', x.state === 'missing' ? 'text-crit' : 'text-warn')} aria-hidden />}
              <span className="flex-1 text-[13px] font-medium text-ink-900">{x.label}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', DOC_META[x.state].cls)}>{DOC_META[x.state].label}</span>
              {x.state !== 'verified' && (
                <button type="button" aria-label={`Request ${x.label} from ${d.name}`} onClick={() => toast({ title: 'Re-upload request queued (demo)', body: `${x.label} · ${d.name}. No message was actually sent.`, tone: 'info' })} className="grid size-7 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-brand-700"><Upload className="size-3.5" /></button>
              )}
            </li>
          ))}
        </ul>
      </DrawerSection>

      <DrawerSection title={`Assigned jobs (${jobs.length})`}>
        {jobs.length ? (
          <ul className="divide-y divide-line">
            {jobs.map((j) => <li key={j.id} className="flex items-center justify-between gap-2 py-2"><span className="font-mono text-xs">{j.ref}</span><span className="flex items-center gap-2"><span className="text-[11px] text-muted">{formatDate(j.date, { day: 'numeric', month: 'short' })}</span><StatusBadge status={j.status} /></span></li>)}
          </ul>
        ) : <p className="text-xs text-muted">No jobs from this browser's records.</p>}
      </DrawerSection>
    </div>
  );
}
