// Builds the two grayscale maps of the hero watermark from the profile portrait:
//   portrait-relief-height.jpg  smooth sculpted height (the embossed relief)
//   portrait-relief-tone.jpg    detailed tone (what a lamp behind the paper shows)
// Both are 1200×1600 masters; astro:assets serves 600/900/1200 WebP variants.
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
  const k = W / 600;
  const grey = (src) => sharp(src).resize(W, H).greyscale();
  const smoothTone = await grey(SRC).normalise({ lower: 3, upper: 97 }).blur(4 * k).raw().toBuffer();
  const detailTone = await grey(SRC).normalise({ lower: 2, upper: 99 }).gamma(1.4).blur(0.9 * k).raw().toBuffer();
  const softMatte = await grey(m).blur(6 * k).raw().toBuffer();
  const edgeMatte = await grey(m).blur(2.2 * k).raw().toBuffer();
  const dome = await grey(m).blur(46 * k).raw().toBuffer();

  const height = Buffer.alloc(W * H);
  const tone = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const relief = (softMatte[i] / 255) * (0.22 + (0.3 * smoothTone[i]) / 255) + (0.26 * dome[i]) / 255;
    height[i] = Math.round(Math.min(1, relief) * 255);
    tone[i] = Math.round((detailTone[i] / 255) * (edgeMatte[i] / 255) * 255);
  }
  const save = (buf, name) =>
    sharp(buf, { raw: { width: W, height: H, channels: 1 } }).jpeg({ quality: 95, mozjpeg: true }).toFile(`${OUT}/${name}`);
  await save(height, 'portrait-relief-height.jpg');
  await save(tone, 'portrait-relief-tone.jpg');
  console.log('Relief maps written to', OUT);
}

generate();
