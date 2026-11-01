// Theme: the single source of truth is the `light` class on <html> (set before paint by
// the anti-FOUC snippet in Layout.astro). Everything else subscribes to `themechange`.
const STORAGE_KEY = 'portfolio_theme';
const root = document.documentElement;

/** @returns {'light' | 'dark'} */
export function getTheme() {
  return root.classList.contains('light') ? 'light' : 'dark';
}

/** Applies, persists and announces a theme. @param {'light' | 'dark'} theme */
export function setTheme(theme) {
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme !== 'light');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
  syncThemeColor();
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

/**
 * Calls `fn` with the new theme on every change.
 * @param {(theme: 'light' | 'dark') => void} fn
 * @returns {() => void} unsubscribe
 */
export function onThemeChange(fn) {
  /** @param {Event} e */
  const handler = (e) => fn(/** @type {CustomEvent} */ (e).detail.theme);
  document.addEventListener('themechange', handler);
  return () => document.removeEventListener('themechange', handler);
}

/** Keeps the browser UI colour in sync with the --paper token. */
function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  const paper = getComputedStyle(root).getPropertyValue('--paper').trim();
  if (meta && paper) meta.setAttribute('content', paper);
}

syncThemeColor();
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
});
