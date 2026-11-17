import { useMemo, useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { BadgeCheck, Clock, Navigation, Radio, ShieldCheck, Zap } from 'lucide-react';
import { Avatar, Logo, SmartImage, Stars } from '@/components/ui';
import { images, img } from '@/data/images';
import { estimateRide } from '@/services/pricingService';
import { junctionLabel } from '@/config/locations';
import { usePrefersReducedMotion } from '@/hooks';
import { naira } from '@/utils';
import { PulsePin } from './motifs';

const ROUTE = 'M34 168 C 70 160, 86 120, 120 118 S 170 128, 196 92 S 244 44, 274 34';
const PICKUP = { cityId: 'awka', junctionId: 'miracle-jn' };
const DROPOFF = { cityId: 'awka', junctionId: 'unizik-main-gate' };

/**
 * 3D-inspired, layered transportation illustration for the hero:
 * a live "trip" card with an animated route, floating rider photo cards
 * and status chips. Tilts with the pointer and drifts with scroll.
 */
export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);
  const shiftX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const shiftY = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  const { scrollY } = useScroll();
  const yBack = useTransform(scrollY, [0, 700], [0, 70]);
  const yMid = useTransform(scrollY, [0, 700], [0, -30]);
  const yFront = useTransform(scrollY, [0, 700], [0, -90]);

  const fare = useMemo(() => estimateRide({ tierId: 'moto-express', pickup: PICKUP, dropoff: DROPOFF, time: '12:00' }), []);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative mx-auto h-[440px] w-full max-w-[600px] sm:h-[540px] lg:h-[600px]" style={{ perspective: 1400 }} aria-hidden>
      <motion.div style={{ rotateX, rotateY }} className="preserve-3d absolute inset-0">
        {/* glow floor */}
        <div className="absolute inset-x-[10%] bottom-0 h-24 rounded-[100%] bg-brand-500/30 blur-3xl" />

        {/* Back layer — hero photo */}
        <motion.div style={{ y: yBack, z: -60 }} className="absolute top-2 right-0 h-[64%] w-[76%] sm:w-[70%]">
          <div className="relative size-full overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/15">
            <SmartImage src={img(images.hero[0].src, 1000)} alt="" eager className="size-full" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/90 via-ink-950/20 to-transparent" />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-ink-950/60 px-3 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur">
              <Radio className="size-3.5 text-go-400" /> On the road
            </div>
            <div className="absolute bottom-4 left-5 hidden sm:block">
              <p className="font-display text-lg font-bold text-white">Express Motorcycle</p>
              <p className="text-xs text-white/70">Priority matching · 2–4 min away</p>
            </div>
          </div>
          {/* speed slashes hugging the photo */}
          <div className="absolute top-[18%] -left-8 hidden flex-col gap-2 sm:flex">
            {[56, 80, 40].map((w, i) => (
              <span key={i} className="h-1.5 -skew-x-[24deg] animate-speed rounded-full bg-go-500" style={{ width: w, animationDelay: `${i * 0.25}s` }} />
            ))}
          </div>
        </motion.div>

        {/* Floating courier photo */}
        <motion.div style={{ x: shiftX, y: yMid, z: 30 }} className="absolute top-[4%] left-[2%] w-[34%] sm:top-[8%] sm:w-[30%]">
          <div className="animate-float-slow overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift">
            <SmartImage src={img(images.delivery[1].src, 500)} alt="" className="aspect-[4/3] rounded-xl" />
            <div className="flex items-center justify-between gap-1 px-1.5 pt-1.5 pb-0.5">
              <span className="truncate text-[11px] font-bold text-ink-900">Parcel · Same day</span>
              <span className="size-2 shrink-0 rounded-full bg-ok" />
            </div>
          </div>
        </motion.div>

        {/* Middle layer — live trip card ("phone") */}
        <motion.div style={{ y: yMid, z: 70 }} className="absolute bottom-3 left-[3%] w-[70%] sm:bottom-6 sm:left-[6%] sm:w-[62%]">
          <div className="glass-dark overflow-hidden rounded-[1.75rem] bg-ink-900/80 p-3 shadow-[0_50px_90px_-30px_rgb(5_11_34/0.95)] ring-1 ring-white/10 sm:p-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Logo variant="mark" className="w-6" />
                <span className="text-[12px] font-semibold text-white">Trip in progress</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-ok/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
              </span>
            </div>

            <div className="relative mt-3 overflow-hidden rounded-2xl bg-ink-950 ring-1 ring-white/10">
              <div className="grid-lines absolute inset-0 opacity-70" />
              <svg viewBox="0 0 300 190" className="relative block h-36 w-full sm:h-44">
                <defs>
                  <linearGradient id="hv-route" x1="0" x2="1">
                    <stop offset="0" stopColor="#2f7bff" />
                    <stop offset="1" stopColor="#ff6a13" />
                  </linearGradient>
                </defs>
                {/* faux streets */}
                <path d="M0 140 L300 60 M60 0 L120 190 M180 0 L230 190 M0 70 L300 120" stroke="rgb(255 255 255 / 0.07)" strokeWidth="10" fill="none" />
                <path d={ROUTE} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" strokeLinecap="round" />
                <path d={ROUTE} fill="none" stroke="url(#hv-route)" strokeWidth="4" strokeLinecap="round" />
                <path d={ROUTE} fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.6" strokeDasharray="4 14" strokeLinecap="round" className="animate-dash" />
                <circle cx="34" cy="168" r="7" fill="#2f7bff" stroke="white" strokeWidth="3" />
                <circle cx="274" cy="34" r="7" fill="#ff6a13" stroke="white" strokeWidth="3" />
                <g>
                  <circle r="10" fill="#ff6a13" fillOpacity="0.25" cx={reduced ? 196 : 0} cy={reduced ? 92 : 0}>
                    {!reduced && <animateMotion dur="6s" repeatCount="indefinite" path={ROUTE} />}
                  </circle>
                  <circle r="5" fill="white" stroke="#ff6a13" strokeWidth="3" cx={reduced ? 196 : 0} cy={reduced ? 92 : 0}>
                    {!reduced && <animateMotion dur="6s" repeatCount="indefinite" path={ROUTE} />}
                  </circle>
                </g>
              </svg>
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-ink-900 shadow">
                <Clock className="size-3 text-go-600" /> {fare ? `${fare.durationMin} min · ${fare.distanceKm} km` : 'En route'}
              </div>
            </div>

            <div className="mt-3 space-y-2 px-1">
              <div className="flex items-center gap-2.5 text-[12px] text-white/80">
                <PulsePin size={10} />
                <span className="truncate">{junctionLabel(PICKUP.cityId, PICKUP.junctionId)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px] text-white/80">
                <PulsePin tone="go" size={10} />
                <span className="truncate">{junctionLabel(DROPOFF.cityId, DROPOFF.junctionId)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/10">
              <Avatar name="Musa A" size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-white">Musa · Express rider</p>
                <Stars value={5} className="[&_svg]:size-2.5" />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold tracking-wider text-white/50 uppercase">Estimate</p>
                <p className="font-display text-sm font-bold text-white">{fare ? naira(fare.total) : naira(1300)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Front layer — chips & small photo */}
        <motion.div style={{ x: shiftX, y: yFront, z: 120 }} className="absolute top-[40%] right-[1%] sm:top-[46%]">
          <div className="animate-float flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-lift">
            <span className="grid size-8 place-items-center rounded-xl bg-go-500 text-white"><Navigation className="size-4" /></span>
            <span>
              <span className="block text-[11px] font-medium text-muted">Rider arriving</span>
              <span className="block font-display text-sm font-bold text-ink-900">in 4 min</span>
            </span>
          </div>
        </motion.div>

        <motion.div style={{ x: shiftX, y: shiftY, z: 140 }} className="absolute right-[3%] bottom-[2%] w-[30%] sm:right-[2%] sm:bottom-[6%] sm:w-[28%]">
          <div className="relative animate-float-slow overflow-hidden rounded-2xl bg-ink-900 shadow-lift ring-1 ring-white/15" style={{ animationDelay: '1.2s' }}>
            <SmartImage src={img(images.motorcycle[5].src, 500)} alt="" className="aspect-square" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-ink-950 to-transparent p-2 pt-6">
              <Zap className="size-3 text-go-400" />
              <span className="text-[10px] font-bold text-white">2–4 min</span>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ y: yFront, z: 100 }} className="absolute top-[30%] left-0 hidden sm:block">
          <div className="animate-float flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/80 py-1.5 pr-3.5 pl-1.5 text-white shadow-lift backdrop-blur" style={{ animationDelay: '0.6s' }}>
            <span className="grid size-7 place-items-center rounded-full bg-ok"><BadgeCheck className="size-4" /></span>
            <span className="text-[12px] font-semibold">Delivery code matched</span>
          </div>
        </motion.div>

        <motion.div style={{ y: yMid, z: 90 }} className="absolute top-[2%] right-[40%] hidden lg:block">
          <div className="animate-float-slow flex items-center gap-1.5 rounded-full bg-brand-sheen px-3 py-1.5 text-[11px] font-bold text-white shadow-glow-brand" style={{ animationDelay: '2s' }}>
            <ShieldCheck className="size-3.5" /> Trip shared with 2 contacts
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
