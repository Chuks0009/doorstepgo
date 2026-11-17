import type { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Breadcrumbs, SmartImage } from '@/components/ui';
import { cn } from '@/utils';

/**
 * Dark hero used at the top of every inner public page. It sits *under*
 * the transparent sticky header (MainLayout pulls <main> up by 72px).
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  image,
  imageAlt = '',
  actions,
  aside,
  children,
  className,
  compact,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: { label: string; to?: string }[];
  image?: string;
  imageAlt?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const scale = useTransform(scrollY, [0, 600], [1.05, 1.15]);
  return (
    <section className={cn('noise relative isolate overflow-hidden bg-ink-950 text-white', className)}>
      {image && (
        <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
          <SmartImage src={image} alt={imageAlt} eager className="size-full" />
        </motion.div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className={cn('absolute inset-0', image ? 'bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40' : 'bg-ink-radial')} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
        <div className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute -top-32 right-[8%] size-[420px] rounded-full bg-brand-500/25 blur-[120px]" />
        <div className="absolute bottom-[-40%] left-[20%] size-[380px] rounded-full bg-go-500/20 blur-[120px]" />
        {/* speed lines */}
        <div className="absolute top-1/2 right-0 hidden w-1/3 flex-col gap-3 opacity-40 lg:flex">
          {[60, 85, 45, 70].map((w, i) => (
            <span key={i} className="ml-auto h-[3px] animate-speed rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: `${w}%`, animationDelay: `${i * 0.35}s` }} />
          ))}
        </div>
      </div>

      <div className={cn('container-x relative pt-[calc(72px+3rem)]', compact ? 'pb-14 lg:pb-16' : 'pb-16 lg:pt-[calc(72px+4.5rem)] lg:pb-24')}>
        <div className={cn('grid items-end gap-10', aside && 'lg:grid-cols-[1.25fr_1fr]')}>
          <div>
            {crumbs && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><Breadcrumbs dark items={crumbs} /></motion.div>}
            {eyebrow && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6">
                <span className="eyebrow-dark">{eyebrow}</span>
              </motion.div>
            )}
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-6xl">
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-white/70 sm:text-lg">
                {subtitle}
              </motion.p>
            )}
            {actions && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-3">{actions}</motion.div>}
          </div>
          {aside && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8 }}>{aside}</motion.div>}
        </div>
        {children}
      </div>
    </section>
  );
}
