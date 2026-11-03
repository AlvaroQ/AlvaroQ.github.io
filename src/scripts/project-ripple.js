// Water-drop ripple over the Projects section: faint ink rings across the full width, never over
// the project images, which are walls in the simulation: the waves bend around them. One WebGL context and one canvas for the whole section; the heightfield
// covers the section, the canvas only the visible window of it (moved on scroll with CSSOM).
// Imported by URL from ProjectRipple.astro on the first hover, so it cannot have static imports:
// the GLSL module and the colour helpers are passed to init().
// The loop runs only while the water moves on a visible section in a visible tab. The simulation
// advances on a fixed 60 Hz step, so the waves keep the same speed on 60, 144 or 180 Hz displays;
// the render runs once per display frame.

/**
 * Tuning. sim: CSS px per cell. wave: laplacian coefficient (propagation speed, sqrt(wave) cells
 * per tick). damp: decay per tick (how long a ring lives). spacing: CSS px of pointer travel per
 * drop (how many rings a stroke leaves). shade, drop: ring light and drop strength. alpha: overall
 * opacity of the rings, so they stay in the background.
 */
export const TUNE = { sim: 3, wave: 0.3, damp: 0.975, spacing: 28, shade: 0.55, drop: 0.26, alpha: 0.4 };
/** Ring strength per theme (alpha is capped at 0.12 in the shader). */
const RING = { light: 0.42, dark: 0.9 };
/** Simulation step: 60 ticks per second whatever the refresh rate. */
export const TICK_MS = 1000 / 60;
/** Longest frame gap simulated at once (a tab switch or a jank never replays seconds of water). */
const MAX_GAP_MS = 100;

/**
 * Ticks to run for a display frame of `dt` ms, carrying the remainder in `acc`.
 * @param {number} acc @param {number} dt @returns {{ ticks: number, acc: number }}
 */
export function advance(acc, dt) {
  const total = acc + Math.min(Math.max(dt, 0), MAX_GAP_MS);
  const ticks = Math.floor(total / TICK_MS);
  return { ticks, acc: total - ticks * TICK_MS };
}

/** Wave speed in CSS px per second. */
export const waveSpeed = (t = TUNE) => Math.sqrt(t.wave) * t.sim * (1000 / TICK_MS);

/** Ticks until a ring decays below 1 % of its height: the loop stops then. */
export const settleTicks = (damp) => Math.ceil(Math.log(0.01) / Math.log(damp));
export const SETTLE_TICKS = settleTicks(TUNE.damp);

/**
 * Walls for the simulation: 255 in the cells covered by an image box, 0 elsewhere. One byte per
 * cell, row 0 at the bottom of the section (the heightfield's orientation).
 * @param {number} w @param {number} h simulation size in cells
 * @param {number[][]} boxes image boxes (x0, y0, x1, y1) in section CSS px, y down
 * @param {{ w: number, h: number }} section section size in CSS px
 * @param {number} cell CSS px per cell
 */
export function wallMask(w, h, boxes, section, cell) {
  const mask = new Uint8Array(w * h);
  const clamp = (v, max) => Math.min(Math.max(v, 0), max);
  for (const [x0, y0, x1, y1] of boxes) {
    const c0 = clamp(Math.floor(x0 / cell), w), c1 = clamp(Math.ceil(x1 / cell), w);
    const r0 = clamp(Math.floor((section.h - y1) / cell), h), r1 = clamp(Math.ceil((section.h - y0) / cell), h);
    for (let r = r0; r < r1; r++) mask.fill(255, r * w + c0, r * w + c1);
  }
  return mask;
}
/** Device-pixel cap for the canvas: the rings are soft, 1.5× is indistinguishable from 2×. */
const MAX_DPR = 1.5;

/** Counters read by the CDP probes; never used by the page itself. */
export const probe = { frames: 0, bench: null };

const DISABLED = ['(pointer: coarse)', '(prefers-reduced-motion: reduce)', '(forced-colors: active)'];

/**
 * @param {HTMLElement} scope positioned element around the section
 * @param {{ shader: typeof import('./ripple-shader.js'), color: typeof import('./ink-color.js') }} deps
 * @returns {{ start(e?: PointerEvent): void } | null} null when the effect cannot run
 */
