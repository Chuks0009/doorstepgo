import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ArrowUpRight, Building2, Plane, Snowflake, Users } from 'lucide-react';
import { ButtonLink, Reveal, SmartImage } from '@/components/ui';
import { shuttleTiers } from '@/data/services';
import { images, img } from '@/data/images';
import { naira } from '@/utils';

const perks = [
  { Icon: Snowflake, label: 'Air-conditioned vans' },
  { Icon: Plane, label: 'Flight-tracked airport runs' },
  { Icon: Building2, label: 'Corporate contracts' },
  { Icon: Users, label: '7 to 60+ seats' },
];

/** Shuttle transportation — cinematic parallax banner with tier chips. */
export function ShuttleSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section aria-labelledby="shuttle-title" className="pb-24 sm:pb-32">
      <div className="container-x">
        <div ref={ref} className="relative isolate overflow-hidden rounded-[2.25rem] bg-ink-950 text-white shadow-lift">
          <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0 -z-10">
            <SmartImage src={img(images.shuttle[4].src, 1800)} alt={images.shuttle[4].alt} className="size-full" />
          </motion.div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/20" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />

          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-14">
            <div className="max-w-xl">
              <Reveal><span className="eyebrow-dark">Shuttle transportation</span></Reveal>
              <Reveal delay={0.05}>
                <h2 id="shuttle-title" className="mt-5 text-3xl leading-[1.1] font-bold text-balance sm:text-5xl">Move the whole group — <span className="text-gradient-go">comfortably.</span></h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 text-lg leading-relaxed text-white/75">Private and shared shuttles, staff buses, airport pickups, event fleets and intercity travel — with professional drivers and planned schedules.</p>
              </Reveal>
              <Reveal delay={0.15} className="mt-7 grid grid-cols-2 gap-3">
                {perks.map(({ Icon, label }) => (
                  <span key={label} className="flex items-center gap-2.5 text-sm text-white/85">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur"><Icon className="size-4 text-go-300" aria-hidden /></span>
                    {label}
                  </span>
                ))}
              </Reveal>
              <Reveal delay={0.2} className="mt-9 flex flex-wrap gap-3">
                <ButtonLink to="/booking?service=shuttle" size="lg" iconRight={<ArrowRight className="size-4" />}>Book a shuttle</ButtonLink>
                <ButtonLink to="/request-quote" size="lg" variant="glass">Get a group quote</ButtonLink>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="self-end">
              <div className="glass-dark rounded-3xl bg-ink-950/50 p-3">
                <p className="px-3 pt-2 pb-3 text-[11px] font-bold tracking-[0.14em] text-white/50 uppercase">Choose your shuttle</p>
                <ul className="space-y-1">
                  {shuttleTiers.map((t) => (
                    <li key={t.id}>
                      <Link to={`/booking?service=shuttle&tier=${t.id}`} className="group flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-white/10">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold">{t.name}</span>
                          <span className="block truncate text-xs text-white/55">{t.capacityLabel} · {t.eta}</span>
                        </span>
                        <span className="text-right text-xs text-white/50">from <span className="block font-display text-sm font-bold text-white">{naira(t.minFare)}</span></span>
                        <ArrowUpRight className="size-4 shrink-0 text-go-300 opacity-60 transition group-hover:opacity-100" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/services/shuttle" className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-semibold transition hover:bg-white/20">
                  Explore shuttle services <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
