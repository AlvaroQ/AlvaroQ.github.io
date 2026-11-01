// @ts-check
// Builds the height map of the hero watermark (the embossed figure behind the name):
//   hero-relief-height.jpg  local-contrast tone × softened silhouette
// Source: a PNG with a transparent background (scripts/assets/sources/hero-figure.png); the alpha
// channel is the silhouette. The map is 3:4 (what ink-watermark.js expects) at the source's own
// width — never upscaled — with the figure resting on the bottom edge; astro:assets serves it as
// WebP and the shader's linear filtering softens it further.
// Run after changing the source: npm run assets:relief   (not part of the build)
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SRC = fileURLToPath(new URL('./sources/hero-figure.png', import.meta.url));
const OUT = fileURLToPath(new URL('../../src/assets/profile/hero-relief-height.jpg', import.meta.url));

const meta = await sharp(SRC).metadata();
if (!meta.width || !meta.height || !meta.hasAlpha) throw new Error('the source must be a PNG with a transparent background');
const W = meta.width;
const H = Math.round((W * 4) / 3);
const top = Math.max(0, H - meta.height); // empty paper above the figure
// Filter sizes scale with the map: they were tuned on a 1200 px wide portrait.
const k = W / 1200;
const odd = (/** @type {number} */ n) => Math.max(3, Math.round(n) | 1);

/** One greyscale channel of the source placed on the 3:4 canvas. @param {sharp.Sharp} img @param {number} fill */
async function onCanvas(img, fill) {
  const plane = await img.raw().toBuffer();
  return sharp(plane, { raw: { width: W, height: meta.height ?? H, channels: 1 } })
    .extend({ top, bottom: 0, left: 0, right: 0, background: { r: fill, g: fill, b: fill } })
    .toColourspace('b-w')
    .raw()
    .toBuffer();
}

// Silhouette from the alpha channel; tone from the colours flattened on white.
const alpha = await onCanvas(sharp(SRC).extractChannel('alpha'), 0);
const toneSrc = await onCanvas(sharp(SRC).flatten({ background: '#ffffff' }).greyscale(), 255);

const tone = await sharp(toneSrc, { raw: { width: W, height: H, channels: 1 } })
  .clahe({ width: odd(120 * k), height: odd(160 * k), maxSlope: 2 })
  .blur(Math.max(0.3, 4.4 * k))
  .toColourspace('b-w')
  .raw()
  .toBuffer();
const soft = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
  .median(3)
  .blur(Math.max(0.3, 26 * k))
  .toColourspace('b-w')
  .raw()
  .toBuffer();

const height = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) height[i] = Math.round(((tone[i] / 255) * 0.75 + 0.25) * (soft[i] / 255) * 255);
await sharp(height, { raw: { width: W, height: H, channels: 1 } }).jpeg({ quality: 95, mozjpeg: true }).toFile(OUT);
console.log(`Relief map ${W}×${H} written to ${OUT}`);
