import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Bell, ChevronDown, Clock, LayoutDashboard, LogOut, MapPin, Menu, Phone, Search, User as UserIcon } from 'lucide-react';
import { Avatar, Button, ButtonLink, Drawer, Icon, Logo, SmartImage } from '@/components/ui';
import { customersMenu, servicesMenu } from '@/config/navigation';
import { site } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import { useDismiss, useScrolled } from '@/hooks';
import { useUnreadCount } from '@/hooks/useData';
import { images } from '@/data/images';
import { cn } from '@/utils';
import type { NavLink } from '@/types';

type MenuKey = 'services' | 'customers' | null;

export function Header() {
  const scrolled = useScrolled(24);
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobile, setMobile] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setMenu(null), []);
  useDismiss(navRef, close, menu !== null);
  useEffect(() => {
    setMenu(null);
    setMobile(false);
  }, [pathname]);

  const solid = scrolled || menu !== null;

  return (
    <>
      <a href="#main" className="sr-only z-[200] rounded-lg bg-go-500 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>

      {/* Utility bar */}
      <div className={cn('relative z-50 hidden bg-ink-950 text-[13px] text-white/70 transition-all duration-500 lg:block', scrolled ? '-mt-10 opacity-0' : 'mt-0 opacity-100')} style={{ height: 40 }}>
        <div className="container-x flex h-10 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-1.5 hover:text-white"><Phone className="size-3.5 text-go-400" aria-hidden /> {site.contact.phone}</a>
            <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-go-400" aria-hidden /> {site.hours[0].days}: {site.hours[0].time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-go-400" aria-hidden /> Now serving Awka · Ifite · UNIZIK · Temp Site · Okpuno · Aroma</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/track-booking" className="hover:text-white">Track booking</Link>
            <Link to="/track-delivery" className="hover:text-white">Track delivery</Link>
            <Link to="/faq" className="hover:text-white">Help</Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50">
        <div ref={navRef} className="relative">
          <div
            className={cn(
              'transition-all duration-500 ease-out-expo',
              solid ? 'border-b border-line/80 bg-white/85 shadow-[0_10px_40px_-20px_rgb(10_22_64/0.35)] backdrop-blur-2xl' : 'border-b border-white/10 bg-ink-950/30 backdrop-blur-md',
            )}
          >
            <nav aria-label="Primary" className="container-x flex h-[72px] items-center justify-between gap-4">
              <Link to="/" className="shrink-0 rounded-lg" aria-label={`${site.name} home`}>
                <Logo tone={solid ? 'dark' : 'light'} className="h-9 w-auto sm:h-10" />
              </Link>

              <ul className="hidden items-center gap-1 lg:flex">
                <TopLink to="/" label="Home" solid={solid} end />
                <MenuTrigger label="Services" k="services" menu={menu} setMenu={setMenu} solid={solid} active={pathname.startsWith('/services')} />
                <MenuTrigger label="Customers" k="customers" menu={menu} setMenu={setMenu} solid={solid} active={pathname.startsWith('/customers')} />
                <TopLink to="/about" label="About Us" solid={solid} />
                <TopLink to="/contact" label="Contact" solid={solid} />
              </ul>

              <div className="flex items-center gap-2">
                <AccountArea solid={solid} />
                <ButtonLink to="/request-quote" variant={solid ? 'outline' : 'glass'} size="sm" className="max-md:hidden">Request a Quote</ButtonLink>
                <ButtonLink to="/booking" variant="go" size="sm" className="max-sm:hidden" iconRight={<ArrowRight className="size-4" />}>Book a Ride</ButtonLink>
                <button
                  onClick={() => setMobile(true)}
                  className={cn('grid size-11 place-items-center rounded-xl transition lg:hidden', solid ? 'text-ink-900 hover:bg-surface-2' : 'text-white hover:bg-white/10')}
                  aria-label="Open menu"
                  aria-expanded={mobile}
                >
                  <Menu className="size-6" />
                </button>
              </div>
            </nav>
          </div>

          <AnimatePresence>
            {menu && (
              <motion.div
                key={menu}
                initial={{ opacity: 0, y: -8, rotateX: -8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center', perspective: 1000 }}
                className="absolute inset-x-0 top-full hidden lg:block"
                onMouseLeave={() => setMenu(null)}
              >
                <div className="container-x pt-3">
                  <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
                    {menu === 'services' ? <ServicesPanel /> : <CustomersPanel />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <MobileNav open={mobile} onClose={() => setMobile(false)} />
    </>
  );
}

function TopLink({ to, label, solid, end }: { to: string; label: string; solid: boolean; end?: boolean }) {
  return (
    <li>
      <RouterNavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'relative rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-colors',
            solid ? 'text-text-2 hover:bg-surface-2 hover:text-ink-900' : 'text-white/80 hover:bg-white/10 hover:text-white',
            isActive && (solid ? 'text-ink-900' : 'text-white'),
          )
        }
      >
        {({ isActive }) => (
          <>
            {label}
            {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-go-500" />}
          </>
        )}
      </RouterNavLink>
    </li>
  );
}

function MenuTrigger({ label, k, menu, setMenu, solid, active }: { label: string; k: Exclude<MenuKey, null>; menu: MenuKey; setMenu: (m: MenuKey) => void; solid: boolean; active: boolean }) {
  const open = menu === k;
  const timer = useRef<number | undefined>(undefined);
  return (
    <li onMouseEnter={() => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setMenu(k), 80); }} onMouseLeave={() => window.clearTimeout(timer.current)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setMenu(open ? null : k)}
        onKeyDown={(e) => e.key === 'ArrowDown' && setMenu(k)}
        className={cn(
          'relative flex items-center gap-1 rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-colors',
          solid ? 'text-text-2 hover:bg-surface-2 hover:text-ink-900' : 'text-white/80 hover:bg-white/10 hover:text-white',
          (open || active) && (solid ? 'text-ink-900' : 'text-white'),
        )}
      >
        {label}
        <ChevronDown className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} aria-hidden />
        {active && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-go-500" />}
      </button>
    </li>
  );
}

function MenuItem({ item, i }: { item: NavLink; i: number }) {
  return (
    <motion.li initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i + 0.05 }}>
      <Link to={item.to} className="group flex items-start gap-4 rounded-2xl p-3.5 transition hover:bg-surface-2">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-all duration-300 group-hover:-rotate-6 group-hover:bg-go-500 group-hover:text-white group-hover:shadow-glow-go">
          <Icon name={item.icon ?? 'Circle'} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-semibold text-ink-900">
            {item.label}
            {item.badge && <span className="rounded-full bg-go-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-go-700 uppercase">{item.badge}</span>}
            <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
          </span>
          <span className="mt-0.5 block text-sm text-text-2">{item.description}</span>
        </span>
      </Link>
    </motion.li>
  );
}

