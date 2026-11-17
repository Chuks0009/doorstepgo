import { Logo } from '@/components/ui';

/** Branded loading state used while lazy routes load. */
export function PageLoader({ light }: { light?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={light ? 'grid min-h-[60vh] place-items-center' : 'grid min-h-dvh place-items-center bg-ink-950'}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-go-500/30" aria-hidden />
          <Logo variant="mark" className="relative w-24 animate-float" />
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[marquee_1.1s_linear_infinite] rounded-full bg-go-sheen" style={{ animationName: 'loaderbar' }} />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
      <style>{`@keyframes loaderbar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
