import type { ReactNode } from 'react';
import { ArrowRight, BadgeCheck, Check, Clock, Gauge, Receipt, ShieldCheck, Users } from 'lucide-react';
import { ButtonLink, Modal, SmartImage, Button } from '@/components/ui';
import { pricing } from '@/config/pricing';
import { img } from '@/data/images';
import type { ServiceTier } from '@/types';
import { naira } from '@/utils';

const safetyNotes: Record<string, string[]> = {
  motorcycle: [
    'Riders carry a spare passenger helmet; wear it for the entire trip.',
    'Rider name, photo and plate appear on your booking before pickup.',
    'Share your trip link with a friend from your booking page.',
    'Keep bags light and secure — one small bag per passenger.',
  ],
  tricycle: [
    'Operator name and vehicle details are shown on your booking.',
    'Stay seated and keep hands inside the cabin while moving.',
    'Cargo is loaded within the tricycle’s safe weight limit.',
    'Share your trip link and booking reference with someone you trust.',
  ],
  shuttle: [
    'Driver and vehicle details are shared ahead of your pickup time.',
    'Seat belts are fitted on every seat — please use them.',
    'Large groups get a single coordinator contact on the day.',
    'Luggage space is planned around your passenger count.',
  ],
};

/** "More info" dialog for a service tier: features, pricing logic and safety notes. */
export function TierInfoModal({ tier, open, onClose, children }: { tier: ServiceTier; open: boolean; onClose: () => void; children?: ReactNode }) {
  const surcharges = pricing.surcharges;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={tier.name}
      description={tier.tagline}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <ButtonLink to={`/booking?service=${tier.kind}&tier=${tier.id}`} variant="go" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            Book {tier.name}
          </ButtonLink>
        </>
      }
    >
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl">
          <SmartImage src={img(tier.image, 1000)} alt={tier.imageAlt} className="aspect-[16/7]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
          <p className="absolute right-4 bottom-3 left-4 text-sm leading-relaxed text-white/90">{tier.description}</p>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            { Icon: Users, k: 'Capacity', v: tier.capacityLabel },
            { Icon: Clock, k: 'Availability', v: tier.eta },
            { Icon: Receipt, k: 'From', v: naira(tier.minFare) },
          ].map(({ Icon, k, v }) => (
            <div key={k} className="rounded-xl bg-surface-2 px-2 py-3">
              <Icon className="mx-auto size-4 text-brand-600" aria-hidden />
              <dt className="mt-1 text-[11px] font-bold tracking-wider text-muted uppercase">{k}</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-ink-900"><BadgeCheck className="size-4 text-go-500" aria-hidden /> What’s included</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-2"><Check className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden /> {f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-ink-900"><Gauge className="size-4 text-go-500" aria-hidden /> How pricing works</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <caption className="sr-only">Illustrative pricing components for {tier.name}</caption>
              <tbody className="divide-y divide-line">
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">{tier.id === 'sh-group' ? 'Base fare (per seat)' : 'Base fare'}</th><td className="px-4 py-2.5 text-right font-semibold">{naira(tier.baseFare)}</td></tr>
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Per kilometre</th><td className="px-4 py-2.5 text-right font-semibold">{naira(tier.perKm)}</td></tr>
                {tier.perMin ? <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Per minute (in-city)</th><td className="px-4 py-2.5 text-right font-semibold">{naira(tier.perMin)}</td></tr> : null}
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Minimum fare</th><td className="px-4 py-2.5 text-right font-semibold">{naira(tier.minFare)}</td></tr>
                {tier.multiplier !== 1 && <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Tier adjustment</th><td className="px-4 py-2.5 text-right font-semibold">×{tier.multiplier}</td></tr>}
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Peak hours (7–9 AM, 5–8 PM)</th><td className="px-4 py-2.5 text-right font-semibold">+{Math.round(surcharges.peak.rate * 100)}%</td></tr>
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Night (10 PM – 5 AM)</th><td className="px-4 py-2.5 text-right font-semibold">+{Math.round(surcharges.night.rate * 100)}%</td></tr>
                <tr><th scope="row" className="px-4 py-2.5 text-left font-medium text-text-2">Service charge</th><td className="px-4 py-2.5 text-right font-semibold">{Math.round(pricing.serviceChargeRate * 100)}% + {naira(pricing.bookingFee)} booking fee</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">Illustrative demonstration rates. You always see an itemised estimate before confirming; your confirmed fare appears on your receipt.</p>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-ink-900"><ShieldCheck className="size-4 text-go-500" aria-hidden /> Safety notes</h3>
          <ul className="mt-3 space-y-2">
            {(safetyNotes[tier.kind] ?? safetyNotes.shuttle).map((n) => (
              <li key={n} className="flex items-start gap-2 rounded-xl bg-brand-50/60 px-3 py-2 text-sm text-brand-900"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden /> {n}</li>
            ))}
          </ul>
        </section>
        {children}
      </div>
    </Modal>
  );
}
