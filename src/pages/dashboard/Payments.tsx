import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CircleDollarSign, CreditCard, Download, Landmark, Lock, Plus, Printer, Receipt, RotateCcw, Search, Smartphone, Undo2, Wallet, Hash, type LucideIcon } from 'lucide-react';
import { Badge, Button, DemoNotice, EmptyState, Input, Modal, Segmented, Select, StatusBadge } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { Donut, chartPalette } from '@/components/dashboard/charts';
import { CopyButton, Panel, StatTile, methodLabel, printDocument } from '@/components/dashboard/shared';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta, useDebounced } from '@/hooks';
import { useBookings, useDeliveries, usePayments } from '@/hooks/useData';
import { paymentMethods } from '@/config/pricing';
import type { PaymentMethodKind, PaymentRecord } from '@/types';
import { cn, formatDate, formatDateTime, naira } from '@/utils';

const methodIcon: Record<PaymentMethodKind, LucideIcon> = { card: CreditCard, bank_transfer: Landmark, ussd: Hash, mobile_money: Smartphone, wallet: Wallet, cash: Banknote };
const methodOrder: PaymentMethodKind[] = ['card', 'bank_transfer', 'mobile_money', 'cash', 'ussd', 'wallet'];

type StatusFilter = 'all' | 'paid' | 'refunded' | 'pending';

