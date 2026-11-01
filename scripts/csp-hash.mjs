// CSP source hash of an inline script or style, as Astro's security.csp expects it.
import { createHash } from 'node:crypto';

/** @param {string} text @returns {`sha256-${string}`} */
export function cspHash(text) {
  return `sha256-${createHash('sha256').update(text).digest('base64')}`;
}
