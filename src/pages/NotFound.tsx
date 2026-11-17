import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bike, Building2, CircleQuestionMark, House, Info, LayoutDashboard, Package, Phone, Search, Store, Truck, Users } from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { cn } from '@/utils';
import { Orbs, SpeedLines } from '@/components/company/shared';
import { LostRiderIllustration } from '@/components/company/LostRiderIllustration';

const destinations = [
  { label: 'Home', to: '/', hint: 'Start over', icon: House, keys: 'home start main' },
  { label: 'Book a ride', to: '/booking', hint: 'Motorcycle, tricycle or shuttle', icon: Bike, keys: 'ride book okada keke bike motorcycle tricycle shuttle' },
  { label: 'Schedule a delivery', to: '/delivery', hint: 'Parcels & market pickup', icon: Package, keys: 'delivery parcel send package market' },
  { label: 'Track a booking', to: '/track-booking', hint: 'Follow your ride', icon: Search, keys: 'track booking ride status' },
  { label: 'Track a delivery', to: '/track-delivery', hint: 'Where is my parcel?', icon: Truck, keys: 'track delivery parcel status' },
  { label: 'All services', to: '/services', hint: 'Everything we do', icon: Building2, keys: 'services motorcycle tricycle shuttle delivery' },
  { label: 'Request a quote', to: '/request-quote', hint: 'Business & events', icon: Building2, keys: 'quote business corporate event' },
  { label: 'Merchants', to: '/customers/merchants', hint: 'Bulk & scheduled deliveries', icon: Store, keys: 'merchant seller shop business bulk' },
  { label: 'Customer services', to: '/customers', hint: 'Riders, merchants, businesses', icon: Users, keys: 'customers riders promotions rewards loyalty' },
  { label: 'My dashboard', to: '/dashboard', hint: 'Bookings & payments', icon: LayoutDashboard, keys: 'dashboard account bookings payments profile' },
  { label: 'FAQs', to: '/faq', hint: 'Quick answers', icon: CircleQuestionMark, keys: 'faq help questions refund cancel' },
  { label: 'Contact us', to: '/contact', hint: 'WhatsApp, phone & email', icon: Phone, keys: 'contact support help phone whatsapp email' },
  { label: 'About us', to: '/about', hint: 'Story, team & careers', icon: Info, keys: 'about team careers mission partner jobs' },
];

export default function NotFoundPage() {
  usePageMeta('Page not found', 'This route doesn’t exist — let’s get you back on the road.');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return destinations.slice(0, 8);
    return destinations.filter((d) => `${d.label} ${d.hint} ${d.keys}`.toLowerCase().includes(t));
  }, [q]);

  return (
    <section className="noise relative isolate overflow-hidden bg-ink-950 text-white">
      <Orbs />
      <SpeedLines className="absolute top-1/3 right-0 hidden w-1/4 opacity-50 lg:flex" />
      <div className="container-x grid min-h-[100dvh] items-center gap-10 pt-[calc(72px+3rem)] pb-20 lg:grid-cols-2 lg:pt-[calc(72px+2rem)]">
        <div className="order-2 lg:order-1">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow-dark">Error 404 · Route not found</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mt-5 text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-6xl">
            Our rider took a <span className="text-gradient-go">wrong turn</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-lg text-lg text-white/70">
            We couldn’t find <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm break-all text-go-300">{pathname}</code>. Search for where you meant to go, or pick a quick route below.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            role="search"
            onSubmit={(e) => { e.preventDefault(); if (results[0]) navigate(results[0].to); }}
            className="mt-8"
          >
            <label htmlFor="nf-search" className="sr-only">Search pages</label>
            <div className="glass-dark flex items-center gap-2 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-go-500">
              <Search className="ml-2 size-5 shrink-0 text-white/50" aria-hidden />
              <input
                id="nf-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “track”, “delivery” or “careers”"
                autoComplete="off"
                aria-controls="nf-results"
                className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={!results.length} iconRight={<ArrowRight className="size-4" />}>Go</Button>
            </div>
          </motion.form>

          <ul id="nf-results" aria-live="polite" className="mt-4 grid gap-2 sm:grid-cols-2">
            {results.map((d, i) => (
              <motion.li key={d.to} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                <Link to={d.to} className={cn('group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/10', i === 0 && q && 'bg-white/10 ring-1 ring-go-500/60')}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-go-300 transition-colors group-hover:bg-go-500 group-hover:text-white"><d.icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{d.label}</span>
                    <span className="block truncate text-xs text-white/50">{d.hint}</span>
                  </span>
                  <ArrowRight className="size-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
                </Link>
              </motion.li>
            ))}
            {!results.length && <li className="text-sm text-white/60 sm:col-span-2">No matches — try “ride”, “parcel” or “help”.</li>}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="glass" iconLeft={<ArrowLeft className="size-4" />} onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>Go back</Button>
            <ButtonLink to="/" variant="white">Back to home</ButtonLink>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="relative order-1 lg:order-2">
          <p aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[9rem] leading-none font-extrabold text-white/[0.04] select-none sm:text-[14rem]">404</p>
          <LostRiderIllustration className="relative mx-auto w-full max-w-lg" />
        </motion.div>
      </div>
    </section>
  );
}
