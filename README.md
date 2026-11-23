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

## Adding an installation (a customer at a time)

This is the regular job. Each customer is one folder: `src/installations/<customer>-<place>/` with `details.yaml` and
their photos (videos in `public/installations/<same name>/`). The client sends, on WhatsApp, the photos and videos and
this message, filled in:

```
Customer: Ramesh Kumar
Village/City: Kishangarh
District: Ajmer                  (optional)
Capacity: 3 kW
Type: On-grid / Off-grid / Hybrid
Panels: Waaree (DCR)             (DCR or non-DCR, optional)
Inverter: Polycab                (optional)
Installed: November 2026
Feedback: the customer's own words, in their language (optional)
```

Put the files in a folder, paste the message into `details.txt` in it, then:

```bash
git checkout main && git pull
git checkout -b feature/installation-ramesh-kumar
npm run add-installation -- "D:\From client\Ramesh Kumar"
# more photos later for the same customer:
#   npm run add-installation -- "D:\From client\Ramesh more" --to ramesh-kumar-kishangarh
npm run dev                       # look at /projects/, the customer's page and the home page
git add src/installations public/installations
git commit -m "Installation: Ramesh Kumar, Kishangarh"
git push -u origin feature/installation-ramesh-kumar
# open the PR on GitHub and merge it - the merge publishes the site
```

What `add-installation` does:

- Reads the message (any order, extra lines like "Show name: yes" ignored; "3kw", "on grid", "Nov 2026", "11/2026" all
  understood) and writes `details.yaml` - check it before committing; correct it by hand if anything is off. An existing
  customer's `details.yaml` is never overwritten.
- **Photos** (JPG, PNG, WebP) are turned upright, resized to 2000 px at most, saved as JPEG and **stripped of their
  metadata** - phone photos carry the GPS position of the customer's house. The build makes the small and large copies.
- **Videos** (MP4) are copied as they are. Over 25 MB is warned about, over 90 MB refused (GitHub's limit is 100 MB a
  file). Short clips work best; WhatsApp-forwarded videos are already MP4 and small. Long ones belong on YouTube.
- iPhone HEIC photos and MOV videos are refused with a message - ask the client to share them through WhatsApp.
- A file's name becomes its caption unless it is a camera name (`IMG_1234.jpg`, `WhatsApp Image ...`). The first photo
  by name is the cover; `cover: <file name>` in `details.yaml` picks another.
- Files already added are skipped, so running it twice is harmless.

Everything else follows on its own:

- **Installations** (`/projects/`): the table - customer, village / city, panels, capacity, type, photos - with type,
  place and search filters, and the totals at the top; a card per row on phones.
- **The customer's page** (`/projects/<folder>/`): the details, their feedback, every photo and video (opening full
  screen), more installations.
- **Home page**: the latest three installations, and "What our customers say" (the latest three with feedback; the
  section stays away until there is one).
- **A page per village or city** (`/solar-installation/<place>/`, "Solar Installation in Kishangarh") once it has
  **3 or more** installations - Ajmer aside, which is the home page's. Fewer would be thin pages Google ranks poorly.

Until the first real customer is added, the three **sample installations** (`src/installations/sample-*`, marked
"Sample" everywhere, kept out of the sitemap and search results) stand in - they disappear by themselves after that;
delete their folders whenever convenient. To remove a customer, delete their folder(s) and push.

## Notices (news on the home page)

One file per notice in `src/notices/`, named `<YYYY-MM-DD>-<words>.md` (the address becomes `/news/<file name>/`):

```md
---
title: 'PM Surya Ghar: last date to apply is 31 March 2027'
summary: One or two lines - shown on the card and in the strip.
date: 2026-11-22
type: Subsidy            # Subsidy, Offer, Holiday, Update or Project
showUntil: 2027-03-31    # optional: off the home page and the strip after this day
banner: true             # optional: also in the yellow strip above every page
link: /guides/pm-surya-ghar-subsidy-ajmer/   # optional: the button (a page of the site, or https://...)
linkText: Read the guide
source: https://pmsuryaghar.gov.in/          # government notices: the official page it comes from
---

The notice in full, for its own page.
```

