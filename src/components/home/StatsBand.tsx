import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { stats } from '@/data/content';
import { useCountUp } from '@/hooks';

function Stat({ value, suffix, label, decimals, run }: { value: number; suffix: string; label: string; decimals: number; run: boolean }) {
  const v = useCountUp(value, run, 1800, decimals);
  const shown = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-NG');
  return (
    <div className="relative px-2 py-6 text-center sm:px-6 lg:py-2">
      <p className="font-display text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl lg:text-6xl">
        <span aria-hidden>{shown}{suffix}</span>
        <span className="sr-only">{value.toLocaleString('en-NG')}{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
    </div>
  );
}

/** Statistics band — animated count-up of illustrative platform figures. */
export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section aria-label="Platform statistics (illustrative)" className="relative z-10 -mt-12 pb-4">
      <div className="container-x">
        <div ref={ref} className="noise relative isolate overflow-hidden rounded-[2rem] bg-go-sheen px-4 py-8 text-white shadow-glow-go sm:px-8 lg:py-12">
          <div aria-hidden className="absolute inset-y-0 left-[18%] -z-10 w-24 -skew-x-[24deg] bg-white/10" />
          <div aria-hidden className="absolute inset-y-0 left-[24%] -z-10 w-8 -skew-x-[24deg] bg-white/10" />
          <div aria-hidden className="absolute inset-y-0 right-[12%] -z-10 w-32 -skew-x-[24deg] bg-ink-900/10" />
          <div className="grid grid-cols-2 divide-white/20 lg:grid-cols-4 lg:divide-x">
            {stats.map((s) => <Stat key={s.label} {...s} run={inView} />)}
          </div>
          <p className="mt-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">Illustrative figures · demonstration data</p>
        </div>
      </div>
    </section>
  );
}
