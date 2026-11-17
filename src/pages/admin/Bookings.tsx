import { useCallback, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Columns3, Ellipsis, GripVertical, Repeat, Table2, UserRound } from 'lucide-react';
import type { BookingStatus, RideBooking } from '@/types';
import { Avatar, StatusBadge } from '@/components/ui';
import { AdminHeader, Menu, MiniSelect, Pagination, SearchField, SortTh, Th, ToolBtn, ViewSwitch, tableCls, type SortDir } from '@/components/admin/kit';
import { BookingDrawer, bookingOps } from '@/components/admin/BookingDrawer';
import { isUnassigned, kindLabel, needsApproval, seriesColor } from '@/components/admin/data';
import { useBookings } from '@/hooks/useData';
import { useDebounced, usePageMeta } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { findTier } from '@/data/services';
import { activeCities, cityName, junctionLabel } from '@/config/locations';
import { addDays, cn, formatDate, formatTime, naira, todayISO } from '@/utils';

type View = 'kanban' | 'table' | 'calendar';
type ColKey = 'pending' | 'driver_assigned' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
const COLUMNS: { key: ColKey; label: string; statuses: BookingStatus[]; accent: string }[] = [
  { key: 'pending', label: 'Pending', statuses: ['pending', 'confirmed', 'modification_requested', 'cancellation_requested'], accent: '#c77700' },
  { key: 'driver_assigned', label: 'Driver assigned', statuses: ['driver_assigned'], accent: '#1f5fe6' },
  { key: 'driver_arriving', label: 'Arriving', statuses: ['driver_arriving'], accent: '#ff6a13' },
  { key: 'in_progress', label: 'In progress', statuses: ['in_progress'], accent: '#8b5cf6' },
  { key: 'completed', label: 'Completed', statuses: ['completed'], accent: '#0f9d58' },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'], accent: '#d33a3a' },
];
const colOf = (s: BookingStatus): ColKey => COLUMNS.find((c) => c.statuses.includes(s))?.key ?? 'pending';

type SortKey = 'reference' | 'kind' | 'city' | 'date' | 'fare' | 'status';
const PAGE = 8;

