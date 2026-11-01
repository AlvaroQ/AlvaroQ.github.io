// Responsive images from src/assets via astro:assets (sharp at build time).
// Keys are paths relative to src/assets, e.g. 'projects/rag-chatbot.webp'.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

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

export interface Slot {
  /** Rendered CSS width and height of the media box. */
  w: number;
  h: number;
  dpr: number;
}

/**
 * 'cover' only when the source fills every slot without upscaling; otherwise the image is
 * shown whole ('contain') and its render size is capped at natural ÷ 2 CSS px.
 */
export function fitFor(meta: ImageMetadata, slots: Slot[]): 'cover' | 'contain' {
  if (meta.height >= meta.width * 0.85) return 'contain';
  const fits = slots.every((s) => Math.max((s.w * s.dpr) / meta.width, (s.h * s.dpr) / meta.height) <= 1);
  return fits ? 'cover' : 'contain';
}
