import { ArrowRight, FileText, Mail, Package } from 'lucide-react';
import { ButtonLink, Reveal, SmartImage } from '@/components/ui';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { images, img } from '@/data/images';
import { site } from '@/config/site';
import { SpeedLines } from './motifs';

/** Newsletter signup band. */
export function NewsletterBand() {
  return (
    <section aria-labelledby="news-title" className="py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-10 lg:p-12">
            <div aria-hidden className="grid-lines-light absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_60%)]" />
            <div aria-hidden className="absolute -top-20 -right-20 size-72 rounded-full bg-go-100 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div className="flex gap-5">
                <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-brand-sheen text-white shadow-glow-brand sm:grid"><Mail className="size-6" aria-hidden /></span>
                <div>
                  <h2 id="news-title" className="text-2xl font-bold text-ink-900 sm:text-3xl">Get the good routes first.</h2>
                  <p className="mt-2 text-text-2">New Awka areas, student promos and product updates from {site.name} — about once a month. No spam, unsubscribe anytime.</p>
                </div>
              </div>
              <NewsletterForm dark={false} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Final call-to-action band. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="pb-24 sm:pb-28">
      <div className="container-x">
        <div className="noise relative isolate overflow-hidden rounded-[2.5rem] bg-ink-950 px-6 py-16 text-white sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div aria-hidden className="absolute inset-0 -z-20 opacity-50"><SmartImage src={img(images.hero[1].src, 1800)} alt="" className="size-full" /></div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
          <div aria-hidden className="absolute -top-24 right-[20%] -z-10 size-96 rounded-full bg-go-500/30 blur-[100px]" />
          <SpeedLines className="absolute top-1/2 right-0 w-1/3 -translate-y-1/2 opacity-50" count={5} />
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow-dark">Ready when you are</span></Reveal>
            <Reveal delay={0.05}>
              <h2 id="cta-title" className="mt-5 text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-6xl">
                Your doorstep is <span className="text-gradient-go">the starting line.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg text-white/70">Book a ride, send a package or plan your business logistics in minutes. We'll take it from there.</p>
            </Reveal>
            <Reveal delay={0.15} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink to="/booking" size="xl" iconRight={<ArrowRight className="size-5" />}>Book a Ride</ButtonLink>
              <ButtonLink to="/delivery" size="xl" variant="white" iconLeft={<Package className="size-5" />}>Schedule a Delivery</ButtonLink>
              <ButtonLink to="/request-quote" size="xl" variant="glass" iconLeft={<FileText className="size-5" />}>Request a Quote</ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