export default function BookingsPage() {
  usePageMeta('Ride bookings');
  const bookings = useBookings();
  const toast = useToast();
  const [view, setView] = useState<View>('kanban');
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 150).trim().toLowerCase();
  const [kind, setKind] = useState('all');
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('all');
  const [selId, setSelId] = useState<string | null>(null);
  const close = useCallback(() => setSelId(null), []);
  const [announce, setAnnounce] = useState('');

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        if (kind !== 'all' && b.kind !== kind) return false;
        if (city !== 'all' && b.pickup.cityId !== city) return false;
        if (status !== 'all' && b.status !== status) return false;
        if (!dq) return true;
        const hay = [b.reference, b.pickup.address, b.dropoff.address, junctionLabel(b.pickup.cityId, b.pickup.junctionId), junctionLabel(b.dropoff.cityId, b.dropoff.junctionId), b.driver?.name, findTier(b.tierId)?.name].join(' ').toLowerCase();
        return hay.includes(dq);
      }),
    [bookings, kind, city, status, dq],
  );

  const move = useCallback(
    (b: RideBooking, col: ColKey) => {
      if (colOf(b.status) === col) return;
      const label = COLUMNS.find((c) => c.key === col)!.label;
      bookingOps.setStatus(b, col);
      const msg = `${b.reference} moved to ${label}`;
      setAnnounce(msg);
      toast({ title: 'Booking updated', body: col === 'driver_assigned' && !b.driver ? `${msg}. A demo driver was auto-assigned.` : msg });
    },
    [toast],
  );

  const selected = bookings.find((b) => b.id === selId) ?? null;
  const counts = Object.fromEntries(COLUMNS.map((c) => [c.key, bookings.filter((b) => c.statuses.includes(b.status)).length])) as Record<ColKey, number>;

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Rides"
        title="Ride bookings"
        description="Motorcycle, tricycle and shuttle bookings. Drag cards between stages, assign drivers and approve customer requests."
        actions={<ViewSwitch label="Bookings view" value={view} onChange={setView} options={[{ value: 'kanban', label: 'Board', icon: <Columns3 /> }, { value: 'table', label: 'Table', icon: <Table2 /> }, { value: 'calendar', label: 'Week', icon: <CalendarDays /> }]} />}
      >
        <dl className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COLUMNS.map((c) => (
            <div key={c.key} className="rounded-xl border border-line bg-white px-3 py-2">
              <dt className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-muted"><span aria-hidden className="size-1.5 rounded-full" style={{ background: c.accent }} />{c.label}</dt>
              <dd className="font-display text-lg font-bold text-ink-900 tabular-nums">{counts[c.key]}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <SearchField className="md:w-72" value={q} onChange={setQ} placeholder="Search reference, place, driver…" label="Search bookings" />
          <div className="grid grid-cols-3 gap-2 md:flex">
            <MiniSelect label="Service" value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: 'all', label: 'All services' }, ...Object.entries(kindLabel).map(([value, label]) => ({ value, label }))]} />
            <MiniSelect label="City" value={city} onChange={(e) => setCity(e.target.value)} options={[{ value: 'all', label: 'All cities' }, ...activeCities.map((c) => ({ value: c.id, label: c.name }))]} />
            <MiniSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'all', label: 'All statuses' }, ...['pending', 'confirmed', 'modification_requested', 'cancellation_requested', 'driver_assigned', 'driver_arriving', 'in_progress', 'completed', 'cancelled'].map((s) => ({ value: s, label: s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) }))]} />
          </div>
          {(q || kind !== 'all' || city !== 'all' || status !== 'all') && (
            <ToolBtn onClick={() => { setQ(''); setKind('all'); setCity('all'); setStatus('all'); }}>Clear filters</ToolBtn>
          )}
          <span className="text-xs text-muted md:ml-auto">{filtered.length} of {bookings.length} bookings</span>
        </div>
      </AdminHeader>

      <p className="sr-only" aria-live="assertive">{announce}</p>
      {view === 'kanban' && <Kanban items={filtered} onOpen={setSelId} onMove={move} />}
      {view === 'table' && <BookingTable items={filtered} onOpen={setSelId} onMove={move} />}
      {view === 'calendar' && <WeekCalendar items={filtered} onOpen={setSelId} />}

      <BookingDrawer booking={selected} onClose={close} />
    </div>
  );
}

