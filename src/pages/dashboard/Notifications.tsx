import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, BellRing, CheckCheck, ChevronRight, Mail, MessageCircle, MonitorSmartphone, Smartphone, Sparkles, Trash2, Zap, MessageSquareText, type LucideIcon } from 'lucide-react';
import { Badge, Button, EmptyState, Tabs, Toggle } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { ConfirmDialog, Panel, notifGroupFor, notifMeta, type NotifGroup } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks';
import { useBookings, useDeliveries, useNotifications } from '@/hooks/useData';
import { authService, notificationService } from '@/services/api';
import type { AppNotification, NotificationChannel, NotificationType, User } from '@/types';
import { cn, formatDate, naira, timeAgo } from '@/utils';

type Filter = 'all' | 'unread' | 'rides' | 'deliveries' | 'payments' | 'promotions';

const channelMeta: Record<NotificationChannel, { label: string; icon: LucideIcon; status: string; pref?: keyof User['preferences'] }> = {
  in_app: { label: 'In-app', icon: MonitorSmartphone, status: 'Live in demo' },
  email: { label: 'Email', icon: Mail, status: 'Adapter ready', pref: 'email' },
  sms: { label: 'SMS', icon: MessageSquareText, status: 'Adapter ready', pref: 'sms' },
  push: { label: 'Push', icon: Smartphone, status: 'Adapter ready', pref: 'push' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, status: 'Adapter ready', pref: 'whatsapp' },
};

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export default function NotificationsPage() {
  usePageMeta('Notifications');
  const notifications = useNotifications();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: notifications.length, unread: 0, rides: 0, deliveries: 0, payments: 0, promotions: 0 };
    notifications.forEach((n) => {
      if (!n.read) c.unread++;
      const g = notifGroupFor(n.type, n.reference);
      if (g in c) c[g as Filter]++;
    });
    return c;
  }, [notifications]);

  const visible = useMemo(() => notifications.filter((n) => filter === 'all' || (filter === 'unread' ? !n.read : notifGroupFor(n.type, n.reference) === (filter as NotifGroup))), [notifications, filter]);
  const groups = [
    { label: 'Today', items: visible.filter((n) => isToday(n.createdAt)) },
    { label: 'Earlier', items: visible.filter((n) => !isToday(n.createdAt)) },
  ].filter((g) => g.items.length);

  const open = (n: AppNotification) => {
    if (!n.read) notificationService.markRead(n.id);
    if (n.link) navigate(n.link);
  };

  const simulate = async () => {
    setSimulating(true);
    const ride = bookings.find((b) => b.status !== 'cancelled') ?? bookings[0];
    const del = deliveries.find((d) => d.status !== 'cancelled') ?? deliveries[0];
    const rRef = ride?.reference ?? 'DSG-RD-DEMO-0001';
    const dRef = del?.reference ?? 'DSG-DL-DEMO-0001';
    const rLink = ride ? `/dashboard/bookings/${ride.id}` : undefined;
    const dLink = del ? `/dashboard/deliveries/${del.id}` : undefined;
    const driver = ride?.driver?.name.split(' ')[0] ?? 'Musa';
    const templates: { type: NotificationType; title: string; body: string; reference?: string; link?: string }[] = [
      { type: 'booking_confirmed', title: 'Booking confirmed', body: `Your ride ${rRef} is confirmed. We'll assign a driver shortly.`, reference: rRef, link: rLink },
      { type: 'driver_assigned', title: 'Driver assigned', body: `${driver} (4.9★) has accepted your trip and is heading to your pickup.`, reference: rRef, link: rLink },
      { type: 'driver_arrived', title: 'Your driver has arrived', body: `${driver} is waiting at your pickup point. Please meet them within 5 minutes.`, reference: rRef, link: rLink },
      { type: 'ride_started', title: 'Ride started', body: `Trip ${rRef} is under way. Share your trip with someone you trust.`, reference: rRef, link: rLink },
      { type: 'ride_completed', title: 'Ride completed', body: `You've arrived. Fare ${ride ? naira(ride.fare.total) : ''} — rate your driver?`, reference: rRef, link: rLink },
      { type: 'delivery_collected', title: 'Package collected', body: `Your rider has collected ${del?.packageDescription ?? 'your package'}.`, reference: dRef, link: dLink },
      { type: 'delivery_in_transit', title: 'Package in transit', body: `${dRef} is on the way to ${del?.recipient.name ?? 'your recipient'}.`, reference: dRef, link: dLink },
      { type: 'delivery_completed', title: 'Delivery completed', body: `${dRef} was delivered and confirmed with the delivery code.`, reference: dRef, link: dLink },
      { type: 'payment_confirmed', title: 'Payment successful (demo)', body: `Simulated payment for ${rRef} recorded. No real money was charged.`, reference: rRef },
      { type: 'booking_cancelled', title: 'Booking cancelled', body: `${rRef} was cancelled free of charge (demo — no change was made to your booking).`, reference: rRef },
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const p = user?.preferences;
    const channels: NotificationChannel[] = ['in_app', ...(['push', 'sms', 'email', 'whatsapp'] as const).filter((c) => p?.[c])];
    await notificationService.send({ ...t, channels });
    setSimulating(false);
    toast({ title: t.title, body: 'Simulated notification delivered to your inbox.', tone: 'info' });
  };

  const setPref = (key: keyof User['preferences'], value: boolean) => {
    if (!user) return;
    authService.updateProfile({ preferences: { ...user.preferences, [key]: value } });
    toast({ title: 'Preferences saved', body: `${key === 'marketing' ? 'Offers & promotions' : channelMeta[key as NotificationChannel]?.label ?? key} ${value ? 'on' : 'off'}.` });
  };

  return (
    <div>
      <DashPageHeader
        title="Notifications"
        subtitle="Trip, delivery and payment updates in one place."
        actions={
          <>
            <Button variant="outline" iconLeft={<CheckCheck className="size-4" />} disabled={!counts.unread} onClick={() => { notificationService.markAllRead(); toast({ title: 'All caught up', body: 'Every notification is marked as read.' }); }}>Mark all read</Button>
            <Button iconLeft={<Zap className="size-4" />} loading={simulating} onClick={simulate}>Simulate an update</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2" aria-label="Notification centre">
          <Tabs<Filter>
            className="px-2 sm:px-4"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'unread', label: 'Unread', count: counts.unread },
              { value: 'rides', label: 'Rides', count: counts.rides },
              { value: 'deliveries', label: 'Deliveries', count: counts.deliveries },
              { value: 'payments', label: 'Payments', count: counts.payments },
              { value: 'promotions', label: 'Promotions', count: counts.promotions },
            ]}
          />
          {groups.length === 0 ? (
            <div className="p-5">
              <EmptyState icon="Bell" title={filter === 'unread' ? 'You are all caught up' : 'No notifications here'} body="Updates about your rides, deliveries and payments will appear here." action={<Button size="sm" variant="soft" iconLeft={<Sparkles className="size-4" />} onClick={simulate}>Simulate an update</Button>} />
            </div>
          ) : (
            <div className="pb-2">
              {groups.map((g) => (
                <div key={g.label}>
                  <h2 className="px-5 pt-4 pb-2 text-xs font-bold tracking-[0.14em] text-muted uppercase sm:px-6">{g.label}</h2>
                  <ul>
                    <AnimatePresence initial={false}>
                      {g.items.map((n) => {
                        const m = notifMeta[n.type] ?? notifMeta.system;
                        return (
                          <motion.li key={n.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, height: 0 }} transition={{ duration: 0.25 }} className="group relative">
                            {!n.read && <span aria-hidden className="absolute top-0 bottom-0 left-0 w-1 rounded-r-full bg-go-500" />}
                            <div className={cn('mx-2 flex gap-3 rounded-2xl px-3 py-3.5 transition sm:mx-3', !n.read ? 'bg-go-50/40 hover:bg-go-50/80' : 'hover:bg-surface-2/60')}>
                              <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', m.tone)}><m.icon className="size-5" aria-hidden /></span>
                              <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                                <span className="flex flex-wrap items-center gap-x-2">
                                  <span className={cn('text-[15px]', n.read ? 'font-medium text-text' : 'font-bold text-ink-900')}>{n.title}</span>
                                  {!n.read && <span className="sr-only">(unread)</span>}
                                  <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                                </span>
                                <span className="mt-0.5 block text-sm text-text-2">{n.body}</span>
                                <span className="mt-2 flex flex-wrap items-center gap-1.5">
                                  {n.channels.map((c) => {
                                    const cm = channelMeta[c];
                                    return <span key={c} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-text-2 ring-1 ring-line"><cm.icon className="size-3" aria-hidden />{cm.label}</span>;
                                  })}
                                  {n.reference && <span className="font-mono text-[11px] text-muted">{n.reference}</span>}
                                  {n.link && <span className="inline-flex items-center text-xs font-semibold text-brand-700">View <ChevronRight className="size-3" aria-hidden /></span>}
                                </span>
                              </button>
                              <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
                                {!n.read && (
                                  <button type="button" onClick={() => notificationService.markRead(n.id)} className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-white hover:text-ok" aria-label={`Mark “${n.title}” as read`} title="Mark as read">
                                    <CheckCheck className="size-4" />
                                  </button>
                                )}
                                <button type="button" onClick={() => notificationService.remove(n.id)} className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-white hover:text-crit sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100" aria-label={`Delete “${n.title}”`} title="Delete">
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </div>
              ))}
              <div className="flex justify-center px-5 pt-3 pb-2">
                <Button variant="ghost" size="sm" iconLeft={<BellOff className="size-4" />} onClick={() => setConfirmClear(true)}>Clear all notifications</Button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <Panel title="How you hear from us" subtitle="Choose your channels" icon={<BellRing />}>
            {user && (
              <div className="divide-y divide-line">
                <Toggle label="Push notifications" description="Driver arrival and live trip updates" checked={user.preferences.push} onChange={(v) => setPref('push', v)} />
                <Toggle label="SMS" description="Booking confirmations and delivery codes" checked={user.preferences.sms} onChange={(v) => setPref('sms', v)} />
                <Toggle label="Email" description="Receipts and weekly summaries" checked={user.preferences.email} onChange={(v) => setPref('email', v)} />
                <Toggle label="WhatsApp" description="Trip updates and support chat" checked={user.preferences.whatsapp} onChange={(v) => setPref('whatsapp', v)} />
                <Toggle label="Offers & promotions" description="Discounts, promo codes and news" checked={user.preferences.marketing} onChange={(v) => setPref('marketing', v)} />
              </div>
            )}
            <p className="mt-3 text-xs text-muted">Essential safety and payment messages are always sent in-app.</p>
          </Panel>

          <Panel title="Delivery channels" subtitle="Where real integrations plug in">
            <ul className="space-y-2">
              {(Object.keys(channelMeta) as NotificationChannel[]).map((c) => {
                const cm = channelMeta[c];
                const on = c === 'in_app' || (cm.pref && user?.preferences[cm.pref]);
                return (
                  <li key={c} className="flex items-center gap-3 rounded-xl bg-surface-2/60 px-3 py-2.5">
                    <span className={cn('grid size-9 place-items-center rounded-xl', on ? 'bg-white text-ink-900 shadow-soft' : 'bg-transparent text-muted')}><cm.icon className="size-4" aria-hidden /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">{cm.label}</p>
                      <p className="text-xs text-muted">{cm.status}</p>
                    </div>
                    <Badge tone={c === 'in_app' ? 'ok' : on ? 'brand' : 'neutral'}>{c === 'in_app' ? 'Active' : on ? 'Opted in' : 'Off'}</Badge>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">This demo delivers in-app only. Email, SMS, push and WhatsApp providers connect through the same notification dispatcher when the backend is live — your choices above are already saved.</p>
          </Panel>

          <p className="px-1 text-xs text-muted">Last update {notifications[0] ? `${timeAgo(notifications[0].createdAt)} · ${formatDate(notifications[0].createdAt)}` : '—'}</p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { notificationService.clear(); setConfirmClear(false); toast({ title: 'Notifications cleared' }); }}
        title="Clear all notifications?"
        body="This removes every notification from this device. Your bookings and payments are not affected."
        confirmLabel="Clear all"
        danger
      />
    </div>
  );
}
