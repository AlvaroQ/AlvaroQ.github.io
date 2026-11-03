// Run after a build: node --test scripts/project-cards.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import sharp from 'sharp';

const dist = new URL('../dist/', import.meta.url);
const covers = [
  { slug: 'lotto-scan', key: 'lotto-scan-card', width: 1920, height: 1200,
    clear: [[0, 0], [200, 600], [960, 600], [630, 1150], [395, 65]],
    solid: [[630, 150], [630, 600], [1280, 150], [1280, 600], [630, 1040]] },
  { slug: 'web-scraper-pro', key: 'scrapper-pro-card', width: 880, height: 550,
    clear: [[0, 0], [440, 0], [5, 300], [875, 300], [440, 90]],
    solid: [[200, 400], [700, 400], [450, 360], [170, 40]] },
];

for (const lang of ['', 'en/']) {
  const root = parse(readFileSync(new URL(`${lang}index.html`, dist), 'utf8'));
  for (const cover of covers) {
    const card = root.querySelectorAll('article.card').find((c) => c.querySelector(`[data-open-case="${cover.slug}"]`));
    const img = card.querySelector('.media img');
    test(`${lang || 'es/'}${cover.slug}: card-only cover selected`, () => {
      assert.ok(img.getAttribute('src').includes(`/${cover.key}.`));
      assert.equal(Number(img.getAttribute('width')), cover.width);
      assert.equal(Number(img.getAttribute('height')), cover.height);
    });
    test(`${lang || 'es/'}${cover.slug}: built responsive covers remove matte and preserve foreground`, async () => {
      const urls = new Set([img.getAttribute('src'), ...img.getAttribute('srcset').split(',').map((s) => s.trim().split(/\s+/)[0])]);
      for (const url of urls) {
        const { data, info } = await sharp(new URL(url.slice(1), dist).pathname).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const alpha = ([x, y]) => data[(Math.min(info.height - 1, Math.round(y * info.height / cover.height)) * info.width + Math.min(info.width - 1, Math.round(x * info.width / cover.width))) * 4 + 3];
        for (const point of cover.clear) assert.ok(alpha(point) <= 12, `${url}: exterior ${point} alpha=${alpha(point)}`);
        for (const point of cover.solid) assert.ok(alpha(point) >= 245, `${url}: foreground ${point} alpha=${alpha(point)}`);
      }
    });
  }
}
