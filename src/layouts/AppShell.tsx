import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ExternalLink, LogOut, Menu, RotateCcw } from 'lucide-react';
import { Avatar, Drawer, Icon, Logo } from '@/components/ui';
import { PageLoader } from '@/components/layout/PageLoader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useUnreadCount } from '@/hooks/useData';
import { resetDemo } from '@/services/api';
import { cn } from '@/utils';
import type { Role } from '@/types';

export interface ShellNavItem { to: string; label: string; icon: string; end?: boolean; badge?: number }

/** Shared sidebar application shell for the customer dashboard and admin console. */
export function AppShell({ nav, title, roles, accent, footerSlot }: { nav: ShellNavItem[]; title: string; roles: Role[]; accent: 'go' | 'brand'; footerSlot?: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();
  const toast = useToast();
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center justify-between px-5">
        <Link to="/" aria-label="DoorstepGo home"><Logo tone="light" className="h-8 w-auto" /></Link>
      </div>
      <p className="px-6 pt-2 pb-3 text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">{title}</p>
      <nav aria-label={title} className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {nav.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors', isActive ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white')}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId={`shell-${title}`} className={cn('absolute inset-0 -z-0 rounded-xl', accent === 'go' ? 'bg-gradient-to-r from-go-500/25 to-go-500/5 ring-1 ring-go-500/30' : 'bg-gradient-to-r from-brand-500/30 to-brand-500/5 ring-1 ring-brand-400/30')} transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <Icon name={n.icon} className={cn('relative size-[18px]', isActive && (accent === 'go' ? 'text-go-400' : 'text-brand-300'))} />
                    <span className="relative flex-1">{n.label}</span>
                    {!!n.badge && <span className="relative rounded-full bg-go-500 px-2 py-0.5 text-[11px] font-bold text-white">{n.badge}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {footerSlot && <div className="px-3 pb-3">{footerSlot}</div>}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => {
            resetDemo();
            toast({ title: 'Demo data reset', body: 'Sample bookings and notifications restored.', tone: 'info' });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="size-4" /> Reset demo data
        </button>
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white"><ExternalLink className="size-4" /> Back to website</Link>
        <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white"><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas lg:pl-[272px]">
      <aside className="noise fixed inset-y-0 left-0 z-40 hidden w-[272px] overflow-hidden bg-ink-950 lg:block">
        <div aria-hidden className="absolute -top-20 -left-20 size-72 rounded-full bg-brand-600/30 blur-[100px]" />
        <div aria-hidden className="absolute bottom-0 -left-10 size-60 rounded-full bg-go-500/15 blur-[100px]" />
        <div className="relative h-full">{Sidebar}</div>
      </aside>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" dark title={title} className="bg-ink-950">{Sidebar}</Drawer>

      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl text-ink-900 hover:bg-surface-2 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
          <Link to="/" className="lg:hidden"><Logo variant="mark" className="h-8 w-auto" /></Link>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-xs font-medium text-muted">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to={user.role === 'admin' || user.role === 'dispatcher' ? '/admin/support' : '/dashboard/notifications'} className="relative grid size-10 place-items-center rounded-xl text-text-2 hover:bg-surface-2 hover:text-ink-900" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-go-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unread}</span>}
            </Link>
            <Link to={user.role === 'admin' || user.role === 'dispatcher' ? '/admin' : '/dashboard/profile'} className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 hover:bg-surface-2">
              <Avatar src={user.avatar} name={user.name} size={34} />
              <span className="hidden text-left sm:block">
                <span className="block text-sm leading-tight font-semibold text-ink-900">{user.name}</span>
                <span className="block text-xs leading-tight text-muted capitalize">{user.role}</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Suspense fallback={<PageLoader light />}>
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
    </div>
  );
}
