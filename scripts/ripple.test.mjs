// Ripple cadence (project-ripple T4, user choice V2): a fixed 60 Hz simulation step, so the waves
// move at the same speed on 60, 144 and 180 Hz displays, and slower than before.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUNE, TICK_MS, SETTLE_TICKS, advance, waveSpeed, settleTicks } from '../src/scripts/project-ripple.js';
import { WAVE_SHADER, RENDER_SHADER } from '../src/scripts/ripple-shader.js';

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
