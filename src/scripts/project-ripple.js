// Water-drop ripple over the project cards (variant c: soft refraction of the cover + faint ink
// rings over the rest of the card). One WebGL context for the whole page; its canvas moves into
// the card under the pointer. Imported by URL from ProjectRipple.astro on the first hover, so it
// cannot have static imports: the GLSL module and the colour helpers are passed to init().
// The loop runs only while the water moves on a visible card in a visible tab.

/** Tuning (CSS px): sim cell size, refraction, light, drop strength and damping. */
const TUNE = { sim: 3, refr: 12, spec: 0.2, shade: 0.55, drop: 0.26, damp: 0.965 };
/** Ring strength over the card body per theme (alpha is capped at 0.12 in the shader). */
const RING = { light: 0.42, dark: 0.9 };
/** Frames the water keeps moving after the pointer leaves (~2.5 s at 60 Hz). */
const SETTLE_FRAMES = 150;

/** Counters read by the CDP probes; never used by the page itself. */
export const probe = { frames: 0, texture: null, bench: null, force: null };

const DISABLED = ['(pointer: coarse)', '(prefers-reduced-motion: reduce)', '(forced-colors: active)'];

/**
 * @param {HTMLElement[]} cards
 * @param {{ shader: typeof import('./ripple-shader.js'), color: typeof import('./ink-color.js') }} deps
 * @returns {{ enter(card: HTMLElement): void } | null} null when the effect cannot run
 */
