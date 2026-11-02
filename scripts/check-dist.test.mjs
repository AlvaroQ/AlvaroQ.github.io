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
    for (const m of src.matchAll(YEARS_CLAIM)) {
      // The "+8 años / en B-FY" stat is the tenure at the current company, not the experience
      // figure; its label (dt) precedes the figure (dd) in the markup.
      const before = src.slice(Math.max(0, m.index - 300), m.index).replace(/<[^>]+>/g, ' ');
      if (/(en|at) B-FY\s*$/.test(before)) continue;
      figures.add(m[1] ?? m[2] ?? m[3]);
    }
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

const PROJECTS = 11;

// Widgets are Astro components (P5a): native dialogs, case studies rendered at build time.
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: one project dialog and one case template per project`, () => {
    assert.equal(root.querySelectorAll('dialog#project-modal').length, 1);
    const cases = root.querySelectorAll('template[data-case]');
    assert.equal(cases.length, PROJECTS);
    assert.equal(new Set(cases.map((t) => t.getAttribute('data-case'))).size, PROJECTS);
  });

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

  test(`${lang}: no public widget scripts and no inline event handlers`, () => {
    assert.equal(root.querySelectorAll('script[src^="/scripts/"]').length, 0);
    const handlers = root.querySelectorAll('*').flatMap((el) => Object.keys(el.attributes).filter((a) => /^on/i.test(a)).map((a) => `${el.tagName}[${a}]`));
    assert.deepEqual(handlers, []);
  });
}

// Strict CSP (P2): Astro's security.csp meta, hashes for every inline script and style.
import { createHash } from 'node:crypto';

const CHAT_ORIGIN = 'https://portfolio-chatbot.alvaroq-dev.workers.dev';
const sha256 = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

function policy(root) {
  const metas = root.querySelectorAll('meta[http-equiv="content-security-policy" i]');
  assert.equal(metas.length, 1, 'expected exactly one CSP meta');
  return Object.fromEntries(
    metas[0].getAttribute('content').split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
      const [name, ...values] = d.split(/\s+/);
      return [name, values];
    }),
  );
}

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: strict CSP`, () => {
    const csp = policy(root);
    assert.deepEqual(csp['default-src'], ["'none'"]);
    for (const d of ['script-src', 'style-src']) {
      assert.ok(csp[d], `${d} missing`);
      assert.ok(!csp[d].includes("'unsafe-inline'") && !csp[d].includes("'unsafe-eval'"), `${d} is not strict`);
    }
    assert.deepEqual(csp['connect-src'], [CHAT_ORIGIN]);
    for (const d of ['base-uri', 'object-src', 'form-action']) assert.deepEqual(csp[d], ["'none'"], d);
    assert.ok('upgrade-insecure-requests' in csp);
  });

  test(`${lang}: every inline script and style is allowed by hash`, () => {
    const csp = policy(root);
    const scripts = root.querySelectorAll('script:not([src])').filter((s) => s.getAttribute('type') !== 'application/ld+json');
    assert.ok(scripts.length > 0);
    for (const s of scripts) assert.ok(csp['script-src'].includes(sha256(s.textContent)), `inline script not hashed: ${s.textContent.slice(0, 60)}`);
    for (const s of root.querySelectorAll('style')) assert.ok(csp['style-src'].includes(sha256(s.textContent)), 'inline style not hashed');
  });

  test(`${lang}: no style attributes (a hashed style-src blocks them)`, () => {
    const styled = root.querySelectorAll('[style]').map((el) => `${el.tagName}[style="${el.getAttribute('style')}"]`);
    assert.deepEqual(styled, []);
  });

  test(`${lang}: referrer policy`, () => {
    assert.equal(root.querySelector('meta[name="referrer"]')?.getAttribute('content'), 'strict-origin-when-cross-origin');
  });
}

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: external links use https`, () => {
    const insecure = root.querySelectorAll('a[href]').map((a) => a.getAttribute('href')).filter((h) => /^[a-z]+:/i.test(h) && !/^(https:|mailto:)/i.test(h));
    assert.deepEqual(insecure, []);
  });
}

// Accessibility (P3): extended-link cards and accessible names that start with the visible text.
const visibleText = (el) => {
  const clone = el.clone();
  for (const hidden of clone.querySelectorAll('.sr-only, [aria-hidden="true"]')) hidden.remove();
  return clone.textContent.replace(/\s+/g, ' ').trim();
};

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: no ARIA roles on articles`, () => {
    assert.deepEqual(root.querySelectorAll('article[role]').map((a) => a.getAttribute('role')), []);
  });

  test(`${lang}: one case button inside the heading of each card`, () => {
    const cards = root.querySelectorAll('article.card');
    assert.equal(cards.length, PROJECTS);
    for (const card of cards) {
      const buttons = card.querySelectorAll('h3 button[data-open-case]');
      assert.equal(buttons.length, 1, card.querySelector('h3')?.textContent);
      assert.ok(!card.hasAttribute('tabindex') && !card.hasAttribute('aria-label'));
    }
  });

  test(`${lang}: accessible names start with the visible text`, () => {
    const bad = [];
    // Controls only (WCAG 2.5.3 label in name); landmarks and regions may carry any name.
    for (const el of root.querySelectorAll('a[aria-label], button[aria-label], [role="button"][aria-label], [role="link"][aria-label]')) {
      const visible = visibleText(el);
      if (!/[\p{L}\p{N}]/u.test(visible)) continue; // icon-only controls: the label is the name
      const name = el.getAttribute('aria-label').trim();
      if (!name.toLowerCase().startsWith(visible.toLowerCase())) bad.push(`"${visible}" → "${name}"`);
    }
    assert.deepEqual(bad, []);
  });
}

