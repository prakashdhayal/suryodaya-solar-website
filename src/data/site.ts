/**
 * Everything the site says about the company, in one place. Only what the client has given us is filled in; anything
 * still missing is `TBD` - the page then shows a visible "[... to be provided]" marker, structured data leaves it out,
 * and `npm run check:placeholders` (run before every build) lists it.
 */
export const TBD = null;

/**
 * The live address of the site. Until the client's domain is connected it is GitHub's own address, a sub-folder of
 * prakashdhayal.github.io - a preview, kept out of search results. When the domain comes: put it here (no path, e.g.
 * 'https://www.example.in') and set it in GitHub › Settings › Pages; links, sitemap and indexing follow.
 */
export const SITE_URL = 'https://prakashdhayal.github.io/suryodaya-solar-website';

/** The sub-folder the site sits in: '' on its own domain, '/suryodaya-solar-website' on GitHub's address. */
export const BASE_PATH = new URL(SITE_URL).pathname.replace(/\/$/, '');

/** On GitHub's address the site is a preview: every page says noindex. */
export const PREVIEW = new URL(SITE_URL).hostname.endsWith('.github.io');

/** A page or file of this site by its path from the site's root: link('/products/'). Anchors (#enquiry) pass through. */
export const link = (path: string) => (path.startsWith('/') ? BASE_PATH + path : path);

export const COMPANY = {
  name: 'Suryodaya Solar Power',
  short: 'Suryodaya Solar',
  tagline: 'Solar power for homes and businesses in Ajmer',
  /** One or two lines about the company in the client's own words - TBD until they send them. */
  story: TBD as string | null,
} as const;

export const ADDRESS = {
  lines: ['Plot No. 31, Krishna Vihar Colony', 'Near Kabir Ashram, Lohagal', 'Ajmer, Rajasthan'],
  oneLine: 'Plot No. 31, Krishna Vihar Colony, Near Kabir Ashram, Lohagal, Ajmer, Rajasthan',
  street: 'Plot No. 31, Krishna Vihar Colony, Near Kabir Ashram, Lohagal',
  locality: 'Ajmer',
  region: 'Rajasthan',
  country: 'IN',
  postalCode: TBD as string | null,
} as const;

/**
 * The map: what Google is asked to find. Once the client sends the office's Google Maps link (or its exact pin),
 * put the coordinates in `pin` ("26.4499,74.6399") and the map points at the door instead of the street.
 */
export const MAP = {
  query: ADDRESS.oneLine,
  pin: TBD as string | null,
};

const whatsappDigits = '918078681486';

/** Phone and WhatsApp: the client's mobile, 80786 81486, for both. */
export const CONTACT = {
  phone: '+91 80786 81486',
  phoneHref: 'tel:+918078681486',
  whatsappNumber: '+91 80786 81486',
  whatsappDigits,
  email: TBD as string | null,
  hours: TBD as string | null,
} as const;

/** A WhatsApp chat with the company, with a first message typed in for the visitor. */
export function whatsappLink(text = `Hello ${COMPANY.name}, I would like to know about solar for my place.`) {
  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(text)}`;
}

export const QUOTE_HREF = '/contact/#enquiry';

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/solar-solutions/', label: 'Solar Solutions' },
  { href: '/products/', label: 'Products & Brands' },
  { href: '/projects/', label: 'Projects' },
  { href: '/about/', label: 'About Us' },
  { href: '/contact/', label: 'Contact' },
] as const;

/** Google Analytics and Search Console: switched on by the repository's variables (see README), off when empty. */
export const ANALYTICS_ID = import.meta.env.PUBLIC_GA_ID || '';
export const SEARCH_CONSOLE_TOKEN = import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '';