function ServicesPanel() {
  const hero = images.delivery[0];
  return (
    <div className="grid grid-cols-[1.5fr_1fr]">
      <div className="p-5">
        <p className="px-3.5 pb-2 text-xs font-bold tracking-[0.14em] text-muted uppercase">Our services</p>
        <ul className="grid grid-cols-2 gap-1">
          {servicesMenu.map((s, i) => <MenuItem key={s.to} item={s} i={i} />)}
          <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/services" className="group flex h-full items-center justify-between gap-2 rounded-2xl border border-dashed border-line-strong p-3.5 font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50">
              View all services <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </motion.li>
        </ul>
      </div>
      <Link to="/delivery" className="group relative m-3 overflow-hidden rounded-2xl">
        <SmartImage src={hero.src} alt={hero.alt} className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-6 text-white">
          <span className="eyebrow-dark w-fit">New · Market pickup</span>
          <p className="mt-3 font-display text-2xl font-bold">We go to the market, you stay home.</p>
          <p className="mt-1 text-sm text-white/70">Send a rider to collect goods from any seller.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-go-300">Schedule a pickup <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
        </div>
      </Link>
    </div>
  );
}

function CustomersPanel() {
  return (
    <div className="grid grid-cols-[1.5fr_1fr]">
      <div className="p-5">
        <p className="px-3.5 pb-2 text-xs font-bold tracking-[0.14em] text-muted uppercase">Who we serve</p>
        <ul className="grid grid-cols-2 gap-1">
          {customersMenu.map((s, i) => <MenuItem key={s.to} item={s} i={i} />)}
        </ul>
      </div>
      <div className="m-3 flex flex-col justify-between rounded-2xl bg-ink-radial p-6 text-white">
        <div>
          <span className="eyebrow-dark">For business</span>
          <p className="mt-3 font-display text-xl font-bold">Move stock, staff and orders on one account.</p>
          <p className="mt-1 text-sm text-white/70">Bulk deliveries, scheduled logistics and monthly invoicing.</p>
        </div>
        <div className="mt-5 flex gap-2">
          <ButtonLink to="/customers/merchants" size="sm" variant="go">Merchant solutions</ButtonLink>
          <ButtonLink to="/request-quote?type=business" size="sm" variant="glass">Get a quote</ButtonLink>
        </div>
      </div>
    </div>
  );
}

