// Pure image-sizing math (no astro:assets), unit-tested by scripts/images.test.mjs.

/** Sources at least this tall relative to their width are always shown whole. */
export const PORTRAIT_RATIO = 0.85;

export interface Dimensions {
  width: number;
  height: number;
}

export interface Slot {
  /** Rendered CSS width and height of the media box. */
  w: number;
  h: number;
  dpr: number;
}

/** A 16:10 media box per breakpoint: slots (lg, md, mobile), lg width in px, md width expression. */
export interface MediaLayout {
  slots: Slot[];
  lg: number;
  md: string;
}

export type Fit = 'cover' | 'contain';

/**
 * 'cover' only when the source fills every slot without upscaling; otherwise the image is
 * shown whole ('contain') and its render size is capped at natural ÷ 2 CSS px.
 */
export function fitFor(meta: Dimensions, slots: Slot[]): Fit {
  if (meta.height >= meta.width * PORTRAIT_RATIO) return 'contain';
  const fits = slots.every((s) => Math.max((s.w * s.dpr) / meta.width, (s.h * s.dpr) / meta.height) <= 1);
  return fits ? 'cover' : 'contain';
}

/**
 * `sizes` for a media box. With w-descriptors the painted (intrinsic) width is the `sizes` value,
 * so capping it at half the source keeps a contained image ≤ 1x on 2x screens without any inline
 * style.
 */
export function sizesFor(meta: Dimensions, layout: MediaLayout, fit: Fit): { sizes: string } {
  if (fit === 'cover') {
    // A source wider than 16:10 is painted wider than its box (cropped at the sides).
    const k = Math.max(1, meta.width / meta.height / (16 / 10)).toFixed(3);
    return {
      sizes: `(min-width: 1024px) ${Math.round(layout.lg * Number(k))}px, (min-width: 768px) calc(${layout.md} * ${k}), calc((100vw - 48px) * ${k})`,
    };
  }
  // Shown whole on the plate, never larger than half the source (≤ 1x on 2x screens).
  const [lg, md, sm] = layout.slots.map((s) => Math.round(Math.min(s.w, (s.h * meta.width) / meta.height, meta.width / 2)));
  return { sizes: `(min-width: 1024px) ${lg}px, (min-width: 768px) ${md}px, ${sm}px` };
}

export interface ThumbLayout {
  /** Height cap of a thumbnail (CSS px). */
  maxHeight: number;
  /** Cell width in the single-column modal (up to 1023 px viewports). */
  maxWidth: number;
  /** Cell width on phones (≤ 600 px viewports). */
  mobileMaxWidth: number;
  /** Side column of the two-column modal (from 1280 px). */
  sideWidth: number;
  /** One cell of the strip of three (1024–1279 px): a CSS length, it follows the viewport. */
  stripWidth: string;
}

/**
 * Modal thumbnail contained in its cell for each modal layout and at most `maxHeight` px tall;
 * capping the height at a third of the source keeps it ≤ 1x up to 3x screens.
 */
export function thumbSizes(meta: Dimensions, opts: ThumbLayout) {
  const maxHeight = Math.min(opts.maxHeight, Math.floor(meta.height / 3));
  const painted = Math.round((maxHeight * meta.width) / meta.height);
  const at = (cell: number) => `${Math.min(painted, cell)}px`;
  return {
    maxHeight,
    sizes: `(min-width: 1280px) ${at(opts.sideWidth)}, (min-width: 1024px) min(${painted}px, ${opts.stripWidth}), (max-width: 600px) ${at(opts.mobileMaxWidth)}, ${at(opts.maxWidth)}`,
  };
}
