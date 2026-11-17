import { ArrowUpRight, Building2, Navigation, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal, SmartImage } from '@/components/ui';
import { images, img } from '@/data/images';
import { DEFAULT_CITY, findCity } from '@/config/locations';
import { site } from '@/config/site';
import { RouteDivider } from './motifs';

const pillars = [
  { Icon: Navigation, title: 'Ride', body: 'Motorcycles, kekes and shuttles at your doorstep.', to: '/booking', cta: 'Book a ride' },
  { Icon: Package, title: 'Send', body: 'Parcels, documents and market goods, tracked live.', to: '/delivery', cta: 'Send a package' },
  { Icon: Building2, title: 'Grow', body: 'Logistics and staff transport for businesses.', to: '/customers/merchants', cta: 'For merchants' },
];

export function WelcomeSection() {
  const awka = findCity(DEFAULT_CITY);
  const areas = awka?.areas ?? [];
  return (
    <section aria-labelledby="welcome-title" className="relative overflow-hidden py-20 sm:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <Reveal><span className="eyebrow">Welcome to {site.name}</span></Reveal>
          <Reveal delay={0.05}>
            <h2 id="welcome-title" className="mt-5 text-3xl leading-[1.12] font-bold text-balance text-ink-900 sm:text-4xl lg:text-[2.9rem]">
              The everyday way to <span className="slash-go relative z-0">move</span> around Awka — and get things moved <span className="text-gradient-brand">for you.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-text-2">
              {site.name} brings motorcycles, tricycles, shuttles and doorstep delivery into one simple booking experience. Pick a service, see an upfront estimate and follow every step until you — or your package — arrive.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {pillars.map(({ Icon, title, body, to, cta }, i) => (
              <Reveal key={title} delay={0.12 + i * 0.06}>
                <Link to={to} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-1 hover:border-go-200 hover:shadow-lift">
                  <span className="grid size-10 place-items-center rounded-xl bg-ink-900 text-white transition group-hover:bg-go-500"><Icon className="size-5" aria-hidden /></span>
                  <span className="mt-4 font-display text-lg font-bold text-ink-900">{title}</span>
                  <span className="mt-1 flex-1 text-[13px] leading-snug text-text-2">{body}</span>
                  <span className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-brand-700">{cta} <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Collage */}
        <div className="relative mx-auto h-[420px] w-full max-w-xl sm:h-[520px]">
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="absolute top-0 right-0 h-[78%] w-[82%] overflow-hidden rounded-[2rem] shadow-lift">
            <SmartImage src={img(images.tricycle[1].src, 1100)} alt={images.tricycle[1].alt} className="size-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40, rotate: -4 }} whileInView={{ opacity: 1, y: 0, rotate: -3 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="absolute bottom-0 left-0 w-[52%] overflow-hidden rounded-3xl border-[6px] border-canvas shadow-lift">
            <SmartImage src={img(images.motorcycle[6].src, 700)} alt={images.motorcycle[6].alt} className="aspect-[4/3]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.35 }} className="absolute right-4 bottom-6 w-56 rounded-2xl bg-ink-900 p-4 text-white shadow-lift sm:right-8">
            <p className="text-[11px] font-bold tracking-[0.14em] text-go-300 uppercase">Coverage</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{areas.length} areas</p>
            <p className="mt-1 text-xs text-white/60">Live in {site.market.city} · {site.market.focus} & {site.market.campusShort} first</p>
            <div className="mt-3 flex h-1.5 gap-1">
              {areas.map((a) => <span key={a.id} className={a.id === 'ifite' || a.id === 'unizik' ? 'flex-[2] rounded-full bg-go-500' : 'flex-1 rounded-full bg-go-500/45'} />)}
            </div>
          </motion.div>
          <div aria-hidden className="absolute top-8 -left-4 hidden size-24 rounded-full border-[10px] border-go-500/20 sm:block" />
        </div>
      </div>
      <RouteDivider className="mt-20 opacity-70" />
    </section>
  );
}
