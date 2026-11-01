// Deterministic checks over the built site (run `npm run build` first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = { es: 'index.html', en: 'en/index.html' };

function read(rel) {
  const path = dist + rel;
  assert.ok(existsSync(path), `missing ${rel}: run the build first`);
  return readFileSync(path, 'utf8');
}

// "15+ years", "+15 años", "más de 15 años", "over 15 years", with or without tags in between.
const YEARS_CLAIM = /(\d+)\s*\+\s*(?:<[^>]+>\s*)*(?:años|years)|\+\s*(\d+)\s*(?:<[^>]+>\s*)*(?:años|years)|(?:más de|over)\s*(?:<[^>]+>\s*)*(\d+)\s*(?:<[^>]+>\s*)*(?:años|years)/gi;

test('a single years-of-experience figure across both pages', () => {
  const figures = new Set();
  for (const rel of Object.values(pages)) {
    for (const m of read(rel).matchAll(YEARS_CLAIM)) figures.add(m[1] ?? m[2] ?? m[3]);
  }
  assert.ok(figures.size > 0, 'no years claim found');
  assert.deepEqual([...figures], [[...figures][0]], `conflicting figures: ${[...figures].join(', ')}`);
});
