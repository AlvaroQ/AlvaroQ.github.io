// Ink signature runner: draws living marbled ink inside the letters of the
// hero name. The h1 is always painted with a static gradient (the LCP element);
// the canvas only overlays it while the effect is running.
// Gating: reduced motion / no WebGL never start; low-end devices start at
// quality 0.5; an FPS watchdog degrades once and then stops.
import { VERTEX_SHADER, fragmentShader } from './ink-shader.js';
import { parseColor } from './ink-color.js';

const STORAGE_KEY = 'portfolio_ink';
const PAD = 24; // canvas overflow around the name box, in CSS px (matches .fx)
const SWIRL_LIFE = 1800; // ms
const POINTS = 8;

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function writeStored(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage unavailable */ }
}

function setup(hero) {
  const canvas = hero.querySelector('canvas.fx');
  const name = hero.querySelector('.ink-name');
  const pauseBtn = hero.querySelector('.ink-pause');
  if (!canvas || !name) return null;

  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2;
  const baseDpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);

  const s = {
    gl: null, prog: null, tex: null, U: {}, mask: document.createElement('canvas'),
    quality: lowEnd ? 0.5 : 1, dpr: lowEnd ? Math.min(baseDpr, 0.75) : baseDpr,
    unit: 150, cssW: 1, cssH: 1,
    visible: false, running: false, paused: readStored() === 'off', disabled: false, lost: false,
    reason: '', frames: 0, raf: 0, last: 0, t0: 0, fps: 60, lowSince: 0,
    colors: { ink: [1, 1, 1], ink2: [1, 1, 1], accent: [1, 1, 1] },
  };
  const pts = new Float32Array(POINTS * 2).fill(-100);
  const ages = new Float32Array(POINTS).fill(1);
  const times = new Float64Array(POINTS).fill(-1e9);
  let head = 0;
  let lastX = -100;
  let lastY = -100;

  function setTheme() {
    const cs = getComputedStyle(document.documentElement);
    s.colors.ink = parseColor(cs.getPropertyValue('--ink'));
    s.colors.ink2 = parseColor(cs.getPropertyValue('--ink-2'));
    s.colors.accent = parseColor(cs.getPropertyValue('--accent'));
  }

  function compile(type, src) {
    const gl = s.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
    return sh;
  }

  function buildProgram() {
    const gl = s.gl;
    if (s.prog) gl.deleteProgram(s.prog);
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragmentShader(s.quality)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    s.U = {};
    ['uRes', 'uTime', 'uScale', 'uMask', 'uInk', 'uInk2', 'uAccent', 'uPts', 'uAge'].forEach((n) => {
      s.U[n] = gl.getUniformLocation(prog, n);
    });
    gl.uniform1i(s.U.uMask, 0);
    s.prog = prog;
  }

  function createResources() {
    const gl = s.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    s.prog = null;
    buildProgram();
    s.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, s.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    resize();
  }

  // Rasterise the name glyph by glyph at the exact DOM positions, so the mask
  // matches the h1 regardless of kerning or letter-spacing.
  function drawMask() {
    const gl = s.gl;
    if (!gl) return;
    const mask = s.mask;
    mask.width = canvas.width;
    mask.height = canvas.height;
    const c = mask.getContext('2d');
    if (!c) return;
    c.fillStyle = '#000';
    c.fillRect(0, 0, mask.width, mask.height);
    c.fillStyle = '#fff';
    const origin = canvas.getBoundingClientRect();
    const sx = origin.width ? mask.width / origin.width : s.dpr;
    const range = document.createRange();
    name.querySelectorAll('.ink-word').forEach((word) => {
      const node = word.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const cs = getComputedStyle(word);
      c.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * sx}px ${cs.fontFamily}`;
      const ascent = c.measureText('Á').fontBoundingBoxAscent;
      c.textBaseline = ascent === undefined ? 'middle' : 'alphabetic';
      const text = node.textContent || '';
      for (let i = 0; i < text.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if (!r.width) continue;
        const y = ascent === undefined ? (r.top + r.height / 2 - origin.top) * sx : (r.top - origin.top) * sx + ascent;
        c.fillText(text[i], (r.left - origin.left) * sx, y);
      }
    });
    gl.bindTexture(gl.TEXTURE_2D, s.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
  }

  function resize() {
    if (!s.gl) return;
    const box = canvas.parentElement;
    s.cssW = (box ? box.offsetWidth : name.offsetWidth) + PAD * 2;
    s.cssH = (box ? box.offsetHeight : name.offsetHeight) + PAD * 2;
    canvas.width = Math.max(1, Math.round(s.cssW * s.dpr));
    canvas.height = Math.max(1, Math.round(s.cssH * s.dpr));
    s.gl.viewport(0, 0, canvas.width, canvas.height);
    s.unit = Math.max(150, parseFloat(getComputedStyle(name).fontSize) * 1.4);
    drawMask();
  }

  function onPointer(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / s.unit;
    const y = (r.bottom - e.clientY) / s.unit;
    if (e.type === 'pointermove' && Math.hypot(x - lastX, y - lastY) < 0.03) return;
    lastX = x;
    lastY = y;
    pts[head * 2] = x;
    pts[head * 2 + 1] = y;
    times[head] = performance.now();
    head = (head + 1) % POINTS;
  }

  function frame(now) {
    const gl = s.gl;
    for (let i = 0; i < POINTS; i++) ages[i] = Math.min(1, (now - times[i]) / SWIRL_LIFE);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(s.U.uRes, canvas.width, canvas.height);
    gl.uniform1f(s.U.uTime, ((now - s.t0) / 1000) % 1000);
    gl.uniform1f(s.U.uScale, canvas.width / s.cssW > 0 ? 1 / ((canvas.width / s.cssW) * s.unit) : 1 / s.unit);
    gl.uniform3fv(s.U.uInk, s.colors.ink);
    gl.uniform3fv(s.U.uInk2, s.colors.ink2);
    gl.uniform3fv(s.U.uAccent, s.colors.accent);
    gl.uniform2fv(s.U.uPts, pts);
    gl.uniform1fv(s.U.uAge, ages);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function degrade() {
    if (s.quality === 1) {
      s.quality = 0.5;
      s.dpr = Math.max(0.5, s.dpr * 0.66);
      buildProgram();
      resize();
      s.reason = 'watchdog: quality 0.5';
    } else {
      s.disabled = true;
      s.reason = 'watchdog: static';
      stop();
      updateButton();
    }
  }

  function tick(now) {
    if (!s.running) return;
    const raw = (now - s.last) / 1000;
    s.last = now;
    try {
      frame(now);
    } catch (err) {
      console.warn('[ink] frame failed', err);
      s.disabled = true;
      stop();
      updateButton();
      return;
    }
    s.frames++;
    if (raw > 0) s.fps = s.fps * 0.9 + (1 / raw) * 0.1;
    if (now - s.t0 > 1500) {
      if (s.fps < 45) {
        if (!s.lowSince) s.lowSince = now;
        else if (now - s.lowSince > 2000) { s.lowSince = 0; s.t0 = now - 1500; s.fps = 60; degrade(); }
      } else {
        s.lowSince = 0;
      }
    }
    if (s.running) s.raf = requestAnimationFrame(tick);
  }

  function start() {
    s.running = true;
    s.last = performance.now();
    s.t0 = s.t0 || s.last;
    s.fps = 60;
    s.lowSince = 0;
    hero.classList.add('running');
    s.raf = requestAnimationFrame(tick);
  }

  function stop() {
    s.running = false;
    cancelAnimationFrame(s.raf);
    hero.classList.remove('running');
  }

  function sync() {
    const want = !!s.gl && !s.disabled && !s.lost && !s.paused && s.visible && !document.hidden && !RM.matches;
    if (want && !s.running) start();
    else if (!want && s.running) stop();
  }

  function updateButton() {
    if (!pauseBtn) return;
    const usable = !!s.gl && !s.disabled && !RM.matches;
    // Not `hidden`: its UA display:none would reflow the row when the effect starts.
    pauseBtn.dataset.usable = String(usable);
    pauseBtn.setAttribute('aria-pressed', String(s.paused));
    pauseBtn.textContent = (s.paused ? pauseBtn.dataset.labelResume : pauseBtn.dataset.labelPause) || '';
  }

  function initGL() {
    if (s.gl || s.disabled) return;
    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
        powerPreference: 'low-power', preserveDrawingBuffer: false,
      });
    } catch { gl = null; }
    if (!gl) { s.disabled = true; s.reason = 'no-webgl'; updateButton(); return; }
    s.gl = gl;
    try {
      setTheme();
      createResources();
    } catch (err) {
      console.warn('[ink] init failed', err);
      s.gl = null;
      s.disabled = true;
      s.reason = 'init-failed';
      updateButton();
      return;
    }

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); s.lost = true; stop(); }, false);
    canvas.addEventListener('webglcontextrestored', () => {
      try { createResources(); s.lost = false; sync(); } catch { s.disabled = true; updateButton(); }
    }, false);

    hero.addEventListener('pointermove', onPointer, { passive: true });
    hero.addEventListener('pointerdown', (e) => { lastX = -100; onPointer(e); }, { passive: true });

    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      s.visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
      sync();
    }, { threshold: 0.05 }).observe(hero);
    document.addEventListener('visibilitychange', sync);
    new ResizeObserver(() => { if (s.gl && !s.lost) resize(); }).observe(canvas.parentElement || name);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (s.gl && !s.lost) drawMask(); });

    updateButton();
    sync();
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      s.paused = !s.paused;
      writeStored(s.paused ? 'off' : null);
      updateButton();
      sync();
    });
  }

  RM.addEventListener('change', () => {
    if (!RM.matches) initGL();
    updateButton();
    sync();
  });

  if (RM.matches) s.reason = 'reduced-motion';
  else initGL();

  return {
    setTheme,
    get state() {
      return {
        running: s.running, frames: s.frames, quality: s.quality, dpr: s.dpr,
        paused: s.paused, disabled: s.disabled, reason: s.reason, fps: Math.round(s.fps),
      };
    },
  };
}

function boot() {
  const hero = document.querySelector('.hero[data-ink]');
  if (!hero) return;
  const api = setup(hero);
  if (api) window.inkSignature = api;
}

function whenIdle() {
  if ('requestIdleCallback' in window) window.requestIdleCallback(boot, { timeout: 2000 });
  else setTimeout(boot, 200);
}

if (document.readyState === 'complete') whenIdle();
else window.addEventListener('load', whenIdle, { once: true });
