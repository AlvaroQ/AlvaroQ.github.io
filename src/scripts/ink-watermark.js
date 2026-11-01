// Hero watermark: a banknote carries two marks, the signature and a watermark
// portrait. The name is the signature (ink-signature.js); this presses the portrait
// into the paper as a relief that a raking light brings out: the light follows the
// cursor (finger drag or device tilt on touch), sweeps across it once on load and
// leaves a faint relief at rest. Frames are rendered on demand only: never a loop.
// Fallbacks: no WebGL / init error → nothing (the hero as before);
// reduced motion → one static resting frame; paused ink → no automatic sweep.
import { token } from './ink-color.js';

const SWEEP_MS = 2000;
const INK_KEY = 'portfolio_ink';

const VERTEX_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAGMENT_SHADER = `precision mediump float;
uniform vec2 uRes, uTexel, uLight;
uniform float uLightZ, uRadius, uRest, uSpot, uBump, uFadeL, uCut, uHiA, uLoA;
uniform sampler2D uH;
uniform vec3 uHi, uLo;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float h = texture2D(uH, uv).r;
  float hx = texture2D(uH, uv + vec2(uTexel.x, 0.)).r - texture2D(uH, uv - vec2(uTexel.x, 0.)).r;
  float hy = texture2D(uH, uv + vec2(0., uTexel.y)).r - texture2D(uH, uv - vec2(0., uTexel.y)).r;
  vec3 n = normalize(vec3(-hx * uBump, -hy * uBump, 1.));
  vec2 dl = uLight - gl_FragCoord.xy;
  vec3 L = normalize(vec3(dl, uLightZ));
  float relief = dot(n, L) - L.z;                // signed: lit slopes > 0, shaded < 0
  float spot = exp(-dot(dl, dl) / (uRadius * uRadius));
  float k = uRest + spot * uSpot;
  // Pressed paper: the thicker areas (the portrait) glow slightly in the light.
  float body = smoothstep(.15, .8, h) * spot * .12;
  // Fade the borders of the pressed area, towards the name, and into the hero's bottom edge
  // (uCut = its height in canvas uv) so the clip never cuts the relief in a hard line.
  float edge = smoothstep(uCut, uCut + .12, uv.y) * smoothstep(0., .06, 1. - uv.y)
             * smoothstep(0., .1, 1. - uv.x) * smoothstep(0., uFadeL, uv.x);
  float hi = clamp(max(relief, 0.) * k * 2.4 + body, 0., 1.) * edge * uHiA;
  float lo = clamp(max(-relief, 0.) * k * 2.4, 0., 1.) * edge * uLoA;
  gl_FragColor = vec4(uHi * hi + uLo * lo, hi + lo);
}`;

const UNIFORMS = ['uRes', 'uTexel', 'uLight', 'uLightZ', 'uRadius', 'uRest', 'uSpot', 'uBump', 'uFadeL', 'uCut',
  'uH', 'uHi', 'uLo', 'uHiA', 'uLoA'];

/** Parse "url 600w, url 900w" into [{ url, w }] sorted by width. */
function parseSrcset(value) {
  return (value || '').split(',').map((part) => {
    const [url, w] = part.trim().split(/\s+/);
    return { url, w: parseInt(w, 10) || 0 };
  }).filter((c) => c.url && c.w).sort((a, b) => a.w - b.w);
}

