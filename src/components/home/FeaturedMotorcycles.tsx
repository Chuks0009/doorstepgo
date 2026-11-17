import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock, User } from 'lucide-react';
import { ButtonLink, Reveal, SectionHeading, SmartImage } from '@/components/ui';
import { motorcycleTiers } from '@/data/services';
import { img } from '@/data/images';
import { cn, naira } from '@/utils';
import { Orb, SpeedLines } from './motifs';

/** Featured motorcycles — dark, image-led horizontal snap rail. */
export function FeaturedMotorcycles() {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('li');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 20), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="moto-title" className="relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Orb className="top-[-20%] right-[-5%] size-[560px]" />
        <Orb tone="go" className="bottom-[-30%] left-[-10%] size-[460px]" />
        <SpeedLines className="absolute top-24 right-0 w-1/3 opacity-30" count={5} />
      </div>
      <div className="container-x">
        <SectionHeading
          dark
          eyebrow="Featured motorcycles"
          title={<span id="moto-title">Two wheels. <span className="text-gradient-go">Zero traffic stress.</span></span>}
          subtitle="Trained, helmeted riders and five ways to ride — from everyday hops to priority dispatch and business accounts."
          action={
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scroll(-1)} aria-label="Previous motorcycles" className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-go-400 hover:bg-go-500"><ArrowLeft className="size-5" aria-hidden /></button>
              <button type="button" onClick={() => scroll(1)} aria-label="Next motorcycles" className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-go-400 hover:bg-go-500"><ArrowRight className="size-5" aria-hidden /></button>
              <ButtonLink to="/services/motorcycle" variant="glass" className="ml-1">Compare all</ButtonLink>
            </div>
          }
        />
      </div>

      <ul
        ref={rail}
        tabIndex={0}
        aria-label="Motorcycle ride options"
        className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {motorcycleTiers.map((t, i) => (
          <Reveal as="li" key={t.id} delay={Math.min(i, 3) * 0.08} className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[340px]">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white/[0.04] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1.5 hover:bg-white/[0.07] hover:ring-go-500/40">
              <div className="relative h-56 overflow-hidden">
                <SmartImage src={img(t.image, 800)} alt={t.imageAlt} className="size-full" imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                {t.badge && <span className={cn('absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase', t.popular ? 'bg-go-sheen text-white shadow-glow-go' : 'bg-white/90 text-ink-900')}>{t.badge}</span>}
                <span aria-hidden className="absolute top-3 right-4 font-display text-5xl font-extrabold text-white/20">0{i + 1}</span>
              </div>
              <div className="relative -mt-8 flex flex-1 flex-col p-6 pt-0">
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-go-300">{t.tagline}</p>
                <div className="mt-4 flex gap-4 text-[13px] text-white/60">
                  <span className="flex items-center gap-1.5"><Clock className="size-4" aria-hidden /> {t.eta}</span>
                  <span className="flex items-center gap-1.5"><User className="size-4" aria-hidden /> {t.capacityLabel}</span>
                </div>
                <ul className="mt-4 space-y-1.5 text-[13px] text-white/75">
                  {t.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="size-3.5 text-go-400" aria-hidden /> {f}</li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-white/45 uppercase">Starting from</p>
                    <p className="font-display text-2xl font-extrabold">{naira(t.minFare)}</p>
                  </div>
                  <ButtonLink to={`/booking?service=motorcycle&tier=${t.id}`} size="md" aria-label={`Book ${t.name}`} iconRight={<ArrowRight className="size-4" />}>Book</ButtonLink>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
        <li className="flex w-[70vw] max-w-[280px] shrink-0 snap-start">
          <Link to="/services/motorcycle" className="group flex w-full flex-col justify-between rounded-[1.75rem] border border-dashed border-white/20 p-6 transition hover:border-go-400 hover:bg-white/[0.04]">
            <span className="font-display text-2xl font-bold">Not sure which ride fits?</span>
            <span className="flex items-center gap-2 font-semibold text-go-300">Compare motorcycle options <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden /></span>
          </Link>
        </li>
      </ul>
      <p className="container-x text-xs text-white/40">Starting prices are illustrative minimum fares; your estimate is shown before you book.</p>
    </section>
  );
}
