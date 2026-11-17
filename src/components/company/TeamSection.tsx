import { motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import { LinkedinGlyph, Reveal, SectionHeading, TiltCard, XGlyph } from '@/components/ui';
import { team } from '@/data/content';
import { site } from '@/config/site';
import type { TeamMember } from '@/types';
import { cn } from '@/utils';
import { IllustratedAvatar } from './IllustratedAvatar';

/** Social links are PLACEHOLDERS — set `links` per member in src/data/content.ts. */
function Socials({ m, dark }: { m: TeamMember; dark?: boolean }) {
  const items = [
    { label: `${m.name} on LinkedIn (placeholder)`, href: m.links?.linkedin ?? site.social.linkedin, Glyph: LinkedinGlyph },
    { label: `${m.name} on X (placeholder)`, href: m.links?.x ?? site.social.x, Glyph: XGlyph },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {items.map(({ label, href, Glyph }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className={cn('grid size-11 place-items-center rounded-xl transition', dark ? 'bg-white/10 text-white hover:bg-go-500' : 'bg-surface-2 text-ink-800 hover:bg-ink-900 hover:text-white')}
        >
          <Glyph className="size-4" />
        </a>
      ))}
      <a
        href={`mailto:${site.contact.email}?subject=${encodeURIComponent(`Hello ${m.name.split(' ')[0]}`)}`}
        aria-label={`Email ${m.name} via ${site.contact.email}`}
        className={cn('grid size-11 place-items-center rounded-xl transition', dark ? 'bg-white/10 text-white hover:bg-go-500' : 'bg-surface-2 text-ink-800 hover:bg-ink-900 hover:text-white')}
      >
        <Mail className="size-4" aria-hidden />
      </a>
    </div>
  );
}

export function TeamSection() {
  const [lead, ...rest] = team;
  return (
    <section id="team" className="relative scroll-mt-20 overflow-hidden py-20 lg:py-28">
      <div aria-hidden className="grid-lines-light absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_70%,transparent)]" />
      <div className="container-x">
        <SectionHeading
          eyebrow="Our team"
          title={<>The people behind <span className="text-gradient-brand">every pickup</span></>}
          subtitle="Operators, engineers and customer champions who have waited at Ifite junctions for a keke that never came — and decided to fix it."
          action={
            <p className="flex max-w-xs items-start gap-2 rounded-2xl border border-dashed border-line-strong bg-white/70 p-3 text-xs leading-relaxed text-text-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-go-500" aria-hidden />
              Illustrated portraits, names and social links are placeholders. Replace them in <code className="font-semibold text-ink-800">src/data/content.ts</code>.
            </p>
          }
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* Featured lead */}
          <Reveal className="lg:col-span-5 lg:row-span-2">
            <TiltCard max={5} className="h-full rounded-3xl">
              <article className="noise relative flex h-full flex-col overflow-hidden rounded-3xl bg-ink-950 text-white shadow-lift">
                <div className="relative aspect-[4/3.4] overflow-hidden lg:aspect-auto lg:flex-1">
                  <IllustratedAvatar {...lead} index={0} name={lead.name} className="lg:absolute lg:inset-0 lg:h-full lg:w-full" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950 to-transparent" aria-hidden />
                  <span className="absolute top-4 left-4 rounded-full bg-go-500 px-3 py-1 text-[11px] font-bold tracking-wider uppercase">Founder</span>
                </div>
                <div className="relative p-6 sm:p-8">
                  <p className="text-sm font-semibold text-go-300">{lead.role}</p>
                  <h3 className="mt-1 text-3xl font-bold">{lead.name}</h3>
                  <p className="mt-3 leading-relaxed text-white/70">{lead.bio}</p>
                  <div className="mt-6"><Socials m={lead} dark /></div>
                </div>
              </article>
            </TiltCard>
          </Reveal>

          {/* Everyone else */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            {rest.map((m, i) => {
              const wide = i === rest.length - 1;
              return (
                <Reveal key={m.id} delay={(i % 3) * 0.06} className={cn(wide && 'sm:col-span-2 lg:col-span-3')}>
                  <TiltCard max={7} className="h-full rounded-3xl">
                    <article className={cn('group relative flex h-full overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift', wide ? 'flex-col sm:flex-row' : 'flex-col')}>
                      <div className={cn('relative overflow-hidden', wide ? 'aspect-square sm:aspect-auto sm:w-56 sm:shrink-0' : 'aspect-square')}>
                        <motion.div className="size-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                          <IllustratedAvatar {...m} index={i + 1} name={m.name} />
                        </motion.div>
                        <span aria-hidden className="absolute right-0 bottom-0 left-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${m.accent}, #FF6A13)` }} />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-700 uppercase">
                          <span className="size-2 rounded-full" style={{ background: m.accent }} aria-hidden />
                          {m.role}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-ink-900">{m.name}</h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2">{m.bio}</p>
                        <div className="mt-4"><Socials m={m} /></div>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
