// Builds the height map of the hero watermark from the profile portrait:
//   portrait-relief-height.jpg  local-contrast tone × softened silhouette (the embossed relief)
// 1200×1600 master; astro:assets serves 600/900/1200 WebP variants.
// Run after changing the portrait: node generate-relief.js
import sharp from 'sharp';

const SRC = './src/assets/profile/portrait.jpg';
const OUT = './src/assets/profile';
const W = 1200;
const H = 1600;

// Silhouette: flood fill from the border over backdrop-like pixels (light, low
// saturation) on a 300×400 copy, then upscale and soften.
async function matte() {
  const w = 300;
  const h = 400;
  const { data } = await sharp(SRC).resize(w, h).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * w + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  // Backdrop colour per row from the left border; the studio gradient stops at 55 % height.
  const lim = Math.round(h * 0.55);
  const ref = [];
  for (let y = 0; y < h; y++) {
    const yy = Math.min(y, lim);
    let r = 0;
    let g = 0;
    let b = 0;
    for (let x = 0; x < 6; x++) {
      const p = px(x, yy);
      r += p[0];
      g += p[1];
      b += p[2];
    }
    ref.push([r / 6, g / 6, b / 6]);
  }
  const isBackdrop = (x, y) => {
    const [r, g, b] = px(x, y);
    const R = ref[y];
    const mx = Math.max(r, g, b);
    const sat = mx ? (mx - Math.min(r, g, b)) / mx : 0;
    return Math.hypot(r - R[0], g - R[1], b - R[2]) < 16 && sat < 0.07;
  };
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push([x, 0]);
  for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const k = y * w + x;
    if (bg[k] || !isBackdrop(x, y)) continue;
    bg[k] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const fg = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) fg[i] = bg[i] ? 0 : 255;
  // The white collar touches the backdrop at one point: keep the neck area as subject.
  for (let y = 236; y < 292; y++) for (let x = 134; x < 176; x++) fg[y * w + x] = 255;
  for (let y = 250; y < 286; y++) for (let x = 124; x < 136; x++) fg[y * w + x] = 255;
  return sharp(fg, { raw: { width: w, height: h, channels: 1 } }).median(5).resize(W, H).blur(3).png().toBuffer();
}

async function generate() {
  const m = await matte();
  // Local contrast keeps the features in the relief; the blurred silhouette gives the paper
  // a soft pressed edge instead of a cut-out outline. Tile and blur sizes are 2× the 600 px sketch.
  const tone = await sharp(SRC).resize(W, H).greyscale().clahe({ width: 120, height: 160, maxSlope: 2 }).blur(4.4).raw().toBuffer();
  const soft = await sharp(m).resize(W, H).greyscale().blur(26).raw().toBuffer();
  const height = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) height[i] = Math.round(((tone[i] / 255) * 0.75 + 0.25) * (soft[i] / 255) * 255);
  await sharp(height, { raw: { width: W, height: H, channels: 1 } })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(`${OUT}/portrait-relief-height.jpg`);
  console.log('Relief map written to', OUT);
}

generate();
