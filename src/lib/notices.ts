/**
 * Notices (src/notices/*.md): newest first. A notice shows on the home page and in the strip until its `showUntil`
 * day; after that /news/ lists it under "Earlier". The site is rebuilt every night (.github/workflows/deploy.yml), and
 * the page itself hides a notice whose day has passed (`data-until`, Base.astro), so one never outstays its day.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { link } from '../data/site';

export type Notice = CollectionEntry<'notices'>['data'] & { id: string; href: string; ended: boolean };

/** Today in India, YYYY-MM-DD - the build runs on a server in UTC. */
export const todayInIndia = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);

export function displayDay(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** A notice's button: a page of the site gets the site's address, another site stays as it is. */
export const noticeLink = (n: Notice) => (n.link ? link(n.link) : n.href);

export async function notices(): Promise<Notice[]> {
  const today = todayInIndia();
  return (await getCollection('notices'))
    .map(({ id, data }) => ({ ...data, id, href: link(`/news/${id}/`), ended: !!data.showUntil && data.showUntil < today }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export const currentNotices = async () => (await notices()).filter((n) => !n.ended);
