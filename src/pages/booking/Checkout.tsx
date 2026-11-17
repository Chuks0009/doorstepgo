import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Banknote, Bike, CalendarDays, CreditCard, FileSearch, FlaskConical, Hash, Landmark, LayoutDashboard, Lock, MapPinned, Package, Printer,
  Receipt as ReceiptIcon, ShieldCheck, Smartphone, Sparkles, Wallet,
} from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Badge, Button, ButtonLink, DemoNotice, ExternalButton, ProgressSteps, SmartImage, StatusBadge, WhatsappGlyph } from '@/components/ui';
import { FareBreakdown } from '@/components/booking/FareBreakdown';
import { PromoField } from '@/components/booking/PromoField';
import { RouteTimeline, type RoutePoint } from '@/components/booking/RouteTimeline';
import { PaymentGatewayModal } from '@/components/booking/PaymentGateway';
import { Receipt } from '@/components/booking/Receipt';
import { Confetti, RouteDraw, SuccessBadge } from '@/components/booking/Celebration';
import { MobileFareBar } from '@/components/booking/Wizard';
import { paymentMethods, pricing, sizeOptions } from '@/config/pricing';
import { whatsappLink } from '@/config/site';
import { findDeliveryCategory, findTier } from '@/data/services';
import { img } from '@/data/images';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks';
import { useBookings, useDeliveries, usePayments } from '@/hooks/useData';
import { paymentService } from '@/services/api';
import { applyPromo, lookupPromo } from '@/services/pricingService';
import { KEYS, storage } from '@/services/storage';
import type { DeliveryBooking, PaymentMethodKind, PaymentRecord, PromoCode, RideBooking } from '@/types';
import { cn, formatDate, formatTime, naira, pluralize, roundTo, titleCase } from '@/utils';

const methodIcon: Record<PaymentMethodKind, typeof CreditCard> = { card: CreditCard, bank_transfer: Landmark, ussd: Hash, mobile_money: Smartphone, wallet: Wallet, cash: Banknote };
const methodAvailable = (id: PaymentMethodKind) => {
  const m = paymentMethods.find((x) => x.id === id);
  return !!m && m.enabled && m.badge !== 'Coming soon';
};
const methodLabel = (id: PaymentMethodKind) => paymentMethods.find((m) => m.id === id)?.label ?? titleCase(id);

type Meta = { promoCode?: string; discount?: number };

export default function CheckoutPage() {
  const { reference = '' } = useParams();
  usePageMeta('Checkout', 'Review your booking, apply a promo and complete a simulated payment.');
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const payments = usePayments();
  const key = reference.toLowerCase();
  const ride = bookings.find((b) => b.reference.toLowerCase() === key || b.id === reference);
  const delivery = ride ? undefined : deliveries.find((d) => d.reference.toLowerCase() === key || d.id === reference);

  if (!ride && !delivery) return <NotFoundState reference={reference} />;
  return <CheckoutFlow ride={ride} delivery={delivery} payments={payments} />;
}

