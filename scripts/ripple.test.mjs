// Ripple cadence (project-ripple T4, user choice V2): a fixed 60 Hz simulation step, so the waves
// move at the same speed on 60, 144 and 180 Hz displays, and slower than before.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUNE, TICK_MS, SETTLE_TICKS, advance, waveSpeed, settleTicks, wallMask } from '../src/scripts/project-ripple.js';
import { WAVE_SHADER, DROP_SHADER, RENDER_SHADER } from '../src/scripts/ripple-shader.js';

/** Simulation ticks run over `seconds` of display frames at `hz`. */
function ticksOver(hz, seconds) {
  let acc = 0, total = 0;
  for (let i = 0; i < Math.round(hz * seconds); i++) {
    const r = advance(acc, 1000 / hz);
    acc = r.acc;
    total += r.ticks;
  }
  return total;
}

test('the simulation advances 60 ticks per second whatever the refresh rate', () => {
  for (const hz of [60, 75, 120, 144, 180]) {
    const n = ticksOver(hz, 2);
    assert.ok(Math.abs(n - 120) <= 1, `${hz} Hz ran ${n} ticks in 2 s`);
  }
  assert.equal(TICK_MS, 1000 / 60);
});

test('a long frame (tab switch, jank) never runs more than 100 ms of simulation', () => {
  const r = advance(0, 5000);
  assert.equal(r.ticks, 6);
  assert.ok(r.acc >= 0 && r.acc < TICK_MS);
});

test('cadence V2: one step per tick, coefficient .30, a drop every 28 px, damping .975', () => {
  assert.equal(TUNE.wave, 0.3);
  assert.equal(TUNE.spacing, 28);
  assert.equal(TUNE.damp, 0.975);
  // sqrt(.30) cells per tick × 3 px × 60 ticks/s ≈ 99 px/s (was 241 px/s at 60 Hz, 579 at 144 Hz).
  assert.ok(Math.abs(waveSpeed() - 98.6) < 0.1, `${waveSpeed()} px/s`);
});

test('the loop settles when the water is below 1 % of a drop (about 3 s)', () => {
  assert.equal(settleTicks(0.975), 182);
  assert.equal(SETTLE_TICKS, settleTicks(TUNE.damp));
  assert.ok(SETTLE_TICKS / 60 >= 2.5 && SETTLE_TICKS / 60 <= 3.5);
});

test('the wave coefficient is a uniform, not a constant in the shader', () => {
  assert.match(WAVE_SHADER, /uniform[^;]*\buK\b/);
  assert.doesNotMatch(WAVE_SHADER, /\.45\s*\*\s*lap/);
});

// L14: "añade un alpha a las ondas para que no destaque tanto".
test('the rings carry an overall alpha below 1 (peak alpha 0.12 × 0.4)', () => {
  assert.equal(TUNE.alpha, 0.4);
  assert.match(RENDER_SHADER, /uniform[^;]*\buAlpha\b/);
  assert.match(RENDER_SHADER, /\*\s*uAlpha/);
});

// Part B, option B3 (L16): the project images are walls in the simulation; the waves bend around
// them and never enter them, so the covers stay pixel for pixel while the water moves.
test('the wall mask marks the image boxes in simulation cells, row 0 at the bottom', () => {
  // Section 30 × 30 CSS px at 3 px per cell → 10 × 10 cells; one image box at the top left.
  const mask = wallMask(10, 10, [[0, 0, 12, 6]], { w: 30, h: 30 }, 3);
  assert.equal(mask.length, 100);
  const at = (x, row) => mask[row * 10 + x];
  // CSS y 0–6 is the top of the section: cell rows 8 and 9 (row 0 is the bottom).
  for (const row of [8, 9]) for (let x = 0; x < 4; x++) assert.equal(at(x, row), 255, `cell ${x},${row}`);
  assert.equal(at(4, 9), 0);
  assert.equal(at(0, 7), 0);
  assert.equal(mask.filter(Boolean).length, 8);
});

test('a contained screenshot leaves water on both sides while other media remain full walls', () => {
  // A 30 × 12 media slot contains a portrait at x 12–18; another full slot sits below it.
  const mask = wallMask(10, 10, [[12, 0, 18, 12], [0, 18, 30, 30]], { w: 30, h: 30 }, 3);
  const at = (x, y) => mask[(9 - y) * 10 + x];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const wall = (y < 4 && x >= 4 && x < 6) || y >= 6;
      assert.equal(at(x, y), wall ? 255 : 0, `cell ${x},${y}`);
    }
  }
});

test('the wall mask clamps boxes that leave the section', () => {
  const mask = wallMask(4, 4, [[-30, -30, 300, 300]], { w: 12, h: 12 }, 3);
  assert.equal(mask.filter(Boolean).length, 16);
  assert.equal(wallMask(4, 4, [], { w: 12, h: 12 }, 3).some(Boolean), false);
});

test('the wave and drop passes zero the water inside the walls', () => {
  for (const src of [WAVE_SHADER, DROP_SHADER]) {
    assert.match(src, /uniform sampler2D[^;]*\buM\b/);
    assert.match(src, /1\.\s*-\s*texture2D\(uM,v\)\.r/);
  }
});
