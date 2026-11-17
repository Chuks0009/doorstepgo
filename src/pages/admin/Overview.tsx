import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Bike, CalendarCheck, CircleAlert, Download, MessageSquareQuote, Package, Star, TriangleAlert, Wallet } from 'lucide-react';
import { ButtonLink, StatusBadge } from '@/components/ui';
import { AdminHeader, ChipGroup, KpiTile, Legend, Panel, ToolBtn, tableCls } from '@/components/admin/kit';
import { Donut, Heatmap, StackRows, StackedBars } from '@/components/admin/charts';
import { SERIES, buildActivity, dailyVolume, deliveryEta, fleet, fmtInt, hourlyDemand, isUnassigned, mixByArea, needsApproval, pctDelta, revenueByService, riderMeta, trend, type SeriesKey } from '@/components/admin/data';
import { useBookings, useDeliveries, useMerchants, useMessages, usePayments, useQuotes } from '@/hooks/useData';
import { useInterval, usePageMeta } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { DEFAULT_CITY, cities } from '@/config/locations';
import { cn, compactNaira, formatDate, naira, timeAgo, todayISO } from '@/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

export default function OverviewPage() {
  usePageMeta('Operations overview');
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const quotes = useQuotes();
  const messages = useMessages();
  const merchants = useMerchants();
  const payments = usePayments();
  const toast = useToast();
  const [, setTick] = useState(0);
  useInterval(() => setTick((t) => t + 1), 30_000);
  const [range, setRange] = useState<'7' | '14'>('14');

  const today = todayISO();
  const activeTrips = bookings.filter((b) => ['driver_assigned', 'driver_arriving', 'in_progress'].includes(b.status)).length;
  const inFlight = deliveries.filter((d) => d.stage !== 'received' && d.stage !== 'delivered' && d.status !== 'cancelled').length;
  const daily = useMemo(() => dailyVolume(bookings, deliveries, 14), [bookings, deliveries]);
  const todayTotal = SERIES.reduce((s, x) => s + daily[daily.length - 1].values[x.key], 0);
  const realRevenue = payments.filter((p) => p.status === 'paid_demo').reduce((s, p) => s + p.amount, 0);
  const revenue = useMemo(() => revenueByService(bookings, deliveries), [bookings, deliveries]);
  const revenueTotal = SERIES.reduce((s, x) => s + revenue[x.key], 0);
  const todayRevenue = SERIES.reduce((s, x) => s + daily[daily.length - 1].values[x.key] * ({ motorcycle: 2600, tricycle: 2100, delivery: 3200, shuttle: 28000 } as Record<SeriesKey, number>)[x.key], 0) + realRevenue * 0.1;
  const avgRating = fleet.reduce((s, d) => s + d.rating, 0) / fleet.length;
  const newQuotes = quotes.filter((q) => q.status === 'new').length;

  const kpis = [
    { label: 'Active trips', value: fmtInt(activeTrips + 37), series: trend('trips', activeTrips + 37), icon: <Bike />, hint: `${activeTrips} from live records + network sim` },
    { label: 'Deliveries in progress', value: fmtInt(inFlight + 24), series: trend('deliv', inFlight + 24), icon: <Package />, hint: `${inFlight} live in this browser`, color: '#0EA5A4' },
    { label: "Today's bookings", value: fmtInt(todayTotal), series: daily.map((d) => SERIES.reduce((s, x) => s + d.values[x.key], 0)), icon: <CalendarCheck />, hint: formatDate(today, { weekday: 'short', day: 'numeric', month: 'short' }) },
    { label: 'Revenue today (demo)', value: compactNaira(todayRevenue), series: trend('rev', todayRevenue), icon: <Wallet />, hint: 'Simulated — no real payments', color: '#FF6A13' },
    { label: 'Avg rider rating', value: avgRating.toFixed(2), series: trend('rating', avgRating, 14, 0.02), icon: <Star />, hint: `${fleet.length} riders on roster` },
    { label: 'New quote requests', value: String(newQuotes), series: trend('quotes', Math.max(1, newQuotes), 14, 0.6), icon: <MessageSquareQuote />, hint: `${quotes.length} total in inbox`, color: '#8B5CF6' },
  ];

  const barData = daily.slice(range === '7' ? -7 : -14).map((d) => ({ label: formatDate(d.iso, { day: 'numeric', month: 'short' }), sub: formatDate(d.iso, { weekday: 'long', day: 'numeric', month: 'short' }), values: d.values }));
  const totals = SERIES.map((s) => ({ ...s, value: barData.reduce((a, d) => a + d.values[s.key], 0) }));
  const mix = useMemo(() => mixByArea(bookings, deliveries), [bookings, deliveries]);
  const heat = useMemo(() => hourlyDemand(bookings, deliveries), [bookings, deliveries]);
  const activity = useMemo(() => buildActivity({ bookings, deliveries, quotes, messages, merchants }).slice(0, 12), [bookings, deliveries, quotes, messages, merchants]);

  const delayed = deliveries.filter((d) => deliveryEta(d).late);
  const unassigned = bookings.filter((b) => isUnassigned(b));
  const approvals = bookings.filter(needsApproval);
  const staleQuotes = quotes.filter((q) => q.status === 'new' && Date.now() - new Date(q.createdAt).getTime() > 2 * 36e5);
  const alerts = [
    ...delayed.map((d) => ({ id: d.id, tone: 'crit' as const, title: `Delivery ${d.reference} is running late`, body: `${deliveryEta(d).lateBy} min past its ${d.urgency.replace('_', ' ')} window`, to: '/admin/dispatch', cta: 'Dispatch' })),
    ...unassigned.map((b) => ({ id: b.id, tone: 'warn' as const, title: `${b.reference} has no driver`, body: `Scheduled ${formatDate(b.date, { day: 'numeric', month: 'short' })} at ${b.time}`, to: '/admin/bookings', cta: 'Assign' })),
    ...approvals.map((b) => ({ id: `a${b.id}`, tone: 'warn' as const, title: `${b.reference} needs approval`, body: b.status === 'cancellation_requested' ? 'Cancellation request' : 'Modification request', to: '/admin/bookings', cta: 'Review' })),
    ...staleQuotes.map((q) => ({ id: q.id, tone: 'warn' as const, title: `Quote ${q.reference} awaiting review`, body: `${q.fullName} · ${timeAgo(q.createdAt)}`, to: '/admin/quotes', cta: 'Open' })),
  ];

  const coverage = cities.map((c) => {
    const b = bookings.filter((x) => x.pickup.cityId === c.id).length;
    const d = deliveries.filter((x) => x.pickup.cityId === c.id).length;
    const rostered = fleet.filter((r) => riderMeta(r).cityId === c.id).length;
    // area mix covers the launch city only
    const week = c.id === DEFAULT_CITY ? mix.reduce((t, row) => t + SERIES.reduce((s, x) => s + row.values[x.key], 0), 0) : 0;
    // roster riders + simulated network riders proportional to demand
    return { c, b, d, riders: c.active ? rostered + Math.round(week / 40) : 0, week };
  });

  const exportCsv = () => {
    const rows = [['date', ...SERIES.map((s) => s.key), 'total'], ...daily.map((d) => [d.iso, ...SERIES.map((s) => String(d.values[s.key])), String(SERIES.reduce((a, s) => a + d.values[s.key], 0))])];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `doorstepgo-bookings-${today}-demo.csv` });
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', body: '14-day booking volume (simulated data).', tone: 'success' });
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <AdminHeader
        eyebrow="Operations"
        title="Operations overview"
        description="Network health across rides, deliveries and quotes. Charts blend records created in this browser with deterministic simulated history."
        actions={
          <>
            <ToolBtn onClick={exportCsv}><Download /> Export CSV</ToolBtn>
            <ButtonLink to="/admin/dispatch" variant="brand" size="sm" iconRight={<ArrowRight className="size-4" />}>Open dispatch</ButtonLink>
          </>
        }
      />

      {alerts.length > 0 && (
        <section aria-label="Alerts" className="mb-5 overflow-hidden rounded-2xl border border-warn/25 bg-warn-bg/60">
          <div className="flex items-center gap-2 border-b border-warn/20 px-4 py-2.5 text-sm font-semibold text-warn">
            <TriangleAlert className="size-4" aria-hidden /> {alerts.length} item{alerts.length > 1 ? 's' : ''} need attention
          </div>
          <ul className="grid divide-y divide-warn/15 md:grid-cols-2 md:divide-y-0">
            {alerts.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 md:border-b md:border-warn/15">
                <CircleAlert className={cn('size-4 shrink-0', a.tone === 'crit' ? 'text-crit' : 'text-warn')} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{a.title}</p>
                  <p className="truncate text-xs text-text-2">{a.body}</p>
                </div>
                <Link to={a.to} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-white">{a.cta} →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => <KpiTile key={k.label} {...k} delta={pctDelta(k.series)} />)}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Bookings per day"
          subtitle="Rides + deliveries, stacked by service"
          action={<ChipGroup label="Range" value={range} onChange={setRange} options={[{ value: '7', label: '7d' }, { value: '14', label: '14d' }]} />}
        >
          <Legend items={totals.map((t) => ({ label: t.label, color: t.color, value: fmtInt(t.value) }))} className="mb-3" />
          <StackedBars title={`Bookings per day, last ${range} days`} data={barData} series={SERIES} format={(n) => fmtInt(n)} height={250} />
        </Panel>
        <Panel title="Revenue by service" subtitle="Last 30 days · demo figures">
          <Donut title="Revenue share by service" data={SERIES.map((s) => ({ key: s.key, label: s.label, color: s.color, value: revenue[s.key] }))} center={{ label: '30-day revenue', value: compactNaira(revenueTotal) }} format={compactNaira} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Service mix by area" subtitle="Awka areas · share of bookings, last 7 days">
          <Legend items={SERIES} className="mb-3" />
          <StackRows title="Service mix by Awka area" rows={mix} series={SERIES} />
        </Panel>
        <Panel title="Hourly demand" subtitle="Requests by weekday and hour (typical week, simulated)">
          <Heatmap title="Hourly demand heatmap" rows={DAYS} cols={HOURS} values={heat} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Live activity" subtitle="Latest events across the network" action={<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok"><Activity className="size-3.5" aria-hidden />Live</span>} bodyClassName="p-0">
          <ol className="max-h-[420px] overflow-y-auto px-4 py-2 sm:px-5" aria-live="polite">
            {activity.map((a, i) => (
              <li key={a.id} className="relative flex gap-3 py-2.5">
                {i < activity.length - 1 && <span aria-hidden className="absolute top-6 bottom-0 left-[5px] w-px bg-line" />}
                <span aria-hidden className={cn('relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-white', { brand: 'bg-brand-500', go: 'bg-go-500', ok: 'bg-ok', warn: 'bg-warn', crit: 'bg-crit' }[a.tone])} />
                <div className="min-w-0 flex-1">
                  <Link to={a.to ?? '/admin'} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">{a.title}</Link>
                  <p className="truncate text-xs text-muted">{a.meta}</p>
                </div>
                <time dateTime={a.at} className="shrink-0 text-[11px] text-muted tabular-nums">{timeAgo(a.at)}</time>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="xl:col-span-2" title="City coverage" subtitle={`${cities.filter((c) => c.active).map((c) => c.name).join(', ')} live · ${cities.filter((c) => !c.active).length} cities planned`} bodyClassName="p-0">
          <div className={tableCls.wrap}>
            <table className={cn(tableCls.table, 'min-w-[620px]')}>
              <thead className={tableCls.head}>
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">City</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">Areas</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">Junctions</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">Riders online</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">7-day volume</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Live records</th>
                </tr>
              </thead>
              <tbody>
                {coverage.map(({ c, b, d, riders, week }) => (
                  <tr key={c.id} className={tableCls.row}>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-ink-900">{c.name}</p>
                      <p className="text-xs text-muted">{c.state}, {c.country}</p>
                    </td>
                    <td className={tableCls.td}>{c.active ? <StatusBadge status="active" /> : <span className="inline-flex rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-text-2 ring-1 ring-line ring-inset">Coming soon</span>}</td>
                    <td className={cn(tableCls.td, 'text-right tabular-nums')}>{c.areas.length}</td>
                    <td className={cn(tableCls.td, 'text-right tabular-nums')}>{c.areas.reduce((s, a) => s + a.junctions.length, 0)}</td>
                    <td className={cn(tableCls.td, 'text-right tabular-nums')}>{c.active ? riders : '—'}</td>
                    <td className={cn(tableCls.td, 'text-right font-semibold tabular-nums')}>{c.active ? fmtInt(week) : '—'}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-text-2 tabular-nums">{b} rides · {d} deliveries</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-2.5 text-[11px] text-muted">Revenue shown on this console is simulated ({naira(realRevenue)} recorded as demo payments in this browser). No real money is processed.</p>
        </Panel>
      </div>
    </div>
  );
}