function AccountArea({ solid }: { solid: boolean }) {
  const { user, logout } = useAuth();
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useDismiss(ref, () => setOpen(false), open);

  if (!user) {
    return (
      <Link to="/login" className={cn('hidden items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold transition xl:flex', solid ? 'text-text-2 hover:bg-surface-2 hover:text-ink-900' : 'text-white/80 hover:bg-white/10 hover:text-white')}>
        <UserIcon className="size-4" aria-hidden /> Sign in
      </Link>
    );
  }
  return (
    <div ref={ref} className="relative hidden md:block">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className={cn('flex items-center gap-2 rounded-full p-1 pr-2 transition', solid ? 'hover:bg-surface-2' : 'hover:bg-white/10')}>
        <span className="relative">
          <Avatar src={user.avatar} name={user.name} size={34} />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-go-500 text-[10px] font-bold text-white ring-2 ring-white">{unread}</span>}
        </span>
        <ChevronDown className={cn('size-4', solid ? 'text-text-2' : 'text-white/80')} aria-hidden />
        <span className="sr-only">Account menu</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lift">
            <div className="px-3 py-2">
              <p className="font-semibold text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {[
              { to: user.role === 'admin' ? '/admin' : '/dashboard', label: user.role === 'admin' ? 'Admin console' : 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
              { to: '/dashboard/notifications', label: `Notifications${unread ? ` (${unread})` : ''}`, icon: <Bell className="size-4" /> },
              { to: '/dashboard/profile', label: 'Profile & settings', icon: <UserIcon className="size-4" /> },
            ].map((l) => (
              <Link key={l.to} role="menuitem" to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-2 hover:bg-surface-2 hover:text-ink-900">{l.icon}{l.label}</Link>
            ))}
            <button role="menuitem" onClick={() => { logout(); setOpen(false); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-crit hover:bg-crit-bg"><LogOut className="size-4" /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<MenuKey>('services');
  const navigate = useNavigate();
  const Group = ({ k, label, items }: { k: Exclude<MenuKey, null>; label: string; items: NavLink[] }) => (
    <div className="border-b border-white/10">
      <button onClick={() => setSection(section === k ? null : k)} aria-expanded={section === k} className="flex w-full items-center justify-between px-5 py-4 text-left font-display text-lg font-semibold">
        {label}
        <ChevronDown className={cn('size-5 transition-transform', section === k && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {section === k && (
          <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden px-3 pb-3">
            {items.map((it) => (
              <li key={it.to}>
                <Link to={it.to} onClick={onClose} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-white/5">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-go-300"><Icon name={it.icon ?? 'Circle'} className="size-5" /></span>
                  <span>
                    <span className="block font-semibold">{it.label}</span>
                    <span className="block text-[13px] text-white/55">{it.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
  return (
    <Drawer open={open} onClose={onClose} dark title={<Logo tone="light" className="h-8 w-auto" />}>
      <div className="flex min-h-full flex-col">
        <div className="grid grid-cols-2 gap-2 p-4">
          <ButtonLink to="/booking" onClick={onClose} variant="go" block>Book a Ride</ButtonLink>
          <ButtonLink to="/delivery" onClick={onClose} variant="glass" block>Send a Package</ButtonLink>
        </div>
        <Link to="/" onClick={onClose} className="border-y border-white/10 px-5 py-4 font-display text-lg font-semibold">Home</Link>
        <Group k="services" label="Services" items={servicesMenu} />
        <Group k="customers" label="Customers" items={customersMenu} />
        {[
          ['/about', 'About Us'],
          ['/request-quote', 'Request a Quote'],
          ['/contact', 'Contact'],
          ['/faq', 'FAQs'],
        ].map(([to, l]) => (
          <Link key={to} to={to} onClick={onClose} className="border-b border-white/10 px-5 py-4 font-display text-lg font-semibold">{l}</Link>
        ))}
        <div className="grid grid-cols-2 gap-2 p-4">
          <Link to="/track-booking" onClick={onClose} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold"><Search className="size-4 text-go-300" /> Track booking</Link>
          <Link to="/track-delivery" onClick={onClose} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold"><Search className="size-4 text-go-300" /> Track delivery</Link>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.name}</p>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={onClose} className="text-sm text-go-300">Open dashboard →</Link>
              </div>
              <Button variant="glass" size="sm" onClick={() => { logout(); onClose(); navigate('/'); }}>Sign out</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink to="/login" onClick={onClose} variant="glass" block>Sign in</ButtonLink>
              <ButtonLink to="/register" onClick={onClose} variant="white" block>Create account</ButtonLink>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
