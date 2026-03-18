/**
 * Project Detail Modal - Overlay for featured projects
 * Following the pattern of chat-widget.js
 * Supports dynamic accent colors per project
 */

// Configuration constants
const MODAL_CONFIG = {
  SWIPE_CLOSE_THRESHOLD: 100,    // Minimum swipe distance (px) to trigger close
  SWIPE_OPACITY_DIVISOR: 200,    // Divisor for calculating swipe opacity
  LIGHTBOX_NAV_OFFSET: 20,       // Transition offset for navigation (px)
  LIGHTBOX_NAV_DELAY: 100,       // Delay between navigation transitions (ms)
  CLOSING_ANIMATION_DURATION: 200, // Modal closing animation duration (ms)
  LAZY_LOAD_MARGIN: '100px',     // IntersectionObserver margin for lazy loading
  ZOOM_MIN: 1,                   // Minimum zoom level
  ZOOM_MAX: 4,                   // Maximum zoom level
  DOUBLE_TAP_DELAY: 300          // Max time between taps for double-tap (ms)
};

class ProjectDetailModal {
  constructor() {
    this.isOpen = false;
    this.lightboxOpen = false;
    this.theme = 'dark';
    this.lang = 'es';
    this.projectData = null;
    this.accentColor = '#FFFF00'; // Default yellow

    // Lightbox navigation state
    this.screenshots = [];
    this.currentImageIndex = 0;

    // Image preload cache to avoid redundant preloading
    this.preloadedImages = new Set();

    // Focus trap state
    this.previouslyFocusedElement = null;

    // Flag to prevent modal close when lightbox is closing
    this.isClosingLightbox = false;

    // Bind popstate handler for browser back button
    this.popstateHandler = this.handlePopstate.bind(this);
    window.addEventListener('popstate', this.popstateHandler);

    this.translations = {
      es: {
        featured: 'DESTACADO',
        privateRepo: 'Repositorio Privado',
        architecture: 'Arquitectura',
        keyHighlights: 'Aspectos Clave',
        techStack: 'Stack Tecnologico',
        screenshots: 'Capturas',
        screenshotPlaceholder: 'Proximamente',
        videoDemo: 'Video Demo',
        videoPlaceholder: 'Grabacion en progreso...',
        close: 'Cerrar',
        openDemo: 'Abrir Demo',
        swipeToClose: 'Desliza para cerrar',
        previousImage: 'Imagen anterior',
        nextImage: 'Siguiente imagen',
        imageOf: 'de'
      },
      en: {
        featured: 'FEATURED',
        privateRepo: 'Private Repository',
        architecture: 'Architecture',
        keyHighlights: 'Key Highlights',
        techStack: 'Tech Stack',
        screenshots: 'Screenshots',
        screenshotPlaceholder: 'Coming soon',
        videoDemo: 'Video Demo',
        videoPlaceholder: 'Recording in progress...',
        close: 'Close',
        openDemo: 'Open Demo',
        swipeToClose: 'Swipe to close',
        previousImage: 'Previous image',
        nextImage: 'Next image',
        imageOf: 'of'
      }
    };

    this.t = this.translations[this.lang];
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('project-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'project-modal-styles';
    styles.textContent = `
      #project-modal-overlay {
        --accent-color: #FFFF00;
        --accent-color-dim: rgba(255, 255, 0, 0.2);
        --accent-color-border: rgba(255, 255, 0, 0.4);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10002;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        padding-top: max(20px, env(safe-area-inset-top, 20px));
        padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
        box-sizing: border-box;
      }

      #project-modal-overlay.open {
        display: flex;
      }

      #project-modal-overlay.dark {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
      }

      #project-modal-overlay.light {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(8px);
      }

      #project-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
      }

      #project-modal-content {
        position: relative;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        max-height: 90dvh; /* Dynamic viewport height - respects mobile browser UI */
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalSlideIn 0.3s ease;
        font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      }

      @keyframes modalSlideIn {
        from { opacity: 0; transform: scale(0.95) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      #project-modal-overlay.dark #project-modal-content {
        background: #12121A;
        box-shadow: 0 0 40px var(--accent-color-dim);
      }

      #project-modal-overlay.light #project-modal-content {
        background: #FFFFFF;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
      }

      /* Border only on mobile */
      @media (max-width: 600px) {
        #project-modal-overlay.dark #project-modal-content,
        #project-modal-overlay.light #project-modal-content {
          border: 1px solid var(--accent-color-border);
        }
      }

      .modal-header {
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--accent-color-dim);
      }

      .modal-header-left {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .modal-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .badge-featured {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        background: var(--accent-color-dim);
        color: var(--accent-color);
        border: 1px solid var(--accent-color-border);
      }

      .badge-private {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      #project-modal-overlay.dark .badge-private {
        background: rgba(255, 255, 255, 0.1);
        color: #B0B0B0;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      #project-modal-overlay.light .badge-private {
        background: rgba(0, 0, 0, 0.05);
        color: #666666;
        border: 1px solid rgba(0, 0, 0, 0.15);
      }

      .modal-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        color: var(--accent-color);
      }

      .modal-subtitle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .modal-subtitle {
        font-size: 14px;
        margin: 0;
      }

      #project-modal-overlay.dark .modal-subtitle {
        color: #B0B0B0;
      }

      #project-modal-overlay.light .modal-subtitle {
        color: #666666;
      }

      .modal-demo-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        background: var(--accent-color);
        color: #000;
        transition: opacity 0.2s, transform 0.2s;
      }

      .modal-demo-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: transform 0.2s, color 0.2s;
        color: var(--accent-color-border);
      }

      .modal-close:hover {
        color: var(--accent-color);
        transform: scale(1.1);
      }

      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        scrollbar-width: thin;
        scrollbar-color: var(--accent-color-border) transparent;
      }

      /* Custom scrollbar for Webkit browsers */
      .modal-body::-webkit-scrollbar {
        width: 8px;
      }

      .modal-body::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }

      .modal-body::-webkit-scrollbar-thumb {
        background: var(--accent-color-border);
        border-radius: 4px;
        transition: background 0.2s;
      }

      .modal-body::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color);
      }

      .modal-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .modal-section-title {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0;
        color: var(--accent-color);
      }

      .modal-description {
        font-size: 14px;
        line-height: 1.7;
        margin: 0;
        white-space: pre-line;
      }

      .modal-section-heading {
        display: block;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-top: 8px;
        color: var(--accent-color);
      }

      .modal-link {
        color: var(--accent-color);
        text-decoration: none;
        font-weight: 600;
        transition: opacity 0.2s;
      }

      .modal-link:hover {
        opacity: 0.8;
        text-decoration: underline;
      }

      #project-modal-overlay.dark .modal-description {
        color: #E0E0E0;
      }

      #project-modal-overlay.light .modal-description {
        color: #1A1A2E;
      }

      .modal-screenshots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
      }

      @media (max-width: 600px) {
        .modal-screenshots-grid {
          grid-template-columns: 1fr;
        }
      }

      .modal-screenshot-container {
        position: relative;
        width: 100%;
        min-height: 180px;
        border-radius: 8px;
        overflow: hidden;
      }

      .modal-screenshot-skeleton {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg,
          var(--accent-color-dim) 0%,
          rgba(255,255,255,0.05) 50%,
          var(--accent-color-dim) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .modal-screenshot-img {
        width: 100%;
        max-height: 250px;
        object-fit: contain;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s;
        opacity: 0;
      }

      .modal-screenshot-img.loaded {
        opacity: 1;
      }

      .modal-screenshot-container:has(.modal-screenshot-img.loaded) .modal-screenshot-skeleton {
        display: none;
      }

      .modal-screenshot-img:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 20px var(--accent-color-dim);
      }

      .modal-highlights-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .modal-highlight-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        line-height: 1.5;
      }

      .modal-highlight-bullet {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-top: 6px;
        flex-shrink: 0;
        background: var(--accent-color);
      }

      #project-modal-overlay.dark .modal-highlight-item {
        color: #E0E0E0;
      }

      #project-modal-overlay.light .modal-highlight-item {
        color: #1A1A2E;
      }

      .modal-architecture-box {
        padding: 16px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        border: 1px solid var(--accent-color-dim);
      }

      #project-modal-overlay.dark .modal-architecture-box {
        background: rgba(0, 0, 0, 0.4);
        color: #E0E0E0;
      }

      #project-modal-overlay.light .modal-architecture-box {
        background: rgba(0, 0, 0, 0.03);
        color: #1A1A2E;
      }

      .modal-tech-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .modal-tech-chip {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        background: var(--accent-color-dim);
        color: var(--accent-color);
        border: 1px solid var(--accent-color-border);
      }

      .modal-video-placeholder {
        aspect-ratio: 16/9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: var(--accent-color-dim);
        border: 1px dashed var(--accent-color-border);
      }

      .modal-video-icon {
        font-size: 48px;
        opacity: 0.5;
      }

      .modal-video-text {
        font-size: 14px;
      }

      #project-modal-overlay.dark .modal-video-text {
        color: #B0B0B0;
      }

      #project-modal-overlay.light .modal-video-text {
        color: #666666;
      }

      /* Lightbox for expanded screenshots */
      #screenshot-lightbox {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10003;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        cursor: zoom-out;
        transition: background 0.2s ease;
      }

      #screenshot-lightbox.open {
        display: flex;
        animation: lightboxFadeIn 0.25s ease;
      }

      #screenshot-lightbox.closing {
        animation: lightboxFadeOut 0.2s ease forwards;
      }

      @keyframes lightboxFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes lightboxFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      #screenshot-lightbox .lightbox-img-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.1s ease-out, opacity 0.1s ease-out;
        touch-action: none;
        user-select: none;
      }

      #screenshot-lightbox .lightbox-img-container.dragging {
        transition: none;
      }

      #screenshot-lightbox .lightbox-img-container.zooming {
        transition: none;
      }

      #screenshot-lightbox .lightbox-img-container.zoomed {
        cursor: move;
      }

      #screenshot-lightbox img {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        transform-origin: center center;
      }

      #screenshot-lightbox.open .lightbox-img-container {
        animation: lightboxZoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      #screenshot-lightbox.closing .lightbox-img-container {
        animation: lightboxZoomOut 0.2s ease forwards;
      }

      @keyframes lightboxZoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      @keyframes lightboxZoomOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
      }

      #screenshot-lightbox .swipe-hint {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        animation: swipeHintPulse 2s ease-in-out infinite;
      }

      .swipe-hint-arrow {
        font-size: 20px;
        animation: swipeArrowBounce 1.5s ease-in-out infinite;
      }

      @keyframes swipeHintPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      @keyframes swipeArrowBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(5px); }
      }

      @media (min-width: 601px) {
        #screenshot-lightbox .swipe-hint {
          display: none;
        }
      }

      #screenshot-lightbox .lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 32px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s, transform 0.2s;
      }

      #screenshot-lightbox .lightbox-close:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      /* Lightbox navigation buttons */
      #screenshot-lightbox .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 24px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s, background 0.2s, transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      #screenshot-lightbox .lightbox-nav:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
      }

      #screenshot-lightbox .lightbox-nav:active {
        transform: translateY(-50%) scale(0.95);
      }

      #screenshot-lightbox .lightbox-nav:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      #screenshot-lightbox .lightbox-nav.prev {
        left: 20px;
      }

      #screenshot-lightbox .lightbox-nav.next {
        right: 20px;
      }

      #screenshot-lightbox .lightbox-indicator {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.6);
        padding: 6px 14px;
        border-radius: 20px;
        color: white;
        font-size: 14px;
        font-family: 'JetBrains Mono', monospace;
      }

      @media (max-width: 600px) {
        #screenshot-lightbox .lightbox-nav {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }

        #screenshot-lightbox .lightbox-nav.prev {
          left: 10px;
        }

        #screenshot-lightbox .lightbox-nav.next {
          right: 10px;
        }
      }

      /* Responsive */
      @media (max-width: 600px) {
        #project-modal-overlay {
          padding: 8px;
          padding-top: max(8px, env(safe-area-inset-top, 8px));
          padding-bottom: max(8px, env(safe-area-inset-bottom, 8px));
          align-items: flex-start;
        }

        #project-modal-content {
          max-height: 92vh;
          max-height: 92dvh;
          border-radius: 12px;
        }

        .modal-header {
          padding: 16px 20px;
        }

        .modal-title {
          font-size: 22px;
        }

        .modal-body {
          padding: 20px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // Convert hex to rgba for CSS
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Update CSS custom properties with accent color
  updateAccentColor(color) {
    this.accentColor = color;
    const overlay = document.getElementById('project-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('--accent-color', color);
      overlay.style.setProperty('--accent-color-dim', this.hexToRgba(color, 0.15));
      overlay.style.setProperty('--accent-color-border', this.hexToRgba(color, 0.4));
    }
  }

  // Handle browser back button
  handlePopstate(event) {
    if (this.lightboxOpen) {
      this.closeLightbox(false); // Don't manipulate history, we're handling popstate
    } else if (this.isOpen && !this.isClosingLightbox) {
      // Only close modal if we're not in the middle of closing the lightbox
      this.close(false); // Don't manipulate history, we're handling popstate
    }
    // Reset the flag after handling
    this.isClosingLightbox = false;
  }

  open(projectData) {
    this.projectData = projectData;

    // Store screenshots for lightbox navigation
    this.screenshots = projectData.screenshots || [];

    // Set accent color from project data
    if (projectData.accentColor) {
      this.accentColor = projectData.accentColor;
    }

    // Save currently focused element for focus trap
    this.previouslyFocusedElement = document.activeElement;

    this.render();
    this.bindEvents();
    this.updateAccentColor(this.accentColor);
    this.setupLazyLoadingImages();
    this.setupFocusTrap();

    const overlay = document.getElementById('project-modal-overlay');
    overlay.classList.add('open');
    this.isOpen = true;

    // Focus the close button for accessibility
    const closeBtn = document.getElementById('project-modal-close');
    if (closeBtn) closeBtn.focus();

    // Push state for back button support
    history.pushState({ projectModal: true }, '');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(updateHistory = true) {
    this.cleanupLazyLoading();
    this.cleanupFocusTrap();

    const overlay = document.getElementById('project-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
    this.isOpen = false;

    // Restore focus to previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }

    // Go back in history if we pushed a state (not when handling popstate)
    if (updateHistory) {
      history.back();
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  render() {
    // Remove existing modal if any
    const existing = document.getElementById('project-modal-overlay');
    if (existing) existing.remove();

    const data = this.projectData;
    if (!data) return;

    const overlay = document.createElement('div');
    overlay.id = 'project-modal-overlay';
    overlay.className = this.theme;

    overlay.innerHTML = `
      <div id="project-modal-backdrop"></div>
      <div id="project-modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <div class="modal-badges">
              ${data.isFeatured ? `<span class="badge-featured">${this.t.featured}</span>` : ''}
            </div>
            <h2 class="modal-title">${this.escapeHtml(data.title)}</h2>
            <div class="modal-subtitle-row">
              <p class="modal-subtitle">${this.escapeHtml(data.subtitle)}</p>
              ${data.demoUrl ? `<a href="${data.demoUrl}" target="_blank" rel="noopener noreferrer" class="modal-demo-btn">▶ ${this.t.openDemo}</a>` : ''}
            </div>
          </div>
          <button class="modal-close" id="project-modal-close" aria-label="${this.t.close}">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Description -->
          <div class="modal-section">
            <p class="modal-description">${this.formatDescription(data.longDescription)}</p>
          </div>

          <!-- Screenshots -->
          ${data.screenshots && data.screenshots.length > 0 ? `
          <div class="modal-section">
            <h3 class="modal-section-title">${this.t.screenshots}</h3>
            <div class="modal-screenshots-grid">
              ${this.renderScreenshots(data.screenshots)}
            </div>
          </div>
          ` : ''}

          <!-- Key Highlights -->
          <div class="modal-section">
            <h3 class="modal-section-title">${this.t.keyHighlights}</h3>
            <ul class="modal-highlights-list">
              ${data.keyHighlights.map(h => `
                <li class="modal-highlight-item">
                  <span class="modal-highlight-bullet"></span>
                  <span>${this.escapeHtml(h)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Architecture -->
          <div class="modal-section">
            <h3 class="modal-section-title">${this.t.architecture}</h3>
            <div class="modal-architecture-box">${this.escapeHtml(data.architecture)}</div>
          </div>

          <!-- Tech Stack -->
          <div class="modal-section">
            <h3 class="modal-section-title">${this.t.techStack}</h3>
            <div class="modal-tech-chips">
              ${data.techStack.map(t => `<span class="modal-tech-chip">${this.escapeHtml(t)}</span>`).join('')}
            </div>
          </div>

          <!-- Video Placeholder -->
          ${data.videoPlaceholder ? `
            <div class="modal-section">
              <h3 class="modal-section-title">${this.t.videoDemo}</h3>
              <div class="modal-video-placeholder">
                <span class="modal-video-icon">&#9654;</span>
                <span class="modal-video-text">${this.t.videoPlaceholder}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  renderScreenshots(screenshots) {
    if (!screenshots || screenshots.length === 0) return '';
    return screenshots.map((src, index) => {
      // First image loads immediately (critical), rest are lazy loaded
      const isFirst = index === 0;
      // Escape src for safe use in onclick handler
      const safeSrc = this.escapeAttr(src);
      const imgAttrs = isFirst
        ? `src="${safeSrc}" onload="this.classList.add('loaded')"`
        : `data-src="${safeSrc}"`;
      return `<div class="modal-screenshot-container">
        <div class="modal-screenshot-skeleton"></div>
        <img ${imgAttrs} alt="Screenshot ${index + 1}" class="modal-screenshot-img" onclick="window.projectModal.openLightbox('${safeSrc}')" />
      </div>`;
    }).join('');
  }

  // Escape attribute values for safe HTML insertion
  escapeAttr(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  setupLazyLoadingImages() {
    const modalBody = document.querySelector('.modal-body');
    if (!modalBody) return;

    const images = document.querySelectorAll('.modal-screenshot-img[data-src]');
    if (images.length === 0) return;

    // Use IntersectionObserver for lazy loading within modal scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.onload = () => {
              img.classList.add('loaded');
            };
            img.onerror = () => {
              img.classList.add('loaded'); // Hide skeleton even on error
            };
            delete img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    }, {
      root: modalBody, // Observe within modal scroll container
      rootMargin: '100px', // Load 100px before visible
      threshold: 0
    });

    images.forEach(img => observer.observe(img));
    this.imageObserver = observer;
  }

  cleanupLazyLoading() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
    }
  }

