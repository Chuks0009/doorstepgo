import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowUpRight, Camera, CircleCheck, CircleX, CreditCard, Eye, EyeOff, Info, KeyRound, Lock, Megaphone, Package, PackageSearch, PenLine, Phone, Printer, Radar,
  Repeat, ShieldCheck, ShoppingBasket, Timer, UserRound,
} from 'lucide-react';
import { Badge, Button, ButtonLink, EmptyState, StatusBadge, Textarea, Modal } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { ActiveTripCard } from '@/components/dashboard/ActiveTripCard';
import { CopyButton, Panel, PersonCard, ReportProblemModal, RouteStack, TimelineList, categoryName, deliveryBucket, printDocument, redeliverHref } from '@/components/dashboard/shared';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks';
import { useDeliveries, usePayments } from '@/hooks/useData';
import { deliveryService, notificationService } from '@/services/api';
import { junctionLabel } from '@/config/locations';
import { pricing, sizeOptions } from '@/config/pricing';
import type { Contact, DeliveryBooking } from '@/types';
import { cn, formatDate, formatDateTime, formatTime, naira, titleCase } from '@/utils';

const marketTaskLabel = { already_purchased: 'Collect goods already paid for', collect_from_seller: 'Collect from seller', purchase_items: 'Buy listed items for me', assist_collection: 'Assist with collection' };

function ContactCard({ role, contact, icon }: { role: string; contact: Contact; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-2/60 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-ink-800 shadow-soft [&>svg]:size-[18px]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{role}</p>
        <p className="truncate font-semibold text-ink-900">{contact.name}</p>
        <p className="text-[13px] text-text-2">{contact.phone}</p>
      </div>
      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="grid size-11 place-items-center rounded-xl text-brand-700 transition hover:bg-brand-50" aria-label={`Call ${contact.name}`}><Phone className="size-[18px]" /></a>
    </div>
  );
}

