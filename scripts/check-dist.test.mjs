// Deterministic checks over the built site. `npm run verify` builds first; on its own,
// run `npm run build` before `node --test scripts/`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = 'https://alvaroq.github.io/';
const pages = { es: 'index.html', en: 'en/index.html' };

function read(rel) {
  const path = dist + rel;
  assert.ok(existsSync(path), `missing ${rel}: run the build first`);
  return readFileSync(path, 'utf8');
}

const html = Object.fromEntries(Object.entries(pages).map(([lang, rel]) => [lang, read(rel)]));
const dom = Object.fromEntries(Object.entries(html).map(([lang, src]) => [lang, parse(src)]));

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`]));
}

// "15+ years", "+15 años", "más de 15 años", "over 15 years", with or without tags in between.
const YEARS_CLAIM = /(\d+)\s*\+\s*(?:<[^>]+>\s*)*(?:años|years)|\+\s*(\d+)\s*(?:<[^>]+>\s*)*(?:años|years)|(?:más de|over)\s*(?:<[^>]+>\s*)*(\d+)\s*(?:<[^>]+>\s*)*(?:años|years)/gi;

test('a single years-of-experience figure across both pages', () => {
  const figures = new Set();
  for (const src of Object.values(html)) {
    for (const m of src.matchAll(YEARS_CLAIM)) figures.add(m[1] ?? m[2] ?? m[3]);
  }
  assert.ok(figures.size > 0, 'no years claim found');
  assert.deepEqual([...figures], [[...figures][0]], `conflicting figures: ${[...figures].join(', ')}`);
});

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: exactly one h1`, () => {
    assert.equal(root.querySelectorAll('h1').length, 1);
  });

  test(`${lang}: every target=_blank link has rel noopener noreferrer`, () => {
    for (const a of root.querySelectorAll('a[target="_blank"]')) {
      const rel = (a.getAttribute('rel') ?? '').split(/\s+/);
      assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), `${a.getAttribute('href')} lacks rel`);
    }
  });

  test(`${lang}: images with width descriptors declare sizes`, () => {
    for (const img of root.querySelectorAll('img[srcset]')) {
      if (/\s\d+w(,|$)/.test(img.getAttribute('srcset'))) assert.ok(img.getAttribute('sizes'), `${img.getAttribute('src')} lacks sizes`);
    }
  });

  test(`${lang}: canonical, reciprocal hreflang and x-default`, () => {
    const self = lang === 'es' ? SITE : `${SITE}en/`;
    assert.equal(root.querySelector('link[rel="canonical"]')?.getAttribute('href'), self);
    const alternates = Object.fromEntries(root.querySelectorAll('link[rel="alternate"][hreflang]').map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    assert.deepEqual(alternates, { es: SITE, en: `${SITE}en/`, 'x-default': SITE });
  });

  test(`${lang}: JSON-LD parses and describes the page`, () => {
    const blocks = root.querySelectorAll('script[type="application/ld+json"]');
    assert.equal(blocks.length, 1);
    const data = JSON.parse(blocks[0].textContent);
    const types = data['@graph'].map((n) => n['@type']);
    assert.deepEqual(types, ['Person', 'WebSite', 'ProfilePage']);
  });

  test(`${lang}: decorative canvases are hidden from assistive tech`, () => {
    const canvases = root.querySelectorAll('canvas');
    assert.ok(canvases.length > 0);
    for (const c of canvases) {
      const hidden = c.getAttribute('aria-hidden') === 'true' || c.closest('[aria-hidden="true"]');
      assert.ok(hidden, `canvas.${c.getAttribute('class')} is exposed`);
    }
  });
}

test('both pages render the same sections', () => {
  const ids = (root) => root.querySelectorAll('section[id]').map((s) => s.id);
  assert.deepEqual(ids(dom.en), ids(dom.es));
  assert.ok(ids(dom.es).length >= 6);
});

test('no source maps or .DS_Store in dist', () => {
  const stray = walk(dist).filter((f) => f.endsWith('.map') || f.endsWith('.DS_Store'));
  assert.deepEqual(stray, []);
});

// The chat widget is an Astro component with a native dialog (P5a).
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: the chat is a named dialog with a live log and a labelled input`, () => {
    const dialog = root.querySelector('dialog#chat-dialog');
    assert.ok(dialog, 'dialog#chat-dialog missing');
    assert.ok(dialog.getAttribute('aria-labelledby') || dialog.getAttribute('aria-label'));
    assert.ok(dialog.querySelector('[role="log"][aria-live="polite"]'));
    const input = dialog.querySelector('input');
    assert.ok(input && dialog.querySelector(`label[for="${input.id}"]`), 'input without <label>');
    assert.equal(input.getAttribute('maxlength'), '500');
  });

  test(`${lang}: chat strings are in the page language`, () => {
    const close = lang === 'es' ? 'Cerrar chat' : 'Close chat';
    assert.ok(html[lang].includes(close), `"${close}" not found`);
  });
}