export default function PaymentsPage() {
  usePageMeta('Payments');
  const payments = usePayments();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [method, setMethod] = useState<'all' | PaymentMethodKind>('all');
  const [query, setQuery] = useState('');
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);
  const [addCard, setAddCard] = useState(false);
  const q = useDebounced(query, 200).trim().toLowerCase();

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid_demo');
    const total = paid.reduce((s, p) => s + p.amount, 0);
    const refunded = payments.filter((p) => p.status === 'refunded_demo').reduce((s, p) => s + p.amount, 0);
    const month = new Date().toISOString().slice(0, 7);
    const thisMonth = paid.filter((p) => p.createdAt.startsWith(month)).reduce((s, p) => s + p.amount, 0);
    const byMethod = methodOrder
      .map((m, i) => ({ key: m, label: methodLabel(m), value: paid.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0), color: chartPalette[i] }))
      .filter((s) => s.value > 0);
    return { total, refunded, thisMonth, avg: paid.length ? total / paid.length : 0, count: paid.length, byMethod };
  }, [payments]);

  const rows = useMemo(
    () =>
      payments
        .filter((p) => status === 'all' || (status === 'paid' ? p.status === 'paid_demo' : status === 'refunded' ? p.status === 'refunded_demo' : p.status === 'pending' || p.status === 'unpaid' || p.status === 'failed'))
        .filter((p) => method === 'all' || p.method === method)
        .filter((p) => !q || [p.reference, p.bookingReference, p.description].join(' ').toLowerCase().includes(q))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [payments, status, method, q],
  );

  const linkFor = (ref: string) => {
    const b = bookings.find((x) => x.reference === ref);
    if (b) return `/dashboard/bookings/${b.id}`;
    const d = deliveries.find((x) => x.reference === ref);
    return d ? `/dashboard/deliveries/${d.id}` : undefined;
  };

  const printStatement = () => {
    const ok = printDocument(`Statement for ${user?.name ?? 'customer'}`, payments.map((p) => [`${formatDate(p.createdAt)} · ${p.description} (${p.reference})`, `${p.status === 'refunded_demo' ? 'Refunded ' : ''}${naira(p.amount)}`]), { heading: 'Payment statement', total: naira(stats.total) });
    if (!ok) toast({ title: 'Pop-up blocked', body: 'Allow pop-ups for this site to print your statement.', tone: 'error' });
  };

  const printReceipt = (p: PaymentRecord) => {
    const ok = printDocument(p.reference, [
      ['Description', p.description],
      ['Booking reference', p.bookingReference],
      ['Payment method', methodLabel(p.method)],
      ['Date', formatDateTime(p.createdAt)],
      ['Status', p.status === 'paid_demo' ? 'Paid (demo)' : p.status === 'refunded_demo' ? 'Refunded (demo)' : p.status],
    ], { heading: 'Payment receipt', total: naira(p.amount) });
    if (!ok) toast({ title: 'Pop-up blocked', body: 'Allow pop-ups for this site to print your receipt.', tone: 'error' });
  };

  return (
    <div className="space-y-6">
      <DashPageHeader
        title="Payments"
        subtitle="Your payment history, receipts and saved methods."
        actions={<Button variant="outline" iconLeft={<Download className="size-4" />} onClick={printStatement} disabled={!payments.length}>Print statement</Button>}
      />

      <DemoNotice>Payments in this demo are <strong>simulated</strong> — no real money is charged or refunded, and no card details are stored.</DemoNotice>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total paid" value={naira(stats.total)} sub={`${stats.count} payments`} icon={<CircleDollarSign />} accent="ink" />
        <StatTile label="This month" value={naira(stats.thisMonth)} sub={formatDate(new Date().toISOString(), { month: 'long', year: 'numeric' })} icon={<Receipt />} accent="go" />
        <StatTile label="Average per trip" value={naira(stats.avg)} sub="Paid bookings only" icon={<Wallet />} accent="brand" />
        <StatTile label="Refunded" value={naira(stats.refunded)} sub="Simulated refunds" icon={<Undo2 />} accent="ok" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Spend by method" subtitle="Share of paid amount" className="xl:col-span-3">
          {stats.byMethod.length ? <Donut slices={stats.byMethod} centerLabel="Total paid" /> : <p className="py-10 text-center text-sm text-muted">No paid bookings yet.</p>}
        </Panel>

        <Panel title="Saved methods" subtitle="Demo cards — nothing is stored" className="xl:col-span-2" action={<Button size="sm" variant="soft" iconLeft={<Plus className="size-4" />} onClick={() => setAddCard(true)}>Add</Button>}>
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl bg-brand-sheen p-5 text-white shadow-glow-brand">
              <div aria-hidden className="absolute -top-10 -right-6 size-32 rounded-full bg-white/15 blur-xl" />
              <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-wider text-white/70 uppercase">Default</span><span className="font-display text-lg font-extrabold italic">VISA</span></div>
              <p className="mt-6 font-mono text-lg tracking-[0.2em]">•••• •••• •••• 4242</p>
              <div className="mt-2 flex justify-between text-xs text-white/75"><span>{user?.name ?? 'Card holder'}</span><span>Exp 08/28</span></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="grid h-9 w-12 place-items-center rounded-lg bg-ink-900 text-[10px] font-extrabold text-white">MC</span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink-900">Mastercard •••• 8810</p><p className="text-xs text-muted">Exp 02/27</p></div>
              <Badge tone="neutral">Demo</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {paymentMethods.filter((m) => m.enabled).map((m) => {
                const I = methodIcon[m.id];
                return <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-2"><I className="size-3.5" aria-hidden />{m.label}{m.badge === 'Coming soon' && <span className="text-muted">· soon</span>}</span>;
              })}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Payment history" bodyClassName="p-0 sm:p-0">
        <div className="grid gap-3 border-b border-line px-5 pb-4 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <Segmented<StatusFilter> label="Filter by status" size="sm" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'refunded', label: 'Refunded' }, { value: 'pending', label: 'Pending' }]} className="w-full overflow-x-auto lg:w-auto" />
          <Input label={<span className="sr-only">Search payments</span>} type="search" placeholder="Search reference or description" icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select label={<span className="sr-only">Payment method</span>} value={method} onChange={(e) => setMethod(e.target.value as 'all' | PaymentMethodKind)} options={[{ value: 'all', label: 'All methods' }, ...methodOrder.map((m) => ({ value: m, label: methodLabel(m) }))]} className="lg:w-48" />
        </div>
        {rows.length === 0 ? (
          <div className="p-5"><EmptyState icon="Receipt" title="No payments found" body="Try a different filter." action={<Button size="sm" variant="outline" iconLeft={<RotateCcw className="size-4" />} onClick={() => { setStatus('all'); setMethod('all'); setQuery(''); }}>Reset filters</Button>} /></div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold tracking-wider text-muted uppercase">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-6 py-3">Payment</th>
                    <th scope="col" className="px-3 py-3">Method</th>
                    <th scope="col" className="px-3 py-3">Date</th>
                    <th scope="col" className="px-3 py-3">Status</th>
                    <th scope="col" className="px-3 py-3 text-right">Amount</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Receipt</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((p) => {
                    const I = methodIcon[p.method] ?? CreditCard;
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-brand-50/40">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-ink-900">{p.description}</p>
                          <p className="font-mono text-xs text-muted">{p.reference} · {linkFor(p.bookingReference) ? <Link to={linkFor(p.bookingReference)!} className="text-brand-700 hover:underline">{p.bookingReference}</Link> : p.bookingReference}</p>
                        </td>
                        <td className="px-3 py-4"><span className="inline-flex items-center gap-2 text-text-2"><I className="size-4" aria-hidden /> {methodLabel(p.method)}</span></td>
                        <td className="px-3 py-4 whitespace-nowrap text-text-2">{formatDateTime(p.createdAt)}</td>
                        <td className="px-3 py-4"><StatusBadge status={p.status} /></td>
                        <td className={cn('px-3 py-4 text-right font-semibold tabular-nums', p.status === 'refunded_demo' ? 'text-muted line-through' : 'text-ink-900')}>{naira(p.amount)}</td>
                        <td className="px-6 py-4 text-right"><Button size="sm" variant="ghost" iconLeft={<Receipt className="size-4" />} onClick={() => setReceipt(p)}>Receipt</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {rows.map((p) => {
                const I = methodIcon[p.method] ?? CreditCard;
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => setReceipt(p)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface-2/60">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-800"><I className="size-[18px]" aria-hidden /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{p.description}</p>
                        <p className="text-xs text-muted">{formatDate(p.createdAt)} · {methodLabel(p.method)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('font-semibold tabular-nums', p.status === 'refunded_demo' ? 'text-muted line-through' : 'text-ink-900')}>{naira(p.amount)}</p>
                        <StatusBadge status={p.status} className="mt-1" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Panel>

      {/* Receipt modal */}
      <Modal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        title="Receipt"
        description={receipt ? `${receipt.reference} · demo` : undefined}
        footer={receipt && <><Button variant="ghost" onClick={() => setReceipt(null)}>Close</Button><Button iconLeft={<Printer className="size-4" />} onClick={() => printReceipt(receipt)}>Print receipt</Button></>}
      >
        {receipt && (
          <div>
            <div className="rounded-2xl bg-ink-radial p-5 text-center text-white">
              <p className="text-xs font-bold tracking-[0.14em] text-white/55 uppercase">{receipt.status === 'refunded_demo' ? 'Refunded' : 'Amount paid'}</p>
              <p className="mt-1 font-display text-4xl font-extrabold">{naira(receipt.amount)}</p>
              <p className="mt-1 text-sm text-white/65">{formatDateTime(receipt.createdAt)}</p>
            </div>
            <dl className="mt-4 divide-y divide-line text-sm">
              {[
                ['Description', receipt.description],
                ['Method', methodLabel(receipt.method)],
                ['Status', <StatusBadge key="s" status={receipt.status} />],
                ['Payment ref', <span key="r" className="flex items-center gap-1 font-mono">{receipt.reference}<CopyButton value={receipt.reference} label="Copy" /></span>],
                ['Booking ref', linkFor(receipt.bookingReference) ? <Link key="b" to={linkFor(receipt.bookingReference)!} onClick={() => setReceipt(null)} className="font-mono text-brand-700 hover:underline">{receipt.bookingReference}</Link> : receipt.bookingReference],
              ].map(([k, v], i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3"><dt className="text-text-2">{k}</dt><dd className="text-right font-semibold text-ink-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">Simulated transaction for demonstration. No real money was charged.</p>
          </div>
        )}
      </Modal>

      <Modal open={addCard} onClose={() => setAddCard(false)} title="Add a payment method" size="sm" footer={<Button onClick={() => setAddCard(false)}>Got it</Button>}>
        <div className="space-y-4 text-[15px] text-text-2">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Lock className="size-6" aria-hidden /></span>
          <p>Adding cards is <strong className="text-ink-900">disabled in this demo</strong>. In production, cards are tokenised by a PCI-compliant gateway (e.g. Paystack or Flutterwave) — DoorstepGo never sees or stores full card numbers.</p>
          <p className="text-sm">You can still choose card, transfer, USSD, mobile money or cash at checkout — payments there are simulated.</p>
        </div>
      </Modal>
    </div>
  );
}
