/* Bridges LocationPicker sub-fields (city / junction / address) into the
   flat `useForm` schema so wizard steps can `check([...])` them and the
   first invalid select/input receives focus. */
import type { Errors, Rule, Schema } from '@/utils/validation';
import { cityName, findJunction } from '@/config/locations';
import { locationErrors, type LocationValue } from './LocationPicker';

type Getter = (all: Record<string, unknown>) => LocationValue | undefined;

/** Schema entries `${name}City`, `${name}Junction`, `${name}Address` derived from a LocationValue getter. */
export function locationRules(name: string, get: Getter, label = 'location', active: (all: Record<string, unknown>) => boolean = () => true): Schema {
  const rule = (k: 'city' | 'junction' | 'address'): Rule => (_v, all) => {
    if (!active(all)) return undefined;
    const loc = get(all);
    if (!loc) return undefined;
    return locationErrors(loc, label)[k];
  };
  return { [`${name}City`]: [rule('city')], [`${name}Junction`]: [rule('junction')], [`${name}Address`]: [rule('address')] };
}

export const locationKeys = (name: string) => [`${name}City`, `${name}Junction`, `${name}Address`];

/** Pull the LocationPicker `errors` prop out of the form's flat error map. */
export const pickErrors = (errors: Errors, name: string) => ({
  city: errors[`${name}City`],
  junction: errors[`${name}Junction`],
  address: errors[`${name}Address`],
});

/** Rule: two points must not be the identical junction + address. */
export const samePlace = (a?: LocationValue, b?: LocationValue) =>
  !!a?.junctionId && a.junctionId === b?.junctionId && a.cityId === b?.cityId && (a.address ?? '').trim().toLowerCase() === (b?.address ?? '').trim().toLowerCase();

/** Human label for a location — "Miracle Junction, Ifite-Awka · Awka". */
export function placeLabel(loc?: LocationValue) {
  if (!loc?.cityId) return 'Not set';
  const hit = findJunction(loc.cityId, loc.junctionId);
  if (!hit) return cityName(loc.cityId);
  return `${hit.junction.name}, ${hit.area.name} · ${hit.city.name}`;
}

/** Build a LocationValue from URL params (city + junction), filling the area automatically. */
export function locationFromParams(cityId: string | null, junctionId: string | null): LocationValue {
  if (!cityId) return {};
  const hit = findJunction(cityId, junctionId ?? undefined);
  return hit ? { cityId, areaId: hit.area.id, junctionId: hit.junction.id } : { cityId };
}
