import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Box, CircleAlert, Clock, Flag, KeyRound, Link2, MapPin, Package, PackageCheck, Pause, Play, RotateCcw, Route, Search, Share2, SkipForward, Store, Zap,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, ButtonLink, DemoNotice, ExternalButton, StatusBadge, Toggle, WhatsappGlyph } from '@/components/ui';
import { RouteMap } from '@/components/tracking/RouteMap';
import { ProofOfDelivery } from '@/components/tracking/ProofOfDelivery';
import { CopyChip, DriverCard, KeyValue, LiveAnnouncer, SectionCard, TrackIntro, TrackLookup, TrackNotFound, TrackingTimeline, useCopy } from '@/components/tracking/TrackingParts';
import { HelpPanel } from '@/components/support/HelpPanel';
import { useDeliveries } from '@/hooks/useData';
import { useInterval, usePageMeta } from '@/hooks';
import { deliveryService } from '@/services/api';
import { deliveryStages } from '@/data/seed';
import { findDeliveryCategory } from '@/data/services';
import { junctionLabel } from '@/config/locations';
import { site, whatsappLink } from '@/config/site';
import { useToast } from '@/context/ToastContext';
import { formatDate, formatTime, maskPhone, naira, titleCase } from '@/utils';
import type { DeliveryBooking } from '@/types';

const SAMPLES = [
  { ref: 'DSG-DL-4XKP-7RT2', note: 'In transit' },
  { ref: 'DSG-DL-9MZQ-2HWB', note: 'Scheduled' },
  { ref: 'DSG-DL-K2RT-5NVX', note: 'Delivered' },
];

const STAGE_T = [-1, 0, 0.6, 1, 1.5, 1.85, 2];
const MINUTES_LEFT = [45, 38, 30, 22, 14, 4, 0];

const describe = (d: DeliveryBooking): Record<string, string> => ({
  received: 'We have your booking and are lining up the nearest available rider.',
  rider_assigned: `${d.rider?.name.split(' ')[0] ?? 'A rider'} accepted the job and is getting ready.`,
  heading_to_pickup: `Rider is on the way to ${d.market ? d.market.marketName : 'the pickup point'}.`,
  collected: d.market ? `Items collected from ${d.market.sellerName ?? 'the seller'} and checked by the rider.` : 'Package collected and checked by the rider.',
  in_transit: 'Your package is on the move through the city.',
  approaching: 'Rider is a few minutes away — have the 4-digit delivery code ready.',
  delivered: 'Package handed over at the destination.',
});