// Assets (P5b): no orphan image masters, linked icons exist, one OG image per language.
test('no unreferenced images in dist/_astro', () => {
  const text = walk(dist).filter((f) => /\.(html|css|js)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  const orphans = walk(`${dist}_astro/`).filter((f) => /\.(jpe?g|png|webp|avif)$/.test(f)).map((f) => f.split('/').pop()).filter((name) => !text.includes(name));
  assert.deepEqual(orphans, []);
});

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: linked icons and the OG image exist`, () => {
    const hrefs = [
      ...root.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').map((l) => l.getAttribute('href')),
      root.querySelector('meta[property="og:image"]').getAttribute('content'),
    ];
    for (const href of hrefs) assert.ok(existsSync(dist + new URL(href, SITE).pathname.slice(1)), `missing ${href}`);
  });
}

test('each language has its own OG image', () => {
  const og = (root) => root.querySelector('meta[property="og:image"]').getAttribute('content');
  assert.notEqual(og(dom.es), og(dom.en));
});

// Content refresh (project-ripple T1): unnumbered sections, project list and covers.
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: section headings and navigation carry no numbers`, () => {
    for (const section of root.querySelectorAll('section[id]')) {
      const heading = section.querySelector('h2')?.parentNode;
      if (!heading) continue;
      const numbered = heading.querySelectorAll('p, span').filter((el) => /^\s*\d{1,2}\s*$/.test(el.textContent));
      assert.deepEqual(numbered.map((el) => el.textContent.trim()), [], `#${section.id}`);
    }
    for (const link of root.querySelectorAll('#main-nav a')) assert.doesNotMatch(link.textContent.trim(), /^\d/);
  });

  test(`${lang}: Gran Premio IA opens the list and invirtiendo.site replaces Cartera Investing`, () => {
    const titles = root.querySelectorAll('article.card h3 button').map((b) => b.textContent.trim());
    assert.deepEqual(titles.slice(0, 6), ['Gran Premio IA', 'invirtiendo.site', 'Briefing Mundial', 'Chart Analyzer', 'Adivina Perro', 'RAG Chatbot']);
    assert.ok(titles.includes('invirtiendo.site'));
    assert.ok(!html[lang].includes('Cartera Investing'), 'old project name still on the page');
    const first = root.querySelector('article.card .label-ui span').textContent.replace(/\s+/g, ' ').trim();
    assert.match(first, new RegExp(`01 / ${PROJECTS}$`));
  });

  test(`${lang}: Chart Analyzer is a live featured project on its new deployment, RAG Chatbot is compact`, () => {
    const cards = root.querySelectorAll('article.card');
    const byTitle = (title) => cards.find((c) => c.querySelector('h3 button')?.textContent.trim() === title);
    const chart = byTitle('Chart Analyzer');
    assert.ok(chart.classList.contains('card-feature'), 'Chart Analyzer is not a featured row');
    assert.ok(byTitle('RAG Chatbot').classList.contains('card-compact'), 'RAG Chatbot is not in the compact grid');
    assert.ok(chart.querySelector('.badge-live'), 'Chart Analyzer has no live badge');
    assert.ok(chart.toString().includes('href="https://chart-analyzer-and-stock-news.vercel.app/"'), 'new demo URL missing');
    assert.ok(chart.toString().includes('href="https://github.com/AlvaroQ/chart-analyzer-and-stock-news"'), 'GitHub link missing');
    assert.ok(!html[lang].includes('project-ia-three.vercel.app'), 'old demo URL still on the page');
  });

  test(`${lang}: the first five projects are featured rows and the sixth opens the compact grid`, () => {
    const cards = root.querySelectorAll('article.card');
    assert.equal(cards.length, PROJECTS);
    cards.slice(0, 5).forEach((c, i) => assert.ok(c.classList.contains('card-feature'), `card ${i + 1} is not featured`));
    assert.ok(cards[5].classList.contains('card-compact'), 'card 6 is not compact');
    assert.equal(root.querySelectorAll('article.card-compact').length, PROJECTS - 5);
  });

  test(`${lang}: Briefing Mundial is a live project with no external links`, () => {
    const card = root.querySelectorAll('article.card').find((c) => c.querySelector('h3 button')?.textContent.trim() === 'Briefing Mundial');
    assert.ok(card, 'Briefing Mundial card missing');
    assert.ok(card.querySelector('.badge-live'), 'no live badge');
    assert.equal(card.querySelectorAll('a[href]').length, 0, 'card links out');
    assert.equal(root.querySelectorAll('template[data-case="briefing-mundial"]').length, 1);
  });

  test(`${lang}: every project card has a responsive cover from the asset pipeline`, () => {
    for (const card of root.querySelectorAll('article.card')) {
      const img = card.querySelector('.media img');
      assert.ok(img, card.querySelector('h3')?.textContent.trim());
      assert.match(img.getAttribute('src'), /^\/_astro\//);
      assert.ok(img.getAttribute('srcset') && img.getAttribute('sizes'));
    }
  });
}

