/**
 * The site's own records - a file each, nothing to list by hand:
 *   installations  src/installations/<slug>/details.yaml, that customer's photos beside it and videos in
 *                  public/installations/<slug>/ (`npm run add-installation` writes them; see README)
 *   notices        src/notices/<YYYY-MM-DD>-<slug>.md - news and announcements: the strip above the header, the home
 *                  page's "Latest news" and /news/
 *   guides         src/guides/<slug>.md - the longer how-to pages, /guides/<slug>/
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A day as YYYY-MM-DD, written plain in YAML (which reads it as a date) or quoted. */
const day = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
  .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)));

const installations = defineCollection({
  loader: glob({ pattern: '*/details.yaml', base: './src/installations', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.object({
    customer: z.string(),
    /** The village or city. */
    place: z.string(),
    district: z.string().optional(),
    capacityKw: z.number().positive(),
    type: z.enum(['On-Grid', 'Off-Grid', 'Hybrid']),
    panels: z.string(),
    panelKind: z.enum(['DCR', 'non-DCR']).optional(),
    inverter: z.string().optional(),
    /** The month, 'YYYY-MM' (quoted). */
    installed: z.string().regex(/^\d{4}-\d{2}$/),
    /** The customer's own words, exactly as they gave them, in their language. */
    feedback: z.string().optional(),
    /** The photo shown first (a file name in the folder); otherwise the first by name. */
    cover: z.string().optional(),
    /** Stands in until the first real installation is added, marked "Sample" everywhere. */
    sample: z.boolean().default(false),
  }),
});

const notices = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/notices' }),
  schema: z.object({
    title: z.string(),
    /** One or two lines: the card and the strip. The file's text is the notice's own page. */
    summary: z.string(),
    date: day,
    type: z.enum(['Subsidy', 'Offer', 'Holiday', 'Update', 'Project']),
    /** The last day it shows on the home page and the strip; after that it is listed under "Earlier" on /news/. */
    showUntil: day.optional(),
    /** Also in the strip above every page's header (the newest such notice). */
    banner: z.boolean().default(false),
    /** Where its button goes: a page of the site ('/guides/...') or another site. */
    link: z.string().optional(),
    linkText: z.string().optional(),
    /** The official page a government notice comes from. */
    source: z.url().optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/guides' }),
  schema: z.object({
    /** The short name: breadcrumbs, lists and links. */
    name: z.string(),
    /** <title> (under ~60 characters) and meta description (~150). */
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    lead: z.string(),
    updated: day,
    /** The official pages it is written from. */
    sources: z.array(z.object({ name: z.string(), url: z.url() })),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { installations, notices, guides };
