// Hero watermark: a banknote carries two marks, the signature and a watermark
// portrait. The name is the signature (ink-signature.js); this presses the portrait
// into the paper inside an oval window. A lamp (cursor, finger drag, device tilt)
// shows it as a backlit watermark, raking light models the relief, a guilloche
// ring appears only where the light falls, and the same light makes the ink of
// the name glint. One light sweep on load crosses the name and lands on the face.
// Frames are rendered on demand only: never a continuous loop.
// Fallbacks: no WebGL / init error → nothing (the hero as before);
// reduced motion → one static frame; paused ink → no automatic sweep.
import { token } from './ink-color.js';

const SWEEP_MS = 2800;
const INK_KEY = 'portfolio_ink';

const VERTEX_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAGMENT_SHADER = `precision mediump float;
uniform vec2 uRes, uTexel, uLight;
uniform float uLightZ, uRadius, uRest, uSpot, uBump, uFadeL, uTrans, uTransRest, uGuil, uInv, uHiA, uLoA;
uniform sampler2D uH, uT;
uniform vec3 uHi, uLo;
float H(vec2 p){return texture2D(uH, p).r;}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  // Smooth relief: wide central differences on the sculpted height map.
  vec2 o = uTexel;
  float hx = H(uv + vec2(o.x, 0.)) - H(uv - vec2(o.x, 0.));
  float hy = H(uv + vec2(0., o.y)) - H(uv - vec2(0., o.y));
  float h = H(uv);
  vec3 n = normalize(vec3(-hx * uBump, -hy * uBump, 1.));
  vec2 dl = uLight - gl_FragCoord.xy;
  vec3 L = normalize(vec3(dl, uLightZ));
  float relief = dot(n, L) - L.z;
  float spot = exp(-dot(dl, dl) / (uRadius * uRadius));
  // Oval window (banknote vignette), faded towards the name.
  vec2 q = (uv - vec2(.52, .5)) / vec2(.49, .49);
  float r = length(q);
  float win = (1. - smoothstep(.8, .98, r)) * smoothstep(0., uFadeL, uv.x);
  float k = uRest + spot * uSpot;
  // Backlit tone: a lamp behind the paper shows the portrait as a true watermark.
  float tone = pow(smoothstep(.04, .8, texture2D(uT, uv).r), .8);
  float pres = smoothstep(.28, .6, h);
  float a = (uTransRest + spot * uTrans) * pres * win;
  float tHi = mix(tone, 0., uInv) * a;
  float tLo = mix(0., (1. - tone) * pres, uInv) * a;
  // Guilloche ring around the oval, only where the light reaches.
  float ang = atan(q.y, q.x);
  float g = abs(fract(r * 26. + .55 * sin(ang * 8.) + .25 * sin(ang * 13.)) - .5);
  float line = 1. - smoothstep(.03, .09, g);
  float band = smoothstep(.9, .96, r) * (1. - smoothstep(1.02, 1.08, r)) * smoothstep(0., uFadeL * .8, uv.x);
  float gl = line * band * spot * uGuil;
  float hi = clamp(max(relief, 0.) * k * 2.4 * win, 0., 1.) * uHiA + tHi * uHiA * 1.15 + gl * (1. - uInv) * uHiA;
  float lo = clamp(max(-relief, 0.) * k * 2.4 * win, 0., 1.) * uLoA + tLo * uLoA * 1.1 + gl * uInv * uLoA;
  hi = clamp(hi, 0., 1.);
  lo = clamp(lo, 0., 1.);
  gl_FragColor = vec4(uHi * hi + uLo * lo, hi + lo);
}`;

const UNIFORMS = ['uRes', 'uTexel', 'uLight', 'uLightZ', 'uRadius', 'uRest', 'uSpot', 'uBump', 'uFadeL', 'uTrans',
  'uTransRest', 'uGuil', 'uInv', 'uH', 'uT', 'uHi', 'uLo', 'uHiA', 'uLoA'];

/** Parse "url 600w, url 900w" into [{ url, w }] sorted by width. */
function parseSrcset(value) {
  return (value || '').split(',').map((part) => {
    const [url, w] = part.trim().split(/\s+/);
    return { url, w: parseInt(w, 10) || 0 };
  }).filter((c) => c.url && c.w).sort((a, b) => a.w - b.w);
}

