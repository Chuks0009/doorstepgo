import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, FileText, Headset, MapPinned, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { ButtonLink, SmartImage } from '@/components/ui';
import { images, img } from '@/data/images';
import { site } from '@/config/site';
import { HeroVisual } from './HeroVisual';
import { Orb, SpeedLines } from './motifs';

const lines = [
  { text: 'Moving People.', className: 'text-white' },
  { text: 'Connecting Places.', className: 'bg-gradient-to-r from-brand-300 via-brand-400 to-[#7fb6ff] bg-clip-text text-transparent' },
  { text: 'Delivering Possibilities.', className: 'text-gradient-go' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 160]);
  const textY = useTransform(scrollY, [0, 600], [0, 60]);
  const fade = useTransform(scrollY, [0, 500], [1, 0.35]);

  return (
    <section aria-labelledby="hero-title" className="noise relative isolate overflow-hidden bg-ink-950 text-white">
      {/* Backdrop */}
      <motion.div style={{ y: bgY }} aria-hidden className="absolute inset-0 -z-20 opacity-25 mix-blend-luminosity">
        <SmartImage src={img(images.city[2].src, 1800)} alt="" eager className="size-full" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_80%_-10%,rgb(47_123_255/0.38),transparent_60%),radial-gradient(800px_500px_at_-10%_100%,rgb(255_106_19/0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/60 to-ink-950" />
        <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_30%,black,transparent_75%)]" />
        <Orb className="top-[-10%] right-[5%] size-[520px]" />
        <Orb tone="go" className="bottom-[-15%] left-[10%] size-[420px]" />
        {/* giant ghost "Go" speed slash */}
        <div className="absolute top-[12%] -left-24 hidden h-[70%] w-[38%] -skew-x-[24deg] bg-gradient-to-b from-white/[0.04] to-transparent lg:block" />
        <SpeedLines className="absolute top-[34%] left-0 w-[30%] opacity-30" side="left" />
      </div>

      <div className="container-x relative pt-[calc(72px+2.5rem)] pb-44 sm:pt-[calc(72px+3.5rem)] sm:pb-48 lg:pt-[calc(72px+4rem)] lg:pb-56">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-6">
          <motion.div style={{ y: textY, opacity: fade }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="flex flex-wrap items-center gap-2">
              <span className="eyebrow-dark">
                <Sparkles className="size-3.5" aria-hidden /> Rides · Shuttles · Deliveries
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" /><span className="relative size-2 rounded-full bg-emerald-400" /></span>
                Now live in {site.market.city} · Ifite · {site.market.campusShort}
              </span>
            </motion.div>

            <h1 id="hero-title" className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-[4.1rem] xl:text-7xl">
              {lines.map((l, i) => (
                <span key={l.text} className="block overflow-hidden pb-1">
                  <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }} className={`block ${l.className}`}>
                    {l.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease }} className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-white/70 sm:text-lg">
              <strong className="font-semibold text-white">{site.shortPitch}</strong> Book a ride, schedule a pickup or get your goods delivered right to your doorstep with convenience, reliability and confidence.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.62, ease }} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink to="/booking" size="lg" iconRight={<ArrowRight className="size-4" />}>Book a Ride</ButtonLink>
              <ButtonLink to="/delivery" size="lg" variant="glass" iconLeft={<Package className="size-4" />}>Schedule a Delivery</ButtonLink>
              <ButtonLink to="/request-quote" size="lg" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" iconLeft={<FileText className="size-4" />}>Request a Quote</ButtonLink>
            </motion.div>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-medium text-white/60">
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-go-400" aria-hidden /> Trip sharing on every ride</li>
              <li className="flex items-center gap-2"><MapPinned className="size-4 text-go-400" aria-hidden /> Upfront fare estimates</li>
              <li className="flex items-center gap-2"><Headset className="size-4 text-go-400" aria-hidden /> Human support on WhatsApp</li>
            </motion.ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.25, ease }}>
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* diagonal base */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-canvas [clip-path:polygon(0_70%,100%_0,100%_100%,0_100%)] sm:h-32" />
    </section>
  );
}