  setupFocusTrap() {
    const overlay = document.getElementById('project-modal-overlay');
    if (!overlay) return;

    this.focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', this.focusTrapHandler);
  }

  cleanupFocusTrap() {
    if (this.focusTrapHandler) {
      document.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  bindEvents() {
    const closeBtn = document.getElementById('project-modal-close');
    const backdrop = document.getElementById('project-modal-backdrop');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    // Close on Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        // First close lightbox if open, then modal
        const lightbox = document.getElementById('screenshot-lightbox');
        if (lightbox) {
          this.closeLightbox();
        } else if (this.isOpen) {
          this.close();
        }
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatDescription(text) {
    if (!text) return '';
    // First escape HTML
    let formatted = this.escapeHtml(text);
    // Convert ## Title to styled headings
    formatted = formatted.replace(/^## (.+)$/gm, '<span class="modal-section-heading">$1</span>');
    // Convert [text](url) to clickable links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="modal-link">$1</a>');
    return formatted;
  }

  openLightbox(src, clickedElement = null) {
    // Find current image index
    this.currentImageIndex = this.screenshots.indexOf(src);
    if (this.currentImageIndex === -1) this.currentImageIndex = 0;

    // Remove existing lightbox if any
    const existing = document.getElementById('screenshot-lightbox');
    if (existing) existing.remove();

    const hasMultipleImages = this.screenshots.length > 1;
    const lightbox = document.createElement('div');
    lightbox.id = 'screenshot-lightbox';
    lightbox.className = 'open';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="${this.t.close}">&times;</button>
      ${hasMultipleImages ? `
        <button class="lightbox-nav prev" aria-label="${this.t.previousImage}">&#8249;</button>
        <button class="lightbox-nav next" aria-label="${this.t.nextImage}">&#8250;</button>
        <div class="lightbox-indicator">
          <span class="current-index">${this.currentImageIndex + 1}</span> ${this.t.imageOf} ${this.screenshots.length}
        </div>
      ` : ''}
      <div class="lightbox-img-container">
        <img src="${src}" alt="Screenshot expanded" />
      </div>
      <div class="swipe-hint">
        <span class="swipe-hint-arrow">↓</span>
        <span>${this.t.swipeToClose}</span>
      </div>
    `;

    document.body.appendChild(lightbox);
    this.lightboxOpen = true;

    // Push state for back button support
    history.pushState({ lightbox: true }, '');

    const imgContainer = lightbox.querySelector('.lightbox-img-container');

    // Setup navigation buttons
    if (hasMultipleImages) {
      this.setupLightboxNavigation(lightbox);
      this.updateNavigationState(lightbox);
      this.preloadAdjacentImages();
    }

    // Setup keyboard navigation
    this.setupLightboxKeyboard(lightbox);

    // Setup swipe to close (mobile)
    this.setupSwipeToClose(lightbox, imgContainer);

    // Setup pinch-to-zoom (mobile)
    this.setupPinchZoom(lightbox, imgContainer);

    // Close on click on backdrop (not on image container)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        this.closeLightbox();
      }
    });

    // Close button
    lightbox.querySelector('.lightbox-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeLightbox();
    });

    // Prevent closing when clicking on image container
    imgContainer.addEventListener('click', (e) => e.stopPropagation());
  }

  setupLightboxNavigation(lightbox) {
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateLightbox(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateLightbox(1);
      });
    }
  }

  setupLightboxKeyboard(lightbox) {
    this.lightboxKeyHandler = (e) => {
      if (!this.lightboxOpen) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateLightbox(1);
      }
    };
    document.addEventListener('keydown', this.lightboxKeyHandler);
  }

  navigateLightbox(direction) {
    if (this.screenshots.length <= 1) return;

    const newIndex = this.currentImageIndex + direction;
    if (newIndex < 0 || newIndex >= this.screenshots.length) return;

    this.currentImageIndex = newIndex;
    const lightbox = document.getElementById('screenshot-lightbox');
    if (!lightbox) return;

    // Update image with fade transition
    const img = lightbox.querySelector('.lightbox-img-container img');
    const imgContainer = lightbox.querySelector('.lightbox-img-container');

    imgContainer.style.opacity = '0';
    imgContainer.style.transform = `translateX(${direction * MODAL_CONFIG.LIGHTBOX_NAV_OFFSET}px)`;

    setTimeout(() => {
      img.src = this.screenshots[this.currentImageIndex];
      imgContainer.style.transform = `translateX(${-direction * MODAL_CONFIG.LIGHTBOX_NAV_OFFSET}px)`;

      requestAnimationFrame(() => {
        imgContainer.style.opacity = '1';
        imgContainer.style.transform = 'translateX(0)';
      });
    }, MODAL_CONFIG.LIGHTBOX_NAV_DELAY);

    // Update indicator
    const indicator = lightbox.querySelector('.current-index');
    if (indicator) {
      indicator.textContent = this.currentImageIndex + 1;
    }

    this.updateNavigationState(lightbox);
    this.preloadAdjacentImages();
  }

  updateNavigationState(lightbox) {
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');

    if (prevBtn) {
      prevBtn.disabled = this.currentImageIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentImageIndex === this.screenshots.length - 1;
    }
  }

  preloadAdjacentImages() {
    // Preload previous and next images (with cache to avoid redundant loads)
    const indicesToPreload = [
      this.currentImageIndex - 1,
      this.currentImageIndex + 1
    ].filter(i => i >= 0 && i < this.screenshots.length);

    indicesToPreload.forEach(index => {
      const src = this.screenshots[index];
      // Only preload if not already cached
      if (!this.preloadedImages.has(src)) {
        const img = new Image();
        img.src = src;
        this.preloadedImages.add(src);
      }
    });
  }

  setupSwipeToClose(lightbox, imgContainer) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
      // Don't start swipe if using 2 fingers (pinch) or if zoomed
      if (e.touches.length > 1 || imgContainer.classList.contains('zoomed')) {
        isDragging = false;
        return;
      }
      startY = e.touches[0].clientY;
      currentY = startY;
      isDragging = true;
      imgContainer.classList.add('dragging');
    };

    const onTouchMove = (e) => {
      // Don't interfere when zoomed - let pinchZoom handle it
      if (imgContainer.classList.contains('zoomed')) {
        return;
      }
      // Cancel swipe if second finger added (pinch starting)
      if (e.touches.length > 1) {
        if (isDragging) {
          // Only reset if we were actually dragging
          isDragging = false;
          imgContainer.classList.remove('dragging');
          imgContainer.style.transform = '';
          imgContainer.style.opacity = '';
          lightbox.style.background = '';
        }
        return;
      }
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // Only allow dragging down
      if (deltaY > 0) {
        const progress = Math.min(deltaY / MODAL_CONFIG.SWIPE_OPACITY_DIVISOR, 1);
        imgContainer.style.transform = `translateY(${deltaY}px) scale(${1 - progress * 0.1})`;
        imgContainer.style.opacity = 1 - progress * 0.5;
        lightbox.style.background = `rgba(0, 0, 0, ${0.95 - progress * 0.4})`;
      }
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      imgContainer.classList.remove('dragging');

      const deltaY = currentY - startY;

      // If dragged more than threshold, close
      if (deltaY > MODAL_CONFIG.SWIPE_CLOSE_THRESHOLD) {
        this.closeLightbox();
      } else {
        // Reset position
        imgContainer.style.transform = '';
        imgContainer.style.opacity = '';
        lightbox.style.background = '';
      }
    };

    imgContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    imgContainer.addEventListener('touchmove', onTouchMove, { passive: true });
    imgContainer.addEventListener('touchend', onTouchEnd);
    imgContainer.addEventListener('touchcancel', onTouchEnd);
  }

  setupPinchZoom(lightbox, imgContainer) {
    const img = imgContainer.querySelector('img');
    let initialDistance = 0;
    let currentScale = 1;
    let startScale = 1;
    let translateX = 0;
    let translateY = 0;
    let startX = 0;
    let startY = 0;
    let isPinching = false;
    let isPanning = false;
    // Store base image size (without zoom) for pan limits
    let baseWidth = 0;
    let baseHeight = 0;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touches) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    };

    const updateTransform = () => {
      img.style.transform = `scale(${currentScale}) translate(${translateX / currentScale}px, ${translateY / currentScale}px)`;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Pinch start - capture base size before any zoom
        if (currentScale === 1) {
          const rect = img.getBoundingClientRect();
          baseWidth = rect.width;
          baseHeight = rect.height;
        }
        isPinching = true;
        isPanning = false;
        initialDistance = getDistance(e.touches);
        startScale = currentScale;
        imgContainer.classList.add('zooming');
        imgContainer.classList.remove('dragging');
      } else if (e.touches.length === 1 && currentScale > 1) {
        // Pan start (only when zoomed)
        isPanning = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        imgContainer.classList.add('zooming');
      }
    };

    const onTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const distance = getDistance(e.touches);
        const scale = (distance / initialDistance) * startScale;
        currentScale = Math.min(Math.max(scale, MODAL_CONFIG.ZOOM_MIN), MODAL_CONFIG.ZOOM_MAX);

        if (currentScale === 1) {
          translateX = 0;
          translateY = 0;
          imgContainer.classList.remove('zoomed');
        } else {
          imgContainer.classList.add('zoomed');
        }

        updateTransform();
      } else if (isPanning && e.touches.length === 1 && currentScale > 1) {
        e.preventDefault();
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;

        // Limit panning based on how much the scaled image exceeds viewport
        // The extra visible area on each side is: (scaledSize - baseSize) / 2
        const extraX = (baseWidth * currentScale - baseWidth) / 2;
        const extraY = (baseHeight * currentScale - baseHeight) / 2;
        // Divide by currentScale because translate is applied after scale
        const maxPanX = extraX / currentScale;
        const maxPanY = extraY / currentScale;

        translateX = Math.min(Math.max(translateX, -maxPanX), maxPanX);
        translateY = Math.min(Math.max(translateY, -maxPanY), maxPanY);

        updateTransform();
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        isPinching = false;
      }
      if (e.touches.length === 0) {
        isPanning = false;
        imgContainer.classList.remove('zooming');

        // Reset if zoomed out completely
        if (currentScale <= 1) {
          currentScale = 1;
          translateX = 0;
          translateY = 0;
          img.style.transform = '';
          imgContainer.classList.remove('zoomed');
        }
      }
    };

    // Double tap to zoom
    let lastTap = 0;
    const onDoubleTap = (e) => {
      const now = Date.now();
      if (now - lastTap < MODAL_CONFIG.DOUBLE_TAP_DELAY) {
        e.preventDefault();
        if (currentScale > 1) {
          // Reset zoom
          currentScale = 1;
          translateX = 0;
          translateY = 0;
          img.style.transform = '';
          imgContainer.classList.remove('zoomed');
        } else {
          // Capture base size before zoom
          const rect = img.getBoundingClientRect();
          baseWidth = rect.width;
          baseHeight = rect.height;
          // Zoom to 2x
          currentScale = 2;
          imgContainer.classList.add('zoomed');
          updateTransform();
        }
      }
      lastTap = now;
    };

    imgContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    imgContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    imgContainer.addEventListener('touchend', onTouchEnd);
    imgContainer.addEventListener('touchcancel', onTouchEnd);
    imgContainer.addEventListener('click', onDoubleTap);

    // Store cleanup function
    this.pinchZoomCleanup = () => {
      imgContainer.removeEventListener('touchstart', onTouchStart);
      imgContainer.removeEventListener('touchmove', onTouchMove);
      imgContainer.removeEventListener('touchend', onTouchEnd);
      imgContainer.removeEventListener('touchcancel', onTouchEnd);
      imgContainer.removeEventListener('click', onDoubleTap);
    };
  }

  closeLightbox(updateHistory = true) {
    // Clean up pinch zoom
    if (this.pinchZoomCleanup) {
      this.pinchZoomCleanup();
      this.pinchZoomCleanup = null;
    }
    // Clean up keyboard handler
    if (this.lightboxKeyHandler) {
      document.removeEventListener('keydown', this.lightboxKeyHandler);
      this.lightboxKeyHandler = null;
    }

    const lightbox = document.getElementById('screenshot-lightbox');
    if (lightbox) {
      // Add closing animation
      lightbox.classList.remove('open');
      lightbox.classList.add('closing');

      // Remove after animation completes
      setTimeout(() => {
        lightbox.remove();
      }, MODAL_CONFIG.CLOSING_ANIMATION_DURATION);
    }
    this.lightboxOpen = false;

    // Go back in history if we pushed a state (not when handling popstate)
    if (updateHistory) {
      // Set flag to prevent modal from closing when popstate fires
      this.isClosingLightbox = true;
      history.back();
    }
  }

  setTheme(theme) {
    this.theme = theme;
    const overlay = document.getElementById('project-modal-overlay');
    if (overlay) {
      overlay.classList.remove('dark', 'light');
      overlay.classList.add(theme);
    }
  }

  setLang(lang) {
    this.lang = lang;
    this.t = this.translations[lang] || this.translations.es;
  }
}

// Create global instance
window.projectModal = new ProjectDetailModal();

// Expose function for Kotlin interop
window.openProjectModal = function(json) {
  try {
    const data = JSON.parse(json);
    window.projectModal.open(data);
  } catch (e) {
    console.error('[ProjectModal] Error parsing JSON:', e);
  }
};

window.closeProjectModal = function() {
  window.projectModal.close();
};

window.updateProjectModalTheme = function(theme) {
  window.projectModal.setTheme(theme);
};

window.updateProjectModalLang = function(lang) {
  window.projectModal.setLang(lang);
};