export default function DeliveryDetailPage() {
  const { id = '' } = useParams();
  const deliveries = useDeliveries();
  const payments = usePayments();
  const delivery = deliveries.find((d) => d.id === id || d.reference.toLowerCase() === id.toLowerCase());
  usePageMeta(delivery ? `Delivery ${delivery.reference}` : 'Delivery not found');
  const toast = useToast();
  const [showCode, setShowCode] = useState(false);
  const [modal, setModal] = useState<'report' | 'cancel' | null>(null);

  if (!delivery)
    return (
      <div>
        <DashPageHeader back={{ to: '/dashboard/deliveries', label: 'My deliveries' }} title="Delivery not found" />
        <EmptyState icon="Package" title="We couldn't find that delivery" body={`No delivery matches “${id}” on this device. It may have been removed when demo data was reset.`} action={<ButtonLink to="/dashboard/deliveries" size="sm">Back to my deliveries</ButtonLink>} />
      </div>
    );

  const d = delivery;
  const bucket = deliveryBucket(d);
  const paid = d.paymentStatus === 'paid_demo';
  const payment = payments.find((p) => p.bookingReference === d.reference);
  const size = sizeOptions.find((s) => s.id === d.packageSize);
  const canCancel = bucket === 'upcoming' && d.status !== 'cancellation_requested';

  const printReceipt = () => {
    const ok = printDocument(d.reference, [
      ['Service', categoryName(d.categoryId)],
      ['Package', d.packageDescription],
      ['From', `${junctionLabel(d.pickup.cityId, d.pickup.junctionId)} — ${d.pickup.address}`],
      ['To', `${d.recipient.name}, ${junctionLabel(d.dropoff.cityId, d.dropoff.junctionId)} — ${d.dropoff.address}`],
      ['Date', `${formatDate(d.date)} at ${formatTime(d.time)}`],
      ...d.fare.lines.map((l) => [l.label, naira(l.amount)] as [string, string]),
      ['Service & booking charges', naira(d.fare.serviceCharge)],
      ...(d.fare.discount ? [['Promo discount', `−${naira(d.fare.discount)}`] as [string, string]] : []),
      ['Payment status', titleCase(d.paymentStatus.replace('_demo', ' (demo)'))],
      ...(payment ? [['Payment reference', payment.reference] as [string, string]] : []),
      ...(d.proof ? [['Proof of delivery', `${titleCase(d.proof.method)} · ${formatDateTime(d.proof.at)}`] as [string, string]] : []),
    ], { heading: paid ? 'Delivery receipt' : 'Delivery summary', total: naira(d.fare.total) });
    if (!ok) toast({ title: 'Pop-up blocked', body: 'Allow pop-ups for this site to print your receipt.', tone: 'error' });
  };

  return (
    <div>
      <DashPageHeader
        back={{ to: '/dashboard/deliveries', label: 'My deliveries' }}
        eyebrow={<>{categoryName(d.categoryId)}</>}
        title={<span className="flex flex-wrap items-center gap-3">{d.packageDescription} <StatusBadge status={d.status === 'cancelled' || d.status === 'cancellation_requested' ? d.status : d.stage} className="text-sm" /></span>}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-mono font-semibold text-ink-900">{d.reference}</span>
            <CopyButton value={d.reference} label="Copy reference" />
            <span className="text-muted">· Booked {formatDateTime(d.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" iconLeft={<Printer className="size-4" />} onClick={printReceipt}>{paid ? 'Print receipt' : 'Print summary'}</Button>
            <ButtonLink to={redeliverHref(d)} variant="soft" iconLeft={<Repeat className="size-4" />}>Send again</ButtonLink>
            {(bucket === 'active' || bucket === 'upcoming') && <ButtonLink to={`/track-delivery?ref=${d.reference}`} iconLeft={<Radar className="size-4" />}>Track</ButtonLink>}
          </>
        }
      />

      {bucket === 'active' && <div className="mb-6"><ActiveTripCard delivery={d} /></div>}
      {d.status === 'cancelled' && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-crit-bg p-4 text-crit">
          <CircleX className="size-5 shrink-0" aria-hidden />
          <div><p className="font-semibold">This delivery was cancelled</p><p className="text-sm text-text-2">{d.paymentStatus === 'refunded_demo' ? 'A simulated refund was issued.' : 'No payment was taken.'}</p></div>
        </div>
      )}
      {d.status === 'cancellation_requested' && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-warn-bg p-4 text-warn">
          <Info className="size-5 shrink-0" aria-hidden />
          <div><p className="font-semibold">Cancellation under review</p><p className="text-sm text-text-2">We'll confirm shortly and refund any simulated payment.</p></div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Delivery code + proof */}
          {d.status !== 'cancelled' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl bg-ink-radial p-6 text-white">
                <div aria-hidden className="absolute -top-16 -right-10 size-48 rounded-full bg-go-500/25 blur-[70px]" />
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-white/55 uppercase"><KeyRound className="size-4 text-go-400" aria-hidden /> Delivery code</p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="font-mono text-4xl font-extrabold tracking-[0.3em]" aria-live="polite">{showCode ? d.deliveryCode : '••••'}</p>
                  <button type="button" onClick={() => setShowCode((s) => !s)} className="grid size-11 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20" aria-label={showCode ? 'Hide delivery code' : 'Reveal delivery code'} aria-pressed={showCode}>
                    {showCode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                  {showCode && <CopyButton value={d.deliveryCode} dark />}
                </div>
                <p className="mt-3 text-[13px] text-white/60">Share only with {d.recipient.name}. The rider asks for this code at hand-over.</p>
              </div>
              <div className={cn('rounded-3xl border p-6', d.proof ? 'border-emerald-200 bg-ok-bg' : 'border-line bg-white')}>
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-muted uppercase"><ShieldCheck className="size-4 text-ok" aria-hidden /> Proof of delivery</p>
                {d.proof ? (
                  <>
                    <p className="mt-3 flex items-center gap-2 font-display text-xl font-bold text-ink-900">
                      {d.proof.method === 'photo' ? <Camera className="size-5 text-ok" aria-hidden /> : d.proof.method === 'signature' ? <PenLine className="size-5 text-ok" aria-hidden /> : <KeyRound className="size-5 text-ok" aria-hidden />}
                      Confirmed by {d.proof.method}
                    </p>
                    <p className="mt-1 text-sm text-text-2">{d.proof.receivedBy ? `Received by ${d.proof.receivedBy} · ` : ''}{formatDateTime(d.proof.at)}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 font-display text-lg font-bold text-ink-900">Awaiting hand-over</p>
                    <p className="mt-1 text-sm text-text-2">Once delivered, we record the code, photo or signature here.</p>
                  </>
                )}
              </div>
            </div>
          )}

          <Panel title="Route & contacts" icon={<Package />}>
            <div className="grid gap-6 lg:grid-cols-2">
              <RouteStack from={d.pickup} to={d.dropoff} stops={d.extraDropoffs} />
              <div className="space-y-3">
                <ContactCard role="Sender" contact={d.sender} icon={<UserRound />} />
                <ContactCard role="Recipient" contact={d.recipient} icon={<UserRound />} />
              </div>
            </div>
          </Panel>

          <Panel title="Package details" icon={<PackageSearch />}>
            <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                ['Category', d.packageCategory],
                ['Size', size ? `${size.label} (≤${size.maxKg} kg)` : titleCase(d.packageSize)],
                ['Weight', `${d.weightKg} kg`],
                ['Packages', String(d.packages)],
                ['Urgency', pricing.delivery.urgency[d.urgency].label],
                ['Pickup', d.pickupMode === 'immediate' ? 'Immediate' : `${formatDate(d.date, { day: 'numeric', month: 'short' })} · ${formatTime(d.time)}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2/60 px-4 py-3"><dt className="text-xs font-semibold tracking-wide text-muted uppercase">{k}</dt><dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd></div>
              ))}
            </dl>
            {d.handling.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {d.handling.map((h) => <Badge key={h} tone="brand">{pricing.delivery.handling[h]?.label ?? titleCase(h)}</Badge>)}
              </div>
            )}
            {d.instructions && <p className="mt-4 rounded-xl bg-brand-50/60 p-3 text-sm text-text-2"><span className="font-semibold text-ink-900">Instructions:</span> {d.instructions}</p>}
          </Panel>

          {d.market && (
            <Panel title="Market pickup" icon={<ShoppingBasket />} subtitle={marketTaskLabel[d.market.task]}>
              <dl className="grid gap-2.5 sm:grid-cols-2">
                {[
                  ['Market', d.market.marketName],
                  ['Seller', d.market.sellerName],
                  ['Seller phone', d.market.sellerPhone],
                  ['Stall', d.market.stallLocation],
                  ['Items', d.market.itemsList],
                  ['Budget', d.market.budget ? naira(d.market.budget) : undefined],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-amber-50/70 px-4 py-3"><dt className="text-xs font-semibold tracking-wide text-amber-800/70 uppercase">{k}</dt><dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd></div>
                ))}
              </dl>
            </Panel>
          )}

          {bucket !== 'active' && (
            <Panel title="Your rider" icon={<UserRound />}>
              <PersonCard person={d.rider} role="Rider" />
            </Panel>
          )}

          <Panel title="Delivery timeline" icon={<Timer />}>
            <TimelineList events={d.timeline} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <FareBreakdown fare={d.fare} title={paid ? 'Fee paid' : 'Delivery fee'} confirmed={paid} />
          <Panel title="Payment" icon={<CreditCard />}>
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={d.paymentStatus} />
              <span className="font-display text-xl font-extrabold text-ink-900">{naira(d.fare.total)}</span>
            </div>
            {payment && <p className="mt-3 text-[13px] text-text-2">Ref <span className="font-mono font-semibold">{payment.reference}</span> · {formatDateTime(payment.createdAt)}</p>}
            {d.paymentStatus === 'unpaid' && d.status !== 'cancelled' && (
              <ButtonLink to={`/checkout/${d.reference}`} block className="mt-4" iconRight={<ArrowUpRight className="size-4" />}>Pay {naira(d.fare.total)} now</ButtonLink>
            )}
          </Panel>
          <Panel title="Something wrong?" icon={<Megaphone />}>
            <div className="space-y-2">
              <Button variant="outline" block onClick={() => setModal('report')} iconLeft={<PackageSearch className="size-4" />}>Report missing or delayed</Button>
              <Button variant="ghost" block disabled={!canCancel} onClick={() => setModal('cancel')} iconLeft={<CircleX className="size-4" />}>Request cancellation</Button>
              {!canCancel && d.status !== 'cancelled' && (
                <p className="flex items-start gap-1.5 text-[13px] text-muted"><Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {d.status === 'cancellation_requested' ? 'Cancellation already requested.' : bucket === 'completed' ? 'This delivery is complete.' : 'A rider is already on this delivery — contact support to stop it.'}</p>
              )}
            </div>
          </Panel>
        </aside>
      </div>

      <ReportProblemModal open={modal === 'report'} onClose={() => setModal(null)} reference={d.reference} kind="delivery" />
      <CancelDeliveryModal delivery={d} open={modal === 'cancel'} onClose={() => setModal(null)} />
    </div>
  );
}

function CancelDeliveryModal({ delivery, open, onClose }: { delivery: DeliveryBooking; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    // Demo: mark as requested and notify; ops confirms from the admin console.
    deliveryService.update(delivery.id, { status: 'cancellation_requested', instructions: `${delivery.instructions ?? ''}\n[Cancellation requested: ${reason.trim() || 'No reason given'}]`.trim() });
    await notificationService.send({ type: 'booking_cancelled', title: 'Cancellation requested', body: `We received your request to cancel ${delivery.reference}. We'll confirm shortly.`, channels: ['in_app', 'email'], reference: delivery.reference, link: `/dashboard/deliveries/${delivery.id}` });
    setBusy(false);
    toast({ title: 'Cancellation requested', body: `${delivery.reference} will be reviewed shortly.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Cancel this delivery?" description={delivery.reference} footer={<><Button variant="ghost" onClick={onClose}>Keep delivery</Button><Button variant="danger" onClick={submit} loading={busy}>Request cancellation</Button></>}>
      <div className="space-y-4">
        <p className="flex gap-2 rounded-2xl bg-ok-bg p-4 text-sm text-ok"><CircleCheck className="size-5 shrink-0" aria-hidden /> No rider has been assigned yet, so cancellation is free{delivery.paymentStatus === 'paid_demo' ? ' and your simulated payment will be refunded' : ''}.</p>
        <Textarea label="Reason" optional value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Help us improve — why are you cancelling?" />
      </div>
    </Modal>
  );
}
