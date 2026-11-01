// Theme colour helpers shared by the hero WebGL effects (ink signature, watermark).

/**
 * Parse a CSS colour token (#rgb, #rrggbb or rgb()/rgba()) into 0–1 floats.
 * @param {string} value
 * @returns {[number, number, number]}
 */
export function parseColor(value) {
  const v = value.trim();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const parts = v.match(/[\d.]+/g);
  return parts && parts.length >= 3 ? [0, 1, 2].map((i) => Number(parts[i]) / 255) : [1, 1, 1];
}

/**
 * Read a colour token from the root element.
 * @param {string} name e.g. '--ink'
 */
export function token(name) {
  return parseColor(getComputedStyle(document.documentElement).getPropertyValue(name));
}
