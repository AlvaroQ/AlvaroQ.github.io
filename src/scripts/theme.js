// Theme management with localStorage persistence
(function () {
  const STORAGE_KEY = 'portfolio_theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // Keep the browser UI colour in sync with the --paper token
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
      if (paper) meta.setAttribute('content', paper);
    }

    // Re-read ink tokens for the hero effect
    if (window.inkSignature) window.inkSignature.setTheme();

    // Notify chat widget and modal
    if (window.chatWidget) window.chatWidget.setTheme(theme);
    if (window.projectModal) window.projectModal.setTheme(theme);
  }

  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* ignore */ }
    applyTheme(next);
    return next;
  }

  // Theme is already applied in Layout.astro via is:inline script in <head>.
  // Calling applyTheme here again would be redundant and could cause a flash.
  // applyTheme(getStoredTheme());

  // Expose globally
  window.getTheme = getStoredTheme;
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;
})();
