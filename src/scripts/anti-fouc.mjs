// The only inline script of the site: applies the stored theme before the first paint.
// Layout.astro renders this exact text and astro.config.mjs hashes it for the CSP.
export const ANTI_FOUC = "try{if(localStorage.getItem('portfolio_theme')==='light')document.documentElement.classList.replace('dark','light')}catch(e){}";
