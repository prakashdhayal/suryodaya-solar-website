// Adds one customer's installation - details, photos and videos - from a folder:
//
//   npm run add-installation -- "D:\From client\Ramesh Kumar"                  (a new customer)
//   npm run add-installation -- "D:\From client\Ramesh more" --to ramesh-kumar-kishangarh   (more photos for one)
//
// The folder holds what the client sent: the photos and videos, and details.txt - their WhatsApp message pasted in:
//
//   Customer: Ramesh Kumar
//   Village/City: Kishangarh
//   District: Ajmer                (optional)
//   Capacity: 3 kW
//   Type: On-grid                  (On-grid, Off-grid or Hybrid)
//   Panels: Waaree (DCR)           (DCR or non-DCR in brackets, optional)
//   Inverter: Polycab              (optional)
//   Installed: November 2026       (or 2026-11; this month when left out)
//   Feedback: the customer's own words, as many lines as they wrote (optional)
//
// It writes src/installations/<customer>-<place>/details.yaml, and puts the photos beside it - turned upright, resized
// to at most 2000 px, saved as JPEG and stripped of their metadata (phone photos carry the GPS position of the
// customer's house) - and the videos (mp4) in public/installations/<slug>/: over 25 MB is warned about, over 90 MB
// refused (GitHub's limit is 100 MB a file). A photo's file name becomes its caption unless it is a camera name
// (IMG_1234, WhatsApp Image ...). Files already added are skipped; an existing customer's details are never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const toAt = args.indexOf('--to');
const existing = toAt >= 0 ? args.splice(toAt, 2)[1] : null;
const source = args[0];

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!source || !fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
  fail('Usage: npm run add-installation -- "<folder with details.txt, photos and videos>" [--to <existing-folder-name>]');
}

const slugOf = (text) =>
  text.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "November 2026", "Nov 2026", "2026-11", "11/2026" -> "2026-11". */
function monthOf(text) {
  const t = text.trim().toLowerCase();
  let year;
  let month;
  let r;
  if ((r = t.match(/^(\d{4})[-/.](\d{1,2})$/))) [year, month] = [r[1], Number(r[2])];
  else if ((r = t.match(/^(\d{1,2})[-/.](\d{4})$/))) [year, month] = [r[2], Number(r[1])];
  else if ((r = t.match(/^([a-z]+)\.?,?\s+(\d{4})$/))) [year, month] = [r[2], MONTHS.indexOf(r[1].slice(0, 3)) + 1];
  if (year && month >= 1 && month <= 12) return `${year}-${String(month).padStart(2, '0')}`;
  fail(`Installed: "${text}" - write it like "November 2026" or "2026-11".`);
}

function typeOf(text) {
  const t = text.toLowerCase().replace(/[^a-z]/g, '');
  if (t.startsWith('ongrid')) return 'On-Grid';
  if (t.startsWith('offgrid')) return 'Off-Grid';
  if (t.startsWith('hybrid')) return 'Hybrid';
  fail(`Type: "${text}" - it must be On-grid, Off-grid or Hybrid.`);
}

const FIELDS = {
  customer: /^(customer|customer name|name)$/,
  place: /^(village\s*\/\s*city|village|city|place|town)$/,
  district: /^district$/,
  capacity: /^(capacity|size|kw)$/,
  type: /^(type|system|system type)$/,
  panels: /^(panels?|panel brand|solar panels?)$/,
  inverter: /^(inverter|inverter brand)$/,
  installed: /^(installed|month|date|installed on)$/,
  feedback: /^(feedback|review|testimonial)$/,
};

/** The client's message -> { customer, place, ... }; lines it doesn't know (e.g. "Show name: yes") are ignored. */
function readDetails(file) {
  const found = {};
  let current = null;
  for (const line of fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]{2,30}):\s*(.*)$/);
    const key = m && Object.keys(FIELDS).find((k) => FIELDS[k].test(m[1].trim().toLowerCase()));
    if (key) {
      current = key;
      found[key] = m[2].trim();
    } else if (m) {
      current = null;
    } else if (current === 'feedback' && line.trim()) {
      found.feedback = `${found.feedback}\n${line.trim()}`.trim();
    }
  }
  for (const need of ['customer', 'place', 'capacity', 'type', 'panels']) {
    if (!found[need]) fail(`details.txt has no "${need}" line - see the example at the top of scripts/add-installation.mjs.`);
  }
  const kw = Number(found.capacity.replace(/,/g, '.').match(/[\d.]+/)?.[0]);
  if (!(kw > 0)) fail(`Capacity: "${found.capacity}" - write it like "3 kW".`);
  const kind = /non[\s-]*dcr/i.test(found.panels) ? 'non-DCR' : /\bdcr\b/i.test(found.panels) ? 'DCR' : null;
  const feedback = found.feedback?.replace(/^["“]|["”]$/g, '').trim();
  return {
    customer: found.customer,
    place: found.place,
    district: found.district || null,
    capacityKw: kw,
    type: typeOf(found.type),
    panels: found.panels.replace(/\(?\s*(non[\s-]*)?dcr\s*\)?/i, '').trim(),
    panelKind: kind,
    inverter: found.inverter || null,
    installed: found.installed ? monthOf(found.installed) : new Date().toISOString().slice(0, 7),
    feedback: feedback || null,
  };
}

