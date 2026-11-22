// Lists what the client still has to give us: every TBD in src/data/site.ts, every <Tbd> marker on a page, the
// placeholder domain, and whether the installations are still samples. Runs before each build; only warns.
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
// A marker standing alone on a page; one after `??` or `:` is only the fallback for a site.ts value, listed above.
for (const file of walk(path.join(root, 'src')).filter((f) => f.endsWith('.astro'))) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/\?\?\s*<Tbd|:\s*(<>\s*)?<Tbd/.test(line)) continue;
    for (const m of line.matchAll(/<Tbd what="([^"]+)"/g)) {
      missing.push(`${path.relative(root, file).split(path.sep).join('/')}: ${m[1]}`);
    }
  }
}

const installs = path.join(root, 'src/installations');
const real = fs.existsSync(installs)
  ? fs.readdirSync(installs).filter((d) => {
      const file = path.join(installs, d, 'details.yaml');
      return fs.existsSync(file) && !/^sample:\s*true/m.test(fs.readFileSync(file, 'utf8'));
    })
  : [];
if (!real.length) missing.push('installations: no real customer yet (the sample installations are shown)');

if (missing.length) {
  console.warn(`\n[placeholders] Still to be provided (${missing.length}) - shown on the site as "[... - to be provided]":`);
  for (const m of [...new Set(missing)]) console.warn(`  - ${m}`);
  console.warn('');
} else {
  console.log('[placeholders] None left.');
}
