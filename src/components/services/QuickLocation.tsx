import { useId } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Select } from '@/components/ui';
import { activeCities, findCity } from '@/config/locations';
import type { LocationPoint } from '@/types';
import { cn } from '@/utils';

export type QuickLoc = Partial<LocationPoint>;

/** Lightweight city + junction picker for estimators (no address needed). */
export function QuickLocation({ label, value, onChange, tone = 'pickup', dark }: { label: string; value: QuickLoc; onChange: (v: QuickLoc) => void; tone?: 'pickup' | 'dropoff'; dark?: boolean }) {
  const id = useId();
  const city = findCity(value.cityId);
  const junctionOptions = (city?.areas ?? []).flatMap((a) => a.junctions.map((j) => ({ value: j.id, label: j.name, group: a.name })));
  return (
    <fieldset className="min-w-0" aria-labelledby={`${id}-l`}>
      <legend id={`${id}-l`} className={cn('mb-2 flex items-center gap-2 text-sm font-bold', dark ? 'text-white' : 'text-ink-900')}>
        <span className={cn('grid size-6 place-items-center rounded-full text-white', tone === 'pickup' ? 'bg-brand-600' : 'bg-go-500')}>
          {tone === 'pickup' ? <Navigation className="size-3" aria-hidden /> : <MapPin className="size-3" aria-hidden />}
        </span>
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        <Select
          aria-label={`${label} city`}
          value={value.cityId ?? ''}
          placeholder="City"
          options={activeCities.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(e) => onChange({ cityId: e.target.value || undefined })}
        />
        <Select
          aria-label={`${label} junction or landmark`}
          value={value.junctionId ?? ''}
          placeholder={city ? 'Junction' : 'City first'}
          disabled={!city}
          options={junctionOptions}
          onChange={(e) => {
            const jid = e.target.value;
            const area = city?.areas.find((a) => a.junctions.some((j) => j.id === jid));
            onChange({ cityId: value.cityId, areaId: area?.id, junctionId: jid || undefined });
          }}
        />
      </div>
    </fieldset>
  );
}
