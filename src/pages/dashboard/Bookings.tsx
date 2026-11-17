import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, ChevronRight, Plus, Repeat, RotateCcw, Search } from 'lucide-react';
import { Button, ButtonLink, EmptyState, Input, Select, StatusBadge, Tabs } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { KindIcon, kindMeta, rebookHref, rideBucket, tierName, whenKey, type Bucket } from '@/components/dashboard/shared';
import { usePageMeta, useDebounced } from '@/hooks';
import { useBookings } from '@/hooks/useData';
import { junctionLabel } from '@/config/locations';
import type { RideBooking, RideKind } from '@/types';
import { formatDate, formatTime, naira } from '@/utils';

type TabKey = 'all' | Bucket;
type SortKey = 'date-desc' | 'date-asc' | 'fare-desc' | 'fare-asc';

const sorters: Record<SortKey, (a: RideBooking, b: RideBooking) => number> = {
  'date-desc': (a, b) => whenKey(b).localeCompare(whenKey(a)),
  'date-asc': (a, b) => whenKey(a).localeCompare(whenKey(b)),
  'fare-desc': (a, b) => b.fare.total - a.fare.total,
  'fare-asc': (a, b) => a.fare.total - b.fare.total,
};

const route = (b: RideBooking) => `${junctionLabel(b.pickup.cityId, b.pickup.junctionId)} → ${junctionLabel(b.dropoff.cityId, b.dropoff.junctionId)}`;

export default function BookingsPage() {
  usePageMeta('My bookings');
  const bookings = useBookings();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as TabKey) || 'all';
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | RideKind>('all');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const q = useDebounced(query, 200).trim().toLowerCase();

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: bookings.length, upcoming: 0, active: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => c[rideBucket(b.status)]++);
    return c;
  }, [bookings]);

  const rows = useMemo(
    () =>
      bookings
        .filter((b) => tab === 'all' || rideBucket(b.status) === tab)
        .filter((b) => kind === 'all' || b.kind === kind)
        .filter((b) => !q || [b.reference, route(b), b.pickup.address, b.dropoff.address, tierName(b.tierId)].join(' ').toLowerCase().includes(q))
        .sort(sorters[sort]),
    [bookings, tab, kind, q, sort],
  );

  const setTab = (t: TabKey) => {
    const next = new URLSearchParams(params);
    if (t === 'all') next.delete('tab');
    else next.set('tab', t);
    setParams(next, { replace: true });
  };
  const filtered = q || kind !== 'all';

  return (
    <div>
      <DashPageHeader
        title="My bookings"
        subtitle="Every motorcycle, tricycle and shuttle trip — view details, modify, cancel or book again."
        actions={<ButtonLink to="/booking" iconLeft={<Plus className="size-4" />}>Book a ride</ButtonLink>}
      />

      <div className="card overflow-hidden">
        <Tabs<TabKey>
          className="px-2 sm:px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'completed', label: 'Completed', count: counts.completed },
            { value: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ]}
        />

        <div className="grid gap-3 border-b border-line bg-surface-2/40 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Input label={<span className="sr-only">Search bookings</span>} type="search" placeholder="Search by reference, place or service" icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select
            label={<span className="sr-only">Service type</span>}
            value={kind}
            onChange={(e) => setKind(e.target.value as 'all' | RideKind)}
            options={[{ value: 'all', label: 'All services' }, { value: 'motorcycle', label: 'Motorcycle' }, { value: 'tricycle', label: 'Tricycle' }, { value: 'shuttle', label: 'Shuttle' }]}
            className="sm:w-44"
          />
          <Select
            label={<span className="sr-only">Sort by</span>}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            icon={<ArrowDownUp />}
            options={[{ value: 'date-desc', label: 'Newest trip first' }, { value: 'date-asc', label: 'Oldest trip first' }, { value: 'fare-desc', label: 'Fare: high to low' }, { value: 'fare-asc', label: 'Fare: low to high' }]}
            className="sm:w-52"
          />
        </div>

        <p className="sr-only" aria-live="polite">{rows.length} bookings shown</p>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon="Bike"
              title={filtered ? 'No bookings match your filters' : tab === 'all' ? 'No bookings yet' : `No ${tab} bookings`}
              body={filtered ? 'Try a different search term or service type.' : 'Your rides will show up here as soon as you book one.'}
              action={filtered ? <Button variant="outline" size="sm" iconLeft={<RotateCcw className="size-4" />} onClick={() => { setQuery(''); setKind('all'); }}>Clear filters</Button> : <ButtonLink to="/booking" size="sm">Book a ride</ButtonLink>}
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold tracking-wider text-muted uppercase">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-5 py-3">Trip</th>
                    <th scope="col" className="px-3 py-3">Route</th>
                    <th scope="col" className="px-3 py-3">When</th>
                    <th scope="col" className="px-3 py-3">Status</th>
                    <th scope="col" className="px-3 py-3 text-right">Fare</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {rows.map((b) => (
                      <motion.tr
                        key={b.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-brand-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <KindIcon kind={b.kind} size="sm" />
                            <div className="min-w-0">
                              <Link to={`/dashboard/bookings/${b.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-ink-900 hover:text-brand-700">{tierName(b.tierId)}</Link>
                              <p className="font-mono text-xs text-muted">{b.reference}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[18rem] px-3 py-4"><p className="truncate text-text-2">{route(b)}</p></td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <p className="font-medium text-ink-900">{formatDate(b.date)}</p>
                          <p className="text-xs text-muted">{formatTime(b.time)}{b.recurring && <span className="ml-1 inline-flex items-center gap-0.5 text-brand-700"><Repeat className="size-3" aria-hidden /> {b.recurring.frequency}</span>}</p>
                        </td>
                        <td className="px-3 py-4"><div className="flex flex-col items-start gap-1"><StatusBadge status={b.status} />{b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && <span className="text-xs font-semibold text-warn">Payment due</span>}</div></td>
                        <td className="px-3 py-4 text-right font-semibold text-ink-900 tabular-nums">{naira(b.fare.total)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={rebookHref(b)} onClick={(e) => e.stopPropagation()} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-go-600 opacity-70 transition group-hover:opacity-100 hover:bg-go-50">
                              <Repeat className="size-3.5" aria-hidden /> Book again
                            </Link>
                            <ChevronRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink-900" aria-hidden />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((b) => (
                <li key={b.id} className="p-4">
                  <Link to={`/dashboard/bookings/${b.id}`} className="flex gap-3">
                    <KindIcon kind={b.kind} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-ink-900">{tierName(b.tierId)}</p>
                        <p className="font-semibold text-ink-900 tabular-nums">{naira(b.fare.total)}</p>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-text-2">{route(b)}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatDate(b.date)} · {formatTime(b.time)} · <span className="font-mono">{b.reference}</span></p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={b.status} />
                        <span className="text-xs text-muted">{kindMeta[b.kind].label}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-3 flex gap-2 pl-14">
                    <ButtonLink to={`/dashboard/bookings/${b.id}`} size="sm" variant="outline" className="flex-1">Details</ButtonLink>
                    <ButtonLink to={rebookHref(b)} size="sm" variant="soft" className="flex-1" iconLeft={<Repeat className="size-3.5" />}>Book again</ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