/* ================= Card ================= */
function BookingCard({ b, onOpen, onMove, onPointerDown, dragging }: { b: RideBooking; onOpen: (id: string) => void; onMove: (b: RideBooking, c: ColKey) => void; onPointerDown?: (e: RPointerEvent<HTMLElement>, b: RideBooking) => void; dragging?: boolean }) {
  const col = colOf(b.status);
  const idx = COLUMNS.findIndex((c) => c.key === col);
  return (
    <article
      tabIndex={0}
      aria-label={`${b.reference}, ${kindLabel[b.kind]}, ${COLUMNS[idx].label}`}
      aria-describedby="kanban-help"
      onPointerDown={(e) => onPointerDown?.(e, b)}
      onClick={() => onOpen(b.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(b.id);
        if (e.altKey && e.key === 'ArrowRight' && idx < COLUMNS.length - 1) { e.preventDefault(); onMove(b, COLUMNS[idx + 1].key); }
        if (e.altKey && e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); onMove(b, COLUMNS[idx - 1].key); }
      }}
      className={cn('group relative cursor-pointer rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgb(10_22_64/0.05)] transition select-none hover:border-brand-300 hover:shadow-soft focus-visible:outline-2 focus-visible:outline-brand-500', dragging && 'opacity-40')}
    >
      <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full" style={{ background: seriesColor[b.kind] }} />
      <div className="flex items-start gap-2">
        <span data-grip className="-ml-1 grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded text-muted hover:bg-surface-2 active:cursor-grabbing" aria-hidden><GripVertical className="size-3.5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-semibold text-muted">{b.reference}</p>
          <p className="truncate text-[13px] font-semibold text-ink-900">{junctionLabel(b.pickup.cityId, b.pickup.junctionId).split(',')[0]} → {junctionLabel(b.dropoff.cityId, b.dropoff.junctionId).split(',')[0]}</p>
        </div>
        <Menu
          label={`Actions for ${b.reference}`}
          trigger={<Ellipsis className="size-4" />}
          items={[{ label: 'Open details', onSelect: () => onOpen(b.id) }, ...COLUMNS.filter((c) => c.key !== col).map((c) => ({ label: `Move to ${c.label}`, onSelect: () => onMove(b, c.key) }))]}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-semibold text-text-2">{kindLabel[b.kind]}</span>
        <span className="text-muted">{formatDate(b.date, { day: 'numeric', month: 'short' })} · {formatTime(b.time)}</span>
        {b.recurring && <Repeat className="size-3 text-muted" aria-label="Recurring" />}
      </div>
      {(needsApproval(b) || isUnassigned(b)) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {needsApproval(b) && <StatusBadge status={b.status} />}
          {isUnassigned(b) && <span className="rounded-full bg-crit-bg px-2 py-0.5 text-[11px] font-semibold text-crit">Unassigned</span>}
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2">
        {b.driver ? (
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-2"><Avatar src={b.driver.avatar} name={b.driver.name} size={20} /><span className="truncate">{b.driver.name}</span></span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-muted"><UserRound className="size-3.5" aria-hidden />No driver</span>
        )}
        <span className="text-[12px] font-bold text-ink-900 tabular-nums">{naira(b.fare.total)}</span>
      </div>
    </article>
  );
}

