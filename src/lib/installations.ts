/**
 * The installations: a folder per customer - nothing to list by hand.
 *   src/installations/<slug>/details.yaml        who, where, what (src/content.config.ts)
 *   src/installations/<slug>/<photo>.jpg          resized into many sizes at build
 *   public/installations/<slug>/<video>.mp4       served as they are
 * `npm run add-installation` writes them. Until the first real one is added, the sample installations stand in, each
 * marked "Sample"; after that they are left out on their own.
 */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import { link } from '../data/site';
import type { SystemType } from '../data/solutions';

export interface GalleryItem {
  kind: 'photo' | 'video';
  image?: ImageMetadata;
  /** The video's public address. */
  video?: string;
  alt: string;
  caption: string;
  sample: boolean;
}

export interface Installation {
  slug: string;
  href: string;
  customer: string;
  place: string;
  district?: string;
  capacityKw: number;
  type: SystemType;
  panels: string;
  panelKind?: 'DCR' | 'non-DCR';
  inverter?: string;
  /** 'YYYY-MM' and "November 2026". */
  installed: string;
  month: string;
  feedback?: string;
  sample: boolean;
  /** Photos first, then videos. */
  media: GalleryItem[];
  cover?: ImageMetadata;
  photoCount: number;
  videoCount: number;
}

const photoFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../installations/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);
const VIDEO_DIR = path.resolve('public/installations');
/** File names cameras and WhatsApp give - they say nothing about the photo. */
const CAMERA_NAME = /^(img|dsc|dscn|pxl|vid|mvimg|photo|image|whatsapp|wa\d|screenshot|\d+$)/i;

export function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "2-rooftop-on-grid-02.jpg" -> "Rooftop on grid"; camera names -> "". */
function captionOf(file: string) {
  const words = path
    .parse(file)
    .name.replace(/^\d{4}-\d{2}-\d{2}[-_ ]?/, '')
    .replace(/^\d+[-_ ]/, '')
    .replace(/[-_ ]?\d+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!words || CAMERA_NAME.test(words) || !/[a-z]/i.test(words)) return '';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "Kishangarh" -> "kishangarh", "Ajmer Road, Beawar" -> "ajmer-road-beawar". */
export const placeSlug = (place: string) =>
  place.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const kw = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1).replace(/\.0$/, '')} kW`;

/** The folder's photos (the cover first, then by name), then its videos. */
function mediaOf(slug: string, who: string, sample: boolean, cover?: string): GalleryItem[] {
  const describe = (kind: GalleryItem['kind'], file: string) => {
    const caption = captionOf(file);
    const what = kind === 'video' ? 'Solar installation video' : 'Solar installation';
    return { kind, caption, alt: `${caption || what} - ${who}${sample ? ' (sample image)' : ''}`, sample };
  };
  const photos = Object.entries(photoFiles)
    .filter(([file]) => file.split('/')[2] === slug)
    .sort(([a], [b]) => Number(path.basename(b) === cover) - Number(path.basename(a) === cover) || a.localeCompare(b))
    .map(([file, mod]) => ({ ...describe('photo', path.basename(file)), image: mod.default }));
  const dir = path.join(VIDEO_DIR, slug);
  const videos = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => /\.mp4$/i.test(f))
        .sort()
        .map((f) => ({ ...describe('video', f), video: link(`/installations/${slug}/${encodeURIComponent(f)}`) }))
    : [];
  return [...photos, ...videos];
}

let cache: Installation[] | undefined;

/** Every installation, newest first; the samples only while there is no real one. */
export async function installations(): Promise<Installation[]> {
  if (cache) return cache;
  const all = (await getCollection('installations')).map(({ id, data }): Installation => {
    const media = mediaOf(id, `${data.customer}, ${data.place}`, data.sample, data.cover);
    const photoCount = media.filter((m) => m.kind === 'photo').length;
    return {
      ...data,
      slug: id,
      href: link(`/projects/${id}/`),
      month: monthLabel(data.installed),
      media,
      cover: media[0]?.image,
      photoCount,
      videoCount: media.length - photoCount,
    };
  });
  const real = all.filter((i) => !i.sample);
  cache = (real.length ? real : all).sort(
    (a, b) => b.installed.localeCompare(a.installed) || a.customer.localeCompare(b.customer),
  );
  return cache;
}

/** Places with a page of their own (/solar-installation/<place>/): 3 or more real installations, Ajmer itself aside
 *  (the home page is Ajmer's). */
export const PLACE_PAGE_MIN = 3;
export async function placePages(): Promise<{ slug: string; place: string; items: Installation[] }[]> {
  const groups = new Map<string, Installation[]>();
  for (const i of await installations()) {
    if (i.sample || placeSlug(i.place) === 'ajmer') continue;
    groups.set(placeSlug(i.place), [...(groups.get(placeSlug(i.place)) ?? []), i]);
  }
  return [...groups]
    .filter(([, items]) => items.length >= PLACE_PAGE_MIN)
    .map(([slug, items]) => ({ slug, place: items[0].place, items }));
}

export const totals = (list: Installation[]) => ({
  count: list.length,
  kw: list.reduce((sum, i) => sum + i.capacityKw, 0),
  places: new Set(list.map((i) => placeSlug(i.place))).size,
});
