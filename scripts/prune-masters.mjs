// @ts-check
// Astro integration: after the build, delete the image masters astro:assets copies to
// dist/_astro but no page, stylesheet or script references (only the WebP variants are used).
import { readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} dir @returns {string[]} */
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

/** @returns {import('astro').AstroIntegration} */
export default function pruneMasters() {
  return {
    name: 'prune-masters',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const files = walk(out);
        const text = files.filter((f) => /\.(html|css|js|xml)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
        let bytes = 0;
        const removed = files
          .filter((f) => f.includes(`${join(out, '_astro')}`) && /\.(jpe?g|png|webp|avif)$/.test(f))
          .filter((f) => !text.includes(f.split('/').pop() ?? ''))
          .map((f) => {
            bytes += statSync(f).size;
            unlinkSync(f);
            return f;
          });
        logger.info(`removed ${removed.length} unreferenced image masters (${Math.round(bytes / 1024)} KB)`);
      },
    },
  };
}
