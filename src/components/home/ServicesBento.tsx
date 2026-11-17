import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { ButtonLink, Icon, Reveal, SectionHeading, SmartImage, TiltCard } from '@/components/ui';
import { serviceOverview } from '@/data/services';
import { img } from '@/data/images';
import { cn, naira } from '@/utils';

const layout: Record<string, { card: string; image: string; size: 'xl' | 'md' | 'wide' }> = {
  motorcycle: { card: 'lg:col-span-7 lg:row-span-2 min-h-[420px] lg:min-h-[560px]', image: '', size: 'xl' },
  tricycle: { card: 'lg:col-span-5 min-h-[300px]', image: '', size: 'md' },
  shuttle: { card: 'lg:col-span-5 min-h-[300px]', image: '', size: 'md' },
  delivery: { card: 'lg:col-span-12 min-h-[320px]', image: '', size: 'wide' },
};

export function ServicesBento() {
  return (
    <section aria-labelledby="services-title" className="relative pb-24 sm:pb-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our services"
          title={<span id="services-title">Four ways to move. <span className="text-gradient-go">One account.</span></span>}
          subtitle="Whether it's a quick hop through traffic, a family trip or a carton from the market, there's a service built for the job."
          action={<ButtonLink to="/services" variant="outline" iconRight={<ArrowUpRight className="size-4" />}>All services</ButtonLink>}
        />

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-12">
          {serviceOverview.map((s, i) => {
            const l = layout[s.kind];
            return (
              <Reveal key={s.kind} delay={i * 0.07} className={cn('relative', l.card)}>
                <TiltCard max={5} className="size-full rounded-[1.75rem]">
                  <Link to={s.to} className="group relative flex size-full min-h-[inherit] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink-900 text-white shadow-lift ring-1 ring-ink-900/5">
                    <div className="absolute inset-0"><SmartImage src={img(s.img.src, l.size === 'xl' || l.size === 'wide' ? 1400 : 900)} alt={s.img.alt} className="size-full" imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" /></div>
                    <div className={cn('absolute inset-0', l.size === 'wide' ? 'bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10' : 'bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent')} />
                    <span aria-hidden className="absolute top-0 right-0 h-1.5 w-1/3 origin-right scale-x-0 bg-go-sheen transition-transform duration-500 group-hover:scale-x-100" />

                    <div className={cn('relative flex flex-col p-6 sm:p-8', l.size === 'wide' && 'max-w-xl')}>
                      <div className="flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur transition group-hover:bg-go-500 group-hover:ring-go-400"><Icon name={s.icon} className="size-6" /></span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur">{s.short}</span>
                      </div>
                      <h3 className={cn('mt-5 font-bold', l.size === 'xl' ? 'text-3xl sm:text-4xl' : 'text-2xl')}>{s.title}</h3>
                      <p className={cn('mt-2 leading-relaxed text-white/70', l.size === 'md' ? 'text-sm' : 'text-[15px]')}>{s.description}</p>
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <span><span className="text-white/50">From </span><span className="font-display text-lg font-bold">{naira(s.from)}</span></span>
                        <span className="flex items-center gap-1.5 text-white/70"><Clock className="size-4" aria-hidden /> {s.eta}</span>
                        <span className="ml-auto flex items-center gap-1 font-semibold text-go-300">
                          Explore <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">“From” prices are illustrative estimates; your fare is calculated before you book.</p>
      </div>
    </section>
  );
}
