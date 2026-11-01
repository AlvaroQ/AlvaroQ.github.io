// Case-study modal behaviour: clone the case template into the dialog, history support
// and the screenshot lightbox (keyboard, swipe-down to close, pinch and double-tap zoom).
// Markup, strings and styles live in ProjectModal.astro / ProjectCase.astro.
// Every listener is attached once (per element or per module): opening N times never adds any.

const SWIPE_CLOSE_THRESHOLD = 100; // px dragged down to close the lightbox
const SWIPE_DIM_DIVISOR = 200; // px over which the backdrop fades while dragging
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const DOUBLE_TAP_MS = 300;

/** @type {HTMLDialogElement | null} */
let modal = null;
/** @type {HTMLElement | null} */
let content = null;
/** @type {HTMLElement | null} */
let opener = null;
/** @type {HTMLDialogElement | null} */
let lightbox = null;
/** @type {HTMLElement | null} */
let lbOpener = null;
/** @type {HTMLImageElement[]} */
let shots = [];
let current = 0;
/** History entries we pushed that a user-initiated close must pop. */
let pendingPops = 0;
let wired = false;

/**
 * Open the case study `slug` in `dialog`.
 * @param {HTMLDialogElement} dialog
 * @param {string} slug
 * @param {HTMLElement} trigger element that gets the focus back on close
 */
export function openCase(dialog, slug, trigger) {
  if (dialog.open) return;
  const template = document.querySelector(`template[data-case="${CSS.escape(slug)}"]`);
  const region = dialog.querySelector('#project-modal-content');
  if (!(template instanceof HTMLTemplateElement) || !(region instanceof HTMLElement)) return;

  modal = dialog;
  content = region;
  opener = trigger;
  region.replaceChildren(template.content.cloneNode(true));
  region.scrollTop = 0;
  // Height cap per screenshot comes from the data (kept out of the markup for the strict CSP).
  for (const img of region.querySelectorAll('img[data-max-height]')) {
    if (img instanceof HTMLElement) img.style.maxHeight = `${Number(img.dataset.maxHeight)}px`;
  }
  wire();

  dialog.showModal();
  history.pushState({ projectModal: true }, '');
}

function wire() {
  if (wired || !modal || !content) return;
  wired = true;
  const dialog = modal;
  const light = document.querySelector('#project-lightbox');
  if (!(light instanceof HTMLDialogElement)) return;
  lightbox = light;

  window.addEventListener('popstate', onPopState);

  // Backdrop click: the dialog has no padding, so a click on itself is a click outside the box.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (content) content.replaceChildren();
    leaveHistory();
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  // Thumbnails open the lightbox.
  content?.addEventListener('click', (e) => {
    const img = e.target instanceof Element ? e.target.closest('.case-shot')?.querySelector('img') : null;
    if (!img || !content) return;
    shots = [...content.querySelectorAll('.case-shot img')].filter((el) => el instanceof HTMLImageElement);
    lbOpener = img.closest('button');
    showShot(shots.indexOf(img), 0);
    light.showModal();
    history.pushState({ lightbox: true }, '');
  });

  wireLightbox(light);
}

/** A close that did not come from the Back button gives its history entry back. */
function leaveHistory() {
  if (fromPop) {
    fromPop = false;
    return;
  }
  pendingPops += 1;
  history.back();
}
let fromPop = false;

function onPopState() {
  if (pendingPops > 0) {
    pendingPops -= 1;
    return;
  }
  const target = lightbox?.open ? lightbox : modal?.open ? modal : null;
  if (!target) return;
  fromPop = true;
  target.close();
}

/**
 * Show screenshot `index`; `direction` (-1, 0, 1) picks the entrance animation.
 * @param {number} index
 * @param {number} direction
 */
