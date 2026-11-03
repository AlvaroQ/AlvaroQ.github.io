// Card-only alpha derivatives. Originals remain the modal screenshots.
// Run: node scripts/assets/project-cards.mjs (manual, not part of the build).
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assets = new URL('../../src/assets/projects/', import.meta.url);
const clamp = (v) => Math.max(0, Math.min(1, v));

// Signed distance to the measured rounded phone bounds. A one-pixel transition
// retains antialiasing without retaining the brown backdrop/shadow. Never key UI black.
function roundedAlpha(x, y, left, top, right, bottom, radius) {
  const dx = Math.max(left + radius - x, 0, x - (right - radius));
  const dy = Math.max(top + radius - y, 0, y - (bottom - radius));
  return clamp(radius - Math.hypot(dx, dy) + 0.5);
}

async function generate(source, output, width, height, mask) {
  const { data, info } = await sharp(fileURLToPath(new URL(source, assets))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== width || info.height !== height) throw new Error(`${source}: source dimensions changed; remeasure mask`);
  const alpha = mask(data, width, height);
  for (let i = 0; i < alpha.length; i++) data[i * 4 + 3] = alpha[i];
  await sharp(data, { raw: { width, height, channels: 4 } }).webp({ lossless: true }).toFile(fileURLToPath(new URL(output, assets)));
  console.log(`${output}: ${width}×${height}, lossless RGBA`);
}

await generate('lotto-scan-cover.webp', 'lotto-scan-card.webp', 1920, 1200, (_data, width, height) => {
  // Pixel scans: camera starts x391, ends x876; confirmation x1043..1528.
  // Top y62, bottom y1101; corner arcs are 44 px. Exterior/centre gap is discarded.
  const alpha = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    alpha[y * width + x] = Math.round(255 * Math.max(
      roundedAlpha(x, y, 391, 62, 877, 1102, 44),
      roundedAlpha(x, y, 1043, 62, 1529, 1102, 44),
    ));
  }
  return alpha;
});

await generate('scrapper_pro_cover.webp', 'scrapper-pro-card.webp', 880, 550, (data, width, height) => {
  const alpha = Buffer.alloc(width * height, 255);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const visit = (i) => {
    if (visited[i]) return;
    visited[i] = 1;
    const x = i % width;
    const y = Math.floor(i / width);
    // Preserve every pixel of the screenshot panels, central arrow and captions,
    // including their near-black UI. The illustration is cropped at the source bottom.
    if (roundedAlpha(x, y, 65, 148, 814, 570, 12) > 0) return;
    const [r, g, b] = data.subarray(i * 4, i * 4 + 3);
    const high = Math.max(r, g, b);
    const chroma = high - Math.min(r, g, b);
    // Measured matte: (10,10,10); exterior (10,17,19); halo (8,48,39).
    // Traverse only edge-connected low tones, not bright headline strokes/green art.
    if (high >= 100 || chroma >= 65) return;
    const strength = Math.max(clamp((high - 20) / 50), clamp((chroma - 12) / 35));
    // Fade the residual coloured halo before the source boundary: no rectangular edge.
    const edge = clamp((Math.min(x, width - 1 - x, y, height - 1 - y) - 8) / 32);
    const a = strength * edge;
    alpha[i] = Math.round(255 * a);
    // Remove the neutral matte contribution from soft glow pixels (avoid dark fringes on light).
    if (a > 0 && a < 1) for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(Math.max(0, Math.min(255, (data[i * 4 + c] - 10 * (1 - a)) / a)));
    queue[tail++] = i;
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const i = queue[head++];
    if (i % width) visit(i - 1);
    if (i % width < width - 1) visit(i + 1);
    if (i >= width) visit(i - width);
    if (i < width * (height - 1)) visit(i + width);
  }
  return alpha;
});