/** Smallest candidate covering `px` device pixels; the largest one otherwise (never past the master). */
function pick(candidates, px) {
  return candidates.find((c) => c.w >= px) || candidates[candidates.length - 1];
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function inkPaused() {
  try { return localStorage.getItem(INK_KEY) === 'off'; } catch { return false; }
}

function setup(hero) {
  const clip = hero.querySelector('.wm-clip');
  const canvas = hero.querySelector('canvas.wm');
  if (!clip || !canvas) return null;
  const heights = parseSrcset(canvas.dataset.heightSrcset);
  if (!heights.length) return null;

  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const s = {
    U: {}, ready: false, raf: 0, frames: 0, reason: '', texW: 0,
    dpr: Math.min(window.devicePixelRatio || 1, coarse ? 2 : 1.5),
    light: [0, 0], target: [0, 0], spot: 0, spotTarget: 0, hasTarget: false, sweeping: false,
    rect: { left: 0, top: 0, w: 1, h: 1 }, hh: 1, lg: false,
    lightTheme: false, ink: [1, 1, 1], ink2: [0, 0, 0],
  };
  const remove = (reason) => {
    s.reason = reason;
    clip.remove();
  };

  let gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
      powerPreference: 'low-power', preserveDrawingBuffer: false,
    });
  } catch { gl = null; }
  if (!gl) {
    remove('no-webgl');
    return { get state() { return { reason: s.reason }; } };
  }

  function readTheme() {
    s.lightTheme = document.documentElement.classList.contains('light');
    s.ink = token('--ink');
    s.ink2 = token('--ink-2');
  }

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
    return sh;
  }

  function program(img) {
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    s.U = {};
    UNIFORMS.forEach((n) => { s.U[n] = gl.getUniformLocation(prog, n); });
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // NPOT textures in WebGL 1: clamp and no mipmaps.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(s.U.uH, 0);
  }

  // Place the 3:4 watermark (CSS px inside the hero) and size the canvas.
  function layout() {
    const hr = hero.getBoundingClientRect();
    const inner = hero.querySelector('.hero-inner');
    const ir = inner ? inner.getBoundingClientRect() : hr;
    s.hh = hr.height;
    s.lg = window.innerWidth >= 1024;
    let w;
    let h;
    let left;
    let top;
    if (s.lg) {
      // Right side of the content column, pressed into the paper next to the signature.
      h = Math.min(hr.height * 0.96, 760);
      w = h * 0.75;
      left = ir.right - hr.left - w * 0.92;
      top = (hr.height - h) / 2 + 12;
    } else {
      // Phones and tablets: bottom-right, bleeding off the edge like a banknote watermark.
      w = Math.min(hr.width * 0.78, 460);
      h = w * (4 / 3);
      left = hr.width - w * 0.86;
      top = hr.height - h * 0.9;
    }
    s.rect = { left, top, w, h };
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.max(1, Math.round(w * s.dpr));
    canvas.height = Math.max(1, Math.round(h * s.dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    return canvas.width;
  }

  // The light lives in hero CSS px; the shader wants canvas device px, origin bottom-left.
  const toCanvas = (x, y) => [(x - s.rect.left) * s.dpr, (s.rect.top + s.rect.h - y) * s.dpr];
  // Rest: far up-left of the watermark, raking across the paper.
  const restPos = () => [s.rect.left - s.rect.w * 0.4, s.rect.top - s.rect.h * 0.3];

  function draw() {
    s.raf = 0;
    const U = s.U;
    const dark = !s.lightTheme;
    s.light[0] += (s.target[0] - s.light[0]) * 0.18;
    s.light[1] += (s.target[1] - s.light[1]) * 0.18;
    s.spot += (s.spotTarget - s.spot) * 0.08;
    const lc = toCanvas(s.light[0], s.light[1]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uTexel, 1.5 / s.texW, 1.5 / ((s.texW * 4) / 3));
    gl.uniform2f(U.uLight, lc[0], lc[1]);
    gl.uniform1f(U.uLightZ, 70 * s.dpr);
    gl.uniform1f(U.uRadius, Math.max(canvas.width, canvas.height) * 0.42);
    gl.uniform1f(U.uRest, s.lg ? 0.1 : 0.08);
    gl.uniform1f(U.uSpot, s.spot);
    gl.uniform1f(U.uBump, 9);
    // Below lg the watermark sits behind the text column: fade it sooner towards the text.
    gl.uniform1f(U.uFadeL, s.lg ? 0.22 : 0.45);
    gl.uniform1f(U.uCut, Math.max(0, (s.rect.top + s.rect.h - s.hh) / s.rect.h));
    gl.uniform3fv(U.uHi, dark ? s.ink : [1, 1, 1]);
    gl.uniform3fv(U.uLo, dark ? [0, 0, 0] : s.ink2);
    gl.uniform1f(U.uHiA, dark ? 0.32 : 0.75);
    gl.uniform1f(U.uLoA, dark ? 0.6 : 0.3);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    s.frames++;
    const moving = Math.hypot(s.target[0] - s.light[0], s.target[1] - s.light[1]) > 0.5 || Math.abs(s.spotTarget - s.spot) > 0.004;
    if (moving || s.sweeping) request();
  }

  function request() {
    if (!s.raf && s.ready) s.raf = requestAnimationFrame(draw);
  }

  function rest() {
    s.target = restPos();
    s.spotTarget = 0;
    request();
  }

  function staticFrame() {
    // Reduced motion: one frame with the resting light, no animation.
    s.light = restPos();
    s.target = restPos();
    s.spot = 0;
    s.spotTarget = 0;
    request();
  }

  function sweep() {
    if (RM.matches || !s.ready) return;
    const t0 = performance.now();
    const { left, top, w, h } = s.rect;
    const from = [left - w * 0.3, top - h * 0.05];
    const to = [left + w * 1.25, top + h * 0.85];
    s.sweeping = true;
    s.hasTarget = false;
    s.light = [...from];
    const step = (now) => {
      const t = Math.min(1, (now - t0) / SWEEP_MS);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      s.target = [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e];
      s.spotTarget = Math.sin(Math.PI * t) * 1.1;
      request();
      if (t < 1) requestAnimationFrame(step);
      else {
        s.sweeping = false;
        if (!s.hasTarget) rest();
      }
    };
    requestAnimationFrame(step);
  }

  function pointAt(cx, cy) {
    if (RM.matches || s.sweeping || !s.ready) return;
    const hr = hero.getBoundingClientRect();
    s.hasTarget = true;
    s.target = [cx - hr.left, cy - hr.top];
    s.spotTarget = 1;
    request();
  }

  async function init() {
    readTheme();
    const need = layout();
    const texture = pick(heights, need);
    s.texW = texture.w;
    program(await loadImage(texture.url));
    s.ready = true;
    hero.classList.add('wm-ready');
    if (RM.matches) staticFrame();
    else {
      s.light = restPos();
      rest();
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && !inkPaused()) sweep();
    }
  }

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') pointAt(e.clientX, e.clientY);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (s.hasTarget) { s.hasTarget = false; rest(); }
  }, { passive: true });
  // Touch: the finger is the light; the hero keeps vertical scrolling (touch-action: pan-y).
  const touch = (e) => { const t = e.touches[0]; if (t) pointAt(t.clientX, t.clientY); };
  hero.addEventListener('touchstart', touch, { passive: true });
  hero.addEventListener('touchmove', touch, { passive: true });
  hero.addEventListener('touchend', () => {
    setTimeout(() => { s.hasTarget = false; if (!RM.matches) rest(); }, 900);
  }, { passive: true });
  // Tilt where no permission prompt is needed (Android and others): the light follows the device angle.
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null || s.hasTarget || s.sweeping || RM.matches || !s.ready) return;
    const gx = Math.max(-30, Math.min(30, e.gamma)) / 30;
    const by = Math.max(-30, Math.min(30, e.beta - 45)) / 30;
    s.target = [s.rect.left + s.rect.w * (0.5 + gx * 0.8), s.rect.top + s.rect.h * (0.5 + by * 0.8)];
    s.spotTarget = 0.7;
    request();
  }, { passive: true });

  let resizeTimer = 0;
  new ResizeObserver(() => {
    if (!s.ready) return;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layout();
      if (RM.matches) staticFrame();
      else rest();
    }, 100);
  }).observe(hero);
  new MutationObserver(() => { readTheme(); request(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  RM.addEventListener('change', () => {
    if (!s.ready) return;
    if (RM.matches) staticFrame();
    else rest();
  });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); remove('context-lost'); });

  init().catch((err) => {
    console.warn('[watermark] init failed', err);
    remove('init-failed');
  });

  return {
    replay: sweep,
    get state() {
      return { ready: s.ready, frames: s.frames, texW: s.texW, dpr: s.dpr, lg: s.lg, reason: s.reason, canvas: [canvas.width, canvas.height] };
    },
  };
}

function boot() {
  const hero = document.querySelector('.hero[data-ink]');
  if (!hero) return;
  const api = setup(hero);
  if (api) window.inkWatermark = api;
}

function whenIdle() {
  if ('requestIdleCallback' in window) window.requestIdleCallback(boot, { timeout: 2000 });
  else setTimeout(boot, 200);
}

if (document.readyState === 'complete') whenIdle();
else window.addEventListener('load', whenIdle, { once: true });
