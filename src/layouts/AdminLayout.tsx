import { AppShell, type ShellNavItem } from './AppShell';
import { useQuotes, useMessages } from '@/hooks/useData';

export default function AdminLayout() {
  const newQuotes = useQuotes().filter((q) => q.status === 'new').length;
  const openMsgs = useMessages().filter((m) => m.status === 'open').length;
  const nav: ShellNavItem[] = [
    { to: '/admin', label: 'Operations overview', icon: 'Gauge', end: true },
    { to: '/admin/bookings', label: 'Ride bookings', icon: 'Bike' },
    { to: '/admin/dispatch', label: 'Delivery dispatch', icon: 'Route' },
    { to: '/admin/quotes', label: 'Quote requests', icon: 'Receipt', badge: newQuotes },
    { to: '/admin/merchants', label: 'Merchants', icon: 'Store' },
    { to: '/admin/fleet', label: 'Riders & fleet', icon: 'Users' },
    { to: '/admin/support', label: 'Support inbox', icon: 'Inbox', badge: openMsgs },
  ];
  return <AppShell nav={nav} title="Admin console" roles={['admin', 'dispatcher']} accent="brand" />;
}
