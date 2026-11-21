/**
 * Everything the site says about the company, in one place. Only what the client has given us is filled in; anything
 * still missing is `TBD` - the page then shows a visible "[... to be provided]" marker, structured data leaves it out,
 * and `npm run check:placeholders` (run before every build) lists it.
 */
export const TBD = null;

/**
 * The live address of the site: the client's own domain (also public/CNAME and GitHub › Settings › Pages). Links,
 * sitemap and indexing follow it. On GitHub's own address (a sub-folder of <user>.github.io) the site would be a
 * preview, kept out of search results.
 */
export const SITE_URL = 'https://suryodayasolarpower.in';

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
  /** A few lines about the company (About › Who we are) - nothing in it the company hasn't told us. */
  story: "Suryodaya means sunrise, and that is the idea behind the company: to put the sunshine falling on Ajmer's roofs to work for the homes and businesses beneath them. We size each system to how the place actually uses power, fit panels and inverters from brands people know, and explain the options plainly - what each system does and what it doesn't - so you can decide with confidence." as string | null,
} as const;

export const ADDRESS = {
  lines: ['Plot No. 31, Krishna Vihar Colony', 'Near Kabir Ashram, Lohagal', 'Ajmer, Rajasthan 305004'],
  oneLine: 'Plot No. 31, Krishna Vihar Colony, Near Kabir Ashram, Lohagal, Ajmer, Rajasthan 305004',
  street: 'Plot No. 31, Krishna Vihar Colony, Near Kabir Ashram, Lohagal',
  locality: 'Ajmer',
  region: 'Rajasthan',
  country: 'IN',
  postalCode: '305004' as string | null,
} as const;

/**
 * The map: the company's own Google listing (Maps: photos, hours, reviews) - found by `query`, centred on its pin - and
 * its link for "Open in Google Maps". Searching the name shows the listing's card on the map; the bare pin would not.
 */
export const MAP = {
  query: 'Suryodaya Solar Power, Lohagal, Ajmer',
  pin: '26.5122871,74.652463' as string | null,
  listing: 'https://maps.google.com/?cid=15367139239213042355' as string | null,
};

const whatsappDigits = '918078681486';

/** Phone and WhatsApp: the client's mobile, 80786 81486, for both. */
export const CONTACT = {
  phone: '+91 80786 81486',
  phoneHref: 'tel:+918078681486',
  whatsappNumber: '+91 80786 81486',
  whatsappDigits,
  email: 'suryodayasolar26@gmail.com' as string | null,
  hours: 'Monday to Saturday, 9 AM to 5 PM; closed on Sunday' as string | null,
} as const;

/** The same office hours for search engines (structured data); null leaves them out. */
export const OPENING_HOURS = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '09:00',
  closes: '17:00',
} as { days: string[]; opens: string; closes: string } | null;

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