test('personal notes and pasted images are not published', () => {
  const stray = walk(dist).filter((f) => /new_proyect\.md$|orca-paste-/.test(f));
  assert.deepEqual(stray, []);
});

// Project ripple (project-ripple T2): the effect is imported by URL on the first hover only.
const RIPPLE_ATTRS = ['data-ripple-module', 'data-ripple-shader', 'data-ripple-color'];

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: the ripple scope wraps every project card and names its lazy modules`, () => {
    const scopes = root.querySelectorAll('[data-ripple-module]');
    assert.equal(scopes.length, 1);
    assert.equal(scopes[0].querySelectorAll('article.card').length, PROJECTS);
    for (const attr of RIPPLE_ATTRS) {
      const url = scopes[0].getAttribute(attr);
      assert.match(url ?? '', /^\/_astro\/.+\.js$/, attr);
      assert.ok(existsSync(dist + url.slice(1)), `${attr}: ${url} not emitted`);
    }
  });

  test(`${lang}: no ripple code is requested on the initial load`, () => {
    const scope = root.querySelector('[data-ripple-module]');
    const urls = RIPPLE_ATTRS.map((a) => scope.getAttribute(a));
    const requested = [
      ...root.querySelectorAll('script[src]').map((s) => s.getAttribute('src')),
      ...root.querySelectorAll('link[href]').map((l) => l.getAttribute('href')),
    ];
    for (const url of urls) assert.ok(!requested.includes(url), `${url} is loaded eagerly`);
    const inline = root.querySelectorAll('script:not([src])').map((s) => s.textContent).join('\n');
    assert.doesNotMatch(inline, /import\s*[{*\w][^(]*from|import\s*["']/, 'an inline script has a static import');
  });

  test(`${lang}: the anti-FOUC snippet is the only classic inline script`, () => {
    const classic = root.querySelectorAll('script:not([src])').filter((s) => !['module', 'application/ld+json'].includes(s.getAttribute('type')));
    assert.equal(classic.length, 1);
  });
}

test('modules imported by URL have no static imports (they are emitted raw)', () => {
  const scope = dom.es.querySelector('[data-ripple-module]');
  const modal = dom.es.querySelector('dialog#project-modal')?.getAttribute('data-module');
  for (const url of [...RIPPLE_ATTRS.map((a) => scope.getAttribute(a)), modal]) {
    const src = read(url.slice(1));
    assert.doesNotMatch(src, /^\s*import\s/m, url);
  }
});

for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: small component scripts stay inline (only the hero effects are external)`, () => {
    const external = root.querySelectorAll('script[src]').map((s) => s.getAttribute('src').replace(/^\/_astro\/|\.astro_astro.*$/g, ''));
    assert.deepEqual(external.sort(), ['InkName', 'InkWatermark']);
  });
}

