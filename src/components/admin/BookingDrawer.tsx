import { useEffect, useState } from 'react';
import { Check, CircleAlert, Copy, MessageCircle, Phone, Repeat, UserPlus, X } from 'lucide-react';
import type { BookingStatus, RideBooking } from '@/types';
import { Avatar, Button, Drawer, ExternalButton, StatusBadge, Stars } from '@/components/ui';
import { bookingService, notificationService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { findTier } from '@/data/services';
import { demoUser } from '@/data/seed';
import { cityName, junctionLabel } from '@/config/locations';
import { cn, formatDate, formatDateTime, formatTime, naira, titleCase } from '@/utils';
import { DrawerSection, Kv, MiniSelect } from './kit';
import { customerWhatsapp, fleet, kindLabel, needsApproval, telHref } from './data';

export const BOOKING_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'driver_assigned', label: 'Driver assigned' },
  { value: 'driver_arriving', label: 'Driver arriving' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Admin-side booking mutations — all go through bookingService. */
export const bookingOps = {
  setStatus(b: RideBooking, status: BookingStatus) {
    if (status === 'cancelled') {
      bookingService.update(b.id, { status: 'cancelled', paymentStatus: b.paymentStatus === 'paid_demo' ? 'refunded_demo' : b.paymentStatus });
      void notificationService.send({ type: 'booking_cancelled', title: 'Booking cancelled by operations', body: `${b.reference} was cancelled by our team${b.paymentStatus === 'paid_demo' ? '. A simulated refund has been issued.' : '.'}`, channels: ['in_app'], reference: b.reference });
      return;
    }
    if (status === 'confirmed') {
      bookingService.update(b.id, { status });
      return;
    }
    bookingService.setStatus(b.id, status);
  },
  assign(b: RideBooking, driverId: string) {
    const driver = fleet.find((d) => d.id === driverId);
    if (!driver) return;
    bookingService.update(b.id, { driver });
    if (['pending', 'confirmed', 'modification_requested'].includes(b.status)) bookingService.setStatus(b.id, 'driver_assigned');
    void notificationService.send({ type: 'driver_assigned', title: 'Driver assigned', body: `${driver.name} (${driver.rating}★, ${driver.plate}) will handle ${b.reference}.`, channels: ['in_app'], reference: b.reference, link: `/dashboard/bookings/${b.id}` });
  },
  resolveRequest(b: RideBooking, approve: boolean) {
    const next: BookingStatus = b.driver ? 'driver_assigned' : 'confirmed';
    if (b.status === 'cancellation_requested' && approve) return bookingOps.setStatus(b, 'cancelled');
    bookingService.update(b.id, {
      status: next,
      instructions: approve ? b.instructions : `${b.instructions ?? ''}\n[Ops: change request declined]`.trim(),
    });
    const kind = b.status === 'cancellation_requested' ? 'cancellation' : 'change';
    void notificationService.send({ type: 'system', title: `Your ${kind} request was ${approve ? 'approved' : 'declined'}`, body: `${b.reference}: our operations team ${approve ? 'approved' : 'declined'} your ${kind} request.`, channels: ['in_app'], reference: b.reference });
  },
};

export function BookingDrawer({ booking, onClose }: { booking: RideBooking | null; onClose: () => void }) {
  const toast = useToast();
  const [driverId, setDriverId] = useState('');
  const [status, setStatus] = useState<BookingStatus>('pending');
  useEffect(() => {
    if (booking) {
      setDriverId(booking.driver?.id ?? '');
      setStatus(booking.status);
    }
  }, [booking]);
  const b = booking;
  const tier = b ? findTier(b.tierId) : undefined;

  return (
    <Drawer open={!!b} onClose={onClose} title={b ? <span className="font-mono text-base">{b.reference}</span> : 'Booking'}>
      {b && (
        <div className="text-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
            <StatusBadge status={b.status} />
            <StatusBadge status={b.paymentStatus} />
            <span className="text-xs text-muted">{kindLabel[b.kind]} · {tier?.name ?? b.tierId}</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(b.reference);
                toast({ title: 'Reference copied', body: b.reference, tone: 'info' });
              }}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              <Copy className="size-3.5" aria-hidden /> Copy ref
            </button>
          </div>

          {needsApproval(b) && (
            <div className="m-5 rounded-xl border border-warn/30 bg-warn-bg p-4">
              <p className="flex items-center gap-2 font-semibold text-warn"><CircleAlert className="size-4" aria-hidden />{b.status === 'cancellation_requested' ? 'Cancellation requested' : 'Modification requested'}</p>
              <p className="mt-1 text-xs text-text-2">The customer asked to {b.status === 'cancellation_requested' ? 'cancel this booking' : `change it to ${formatDate(b.date)} at ${formatTime(b.time)} for ${b.passengers} passenger(s)`}.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="brand" iconLeft={<Check className="size-4" />} onClick={() => { bookingOps.resolveRequest(b, true); toast({ title: 'Request approved', body: `${b.reference} updated and customer notified (in-app).` }); }}>Approve</Button>
                <Button size="sm" variant="outline" iconLeft={<X className="size-4" />} onClick={() => { bookingOps.resolveRequest(b, false); toast({ title: 'Request declined', body: `${b.reference}: customer notified (in-app).`, tone: 'info' }); }}>Decline</Button>
              </div>
            </div>
          )}

          <DrawerSection title="Trip">
            <ol className="relative space-y-3 pl-6">
              <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px border-l-2 border-dashed border-line-strong" />
              <li className="relative">
                <span aria-hidden className="absolute top-1 -left-6 size-3.5 rounded-full border-[3px] border-brand-500 bg-white" />
                <p className="font-semibold text-ink-900">{junctionLabel(b.pickup.cityId, b.pickup.junctionId)}</p>
                <p className="text-xs text-muted">{b.pickup.address}</p>
              </li>
              {b.stops?.map((s, i) => (
                <li key={i} className="relative">
                  <span aria-hidden className="absolute top-1 -left-6 size-3.5 rounded-full border-[3px] border-line-strong bg-white" />
                  <p className="font-medium text-ink-900">Stop {i + 1}: {junctionLabel(s.cityId, s.junctionId)}</p>
                  <p className="text-xs text-muted">{s.address}</p>
                </li>
              ))}
              <li className="relative">
                <span aria-hidden className="absolute top-1 -left-6 size-3.5 rounded-[4px] border-[3px] border-go-500 bg-white" />
                <p className="font-semibold text-ink-900">{junctionLabel(b.dropoff.cityId, b.dropoff.junctionId)}</p>
                <p className="text-xs text-muted">{b.dropoff.address}</p>
              </li>
            </ol>
            <dl className="mt-3 divide-y divide-line">
              <Kv label="City">{cityName(b.pickup.cityId)}</Kv>
              <Kv label="Scheduled">{formatDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(b.time)}</Kv>
              <Kv label="Trip type">{titleCase(b.tripType)}{b.returnDate ? ` · return ${formatDate(b.returnDate, { day: 'numeric', month: 'short' })} ${formatTime(b.returnTime)}` : ''}</Kv>
              <Kv label="Passengers">{b.passengers}{b.vehicles ? ` · ${b.vehicles} vehicle(s)` : ''}</Kv>
              {b.shuttleType && <Kv label="Shuttle type">{b.shuttleType}</Kv>}
              {b.recurring && <Kv label="Recurring"><span className="inline-flex items-center gap-1"><Repeat className="size-3.5" aria-hidden />{titleCase(b.recurring.frequency)}{b.recurring.until ? ` until ${formatDate(b.recurring.until, { day: 'numeric', month: 'short' })}` : ''}</span></Kv>}
              <Kv label="Created">{formatDateTime(b.createdAt)}</Kv>
            </dl>
            {b.instructions && <p className="mt-2 rounded-xl bg-surface-2 p-3 text-xs whitespace-pre-line text-text-2">{b.instructions}</p>}
          </DrawerSection>

          <DrawerSection title="Dispatch">
            {b.driver ? (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-line p-3">
                <Avatar src={b.driver.avatar} name={b.driver.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{b.driver.name}</p>
                  <p className="truncate text-xs text-muted">{b.driver.vehicle} · {b.driver.plate}</p>
                  <Stars value={b.driver.rating} />
                </div>
                <a href={telHref(b.driver.phone)} aria-label={`Call ${b.driver.name}`} className="grid size-9 place-items-center rounded-lg border border-line text-text-2 hover:text-brand-700"><Phone className="size-4" /></a>
              </div>
            ) : (
              <p className="mb-3 rounded-xl border border-dashed border-warn/40 bg-warn-bg/50 p-3 text-xs font-medium text-warn">No driver assigned yet.</p>
            )}
            <div className="flex items-end gap-2">
              <MiniSelect className="flex-1" label="Assign driver" srLabel={false} value={driverId} onChange={(e) => setDriverId(e.target.value)} options={[{ value: '', label: 'Select a driver…' }, ...fleet.map((d) => ({ value: d.id, label: `${d.name} · ${d.rating}★ · ${d.plate}` }))]} />
              <Button size="sm" variant="brand" className="h-10" disabled={!driverId || driverId === b.driver?.id || b.status === 'cancelled' || b.status === 'completed'} iconLeft={<UserPlus className="size-4" />} onClick={() => { bookingOps.assign(b, driverId); toast({ title: 'Driver assigned', body: `${fleet.find((d) => d.id === driverId)?.name} → ${b.reference} (demo dispatch).` }); }}>Assign</Button>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <MiniSelect className="flex-1" label="Change status" srLabel={false} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} options={BOOKING_STATUS_OPTIONS} />
              <Button size="sm" variant="outline" className="h-10" disabled={status === b.status} onClick={() => { bookingOps.setStatus(b, status); toast({ title: 'Status updated', body: `${b.reference} → ${BOOKING_STATUS_OPTIONS.find((o) => o.value === status)?.label}` }); }}>Apply</Button>
            </div>
          </DrawerSection>

          <DrawerSection title="Fare estimate">
            <dl className="divide-y divide-line">
              {b.fare.lines.map((l) => <Kv key={l.label} label={l.label}>{naira(l.amount)}</Kv>)}
              {b.fare.serviceCharge > 0 && <Kv label="Service charge">{naira(b.fare.serviceCharge)}</Kv>}
              {b.fare.discount > 0 && <Kv label="Discount">−{naira(b.fare.discount)}</Kv>}
              <div className="flex items-center justify-between pt-2.5"><dt className="font-semibold text-ink-900">Total (estimate)</dt><dd className="font-display text-lg font-bold text-ink-900">{naira(b.fare.total)}</dd></div>
            </dl>
            <p className="mt-1 text-[11px] text-muted">{b.fare.distanceKm.toFixed(1)} km · ~{Math.round(b.fare.durationMin)} min · payments are simulated</p>
          </DrawerSection>

          <DrawerSection title="Customer">
            <div className="flex items-center gap-3">
              <Avatar src={demoUser.avatar} name={demoUser.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{demoUser.name}</p>
                <p className="text-xs text-muted">{demoUser.phone} · demo account</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <ExternalButton href={telHref(demoUser.phone)} size="sm" variant="outline" iconLeft={<Phone className="size-4" />}>Call</ExternalButton>
              <ExternalButton href={customerWhatsapp(demoUser.phone, `Hello ${demoUser.name.split(' ')[0]}, this is DoorstepGo operations about booking ${b.reference}.`)} target="_blank" rel="noreferrer" size="sm" variant="outline" iconLeft={<MessageCircle className="size-4" />}>WhatsApp</ExternalButton>
            </div>
          </DrawerSection>

          <DrawerSection title="Timeline">
            <ol className="space-y-2">
              {b.timeline.map((t) => (
                <li key={t.key} className="flex items-center gap-2.5">
                  <span className={cn('grid size-5 place-items-center rounded-full', t.done ? 'bg-ok text-white' : 'bg-surface-2 ring-1 ring-line-strong')}>{t.done && <Check className="size-3" strokeWidth={3} aria-hidden />}</span>
                  <span className={cn('flex-1', t.done ? 'font-medium text-ink-900' : 'text-muted')}>{t.label}</span>
                  <span className="text-xs text-muted tabular-nums">{t.at ? formatDateTime(t.at) : '—'}</span>
                </li>
              ))}
            </ol>
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
}
