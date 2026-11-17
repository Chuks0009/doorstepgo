import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WhatsappGlyph } from '@/components/ui';
import { site, whatsappLink } from '@/config/site';
import { useLocation } from 'react-router-dom';

/** Floating WhatsApp support — number & message come from src/config/site.ts */
export function WhatsAppButton() {
  const [hint, setHint] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const t = setTimeout(() => setHint(true), 4000);
    const h = setTimeout(() => setHint(false), 9000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  // Contextual pre-filled message
  const message =
    pathname.startsWith('/delivery') || pathname.includes('delivery')
      ? "Hello DoorstepGo 👋 I need help with a delivery."
      : pathname.startsWith('/request-quote')
        ? "Hello DoorstepGo 👋 I'd like to discuss a quote."
        : site.whatsapp.defaultMessage;

  // Booking flows have a mobile bottom fare bar — lift the button above it on small screens.
  const lifted = /^\/(booking|delivery|checkout|request-quote)/.test(pathname);

  return (
    <div className={`no-print fixed right-4 z-40 sm:right-6 ${lifted ? 'bottom-28 lg:bottom-6' : 'bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6'}`}>
      <div className="group relative flex items-center">
        <AnimatePresence>
          {hint && (
            <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="absolute right-full mr-3 hidden rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-lift sm:block" aria-hidden>
              {site.whatsapp.tooltip} 👋
            </motion.span>
          )}
        </AnimatePresence>
        <span role="tooltip" id="wa-tip" className="pointer-events-none absolute right-full mr-3 rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-lift transition-all duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          {site.whatsapp.tooltip}
        </span>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${site.whatsapp.tooltip} on WhatsApp`}
          aria-describedby="wa-tip"
          className="relative grid size-14 animate-float place-items-center rounded-[1.4rem] text-white shadow-[0_14px_34px_-10px_rgb(18_140_126/0.8)] transition-transform duration-300 hover:scale-110 sm:size-16"
          style={{ background: 'linear-gradient(140deg,#2fe07a 0%,#13b05a 55%,#0b7f63 100%)' }}
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-[1.4rem] bg-[#25d366]/50" aria-hidden />
          <span className="absolute inset-[3px] rounded-[1.2rem] border border-white/25" aria-hidden />
          <WhatsappGlyph className="relative size-7 drop-shadow sm:size-8" />
          <span className="absolute -top-1 -right-1 size-4 rounded-full border-[3px] border-white bg-go-500" aria-hidden />
        </a>
      </div>
    </div>
  );
}
