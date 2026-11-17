import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowUpRight, CalendarClock, CircleAlert, CircleCheck, CircleX, CreditCard, Info, Lock, Megaphone, PencilLine, Printer, Radar, Repeat, Users,
} from 'lucide-react';
import { Badge, Button, ButtonLink, EmptyState, Input, Modal, StatusBadge, Stepper, Textarea } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { ActiveTripCard } from '@/components/dashboard/ActiveTripCard';
import { CopyButton, KindIcon, Panel, PersonCard, ReportProblemModal, RouteStack, TimelineList, kindMeta, printDocument, rebookHref, rideBucket, tierName } from '@/components/dashboard/shared';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks';
import { useBookings, usePayments } from '@/hooks/useData';
import { bookingService } from '@/services/api';
import { pricing } from '@/config/pricing';
import { junctionLabel } from '@/config/locations';
import { findTier } from '@/data/services';
import type { RideBooking } from '@/types';
import { cn, formatDate, formatDateTime, formatTime, naira, titleCase, todayISO } from '@/utils';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-2/60 px-4 py-3">
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-900">{children}</dd>
    </div>
  );
}

function ActionRow({ icon, title, body, action, disabledReason }: { icon: ReactNode; title: string; body: string; action: ReactNode; disabledReason?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl [&>svg]:size-5', disabledReason ? 'bg-surface-2 text-muted' : 'bg-brand-50 text-brand-700')}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="text-[13px] text-text-2">{body}</p>
        {disabledReason && <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-warn"><Lock className="size-3.5 shrink-0" aria-hidden /> {disabledReason}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/** Why an action is unavailable, in plain language. */
const lockReason = (b: RideBooking, kind: 'modify' | 'cancel') => {
  if (b.status === 'cancelled') return 'This booking has been cancelled.';
  if (b.status === 'completed') return 'This trip is already completed.';
  if (b.status === 'modification_requested') return 'A change request is already being reviewed.';
  if (b.status === 'cancellation_requested') return 'A cancellation request is already being reviewed.';
  if (kind === 'modify' && b.status === 'driver_assigned') return 'A driver is already assigned — contact support to change this trip.';
  return 'Your driver is already on the way. Contact support for urgent changes.';
};

export default function BookingDetailPage() {
  const { id = '' } = useParams();
  const bookings = useBookings();
  const payments = usePayments();
  const booking = bookings.find((b) => b.id === id || b.reference.toLowerCase() === id.toLowerCase());
  usePageMeta(booking ? `Booking ${booking.reference}` : 'Booking not found');
  const toast = useToast();
  const [modal, setModal] = useState<'modify' | 'cancel' | 'report' | null>(null);

  if (!booking)
    return (
      <div>
        <DashPageHeader back={{ to: '/dashboard/bookings', label: 'My bookings' }} title="Booking not found" />
        <EmptyState icon="Inbox" title="We couldn't find that booking" body={`No booking matches “${id}” on this device. It may have been removed when demo data was reset.`} action={<ButtonLink to="/dashboard/bookings" size="sm">Back to my bookings</ButtonLink>} />
      </div>
    );

  const b = booking;
  const bucket = rideBucket(b.status);
  const canModify = bookingService.canModify(b);
  const canCancel = bookingService.canCancel(b);
  const tier = findTier(b.tierId);
  const paid = b.paymentStatus === 'paid_demo';
  const payment = payments.find((p) => p.bookingReference === b.reference);
  const trackable = bucket === 'active' || bucket === 'upcoming';

  const printReceipt = () => {
    const ok = printDocument(b.reference, [
      ['Service', tierName(b.tierId)],
      ['Pickup', `${junctionLabel(b.pickup.cityId, b.pickup.junctionId)} — ${b.pickup.address}`],
      ['Drop-off', `${junctionLabel(b.dropoff.cityId, b.dropoff.junctionId)} — ${b.dropoff.address}`],
      ['Date & time', `${formatDate(b.date)} at ${formatTime(b.time)}`],
      ['Passengers', String(b.passengers)],
      ...b.fare.lines.map((l) => [l.label, naira(l.amount)] as [string, string]),
      ['Service & booking charges', naira(b.fare.serviceCharge)],
      ...(b.fare.discount ? [['Promo discount', `−${naira(b.fare.discount)}`] as [string, string]] : []),
      ['Payment status', titleCase(b.paymentStatus.replace('_demo', ' (demo)'))],
      ...(payment ? [['Payment reference', payment.reference] as [string, string]] : []),
    ], { heading: paid ? 'Trip receipt' : 'Booking summary', total: naira(b.fare.total) });
    if (!ok) toast({ title: 'Pop-up blocked', body: 'Allow pop-ups for this site to print your receipt.', tone: 'error' });
  };

  const banner = (() => {
    if (b.status === 'modification_requested') return { tone: 'warn', icon: <PencilLine className="size-5" />, title: 'Change request received', body: 'Our team is reviewing your requested changes. You will get a notification once they are confirmed (demo).' };
    if (b.status === 'cancellation_requested') return { tone: 'warn', icon: <CircleAlert className="size-5" />, title: 'Cancellation under review', body: 'We will confirm shortly and issue any refund due (demo).' };
    if (b.status === 'cancelled') return { tone: 'crit', icon: <CircleX className="size-5" />, title: 'This booking was cancelled', body: b.paymentStatus === 'refunded_demo' ? 'A simulated refund was issued to your original payment method.' : 'No payment was taken for this booking.' };
    if (b.status === 'completed') return { tone: 'ok', icon: <CircleCheck className="size-5" />, title: 'Trip completed', body: `Thanks for riding with ${b.driver?.name.split(' ')[0] ?? 'us'}. Your receipt is ready to print.` };
    return null;
  })();

  return (
    <div>
      <DashPageHeader
        back={{ to: '/dashboard/bookings', label: 'My bookings' }}
        eyebrow={<>{kindMeta[b.kind].label} booking</>}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {tierName(b.tierId)} <StatusBadge status={b.status} className="text-sm" />
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-mono font-semibold text-ink-900">{b.reference}</span>
            <CopyButton value={b.reference} label="Copy reference" />
            <span className="text-muted">· Booked {formatDateTime(b.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" iconLeft={<Printer className="size-4" />} onClick={printReceipt}>{paid ? 'Print receipt' : 'Print summary'}</Button>
            <ButtonLink to={rebookHref(b)} variant="soft" iconLeft={<Repeat className="size-4" />}>Rebook</ButtonLink>
            {trackable && <ButtonLink to={`/track-booking?ref=${b.reference}`} iconLeft={<Radar className="size-4" />}>Track</ButtonLink>}
          </>
        }
      />

      {bucket === 'active' && <div className="mb-6"><ActiveTripCard ride={b} /></div>}

      {banner && (
        <div role="status" className={cn('mb-6 flex items-start gap-3 rounded-2xl border p-4', banner.tone === 'ok' && 'border-emerald-200 bg-ok-bg text-ok', banner.tone === 'warn' && 'border-amber-200 bg-warn-bg text-warn', banner.tone === 'crit' && 'border-red-200 bg-crit-bg text-crit')}>
          {banner.icon}
          <div>
            <p className="font-semibold">{banner.title}</p>
            <p className="text-sm text-text-2">{banner.body}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Trip details" icon={<KindIcon kind={b.kind} size="sm" className="ring-0" />}>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <RouteStack from={b.pickup} to={b.dropoff} stops={b.stops} />
              <dl className="grid grid-cols-2 gap-2.5 self-start">
                <Detail label="Date">{formatDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })}</Detail>
                <Detail label="Pickup time">{formatTime(b.time)}</Detail>
                <Detail label="Passengers">{b.passengers}{tier ? ` / ${tier.capacity}` : ''}</Detail>
                <Detail label="Trip type">{b.tripType === 'return' ? 'Return' : 'One-way'}</Detail>
                {b.returnDate && <Detail label="Return">{formatDate(b.returnDate, { day: 'numeric', month: 'short' })} · {formatTime(b.returnTime)}</Detail>}
                {b.vehicles && <Detail label="Vehicles">{b.vehicles}</Detail>}
                {b.recurring && <Detail label="Repeats">{titleCase(b.recurring.frequency)}{b.recurring.until ? ` until ${formatDate(b.recurring.until, { day: 'numeric', month: 'short' })}` : ''}</Detail>}
                <Detail label="Distance">~{b.fare.distanceKm} km · {b.fare.durationMin} min</Detail>
              </dl>
            </div>
            {(b.shuttleType || b.instructions) && (
              <div className="mt-5 space-y-2 rounded-2xl bg-brand-50/60 p-4 text-sm">
                {b.shuttleType && <p><span className="font-semibold text-ink-900">Shuttle type:</span> <span className="text-text-2">{b.shuttleType}</span></p>}
                {b.instructions && <p className="whitespace-pre-line"><span className="font-semibold text-ink-900">Notes for driver:</span> <span className="text-text-2">{b.instructions}</span></p>}
              </div>
            )}
          </Panel>

          {bucket !== 'active' && (
            <Panel title="Your driver" icon={<Users />}>
              <PersonCard person={b.driver} role="Driver" />
            </Panel>
          )}

          <Panel title="Booking timeline" icon={<CalendarClock />}>
            <TimelineList events={b.timeline} />
          </Panel>

          <Panel title="Manage booking" subtitle="Changes and cancellations are reviewed by our team (demo).">
            <div className="space-y-3">
              <ActionRow
                icon={<PencilLine />}
                title="Request a modification"
                body="Change the date, time or number of passengers."
                disabledReason={canModify ? undefined : lockReason(b, 'modify')}
                action={<Button variant="outline" size="sm" disabled={!canModify} onClick={() => setModal('modify')}>Request change</Button>}
              />
              <ActionRow
                icon={<CircleX />}
                title="Request cancellation"
                body={`Free within ${pricing.cancellation.freeWindowMinutes} minutes of booking or before a driver is assigned.`}
                disabledReason={canCancel ? undefined : lockReason(b, 'cancel')}
                action={<Button variant="outline" size="sm" disabled={!canCancel} onClick={() => setModal('cancel')} className="hover:border-crit hover:text-crit">Cancel booking</Button>}
              />
              <ActionRow icon={<Megaphone />} title="Report a problem" body="Late driver, fare issue, conduct or safety concern." action={<Button variant="ghost" size="sm" onClick={() => setModal('report')}>Report</Button>} />
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <FareBreakdown fare={b.fare} title={paid ? 'Fare paid' : 'Fare'} confirmed={paid} />
          <Panel title="Payment" icon={<CreditCard />}>
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={b.paymentStatus} />
              <span className="font-display text-xl font-extrabold text-ink-900">{naira(b.fare.total)}</span>
            </div>
            {payment && <p className="mt-3 text-[13px] text-text-2">Ref <span className="font-mono font-semibold">{payment.reference}</span> · {formatDateTime(payment.createdAt)}</p>}
            {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && (
              <>
                <p className="mt-3 text-sm text-text-2">Pay now to lock in your trip. Payment is simulated — no real money is charged.</p>
                <ButtonLink to={`/checkout/${b.reference}`} block className="mt-4" iconRight={<ArrowUpRight className="size-4" />}>Pay {naira(b.fare.total)} now</ButtonLink>
              </>
            )}
            {b.paymentStatus === 'refunded_demo' && <p className="mt-3 text-sm text-text-2">Refunded to your original method (simulated).</p>}
          </Panel>
          <div className="flex gap-2 rounded-2xl border border-dashed border-line-strong p-4 text-[13px] text-text-2">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <p>Driver details, ETA and payments on this page are simulated for demonstration. No real driver is dispatched.</p>
          </div>
        </aside>
      </div>

      <ModifyModal booking={b} open={modal === 'modify'} onClose={() => setModal(null)} />
      <CancelModal booking={b} open={modal === 'cancel'} onClose={() => setModal(null)} />
      <ReportProblemModal open={modal === 'report'} onClose={() => setModal(null)} reference={b.reference} kind="ride" />
    </div>
  );
}

function ModifyModal({ booking, open, onClose }: { booking: RideBooking; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const tier = findTier(booking.tierId);
  const [date, setDate] = useState(booking.date < todayISO() ? todayISO() : booking.date);
  const [time, setTime] = useState(booking.time);
  const [passengers, setPassengers] = useState(booking.passengers);
  const [note, setNote] = useState('');
  const [err, setErr] = useState<{ date?: string; time?: string }>({});
  const [busy, setBusy] = useState(false);
  const unchanged = date === booking.date && time === booking.time && passengers === booking.passengers && !note.trim();

  const submit = async () => {
    const e = { date: !date ? 'Choose a date' : date < todayISO() ? 'Choose today or a future date' : undefined, time: time ? undefined : 'Choose a time' };
    setErr(e);
    if (e.date || e.time) return;
    setBusy(true);
    const res = await bookingService.requestModification(booking.id, { date, time, passengers, note: note.trim() || undefined });
    setBusy(false);
    if (!res.ok) return toast({ title: 'Could not request change', body: res.error, tone: 'error' });
    toast({ title: 'Change requested', body: `We'll confirm the update to ${booking.reference} shortly.` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Request a modification" description={`${tierName(booking.tierId)} · ${booking.reference}`} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={busy} disabled={unchanged}>Send request</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="New date" type="date" required min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} error={err.date} />
          <Input label="New pickup time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} error={err.time} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/60 p-4">
          <div>
            <p className="text-sm font-semibold text-ink-900">Passengers</p>
            <p className="text-[13px] text-muted">{tier ? tier.capacityLabel : 'Up to the vehicle capacity'}</p>
          </div>
          <Stepper label="passengers" value={passengers} onChange={setPassengers} min={1} max={Math.max(1, tier?.capacity ?? 1) * Math.max(1, booking.vehicles ?? 1)} />
        </div>
        <Textarea label="Note for our team" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please pick up from the side gate instead." maxLength={400} />
        <p className="flex gap-2 text-[13px] text-muted"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Your fare may be re-estimated if the time or passenger count changes. Changes are confirmed by our team.</p>
      </div>
    </Modal>
  );
}

const cancelReasons = ['My plans changed', 'I booked by mistake', 'Driver is taking too long', 'I found another ride', 'Fare is higher than expected', 'Other'];

function CancelModal({ booking, open, onClose }: { booking: RideBooking; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const minutes = (Date.now() - new Date(booking.createdAt).getTime()) / 60000;
  const free = booking.status !== 'driver_assigned' || minutes <= pricing.cancellation.freeWindowMinutes;
  const paid = booking.paymentStatus === 'paid_demo';

  const submit = async () => {
    const r = reason === 'Other' ? other.trim() : reason;
    if (!r) return setErr(reason === 'Other' ? 'Tell us briefly why you are cancelling' : 'Choose a reason');
    setErr('');
    setBusy(true);
    const res = await bookingService.requestCancellation(booking.id, r);
    setBusy(false);
    if (!res.ok) return toast({ title: 'Could not cancel', body: res.error, tone: 'error' });
    toast({ title: 'Booking cancelled', body: paid ? 'A simulated refund has been issued.' : `${booking.reference} has been cancelled.` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Cancel this booking?" description={`${tierName(booking.tierId)} on ${formatDate(booking.date)} at ${formatTime(booking.time)}`} footer={<><Button variant="ghost" onClick={onClose}>Keep booking</Button><Button variant="danger" onClick={submit} loading={busy}>Confirm cancellation</Button></>}>
      <div className="space-y-5">
        <div className={cn('flex gap-3 rounded-2xl p-4 text-sm', free ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn')}>
          {free ? <CircleCheck className="size-5 shrink-0" aria-hidden /> : <CircleAlert className="size-5 shrink-0" aria-hidden />}
          <div>
            <p className="font-semibold">{free ? 'Free cancellation' : `A ${naira(pricing.cancellation.lateFee)} late-cancellation fee may apply`}</p>
            <p className="text-text-2">
              {free
                ? `No driver is on the way yet${paid ? ', so your simulated payment will be refunded in full.' : '.'}`
                : `Your driver was assigned more than ${pricing.cancellation.freeWindowMinutes} minutes ago.`}
            </p>
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-text">Why are you cancelling? <span className="text-go-600" aria-hidden>*</span></legend>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
            {cancelReasons.map((r) => (
              <label key={r} className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition', reason === r ? 'border-go-400 bg-go-50 font-semibold text-ink-900' : 'border-line hover:border-brand-300')}>
                <input type="radio" name="cancel-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="size-4 accent-[var(--color-go-500)]" />
                {r}
              </label>
            ))}
          </div>
          {err && <p role="alert" className="mt-2 text-[13px] font-medium text-crit">{err}</p>}
        </fieldset>
        {reason === 'Other' && <Textarea label="Tell us more" required value={other} onChange={(e) => setOther(e.target.value)} maxLength={300} />}
        <Badge tone="neutral">Demo — no real charges or refunds</Badge>
      </div>
    </Modal>
  );
}
