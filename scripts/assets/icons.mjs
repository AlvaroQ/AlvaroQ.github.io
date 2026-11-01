// @ts-check
// Brand assets in identity A (paper, ink, accent, Fraunces): favicon.svg, favicon.ico,
// favicon-32x32.png, apple-touch-icon.png and one Open Graph image per language.
// Copy and colours are read from the site's own sources (i18n, site.ts, global.css tokens),
// so the images follow the content. Rendering uses the system Chrome in headless mode with the
// self-hosted fonts; set CHROME_PATH if Chrome is not at its default macOS location.
// Run: npm run assets:icons   (not part of the build)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { YEARS_IN_TECH } from '../../src/data/site.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pub = join(root, 'public');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Dark-theme tokens from the @theme block of global.css. */
function tokens() {
  const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
  const block = css.slice(css.indexOf('@theme inline'), css.indexOf('html.light {'));
  /** @param {string} name */
  const get = (name) => {
    const m = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
    if (!m) throw new Error(`token --${name} not found`);
    return m[1].trim();
  };
  return { paper: get('paper'), paper2: get('paper-2'), ink: get('ink'), ink2: get('ink-2'), accent: get('accent'), muted: get('ink-muted'), line: get('line') };
}

/** Hero copy of one language, read from src/i18n/<lang>.ts. @param {'es' | 'en'} lang */
function copy(lang) {
  const src = readFileSync(join(root, `src/i18n/${lang}.ts`), 'utf8');
  /** @param {string} key */
  const get = (key) => {
    const m = src.match(new RegExp(`\\n\\s*${key}: ["\`]([^"\`]+)["\`]`));
    if (!m) throw new Error(`${lang}.${key} not found`);
    return m[1].replace('${YEARS_IN_TECH}', String(YEARS_IN_TECH));
  };
  return { name: get('name'), eyebrow: get('heroEyebrow'), headline: get('heroHeadline'), em: get('heroHeadlineEm') };
}

const t = tokens();
const font = (/** @type {string} */ file) => pathToFileURL(join(pub, 'fonts', file)).href;
const FONTS = `
  @font-face { font-family: Fraunces; font-weight: 900; src: url(${font('Fraunces-900-latin.woff2')}); }
  @font-face { font-family: Fraunces; font-weight: 400; src: url(${font('Fraunces-400-latin.woff2')}); }
  @font-face { font-family: Fraunces; font-weight: 400; font-style: italic; src: url(${font('Fraunces-400italic-latin.woff2')}); }
  @font-face { font-family: Mono; src: url(${font('JetBrainsMono-latin.woff2')}); }
  * { margin: 0; box-sizing: border-box; }
  html, body { background: ${t.paper}; }`;
const INK = `background: linear-gradient(120deg, ${t.ink} 20%, ${t.ink2} 55%, ${t.accent} 80%, ${t.ink} 100%); -webkit-background-clip: text; background-clip: text; color: transparent;`;

/** @param {string} html @param {number} w @param {number} h @param {string} out */
function render(html, w, h, out) {
  const dir = mkdtempSync(join(tmpdir(), 'icons-'));
  try {
    const page = join(dir, 'page.html');
    writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>${FONTS}</style>${html}`);
    execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000', `--user-data-dir=${join(dir, 'profile')}`, `--window-size=${w},${h}`, '--virtual-time-budget=3000', `--screenshot=${out}`, pathToFileURL(page).href], { stdio: 'ignore' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The initial of the name on paper: the mark used by every icon. @param {number} size */
const mark = (size) => `<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${t.paper};border-radius:${Math.round(size * 0.19)}px">
  <span style="font:900 ${Math.round(size * 0.78)}px/1 Fraunces;transform:translateY(${Math.round(size * 0.06)}px);${INK}">${copy('es').name[0]}</span></div>`;

function og(/** @type {'es' | 'en'} */ lang, /** @type {string} */ out) {
  const c = copy(lang);
  const [first, ...rest] = c.name.split(' ');
  render(`<div style="width:1200px;height:630px;padding:84px;display:grid;align-content:center;gap:22px;background:${t.paper};color:${t.ink}">
    <p style="font:500 22px Mono;letter-spacing:0.14em;text-transform:uppercase;color:${t.muted}">${c.eyebrow}</p>
    <h1 style="font:900 150px/0.92 Fraunces;letter-spacing:-0.02em;${INK}">${first}<br>${rest.join(' ')}</h1>
    <p style="font:400 40px Fraunces">${c.headline} <em style="color:${t.accent}">${c.em}</em></p>
    <p style="margin-top:8px;padding-top:22px;border-top:1px solid ${t.line};text-align:right;font:500 22px Mono;color:${t.muted}">alvaroq.github.io</p>
  </div>`, 1200, 630, out);
}

// favicon.svg: vector mark (browsers draw SVG favicons without web fonts, so the serif falls back)
writeFileSync(join(pub, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop offset=".2" stop-color="${t.ink}"/><stop offset=".55" stop-color="${t.ink2}"/><stop offset=".85" stop-color="${t.accent}"/></linearGradient></defs>
  <rect width="32" height="32" rx="6" fill="${t.paper}"/>
  <text x="16" y="27" text-anchor="middle" font-family="Fraunces, 'Iowan Old Style', Georgia, serif" font-weight="900" font-size="25" fill="url(#ink)">${copy('es').name[0]}</text>
</svg>
`);
render(mark(180), 180, 180, join(pub, 'apple-touch-icon.png'));
render(mark(32), 32, 32, join(pub, 'favicon-32x32.png'));

// favicon.ico: the 32 px PNG wrapped in an ICO container (PNG-in-ICO, supported everywhere)
const png = readFileSync(join(pub, 'favicon-32x32.png'));
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4); // reserved, type icon, 1 image
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); // 32×32, 1 plane, 32 bpp
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([ico, png]));

og('es', join(pub, 'images/og-image.png'));
og('en', join(pub, 'images/og-image-en.png'));
console.log('Brand assets written to public/');