export default function TrackDeliveryPage() {
  usePageMeta('Track a delivery', 'Live-style delivery tracking with timeline, rider details, simulated map position and proof of delivery.');
  const [params, setParams] = useSearchParams();
  const ref = (params.get('ref') ?? '').trim();
  const deliveries = useDeliveries();
  const delivery = useMemo(() => (ref ? deliveries.find((d) => d.reference.toLowerCase() === ref.toLowerCase() || d.id === ref) : undefined), [deliveries, ref]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const lookup = (r: string) => {
    setParams({ ref: r });
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Track delivery' }]}
        eyebrow="Delivery tracking"
        title={<>Where's my <span className="text-gradient-go">package?</span></>}
        subtitle="Enter your delivery reference to follow every stage — from rider assignment to doorstep handover."
      >
        <TrackLookup prefix="DL" label="Track a delivery by reference" samples={SAMPLES} initial={ref} onSubmit={lookup} />
      </PageHero>

      <div ref={resultsRef} className="scroll-mt-20 bg-canvas py-12 lg:py-16">
        <div className="container-x">
          {!ref ? (
            <TrackIntro
              steps={[
                { icon: <Search />, title: 'Find your reference', body: 'It starts with DSG-DL and is in your confirmation SMS, email and dashboard.' },
                { icon: <Route />, title: 'Follow seven stages', body: 'From booking received to delivery completed, each update is timestamped.' },
                { icon: <KeyRound />, title: 'Confirm handover', body: 'Recipients confirm with a 4-digit code, a photo or their name.' },
              ]}
              aside={<HelpPanel message="Hello DoorstepGo, I need help tracking a delivery." />}
            />
          ) : !delivery ? (
            <TrackNotFound reference={ref} kind="delivery" samples={SAMPLES.map((s) => s.ref)} onPick={lookup} />
          ) : (
            <DeliveryTracker key={delivery.id} delivery={delivery} />
          )}
        </div>
      </div>
    </>
  );
}

function DeliveryTracker({ delivery: d }: { delivery: DeliveryBooking }) {
  const toast = useToast();
  const { copy } = useCopy();
  const idx = Math.max(0, deliveryStages.findIndex((s) => s.key === d.stage));
  const cancelled = d.status === 'cancelled';
  const delivered = d.stage === 'delivered';
  const canAdvance = !cancelled && !delivered;
  const [auto, setAuto] = useState(false);
  const [announce, setAnnounce] = useState('');
  const prevStage = useRef(d.stage);
  const descriptions = describe(d);

  useEffect(() => {
    if (prevStage.current !== d.stage) {
      prevStage.current = d.stage;
      setAnnounce(`Delivery update: ${deliveryStages[idx].label}. ${descriptions[d.stage]}`);
    }
  }, [d.stage, idx, descriptions]);

  useEffect(() => {
    if (!canAdvance) setAuto(false);
  }, [canAdvance]);

  useInterval(() => deliveryService.advance(d.id), auto && canAdvance ? 3500 : null);

  const next = () => {
    deliveryService.advance(d.id);
  };

  const restart = () => {
    const stamp = new Date().toISOString();
    deliveryService.update(d.id, {
      stage: 'rider_assigned',
      status: 'driver_assigned',
      proof: undefined,
      timeline: d.timeline.map((t, i) => (i <= 1 ? { ...t, done: true, at: t.at ?? stamp } : { ...t, done: false, at: undefined })),
    });
    toast({ title: 'Simulation restarted', body: 'The delivery is back at “Rider assigned”.', tone: 'info' });
  };

  const category = findDeliveryCategory(d.categoryId);
  const pickupLabel = junctionLabel(d.pickup.cityId, d.pickup.junctionId);
  const dropLabel = junctionLabel(d.dropoff.cityId, d.dropoff.junctionId);
  const minutes = MINUTES_LEFT[idx];
  const scheduledLater = idx === 0 && d.pickupMode === 'scheduled';
  const etaLabel = cancelled ? undefined : delivered ? 'Delivered' : scheduledLater ? `Pickup ${formatDate(d.date, { day: 'numeric', month: 'short' })}` : `ETA ~${minutes} min`;
  const pct = Math.round((idx / (deliveryStages.length - 1)) * 100);
  const shareUrl = `${window.location.origin}/track-delivery?ref=${d.reference}`;
  const shareText = `Track my DoorstepGo delivery ${d.reference}: ${shareUrl}`;

  return (
    <div className="space-y-6">
      <LiveAnnouncer message={announce} />

      {/* Status header */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="noise relative isolate overflow-hidden rounded-3xl bg-ink-radial p-6 text-white shadow-lift sm:p-8" aria-labelledby="dl-status">
        <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden />
        <div className="absolute -top-20 right-0 -z-10 size-72 rounded-full bg-go-500/25 blur-3xl" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CopyChip text={d.reference} label="Reference" />
            <StatusBadge status={cancelled ? 'cancelled' : d.stage} />
            <StatusBadge status={d.paymentStatus} />
          </div>
          {category && <span className="inline-flex items-center gap-1.5 text-sm text-white/60"><Package className="size-4" aria-hidden /> {category.name}</span>}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-go-300 uppercase">{cancelled ? 'Cancelled' : delivered ? 'Completed' : `Stage ${idx + 1} of ${deliveryStages.length}`}</p>
            <h2 id="dl-status" className="mt-2 text-3xl font-extrabold sm:text-4xl">{cancelled ? 'Delivery cancelled' : deliveryStages[idx].label}</h2>
            <p className="mt-2 max-w-xl text-white/70">{cancelled ? 'This delivery was cancelled and any payment was refunded (demo).' : descriptions[d.stage]}</p>
          </div>
          {!cancelled && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur md:text-right">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/60 md:justify-end"><Clock className="size-3.5" aria-hidden /> {delivered ? 'Delivered' : scheduledLater ? 'Scheduled pickup' : 'Estimated arrival'}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                {delivered ? formatTime(new Date(d.timeline[6]?.at ?? Date.now()).toTimeString().slice(0, 5)) : scheduledLater ? formatTime(d.time) : `${minutes} min`}
              </p>
              <p className="text-xs text-white/50">{scheduledLater ? formatDate(d.date) : delivered ? 'Handover recorded' : 'Estimate — simulated'}</p>
            </div>
          )}
        </div>
        {!cancelled && (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Delivery progress">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-go-500 to-amber-glow" initial={false} animate={{ width: `${Math.max(4, pct)}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-white/50"><span>Received</span><span>{pct}%</span><span>Delivered</span></div>
          </div>
        )}
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <RouteMap t={cancelled ? -1 : STAGE_T[idx]} vehicle="bike" pickupLabel={d.market?.marketName ?? pickupLabel} dropLabel={dropLabel} etaLabel={etaLabel} live={canAdvance} />

          <SectionCard title="Tracking timeline" icon={<Route />} action={<Badge tone={cancelled ? 'crit' : delivered ? 'ok' : 'go'} dot>{cancelled ? 'Stopped' : delivered ? 'Complete' : 'Live (simulated)'}</Badge>}>
            <div aria-live="polite">
              <TrackingTimeline events={d.timeline} current={idx} descriptions={descriptions} cancelled={cancelled} />
            </div>
          </SectionCard>

          <SectionCard title="Proof of delivery" icon={<PackageCheck />}>
            <ProofOfDelivery delivery={d} stageIndex={idx} />
          </SectionCard>
        </div>

        {/* Side column */}
        <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Simulation controls */}
          <section className="card overflow-hidden" aria-labelledby="sim-title">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-5 py-3">
              <h2 id="sim-title" className="flex items-center gap-2 text-sm font-bold text-ink-900"><Zap className="size-4 text-go-500" aria-hidden /> Tracking simulator</h2>
              <Badge tone="brand">Demo</Badge>
            </div>
            <div className="space-y-3 p-5">
              <Button block variant="go" onClick={next} disabled={!canAdvance} iconLeft={<SkipForward className="size-4" />}>
                {delivered ? 'Delivery completed' : cancelled ? 'Delivery cancelled' : 'Simulate next update'}
              </Button>
              <Toggle
                checked={auto}
                onChange={(v) => setAuto(v && canAdvance)}
                label={<span className="inline-flex items-center gap-1.5">{auto ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />} Auto-play updates</span>}
                description="Advances one stage every few seconds."
              />
              {!cancelled && idx > 1 && (
                <Button block variant="ghost" size="sm" onClick={restart} iconLeft={<RotateCcw className="size-4" />}>Replay from rider assigned</Button>
              )}
              <p className="text-xs text-muted">Real GPS tracking arrives with the live dispatch integration. Updates here are generated in your browser.</p>
            </div>
          </section>

          <DriverCard driver={d.rider} role="Rider" pendingText="We'll show their name, bike and plate as soon as they accept." />

          <SectionCard title="Shipment" icon={<Box />}>
            <div className="relative space-y-4 pl-6">
              <span className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-gradient-to-b from-brand-500 to-go-500" aria-hidden />
              <div className="relative">
                <span className="absolute top-1 -left-6 grid size-4 place-items-center rounded-full bg-brand-500 ring-4 ring-brand-100" aria-hidden />
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">{d.market ? <Store className="size-3.5" aria-hidden /> : <MapPin className="size-3.5" aria-hidden />} Pickup · {d.sender.name}</p>
                <p className="text-sm font-semibold text-ink-900">{d.pickup.address}</p>
                <p className="text-xs text-muted">{pickupLabel} · {maskPhone(d.sender.phone.replace(/\s/g, ''))}</p>
              </div>
              <div className="relative">
                <span className="absolute top-1 -left-6 grid size-4 place-items-center rounded-full bg-go-500 ring-4 ring-go-100" aria-hidden />
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><Flag className="size-3.5" aria-hidden /> Drop-off · {d.recipient.name}</p>
                <p className="text-sm font-semibold text-ink-900">{d.dropoff.address}</p>
                <p className="text-xs text-muted">{dropLabel} · {maskPhone(d.recipient.phone.replace(/\s/g, ''))}</p>
              </div>
            </div>
            <dl className="mt-5 border-t border-line pt-2">
              <KeyValue label="Package">{d.packageDescription}</KeyValue>
              <KeyValue label="Size & weight">{titleCase(d.packageSize)} · {d.weightKg} kg · {d.packages} pc{d.packages > 1 ? 's' : ''}</KeyValue>
              <KeyValue label="Speed">{titleCase(d.urgency)}</KeyValue>
              {d.market && <KeyValue label="Market stall">{d.market.stallLocation ?? '—'}</KeyValue>}
              {d.handling.length > 0 && <KeyValue label="Handling">{d.handling.map(titleCase).join(', ')}</KeyValue>}
              <KeyValue label="Fare (estimate)">{naira(d.fare.total)}</KeyValue>
            </dl>
          </SectionCard>

          <SectionCard title="Share & get help" icon={<Share2 />}>
            <div className="grid gap-2">
              <Button variant="outline" block iconLeft={<Link2 className="size-4" />} onClick={() => copy(shareUrl, 'Tracking link copied')}>Copy tracking link</Button>
              <ExternalButton href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" variant="soft" block iconLeft={<WhatsappGlyph className="size-4" />}>
                Share via WhatsApp
              </ExternalButton>
              <ButtonLink to={`/contact?topic=complaint&ref=${d.reference}#complaint`} variant="ghost" block iconLeft={<CircleAlert className="size-4" />}>Report a problem</ButtonLink>
              <ExternalButton href={whatsappLink(`Hello ${site.name}, I need help with delivery ${d.reference}.`)} target="_blank" rel="noopener noreferrer" variant="ink" block iconLeft={<WhatsappGlyph className="size-4" />} iconRight={<ArrowRight className="size-4" />}>
                WhatsApp support
              </ExternalButton>
            </div>
          </SectionCard>

          <DemoNotice compact>Tracking, rider details and map position are simulated for demonstration. No real rider is dispatched.</DemoNotice>
        </div>
      </div>
    </div>
  );
}
