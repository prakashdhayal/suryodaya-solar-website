// Adds a customer to src/installations/customers.yaml, with their photo - or a photo for a customer already listed.
//
//   npm run add-customer -- --name "Ramesh Kumar" --place Kishangarh --kw 3.5 --panels Tata --photo "D:\photo.jpg"
//       optional: --district Ajmer   --installed 2026-12   (the month; without it the table shows "–")
//   npm run add-customer -- --photo-for 47 --photo "D:\photo.jpg"
//       optional with --photo: --skip 0   (leave a box the stamp finder blurred by mistake; it says which it found)
//
// The photo's GPS stamp (address, latitude and longitude, map) is blurred, it is turned upright, resized and stripped of
// its metadata, and a thumbnail of its top (the panels) is made: photos/<number>.jpg and photos/thumbs/<number>.jpg.
// Look at both before committing.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { blurStamps } from './lib/gps-stamp.mjs';

const root = path.resolve(import.meta.dirname, '..');
const LIST = path.join(root, 'src/installations/customers.yaml');
const PHOTOS = path.join(root, 'src/installations/photos');
const BRANDS = { tata: 'Tata Power Solar', waaree: 'Waaree', luminous: 'Luminous', avaada: 'Avaada', adani: 'Adani Solar', vikram: 'Vikram Solar' };

const fail = (message) => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

const { values: a } = parseArgs({
  options: {
    name: { type: 'string' },
    place: { type: 'string' },
    district: { type: 'string' },
    kw: { type: 'string' },
    panels: { type: 'string' },
    installed: { type: 'string' },
    photo: { type: 'string' },
    'photo-for': { type: 'string' },
    skip: { type: 'string' },
  },
});

/** "RAMESH KUMAR" / "ramesh kumar" -> "Ramesh Kumar". */
const title = (s) => s.trim().split(/\s+/).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const list = fs.readFileSync(LIST, 'utf8');
const ids = [...list.matchAll(/^- id: (\d+)/gm)].map((m) => Number(m[1]));

let id;
if (a['photo-for']) {
  id = Number(a['photo-for']);
  if (!ids.includes(id)) fail(`No customer no. ${a['photo-for']} in src/installations/customers.yaml.`);
  if (!a.photo) fail('Give the photo: --photo "<file>".');
} else {
  for (const key of ['name', 'place', 'kw', 'panels']) if (!a[key]) fail(`Missing --${key}. See the top of scripts/add-customer.mjs.`);
  const kw = Number(a.kw.replace(/\s*kw$/i, ''));
  if (!(kw > 0)) fail(`--kw "${a.kw}" is not a capacity in kW (3.5, 5, 10 ...).`);
  if (a.installed && !/^\d{4}-\d{2}$/.test(a.installed)) fail(`--installed "${a.installed}" should be the month as YYYY-MM, like 2026-12.`);
  id = Math.max(0, ...ids) + 1;
  const lines = [
    `- id: ${id}`,
    `  customer: ${JSON.stringify(title(a.name))}`,
    `  place: ${JSON.stringify(title(a.place))}`,
    ...(a.district ? [`  district: ${JSON.stringify(title(a.district))}`] : []),
    `  capacityKw: ${kw}`,
    `  panels: ${JSON.stringify(BRANDS[a.panels.trim().toLowerCase().split(/\s+/)[0]] ?? a.panels.trim())}`,
    ...(a.installed ? [`  installed: '${a.installed}'`] : []),
  ];
  fs.writeFileSync(LIST, `${list.replace(/\s*$/, '')}\n\n${lines.join('\n')}\n`);
  console.log(`Added no. ${id}:\n${lines.join('\n')}`);
}

if (a.photo) {
  const file = path.resolve(a.photo);
  if (!fs.existsSync(file)) fail(`No file ${file}.`);
  if (/\.(heic|heif)$/i.test(file)) fail('iPhone HEIC photos are not read - ask for the photo through WhatsApp (it sends a JPEG).');
  const name = String(id).padStart(3, '0') + '.jpg';
  const skip = (a.skip ?? '').split(',').filter(Boolean).map(Number);
  const { jpeg, thumb, boxes } = await blurStamps(file, { skip });
  fs.mkdirSync(path.join(PHOTOS, 'thumbs'), { recursive: true });
  fs.writeFileSync(path.join(PHOTOS, name), jpeg);
  fs.writeFileSync(path.join(PHOTOS, 'thumbs', name), thumb);
  console.log(`Photo: src/installations/photos/${name} (and thumbs/${name})`);
  console.log(
    boxes.length
      ? `Blurred ${boxes.length} GPS stamp(s), top to bottom: ${boxes.map((b, i) => `${i} at ${Math.round(b.y)}px down`).join(', ')}.`
      : 'No GPS stamp found.',
  );
  console.log('Open the photo: no address or Lat/Long may be readable, and nothing else should be blurred (--skip <number>).');
}