/** details.yaml: every value written as a quoted string (or a number), so nothing is misread. */
function toYaml(d) {
  const line = (key, value) => (value == null ? '' : `${key}: ${typeof value === 'number' ? value : JSON.stringify(value)}\n`);
  return (
    line('customer', d.customer) +
    line('place', d.place) +
    line('district', d.district) +
    line('capacityKw', d.capacityKw) +
    line('type', d.type) +
    line('panels', d.panels) +
    line('panelKind', d.panelKind) +
    line('inverter', d.inverter) +
    line('installed', d.installed) +
    line('feedback', d.feedback)
  );
}

let slug = existing;
const detailsFile = path.join(source, 'details.txt');
if (existing) {
  if (!fs.existsSync(path.join(root, 'src/installations', existing, 'details.yaml'))) {
    fail(`--to ${existing}: there is no src/installations/${existing}/details.yaml.`);
  }
} else {
  if (!fs.existsSync(detailsFile)) {
    fail('No details.txt in that folder - paste the client\'s message into details.txt (see the top of scripts/add-installation.mjs).');
  }
  const details = readDetails(detailsFile);
  slug = slugOf(`${details.customer} ${details.place}`);
  const yaml = path.join(root, 'src/installations', slug, 'details.yaml');
  if (fs.existsSync(yaml)) {
    console.log(`${slug} is already there - its details are kept as they are; adding any new photos and videos.`);
  } else {
    fs.mkdirSync(path.dirname(yaml), { recursive: true });
    fs.writeFileSync(yaml, toYaml(details));
    console.log(`details  ${path.relative(root, yaml)}`);
    console.log(toYaml(details).replace(/^/gm, '         '));
  }
}

const photoDir = path.join(root, 'src/installations', slug);
const videoDir = path.join(root, 'public/installations', slug);

/** "WhatsApp Image 2026-11-20 at 10.15.32 (1).jpeg" -> "whatsapp-image-2026-11-20-at-10-15-32-1". */
const safeName = (file) => slugOf(path.parse(file).name) || 'photo';

const files = fs
  .readdirSync(source, { recursive: true, encoding: 'utf8' })
  .filter((f) => fs.statSync(path.join(source, f)).isFile())
  .sort();
let added = 0;
let skipped = 0;
const problems = [];

for (const file of files) {
  const from = path.join(source, file);
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const to = path.join(photoDir, `${safeName(file)}.jpg`);
    if (fs.existsSync(to)) { skipped++; continue; }
    try {
      await sharp(from)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(to);
      added++;
      console.log(`photo    ${path.relative(root, to)}`);
    } catch (e) {
      problems.push(`${file}: could not be read as a photo (${e.message})`);
    }
  } else if (ext === '.mp4') {
    const mb = fs.statSync(from).size / 1024 / 1024;
    if (mb > 90) { problems.push(`${file}: ${mb.toFixed(0)} MB is too big for GitHub - shorten it or put it on YouTube`); continue; }
    const to = path.join(videoDir, `${safeName(file)}.mp4`);
    if (fs.existsSync(to)) { skipped++; continue; }
    fs.mkdirSync(videoDir, { recursive: true });
    fs.copyFileSync(from, to);
    added++;
    console.log(`video    ${path.relative(root, to)} (${mb.toFixed(1)} MB)`);
    if (mb > 25) problems.push(`${file}: ${mb.toFixed(0)} MB - large videos load slowly on phones; a shorter clip is better`);
  } else if (['.heic', '.heif', '.mov', '.avi', '.mkv', '.3gp'].includes(ext)) {
    problems.push(`${file}: ${ext} is not supported - send photos as JPEG and videos as MP4 (sharing through WhatsApp converts them)`);
  }
}

console.log(`\n${added} photos/videos added to ${slug}, ${skipped} already there.`);
if (problems.length) {
  console.log('\nLook at these:');
  for (const p of problems) console.log(`  - ${p}`);
}
console.log(`\nNext: npm run dev and open /projects/${slug}/, then commit and open a PR (merging it publishes the site).`);
