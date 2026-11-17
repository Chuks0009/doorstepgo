import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, ChevronRight, KeyRound, Plus, Repeat, RotateCcw, Search, ShoppingBasket } from 'lucide-react';
import { Button, ButtonLink, EmptyState, Icon, Input, Select, StatusBadge, Tabs } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { categoryName, deliveryBucket, redeliverHref, whenKey, type Bucket } from '@/components/dashboard/shared';
import { usePageMeta, useDebounced } from '@/hooks';
import { useDeliveries } from '@/hooks/useData';
import { junctionLabel } from '@/config/locations';
import { deliveryCategories, findDeliveryCategory } from '@/data/services';
import { deliveryStages } from '@/data/seed';
import type { DeliveryBooking } from '@/types';
import { cn, formatDate, formatTime, naira } from '@/utils';

type TabKey = 'all' | Bucket;
type SortKey = 'date-desc' | 'date-asc' | 'fare-desc' | 'fare-asc';

const sorters: Record<SortKey, (a: DeliveryBooking, b: DeliveryBooking) => number> = {
  'date-desc': (a, b) => whenKey(b).localeCompare(whenKey(a)),
  'date-asc': (a, b) => whenKey(a).localeCompare(whenKey(b)),
  'fare-desc': (a, b) => b.fare.total - a.fare.total,
  'fare-asc': (a, b) => a.fare.total - b.fare.total,
};

const route = (d: DeliveryBooking) => `${junctionLabel(d.pickup.cityId, d.pickup.junctionId)} → ${junctionLabel(d.dropoff.cityId, d.dropoff.junctionId)}`;

function CatIcon({ id, className }: { id: string; className?: string }) {
  const c = findDeliveryCategory(id);
  return (
    <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', id === 'market-pickup' ? 'bg-amber-50 text-amber-700' : 'bg-ink-900 text-white', className)} aria-hidden>
      <Icon name={c?.icon ?? 'Package'} className="size-5" />
    </span>
  );
}

/** Thin 7-step stage meter. */
function StageMeter({ d }: { d: DeliveryBooking }) {
  const idx = deliveryStages.findIndex((s) => s.key === d.stage);
  return (
    <div className="flex items-center gap-1" aria-label={`Stage ${idx + 1} of ${deliveryStages.length}: ${deliveryStages[idx]?.label}`} role="img">
      {deliveryStages.map((s, i) => (
        <span key={s.key} className={cn('h-1.5 flex-1 rounded-full', d.status === 'cancelled' ? 'bg-line' : i <= idx ? (i === deliveryStages.length - 1 ? 'bg-ok' : 'bg-go-500') : 'bg-line')} />
      ))}
    </div>
  );
}

