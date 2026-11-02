// Responsive images from src/assets via astro:assets (sharp at build time).
// Keys are paths relative to src/assets, e.g. 'projects/rag-chatbot.webp'.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { fitFor, sizesFor, thumbSizes, type MediaLayout, type ThumbLayout } from './media';

export { fitFor, PORTRAIT_RATIO, type MediaLayout, type Slot } from './media';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{png,jpg,jpeg,webp}', { eager: true });

export function asset(key: string): ImageMetadata {
  const mod = files[`../assets/${key}`];
  if (!mod) throw new Error(`Unknown image asset: ${key}`);
  return mod.default;
}

export interface ResponsiveImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

/** WebP variants at the given widths, never wider than the source (no upscaling). */
export async function responsive(key: string, widths: number[]): Promise<ResponsiveImage> {
  const meta = asset(key);
  const usable = [...new Set(widths.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
  const img = await getImage({ src: meta, widths: usable, width: usable.at(-1), format: 'webp' });
  return { src: img.src, srcset: img.srcSet.attribute, width: meta.width, height: meta.height };
}

/** Fixed-size WebP with 1x/2x/3x density descriptors (small UI images such as logos). */
export async function fixed(key: string, width: number): Promise<ResponsiveImage> {
  const meta = asset(key);
  const densities = [1, 2, 3].filter((d) => width * d <= meta.width);
  const img = await getImage({ src: meta, width, densities, format: 'webp' });
  return { src: img.src, srcset: img.srcSet.attribute, width, height: Math.round((width * meta.height) / meta.width) };
}

const MEDIA_WIDTHS = [400, 600, 800, 1000, 1200, 1440];
const MODAL_WIDTHS = [480, 800, 1200, 1600];
/** Thumbnail cells of the case modal (ProjectModal/ProjectCase styles): keep in sync with the CSS. */
const MODAL_THUMBS: ThumbLayout = {
  maxWidth: 750,
  mobileMaxWidth: 540,
  // 5/12 of the 1200 px box minus its 2 × 32 px padding and the 40 px column gap
  sideWidth: 456,
  // A third of the box (viewport − 2rem) minus padding and two 12 px gaps
  stripWidth: 'calc((100vw - 120px) / 3)',
};

/** Card media: responsive variants, cover/contain decision, `sizes` and the contain cap. */
export async function mediaFor(key: string, layout: MediaLayout) {
  const meta = asset(key);
  const fit = fitFor(meta, layout.slots);
  const img = await responsive(key, MEDIA_WIDTHS);
  return { ...img, fit, ...sizesFor(meta, layout, fit) };
}

/** Case-study screenshot: the largest variant feeds the lightbox, the srcset the thumbnail. */
export async function thumbFor(key: string, layout: Partial<ThumbLayout> = {}) {
  const img = await responsive(key, MODAL_WIDTHS);
  return { src: img.src, srcset: img.srcset, width: img.width, height: img.height, ...thumbSizes({ ...MODAL_THUMBS, ...layout }) };
}