function showShot(index, direction) {
  if (!lightbox || index < 0 || index >= shots.length) return;
  const shot = shots[index];
  const stage = lightbox.querySelector('.lb-stage');
  const img = lightbox.querySelector('.lb-img');
  const counter = lightbox.querySelector('.lb-counter');
  const prev = lightbox.querySelector('.lb-prev');
  const next = lightbox.querySelector('.lb-next');
  if (!(stage instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;
  if (!(prev instanceof HTMLButtonElement) || !(next instanceof HTMLButtonElement) || !counter) return;

  current = index;
  resetZoom(stage, img);
  // The `src` attribute of a thumbnail is the largest variant.
  img.src = shot.getAttribute('src') ?? shot.currentSrc;
  img.alt = shot.alt;
  stage.classList.remove('from-next', 'from-prev');
  if (direction !== 0) {
    void stage.offsetWidth; // restart the entrance animation
    stage.classList.add(direction > 0 ? 'from-next' : 'from-prev');
  }

  const many = shots.length > 1;
  prev.hidden = next.hidden = !many;
  prev.disabled = index === 0;
  next.disabled = index === shots.length - 1;
  counter.textContent = many
    ? (lightbox.dataset.counter ?? '').replace('{n}', String(index + 1)).replace('{total}', String(shots.length))
    : '';

  // A button that just became disabled cannot keep the focus.
  if (document.activeElement === prev && prev.disabled) next.focus();
  else if (document.activeElement === next && next.disabled) prev.focus();

  for (const offset of [-1, 1]) {
    const neighbour = shots[index + offset];
    if (neighbour) new Image().src = neighbour.getAttribute('src') ?? '';
  }
}

/** @param {number} direction */
function step(direction) {
  showShot(current + direction, direction);
}

/** @param {HTMLDialogElement} light */
function wireLightbox(light) {
  const stage = light.querySelector('.lb-stage');
  const img = light.querySelector('.lb-img');
  if (!(stage instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;

  light.querySelector('.lb-prev')?.addEventListener('click', () => step(-1));
  light.querySelector('.lb-next')?.addEventListener('click', () => step(1));
  light.addEventListener('click', (e) => {
    if (e.target === light) light.close();
  });
  light.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  });
  light.addEventListener('close', () => {
    resetZoom(stage, img);
    light.style.removeProperty('--lb-dim');
    leaveHistory();
    // Back to the thumbnail that opened it; the modal underneath stays open.
    if (modal?.open) lbOpener?.focus({ preventScroll: true });
    lbOpener = null;
  });

  wireTouch(light, stage, img);
}

/**
 * @param {HTMLElement} stage
 * @param {HTMLImageElement} img
 */
function resetZoom(stage, img) {
  stage.classList.remove('zoomed');
  stage.style.transform = '';
  stage.style.opacity = '';
  img.style.transform = '';
}

/**
 * Swipe down to close, pinch to zoom, one-finger pan while zoomed, double tap to toggle zoom.
 * @param {HTMLDialogElement} light
 * @param {HTMLElement} stage
 * @param {HTMLImageElement} img
 */
function wireTouch(light, stage, img) {
  let scale = 1;
  let startScale = 1;
  let startDistance = 0;
  let panX = 0;
  let panY = 0;
  let originX = 0;
  let originY = 0;
  let baseW = 0;
  let baseH = 0;
  let pinching = false;
  let panning = false;
  let swipeFrom = 0;
  let swipeBy = 0;
  let swiping = false;
  let lastTap = 0;

  /** @param {TouchList} t */
  const distance = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const paint = () => {
    img.style.transform = `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`;
  };
  const measure = () => {
    const rect = img.getBoundingClientRect();
    baseW = rect.width / scale;
    baseH = rect.height / scale;
  };
  const reset = () => {
    scale = 1;
    panX = panY = 0;
    resetZoom(stage, img);
  };

  stage.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        if (scale === 1) measure();
        pinching = true;
        swiping = panning = false;
        startDistance = distance(e.touches);
        startScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        panning = true;
        originX = e.touches[0].clientX - panX;
        originY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 1) {
        swiping = true;
        swipeFrom = e.touches[0].clientY;
        swipeBy = 0;
      }
    },
    { passive: true },
  );

  stage.addEventListener(
    'touchmove',
    (e) => {
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        scale = Math.min(Math.max((distance(e.touches) / startDistance) * startScale, ZOOM_MIN), ZOOM_MAX);
        if (scale === 1) {
          panX = panY = 0;
          stage.classList.remove('zoomed');
        } else {
          stage.classList.add('zoomed');
        }
        paint();
      } else if (panning && e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        const maxX = (baseW * (scale - 1)) / 2 / scale;
        const maxY = (baseH * (scale - 1)) / 2 / scale;
        panX = Math.min(Math.max(e.touches[0].clientX - originX, -maxX), maxX);
        panY = Math.min(Math.max(e.touches[0].clientY - originY, -maxY), maxY);
        paint();
      } else if (swiping && e.touches.length === 1) {
        swipeBy = e.touches[0].clientY - swipeFrom;
        if (swipeBy > 0) {
          const progress = Math.min(swipeBy / SWIPE_DIM_DIVISOR, 1);
          stage.style.transform = `translateY(${swipeBy}px) scale(${1 - progress * 0.1})`;
          stage.style.opacity = String(1 - progress * 0.5);
          light.style.setProperty('--lb-dim', String(1 - progress * 0.5));
        }
      }
    },
    { passive: false },
  );

  const end = (/** @type {TouchEvent} */ e) => {
    if (e.touches.length < 2) pinching = false;
    if (e.touches.length > 0) return;
    panning = false;
    if (scale <= 1) reset();
    if (swiping) {
      swiping = false;
      if (swipeBy > SWIPE_CLOSE_THRESHOLD) {
        light.close();
      } else {
        stage.style.transform = '';
        stage.style.opacity = '';
        light.style.removeProperty('--lb-dim');
      }
    }
  };
  stage.addEventListener('touchend', end);
  stage.addEventListener('touchcancel', end);

  stage.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_MS) {
      e.preventDefault();
      if (scale > 1) {
        reset();
      } else {
        measure();
        scale = 2;
        stage.classList.add('zoomed');
        paint();
      }
    }
    lastTap = now;
  });
}
