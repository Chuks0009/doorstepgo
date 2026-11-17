import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Users } from 'lucide-react';
import { ButtonLink, Reveal, SectionHeading, SmartImage } from '@/components/ui';
import { tricycleTiers } from '@/data/services';
import { img } from '@/data/images';
import { cn, naira } from '@/utils';

/** Featured tricycles — interactive selector with a large crossfading showcase. */
export function FeaturedTricycles() {
  const [active, setActive] = useState(0);
  const t = tricycleTiers[active];

  const onKey = (e: React.KeyboardEvent) => {
    const n = tricycleTiers.length;
    let next = active;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (active + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (active - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`tri-tab-${tricycleTiers[next].id}`)?.focus();
  };

  return (
    <section aria-labelledby="tri-title" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-go-50 to-transparent" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Featured tricycles"
          title={<span id="tri-title">The keke, <span className="text-gradient-brand">reimagined.</span></span>}
          subtitle="Covered comfort for up to three, cargo-ready loads, convoys for the whole crew and scheduled school runs."
          action={<ButtonLink to="/services/tricycle" variant="outline" iconRight={<ArrowRight className="size-4" />}>Tricycle services</ButtonLink>}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-8">
          <div role="tablist" aria-label="Tricycle options" aria-orientation="vertical" onKeyDown={onKey} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {tricycleTiers.map((x, i) => {
              const on = i === active;
              return (
                <button
                  key={x.id}
                  id={`tri-tab-${x.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="tri-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn('group relative flex min-w-[220px] shrink-0 items-center gap-4 rounded-2xl border p-3 text-left transition lg:min-w-0', on ? 'border-transparent bg-ink-900 text-white shadow-lift' : 'border-line bg-white hover:border-brand-300 hover:shadow-soft')}
                >
                  <SmartImage src={img(x.image, 200)} alt="" className="size-14 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{x.name}</span>
                    <span className={cn('block truncate text-[13px]', on ? 'text-white/60' : 'text-muted')}>{x.tagline}</span>
                  </span>
                  <span className={cn('hidden font-display text-sm font-bold sm:block', on ? 'text-go-300' : 'text-ink-700')}>{naira(x.minFare)}</span>
                  {on && <motion.span layoutId="tri-indicator" className="absolute top-3 bottom-3 -left-px w-1 rounded-full bg-go-500" />}
                </button>
              );
            })}
          </div>

          <Reveal>
            <div id="tri-panel" role="tabpanel" aria-labelledby={`tri-tab-${t.id}`} className="relative min-h-[540px] overflow-hidden rounded-[2rem] bg-ink-900 text-white shadow-lift">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={t.id} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
                  <SmartImage src={img(t.image, 1400)} alt={t.imageAlt} className="size-full" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/0" />
              <div aria-hidden className="absolute top-6 right-6 flex h-10 gap-1.5">
                <span className="w-2.5 -skew-x-[24deg] rounded-sm bg-go-500" />
                <span className="w-2.5 -skew-x-[24deg] rounded-sm bg-go-500/60" />
                <span className="w-2.5 -skew-x-[24deg] rounded-sm bg-go-500/30" />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={t.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                  {t.badge && <span className="rounded-full bg-go-sheen px-3 py-1 text-[11px] font-bold tracking-wider uppercase">{t.badge}</span>}
                  <h3 className="mt-4 text-3xl font-bold sm:text-4xl">{t.name}</h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/75">{t.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] backdrop-blur"><Users className="size-4" aria-hidden /> {t.capacityLabel}</span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] backdrop-blur"><Clock className="size-4" aria-hidden /> {t.eta}</span>
                    {t.features.slice(0, 2).map((f) => (
                      <span key={f} className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] backdrop-blur sm:flex"><Check className="size-4 text-go-400" aria-hidden /> {f}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <p>
                      <span className="block text-[11px] font-bold tracking-wider text-white/50 uppercase">Starting from</span>
                      <span className="font-display text-3xl font-extrabold">{naira(t.minFare)}</span>
                    </p>
                    <ButtonLink to={`/booking?service=tricycle&tier=${t.id}`} size="lg" iconRight={<ArrowRight className="size-4" />}>Book {t.name}</ButtonLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
