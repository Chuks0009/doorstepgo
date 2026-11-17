import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CircleCheck, KeyRound, Search, ShoppingBasket, Store } from 'lucide-react';
import { ButtonLink, Icon, Reveal, SectionHeading, SmartImage, TiltCard } from '@/components/ui';
import { deliveryCategories, findDeliveryCategory } from '@/data/services';
import { images, img } from '@/data/images';
import { naira } from '@/utils';
import { Orb } from './motifs';

const featuredIds = ['food-grocery', 'parcel', 'document', 'express', 'same-day', 'business'];
const market = findDeliveryCategory('market-pickup');

/** Delivery & logistics — market pickup spotlight plus category grid. */
export function DeliverySection() {
  const cats = featuredIds.map((id) => deliveryCategories.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
  return (
    <section aria-labelledby="delivery-title" className="noise relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="grid-lines absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Orb tone="go" className="top-[10%] left-[-10%] size-[520px]" />
        <Orb className="right-[-10%] bottom-[-10%] size-[480px]" />
      </div>
      <div className="container-x">
        <SectionHeading
          dark
          eyebrow="Delivery & logistics"
          title={<span id="delivery-title">From the market stall <span className="text-gradient-go">to your doorstep.</span></span>}
          subtitle="Parcels, documents, groceries and business stock — collected, tracked live and handed over with a delivery code."
          action={<ButtonLink to="/delivery" iconRight={<ArrowRight className="size-4" />}>Schedule a delivery</ButtonLink>}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* Market pickup spotlight */}
          <Reveal>
            <TiltCard max={4} className="h-full rounded-[2rem]">
              <div className="relative flex h-full min-h-[520px] flex-col justify-end overflow-hidden rounded-[2rem] ring-1 ring-white/10">
                <div className="absolute inset-0"><SmartImage src={img(images.market[0].src, 1400)} alt={images.market[0].alt} className="size-full" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/10" />
                <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-go-sheen px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase shadow-glow-go">
                  <ShoppingBasket className="size-3.5" aria-hidden /> Spotlight · Market pickup
                </div>

                {/* mock task card */}
                <div aria-hidden className="absolute top-20 right-5 hidden w-60 animate-float-slow rounded-2xl bg-white p-4 text-ink-900 shadow-lift sm:block">
                  <p className="text-[10px] font-bold tracking-wider text-muted uppercase">Market task · sample</p>
                  <p className="mt-1 font-display font-bold">Eke Awka Market</p>
                  <ul className="mt-3 space-y-2 text-[12px]">
                    <li className="flex items-center gap-2"><Store className="size-3.5 text-brand-600" /> Stall 14B · Foodstuff & provisions</li>
                    <li className="flex items-center gap-2"><CircleCheck className="size-3.5 text-ok" /> Goods paid by customer</li>
                    <li className="flex items-center gap-2"><Search className="size-3.5 text-go-600" /> Rider inspecting items</li>
                    <li className="flex items-center gap-2"><KeyRound className="size-3.5 text-ink-700" /> Handover code ready</li>
                  </ul>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full w-2/3 rounded-full bg-go-sheen" /></div>
                </div>

                <div className="relative p-6 sm:p-9">
                  <h3 className="text-3xl font-bold sm:text-4xl">{market?.name ?? 'Market Pickup'}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">{market?.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <ButtonLink to="/delivery?category=market-pickup" size="lg" iconRight={<ArrowRight className="size-4" />}>Send a rider to the market</ButtonLink>
                    {market && <span className="text-sm text-white/60">from <strong className="font-display text-lg text-white">{naira(market.fromPrice)}</strong> · {market.eta}</span>}
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* Categories */}
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link to={`/delivery?category=${c.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:ring-go-500/40">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-go-300 transition group-hover:bg-go-500 group-hover:text-white"><Icon name={c.icon} className="size-5" /></span>
                    <ArrowUpRight className="size-5 text-white/30 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-go-300" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{c.name}</h3>
                  <p className="mt-1 flex-1 text-[13px] leading-snug text-white/60">{c.short}</p>
                  <p className="mt-4 flex items-center justify-between text-[13px]">
                    <span className="text-white/50">from <span className="font-display font-bold text-white">{naira(c.fromPrice)}</span></span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/75">{c.eta}</span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">
            <SmartImage src={img(images.delivery[2].src, 300)} alt="" className="hidden size-14 shrink-0 rounded-2xl sm:block" />
            <p className="text-[15px] text-white/75"><strong className="text-white">Already sent something?</strong> Follow every stage from pickup to handover.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/track-delivery" variant="glass">Track a delivery</ButtonLink>
            <ButtonLink to="/services/delivery" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">All delivery services</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