export function init(cards, { shader, color }) {
  if (!cards.length || DISABLED.some((q) => matchMedia(q).matches)) return null;

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
    wave = program(shader.WAVE_SHADER, ['uP', 'uC', 'uT', 'uD']);
    drop = program(shader.DROP_SHADER, ['uS', 'uSize', 'uDrop']);
    rend = program(shader.RENDER_SHADER, ['uH', 'uImg', 'uT', 'uSize', 'uClip', 'uEl', 'uFit', 'uZoom', 'uHasImg', 'uLight', 'uForce', 'uInk', 'uRefr', 'uSpec', 'uShade', 'uRing']);
  } catch {
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const params = (target, filter) => {
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(target, k, filter);
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(target, k, gl.CLAMP_TO_EDGE);
  };
  // Three heightfield targets: previous, current, next.
  let tex = [], fbs = [], order = [0, 1, 2], simW = 0, simH = 0;
  const clearTargets = () => {
    gl.clearColor(0, 0, 0, 0);
    for (const f of fbs) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  };
  const resizeTargets = (w, h) => {
    if (w === simW && h === simH) return clearTargets();
    tex.forEach((t) => gl.deleteTexture(t));
    fbs.forEach((f) => gl.deleteFramebuffer(f));
    tex = [0, 1, 2].map(() => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, TYPE, null);
      params(gl.TEXTURE_2D, gl.LINEAR);
      return t;
    });
    fbs = tex.map((t) => {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      return f;
    });
    simW = w;
    simH = h;
    order = [0, 1, 2];
    clearTargets();
  };
  const imgTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, imgTex);
  params(gl.TEXTURE_2D, gl.LINEAR);

  let ink = [1, 1, 1], light = false;
  const readTheme = () => {
    ink = color.token('--ink');
    light = document.documentElement.classList.contains('light');
  };
  readTheme();
  document.addEventListener('themechange', readTheme);

  /** @type {HTMLElement | null} */
  let card = null;
  /** @type {HTMLImageElement | null} */
  let img = null;
  let hasImg = false, box = { w: 1, h: 1 }, geo = null;
  let hovering = false, running = false, raf = 0, quiet = 0, onScreen = true, dead = false;
  const drops = [];
  let last = null;

  function layout() {
    if (!card) return;
    // The canvas sits in the card's padding box (feature cards have a top border), so its own
    // box is the origin of every coordinate below.
    const r = canvas.getBoundingClientRect();
    box = { w: r.width, h: r.height };
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.w * dpr);
    canvas.height = Math.round(box.h * dpr);
    resizeTargets(Math.max(2, Math.round(box.w / TUNE.sim)), Math.max(2, Math.round(box.h / TUNE.sim)));
    geo = null;
    const media = card.querySelector('.media');
    if (!img || !hasImg || !media) return;
    const m = media.getBoundingClientRect();
    // Fractional untransformed <img> box (the shader applies the hover scale around its centre):
    // integer offset* sizes misregister the copy by up to a device pixel.
    const style = getComputedStyle(img);
    const scale = new DOMMatrixReadOnly(style.transform).a || 1;
    const ir = img.getBoundingClientRect();
    const ew = ir.width / scale, eh = ir.height / scale;
    // The browser paints the card and the image on the device-pixel grid: snap both origins the
    // same way, or a media box at a fractional offset inside the card is copied a pixel off.
    const px = devicePixelRatio || 1;
    const snap = (v) => Math.round(v * px) / px;
    const ox = snap(r.left), oy = snap(r.top);
    const ex = snap(ir.left + ir.width / 2 - ew / 2) - ox, ey = snap(ir.top + ir.height / 2 - eh / 2) - oy;
    const nw = img.naturalWidth, nh = img.naturalHeight;
    let fit = [0, 0, ew, eh];
    if (style.objectFit === 'cover') {
      const s = Math.max(ew / nw, eh / nh);
      const [posX, posY] = style.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      fit = [(ew - nw * s) * (posX ?? 0.5), (eh - nh * s) * (posY ?? 0.5), nw * s, nh * s];
    }
    geo = { el: [ex, ey, ew, eh], fit, clip: [snap(m.left) - ox, snap(m.top) - oy, snap(m.right) - ox, snap(m.bottom) - oy] };
  }

  function setImage() {
    img = card?.querySelector('.media img') ?? null;
    hasImg = false;
    if (!img) return;
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener('load', () => { if (img && card?.contains(img)) { setImage(); layout(); } }, { once: true });
      return;
    }
    // The decoded file the browser chose (currentSrc), never a larger source.
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    hasImg = true;
    probe.texture = { src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight };
  }

  const quad = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  function addDrops() {
    if (!drops.length) return;
    const data = new Float32Array(16);
    drops.splice(0, 4).forEach((d, i) => data.set([d.x / TUNE.sim, (box.h - d.y) / TUNE.sim, d.r / TUNE.sim, d.s], i * 4));
    gl.useProgram(drop.p);
    gl.viewport(0, 0, simW, simH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[1]]);
    gl.uniform1i(drop.u.uS, 0);
    gl.uniform2f(drop.u.uSize, simW, simH);
    gl.uniform4fv(drop.u.uDrop, data);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[order[2]]);
    quad();
    order = [order[1], order[2], order[0]];
  }
  function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(rend.p);
    const u = rend.u;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[order[1]]);
    gl.uniform1i(u.uH, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.uniform1i(u.uImg, 1);
    gl.uniform2f(u.uT, 1 / simW, 1 / simH);
    gl.uniform2f(u.uSize, box.w, box.h);
    const g = geo ?? { el: [0, 0, 1, 1], fit: [0, 0, 1, 1], clip: [0, 0, 0, 0] };
    gl.uniform4fv(u.uClip, g.clip);
    gl.uniform4fv(u.uEl, g.el);
    gl.uniform4fv(u.uFit, g.fit);
    const zoom = img ? new DOMMatrixReadOnly(getComputedStyle(img).transform).a : 1;
    gl.uniform1f(u.uZoom, zoom || 1);
    gl.uniform1f(u.uHasImg, geo ? 1 : 0);
    gl.uniform1f(u.uLight, light ? 1 : 0);
    gl.uniform1f(u.uForce, probe.force ? 1 : 0);
    gl.uniform3fv(u.uInk, ink);
    gl.uniform1f(u.uRefr, TUNE.refr);
    gl.uniform1f(u.uSpec, light ? TUNE.spec * 0.8 : TUNE.spec);
    gl.uniform1f(u.uShade, light ? TUNE.shade * 0.7 : TUNE.shade);
    gl.uniform1f(u.uRing, light ? RING.light : RING.dark);
    quad();
  }

  function frame() {
    raf = 0;
    if (!running) return;
    addDrops();
    step();
    step();
    render();
    probe.frames++;
    quiet = hovering ? 0 : quiet + 1;
    if (quiet > SETTLE_FRAMES) {
      stop();
      canvas.classList.remove('is-on');
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || dead || !onScreen || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  const settled = () => !hovering && quiet > SETTLE_FRAMES;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target !== card) continue;
      onScreen = e.isIntersecting;
      if (!onScreen) stop();
      else if (!settled()) start();
    }
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : !settled() && start()));
  addEventListener('resize', layout);

  // Context loss: give the card back exactly as it is without the effect.
  canvas.addEventListener('webglcontextlost', () => {
    dead = true;
    stop();
    io.disconnect();
    canvas.remove();
  });

  const isMouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  const local = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function enter(next) {
    if (dead) return;
    if (card !== next) {
      if (card) io.unobserve(card);
      card = next;
      card.appendChild(canvas);
      setImage();
      layout();
      io.observe(card);
    }
    hovering = true;
    quiet = 0;
    last = null;
    canvas.classList.add('is-on');
    start();
  }
  function move(e) {
    const { x, y } = local(e);
    if (last) {
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      if (d < 6) return;
      const n = Math.min(Math.ceil(d / 18), 4);
      for (let i = 1; i <= n; i++) drops.push({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n, r: 16, s: TUNE.drop });
    } else {
      drops.push({ x, y, r: 22, s: TUNE.drop * 1.6 });
    }
    last = { x, y };
  }

  for (const c of cards) {
    c.addEventListener('pointerenter', (e) => isMouse(e) && enter(c));
    c.addEventListener('pointermove', (e) => { if (card === c && isMouse(e) && !dead) { if (!hovering) enter(c); move(e); } });
    c.addEventListener('pointerleave', () => { if (card === c) { hovering = false; last = null; } });
    c.addEventListener('pointerdown', (e) => {
      if (card !== c || !isMouse(e) || dead) return;
      const { x, y } = local(e);
      drops.push({ x, y, r: 34, s: TUNE.drop * 3 });
    });
  }

  // Probe hook: n frames with drops, each wrapped in a GPU timer query when available.
  probe.bench = async (n = 120) => {
    const ext = gl.getExtension('EXT_disjoint_timer_query');
    const was = running;
    stop();
    const queries = [];
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      if (i % 4 === 0) drops.push({ x: box.w * (0.2 + 0.6 * Math.random()), y: box.h * (0.2 + 0.6 * Math.random()), r: 18, s: TUNE.drop });
      const q = ext?.createQueryEXT();
      if (q) ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, q);
      addDrops();
      step();
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
  probe.render = () => render();

  return { enter };
}