// Full-width ripple without images (project-ripple L6).
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: the ripple scope spans the whole Projects section`, () => {
    const scope = root.querySelector('[data-ripple-module]');
    assert.equal(scope.querySelector('section')?.id, 'projects');
  });
}

test('the ripple never copies the project images', () => {
  const src = read(dom.es.querySelector('[data-ripple-module]').getAttribute('data-ripple-module').slice(1));
  assert.doesNotMatch(src, /texImage2D\([^)]*\b(img|image)\b/i);
});

// Career stats (figure + unit, then the label).
const STATS = {
  es: ['+15 años en Tech', '+8 años en B-FY', '4 entornos ANDROID · iOS · WEB · DESKTOP'],
  en: ['+15 years in Tech', '+8 years at B-FY', '4 environments ANDROID · iOS · WEB · DESKTOP'],
};
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: career stats read figure, unit and label`, () => {
    const stats = root.querySelectorAll('#career dl .stat').map((s) => {
      const dd = s.querySelector('dd');
      const unit = dd.querySelector('.stat-unit')?.textContent.trim() ?? '';
      const value = dd.textContent.trim().slice(0, dd.textContent.trim().length - unit.length).trim();
      return [value, unit, s.querySelector('dt').textContent.trim()].filter(Boolean).join(' ');
    });
    assert.deepEqual(stats, STATS[lang]);
  });
}

// invirtiendo.site case (L10): the PER vs growth chart is the cover (first shot), then the rest,
// and the tech stack in the left column of the case.
const INVIRTIENDO_SHOTS = ['per-growth-investing', 'invirtiendo-site', 'sector-context-investing', 'sesion-investing', 'cartera-investing'];
for (const [lang, root] of Object.entries(dom)) {
  test(`${lang}: invirtiendo.site case screenshots in the requested order`, () => {
    const shots = root
      .querySelectorAll('template[data-case="invirtiendo-site"] .case-shot img')
      .map((img) => img.getAttribute('src').match(/\/_astro\/([\w-]+)\./)?.[1]);
    assert.deepEqual(shots, INVIRTIENDO_SHOTS);
  });

  test(`${lang}: Chart Analyzer case adds the Claude analysis screenshot after the cover`, () => {
    const shots = root
      .querySelectorAll('template[data-case="chart-analyzer"] .case-shot img')
      .map((img) => img.getAttribute('src').match(/\/_astro\/([\w-]+)\./)?.[1]);
    assert.deepEqual(shots, ['chart-analyzer-and-stock-news', 'chart-analyzer-claude-analysis']);
  });

  test(`${lang}: Gran Premio IA case adds the telemetry and garage screenshot after the cover`, () => {
    const shots = root
      .querySelectorAll('template[data-case="gran-premio-ia"] .case-shot img')
      .map((img) => img.getAttribute('src').match(/\/_astro\/([\w-]+)\./)?.[1]);
    assert.deepEqual(shots, ['gran-premio-ia', 'gran-premio-ia-telemetry-garage']);
  });

  test(`${lang}: Lotto Scan case opens with the side-by-side phones cover`, () => {
    const shots = root
      .querySelectorAll('template[data-case="lotto-scan"] .case-shot img')
      .map((img) => img.getAttribute('src').match(/\/_astro\/([\w-]+)\./)?.[1]);
    assert.deepEqual(shots, ['lotto-scan-cover', 'lotto-scan-camera', 'lotto-scan-preview']);
  });

  test(`${lang}: Briefing Mundial case shows the masked overview after the S&P 500 screenshot`, () => {
    const shots = root
      .querySelectorAll('template[data-case="briefing-mundial"] .case-shot img')
      .map((img) => img.getAttribute('src').match(/\/_astro\/([\w-]+)\./)?.[1]);
    assert.deepEqual(shots, ['briefing-mundial-sp500', 'briefing-mundial-overview']);
  });

  test(`${lang}: every case lists its tech stack in the left column`, () => {
    for (const tpl of root.querySelectorAll('template[data-case]')) {
      const slug = tpl.getAttribute('data-case');
      assert.ok(tpl.querySelector('.case-main .case-tech'), `${slug}: stack not in .case-main`);
      assert.equal(tpl.querySelector('.case-side .case-tech'), null, `${slug}: stack still in .case-side`);
    }
  });
}
