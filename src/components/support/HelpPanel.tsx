import { ArrowRight, Clock, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExternalButton, WhatsappGlyph } from '@/components/ui';
import { site, whatsappLink } from '@/config/site';
import { cn } from '@/utils';

/** "Still need help?" panel — WhatsApp, phone, contact form. Dark, brand-led. */
export function HelpPanel({ title = 'Still need help?', body = 'Our support team answers on WhatsApp, by phone and by email during operating hours.', message, className, compact }: { title?: string; body?: string; message?: string; className?: string; compact?: boolean }) {
  return (
    <aside className={cn('noise relative isolate overflow-hidden rounded-3xl bg-ink-radial p-6 text-white shadow-lift', className)} aria-label="Contact support">
      <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden />
      <div className="absolute -right-10 -bottom-16 -z-10 size-48 rounded-full bg-go-500/30 blur-3xl" aria-hidden />
      <div className="absolute top-6 right-5 flex flex-col items-end gap-1.5 opacity-60" aria-hidden>
        {[40, 64, 28].map((w, i) => <span key={i} className="h-[3px] rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: w }} />)}
      </div>
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
      <div className={cn('mt-5 grid gap-2', !compact && 'sm:grid-cols-1')}>
        <ExternalButton href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" variant="go" block iconLeft={<WhatsappGlyph className="size-5" />}>
          Chat on WhatsApp
        </ExternalButton>
        <ExternalButton href={`tel:${site.contact.phoneHref}`} variant="glass" block iconLeft={<Phone className="size-4" />}>
          {site.contact.phone}
        </ExternalButton>
      </div>
      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
        <a href={`mailto:${site.contact.supportEmail}`} className="flex items-center gap-2 text-white/75 transition hover:text-white">
          <Mail className="size-4 text-go-300" aria-hidden /> {site.contact.supportEmail}
        </a>
        <p className="flex items-center gap-2 text-white/60">
          <Clock className="size-4 text-go-300" aria-hidden /> {site.hours[0].days}: {site.hours[0].time}
        </p>
        <Link to="/contact" className="group inline-flex items-center gap-1.5 pt-1 font-semibold text-go-300 hover:text-go-200">
          Open the contact page <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