export default function DeliveriesPage() {
  usePageMeta('My deliveries');
  const deliveries = useDeliveries();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as TabKey) || 'all';
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const q = useDebounced(query, 200).trim().toLowerCase();

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: deliveries.length, upcoming: 0, active: 0, completed: 0, cancelled: 0 };
    deliveries.forEach((d) => c[deliveryBucket(d)]++);
    return c;
  }, [deliveries]);

  const rows = useMemo(
    () =>
      deliveries
        .filter((d) => tab === 'all' || deliveryBucket(d) === tab)
        .filter((d) => cat === 'all' || d.categoryId === cat)
        .filter((d) => !q || [d.reference, route(d), d.packageDescription, d.recipient.name, d.market?.marketName ?? '', categoryName(d.categoryId)].join(' ').toLowerCase().includes(q))
        .sort(sorters[sort]),
    [deliveries, tab, cat, q, sort],
  );

  const setTab = (t: TabKey) => {
    const next = new URLSearchParams(params);
    if (t === 'all') next.delete('tab');
    else next.set('tab', t);
    setParams(next, { replace: true });
  };
  const filtered = q || cat !== 'all';

  return (
    <div>
      <DashPageHeader
        title="My deliveries"
        subtitle="Parcels, documents, groceries and market pickups — track, share codes and view proof of delivery."
        actions={
          <>
            <ButtonLink to="/delivery?category=market-pickup" variant="outline" iconLeft={<ShoppingBasket className="size-4" />}>Market pickup</ButtonLink>
            <ButtonLink to="/delivery" iconLeft={<Plus className="size-4" />}>Send a package</ButtonLink>
          </>
        }
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
          <Input label={<span className="sr-only">Search deliveries</span>} type="search" placeholder="Search reference, recipient, item or place" icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select label={<span className="sr-only">Category</span>} value={cat} onChange={(e) => setCat(e.target.value)} options={[{ value: 'all', label: 'All categories' }, ...deliveryCategories.map((c) => ({ value: c.id, label: c.name }))]} className="sm:w-52" />
          <Select label={<span className="sr-only">Sort by</span>} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} icon={<ArrowDownUp />} options={[{ value: 'date-desc', label: 'Newest first' }, { value: 'date-asc', label: 'Oldest first' }, { value: 'fare-desc', label: 'Fee: high to low' }, { value: 'fare-asc', label: 'Fee: low to high' }]} className="sm:w-48" />
        </div>
        <p className="sr-only" aria-live="polite">{rows.length} deliveries shown</p>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon="Package"
              title={filtered ? 'No deliveries match your filters' : tab === 'all' ? 'No deliveries yet' : `No ${tab} deliveries`}
              body={filtered ? 'Try another search or category.' : 'Send your first package — we collect from your door.'}
              action={filtered ? <Button variant="outline" size="sm" iconLeft={<RotateCcw className="size-4" />} onClick={() => { setQuery(''); setCat('all'); }}>Clear filters</Button> : <ButtonLink to="/delivery" size="sm">Send a package</ButtonLink>}
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold tracking-wider text-muted uppercase">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-5 py-3">Delivery</th>
                    <th scope="col" className="px-3 py-3">Route & recipient</th>
                    <th scope="col" className="px-3 py-3">Progress</th>
                    <th scope="col" className="px-3 py-3">When</th>
                    <th scope="col" className="px-3 py-3 text-right">Fee</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((d) => (
                    <tr key={d.id} onClick={() => navigate(`/dashboard/deliveries/${d.id}`)} className="group cursor-pointer transition-colors hover:bg-brand-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CatIcon id={d.categoryId} className="size-9" />
                          <div className="min-w-0 max-w-[14rem]">
                            <Link to={`/dashboard/deliveries/${d.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-semibold text-ink-900 hover:text-brand-700">{d.packageDescription}</Link>
                            <p className="font-mono text-xs text-muted">{d.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[16rem] px-3 py-4">
                        <p className="truncate text-text-2">{route(d)}</p>
                        <p className="text-xs text-muted">To {d.recipient.name}</p>
                      </td>
                      <td className="w-44 px-3 py-4">
                        <div className="mb-1.5"><StatusBadge status={d.status === 'cancelled' ? 'cancelled' : d.stage} /></div>
                        <StageMeter d={d} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap"><p className="font-medium text-ink-900">{formatDate(d.date)}</p><p className="text-xs text-muted">{formatTime(d.time)}</p></td>
                      <td className="px-3 py-4 text-right font-semibold text-ink-900 tabular-nums">{naira(d.fare.total)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={redeliverHref(d)} onClick={(e) => e.stopPropagation()} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-go-600 opacity-70 transition group-hover:opacity-100 hover:bg-go-50"><Repeat className="size-3.5" aria-hidden /> Send again</Link>
                          <ChevronRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink-900" aria-hidden />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {rows.map((d) => (
                <li key={d.id} className="p-4">
                  <Link to={`/dashboard/deliveries/${d.id}`} className="flex gap-3">
                    <CatIcon id={d.categoryId} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-ink-900">{d.packageDescription}</p>
                        <p className="shrink-0 font-semibold text-ink-900 tabular-nums">{naira(d.fare.total)}</p>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-text-2">{route(d)}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatDate(d.date)} · <span className="font-mono">{d.reference}</span></p>
                      <div className="mt-2 flex items-center gap-2"><StatusBadge status={d.status === 'cancelled' ? 'cancelled' : d.stage} />{deliveryBucket(d) === 'active' && <span className="flex items-center gap-1 text-xs text-muted"><KeyRound className="size-3" aria-hidden /> Code ready</span>}</div>
                      <div className="mt-2.5"><StageMeter d={d} /></div>
                    </div>
                  </Link>
                  <div className="mt-3 flex gap-2 pl-14">
                    <ButtonLink to={`/dashboard/deliveries/${d.id}`} size="sm" variant="outline" className="flex-1">Details</ButtonLink>
                    <ButtonLink to={redeliverHref(d)} size="sm" variant="soft" className="flex-1" iconLeft={<Repeat className="size-3.5" />}>Send again</ButtonLink>
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
