/**
 * The gallery is whatever is in the folders - nothing to list by hand:
 *   photos  src/assets/gallery/<YYYY-MM>/<file>.jpg   (resized into many sizes at build)
 *   videos  public/gallery/videos/<YYYY-MM>/<file>.mp4 (served as they are)
 * `npm run add-media -- <folder>` puts the client's files there. Newest month first. Until the first real photo or
 * video arrives, the sample photos stand in, each marked "Sample image".
 */
import type { ImageMetadata } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { link } from '../data/site';

export interface GalleryItem {
  kind: 'photo' | 'video';
  /** Sorting key: "<month folder>/<file name>". */
  key: string;
  image?: ImageMetadata;
  /** The video's public address. */
  video?: string;
  alt: string;
  caption: string;
  month: string | null;
  sample: boolean;
}

export interface GalleryMonth {
  month: string | null;
  label: string;
  items: GalleryItem[];
}

const uploaded = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/gallery/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);
const samples = import.meta.glob<{ default: ImageMetadata }>('../assets/samples/*.jpg', { eager: true });

const VIDEO_DIR = path.resolve('public/gallery/videos');
const MONTH = /^\d{4}-\d{2}$/;
/** File names cameras and WhatsApp give - they say nothing about the photo. */
const CAMERA_NAME = /^(img|dsc|dscn|pxl|vid|mvimg|photo|image|whatsapp|wa\d|screenshot|\d+$)/i;

export function monthLabel(month: string | null) {
  if (!month) return 'Earlier';
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "2026-11-20-rooftop-on-grid-kishangarh-02" -> "Rooftop on grid kishangarh"; camera names -> "". */
function captionOf(file: string) {
  const words = path
    .parse(file)
    .name.replace(/^\d{4}-\d{2}-\d{2}[-_ ]?/, '')
    .replace(/[-_ ]?\d+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!words || CAMERA_NAME.test(words) || !/[a-z]/i.test(words)) return '';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function describe(kind: GalleryItem['kind'], key: string): Omit<GalleryItem, 'image' | 'video'> {
  const parts = key.split('/');
  const month = parts.length > 1 && MONTH.test(parts[0]) ? parts[0] : null;
  const caption = captionOf(parts[parts.length - 1]);
  const what = kind === 'video' ? 'Solar installation video' : 'Solar installation';
  const alt = caption || `${what} by Suryodaya Solar Power${month ? `, ${monthLabel(month)}` : ''}`;
  return { kind, key, alt, caption, month, sample: false };
}

function videos(): GalleryItem[] {
  if (!fs.existsSync(VIDEO_DIR)) return [];
  return fs
    .readdirSync(VIDEO_DIR, { recursive: true, encoding: 'utf8' })
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => /\.mp4$/i.test(f))
    .map((key) => ({ ...describe('video', key), video: link(`/gallery/videos/${key.split('/').map(encodeURIComponent).join('/')}`) }));
}

function photos(): GalleryItem[] {
  return Object.entries(uploaded).map(([file, mod]) => {
    const key = file.replace('../assets/gallery/', '');
    return { ...describe('photo', key), image: mod.default };
  });
}

const SAMPLE_ALT: Record<string, string> = {
  'sample-01-panels-on-grass.jpg': 'Sample image: solar panels on a grassy field',
  'sample-02-panel-rows-sky.jpg': 'Sample image: rows of solar panels under a blue sky',
  'sample-03-panel-array.jpg': 'Sample image: a solar panel array',
  'sample-04-panels-near-trees.jpg': 'Sample image: solar panels near trees',
  'sample-05-rooftop-fitting.jpg': 'Sample image: a solar panel being fitted on a roof',
  'sample-06-factory-roof.jpg': 'Sample image: solar panels on a factory roof',
};

function sampleItems(): GalleryItem[] {
  return Object.entries(samples)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([file, mod]) => {
      const name = path.basename(file);
      return { kind: 'photo', key: name, image: mod.default, alt: SAMPLE_ALT[name] ?? 'Sample image', caption: '', month: null, sample: true };
    });
}

/** Every item, newest first; the samples when nothing real has been added yet. */
export function galleryItems(): GalleryItem[] {
  const real = [...photos(), ...videos()].sort((a, b) => b.key.localeCompare(a.key));
  return real.length ? real : sampleItems();
}

export function galleryByMonth(): GalleryMonth[] {
  const months: GalleryMonth[] = [];
  for (const item of galleryItems()) {
    const last = months[months.length - 1];
    if (last && last.month === item.month) last.items.push(item);
    else months.push({ month: item.month, label: item.sample ? 'Sample images' : monthLabel(item.month), items: [item] });
  }
  return months;
}

export const showingSamples = () => galleryItems().some((i) => i.sample);
