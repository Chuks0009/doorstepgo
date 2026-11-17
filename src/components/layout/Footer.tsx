import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Logo, socialGlyphs } from '@/components/ui';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { footerNav, legalLinks } from '@/config/navigation';
import { site, type SocialKey } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="noise relative isolate overflow-hidden bg-ink-950 text-white">
      {/* Background: speed-line motif from the logo + glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] size-[640px] rounded-full bg-brand-600/25 blur-[140px]" />
        <div className="absolute bottom-[-30%] left-[-10%] size-[560px] rounded-full bg-go-500/15 blur-[140px]" />
        <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <svg className="absolute top-24 left-0 w-full opacity-[0.12]" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M-20 ${60 + i * 28} C 400 ${20 + i * 30}, 900 ${140 + i * 10}, 1460 ${50 + i * 25}`} stroke={i % 2 ? '#2f7bff' : '#ff6a13'} strokeWidth={i === 1 ? 3 : 1.5} strokeLinecap="round" />
          ))}
        </svg>
      </div>

      {/* CTA band */}
      <div className="container-x relative pt-16 lg:pt-20">
        <div className="grid items-center gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow-dark">Stay in the loop</p>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">New areas, student promos & delivery tips — <span className="text-gradient-go">monthly, no spam.</span></h2>
          </div>
          <div>
            <NewsletterForm />
            <p className="mt-3 text-xs text-white/45">By subscribing you agree to our <Link to="/legal/privacy" className="underline hover:text-white">Privacy Policy</Link>. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.25fr_2.75fr] lg:py-20">
        <div>
          <Link to="/" aria-label={`${site.name} home`} className="inline-block"><Logo tone="light" className="h-11 w-auto" /></Link>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">{site.shortPitch} {site.description}</p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li><a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3 hover:text-white"><span className="grid size-9 place-items-center rounded-xl bg-white/5 text-go-400"><Phone className="size-4" /></span>{site.contact.phone}</a></li>
            <li><a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 hover:text-white"><span className="grid size-9 place-items-center rounded-xl bg-white/5 text-go-400"><Mail className="size-4" /></span>{site.contact.email}</a></li>
            <li className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/5 text-go-400"><MapPin className="size-4" /></span>{site.contact.address.line1}, {site.contact.address.line2}, {site.contact.address.city}</li>
            <li className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/5 text-go-400"><Clock className="size-4" /></span>{site.hours[0].days} · {site.hours[0].time}</li>
          </ul>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Social media">
            {(Object.keys(site.social) as SocialKey[]).map((k) => {
              const { Glyph, label } = socialGlyphs[k];
              return (
                <li key={k}>
                  <a href={site.social[k]} target="_blank" rel="noreferrer noopener" aria-label={`${site.name} on ${label}`} className="group relative grid size-11 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-go-500/50 hover:text-white">
                    <span className="absolute inset-0 translate-y-full bg-go-sheen transition-transform duration-300 group-hover:translate-y-0" aria-hidden />
                    <Glyph className="relative size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {Object.entries(footerNav).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h3 className="font-display text-sm font-semibold tracking-wide text-white">{title}</h3>
              <span className="mt-2 block h-0.5 w-8 rounded-full bg-go-sheen" aria-hidden />
              <ul className="mt-5 space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="group inline-flex items-center gap-1 text-[15px] text-white/60 transition hover:text-white">
                      {l.label}
                      <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none container-x relative -mb-6 select-none sm:-mb-10">
        <p className="bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-center font-display text-[18vw] leading-none font-extrabold tracking-tighter text-transparent lg:text-[200px]">DoorstepGo</p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-[13px] text-white/50 md:flex-row">
          <p>© {year} {site.legalName}. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>)}
            <li>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1.5 rounded-lg hover:text-white">
                Back to top <ArrowUp className="size-3.5" aria-hidden />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
