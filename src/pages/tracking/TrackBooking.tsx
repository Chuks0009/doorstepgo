import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock, CircleAlert, Clock, Flag, Link2, Lock, MapPin, Pause, PencilLine, Phone, Play, Route, Search, Share2, ShieldCheck, Siren, SkipForward, Ticket, Users, XCircle, Zap,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, ButtonLink, DemoNotice, ExternalButton, Modal, StatusBadge, Toggle, WhatsappGlyph } from '@/components/ui';
import { RouteMap } from '@/components/tracking/RouteMap';
import { CopyChip, DriverCard, KeyValue, LiveAnnouncer, SectionCard, TrackIntro, TrackLookup, TrackNotFound, TrackingTimeline, useCopy } from '@/components/tracking/TrackingParts';
import { HelpPanel } from '@/components/support/HelpPanel';
import { useBookings } from '@/hooks/useData';
import { useInterval, usePageMeta } from '@/hooks';
import { bookingService } from '@/services/api';
import { findTier } from '@/data/services';
import { junctionLabel } from '@/config/locations';
import { site, whatsappLink } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTime, naira, titleCase } from '@/utils';
import type { BookingStatus, RideBooking } from '@/types';

const SAMPLES = [
  { ref: 'DSG-RD-7KQ4-2M9P', note: 'Driver arriving' },
  { ref: 'DSG-RD-H3TX-8WQ2', note: 'Scheduled' },
  { ref: 'DSG-RD-2NBV-6YHK', note: 'Completed' },
];

const ORDER: BookingStatus[] = ['pending', 'driver_assigned', 'driver_arriving', 'in_progress', 'completed'];
const STAGE_T = [-1, 0.1, 0.75, 1.5, 2];

const statusIndex = (s: BookingStatus) => {
  switch (s) {
    case 'driver_assigned': return 1;
    case 'driver_arriving': return 2;
    case 'in_progress': return 3;
    case 'completed': return 4;
    default: return 0;
  }
};

const kindLabel: Record<RideBooking['kind'], string> = { motorcycle: 'Motorcycle', tricycle: 'Tricycle (keke)', shuttle: 'Shuttle' };

