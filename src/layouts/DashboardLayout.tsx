import { Link } from 'react-router-dom';
import { AppShell, type ShellNavItem } from './AppShell';
import { useUnreadCount } from '@/hooks/useData';

export default function DashboardLayout() {
  const unread = useUnreadCount();
  const nav: ShellNavItem[] = [
    { to: '/dashboard', label: 'Overview', icon: 'LayoutGrid', end: true },
    { to: '/dashboard/bookings', label: 'My bookings', icon: 'Bike' },
    { to: '/dashboard/deliveries', label: 'My deliveries', icon: 'Package' },
    { to: '/dashboard/payments', label: 'Payments', icon: 'CreditCard' },
    { to: '/dashboard/notifications', label: 'Notifications', icon: 'Bell', badge: unread },
    { to: '/dashboard/addresses', label: 'Saved places', icon: 'MapPin' },
    { to: '/dashboard/rewards', label: 'Rewards & referrals', icon: 'Gift' },
    { to: '/dashboard/support', label: 'Support', icon: 'Headset' },
    { to: '/dashboard/profile', label: 'Profile & settings', icon: 'Users' },
  ];
  return (
    <AppShell
      nav={nav}
      title="Customer dashboard"
      roles={['customer', 'merchant', 'admin']}
      accent="go"
      footerSlot={
        <Link to="/booking" className="block rounded-2xl bg-go-sheen p-4 text-white shadow-glow-go transition hover:brightness-110">
          <p className="font-display font-bold">Need a ride?</p>
          <p className="text-sm text-white/85">Book in under a minute →</p>
        </Link>
      }
    />
  );
}
