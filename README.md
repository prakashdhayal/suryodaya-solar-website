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

## The customers (Installations)

Every customer the company has installed for is one entry in `src/installations/customers.yaml`, numbered as on the
client's "List of Solar Customers" (77 on 24 Nov 2026), with one photo: `src/installations/photos/<number as 3
digits>.jpg`, and a thumbnail of its top (the panels) in `photos/thumbs/`. A customer without a photo is listed all
the same ("Photo to come"); the build lists who still has none (36, 47, 57, 61, 73, 74 and 75 today - 36's photo
was 28's again).

The client's photos come from the **GPS Map Camera** app, which writes the house's address, its latitude and
longitude and a map **into the picture**. Those are blurred before a photo goes on the site - never put one up as it
came.

To add a customer (the client sends name, village, kW, panel brand and a photo):

```bash
git checkout main && git pull
git checkout -b feature/customer-ramesh-kumar
npm run add-customer -- --name "Ramesh Kumar" --place Kishangarh --kw 3.5 --panels Tata --photo "D:\From client\ramesh.jpg"
#   optional: --district Ajmer (shown "Lohagal, Ajmer")   --installed 2026-12 (the month; the date on the photo's stamp)
# a photo for a customer already listed (no. 47):
#   npm run add-customer -- --photo-for 47 --photo "D:\From client\47.jpg"
npm run dev                       # look at /projects/ and the photo, opened large
git add src/installations
git commit -m "Customer: Ramesh Kumar, Kishangarh"
git push -u origin feature/customer-ramesh-kumar
# open the PR on GitHub and merge it - the merge publishes the site
```

What `add-customer` does:

- Gives the customer the next number and writes their entry (names in capitals become "Ramesh Kumar"; "tata" becomes
  "Tata Power Solar"). Correct `customers.yaml` by hand if anything is off - it is plain text.
- **The photo**: turned upright, at most 2000 px, saved as JPEG without its metadata, and every GPS stamp in it
  **blurred** (it says how many it found). **Open the photo and look**: no address or Lat/Long may be readable. Rarely
  it blurs a strip of panels by mistake - run it again with `--skip 0` (or the box's number it printed) to leave that
  one. iPhone HEIC photos are refused - ask for them through WhatsApp.
- Customer details are never changed by a photo, and a customer is never removed by the script: delete their entry
  (and photo) by hand.

What follows on its own:

- **Installations** (`/projects/`): the totals, then the table - number, customer, village / city, capacity, panels,
  month installed and the photo - 20 to a page, newest first, with panel brand, place and search filters. The photo
  opens large (arrows / swipe go through that page's photos). On phones each row is a card.
- **Home page**: the totals and the latest three customers with a photo.
- **A page per village or city** (`/solar-installation/<place>/`, "Solar Installation in Kishangarh") once it has
  **3 or more** customers - Ajmer itself aside, which is the home page's. Today: Lohagal, Karkeri, Kishangarh,
  Parbatsar, Rodawas, Kabir Nagar and Tityari.

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
| Customers and their photos | `src/installations/customers.yaml` and `photos/`, read by `src/lib/installations.ts`; `components/CustomerTable.astro` (the table and its pages), `InstallationCard.astro`, `Lightbox.astro`; the stamp blurring is `scripts/lib/gps-stamp.mjs` |
| Notices and guides | `src/notices/`, `src/guides/` (`src/content.config.ts` lists their fields); `src/lib/notices.ts`, `components/NoticeStrip.astro`, `NewsCards.astro` |
| Enquiry form (sends to WhatsApp) | `components/EnquiryForm.astro` |
| Pages | `src/pages/` (home, solar-solutions + one per solution, products, projects, solar-installation/<place>, news + one per notice, guides, about, contact, privacy-policy, 404) |
| Look | `src/styles/global.css` (green and white tokens at the top; Poppins + Inter served from the site) |
| Site photos (hero, sections) | `src/assets/site/` - free Unsplash photos, replace with the client's when they have good ones |
| Logo | `src/assets/brand/`: the client's original (on black) and the transparent cut-out made from it; `components/Logo.astro` (a dark tile on light backgrounds); icons and `og-card.jpg` in `public/` |

## Placeholders

Anything the client has not given us shows on the page as **[... - to be provided]** and is left out of the structured
data. `npm run check:placeholders` (also run by every build) lists them. Still open:

- a photo of 7 customers (listed by the build; see *The customers*)

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
- No invented projects or reviews: the customers are the client's own list. There are no testimonials on the site
  (the client's decision, 24 Nov 2026); if they come back, only in the customer's own words, with their permission.
- Customers' photos only with the GPS stamp blurred; no customer phone numbers.

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
