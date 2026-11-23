/**
 * The customers we have installed for: src/installations/customers.yaml (a customer each, numbered as on the client's
 * list) and their photos, src/installations/photos/<number as 3 digits>.jpg - with the GPS stamp blurred, and a
 * thumbnail of the panels in photos/thumbs/, as `npm run add-customer` writes them. A customer without a photo yet
 * is listed all the same.
 */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';

export interface Installation {
  id: number;
  customer: string;
  place: string;
  district?: string;
  /** "Lohagal, Ajmer", or the place alone. */
  where: string;
  capacityKw: number;
  panels: string;
  /** 'YYYY-MM' and "Nov 2026", when known. */
  installed?: string;
  month?: string;
  photo?: ImageMetadata;
  /** The top of the photo (the panels): the table's small picture and the home page's card. */
  thumb?: ImageMetadata;
}

const photos = import.meta.glob<{ default: ImageMetadata }>('../installations/photos/**/*.jpg', { eager: true });
const photoOf = (id: number, dir = '') => photos[`../installations/photos/${dir}${String(id).padStart(3, '0')}.jpg`]?.default;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** '2026-09' -> "Sep 2026". */
export function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Kishangarh" -> "kishangarh", "Kabir Nagar" -> "kabir-nagar". */
export const placeSlug = (place: string) =>
  place.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** 3.5 -> "3.5 kW", with a space that never breaks the figure from its unit. */
export const kw = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1).replace(/\.0$/, '')} kW`;

/** What the large photo says under it, and its alt text. */
export const photoCaption = (i: Installation) => `${i.customer} · ${i.where} · ${kw(i.capacityKw)}`;
export const photoAlt = (i: Installation) => `Solar panels and inverter installed for ${i.customer}, ${i.where}`;

let cache: Installation[] | undefined;

/** Every installation, the newest (highest number) first. */
export async function installations(): Promise<Installation[]> {
  cache ??= (await getCollection('installations'))
    .map(({ data }) => ({
      ...data,
      where: data.district ? `${data.place}, ${data.district}` : data.place,
      month: data.installed && monthLabel(data.installed),
      photo: photoOf(data.id),
      thumb: photoOf(data.id, 'thumbs/'),
    }))
    .sort((a, b) => b.id - a.id);
  return cache;
}

/** Places with a page of their own (/solar-installation/<place>/): 3 or more installations, Ajmer itself aside (the
 *  home page is Ajmer's). Fewer would make thin pages that search engines rank poorly. */
export const PLACE_PAGE_MIN = 3;
export async function placePages(): Promise<{ slug: string; place: string; items: Installation[] }[]> {
  const groups = new Map<string, Installation[]>();
  for (const i of await installations()) {
    const slug = placeSlug(i.place);
    if (slug !== 'ajmer') groups.set(slug, [...(groups.get(slug) ?? []), i]);
  }
  return [...groups]
    .filter(([, items]) => items.length >= PLACE_PAGE_MIN)
    .map(([slug, items]) => ({ slug, place: items[0].where, items }));
}

export const totals = (list: Installation[]) => ({
  count: list.length,
  kw: list.reduce((sum, i) => sum + i.capacityKw, 0),
  places: new Set(list.map((i) => placeSlug(i.where))).size,
});