export default function TrackBookingPage() {
  usePageMeta('Track a booking', 'Follow your DoorstepGo ride — driver details, trip timeline, simulated route map, trip sharing and emergency support access.');
  const [params, setParams] = useSearchParams();
  const ref = (params.get('ref') ?? '').trim();
  const bookings = useBookings();
  const booking = useMemo(() => (ref ? bookings.find((b) => b.reference.toLowerCase() === ref.toLowerCase() || b.id === ref) : undefined), [bookings, ref]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const lookup = (r: string) => {
    setParams({ ref: r });
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Track booking' }]}
        eyebrow="Ride tracking"
        title={<>Follow your ride, <span className="text-gradient-go">every turn.</span></>}
        subtitle="See your driver, their vehicle and plate, the trip timeline and share your journey with someone you trust."
      >
        <TrackLookup prefix="RD" label="Track a ride booking by reference" samples={SAMPLES} initial={ref} onSubmit={lookup} />
      </PageHero>

      <div ref={resultsRef} className="scroll-mt-20 bg-canvas py-12 lg:py-16">
        <div className="container-x">
          {!ref ? (
            <TrackIntro
              steps={[
                { icon: <Search />, title: 'Enter your reference', body: 'Ride references start with DSG-RD — find yours in the confirmation or dashboard.' },
                { icon: <ShieldCheck />, title: 'Check your driver', body: 'Match the name, vehicle and plate before you get on.' },
                { icon: <Share2 />, title: 'Share your trip', body: 'Send a live trip link to family or colleagues in one tap.' },
              ]}
              aside={<HelpPanel message="Hello DoorstepGo, I need help with a ride booking." />}
            />
          ) : !booking ? (
            <TrackNotFound reference={ref} kind="booking" samples={SAMPLES.map((s) => s.ref)} onPick={lookup} />
          ) : (
            <RideTracker key={booking.id} booking={booking} />
          )}
        </div>
      </div>
    </>
  );
}

function RideTracker({ booking: b }: { booking: RideBooking }) {
  const { copy } = useCopy();
  const { isAuthed } = useAuth();
  const idx = statusIndex(b.status);
  const cancelled = b.status === 'cancelled' || b.status === 'cancellation_requested';
  const completed = b.status === 'completed';
  const canAdvance = !cancelled && !completed;
  const [auto, setAuto] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [announce, setAnnounce] = useState('');
  const prev = useRef(b.status);

  const tier = findTier(b.tierId);
  const pickupLabel = junctionLabel(b.pickup.cityId, b.pickup.junctionId);
  const dropLabel = junctionLabel(b.dropoff.cityId, b.dropoff.junctionId);
  const first = b.driver?.name.split(' ')[0] ?? 'Your driver';

  const descriptions: Record<string, string> = {
    r0: `Booking confirmed for ${formatDate(b.date)} at ${formatTime(b.time)}.`,
    r1: `${first} accepted your trip and is preparing to head out.`,
    r2: `${first} is on the way to ${pickupLabel}. Check the plate before you hop on.`,
    r3: `On the way to ${dropLabel}. Share your trip with someone you trust.`,
    r4: 'You have arrived. Thanks for riding with DoorstepGo!',
  };

  useEffect(() => {
    if (prev.current !== b.status) {
      prev.current = b.status;
      setAnnounce(`Trip update: ${b.timeline[idx]?.label ?? titleCase(b.status)}.`);
    }
  }, [b.status, b.timeline, idx]);

  useEffect(() => {
    if (!canAdvance) setAuto(false);
  }, [canAdvance]);

  const next = () => {
    if (canAdvance) bookingService.setStatus(b.id, ORDER[idx + 1]);
  };
  useInterval(next, auto && canAdvance ? 3500 : null);

  const minutes = idx === 1 ? 8 : idx === 2 ? 3 : idx === 3 ? Math.max(4, Math.round(b.fare.durationMin * 0.5)) : 0;
  const etaLabel = cancelled ? undefined : completed ? 'Arrived' : idx === 0 ? `${formatDate(b.date, { day: 'numeric', month: 'short' })} · ${formatTime(b.time)}` : idx === 3 ? `Arriving ~${minutes} min` : `Driver ~${minutes} min away`;
  const pct = Math.round((idx / (ORDER.length - 1)) * 100);
  const shareUrl = `${window.location.origin}/track-booking?ref=${b.reference}`;
  const shareText = `I'm on a ${site.name} ${kindLabel[b.kind].toLowerCase()} ride from ${pickupLabel} to ${dropLabel}${b.driver ? ` with ${b.driver.name} (${b.driver.plate})` : ''}. Follow my trip: ${shareUrl}`;
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="space-y-6">
      <LiveAnnouncer message={announce} />

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="noise relative isolate overflow-hidden rounded-3xl bg-ink-radial p-6 text-white shadow-lift sm:p-8" aria-labelledby="rd-status">
        <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden />
        <div className="absolute -top-20 right-0 -z-10 size-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CopyChip text={b.reference} label="Reference" />
            <StatusBadge status={b.status} />
            <StatusBadge status={b.paymentStatus} />
          </div>
          <Button variant="danger" size="sm" onClick={() => setSosOpen(true)} iconLeft={<Siren className="size-4" />} aria-haspopup="dialog">Emergency support</Button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-go-300 uppercase">{tier?.name ?? kindLabel[b.kind]}</p>
            <h2 id="rd-status" className="mt-2 text-3xl font-extrabold sm:text-4xl">{cancelled ? (b.status === 'cancelled' ? 'Booking cancelled' : 'Cancellation requested') : b.timeline[idx]?.label ?? titleCase(b.status)}</h2>
            <p className="mt-2 max-w-xl text-white/70">{cancelled ? 'This trip will not go ahead. Any payment is refunded to the original method (demo).' : descriptions[`r${idx}`]}</p>
          </div>
          {!cancelled && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur md:text-right">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/60 md:justify-end"><Clock className="size-3.5" aria-hidden /> {completed ? 'Trip completed' : idx === 0 ? 'Scheduled pickup' : idx === 3 ? 'Arriving in' : 'Driver arriving in'}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{completed ? '✓' : idx === 0 ? formatTime(b.time) : `${minutes} min`}</p>
              <p className="text-xs text-white/50">{idx === 0 ? formatDate(b.date) : 'Estimate — simulated'}</p>
            </div>
          )}
        </div>
        {!cancelled && (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Trip progress">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-go-500 to-amber-glow" initial={false} animate={{ width: `${Math.max(4, pct)}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-white/50"><span>Confirmed</span><span>{pct}%</span><span>Arrived</span></div>
          </div>
        )}
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 space-y-6">
          <RouteMap t={cancelled ? -1 : STAGE_T[idx]} vehicle={b.kind === 'motorcycle' ? 'bike' : 'car'} pickupLabel={pickupLabel} dropLabel={dropLabel} etaLabel={etaLabel} live={canAdvance} />

          <SectionCard title="Trip timeline" icon={<Route />} action={<Badge tone={cancelled ? 'crit' : completed ? 'ok' : 'go'} dot>{cancelled ? 'Stopped' : completed ? 'Complete' : 'Live (simulated)'}</Badge>}>
            <div aria-live="polite">
              <TrackingTimeline events={b.timeline} current={idx} descriptions={descriptions} cancelled={cancelled} />
            </div>
          </SectionCard>

          <SectionCard title="Trip details" icon={<Ticket />}>
            <div className="relative space-y-4 pl-6">
              <span className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-gradient-to-b from-brand-500 to-go-500" aria-hidden />
              <div className="relative">
                <span className="absolute top-1 -left-6 size-4 rounded-full bg-brand-500 ring-4 ring-brand-100" aria-hidden />
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><MapPin className="size-3.5" aria-hidden /> Pickup · {pickupLabel}</p>
                <p className="text-sm font-semibold text-ink-900">{b.pickup.address}</p>
              </div>
              {b.stops?.map((s, i) => (
                <div key={i} className="relative">
                  <span className="absolute top-1 -left-[22px] size-3 rounded-full bg-white ring-2 ring-line-strong" aria-hidden />
                  <p className="text-xs font-semibold text-muted">Stop {i + 1} · {junctionLabel(s.cityId, s.junctionId)}</p>
                  <p className="text-sm text-ink-900">{s.address}</p>
                </div>
              ))}
              <div className="relative">
                <span className="absolute top-1 -left-6 size-4 rounded-full bg-go-500 ring-4 ring-go-100" aria-hidden />
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><Flag className="size-3.5" aria-hidden /> Drop-off · {dropLabel}</p>
                <p className="text-sm font-semibold text-ink-900">{b.dropoff.address}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-x-8 border-t border-line pt-2 sm:grid-cols-2">
              <div>
                <KeyValue label="Service">{tier?.name ?? kindLabel[b.kind]}</KeyValue>
                <KeyValue label="Date">{formatDate(b.date)}</KeyValue>
                <KeyValue label="Time">{formatTime(b.time)}</KeyValue>
                <KeyValue label="Passengers"><span className="inline-flex items-center gap-1"><Users className="size-3.5 text-muted" aria-hidden /> {b.passengers}</span></KeyValue>
              </div>
              <div>
                <KeyValue label="Trip type">{b.tripType === 'return' ? `Return · ${formatDate(b.returnDate, { day: 'numeric', month: 'short' })} ${formatTime(b.returnTime)}` : 'One-way'}</KeyValue>
                {b.recurring && <KeyValue label="Repeats">{titleCase(b.recurring.frequency)}{b.recurring.until ? ` until ${formatDate(b.recurring.until, { day: 'numeric', month: 'short' })}` : ''}</KeyValue>}
                <KeyValue label="Distance">~{b.fare.distanceKm.toFixed(1)} km · {Math.round(b.fare.durationMin)} min</KeyValue>
                <KeyValue label="Fare (estimate)">{naira(b.fare.total)}</KeyValue>
              </div>
            </dl>
            {b.instructions && <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-text-2"><span className="font-semibold text-ink-900">Notes: </span>{b.instructions}</p>}
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card overflow-hidden" aria-labelledby="ride-sim">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-5 py-3">
              <h2 id="ride-sim" className="flex items-center gap-2 text-sm font-bold text-ink-900"><Zap className="size-4 text-go-500" aria-hidden /> Trip simulator</h2>
              <Badge tone="brand">Demo</Badge>
            </div>
            <div className="space-y-3 p-5">
              <Button block onClick={next} disabled={!canAdvance} iconLeft={<SkipForward className="size-4" />}>
                {completed ? 'Trip completed' : cancelled ? 'Trip cancelled' : 'Simulate next status'}
              </Button>
              <Toggle
                checked={auto}
                onChange={(v) => setAuto(v && canAdvance)}
                label={<span className="inline-flex items-center gap-1.5">{auto ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />} Auto-play status</span>}
                description="Moves the trip forward every few seconds."
              />
              <p className="text-xs text-muted">Statuses are generated in your browser for demonstration.</p>
            </div>
          </section>

          <DriverCard driver={b.driver} role="Driver" pendingText={idx === 0 ? 'Drivers are matched closer to your pickup time.' : 'Finding the closest available driver.'} />

          <SectionCard title="Share your trip" icon={<Share2 />}>
            <p className="text-sm text-text-2">Let family or colleagues follow this trip. The link shows status, driver and plate — no account needed.</p>
            <div className="mt-4 rounded-2xl border border-line bg-surface-2/60 p-3">
              <p className="truncate font-mono text-xs text-text-2" title={shareUrl}>{shareUrl}</p>
            </div>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" block iconLeft={<Link2 className="size-4" />} onClick={() => copy(shareUrl, 'Trip link copied')}>Copy share link</Button>
              <ExternalButton href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" variant="soft" block iconLeft={<WhatsappGlyph className="size-4" />}>Share via WhatsApp</ExternalButton>
              {canNativeShare && (
                <Button variant="ghost" block iconLeft={<Share2 className="size-4" />} onClick={() => navigator.share({ title: `${site.name} trip ${b.reference}`, text: shareText, url: shareUrl }).catch(() => undefined)}>More sharing options</Button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Manage booking" icon={<CalendarClock />}>
            {bookingService.canCancel(b) || bookingService.canModify(b) ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {bookingService.canModify(b) && <ButtonLink to={`/dashboard/bookings/${b.id}`} variant="outline" iconLeft={<PencilLine className="size-4" />}>Modify</ButtonLink>}
                  {bookingService.canCancel(b) && <ButtonLink to={`/dashboard/bookings/${b.id}`} variant="outline" className="hover:border-crit hover:text-crit" iconLeft={<XCircle className="size-4" />}>Cancel</ButtonLink>}
                </div>
                {!isAuthed && <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Lock className="size-3.5" aria-hidden /> You'll be asked to sign in first.</p>}
              </>
            ) : (
              <p className="text-sm text-text-2">This booking can no longer be changed online. Need help? <ButtonLink to={`/contact?topic=complaint&ref=${b.reference}#complaint`} variant="ghost" size="sm" className="px-1">Report a problem</ButtonLink></p>
            )}
            <div className="mt-3 border-t border-line pt-3">
              <ButtonLink to={`/contact?topic=complaint&ref=${b.reference}#complaint`} variant="ghost" size="sm" iconLeft={<CircleAlert className="size-4" />}>Report a problem with this trip</ButtonLink>
            </div>
          </SectionCard>

          <DemoNotice compact>Driver details, statuses and map position are simulated. No real driver is dispatched.</DemoNotice>
        </div>
      </div>

      <Modal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title={<span className="flex items-center gap-2"><Siren className="size-5 text-crit" aria-hidden /> Emergency support</span>}
        description="Get urgent help with this trip."
        footer={<Button variant="ghost" onClick={() => setSosOpen(false)}>Close</Button>}
      >
        <div className="space-y-4">
          <div role="alert" className="rounded-2xl border-2 border-crit/40 bg-crit-bg p-4 text-sm text-crit">
            <p className="font-bold">This demo is NOT connected to emergency services.</p>
            <p className="mt-1 text-crit/90">If you are in immediate danger, call Nigeria's national emergency number <a href="tel:112" className="font-bold underline">112</a> directly.</p>
          </div>
          <ExternalButton href={`tel:${site.contact.emergencyLine.replace(/\s/g, '')}`} variant="danger" size="lg" block iconLeft={<Phone className="size-5" />}>
            Call {site.name} safety line · {site.contact.emergencyLine}
          </ExternalButton>
          <div className="grid gap-2 sm:grid-cols-2">
            <ExternalButton href={`https://wa.me/?text=${encodeURIComponent(`I need help. ${shareText}`)}`} target="_blank" rel="noopener noreferrer" variant="outline" block iconLeft={<WhatsappGlyph className="size-4" />}>Alert a contact</ExternalButton>
            <ExternalButton href={whatsappLink(`URGENT: I need help with trip ${b.reference}.`)} target="_blank" rel="noopener noreferrer" variant="outline" block iconLeft={<WhatsappGlyph className="size-4" />}>WhatsApp support</ExternalButton>
          </div>
          <dl className="rounded-2xl bg-surface-2 p-4 text-sm">
            <KeyValue label="Trip">{b.reference}</KeyValue>
            {b.driver && <KeyValue label="Driver">{b.driver.name} · {b.driver.plate}</KeyValue>}
            <KeyValue label="Route">{pickupLabel} → {dropLabel}</KeyValue>
          </dl>
          <p className="text-xs text-muted">The safety line is a placeholder number for demonstration. In production it would route to a staffed safety desk and share your live trip details.</p>
        </div>
      </Modal>
    </div>
  );
}
