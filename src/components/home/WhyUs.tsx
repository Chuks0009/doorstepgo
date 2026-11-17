import { ArrowRight } from 'lucide-react';
import { ButtonLink, Icon, Reveal } from '@/components/ui';
import { whyUs } from '@/data/content';
import { site } from '@/config/site';
import { cn } from '@/utils';

/** Why customers choose us — sticky heading with an asymmetric card stack. */
export function WhyUs() {
  return (
    <section aria-labelledby="why-title" className="relative py-24 sm:py-32">
      <div aria-hidden className="grid-lines-light absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal><span className="eyebrow">Why customers choose us</span></Reveal>
          <Reveal delay={0.05}>
            <h2 id="why-title" className="mt-5 text-3xl leading-[1.1] font-bold text-balance text-ink-900 sm:text-4xl lg:text-[2.75rem]">
              Less waiting. Less haggling. <span className="text-gradient-brand">More moving.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-text-2">
              We designed {site.name} around the frustrations of getting around and sending things in Awka — from waiting at Ifite junctions to losing an afternoon at Eke Awka — and removed them one by one.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/about" variant="ink" iconRight={<ArrowRight className="size-4" />}>Our story</ButtonLink>
            <ButtonLink to="/customers" variant="outline">Who we serve</ButtonLink>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {whyUs.map((w, i) => {
            const feature = i === 0;
            return (
              <Reveal key={w.title} delay={(i % 2) * 0.08} className={cn(feature && 'sm:col-span-2', i % 2 === 0 && !feature && 'sm:mt-8 sm:-mb-8')}>
                <div
                  className={cn(
                    'group relative h-full overflow-hidden rounded-3xl p-6 transition duration-500 hover:-translate-y-1 sm:p-7',
                    feature ? 'bg-go-sheen text-white shadow-glow-go' : 'border border-line bg-white shadow-soft hover:shadow-lift',
                  )}
                >
                  {feature && <div aria-hidden className="absolute -right-10 -bottom-16 h-56 w-40 -skew-x-[24deg] bg-white/10" />}
                  <div className={cn('relative flex gap-5', feature ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
                    <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110', feature ? 'bg-white text-go-600' : 'bg-brand-50 text-brand-700 group-hover:bg-ink-900 group-hover:text-white')}>
                      <Icon name={w.icon} className="size-6" />
                    </span>
                    <div>
                      <h3 className={cn('font-bold', feature ? 'text-2xl' : 'text-lg text-ink-900')}>{w.title}</h3>
                      <p className={cn('mt-1.5 leading-relaxed', feature ? 'text-white/85' : 'text-[15px] text-text-2')}>{w.body}</p>
                    </div>
                  </div>
                  <span aria-hidden className={cn('absolute top-5 right-6 font-display text-5xl font-extrabold', feature ? 'text-white/15' : 'text-surface-2')}>0{i + 1}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
