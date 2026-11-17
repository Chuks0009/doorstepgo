import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BellRing, Check, Globe, Heart, KeyRound, LogOut, Mail, Phone, Save, ShieldCheck, Trash2, TriangleAlert, UserRound } from 'lucide-react';
import { Avatar, Badge, Button, Checkbox, Input, Modal, Select, Toggle } from '@/components/ui';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { KindIcon, Panel, loyaltyStatus } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm, usePageMeta, useStore } from '@/hooks';
import { useBookings, useDeliveries } from '@/hooks/useData';
import { authService } from '@/services/api';
import { KEYS, storage } from '@/services/storage';
import { deliveryCategories, tiersByKind } from '@/data/services';
import { site } from '@/config/site';
import { email, matches, minLen, phone, required, strongPassword } from '@/utils/validation';
import { cn, formatDate } from '@/utils';

const avatarSeeds = ['AdaNwosu', 'Chioma', 'Tunde', 'Zainab', 'Emeka', 'Kemi'];
const face = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c8dcff,ffd5b8`;

const PRIVACY_KEY = KEYS.draft('privacy');
type Privacy = { firstNameOnly: boolean; shareTrips: boolean; analytics: boolean };
const defaultPrivacy: Privacy = { firstNameOnly: true, shareTrips: false, analytics: true };
const readPrivacy = () => storage.get<Privacy>(PRIVACY_KEY, defaultPrivacy);

const profileSchema = { name: [required('Enter your full name'), minLen(2)], email: [required('Enter your email'), email()], phone: [required('Enter your phone number'), phone()] };
const pwSchema = { current: [required('Enter your current password')], next: [required('Choose a new password'), strongPassword()], confirm: [required('Confirm your new password'), matches('next', 'Passwords do not match')] };

export default function ProfilePage() {
  usePageMeta('Profile & settings');
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const bookings = useBookings();
  const deliveries = useDeliveries();
  const privacy = useStore(PRIVACY_KEY, readPrivacy);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => ({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' }), [user?.name, user?.email, user?.phone]);
  const form = useForm(initial, profileSchema);
  const pw = useForm({ current: '', next: '', confirm: '' }, pwSchema);

  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    return () => clearTimeout(t);
  }, [hash]);

  if (!user) return null;
  const loyal = loyaltyStatus(user.loyaltyPoints);
  const dirty = form.values.name !== user.name || form.values.email !== user.email || form.values.phone !== user.phone;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.check()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    authService.updateProfile({ name: form.values.name.trim(), email: form.values.email.trim(), phone: form.values.phone.trim() });
    setSaving(false);
    toast({ title: 'Profile updated', body: 'Your details have been saved.' });
  };

  const toggleFav = (id: string, on: boolean) => {
    const next = on ? [...new Set([...user.favouriteServices, id])] : user.favouriteServices.filter((x) => x !== id);
    authService.updateProfile({ favouriteServices: next });
  };

  const setPrivacy = (k: keyof Privacy, v: boolean) => {
    storage.set(PRIVACY_KEY, { ...privacy, [k]: v });
    toast({ title: 'Privacy setting saved' });
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.check()) return;
    pw.reset();
    toast({ title: 'Password change simulated', body: 'In this demo your sign-in password is not changed.', tone: 'info' });
  };

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <DashPageHeader title="Profile & settings" subtitle="Manage your details, preferences and account security." actions={<Button variant="outline" iconLeft={<LogOut className="size-4" />} onClick={signOut}>Sign out</Button>} />

      {/* Overview */}
      <section className="card overflow-hidden">
        <div className="relative h-28 bg-ink-radial sm:h-32">
          <div aria-hidden className="absolute inset-0 grid-lines" />
          <div aria-hidden className="absolute top-6 right-6 flex flex-col items-end gap-2">
            {[80, 120, 56].map((w, i) => <span key={i} className="h-1.5 rounded-full bg-gradient-to-l from-go-500 to-transparent" style={{ width: w }} />)}
          </div>
        </div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
          <div className="-mt-12 flex items-end gap-4">
            <button type="button" onClick={() => setAvatarOpen(true)} className="group relative rounded-full" aria-label="Change avatar">
              <Avatar src={user.avatar} name={user.name} size={104} className="ring-4 ring-white" />
              <span className="absolute inset-0 grid place-items-center rounded-full bg-ink-950/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">Change</span>
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-ink-900">{user.name}</h2>
              <Badge tone="go">{loyal.current.name}</Badge>
              <Badge tone="neutral" className="capitalize">{user.role}</Badge>
            </div>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-2">
              <span className="inline-flex items-center gap-1.5"><Mail className="size-4 text-muted" aria-hidden />{user.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="size-4 text-muted" aria-hidden />{user.phone}</span>
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-center sm:gap-4">
            {[['Member since', formatDate(user.memberSince, { month: 'short', year: 'numeric' })], ['Rides', bookings.length], ['Deliveries', deliveries.length]].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-surface-2/70 px-3 py-2"><dt className="text-[11px] font-semibold text-muted uppercase">{k}</dt><dd className="font-display font-bold text-ink-900">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Panel title="Personal details" icon={<UserRound />}>
            <form onSubmit={saveProfile} noValidate className="space-y-4">
              <Input label="Full name" required autoComplete="name" {...form.field('name')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Email" type="email" required autoComplete="email" icon={<Mail />} {...form.field('email')} />
                <Input label="Phone" type="tel" required autoComplete="tel" icon={<Phone />} {...form.field('phone')} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" disabled={!dirty} onClick={() => form.patch({ name: user.name, email: user.email, phone: user.phone })}>Discard</Button>
                <Button type="submit" loading={saving} disabled={!dirty} iconLeft={<Save className="size-4" />}>Save changes</Button>
              </div>
            </form>
          </Panel>

          <div id="favourites" className="scroll-mt-24">
            <Panel title="Favourite services" subtitle="Shown as one-tap shortcuts on your dashboard" icon={<Heart />}>
              <div className="space-y-5">
                {(Object.keys(tiersByKind) as (keyof typeof tiersByKind)[]).map((k) => (
                  <fieldset key={k}>
                    <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900"><KindIcon kind={k} size="sm" /> {k === 'motorcycle' ? 'Motorcycle' : k === 'tricycle' ? 'Tricycle' : 'Shuttle'}</legend>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {tiersByKind[k].map((t) => <Checkbox key={t.id} label={t.name} description={t.tagline} checked={user.favouriteServices.includes(t.id)} onChange={(v) => toggleFav(t.id, v)} />)}
                    </div>
                  </fieldset>
                ))}
                <fieldset>
                  <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900"><KindIcon kind="delivery" size="sm" /> Delivery</legend>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {deliveryCategories.map((c) => <Checkbox key={c.id} label={c.name} description={c.short} checked={user.favouriteServices.includes(c.id)} onChange={(v) => toggleFav(c.id, v)} />)}
                  </div>
                </fieldset>
              </div>
            </Panel>
          </div>

          <Panel title="Security" subtitle="Change your password" icon={<KeyRound />}>
            <form onSubmit={changePassword} noValidate className="space-y-4">
              <Input label="Current password" type="password" required autoComplete="current-password" {...pw.field('current')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="New password" type="password" required autoComplete="new-password" hint="8+ characters with a letter and a number" {...pw.field('next')} />
                <Input label="Confirm new password" type="password" required autoComplete="new-password" {...pw.field('confirm')} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[13px] text-muted"><ShieldCheck className="size-4 text-ok" aria-hidden /> Demo — real authentication arrives with the backend.</p>
                <Button type="submit" variant="ink">Update password</Button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Panel title="Notifications" icon={<BellRing />} action={<Link to="/dashboard/notifications" className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Manage</Link>}>
            <ul className="flex flex-wrap gap-2">
              {(['push', 'sms', 'email', 'whatsapp', 'marketing'] as const).map((k) => (
                <li key={k} className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold', user.preferences[k] ? 'bg-ok-bg text-ok' : 'bg-surface-2 text-muted')}>
                  {user.preferences[k] && <Check className="size-3" strokeWidth={3} aria-hidden />}
                  {k === 'sms' ? 'SMS' : k === 'whatsapp' ? 'WhatsApp' : k === 'marketing' ? 'Offers' : k[0].toUpperCase() + k.slice(1)}
                  <span className="sr-only">{user.preferences[k] ? 'on' : 'off'}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Language & region" icon={<Globe />}>
            <div className="space-y-4">
              <Select label="Language" value="en" onChange={() => undefined} options={[{ value: 'en', label: 'English (Nigeria)' }, { value: 'yo', label: 'Yorùbá — coming soon', disabled: true }, { value: 'ig', label: 'Igbo — coming soon', disabled: true }, { value: 'ha', label: 'Hausa — coming soon', disabled: true }, { value: 'pcm', label: 'Pidgin — coming soon', disabled: true }]} />
              <div className="flex items-center justify-between rounded-xl bg-surface-2/60 px-4 py-3 text-sm">
                <span className="text-text-2">Currency</span>
                <span className="font-semibold text-ink-900">{site.currency.code} ({site.currency.symbol})</span>
              </div>
            </div>
          </Panel>

          <Panel title="Privacy" icon={<ShieldCheck />}>
            <div className="divide-y divide-line">
              <Toggle label="Show first name only to drivers" description="Drivers see “Ada N.” instead of your full name" checked={privacy.firstNameOnly} onChange={(v) => setPrivacy('firstNameOnly', v)} />
              <Toggle label="Trip sharing reminders" description="Prompt me to share live trips with a trusted contact" checked={privacy.shareTrips} onChange={(v) => setPrivacy('shareTrips', v)} />
              <Toggle label="Help improve DoorstepGo" description="Share anonymous usage statistics" checked={privacy.analytics} onChange={(v) => setPrivacy('analytics', v)} />
            </div>
            <p className="mt-3 text-xs text-muted">Read our <Link to="/legal/privacy" className="font-semibold text-brand-700">privacy policy</Link>.</p>
          </Panel>

          <section className="rounded-2xl border border-red-200 bg-crit-bg/40 p-5">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-crit"><TriangleAlert className="size-5" aria-hidden /> Danger zone</p>
            <p className="mt-1 text-sm text-text-2">Deleting your account removes your profile, saved places and history.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" iconLeft={<LogOut className="size-4" />} onClick={signOut}>Sign out</Button>
              <Button variant="danger" size="sm" iconLeft={<Trash2 className="size-4" />} onClick={() => setDeleteOpen(true)}>Delete account</Button>
            </div>
          </section>
        </div>
      </div>

      <Modal open={avatarOpen} onClose={() => setAvatarOpen(false)} title="Choose an avatar" description="Photo uploads arrive with the backend — pick an illustrated avatar for now." size="sm">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Avatars">
          {avatarSeeds.map((s) => {
            const src = face(s);
            const active = user.avatar === src;
            return (
              <button key={s} type="button" role="radio" aria-checked={active} aria-label={`Avatar ${s}`} onClick={() => { authService.updateProfile({ avatar: src }); setAvatarOpen(false); toast({ title: 'Avatar updated' }); }} className={cn('grid place-items-center rounded-2xl border-2 p-3 transition', active ? 'border-go-500 bg-go-50' : 'border-line hover:border-brand-300')}>
                <Avatar src={src} name={user.name} size={64} />
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteText(''); }}
        title="Delete your account?"
        size="sm"
        footer={<><Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteText(''); }}>Cancel</Button><Button variant="danger" disabled={deleteText !== 'DELETE'} onClick={() => { setDeleteOpen(false); setDeleteText(''); toast({ title: 'Deletion request simulated', body: 'In this demo your account is kept. A real request would be confirmed by email.', tone: 'info' }); }}>Delete account</Button></>}
      >
        <div className="space-y-4 text-sm text-text-2">
          <p>This would permanently remove your profile, saved places, loyalty points and booking history. Active bookings must be completed or cancelled first.</p>
          <Input label={<>Type <span className="font-mono font-bold">DELETE</span> to confirm</>} value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
          <p className="text-xs text-muted">Demo — nothing will actually be deleted.</p>
        </div>
      </Modal>
    </div>
  );
}
