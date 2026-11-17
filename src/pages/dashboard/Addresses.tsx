import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, BookmarkPlus, Briefcase, Clock, House, MapPin, Package, Pencil, Plus, Star, Store, Trash2, type LucideIcon } from 'lucide-react';
import { Button, ButtonLink, EmptyState, Input, Modal } from '@/components/ui';
import { LocationPicker, locationErrors, type LocationValue } from '@/components/booking/LocationPicker';
import { DashPageHeader } from '@/components/dashboard/DashPageHeader';
import { ConfirmDialog, Panel } from '@/components/dashboard/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta, useStore } from '@/hooks';
import { authService } from '@/services/api';
import { KEYS, storage } from '@/services/storage';
import { cityName, junctionLabel } from '@/config/locations';
import type { SavedAddress } from '@/types';
import { cn } from '@/utils';

type IconKey = NonNullable<SavedAddress['icon']>;
const icons: Record<IconKey, { icon: LucideIcon; label: string; tone: string }> = {
  home: { icon: House, label: 'Home', tone: 'bg-go-50 text-go-600' },
  work: { icon: Briefcase, label: 'Work', tone: 'bg-brand-50 text-brand-700' },
  star: { icon: Star, label: 'Favourite', tone: 'bg-amber-50 text-amber-700' },
  store: { icon: Store, label: 'Shop / market', tone: 'bg-ink-900 text-white' },
};

const qs = (prefix: string, a: LocationValue) =>
  new URLSearchParams(Object.fromEntries(Object.entries({ [`${prefix}City`]: a.cityId, [`${prefix}Area`]: a.areaId, [`${prefix}Junction`]: a.junctionId, [`${prefix}Address`]: a.address }).filter(([, v]) => v)) as Record<string, string>).toString();

type Draft = { id?: string; label: string; icon: IconKey; loc: LocationValue };
const readRecent = () => storage.get<LocationValue[]>(KEYS.recentLocations, []);

