/**
 * The site's own records:
 *   installations  src/installations/customers.yaml - a customer each, the photos in src/installations/photos/
 *                  (`npm run add-customer` writes them; see README)
 *   testimonials   src/installations/testimonials.yaml - what customers who agreed to be shown say (the home page)
 *   notices        src/notices/<YYYY-MM-DD>-<slug>.md - news and announcements: the strip above the header, the home
 *                  page's "Latest news" and /news/
 *   guides         src/guides/<slug>.md - the longer how-to pages, /guides/<slug>/
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A day as YYYY-MM-DD, written plain in YAML (which reads it as a date) or quoted. */
const day = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
  .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)));

const installations = defineCollection({
  loader: file('src/installations/customers.yaml'),
  schema: z.object({
    /** The number on the client's list; the photo is photos/<id as 3 digits>.jpg. */
    id: z.number().int().positive(),
    customer: z.string(),
    /** The village or city. */
    place: z.string(),
    district: z.string().optional(),
    capacityKw: z.number().positive(),
    panels: z.string(),
    /** The month, 'YYYY-MM' (quoted), when known. */
    installed: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
});

const testimonials = defineCollection({
  loader: file('src/installations/testimonials.yaml'),
  schema: z.object({
    /** The customer's number in customers.yaml. */
    id: z.number().int().positive(),
    name: z.string(),
    role: z.string().optional(),
    place: z.string(),
    rating: z.number().int().min(1).max(5),
    points: z.array(z.string()).default([]),
    comment: z.string(),
    /** The day the customer agreed to be shown. */
    agreed: day,
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

export const collections = { installations, testimonials, notices, guides };
