import { useCallback, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, FlaskConical, Pause, Play, Quote } from 'lucide-react';
import { Avatar, Reveal, SectionHeading, Stars } from '@/components/ui';
import { testimonials } from '@/data/content';
import { useInterval, usePrefersReducedMotion } from '@/hooks';
import { cn, formatDate } from '@/utils';

const AUTOPLAY_MS = 6500;
const n = testimonials.length;

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 80, rotate: dir * 2 }),
  center: { opacity: 1, x: 0, rotate: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -80, rotate: dir * -2 }),
};

/** Interactive testimonial slider: buttons, dots, autoplay (pauses on hover/focus), swipe and keyboard. */
export function TestimonialSlider() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduced = usePrefersReducedMotion();
  const paused = hovered || focused || stopped || reduced;

  const go = useCallback((d: number) => setState(([i]) => [(i + d + n) % n, d]), []);
  const goTo = (i: number) => setState(([cur]) => [i, i >= cur ? 1 : -1]);
  useInterval(() => go(1), paused ? null : AUTOPLAY_MS);

  const t = testimonials[index];
  const peek = [1, 2].map((k) => testimonials[(index + k) % n]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  return (
    <section aria-labelledby="reviews-title" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute top-20 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-[120px]" />
      <div className="container-x relative">
        <SectionHeading
          align="center"
          eyebrow="Customer stories"
          title={<span id="reviews-title">Loved on every <span className="text-gradient-go">route.</span></span>}
          subtitle={
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-brand-200 bg-brand-50/70 px-3 py-1 text-[13px] font-medium text-brand-800">
              <FlaskConical className="size-3.5" aria-hidden /> Sample reviews (demo content)
            </span>
          }
        />

        <Reveal className="mt-14">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
            className="mx-auto grid max-w-5xl items-center gap-8 rounded-[2rem] focus-visible:outline-offset-8 lg:grid-cols-[1fr_260px]"
          >
            {/* Stage */}
            <div className="relative min-h-[380px] sm:min-h-[340px]" aria-live={paused ? 'polite' : 'off'}>
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.figure
                  key={t.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${n}`}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={onDragEnd}
                  className="relative cursor-grab touch-pan-y overflow-hidden rounded-[2rem] bg-white p-7 shadow-lift ring-1 ring-line select-none active:cursor-grabbing sm:p-10"
                >
                  <Quote aria-hidden className="absolute top-6 right-7 size-20 fill-go-50 text-go-100 sm:size-28" />
                  <div className="relative flex items-center gap-3">
                    <Stars value={t.rating} size="md" />
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{t.service}</span>
                  </div>
                  <blockquote className="relative mt-6 font-display text-xl leading-snug font-semibold text-pretty text-ink-900 sm:text-2xl">“{t.quote}”</blockquote>
                  <figcaption className="relative mt-8 flex items-center gap-4">
                    <Avatar src={t.avatar} name={t.name} size={56} className="ring-4 ring-go-50" />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{t.name}</p>
                      <p className="text-sm text-muted">{t.location} · <time dateTime={t.date}>{formatDate(t.date)}</time></p>
                    </div>
                    <span className="ml-auto hidden rounded-full border border-dashed border-line-strong px-2.5 py-1 text-[11px] font-semibold text-muted sm:inline">Demo review</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Up next (desktop) */}
            <div className="hidden flex-col gap-3 lg:flex" aria-hidden>
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Up next</p>
              {peek.map((p, k) => (
                <div key={p.id} className={cn('rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-line transition', k === 1 && 'scale-95 opacity-60')}>
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar} name={p.name} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                      <p className="truncate text-xs text-muted">{p.service}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] text-text-2">{p.quote}</p>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-2">
              <div className="flex items-center gap-1.5" role="group" aria-label="Choose a review">
                {testimonials.map((x, i) => (
                  <button key={x.id} type="button" onClick={() => goTo(i)} aria-label={`Show review ${i + 1}: ${x.name}`} aria-current={i === index ? 'true' : undefined} className="grid size-11 place-items-center rounded-full">
                    <span className={cn('relative block h-2 overflow-hidden rounded-full transition-all duration-500', i === index ? 'w-8 bg-go-200' : 'w-2 bg-line-strong hover:bg-muted')}>
                      {i === index && (
                        <motion.span key={`${index}-${paused}`} className="absolute inset-y-0 left-0 rounded-full bg-go-500" initial={{ width: paused ? '100%' : '0%' }} animate={{ width: '100%' }} transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: 'linear' }} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setStopped((s) => !s)} aria-label={stopped ? 'Resume autoplay' : 'Pause autoplay'} aria-pressed={stopped} className="grid size-11 place-items-center rounded-full text-text-2 transition hover:bg-surface-2 hover:text-ink-900">
                  {stopped ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                </button>
                <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="grid size-12 place-items-center rounded-full border border-line-strong bg-white text-ink-900 transition hover:border-go-400 hover:bg-go-500 hover:text-white">
                  <ArrowLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next review" className="grid size-12 place-items-center rounded-full bg-ink-900 text-white transition hover:bg-go-500">
                  <ArrowRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
