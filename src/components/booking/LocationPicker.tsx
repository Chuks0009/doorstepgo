import { useEffect, useMemo } from 'react';
import { Bookmark, Briefcase, Clock, Home, MapPin, Navigation, Star, Store } from 'lucide-react';
import { Input, Select } from '@/components/ui';
import { activeCities, cities, findCity } from '@/config/locations';
import { useAuth } from '@/context/AuthContext';
import { storage, KEYS } from '@/services/storage';
import type { LocationPoint } from '@/types';
import { cn } from '@/utils';

export type LocationValue = Partial<LocationPoint>;

interface Props {
  /** Prefix for field names, e.g. "pickup" → pickupCity, pickupJunction, pickupAddress (used for validation focus). */
  name: string;
  label: string;
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  errors?: { city?: string; junction?: string; address?: string };
  tone?: 'pickup' | 'dropoff';
  showSaved?: boolean;
  addressPlaceholder?: string;
  compact?: boolean;
}

const savedIcon = { home: Home, work: Briefcase, star: Star, store: Store };

/** Remember a location for "recent locations" suggestions. */
export function rememberLocation(loc: LocationValue) {
  if (!loc.cityId || !loc.junctionId || !loc.address) return;
  storage.update<LocationValue[]>(KEYS.recentLocations, [], (prev) => [loc, ...prev.filter((p) => p.address !== loc.address)].slice(0, 5));
}

/**
 * City → Area → Junction → Street address selector with saved-place and
 * recent-location suggestions. Map/geocoder autocomplete can replace the
 * suggestion chips later without changing the LocationPoint shape.
 */
export function LocationPicker({ name, label, value, onChange, errors = {}, tone = 'pickup', showSaved = true, addressPlaceholder, compact }: Props) {
  const { user } = useAuth();
  const city = findCity(value.cityId);
  const areas = city?.areas ?? [];
  const area = areas.find((a) => a.id === value.areaId);
  const junctions = useMemo(() => (area ? area.junctions : areas.flatMap((a) => a.junctions.map((j) => ({ ...j, group: a.name })))), [area, areas]);
  const recent = storage.get<LocationValue[]>(KEYS.recentLocations, []);

  // Single launch city (Awka) — preselect it so users go straight to area/junction.
  useEffect(() => {
    if (!value.cityId && activeCities.length === 1) onChange({ ...value, cityId: activeCities[0].id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.cityId]);

  const suggestions = [
    ...(showSaved && user ? user.savedAddresses.map((s) => ({ key: s.id, label: s.label, sub: s.address, loc: s as LocationValue, Icon: savedIcon[s.icon ?? 'star'] ?? Bookmark })) : []),
    ...recent.slice(0, 3).map((r, i) => ({ key: `r${i}`, label: 'Recent', sub: r.address ?? '', loc: r, Icon: Clock })),
  ].slice(0, 5);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 flex items-center gap-2.5 font-display text-base font-semibold text-ink-900">
        <span className={cn('grid size-8 place-items-center rounded-full ring-4', tone === 'pickup' ? 'bg-brand-600 text-white ring-brand-100' : 'bg-go-500 text-white ring-go-100')}>
          {tone === 'pickup' ? <Navigation className="size-4" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
        </span>
        {label}
      </legend>

      {suggestions.length > 0 && (
        <div className="scrollbar-none -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1" aria-label={`Suggested ${label.toLowerCase()} locations`}>
          {suggestions.map(({ key, label: l, sub, loc, Icon }) => {
            const active = value.address === loc.address && value.junctionId === loc.junctionId;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ cityId: loc.cityId, areaId: loc.areaId, junctionId: loc.junctionId, address: loc.address })}
                className={cn('flex max-w-56 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition', active ? 'border-go-400 bg-go-50' : 'border-line bg-white hover:border-brand-300 hover:bg-brand-50/50')}
              >
                <Icon className={cn('size-4 shrink-0', active ? 'text-go-600' : 'text-brand-600')} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink-900">{l}</span>
                  <span className="block truncate text-xs text-muted">{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className={cn('grid gap-4', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
        <div data-field={`${name}City`}>
          <Select
            label="City"
            required
            name={`${name}City`}
            value={value.cityId ?? ''}
            placeholder="Select city"
            error={errors.city}
            options={cities.map((c) => ({ value: c.id, label: c.active ? `${c.name}, ${c.state}` : `${c.name} — coming soon`, disabled: !c.active }))}
            onChange={(e) => onChange({ cityId: e.target.value, areaId: undefined, junctionId: undefined, address: value.address })}
          />
        </div>
        <Select
          label="Area"
          optional
          name={`${name}Area`}
          value={value.areaId ?? ''}
          placeholder={city ? 'All areas' : 'Select a city first'}
          disabled={!city}
          options={areas.map((a) => ({ value: a.id, label: a.name }))}
          onChange={(e) => onChange({ ...value, areaId: e.target.value || undefined, junctionId: undefined })}
        />
        <div data-field={`${name}Junction`}>
          <Select
            label="Junction / landmark"
            required
            name={`${name}Junction`}
            value={value.junctionId ?? ''}
            placeholder={city ? 'Select junction' : 'Select a city first'}
            disabled={!city}
            error={errors.junction}
            options={junctions.map((j) => ({ value: j.id, label: j.landmark ? `${j.name} — ${j.landmark}` : j.name, group: 'group' in j ? (j.group as string) : undefined }))}
            onChange={(e) => {
              const jid = e.target.value;
              const owner = areas.find((a) => a.junctions.some((j) => j.id === jid));
              onChange({ ...value, junctionId: jid, areaId: owner?.id ?? value.areaId });
            }}
          />
        </div>
        <Input
          wrapperClassName={compact ? 'sm:col-span-2' : 'sm:col-span-3'}
          label={tone === 'pickup' ? 'Detailed pickup address' : 'Detailed drop-off address'}
          required
          name={`${name}Address`}
          autoComplete="street-address"
          placeholder={addressPlaceholder ?? 'House number, street, building, nearest landmark'}
          value={value.address ?? ''}
          error={errors.address}
          icon={<MapPin />}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </div>
    </fieldset>
  );
}

/** Validation helper for a LocationValue. */
export function locationErrors(v: LocationValue, label = 'location') {
  return {
    city: v.cityId ? undefined : `Select the ${label} city`,
    junction: v.junctionId ? undefined : `Select the ${label} junction`,
    address: v.address && v.address.trim().length >= 5 ? undefined : `Enter a detailed ${label} address`,
  };
}
export const isLocationValid = (v: LocationValue) => !Object.values(locationErrors(v)).some(Boolean);

export const activeCityOptions = activeCities.map((c) => ({ value: c.id, label: c.name }));
