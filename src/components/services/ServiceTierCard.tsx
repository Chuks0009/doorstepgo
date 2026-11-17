import { useState } from 'react';
import { ArrowRight, Check, Clock, Info, Users } from 'lucide-react';
import { Badge, ButtonLink, Button, SmartImage, TiltCard } from '@/components/ui';
import { img } from '@/data/images';
import type { ServiceTier } from '@/types';
import { cn, naira } from '@/utils';
import { TierInfoModal } from './TierInfoModal';

export const bookHref = (t: ServiceTier) => `/booking?service=${t.kind}&tier=${t.id}`;

/**
 * Image-led tier card: photo with overlaid badge + price chip, capacity/ETA
 * metadata, feature ticks, Book + More info actions.
 * `variant="wide"` renders a horizontal card for featured/alternating layouts.
 */
export function ServiceTierCard({
  tier,
  index = 0,
  variant = 'tall',
  className,
  extraAction,
  infoExtra,
}: {
  tier: ServiceTier;
  index?: number;
  variant?: 'tall' | 'wide';
  className?: string;
  extraAction?: React.ReactNode;
  infoExtra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wide = variant === 'wide';
  return (
    <>
      <TiltCard max={5} className={cn('h-full rounded-3xl', className)}>
        <article
          aria-labelledby={`tier-${tier.id}`}
          className={cn(
            'group relative flex h-full overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift',
            wide ? 'flex-col md:flex-row' : 'flex-col',
          )}
        >
          <div className={cn('relative shrink-0 overflow-hidden', wide ? 'aspect-[16/10] md:aspect-auto md:w-[46%]' : 'aspect-[16/11]')}>
            <SmartImage src={img(tier.image, 900)} alt={tier.imageAlt} className="size-full" imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-ink-950/60 px-2.5 py-1 font-display text-[11px] font-bold tracking-widest text-white/90 backdrop-blur">
                {String(index + 1).padStart(2, '0')}
              </span>
              {tier.badge && <Badge tone={tier.popular ? 'go' : 'brand'}>{tier.badge}</Badge>}
            </div>
            <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3 text-white">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">From</p>
                <p className="font-display text-2xl font-extrabold">{naira(tier.minFare)}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Clock className="size-3.5 text-go-300" aria-hidden /> {tier.eta}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="text-xs font-bold tracking-[0.12em] text-go-600 uppercase">{tier.tagline}</p>
            <h3 id={`tier-${tier.id}`} className="mt-1.5 text-xl font-bold text-ink-900">{tier.name}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-text-2">{tier.description}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-semibold text-ink-800">
              <span className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-brand-800"><Users className="size-3.5" aria-hidden /> {tier.capacityLabel}</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5"><Clock className="size-3.5" aria-hidden /> Est. availability: {tier.eta}</span>
            </div>

            <ul className="mt-4 space-y-1.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-2">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-ok-bg text-ok"><Check className="size-3" strokeWidth={3} aria-hidden /></span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <ButtonLink to={bookHref(tier)} variant="go" className="min-w-0 flex-1" iconRight={<ArrowRight className="size-4" aria-hidden />} aria-label={`Book ${tier.name}`}>
                Book
              </ButtonLink>
              <Button variant="outline" onClick={() => setOpen(true)} iconLeft={<Info className="size-4" aria-hidden />} aria-haspopup="dialog" aria-label={`More info about ${tier.name}`}>
                More info
              </Button>
              {extraAction}
            </div>
          </div>
        </article>
      </TiltCard>
      <TierInfoModal tier={tier} open={open} onClose={() => setOpen(false)}>{infoExtra}</TierInfoModal>
    </>
  );
}