/* ===================================================================== */
function CheckoutFlow({ ride, delivery, payments }: { ride?: RideBooking; delivery?: DeliveryBooking; payments: PaymentRecord[] }) {
  const toast = useToast();
  const booking = (ride ?? delivery)!;
  const isRide = !!ride;
  const fare = booking.fare;
  const metaKey = KEYS.draft(`checkout:${booking.reference}`);
  const meta = useMemo(() => storage.get<Meta>(metaKey, {}), [metaKey]);

  const [promo, setPromo] = useState<PromoCode | null>(() => {
    if (!meta.promoCode) return null;
    const r = lookupPromo(meta.promoCode);
    return r.ok ? r.promo : null;
  });
  const [promoTouched, setPromoTouched] = useState(false);
  const [method, setMethod] = useState<PaymentMethodKind>('card');
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [justPaid, setJustPaid] = useState<PaymentRecord | null>(null);

  const existing = payments.find((p) => p.bookingReference === booking.reference && p.status !== 'failed');
  const paid = justPaid ?? existing;

  const discount = promoTouched ? Math.round(applyPromo(fare.subtotal, promo)) : (meta.discount ?? fare.discount);
  const confirmedTotal = Math.max(0, roundTo(fare.subtotal + fare.serviceCharge - discount, pricing.roundTo));
  const savingsVsEstimate = fare.total - confirmedTotal;

  /* ---------- Derived presentation ---------- */
  const tier = ride ? findTier(ride.tierId) : undefined;
  const cat = delivery ? findDeliveryCategory(delivery.categoryId) : undefined;
  const serviceName = tier?.name ?? cat?.name ?? 'DoorstepGo service';
  const image = tier?.image ?? cat?.image;
  const description = `${isRide ? 'Ride' : 'Delivery'} ${booking.reference} · ${serviceName}`;

  const routePoints: RoutePoint[] = ride
    ? [{ kind: 'pickup', title: 'Pickup', loc: ride.pickup }, ...(ride.stops ?? []).map((s, i) => ({ kind: 'stop' as const, title: `Stop ${i + 1}`, loc: s })), { kind: 'dropoff', title: 'Destination', loc: ride.dropoff }]
    : [
        { kind: 'pickup', title: delivery!.market ? 'Market pickup' : 'Pickup', loc: delivery!.pickup, note: delivery!.market?.marketName },
        { kind: delivery!.extraDropoffs?.length ? 'stop' : 'dropoff', title: 'Drop-off', loc: delivery!.dropoff, note: `For ${delivery!.recipient.name}` },
        ...(delivery!.extraDropoffs ?? []).map((d, i, arr) => ({ kind: (i === arr.length - 1 ? 'dropoff' : 'stop') as RoutePoint['kind'], title: `Drop-off ${i + 2}`, loc: d, note: `For ${d.recipient.name}` })),
      ];

  const details: { label: string; value: string }[] = ride
    ? [
        { label: 'Pickup', value: `${formatDate(ride.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${formatTime(ride.time)}` },
        { label: 'Passengers', value: `${ride.passengers}${ride.vehicles && ride.vehicles > 1 ? ` · ${pluralize(ride.vehicles, 'vehicle')}` : ''}` },
        { label: 'Trip', value: ride.tripType === 'return' ? `Return · ${formatDate(ride.returnDate)} ${formatTime(ride.returnTime)}` : 'One-way' },
        ...(ride.shuttleType ? [{ label: 'Shuttle', value: ride.shuttleType }] : []),
        ...(ride.recurring ? [{ label: 'Recurring', value: `${titleCase(ride.recurring.frequency)} until ${formatDate(ride.recurring.until)}` }] : []),
      ]
    : [
        { label: 'Pickup', value: delivery!.pickupMode === 'scheduled' ? `${formatDate(delivery!.date)} · ${formatTime(delivery!.time)}` : 'Immediate' },
        { label: 'Speed', value: pricing.delivery.urgency[delivery!.urgency]?.label ?? delivery!.urgency },
        { label: 'Package', value: `${sizeOptions.find((s) => s.id === delivery!.packageSize)?.label ?? delivery!.packageSize} · ${delivery!.weightKg} kg · ${pluralize(delivery!.packages, 'item')}` },
        { label: 'Sender', value: `${delivery!.sender.name}` },
      ];

  const trackHref = isRide ? `/track-booking?ref=${booking.reference}` : `/track-delivery?ref=${booking.reference}`;
  const dashHref = isRide ? `/dashboard/bookings/${booking.id}` : `/dashboard/deliveries/${booking.id}`;
  const waHref = whatsappLink(`Hello DoorstepGo 👋 I need help with ${isRide ? 'booking' : 'delivery'} ${booking.reference}.`);

  /* ---------- Actions ---------- */
  const finalize = (rec: PaymentRecord) => {
    storage.set(metaKey, { promoCode: promo?.code, discount } satisfies Meta);
    setGatewayOpen(false);
    setJustPaid(rec);
    setBusy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: rec.method === 'cash' ? 'Booking confirmed' : 'Payment successful (demo)', body: rec.method === 'cash' ? 'Pay in cash on completion.' : `${naira(rec.amount)} simulated · Ref ${rec.reference}` });
  };

  const pay = async () => {
    if (!methodAvailable(method)) return;
    if (method === 'cash') {
      setBusy(true);
      const r = await paymentService.charge({ bookingReference: booking.reference, amount: confirmedTotal, method, description: `${description} · Cash on completion` });
      if (r.ok) finalize(r.data);
      else {
        setBusy(false);
        toast({ title: 'Could not confirm', body: r.error, tone: 'error' });
      }
      return;
    }
    setGatewayOpen(true);
  };

  /* ===================== PAID: confirmation + receipt ===================== */
  if (paid) {
    const fresh = !!justPaid;
    const cash = paid.method === 'cash';
    const receiptDiscount = fresh ? discount : (meta.discount ?? fare.discount);
    return (
      <>
        <section className="no-print noise relative isolate overflow-hidden bg-ink-950 text-white">
          <div aria-hidden className="absolute inset-0 -z-10 bg-ink-radial" />
          <div aria-hidden className="grid-lines absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-x relative pt-[calc(72px+3rem)] pb-20 text-center">
            {fresh && <Confetti />}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
              <SuccessBadge tone={cash ? 'warn' : 'ok'} />
              <p className="mt-6 eyebrow-dark"><FlaskConical className="size-3.5" aria-hidden /> Simulated · no real money</p>
              <h1 className="mt-4 max-w-2xl text-3xl font-extrabold text-balance sm:text-5xl" tabIndex={-1}>
                {cash ? 'Booking confirmed — pay on completion' : fresh ? <>Payment successful. <span className="text-gradient-go">You’re all set.</span></> : 'Your booking receipt'}
              </h1>
              <p className="mt-4 max-w-xl text-white/70">
                {isRide ? 'We’ll match a driver and notify you (demo).' : `Share delivery code ${delivery!.deliveryCode} with your recipient — they’ll need it on arrival.`} Reference <span className="font-mono font-semibold text-white">{booking.reference}</span>.
              </p>
            </motion.div>
            <div className="mx-auto mt-8 max-w-xl">
              <RouteDraw />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to={trackHref} size="lg" iconLeft={<MapPinned className="size-4" />}>Track {isRide ? 'ride' : 'delivery'}</ButtonLink>
              <ButtonLink to={dashHref} size="lg" variant="glass" iconLeft={<LayoutDashboard className="size-4" />}>View in dashboard</ButtonLink>
            </div>
          </div>
        </section>

        <section className="bg-canvas pb-24">
          <div className="container-x">
            <div className="no-print relative z-10 -mt-8 rounded-3xl border border-line bg-white p-4 shadow-lift sm:p-6">
              <ProgressSteps steps={['Booking', 'Payment', 'Receipt']} current={2} />
            </div>
            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Receipt
                bookingReference={booking.reference}
                payment={paid}
                methodLabel={methodLabel(paid.method)}
                serviceName={serviceName}
                bookedAt={booking.createdAt}
                routePoints={routePoints}
                details={details}
                lines={fare.lines}
                serviceCharge={fare.serviceCharge}
                discount={receiptDiscount}
                promoCode={fresh ? promo?.code : meta.promoCode}
                estimatedTotal={fare.total}
                extraRefs={delivery ? [{ label: 'Delivery code', value: <span className="font-mono text-base font-bold tracking-[0.3em]">{delivery.deliveryCode}</span> }] : []}
              />
              <aside className="no-print space-y-3 lg:sticky lg:top-24">
                <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Next steps</p>
                <Button block size="lg" variant="ink" iconLeft={<Printer className="size-4" />} onClick={() => window.print()}>Print receipt</Button>
                <ButtonLink block size="lg" variant="outline" to={trackHref} iconLeft={<MapPinned className="size-4" />}>Track {isRide ? 'booking' : 'delivery'}</ButtonLink>
                <ButtonLink block size="lg" variant="outline" to={dashHref} iconLeft={<LayoutDashboard className="size-4" />}>Dashboard</ButtonLink>
                <ExternalButton block size="lg" variant="outline" href={waHref} target="_blank" rel="noopener noreferrer" iconLeft={<WhatsappGlyph className="size-4 text-[#25D366]" />}>WhatsApp support</ExternalButton>
                <ButtonLink block size="lg" variant="ghost" to={isRide ? '/booking' : '/delivery'} iconRight={<ArrowRight className="size-4" />}>Book another</ButtonLink>
                <DemoNotice compact className="mt-4" />
              </aside>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ===================== PAY ===================== */
  const cancelled = booking.status === 'cancelled';
  const synthetic = { ...fare, discount, total: confirmedTotal };
  const payLabel = method === 'cash' ? 'Confirm — pay cash later' : `Pay ${naira(confirmedTotal)} (demo)`;

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: isRide ? 'Book a ride' : 'Send a delivery', to: isRide ? '/booking' : '/delivery' }, { label: 'Checkout' }]}
        eyebrow={<><Lock className="size-3.5" aria-hidden /> Secure checkout · demo</>}
        title={<>Almost there. <span className="text-gradient-go">Confirm & go.</span></>}
        subtitle={<>Booking <span className="font-mono font-semibold text-white">{booking.reference}</span> is reserved. Review your fare, apply a promo and complete a <strong className="text-white">simulated</strong> payment — no real money is processed.</>}
      />

      <section className="bg-canvas pb-32 lg:pb-24">
        <div className="container-x">
          <div className="relative z-10 -mt-8 rounded-3xl border border-line bg-white p-4 shadow-lift sm:p-6">
            <ProgressSteps steps={['Booking', 'Payment', 'Receipt']} current={1} />
          </div>

          <div role="note" className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-go-300 bg-go-50 px-4 py-3 text-sm font-medium text-go-800">
            <FlaskConical className="size-5 shrink-0" aria-hidden />
            <span><strong>Test mode.</strong> This checkout is a simulation: no card data is collected and no money moves. Real gateways (e.g. Paystack, Flutterwave) plug in later.</span>
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-6">
              {/* Booking summary */}
              <section aria-labelledby="sum-h" className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
                <div className="flex flex-wrap items-center gap-4 border-b border-line p-5 sm:p-6">
                  {image && <SmartImage src={img(image, 240)} alt="" className="size-16 shrink-0 rounded-2xl" />}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-muted uppercase">
                      {isRide ? <Bike className="size-3.5" aria-hidden /> : <Package className="size-3.5" aria-hidden />} {isRide ? 'Ride booking' : 'Delivery booking'}
                    </p>
                    <h2 id="sum-h" className="font-display text-xl font-bold text-ink-900">{serviceName}</h2>
                    <p className="font-mono text-sm text-text-2">{booking.reference}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={booking.status} />
                    <StatusBadge status={booking.paymentStatus} />
                  </div>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  <RouteTimeline points={routePoints} />
                  <dl className="space-y-3 text-sm">
                    {details.map((d) => (
                      <div key={d.label}>
                        <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{d.label}</dt>
                        <dd className="font-medium text-ink-900">{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {delivery?.market && (
                  <p className="mx-5 mb-5 rounded-xl bg-go-50 px-4 py-3 text-[13px] text-go-800 sm:mx-6">
                    <strong>Market pickup:</strong> the amount below covers pickup, assistance and delivery only. Purchases and payment to sellers may require separate arrangements.
                  </p>
                )}
              </section>

              {cancelled ? (
                <div role="alert" className="rounded-3xl border border-crit/30 bg-crit-bg p-6 text-crit">
                  <p className="font-display text-lg font-bold">This booking was cancelled</p>
                  <p className="mt-1 text-sm">Payment is no longer required. You can make a new booking at any time.</p>
                  <ButtonLink to={isRide ? '/booking' : '/delivery'} className="mt-4">Book again</ButtonLink>
                </div>
              ) : (
                <>
                  {/* Fare & discounts */}
                  <div className="grid gap-6 xl:grid-cols-2">
                    <FareBreakdown fare={fare} title="Estimated fare (at booking)" />
                    <div className="space-y-4">
                      <section aria-labelledby="promo-h" className="rounded-3xl border border-line bg-white p-5 shadow-soft">
                        <h2 id="promo-h" className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900"><Sparkles className="size-5 text-go-500" aria-hidden /> Discounts & promo</h2>
                        <p className="mt-1 text-sm text-text-2">Apply or change a code — savings are recalculated on your fare subtotal of {naira(fare.subtotal)}.</p>
                        <PromoField
                          className="mt-4"
                          promo={promo}
                          subtotal={fare.subtotal}
                          onChange={(p) => {
                            setPromo(p);
                            setPromoTouched(true);
                          }}
                        />
                        {discount > 0 && (
                          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={discount} aria-live="polite" className="mt-3 flex items-center gap-2 rounded-xl bg-ok-bg px-4 py-2.5 text-sm font-semibold text-ok">
                            <Sparkles className="size-4" aria-hidden /> You’re saving {naira(discount)}
                          </motion.p>
                        )}
                      </section>
                      <DemoNotice compact />
                    </div>
                  </div>

                  {/* Payment method */}
                  <section aria-labelledby="pm-h" className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-6">
                    <h2 id="pm-h" className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900"><CreditCard className="size-5 text-brand-600" aria-hidden /> Payment method</h2>
                    <p className="mt-1 text-sm text-text-2">All methods are simulated in this demo.</p>
                    <div role="radiogroup" aria-labelledby="pm-h" className="mt-5 grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((m) => {
                        const I = methodIcon[m.id];
                        const ok = methodAvailable(m.id);
                        const active = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-disabled={!ok || undefined}
                            disabled={!ok}
                            onClick={() => setMethod(m.id)}
                            className={cn(
                              'relative flex min-h-20 items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                              active ? 'border-go-500 bg-go-50/60 shadow-[0_8px_28px_-12px_rgb(255_106_19/0.45)]' : 'border-line bg-white hover:border-brand-300',
                              !ok && 'cursor-not-allowed opacity-55 hover:border-line',
                            )}
                          >
                            <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', active ? 'bg-go-500 text-white' : 'bg-brand-50 text-brand-700')}><I className="size-5" aria-hidden /></span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                                {m.label}
                                {m.badge && <Badge tone={m.badge === 'Coming soon' ? 'neutral' : 'ok'}>{m.badge}</Badge>}
                              </span>
                              <span className="block text-[13px] text-text-2">{m.description}</span>
                            </span>
                            <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', active ? 'border-go-500 bg-go-500' : 'border-line-strong')}>
                              {active && <span className="size-2 rounded-full bg-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {method === 'cash' && <p className="mt-4 rounded-xl bg-warn-bg px-4 py-3 text-[13px] text-warn">Pay {naira(confirmedTotal)} to your {isRide ? 'driver' : 'rider'} on completion. Your booking is confirmed now; payment shows as pending until then.</p>}
                  </section>
                </>
              )}
            </div>

            {/* Order summary (sticky) */}
            {!cancelled && (
              <aside aria-label="Order summary" className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl bg-ink-900 text-white shadow-lift">
                  <div className="relative p-6">
                    <span aria-hidden className="absolute -top-16 -right-12 size-48 rounded-full bg-brand-500/30 blur-3xl" />
                    <p className="relative text-xs font-bold tracking-[0.16em] text-go-300 uppercase">Order summary</p>
                    <dl className="relative mt-4 space-y-2.5 text-sm">
                      <div className="flex justify-between"><dt className="text-white/65">Fare subtotal</dt><dd className="tabular-nums">{naira(fare.subtotal)}</dd></div>
                      <div className="flex justify-between"><dt className="text-white/65">Service & booking charges</dt><dd className="tabular-nums">{naira(fare.serviceCharge)}</dd></div>
                      <div className="flex justify-between text-emerald-300"><dt>Discount{promo ? ` (${promo.code})` : ''}</dt><dd className="tabular-nums">{discount > 0 ? `−${naira(discount)}` : naira(0)}</dd></div>
                      {savingsVsEstimate !== 0 && <div className="flex justify-between border-t border-white/10 pt-3 text-white/50"><dt>Estimated at booking</dt><dd className="tabular-nums line-through decoration-white/30">{naira(fare.total)}</dd></div>}
                    </dl>
                    <div className="relative mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-white/60">Confirmed amount (demo)</p>
                        <motion.p key={confirmedTotal} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} aria-live="polite" className="font-display text-4xl font-extrabold tabular-nums">{naira(confirmedTotal)}</motion.p>
                      </div>
                      <Badge tone="ok" className="mb-2">Confirmed</Badge>
                    </div>
                    <p className="relative mt-3 text-xs leading-relaxed text-white/55">
                      Your estimate was {naira(fare.total)}. {savingsVsEstimate > 0 ? `Checkout adjustments save you ${naira(savingsVsEstimate)}.` : savingsVsEstimate < 0 ? `Removing a promo adds ${naira(-savingsVsEstimate)}.` : 'No change since booking.'} The confirmed amount is what this demo “charges”.
                    </p>
                    <Button block size="xl" className="relative mt-6 max-lg:hidden" onClick={pay} loading={busy} disabled={!methodAvailable(method)} iconLeft={<ShieldCheck className="size-5" />}>
                      {payLabel}
                    </Button>
                    <p className="relative mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50"><Lock className="size-3.5" aria-hidden /> Simulated · no real money is processed</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm text-text-2">
                  <CalendarDays className="size-5 shrink-0 text-brand-600" aria-hidden />
                  Free cancellation within {pricing.cancellation.freeWindowMinutes} minutes of booking.
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {!cancelled && (
        <MobileFareBar
          fare={synthetic}
          label="To pay (demo)"
          cta={
            <Button size="lg" onClick={pay} loading={busy} disabled={!methodAvailable(method)} iconLeft={<ShieldCheck className="size-4" />}>
              {method === 'cash' ? 'Confirm' : 'Pay'}
            </Button>
          }
          sheetExtra={<p className="text-[13px] text-text-2">Confirmed amount after checkout adjustments: <strong className="text-ink-900">{naira(confirmedTotal)}</strong> (demo).</p>}
        />
      )}

      <PaymentGatewayModal
        open={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
        method={method}
        methodLabel={methodLabel(method)}
        amount={confirmedTotal}
        reference={booking.reference}
        description={description}
        onSuccess={finalize}
      />
    </>
  );
}

/* ===================================================================== */
function NotFoundState({ reference }: { reference: string }) {
  return (
    <>
      <PageHero compact crumbs={[{ label: 'Checkout' }]} eyebrow={<><ReceiptIcon className="size-3.5" aria-hidden /> Checkout</>} title="We couldn’t find that booking" subtitle={<>No booking matches <span className="font-mono font-semibold text-white">{reference || '—'}</span> on this device. Demo bookings are stored in this browser only.</>} />
      <section className="bg-canvas py-16">
        <div className="container-x max-w-3xl">
          <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><FileSearch className="size-7" aria-hidden /></span>
            <h2 className="mt-4 text-2xl font-bold text-ink-900">Let’s get you back on track</h2>
            <p className="mx-auto mt-2 max-w-md text-text-2">Check the reference (e.g. DSG-RD-XXXX-XXXX), look it up in your dashboard, or start a new booking.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ButtonLink to="/booking" size="lg" iconLeft={<Bike className="size-4" />}>Book a ride</ButtonLink>
              <ButtonLink to="/delivery" size="lg" variant="brand" iconLeft={<Package className="size-4" />}>Send a delivery</ButtonLink>
              <ButtonLink to="/track-booking" size="lg" variant="outline" iconLeft={<MapPinned className="size-4" />}>Track a booking</ButtonLink>
              <ButtonLink to="/dashboard/bookings" size="lg" variant="outline" iconLeft={<LayoutDashboard className="size-4" />}>My bookings</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