export function init(scope, { shader, color }) {
  if (DISABLED.some((q) => matchMedia(q).matches)) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'ripple-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  const half = gl.getExtension('OES_texture_half_float');
  gl.getExtension('OES_texture_half_float_linear');
  const full = gl.getExtension('OES_texture_float');
  const TYPE = half ? half.HALF_FLOAT_OES : full ? gl.FLOAT : null;
  if (!TYPE) return null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const program = (fs, names) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, shader.VERTEX_SHADER));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program');
    return { p, u: Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) };
  };
  let wave, drop, rend;
  try {
    wave = program(shader.WAVE_SHADER, ['uP', 'uC', 'uM', 'uT', 'uD', 'uK']);
    drop = program(shader.DROP_SHADER, ['uS', 'uM', 'uSize', 'uDrop']);
    rend = program(shader.RENDER_SHADER, ['uH', 'uT', 'uSection', 'uWin', 'uHoles', 'uHoleCount', 'uInk', 'uShade', 'uRing', 'uAlpha']);
  } catch {
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Three heightfield targets over the whole section: previous, current, next.
  let tex = [], fbs = [], order = [0, 1, 2], simW = 0, simH = 0;
  const resizeTargets = (w, h) => {
    if (w === simW && h === simH) return;
    tex.forEach((t) => gl.deleteTexture(t));
    fbs.forEach((f) => gl.deleteFramebuffer(f));
    tex = [0, 1, 2].map(() => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, TYPE, null);
      for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR);
      for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
      return t;
    });
    fbs = tex.map((t) => {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return f;
    });
    simW = w;
    simH = h;
    order = [0, 1, 2];
  };

  // Wall mask at simulation resolution (one byte per cell, sampled at cell centres).
  const wallTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, wallTex);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
  const uploadWalls = (data) => {
    gl.bindTexture(gl.TEXTURE_2D, wallTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, simW, simH, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
  };
  const bindWalls = (u) => {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, wallTex);
    gl.uniform1i(u, 2);
  };

  let ink = [1, 1, 1], light = false;
  const readTheme = () => {
    ink = color.token('--ink');
    light = document.documentElement.classList.contains('light');
  };
  readTheme();
  document.addEventListener('themechange', readTheme);

  let size = { w: 1, h: 1 }, win = { top: -1, h: 1 };
  /** Image boxes in section px: the rings never draw over them. */
  let holes = [];
  let running = false, raf = 0, quiet = SETTLE_TICKS + 1, onScreen = true, dead = false;
  let acc = 0, prev = 0;
  const drops = [];
  let last = null;

  /** Section size, simulation targets and the image boxes (section px). */
  function measure() {
    const r = scope.getBoundingClientRect();
    size = { w: r.width, h: r.height };
    resizeTargets(Math.max(2, Math.round(size.w / TUNE.sim)), Math.max(2, Math.round(size.h / TUNE.sim)));
    holes = [...scope.querySelectorAll('.media')].map((m) => {
      // RAG's contained screenshot leaves open water around it, not a rectangular plate.
      const obstacle = m.hasAttribute('data-ripple-image-only') ? (m.querySelector('img') ?? m) : m;
      const b = obstacle.getBoundingClientRect();
      return [b.left - r.left, b.top - r.top, b.right - r.left, b.bottom - r.top];
    });
    uploadWalls(wallMask(simW, simH, holes, size, TUNE.sim));
  }

  /** The canvas covers the visible part of the section: size and offset follow the viewport. */
  function place() {
    const r = scope.getBoundingClientRect();
    const h = Math.max(1, Math.min(innerHeight, size.h));
    const top = Math.min(Math.max(-r.top, 0), size.h - h);
    const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
    const w = Math.round(size.w * dpr), hh = Math.round(h * dpr);
    if (canvas.width !== w || canvas.height !== hh) {
      canvas.width = w;
      canvas.height = hh;
      canvas.style.height = `${h}px`;
    }
    if (top !== win.top) canvas.style.transform = `translateY(${top}px)`;
    win = { top, h };
  }

  const quad = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  function addDrops() {
    if (!drops.length) return;
    const data = new Float32Array(16);
    drops.splice(0, 4).forEach((d, i) => data.set([d.x / TUNE.sim, (size.h - d.y) / TUNE.sim, d.r / TUNE.sim, d.s], i * 4));
    gl.useProgram(drop.p);
    gl.viewport(0, 0, simW, simH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[1]]);
    gl.uniform1i(drop.u.uS, 0);
    gl.uniform2f(drop.u.uSize, simW, simH);
    gl.uniform4fv(drop.u.uDrop, data);
    bindWalls(drop.u.uM);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[order[2]]);
    quad();
    [order[1], order[2]] = [order[2], order[1]];
  }
  function step() {
    gl.useProgram(wave.p);
    gl.viewport(0, 0, simW, simH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[0]]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[1]]);
    gl.uniform1i(wave.u.uP, 0);
    gl.uniform1i(wave.u.uC, 1);
    gl.uniform2f(wave.u.uT, 1 / simW, 1 / simH);
    gl.uniform1f(wave.u.uD, TUNE.damp);
    gl.uniform1f(wave.u.uK, TUNE.wave);
    bindWalls(wave.u.uM);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[order[2]]);
    quad();
    order = [order[1], order[2], order[0]];
  }
  function render() {
    place();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(rend.p);
    const u = rend.u;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[1]]);
    gl.uniform1i(u.uH, 0);
    gl.uniform2f(u.uT, 1 / simW, 1 / simH);
    gl.uniform2f(u.uSection, size.w, size.h);
    gl.uniform2f(u.uWin, win.top, win.h);
    // Only the image boxes that overlap the window, up to the shader's limit.
    const visible = holes.filter((b) => b[3] > win.top && b[1] < win.top + win.h).slice(0, shader.MAX_HOLES);
    const data = new Float32Array(shader.MAX_HOLES * 4);
    visible.forEach((b, i) => data.set(b, i * 4));
    gl.uniform4fv(u.uHoles, data);
    gl.uniform1f(u.uHoleCount, visible.length);
    gl.uniform3fv(u.uInk, ink);
    gl.uniform1f(u.uShade, light ? TUNE.shade * 0.7 : TUNE.shade);
    gl.uniform1f(u.uRing, light ? RING.light : RING.dark);
    gl.uniform1f(u.uAlpha, TUNE.alpha);
    quad();
  }

  /** @param {number} now */
  function frame(now) {
    raf = 0;
    if (!running) return;
    const r = advance(acc, prev ? now - prev : TICK_MS);
    acc = r.acc;
    prev = now;
    for (let i = 0; i < r.ticks; i++) {
      addDrops();
      step();
    }
    if (r.ticks) render();
    probe.frames++;
    // A resting pointer adds no drops: the loop stops once the water settles, hover or not.
    quiet += r.ticks;
    if (quiet > SETTLE_TICKS) {
      stop();
      canvas.classList.remove('is-on');
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || dead || !onScreen || document.hidden) return;
    running = true;
    acc = 0;
    prev = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  const settled = () => quiet > SETTLE_TICKS;

  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (!onScreen) stop();
    else if (!settled()) start();
  });
  io.observe(scope);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : !settled() && start()));
  // Card heights change with the viewport (and the fonts): keep the section map in sync.
  const ro = new ResizeObserver(() => measure());
  ro.observe(scope);
  // A lazy image can resize inside a fixed media box without changing the section height.
  for (const img of scope.querySelectorAll('.media[data-ripple-image-only] img')) ro.observe(img);

  // Context loss: the section goes back to exactly how it is without the effect.
  canvas.addEventListener('webglcontextlost', () => {
    dead = true;
    stop();
    io.disconnect();
    ro.disconnect();
    canvas.remove();
  });

  const isMouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  const local = (e) => {
    const r = scope.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  /** Queue a drop and wake the loop. */
  function splash(d) {
    if (dead) return;
    drops.push(d);
    quiet = 0;
    canvas.classList.add('is-on');
    start();
  }
  function move(e) {
    const { x, y } = local(e);
    if (last) {
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      if (d < 6) return;
      const n = Math.min(Math.ceil(d / TUNE.spacing), 4);
      for (let i = 1; i <= n; i++) splash({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n, r: 16, s: TUNE.drop });
    } else {
      splash({ x, y, r: 22, s: TUNE.drop * 1.6 });
    }
    last = { x, y };
  }
  /** First drop where the pointer enters (or comes back). */
  function enter(e) {
    last = null;
    if (e) move(e);
  }

  scope.addEventListener('pointerenter', (e) => isMouse(e) && enter(e));
  scope.addEventListener('pointermove', (e) => isMouse(e) && move(e));
  scope.addEventListener('pointerleave', () => (last = null));
  scope.addEventListener('pointerdown', (e) => {
    if (!isMouse(e)) return;
    const { x, y } = local(e);
    splash({ x, y, r: 34, s: TUNE.drop * 3 });
  });

  measure();
  scope.prepend(canvas);

  // Probe hook: n ticks with drops in the visible window, each in a GPU timer query when available.
  probe.bench = async (n = 120) => {
    const ext = gl.getExtension('EXT_disjoint_timer_query');
    const was = running;
    stop();
    const queries = [];
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      if (i % 4 === 0) drops.push({ x: size.w * (0.1 + 0.8 * Math.random()), y: win.top + win.h * (0.2 + 0.6 * Math.random()), r: 18, s: TUNE.drop });
      const q = ext?.createQueryEXT();
      if (q) ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, q);
      addDrops();
      step();
      render();
      if (q) { ext.endQueryEXT(ext.TIME_ELAPSED_EXT); queries.push(q); }
      await new Promise(requestAnimationFrame);
    }
    const wall = (performance.now() - t0) / n;
    await new Promise((r) => setTimeout(r, 200));
    const ms = queries
      .filter((q) => ext.getQueryObjectEXT(q, ext.QUERY_RESULT_AVAILABLE_EXT))
      .map((q) => ext.getQueryObjectEXT(q, ext.QUERY_RESULT_EXT) / 1e6)
      .sort((a, b) => a - b);
    if (was) start();
    return { gpuMedian: ms[ms.length >> 1], gpuP95: ms[Math.floor(ms.length * 0.95)], samples: ms.length, wallPerFrame: wall, canvas: [canvas.width, canvas.height], sim: [simW, simH] };
  };

  return { start: enter };
}
