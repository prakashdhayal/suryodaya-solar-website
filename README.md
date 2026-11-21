# suryodaya-solar-website

The website of **Suryodaya Solar Power**, Ajmer - built with [Astro](https://astro.build) as plain static pages and
published by GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

- **Live:** https://suryodayasolarpower.in (domain at GoDaddy, see *The domain*). The old preview address,
  https://prakashdhayal.github.io/suryodaya-solar-website/, is sent on to it by GitHub.

## Run it

```bash
npm ci
npm run dev        # http://localhost:4321, changes show as you save
npm run build      # the site in dist/ (first lists anything still "to be provided")
npm run preview    # serve dist/ to check the build
npm run check      # type-check every page
```

## Adding the client's photos and videos (weekly / monthly)

This is the only regular job. Put what the client sent in any folder, then:

```bash
git checkout main && git pull
git checkout -b feature/photos-2026-11-week-3
npm run add-media -- "D:\From client\2026-11 week 3"      # or add --month 2026-10 for an older month
npm run dev                                                # look at /projects/ and the home page
git add src/assets/gallery public/gallery
git commit -m "Gallery: November week 3"
git push -u origin feature/photos-2026-11-week-3
# open the PR on GitHub and merge it - the merge publishes the site
```

What `add-media` does:

- **Photos** (JPG, PNG, WebP) are turned upright, resized to 2000 px at most, saved as JPEG in
  `src/assets/gallery/<YYYY-MM>/`, and **stripped of their metadata** - phone photos carry the GPS position of the
  customer's house. The build makes the small and large copies for the site.
- **Videos** (MP4) are copied to `public/gallery/videos/<YYYY-MM>/`. Over 25 MB is warned about, over 90 MB refused
  (GitHub's limit is 100 MB a file). Short clips work best; WhatsApp-forwarded videos are already MP4 and small.
- iPhone HEIC photos and MOV videos are refused with a message - ask the client to share them through WhatsApp,
  which converts them.
- A file's name becomes its caption unless it is a camera name: `rooftop-on-grid-kishangarh.jpg` shows "Rooftop on grid
  kishangarh"; `IMG_1234.jpg` and `WhatsApp Image ...` show none. Rename before adding when a caption helps.
- Files already added are skipped, so running it twice is harmless.

The gallery (`/projects/`, grouped by month, newest first, with a Photos / Videos filter) and the home page's
"Our installations" (the latest six) pick everything up on their own. Until the first real photo or video is added,
**sample images** stand in, each marked "Sample image" with a note saying so - they disappear by themselves after
that. To remove a photo, delete its file and push.

## Where things are

| What | Where |
|---|---|
| Name, address, phone / WhatsApp, email, hours, map pin, domain | `src/data/site.ts` - `TBD` = still to come |
| The five solutions (cards, pages, questions) | `src/data/solutions.ts` |
| Panel and inverter brands, DCR / phase words | `src/data/brands.ts` |
| Gallery (reads the folders) | `src/lib/gallery.ts`, `components/GalleryGrid.astro`, `components/Lightbox.astro` |
| Enquiry form (sends to WhatsApp) | `components/EnquiryForm.astro` |
| Pages | `src/pages/` (home, solar-solutions + one per solution, products, projects, about, contact, privacy-policy, 404) |
| Look | `src/styles/global.css` (green and white tokens at the top; Poppins + Inter served from the site) |
| Site photos (hero, sections) | `src/assets/site/` - free Unsplash photos, replace with the client's when they have good ones |
| Logo | `src/assets/brand/`: the client's original (on black) and the transparent cut-out made from it; `components/Logo.astro` (a dark tile on light backgrounds); icons and `og-card.jpg` in `public/` |

## Placeholders

Anything the client has not given us shows on the page as **[... - to be provided]** and is left out of the structured
data. `npm run check:placeholders` (also run by every build) lists them. Still open:

- email, office hours, PIN code, the exact map pin, the company's own story (About)
- the privacy policy's "last updated" date, once the client approves it

## Enquiries

A static site cannot keep form entries, so the form **writes the enquiry as a WhatsApp message** to the company's
number and opens WhatsApp - the visitor presses Send. Nothing to set up or pay for, and every enquiry lands in the
same WhatsApp the business already answers. Call and WhatsApp buttons are on every page (the phone's bottom bar, the
floating button on bigger screens).

## Rules for what the site says

- Only what the client has told us: no prices, savings figures, subsidy promises, warranties, certifications, years
  of experience or "authorised dealer" claims until the client confirms them in writing.
- Brands are shown as names, not logos (logos need the maker's permission).
- Sample photos are always labelled as samples; no invented projects or reviews.

## Links inside the site

Every internal address goes through `link()` from `src/data/site.ts` (`href={link('/products/')}`): on the domain it
adds nothing, on a GitHub sub-folder address it would add the sub-folder. Never write a bare `href="/..."`.

## The domain

`suryodayasolarpower.in` (bought at GoDaddy, 21 Nov 2026), the bare domain; `www` is sent on to it by GitHub. It is set
in three places that must agree: `SITE_URL` in `src/data/site.ts`, `public/CNAME`, and **GitHub › Settings › Pages ›
Custom domain** (with *Enforce HTTPS* on once GitHub has issued the certificate).

DNS records at GoDaddy (the same as kpktrinextechnologies.in):

   | Type | Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
   | CNAME | www | `prakashdhayal.github.io` |
   | TXT | `_github-pages-challenge-prakashdhayal` | from GitHub › Settings (account) › Pages › Verified domains |

## Google

- **Search Console**: add a *Domain* property and verify with the TXT record it gives (or put its meta-tag token in the
  repository variable `GOOGLE_SITE_VERIFICATION`). Submit `https://<domain>/sitemap-index.xml`.
- **Analytics (GA4)**: create a property and put its ID (`G-XXXXXXX`) in the repository variable `GA_ID`
  (Settings › Secrets and variables › Actions › Variables), then re-run the deploy. Calls, WhatsApp taps, quote clicks,
  map opens and sent enquiries (`generate_lead`) are recorded as events; the privacy policy gains its analytics
  paragraph automatically. Empty = no analytics, no cookies.
- **Google Business Profile**: the biggest lever for "solar company in Ajmer" on Maps. The client should claim it with
  exactly the name, address and phone used here, add real photos and ask customers for reviews.
