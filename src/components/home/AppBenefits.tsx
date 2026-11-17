import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bell, Bookmark, Gift, History, Package, Share2, Wallet } from 'lucide-react';
import { ButtonLink, Logo, Reveal, SmartImage } from '@/components/ui';
import { images, img } from '@/data/images';
import { useInterval, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';
import { Orb } from './motifs';

const benefits = [
  { Icon: Bell, title: 'Live notifications', body: 'Rider assigned, arriving, delivered — every step, as it happens.' },
  { Icon: Share2, title: 'Trip sharing', body: 'Send a live link so loved ones can follow your journey.' },
  { Icon: Bookmark, title: 'Saved places', body: 'Home, office, favourite market — rebook in one tap.' },
  { Icon: Wallet, title: 'Wallet & receipts', body: 'Itemised receipts and a wallet for quicker checkout (coming soon).' },
  { Icon: Gift, title: 'Rewards', body: 'Earn points on every trip and unlock referral bonuses.' },
  { Icon: History, title: 'One history', body: 'Rides, shuttles and deliveries together in your dashboard.' },
];

const notes = [
  { Icon: Package, tone: 'bg-go-500', title: 'Package collected', body: 'Rider has your parcel · ETA 25 min', time: 'now' },
  { Icon: Bell, tone: 'bg-brand-500', title: 'Rider arriving', body: 'Musa is 2 min away at Allen Junction', time: '2m' },
  { Icon: Share2, tone: 'bg-ok', title: 'Trip shared', body: 'Mum can now follow your ride live', time: '6m' },
  { Icon: Gift, tone: 'bg-amber-glow', title: '+120 reward points', body: 'Thanks for riding with us', time: '1h' },
];

/** App/platform benefits — animated notification stack on a phone. */
export function AppBenefits() {
  const [offset, setOffset] = useState(0);
  const reduced = usePrefersReducedMotion();
  useInterval(() => setOffset((o) => (o + 1) % notes.length), reduced ? null : 2800);
  const visible = [0, 1, 2].map((k) => notes[(offset + k) % notes.length]);

  return (
    <section aria-labelledby="app-title" className="noise relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="grid-lines absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_30%_50%,black,transparent_70%)]" />
        <Orb className="top-[10%] left-[5%] size-[520px]" />
        <Orb tone="go" className="right-[10%] bottom-[-20%] size-[420px]" />
      </div>
      <div className="container-x grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Phone */}
        <Reveal className="relative mx-auto w-full max-w-[420px]">
          <div className="absolute top-10 -left-4 h-72 w-48 overflow-hidden rounded-3xl opacity-80 shadow-lift ring-1 ring-white/10 sm:-left-10">
            <SmartImage src={img(images.people[0].src, 600)} alt={images.people[0].alt} className="size-full" />
          </div>
          <div aria-hidden className="relative ml-auto w-[270px] rounded-[2.8rem] bg-gradient-to-b from-ink-700 to-ink-900 p-2.5 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15 sm:w-[290px]">
            <div className="relative h-[540px] overflow-hidden rounded-[2.3rem] bg-gradient-to-b from-ink-800 to-ink-950">
              <div className="absolute top-2 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="px-5 pt-14 text-center">
                <p className="font-display text-5xl font-bold tracking-tight">09:41</p>
                <p className="mt-1 text-sm text-white/60">Tuesday, 17 November</p>
              </div>
              <div className="mt-8 space-y-2.5 px-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((n, k) => (
                    <motion.div
                      key={n.title}
                      layout
                      initial={{ opacity: 0, y: -30, scale: 0.9 }}
                      animate={{ opacity: k === 2 ? 0.55 : 1, y: 0, scale: k === 2 ? 0.95 : 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                      className="flex items-start gap-3 rounded-2xl bg-white/12 p-3 backdrop-blur-xl ring-1 ring-white/10"
                    >
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl text-white', n.tone)}><n.Icon className="size-4.5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold">{n.title}</span><span className="text-[10px] text-white/50">{n.time}</span></span>
                        <span className="block truncate text-[12px] text-white/65">{n.body}</span>
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3">
                <Logo variant="mark" className="w-9 opacity-90" />
                <span className="h-1 w-28 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute top-1/2 -right-6 -z-10 h-48 w-20 -translate-y-1/2 -skew-x-[24deg] bg-go-sheen" />
        </Reveal>

        <div>
          <Reveal><span className="eyebrow-dark">Platform benefits</span></Reveal>
          <Reveal delay={0.05}>
            <h2 id="app-title" className="mt-5 text-3xl leading-[1.1] font-bold text-balance sm:text-4xl lg:text-[2.75rem]">Everything you move, <span className="text-gradient-go">in your pocket.</span></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-white/65">Create a free account to unlock live updates, saved places, rewards and a single history for every ride and delivery.</p>
          </Reveal>
          <ul className="mt-10 grid gap-x-6 gap-y-7 sm:grid-cols-2">
            {benefits.map(({ Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={0.1 + i * 0.05} className="group flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-go-300 ring-1 ring-white/10 transition group-hover:bg-go-500 group-hover:text-white"><Icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-white/60">{body}</span>
                </span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.4} className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/register" size="lg" iconRight={<ArrowRight className="size-4" />}>Create free account</ButtonLink>
            <ButtonLink to="/dashboard" size="lg" variant="glass">Open my dashboard</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
