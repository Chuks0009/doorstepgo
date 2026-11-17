import { motion } from 'framer-motion';
import { Icon, Reveal, SectionHeading } from '@/components/ui';
import { howItWorks } from '@/data/content';
import { Orb } from './motifs';

/** "How the platform works" — four steps joined by a drawn route line. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="noise relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
        <Orb className="top-[-20%] left-[30%] size-[520px]" />
        <Orb tone="go" className="right-[-10%] bottom-[-30%] size-[420px]" />
      </div>
      <div className="container-x">
        <SectionHeading
          dark
          align="center"
          eyebrow="How the platform works"
          title={<span id="how-title">From tap to doorstep in <span className="text-gradient-go">four moves</span></span>}
          subtitle="The same simple flow powers every ride, shuttle and delivery — so once you've booked one, you've booked them all."
        />

        <div className="relative mt-16">
          {/* desktop connector */}
          <svg aria-hidden viewBox="0 0 1000 60" preserveAspectRatio="none" className="absolute top-[38px] left-[12%] hidden h-14 w-[76%] lg:block">
            <path d="M0 30 C 160 -10, 340 70, 500 30 S 840 -10, 1000 30" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
            <motion.path
              d="M0 30 C 160 -10, 340 70, 500 30 S 840 -10, 1000 30"
              fill="none"
              stroke="url(#how-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="how-grad" x1="0" x2="1">
                <stop offset="0" stopColor="#2f7bff" />
                <stop offset="1" stopColor="#ff6a13" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {howItWorks.map((s, i) => (
              <Reveal as="li" key={s.step} delay={0.15 + i * 0.12} className="group relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
                {/* mobile connector */}
                {i < howItWorks.length - 1 && <span aria-hidden className="absolute top-20 bottom-[-2.5rem] left-[39px] w-px bg-gradient-to-b from-brand-500/60 to-go-500/40 sm:hidden" />}
                <div className="relative shrink-0">
                  <span className="relative grid size-20 place-items-center rounded-[1.6rem] bg-gradient-to-br from-ink-700 to-ink-900 ring-1 ring-white/15 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-4deg]">
                    <span className="absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.18),transparent_60%)]" />
                    <Icon name={s.icon} className="relative size-8 text-white" />
                  </span>
                  <span className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-go-sheen font-display text-sm font-extrabold shadow-glow-go">{s.step}</span>
                </div>
                <div className="pt-1 lg:pt-4">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65 lg:mx-auto lg:max-w-[16rem]">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
