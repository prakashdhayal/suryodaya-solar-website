/**
 * The client's photos come from the "GPS Map Camera" app, which writes the house's address, its latitude and longitude,
 * the date and a small map into the picture itself (often twice: the panels above, the inverter below). Removing a
 * photo's hidden data does not remove that, so this finds each stamp and blurs it.
 *
 * A stamp is a block of three or more lines of light text on a see-through dark box, the map (when there is one) to the
 * left of the words. Rows of panels can look like text, so a block must be mostly dark behind its words, and is at
 * most a stamp's height. It is not perfect: always look at the photo it writes.
 */
import sharp from 'sharp';

/** The stamps in a picture (raw RGB pixels), as boxes in pixels from the top left. */
export function findStamps(data, width, height) {
  const at = (x, y) => (y * width + x) * 3;
  const luma = (i) => 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
  const grey = (i) => Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) <= 40;
  const step = Math.max(2, Math.round(width / 400));

  // a row of text: many light, grey pixels with a much darker pixel just beside them
  const rows = [];
  for (let y = 0; y < height; y++) {
    let hits = 0, lo = width, hi = 0;
    for (let x = step; x < width - step; x++) {
      const i = at(x, y);
      const l = luma(i);
      if (l < 160 || !grey(i)) continue;
      const edge = Math.min(l - 80, 125);
      if (luma(at(x - step, y)) <= edge || luma(at(x + step, y)) <= edge) {
        hits++;
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
    }
    rows.push({ hits, lo, hi });
  }
  const isText = rows.map((r) => r.hits >= Math.max(8, width * 0.012));

  // text rows into lines, lines close together into blocks
  const lines = [];
  for (let y = 0; y < height; y++) {
    if (!isText[y]) continue;
    const last = lines.at(-1);
    if (last && y - last.y1 <= 3) last.y1 = y;
    else lines.push({ y0: y, y1: y });
  }
  const blocks = [];
  for (const line of lines.filter((l) => l.y1 - l.y0 >= height * 0.004)) {
    const last = blocks.at(-1);
    if (last && line.y0 - last.y1 <= width * 0.045) {
      last.y1 = line.y1;
      last.lines++;
    } else blocks.push({ ...line, lines: 1 });
  }

  return blocks
    .filter((b) => b.lines >= 3)
    .map((b) => {
      const y0 = Math.max(b.y0, Math.round(b.y1 - width * 0.2)); // never taller than a stamp
      let lo = width, hi = 0;
      for (let y = y0; y <= b.y1; y++) if (isText[y]) { lo = Math.min(lo, rows[y].lo); hi = Math.max(hi, rows[y].hi); }
      let dark = 0, all = 0;
      for (let y = y0; y <= b.y1; y += 2) for (let x = lo; x <= hi; x += 2) { all++; if (luma(at(x, y)) <= 130) dark++; }
      const h = b.y1 - y0;
      const pad = Math.round(width * 0.02);
      const left = Math.max(0, Math.round(lo - h * 1.25 - pad)); // the map sits left of the words
      const top = Math.max(0, Math.round(y0 - width * 0.06)); // and the "GPS Map Camera" label above them
      const right = Math.min(width, hi + pad);
      const bottom = Math.min(height, Math.round(b.y1 + Math.max(pad, (h / Math.max(1, b.lines - 1)) * 0.9)));
      return { x: left, y: top, w: right - left, h: bottom - top, dark: dark / Math.max(1, all) };
    })
    .filter((b) => b.dark >= 0.5)
    .map(({ x, y, w, h }) => ({ x, y, w, h }));
}

/**
 * The photo, turned upright, at most `maxSide` pixels, its stamps blurred beyond reading and its metadata gone, as a
 * JPEG - and a thumbnail of its top part, above the first stamp (the panels, as a rule: the client's photos are the
 * panels above the inverter). `skip` leaves out boxes found by mistake (their numbers, from 0, top to bottom).
 */
export async function blurStamps(input, { skip = [], maxSide = 2000 } = {}) {
  const { data, info } = await sharp(input).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const boxes = findStamps(data, info.width, info.height).filter((_, i) => !skip.includes(i));
  const layers = await Promise.all(
    boxes.map(async (b) => {
      // squeezed small first, so no letter survives the blur
      const small = await sharp(data, { raw: info })
        .extract({ left: b.x, top: b.y, width: b.w, height: b.h })
        .resize(Math.max(1, Math.round(b.w / 24)), Math.max(1, Math.round(b.h / 24)))
        .png()
        .toBuffer();
      const input = await sharp(small).resize(b.w, b.h, { kernel: 'cubic' }).blur(Math.max(4, b.h / 12)).png().toBuffer();
      return { input, left: b.x, top: b.y };
    }),
  );
  const blurred = await sharp(data, { raw: info }).composite(layers).png().toBuffer();
  const jpeg = await sharp(blurred)
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const h = info.height;
  const cut = Math.round(boxes.length ? Math.min(Math.max(boxes[0].y, h * 0.25), h * 0.6) : h * 0.5);
  const thumb = await sharp(blurred)
    .extract({ left: 0, top: 0, width: info.width, height: cut })
    .resize({ width: 480, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  return { jpeg, thumb, boxes };
}
