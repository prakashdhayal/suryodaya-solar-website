// Adds the client's photos and videos to the gallery:
//
//   npm run add-media -- "D:\From client\Week 3"                 (this month)
//   npm run add-media -- "D:\From client\Week 3" --month 2026-10  (a given month)
//
// Photos (jpg, jpeg, png, webp) are turned upright, resized to at most 2000 px, saved as JPEG and stripped of their
// metadata - phone photos carry the GPS position of the customer's house - into src/assets/gallery/<month>/.
// Videos (mp4) are copied to public/gallery/videos/<month>/; over 25 MB is warned about, over 90 MB refused (GitHub's
// limit is 100 MB a file). A file's name becomes its caption unless it is a camera name (IMG_1234, WhatsApp Image ...),
// so "rooftop-on-grid-kishangarh.jpg" shows "Rooftop on grid kishangarh". Files already added are skipped.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const monthAt = args.indexOf('--month');
const month = monthAt >= 0 ? args.splice(monthAt, 2)[1] : new Date().toISOString().slice(0, 7);
const source = args[0];

if (!source || !fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
  console.error('Usage: npm run add-media -- "<folder with photos and videos>" [--month YYYY-MM]');
  process.exit(1);
}
if (!/^\d{4}-\d{2}$/.test(month)) {
  console.error(`--month must look like 2026-11, not "${month}"`);
  process.exit(1);
}

const photoDir = path.join(root, 'src/assets/gallery', month);
const videoDir = path.join(root, 'public/gallery/videos', month);
const today = new Date().toISOString().slice(0, 10);

/** "WhatsApp Image 2026-11-20 at 10.15.32 (1).jpeg" -> "2026-11-20-whatsapp-image-...-1" (lower case, dashes). */
function safeName(file) {
  const base = path
    .parse(file)
    .name.normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
  return /^\d{4}-\d{2}-\d{2}/.test(base) ? base : `${today}-${base || 'photo'}`;
}

const files = fs.readdirSync(source, { recursive: true, encoding: 'utf8' }).filter((f) => fs.statSync(path.join(source, f)).isFile());
let added = 0;
let skipped = 0;
const problems = [];

for (const file of files) {
  const from = path.join(source, file);
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const to = path.join(photoDir, `${safeName(file)}.jpg`);
    if (fs.existsSync(to)) { skipped++; continue; }
    fs.mkdirSync(photoDir, { recursive: true });
    try {
      await sharp(from)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(to);
      added++;
      console.log(`photo  ${path.relative(root, to)}`);
    } catch (e) {
      problems.push(`${file}: could not be read as a photo (${e.message})`);
    }
  } else if (ext === '.mp4') {
    const mb = fs.statSync(from).size / 1024 / 1024;
    if (mb > 90) { problems.push(`${file}: ${mb.toFixed(0)} MB is too big for GitHub - shorten it or upload it to YouTube`); continue; }
    const to = path.join(videoDir, `${safeName(file)}.mp4`);
    if (fs.existsSync(to)) { skipped++; continue; }
    fs.mkdirSync(videoDir, { recursive: true });
    fs.copyFileSync(from, to);
    added++;
    console.log(`video  ${path.relative(root, to)} (${mb.toFixed(1)} MB)`);
    if (mb > 25) problems.push(`${file}: ${mb.toFixed(0)} MB - large videos load slowly on phones; a shorter clip is better`);
  } else if (['.heic', '.heif', '.mov', '.avi', '.mkv', '.3gp'].includes(ext)) {
    problems.push(`${file}: ${ext} is not supported - send photos as JPEG and videos as MP4 (sharing through WhatsApp converts them)`);
  }
}

console.log(`\n${added} added to ${month}, ${skipped} already there.`);
if (problems.length) {
  console.log('\nLook at these:');
  for (const p of problems) console.log(`  - ${p}`);
}
if (added) console.log('\nNext: npm run dev to look at the gallery, then commit and open a PR (merging it publishes the site).');
