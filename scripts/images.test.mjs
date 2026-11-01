// Unit tests for the pure image-sizing math (src/lib/media.ts; Node strips the types).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitFor, sizesFor, thumbSizes, PORTRAIT_RATIO } from '../src/lib/media.ts';

const feature = {
  slots: [{ w: 600, h: 375, dpr: 2 }, { w: 488, h: 305, dpr: 2 }, { w: 342, h: 214, dpr: 3 }],
  lg: 600,
  md: 'calc((100vw - 48px) / 2)',
};

test('fitFor: portrait-ish sources are always shown whole', () => {
  assert.equal(fitFor({ width: 1000, height: 1000 * PORTRAIT_RATIO }, feature.slots), 'contain');
});

test('fitFor: cover only when every slot stays at or below 1x', () => {
  assert.equal(fitFor({ width: 1200, height: 750 }, feature.slots), 'cover');
  assert.equal(fitFor({ width: 1100, height: 690 }, feature.slots), 'contain');
});

test('sizesFor cover: wider-than-16:10 sources scale every slot by the crop factor', () => {
  const { sizes } = sizesFor({ width: 2000, height: 1000 }, feature, 'cover');
  assert.equal(sizes, '(min-width: 1024px) 750px, (min-width: 768px) calc(calc((100vw - 48px) / 2) * 1.250), calc((100vw - 48px) * 1.250)');
});

test('sizesFor contain: never above half the source', () => {
  const { sizes } = sizesFor({ width: 722, height: 720 }, feature, 'contain');
  assert.equal(sizes, '(min-width: 1024px) 361px, (min-width: 768px) 306px, 215px');
});

test('thumbSizes: height capped at a third of the source', () => {
  assert.deepEqual(thumbSizes({ width: 1376, height: 661 }, { maxHeight: 250, maxWidth: 750, mobileMaxWidth: 540 }), {
    maxHeight: 220,
    sizes: '(max-width: 600px) 458px, 458px',
  });
});