export default function AddressesPage() {
  usePageMeta('Saved places');
  const { user } = useAuth();
  const toast = useToast();
  const recent = useStore(KEYS.recentLocations, readRecent);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<SavedAddress | null>(null);

  if (!user) return null;
  const saved = user.savedAddresses;
  const unsavedRecent = recent.filter((r) => !saved.some((s) => s.address === r.address));

  return (
    <div>
      <DashPageHeader
        title="Saved places"
        subtitle="Save the places you go most for one-tap pickups and drop-offs."
        actions={<Button iconLeft={<Plus className="size-4" />} onClick={() => setDraft({ label: '', icon: 'star', loc: {} })}>Add a place</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {saved.length === 0 ? (
            <EmptyState icon="MapPin" title="No saved places yet" body="Add home, work or your favourite market to book faster." action={<Button size="sm" onClick={() => setDraft({ label: 'Home', icon: 'home', loc: {} })}>Add home</Button>} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {saved.map((a) => {
                  const m = icons[a.icon ?? 'star'] ?? icons.star;
                  return (
                    <motion.li key={a.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card group relative flex flex-col overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                      <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-brand-100/60 opacity-0 blur-2xl transition group-hover:opacity-100" />
                      <div className="relative flex items-start gap-3">
                        <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', m.tone)}><m.icon className="size-5" aria-hidden /></span>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg font-bold text-ink-900">{a.label}</p>
                          <p className="text-[13px] font-medium text-brand-700">{junctionLabel(a.cityId, a.junctionId)} · {cityName(a.cityId)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setDraft({ id: a.id, label: a.label, icon: a.icon ?? 'star', loc: a })} className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink-900" aria-label={`Edit ${a.label}`}><Pencil className="size-4" /></button>
                          <button type="button" onClick={() => setToDelete(a)} className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-crit-bg hover:text-crit" aria-label={`Delete ${a.label}`}><Trash2 className="size-4" /></button>
                        </div>
                      </div>
                      <p className="relative mt-3 flex-1 text-sm text-text-2">{a.address}</p>
                      <div className="relative mt-4 grid grid-cols-2 gap-2">
                        <ButtonLink to={`/booking?${qs('pickup', a)}`} size="sm" variant="soft" iconLeft={<Bike className="size-4" />}>Ride from</ButtonLink>
                        <ButtonLink to={`/delivery?${qs('dropoff', a)}`} size="sm" variant="outline" iconLeft={<Package className="size-4" />}>Deliver here</ButtonLink>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              <li>
                <button type="button" onClick={() => setDraft({ label: '', icon: 'star', loc: {} })} className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-muted transition hover:border-go-300 hover:bg-go-50/40 hover:text-go-700">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-soft"><Plus className="size-5" aria-hidden /></span>
                  <span className="font-semibold">Add another place</span>
                </button>
              </li>
            </ul>
          )}
        </div>

        <aside className="space-y-6">
          <Panel title="Recent locations" subtitle="From your latest bookings on this device" icon={<Clock />}>
            {unsavedRecent.length === 0 ? (
              <p className="text-sm text-muted">No recent locations yet. Places you book from appear here so you can save them.</p>
            ) : (
              <ul className="space-y-2">
                {unsavedRecent.map((r, i) => (
                  <li key={`${r.address}-${i}`} className="flex items-center gap-3 rounded-xl bg-surface-2/60 px-3 py-2.5">
                    <MapPin className="size-4 shrink-0 text-brand-600" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{r.address}</p>
                      <p className="truncate text-xs text-muted">{junctionLabel(r.cityId, r.junctionId)}</p>
                    </div>
                    <button type="button" onClick={() => setDraft({ label: '', icon: 'star', loc: r })} className="grid size-9 place-items-center rounded-xl text-brand-700 transition hover:bg-white" aria-label={`Save ${r.address}`}><BookmarkPlus className="size-4" /></button>
                  </li>
                ))}
              </ul>
            )}
            {recent.length > 0 && (
              <button type="button" onClick={() => { storage.set(KEYS.recentLocations, []); toast({ title: 'Recent locations cleared' }); }} className="mt-3 text-sm font-semibold text-muted hover:text-crit">Clear recent locations</button>
            )}
          </Panel>
          <div className="rounded-2xl border border-dashed border-line-strong p-4 text-[13px] text-text-2">
            <p className="font-semibold text-ink-900">Tip</p>
            <p>Saved places appear as quick chips when you <Link to="/booking" className="font-semibold text-brand-700">book a ride</Link> or <Link to="/delivery" className="font-semibold text-brand-700">send a package</Link>.</p>
          </div>
        </aside>
      </div>

      {draft && <PlaceModal draft={draft} onClose={() => setDraft(null)} />}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) authService.removeAddress(toDelete.id);
          toast({ title: `${toDelete?.label} removed` });
          setToDelete(null);
        }}
        title={`Delete “${toDelete?.label ?? ''}”?`}
        body="This place will no longer appear as a suggestion. Past bookings are not affected."
        confirmLabel="Delete place"
        danger
      />
    </div>
  );
}

function PlaceModal({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const toast = useToast();
  const [label, setLabel] = useState(draft.label);
  const [icon, setIcon] = useState<IconKey>(draft.icon);
  const [loc, setLoc] = useState<LocationValue>(draft.loc);
  const [errors, setErrors] = useState<{ label?: string; city?: string; junction?: string; address?: string }>({});

  const save = () => {
    const le = locationErrors(loc, 'place');
    const e = { label: label.trim() ? (label.trim().length > 30 ? 'Keep the name under 30 characters' : undefined) : 'Give this place a name', ...le };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    authService.saveAddress({ id: draft.id, label: label.trim(), icon, cityId: loc.cityId!, areaId: loc.areaId, junctionId: loc.junctionId!, address: loc.address!.trim() });
    toast({ title: draft.id ? 'Place updated' : 'Place saved', body: `${label.trim()} is ready for one-tap booking.` });
    onClose();
  };

  return (
    <Modal open onClose={onClose} size="lg" title={draft.id ? 'Edit place' : 'Add a place'} description="Saved places show up as quick suggestions when booking." footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>{draft.id ? 'Save changes' : 'Save place'}</Button></>}>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input label="Name" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Home, Office, Gym" error={errors.label} maxLength={40} />
          <div>
            <p id="icon-label" className="mb-1.5 text-sm font-semibold text-text">Icon</p>
            <div role="radiogroup" aria-labelledby="icon-label" className="flex gap-2">
              {(Object.keys(icons) as IconKey[]).map((k) => {
                const m = icons[k];
                return (
                  <button key={k} type="button" role="radio" aria-checked={icon === k} aria-label={m.label} title={m.label} onClick={() => setIcon(k)} className={cn('grid size-12 place-items-center rounded-xl border-2 transition', icon === k ? 'border-go-500 bg-go-50 text-go-600' : 'border-line text-text-2 hover:border-brand-300')}>
                    <m.icon className="size-5" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <LocationPicker name="place" label="Location" value={loc} onChange={setLoc} errors={errors} showSaved={false} compact />
      </div>
    </Modal>
  );
}
