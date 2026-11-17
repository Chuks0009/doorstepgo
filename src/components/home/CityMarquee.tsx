import { Bike, Bus, CarTaxiFront, MapPin, Package, ShoppingBasket } from 'lucide-react';
import { DEFAULT_CITY, cities, findCity } from '@/config/locations';

const services = [
  { label: 'Motorcycle rides', Icon: Bike },
  { label: 'Keke rides', Icon: CarTaxiFront },
  { label: 'Shuttles & airport runs', Icon: Bus },
  { label: 'Parcel delivery', Icon: Package },
  { label: 'Market pickup', Icon: ShoppingBasket },
];

/** Places in the launch city plus coming-soon cities. */
const places = [
  ...(findCity(DEFAULT_CITY)?.areas ?? []).map((a) => ({ id: a.id, name: a.name, active: true })),
  ...cities.filter((c) => !c.active).map((c) => ({ id: c.id, name: c.name, active: false })),
];

/** Infinite marquee of Awka areas and services (duplicated track for a seamless loop). */
export function CityMarquee() {
  const items = places.flatMap((c, i) => [
    { key: `c-${c.id}`, node: <span className="flex items-center gap-2"><MapPin className="size-4 text-go-500" aria-hidden />{c.name}{!c.active && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted uppercase">Soon</span>}</span> },
    { key: `s-${i}`, node: (() => { const s = services[i % services.length]; return <span className="flex items-center gap-2 text-brand-700"><s.Icon className="size-4" aria-hidden />{s.label}</span>; })() },
  ]);
  return (
    <div role="region" className="relative overflow-hidden py-6" aria-label="Awka areas and services we cover">
      <ul className="sr-only">
        {places.map((c) => <li key={c.id}>{c.name}{c.active ? '' : ' (coming soon)'}</li>)}
      </ul>
      <div aria-hidden className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-10 pr-10 font-display text-lg font-semibold whitespace-nowrap text-ink-900 sm:text-xl">
            {items.map((it) => (
              <span key={`${dup}-${it.key}`} className="flex items-center gap-10">
                {it.node}
                <span className="h-4 w-6 -skew-x-[24deg] rounded-sm bg-gradient-to-r from-go-500 to-amber-glow opacity-70" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
    </div>
  );
}