/* ================= Kanban (pointer-event drag & drop) ================= */
function Kanban({ items, onOpen, onMove }: { items: RideBooking[]; onOpen: (id: string) => void; onMove: (b: RideBooking, c: ColKey) => void }) {
  const [drag, setDrag] = useState<{ b: RideBooking; x: number; y: number; w: number; ox: number; oy: number; over: ColKey | null } | null>(null);
  const start = useRef<{ x: number; y: number; b: RideBooking; el: HTMLElement; id: number } | null>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (e: RPointerEvent<HTMLElement>, b: RideBooking) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button,[role="menu"]')) return;
    if (e.pointerType !== 'mouse' && !target.closest('[data-grip]')) return;
    const r0 = e.currentTarget.getBoundingClientRect();
    start.current = { x: e.clientX, y: e.clientY, b, el: e.currentTarget, id: e.pointerId };
    let active = false;
    let over: ColKey | null = null;
    const move = (ev: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      if (!active && Math.hypot(ev.clientX - s.x, ev.clientY - s.y) < 6) return;
      active = true;
      over = ((document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-col]') as HTMLElement | null)?.dataset.col as ColKey | undefined) ?? null;
      setDrag({ b: s.b, x: ev.clientX, y: ev.clientY, w: r0.width, ox: s.x - r0.left, oy: s.y - r0.top, over });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (active) {
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
        if (over) onMove(b, over);
      }
      setDrag(null);
      start.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  return (
    <>
      <p id="kanban-help" className="sr-only">Press Enter to open. Use Alt plus Left or Right arrow to move the booking to the previous or next stage, or use the actions menu.</p>
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" onClickCapture={(e) => suppressClick.current && e.stopPropagation()}>
        <div className="grid min-w-[1180px] grid-cols-6 gap-3">
          {COLUMNS.map((c) => {
            const list = items.filter((b) => c.statuses.includes(b.status));
            const over = drag?.over === c.key && colOf(drag.b.status) !== c.key;
            return (
              <section key={c.key} data-col={c.key} aria-label={`${c.label}, ${list.length} bookings`} className={cn('flex min-h-[420px] flex-col rounded-2xl border bg-surface-2/60 p-2 transition', over ? 'border-brand-400 bg-brand-50 ring-4 ring-brand-500/10' : 'border-line')}>
                <header className="flex items-center gap-2 px-1.5 pt-1 pb-2.5">
                  <span aria-hidden className="size-2 rounded-full" style={{ background: c.accent }} />
                  <h2 className="text-[13px] font-semibold text-ink-900">{c.label}</h2>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-text-2 tabular-nums ring-1 ring-line">{list.length}</span>
                </header>
                <div className="flex flex-1 flex-col gap-2">
                  {list.map((b) => <BookingCard key={b.id} b={b} onOpen={onOpen} onMove={onMove} onPointerDown={onPointerDown} dragging={drag?.b.id === b.id} />)}
                  {!list.length && <p className={cn('grid flex-1 place-items-center rounded-xl border border-dashed text-center text-xs text-muted', over ? 'border-brand-400' : 'border-line-strong')}>{over ? 'Drop to move here' : 'No bookings'}</p>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      {drag && (
        <div aria-hidden className="pointer-events-none fixed z-[90] rotate-2" style={{ left: drag.x - drag.ox, top: drag.y - drag.oy, width: drag.w }}>
          <div className="rounded-xl shadow-lift ring-2 ring-brand-500">
            <BookingCard b={drag.b} onOpen={() => {}} onMove={() => {}} />
          </div>
        </div>
      )}
    </>
  );
}

/* ================= Table ================= */
function BookingTable({ items, onOpen, onMove }: { items: RideBooking[]; onOpen: (id: string) => void; onMove: (b: RideBooking, c: ColKey) => void }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const onSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const sorted = useMemo(() => {
    const val = (b: RideBooking): string | number => ({ reference: b.reference, kind: b.kind, city: cityName(b.pickup.cityId), date: `${b.date}T${b.time}`, fare: b.fare.total, status: COLUMNS.findIndex((c) => c.statuses.includes(b.status)) })[sort.key];
    return [...items].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? r : -r;
    });
  }, [items, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const p = Math.min(page, pages);
  const rows = sorted.slice((p - 1) * PAGE, p * PAGE);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className={tableCls.wrap}>
        <table className={cn(tableCls.table, 'min-w-[980px]')}>
          <thead className={tableCls.head}>
            <tr>
              <SortTh k="reference" sort={sort} onSort={onSort} className="pl-4">Reference</SortTh>
              <SortTh k="kind" sort={sort} onSort={onSort}>Service</SortTh>
              <Th>Route</Th>
              <SortTh k="city" sort={sort} onSort={onSort}>City</SortTh>
              <SortTh k="date" sort={sort} onSort={onSort}>Scheduled</SortTh>
              <Th>Driver</Th>
              <SortTh k="fare" sort={sort} onSort={onSort} align="right">Fare</SortTh>
              <SortTh k="status" sort={sort} onSort={onSort}>Status</SortTh>
              <Th>Payment</Th>
              <Th className="pr-4"><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className={cn(tableCls.row, 'cursor-pointer')} onClick={() => onOpen(b.id)}>
                <td className="py-2.5 pr-3 pl-4">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(b.id); }} className="font-mono text-[12px] font-semibold text-brand-700 hover:underline">{b.reference}</button>
                </td>
                <td className={tableCls.td}>
                  <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ background: seriesColor[b.kind] }} /><span className="font-medium text-ink-900">{kindLabel[b.kind]}</span></span>
                  <p className="text-xs text-muted">{findTier(b.tierId)?.name}</p>
                </td>
                <td className={cn(tableCls.td, 'max-w-[240px]')}>
                  <p className="truncate text-ink-900">{junctionLabel(b.pickup.cityId, b.pickup.junctionId)}</p>
                  <p className="truncate text-xs text-muted">→ {junctionLabel(b.dropoff.cityId, b.dropoff.junctionId)}</p>
                </td>
                <td className={tableCls.td}>{cityName(b.pickup.cityId)}</td>
                <td className={cn(tableCls.td, 'whitespace-nowrap tabular-nums')}>{formatDate(b.date, { day: 'numeric', month: 'short' })}<p className="text-xs text-muted">{formatTime(b.time)}</p></td>
                <td className={tableCls.td}>{b.driver ? <span className="flex items-center gap-2"><Avatar src={b.driver.avatar} name={b.driver.name} size={24} /><span className="truncate">{b.driver.name}</span></span> : <span className="text-xs font-semibold text-crit">Unassigned</span>}</td>
                <td className={cn(tableCls.td, 'text-right font-semibold tabular-nums')}>{naira(b.fare.total)}</td>
                <td className={tableCls.td}><StatusBadge status={b.status} /></td>
                <td className={tableCls.td}><StatusBadge status={b.paymentStatus} /></td>
                <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                  <Menu label={`Actions for ${b.reference}`} trigger={<Ellipsis className="size-4" />} items={[{ label: 'Open details', onSelect: () => onOpen(b.id) }, ...COLUMNS.filter((c) => c.key !== colOf(b.status)).map((c) => ({ label: `Move to ${c.label}`, onSelect: () => onMove(b, c.key) }))]} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={10} className="px-4 py-14 text-center text-sm text-muted">No bookings match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={p} pages={pages} onPage={setPage} total={sorted.length} pageSize={PAGE} />
    </div>
  );
}

/* ================= Week calendar ================= */
const HOUR_START = 5;
const HOUR_END = 23;
const ROW = 44;
const mondayOf = (iso: string) => {
  const d = new Date(iso + 'T12:00:00').getDay();
  return addDays(iso, -((d + 6) % 7));
};

interface CalEvent { id: string; b: RideBooking; date: string; start: number; dur: number; label: string; recurring?: boolean; isReturn?: boolean; lane: number; lanes: number }

function WeekCalendar({ items, onOpen }: { items: RideBooking[]; onOpen: (id: string) => void }) {
  const [week, setWeek] = useState(() => mondayOf(todayISO()));
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const today = todayISO();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const events = useMemo(() => {
    const out: Omit<CalEvent, 'lane' | 'lanes'>[] = [];
    const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    items.forEach((b) => {
      const dur = Math.max(30, Math.round(b.fare.durationMin));
      days.forEach((d) => {
        const dow = new Date(d + 'T12:00:00').getDay();
        let hit = d === b.date;
        let recurring = false;
        if (!hit && b.recurring && d > b.date && (!b.recurring.until || d <= b.recurring.until) && b.status !== 'cancelled') {
          const f = b.recurring.frequency;
          hit = f === 'daily' || (f === 'weekdays' && dow >= 1 && dow <= 5) || (f === 'weekly' && dow === new Date(b.date + 'T12:00:00').getDay());
          recurring = hit;
        }
        if (hit) out.push({ id: `${b.id}-${d}`, b, date: d, start: toMin(b.time), dur, label: kindLabel[b.kind], recurring });
        const returnHit = b.returnDate && b.returnTime && (d === b.returnDate || (recurring && b.tripType === 'return'));
        if (returnHit && b.returnTime) out.push({ id: `${b.id}-${d}-r`, b, date: d, start: toMin(b.returnTime), dur, label: 'Return', recurring, isReturn: true });
      });
    });
    // lanes per day
    const res: CalEvent[] = [];
    days.forEach((d) => {
      const list = out.filter((e) => e.date === d).sort((a, b) => a.start - b.start);
      const ends: number[] = [];
      const placed = list.map((e) => {
        let lane = ends.findIndex((end) => end <= e.start);
        if (lane === -1) lane = ends.length;
        ends[lane] = e.start + e.dur;
        return { ...e, lane };
      });
      placed.forEach((e) => res.push({ ...e, lanes: ends.length }));
    });
    return res;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, week]);

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <ToolBtn label="Previous week" onClick={() => setWeek(addDays(week, -7))} className="px-2"><ChevronLeft /></ToolBtn>
        <ToolBtn onClick={() => setWeek(mondayOf(today))}>This week</ToolBtn>
        <ToolBtn label="Next week" onClick={() => setWeek(addDays(week, 7))} className="px-2"><ChevronRight /></ToolBtn>
        <h2 className="ml-2 text-sm font-semibold text-ink-900">{formatDate(week, { day: 'numeric', month: 'short' })} – {formatDate(addDays(week, 6), { day: 'numeric', month: 'short', year: 'numeric' })}</h2>
        <span className="ml-auto text-xs text-muted">{events.length} scheduled trip{events.length === 1 ? '' : 's'} this week</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-line bg-surface-2/50">
            <div />
            {days.map((d) => (
              <div key={d} className={cn('border-l border-line px-2 py-2 text-center', d === today && 'bg-brand-50')}>
                <p className="text-[11px] font-semibold text-muted uppercase">{formatDate(d, { weekday: 'short' })}</p>
                <p className={cn('mx-auto mt-0.5 grid size-7 place-items-center rounded-full font-display text-sm font-bold', d === today ? 'bg-brand-600 text-white' : 'text-ink-900')}>{Number(d.slice(8))}</p>
              </div>
            ))}
          </div>
          <div className="relative max-h-[640px] overflow-y-auto">
            <div className="relative grid grid-cols-[56px_repeat(7,1fr)]" style={{ height: hours.length * ROW }}>
              <div className="relative">
                {hours.map((h, i) => <span key={h} className="absolute right-2 -translate-y-1/2 text-[10px] text-muted tabular-nums" style={{ top: i * ROW }}>{i === 0 ? '' : `${String(h).padStart(2, '0')}:00`}</span>)}
              </div>
              {days.map((d) => (
                <div key={d} className={cn('relative border-l border-line', d === today && 'bg-brand-50/30')}>
                  {hours.map((h, i) => <div key={h} aria-hidden className="absolute inset-x-0 border-t border-line/70" style={{ top: i * ROW }} />)}
                  {d === today && nowMin >= HOUR_START * 60 && nowMin <= HOUR_END * 60 && (
                    <div aria-hidden className="absolute inset-x-0 z-[2] border-t-2 border-go-500" style={{ top: ((nowMin - HOUR_START * 60) / 60) * ROW }}>
                      <span className="absolute -top-[5px] -left-1 size-2 rounded-full bg-go-500" />
                    </div>
                  )}
                  {events.filter((e) => e.date === d).map((e) => {
                    const top = Math.max(0, ((e.start - HOUR_START * 60) / 60) * ROW);
                    const height = Math.max(26, (e.dur / 60) * ROW - 2);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onOpen(e.b.id)}
                        className="absolute z-[1] overflow-hidden rounded-lg border-l-[3px] bg-white px-1.5 py-1 text-left shadow-soft ring-1 ring-line transition hover:z-[3] hover:ring-brand-400 focus-visible:z-[3]"
                        style={{ top, height, left: `calc(${(e.lane / e.lanes) * 100}% + 2px)`, width: `calc(${100 / e.lanes}% - 4px)`, borderLeftColor: seriesColor[e.b.kind], background: `color-mix(in srgb, ${seriesColor[e.b.kind]} 8%, white)` }}
                        aria-label={`${e.b.reference}, ${e.label}, ${formatDate(e.date)} ${formatTime(`${String(Math.floor(e.start / 60)).padStart(2, '0')}:${String(e.start % 60).padStart(2, '0')}`)}`}
                      >
                        <p className="flex items-center gap-1 truncate text-[11px] font-bold text-ink-900">{e.recurring && <Repeat className="size-3 shrink-0" aria-hidden />}{e.label}{e.isReturn ? '' : ` · ${formatTime(e.b.time)}`}</p>
                        <p className="truncate text-[10px] text-text-2">{junctionLabel(e.b.pickup.cityId, e.b.pickup.junctionId).split(',')[0]}</p>
                        {e.b.status === 'cancelled' && <p className="text-[10px] font-semibold text-crit">Cancelled</p>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