/** Smallest candidate covering `px` device pixels; the largest one otherwise (never upscaled past the master). */
function pick(candidates, px) {
  return (candidates.find((c) => c.w >= px) || candidates[candidates.length - 1]).url;
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
  const glint = hero.querySelector('.wm-glint');
  if (!clip || !canvas) return null;
  const heights = parseSrcset(canvas.dataset.heightSrcset);
  const tones = parseSrcset(canvas.dataset.toneSrcset);
  if (!heights.length || !tones.length) return null;

  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const remove = (reason) => {
    s.reason = reason;
    clip.remove();
    if (glint) glint.remove();
  };

  const s = {
    gl: null, U: {}, ready: false, raf: 0, frames: 0, reason: '', texW: 0,
    dpr: Math.min(window.devicePixelRatio || 1, coarse ? 2 : 1.5),
    light: [0, 0], target: [0, 0], spot: 0, spotTarget: 0, hasTarget: false, sweeping: false,
    rect: { left: 0, top: 0, w: 1, h: 1 }, face: [0, 0], nameAt: [0, 0], hw: 1, hh: 1, lg: false,
    lightTheme: false, colors: { ink: [1, 1, 1], ink2: [0, 0, 0] },
  };

  let gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
      powerPreference: 'low-power', preserveDrawingBuffer: false,
    });
  } catch { gl = null; }
  if (!gl) { remove('no-webgl'); return { get state() { return { reason: s.reason }; } }; }
  s.gl = gl;

  function readTheme() {
    s.lightTheme = document.documentElement.classList.contains('light');
    s.colors.ink = token('--ink');
    s.colors.ink2 = token('--ink-2');
  }

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
    return sh;
  }

  function texture(unit, img) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // NPOT textures in WebGL 1: clamp and no mipmaps.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
  }

  function program() {
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
    gl.uniform1i(s.U.uH, 0);
    gl.uniform1i(s.U.uT, 1);
  }

  // Place the 3:4 watermark (CSS px inside the hero) and size the canvas.
  function layout() {
    const hr = hero.getBoundingClientRect();
    const inner = hero.querySelector('.hero-inner');
    const name = hero.querySelector('.ink-box');
    const ir = inner ? inner.getBoundingClientRect() : hr;
    const nr = name ? name.getBoundingClientRect() : hr;
    s.hw = hr.width;
    s.hh = hr.height;
    s.lg = window.innerWidth >= 1024;
    let w;
    let h;
    let left;
    let top;
    if (s.lg) {
      // Right of the content column; the oval clears the nav and bleeds off the bottom.
      h = Math.min(hr.height * 0.94, 760);
      w = h * 0.75;
      left = Math.min(ir.right - hr.left - w * 0.9, hr.width - w * 0.97);
      top = hr.height - h * 0.97 + 8;
    } else {
      // Phones and tablets: bottom-right, bleeding off the edge.
      w = Math.min(hr.width * 0.74, 420);
      h = w * (4 / 3);
      left = hr.width - w * 0.92;
      top = hr.height - h * 0.76;
    }
    s.rect = { left, top, w, h };
    s.face = [left + w * 0.62, top + h * 0.3];
    s.nameAt = [nr.left - hr.left + Math.min(nr.width, 360) * 0.2, nr.top - hr.top + nr.height * 0.5];
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
  const restPos = () => [-s.hw * 0.12, -s.hh * 0.35];

  function draw() {
    s.raf = 0;
    const U = s.U;
    const dark = !s.lightTheme;
    s.light[0] += (s.target[0] - s.light[0]) * 0.16;
    s.light[1] += (s.target[1] - s.light[1]) * 0.16;
    s.spot += (s.spotTarget - s.spot) * (s.sweeping ? 0.3 : 0.07);
    const lc = toCanvas(s.light[0], s.light[1]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uTexel, 4.5 / s.texW, 4.5 / ((s.texW * 4) / 3));
    gl.uniform2f(U.uLight, lc[0], lc[1]);
    gl.uniform1f(U.uLightZ, 80 * s.dpr);
    gl.uniform1f(U.uRadius, Math.max(canvas.width, canvas.height) * 0.4);
    gl.uniform1f(U.uRest, s.lg ? 0.12 : 0.09);
    gl.uniform1f(U.uSpot, s.spot);
    gl.uniform1f(U.uBump, 5);
    // Below lg the watermark sits behind the text column: fade it sooner and keep it dimmer.
    gl.uniform1f(U.uFadeL, s.lg ? 0.2 : 0.45);
    gl.uniform1f(U.uTransRest, s.lg ? (dark ? 0.27 : 0.26) : (dark ? 0.08 : 0.14));
    gl.uniform1f(U.uTrans, s.lg ? (dark ? 0.6 : 0.62) : (dark ? 0.05 : 0.2));
    gl.uniform1f(U.uGuil, dark ? 1.5 : 1.1);
    gl.uniform1f(U.uInv, dark ? 0 : 1);
    gl.uniform3fv(U.uHi, dark ? s.colors.ink : [1, 1, 1]);
    gl.uniform3fv(U.uLo, dark ? [0, 0, 0] : s.colors.ink2);
    gl.uniform1f(U.uHiA, dark ? (s.lg ? 0.42 : 0.3) : 0.8);
    gl.uniform1f(U.uLoA, dark ? 0.22 : 0.3);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (glint) {
      // The same light catches the ink of the name; kept low on dark paper so it never reads as a disc.
      hero.style.setProperty('--wm-x', `${s.light[0].toFixed(1)}px`);
      hero.style.setProperty('--wm-y', `${s.light[1].toFixed(1)}px`);
      // Reduced motion: no glint at all (the static frame only shows the watermark).
      const glow = RM.matches ? 0 : Math.min(1, s.spot) * (dark ? 0.4 : 0.9);
      hero.style.setProperty('--wm-a', glow.toFixed(3));
    }
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
    // Reduced motion: the lamp rests on the face, one frame, no glint.
    s.light = [...s.face];
    s.target = [...s.face];
    s.spot = 0.55;
    s.spotTarget = 0.55;
    request();
  }

  function sweep() {
    if (RM.matches || !s.ready) return;
    const t0 = performance.now();
    s.sweeping = true;
    s.hasTarget = false;
    // The lamp enters left of the name, crosses it, lands on the face and fades.
    const A = [s.nameAt[0] - 70, s.nameAt[1] - 10];
    const B = s.face;
    const C = [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - s.hh * 0.12];
    const step = (now) => {
      const t = Math.min(1, (now - t0) / SWEEP_MS);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const u = 1 - e;
      s.target = [u * u * A[0] + 2 * u * e * C[0] + e * e * B[0], u * u * A[1] + 2 * u * e * C[1] + e * e * B[1]];
      s.spotTarget = Math.min(1, t / 0.14) * (1 - Math.max(0, (t - 0.74) / 0.26) ** 1.4) * 1.15;
      request();
      if (t < 1) requestAnimationFrame(step);
      else {
        s.sweeping = false;
        if (!s.hasTarget) rest();
      }
    };
    s.light = [...A];
    s.spot = 0;
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
    s.texW = heights.find((c) => c.w >= need)?.w || heights[heights.length - 1].w;
    const [hm, tn] = await Promise.all([loadImage(pick(heights, need)), loadImage(pick(tones, need))]);
    program();
    texture(0, hm);
    texture(1, tn);
    s.ready = true;
    s.light = restPos();
    hero.classList.add('wm-ready');
    if (RM.matches) staticFrame();
    else {
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
  // Touch: the finger is the lamp; the hero keeps vertical scrolling (touch-action: pan-y).
  const touch = (e) => { const t = e.touches[0]; if (t) pointAt(t.clientX, t.clientY); };
  hero.addEventListener('touchstart', touch, { passive: true });
  hero.addEventListener('touchmove', touch, { passive: true });
  hero.addEventListener('touchend', () => {
    setTimeout(() => { s.hasTarget = false; if (!RM.matches) rest(); }, 1100);
  }, { passive: true });
  // Tilt where no permission prompt is needed (Android and others): the lamp follows the device angle.
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null || s.hasTarget || s.sweeping || RM.matches || !s.ready) return;
    const gx = Math.max(-30, Math.min(30, e.gamma)) / 30;
    const by = Math.max(-30, Math.min(30, e.beta - 45)) / 30;
    s.target = [s.hw * (0.5 + gx * 0.5), s.hh * (0.5 + by * 0.5)];
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
