/* =====================================================================
   SERVICE LOCATIONS — Awka, Anambra State (launch market).
   Focus: Ifite-Awka and the UNIZIK (Nnamdi Azikiwe University) corridor.
   Coordinates are approximate and used only for mock fare estimation.
   ⚠ Junction names should be confirmed on the ground and extended by the
     operations team — edit here, nothing else needs to change.
   Set `active: false` for cities shown as "coming soon".
   ===================================================================== */
import type { City } from '@/types';

const j = (id: string, name: string, landmark?: string) => ({ id, name, landmark });

export const cities: City[] = [
  {
    id: 'awka', name: 'Awka', state: 'Anambra State', country: 'Nigeria', active: true, lat: 6.2209, lng: 7.0722,
    areas: [
      {
        id: 'ifite', name: 'Ifite-Awka', lat: 6.2525, lng: 7.1125,
        junctions: [
          j('miracle-jn', 'Miracle Junction', 'Ifite'),
          j('yahoo-jn', 'Yahoo Junction', 'Ifite'),
          j('ifite-first-market', 'First Market', 'Ifite'),
          j('ifite-second-market', 'Second Market', 'Ifite'),
          j('book-foundation', 'Book Foundation', 'Ifite'),
          j('ifite-road', 'Ifite Road', 'Aroma ↔ UNIZIK back gate'),
        ],
      },
      {
        id: 'unizik', name: 'UNIZIK Campus', lat: 6.2449, lng: 7.1162,
        junctions: [
          j('unizik-main-gate', 'UNIZIK Main Gate', 'Nnamdi Azikiwe University'),
          j('unizik-back-gate', 'UNIZIK Back Gate', 'Ifite side'),
          j('next-level-jn', 'Next Level Junction', 'Upper campus axis'),
          j('laurel-jn', 'Laurel Junction', 'Lower campus axis'),
        ],
      },
      {
        id: 'temp-site', name: 'Temp Site / UNIZIK Junction', lat: 6.2365, lng: 7.1018,
        junctions: [
          j('unizik-jn', 'UNIZIK Junction', 'Enugu–Onitsha Expressway'),
          j('arthur-eze-ave', 'Arthur Eze Avenue', 'Towards Eke Awka'),
          j('oby-okoli-st', 'Oby Okoli Street', 'Towards Mgbakwu'),
        ],
      },
      {
        id: 'okpuno', name: 'Okpuno', lat: 6.2401, lng: 7.0861,
        junctions: [
          j('goodwill-jn', 'Goodwill Junction', 'Okpuno'),
          j('club-road', 'Club Road', 'Okpuno'),
        ],
      },
      {
        id: 'aroma', name: 'Aroma / Regina Caeli', lat: 6.2268, lng: 7.0935,
        junctions: [
          j('aroma-jn', 'Aroma Junction', 'Aroma flyover'),
          j('regina-jn', 'Regina Caeli Junction', 'Enugu–Onitsha Expressway'),
          j('works-road', 'Works Road', 'Off the expressway'),
        ],
      },
      {
        id: 'awka-town', name: 'Awka Town', lat: 6.2122, lng: 7.0711,
        junctions: [
          j('eke-awka', 'Eke Awka Market', 'Awka town centre'),
          j('ziks-ave', "Zik's Avenue"),
          j('ekwueme-square', 'Alex Ekwueme Square'),
          j('kwata-jn', 'Kwata Junction'),
        ],
      },
      {
        id: 'agu-awka', name: 'Agu-Awka (Government area)', lat: 6.2075, lng: 7.0605,
        junctions: [
          j('secretariat', 'Jerome Udoji Secretariat', 'State secretariat'),
          j('govt-house', 'Government House Road'),
        ],
      },
      {
        id: 'amawbia', name: 'Amawbia', lat: 6.1925, lng: 7.0525,
        junctions: [j('amawbia-rbt', 'Amawbia Roundabout', 'Enugu–Onitsha Expressway')],
      },
      {
        id: 'amansea', name: 'Amansea', lat: 6.2612, lng: 7.1388,
        junctions: [j('amansea-jn', 'Amansea Junction', 'Towards Enugu')],
      },
      {
        id: 'mgbakwu', name: 'Mgbakwu', lat: 6.2705, lng: 7.0915,
        junctions: [j('mgbakwu-jn', 'Mgbakwu Junction')],
      },
    ],
  },
  { id: 'onitsha', name: 'Onitsha', state: 'Anambra State', country: 'Nigeria', active: false, lat: 6.1413, lng: 6.8029, areas: [] },
  { id: 'nnewi', name: 'Nnewi', state: 'Anambra State', country: 'Nigeria', active: false, lat: 6.0187, lng: 6.9149, areas: [] },
  { id: 'enugu', name: 'Enugu', state: 'Enugu State', country: 'Nigeria', active: false, lat: 6.4584, lng: 7.5464, areas: [] },
];

/** The launch city — used as the default everywhere. */
export const DEFAULT_CITY = 'awka';
/** Primary focus area for marketing copy. */
export const FOCUS_AREA = { id: 'ifite', name: 'Ifite-Awka', campus: 'UNIZIK' };

export const activeCities = cities.filter((c) => c.active);

export const findCity = (id?: string) => cities.find((c) => c.id === id);
export const findArea = (cityId?: string, areaId?: string) => findCity(cityId)?.areas.find((a) => a.id === areaId);

/** Look up a junction anywhere in a city and return it with its parent area. */
export const findJunction = (cityId?: string, junctionId?: string) => {
  const city = findCity(cityId);
  if (!city) return undefined;
  for (const area of city.areas) {
    const junction = area.junctions.find((x) => x.id === junctionId);
    if (junction) return { city, area, junction };
  }
  return undefined;
};

export const junctionLabel = (cityId?: string, junctionId?: string) => {
  const hit = findJunction(cityId, junctionId);
  return hit ? `${hit.junction.name}, ${hit.area.name}` : '—';
};

export const cityName = (cityId?: string) => findCity(cityId)?.name ?? '—';
