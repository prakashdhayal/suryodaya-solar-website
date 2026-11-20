// Lists what the client still has to give us: every TBD in src/data/site.ts, every <Tbd> marker on a page, the
// placeholder domain, and whether the gallery is still showing samples. Runs before each build; only warns.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const missing = [];

const site = fs.readFileSync(path.join(root, 'src/data/site.ts'), 'utf8');
for (const line of site.split('\n')) {
  const m = line.match(/^\s*(\w+):\s*TBD\b/);
  if (m) missing.push(`src/data/site.ts: ${m[1]}`);
}
if (/SITE_URL = '[^']*\.github\.io/.test(site)) {
  missing.push("src/data/site.ts: SITE_URL - the client's domain (on GitHub's address the site is a preview, kept out of search results)");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
for (const file of walk(path.join(root, 'src')).filter((f) => f.endsWith('.astro'))) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/<Tbd what="([^"]+)"/g)) {
    missing.push(`${path.relative(root, file).split(path.sep).join('/')}: ${m[1]}`);
  }
}

const media = (dir, ext) =>
  fs.existsSync(dir) ? walk(dir).filter((f) => ext.test(f)).length : 0;
const photos = media(path.join(root, 'src/assets/gallery'), /\.(jpe?g|png|webp|avif)$/i);
const videos = media(path.join(root, 'public/gallery/videos'), /\.mp4$/i);
if (photos + videos === 0) missing.push('gallery: no photos or videos of real installations yet (sample images are shown)');

if (missing.length) {
  console.warn(`\n[placeholders] Still to be provided (${missing.length}) - shown on the site as "[... - to be provided]":`);
  for (const m of [...new Set(missing)]) console.warn(`  - ${m}`);
  console.warn('');
} else {
  console.log('[placeholders] None left.');
}