The home page shows the latest three current notices; the strip shows the newest one with `banner: true` (a visitor
can close it - a new notice shows again). The site rebuilds itself every night just after midnight in India, so a notice
leaves on the day after its `showUntil`; the page also hides it the same day if a visitor has it open. Ended notices
stay on `/news/` under "Earlier", marked as ended. **A subsidy or government date only goes up with its official
source**, and comes down (`showUntil`) when it no longer holds.

## Guides

The longer how-to pages are `src/guides/<slug>.md` (`/guides/<slug>/`): title, description, heading, lead, the day
updated, the official sources and the questions in the front matter; the text below. They are listed on `/news/` and in
the footer. Today: the PM Surya Ghar subsidy, and net metering with AVVNL. **Check them against the official pages
when the scheme changes**, and move `updated:`.

## Where things are

| What | Where |
|---|---|
| Name, address, phone / WhatsApp, email, hours, map pin, domain | `src/data/site.ts` - `TBD` = still to come |
| The five solutions (cards, pages, questions) | `src/data/solutions.ts` |
| Panel and inverter brands, DCR / phase words | `src/data/brands.ts` |
| Installations (a folder each) | `src/installations/`, read by `src/lib/installations.ts`; `components/InstallationCard.astro`, `Testimonials.astro`, `GalleryGrid.astro`, `Lightbox.astro` |
| Notices and guides | `src/notices/`, `src/guides/` (`src/content.config.ts` lists their fields); `src/lib/notices.ts`, `components/NoticeStrip.astro`, `NewsCards.astro` |
| Enquiry form (sends to WhatsApp) | `components/EnquiryForm.astro` |
| Pages | `src/pages/` (home, solar-solutions + one per solution, products, projects + one per installation, solar-installation/<place>, news + one per notice, guides, about, contact, privacy-policy, 404) |
| Look | `src/styles/global.css` (green and white tokens at the top; Poppins + Inter served from the site) |
| Site photos (hero, sections) | `src/assets/site/` - free Unsplash photos, replace with the client's when they have good ones |
| Logo | `src/assets/brand/`: the client's original (on black) and the transparent cut-out made from it; `components/Logo.astro` (a dark tile on light backgrounds); icons and `og-card.jpg` in `public/` |

## Placeholders

Anything the client has not given us shows on the page as **[... - to be provided]** and is left out of the structured
data. `npm run check:placeholders` (also run by every build) lists them. Still open:

- real installations - the sample installations are shown until the first customer is added

Nothing in the text is open (21 Nov 2026): email from the client; PIN, map pin and office hours from the company's
Google listing; the About lines written for them; the privacy policy dated the day it went live. Customers' phone
numbers are not on the site; the client will send them later, and how to show them is decided then.

## Enquiries

A static site cannot keep form entries, so the form **writes the enquiry as a WhatsApp message** to the company's
number and opens WhatsApp - the visitor presses Send. Nothing to set up or pay for, and every enquiry lands in the
same WhatsApp the business already answers. Call and WhatsApp buttons are on every page (the phone's bottom bar, the
floating button on bigger screens).

## Rules for what the site says

- Only what the client has told us: no prices, savings figures, subsidy promises, warranties, certifications, years
  of experience or "authorised dealer" claims until the client confirms them in writing.
- No prices or costs at all - the client's decision (22 Nov 2026).
- Brands are shown as names, not logos (logos need the maker's permission).
- Samples are always labelled as samples; no invented projects or reviews. Feedback is the customer's own words,
  exactly as given, in their language - never written or polished by us.

## Links inside the site

Every internal address goes through `link()` from `src/data/site.ts` (`href={link('/products/')}`): on the domain it
adds nothing, on a GitHub sub-folder address it would add the sub-folder. Never write a bare `href="/..."`. (Links
inside the guides' and notices' Markdown are plain `/...` - fine on the domain; they would need the sub-folder if the
site ever moved back to GitHub's address.)

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
