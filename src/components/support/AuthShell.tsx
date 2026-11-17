import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, FlaskConical, Quote } from 'lucide-react';
import { FieldShell, Logo, SmartImage, Stars } from '@/components/ui';
import { images, img } from '@/data/images';
import { testimonials } from '@/data/content';
import { site } from '@/config/site';
import { useInterval, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';

const slides = [
  { image: images.hero[0], headline: 'Beat the traffic.', sub: 'Motorcycle rides that weave through the city — fare shown upfront.', t: testimonials[1] },
  { image: images.delivery[0], headline: 'Doorstep in minutes.', sub: 'Parcels, documents and groceries with live tracking and delivery codes.', t: testimonials[4] },
  { image: images.market[0], headline: 'Your market, delivered.', sub: 'Send a rider to the market stall — collect, shop and drop.', t: testimonials[0] },
  { image: images.tricycle[0], headline: 'Keke, on schedule.', sub: 'Recurring school runs and daily commutes, without the haggling.', t: testimonials[2] },
];

/** Full-screen split layout for /login and /register (outside MainLayout). */
export function AuthShell({ children, switchPrompt, switchTo, switchLabel }: { children: ReactNode; switchPrompt: string; switchTo: string; switchLabel: string }) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  useInterval(() => setI((n) => (n + 1) % slides.length), reduced ? null : 6500);
  const s = slides[i];

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="noise relative isolate hidden overflow-hidden bg-ink-950 text-white lg:flex lg:flex-col" aria-label={`${site.name} highlights`}>
        <AnimatePresence initial={false}>
          <motion.div key={s.image.id} className="absolute inset-0 -z-20" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <SmartImage src={img(s.image.src, 1400)} alt={s.image.alt} eager className="size-full" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/80 to-transparent" aria-hidden />
        <div className="grid-lines absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden />
        <div className="absolute -top-24 -left-24 -z-10 size-96 rounded-full bg-brand-500/30 blur-[120px]" aria-hidden />
        <div className="absolute right-[-10%] bottom-[-10%] -z-10 size-96 rounded-full bg-go-500/25 blur-[120px]" aria-hidden />

        {/* Animated route */}
        <svg viewBox="0 0 600 400" className="pointer-events-none absolute inset-x-0 top-[14%] -z-10 w-full opacity-70" aria-hidden>
          <path d="M -20 320 C 120 300, 160 180, 280 190 S 460 120, 620 60" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="2" strokeDasharray="8 10" className="animate-dash" />
          <path d="M -20 320 C 120 300, 160 180, 280 190 S 460 120, 620 60" fill="none" stroke="#FF6A13" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 900" className="animate-dash" style={{ animationDuration: '3.5s' }} />
          <circle cx="280" cy="190" r="6" fill="#2F7BFF" stroke="white" strokeWidth="2" />
          <circle cx="280" cy="190" r="16" fill="#2F7BFF" opacity="0.25" className="animate-pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        </svg>

        <div className="flex items-center justify-between p-10">
          <Link to="/" aria-label={`${site.name} home`} className="rounded-lg"><Logo tone="light" className="w-44" /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white">
            <ArrowLeft className="size-3.5" aria-hidden /> Back to site
          </Link>
        </div>

        <div className="mt-auto p-10 xl:p-14">
          {/* speed lines */}
          <div className="mb-8 flex flex-col gap-2" aria-hidden>
            {[96, 64, 120].map((w, k) => <span key={k} className="h-[3px] animate-speed rounded-full bg-gradient-to-r from-go-500 to-transparent" style={{ width: w, animationDelay: `${k * 0.3}s` }} />)}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <h2 className="text-4xl leading-[1.05] font-extrabold xl:text-5xl">{s.headline}</h2>
              <p className="mt-3 max-w-md text-lg text-white/70">{s.sub}</p>
              <figure className="glass-dark mt-8 max-w-lg rounded-2xl p-5">
                <Quote className="size-5 text-go-400" aria-hidden />
                <blockquote className="mt-2 text-[15px] leading-relaxed text-white/90">“{s.t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{s.t.name}</span>
                    <span className="text-white/55"> · {s.t.location}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Stars value={s.t.rating} />
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/60 uppercase">Demo</span>
                  </span>
                </figcaption>
              </figure>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex gap-2" role="group" aria-label="Highlights">
            {slides.map((sl, k) => (
              <button key={sl.image.id} type="button" aria-pressed={k === i} aria-label={`Show highlight ${k + 1}: ${sl.headline}`} onClick={() => setI(k)} className="group py-3">
                <span className={cn('block h-1 rounded-full transition-all duration-500', k === i ? 'w-10 bg-go-500' : 'w-5 bg-white/30 group-hover:bg-white/60')} />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main id="main" className="relative flex min-h-dvh flex-col">
        {/* Mobile brand band */}
        <div className="relative isolate overflow-hidden bg-ink-950 px-5 pt-5 pb-10 text-white lg:hidden">
          <div className="bg-ink-radial absolute inset-0 -z-10" aria-hidden />
          <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden />
          <div className="absolute top-1/2 right-0 -z-10 flex w-1/2 flex-col gap-2 opacity-50" aria-hidden>
            {[70, 45, 85].map((w, k) => <span key={k} className="ml-auto h-[3px] animate-speed rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: `${w}%`, animationDelay: `${k * 0.3}s` }} />)}
          </div>
          <div className="flex items-center justify-between">
            <Link to="/" aria-label={`${site.name} home`}><Logo tone="light" className="w-36" /></Link>
            <Link to="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/80"><ArrowLeft className="size-3.5" aria-hidden /> Home</Link>
          </div>
          <p className="mt-6 max-w-xs text-sm text-white/65">{site.tagline}</p>
        </div>

        <div className="-mt-5 flex flex-1 flex-col rounded-t-3xl bg-white lg:mt-0 lg:rounded-none">
          <div className="hidden items-center justify-end gap-2 px-10 pt-8 text-sm text-text-2 lg:flex">
            {switchPrompt}
            <Link to={switchTo} className="rounded-lg px-2 py-1 font-semibold text-brand-700 transition hover:bg-brand-50">{switchLabel}</Link>
          </div>
          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
            <div className="w-full max-w-[440px]">{children}</div>
          </div>
          <footer className="flex flex-col items-center gap-3 border-t border-line px-5 py-5 text-center text-xs text-muted sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <p className="flex items-center gap-1.5"><FlaskConical className="size-3.5 shrink-0 text-brand-600" aria-hidden /> Authentication is a local demo — no real accounts are created.</p>
            <nav aria-label="Legal" className="flex gap-4">
              <Link to="/legal/terms" className="hover:text-ink-900">Terms</Link>
              <Link to="/legal/privacy" className="hover:text-ink-900">Privacy</Link>
              <Link to="/contact" className="hover:text-ink-900">Help</Link>
            </nav>
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ---------- Password field with show/hide ---------- */
export function PasswordField({ label, error, hint, className, ...rest }: { label: string; error?: string; hint?: ReactNode; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={rest.required} className={className}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className="field-input pr-12"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-controls={id}
          className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink-900"
        >
          {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </FieldShell>
  );
}

/** Divider with centered label */
export const OrDivider = ({ label = 'or' }: { label?: string }) => (
  <div className="flex items-center gap-3 text-xs font-semibold tracking-wide text-muted uppercase" role="separator">
    <span className="h-px flex-1 bg-line" /> {label} <span className="h-px flex-1 bg-line" />
  </div>
);

/** Sanitises ?next= to an internal path only. */
export const safeNext = (next: string | null, fallback = '/dashboard') => (next && next.startsWith('/') && !next.startsWith('//') ? next : fallback);

/** Remembered email (per-browser convenience). */
const REMEMBER_KEY = 'dsg.rememberEmail';
export const rememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? '';
  } catch {
    return '';
  }
};
export const setRememberedEmail = (email: string | null) => {
  try {
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* storage unavailable */
  }
};
