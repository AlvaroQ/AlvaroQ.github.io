/**
 * Project Detail Modal - Overlay for featured projects
 * Following the pattern of chat-widget.js
 * Supports dynamic accent colors per project
 */
class ProjectDetailModal {
  constructor() {
    this.isOpen = false;
    this.lightboxOpen = false;
    this.theme = 'dark';
    this.lang = 'es';
    this.projectData = null;
    this.accentColor = '#FFFF00'; // Default yellow

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
        openDemo: 'Abrir Demo'
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
        openDemo: 'Open Demo'
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
        border: 1px solid var(--accent-color-border);
        box-shadow: 0 0 40px var(--accent-color-dim);
      }

      #project-modal-overlay.light #project-modal-content {
        background: #FFFFFF;
        border: 1px solid var(--accent-color-border);
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
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
        transition: transform 0.2s, opacity 0.2s;
        opacity: 0.7;
      }

      #project-modal-overlay.dark .modal-close {
        color: #E0E0E0;
      }

      #project-modal-overlay.light .modal-close {
        color: #333333;
      }

      .modal-close:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
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

      .modal-screenshot-img {
        width: 100%;
        max-height: 250px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid var(--accent-color-border);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
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
        animation: lightboxFadeIn 0.2s ease;
      }

      #screenshot-lightbox.open {
        display: flex;
      }

      @keyframes lightboxFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #screenshot-lightbox img {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
        animation: lightboxZoomIn 0.2s ease;
      }

      @keyframes lightboxZoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
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
    } else if (this.isOpen) {
      this.close(false); // Don't manipulate history, we're handling popstate
    }
  }

  open(projectData) {
    this.projectData = projectData;

    // Set accent color from project data
    if (projectData.accentColor) {
      this.accentColor = projectData.accentColor;
    }

    this.render();
    this.bindEvents();
    this.updateAccentColor(this.accentColor);

    const overlay = document.getElementById('project-modal-overlay');
    overlay.classList.add('open');
    this.isOpen = true;

    // Push state for back button support
    history.pushState({ projectModal: true }, '');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(updateHistory = true) {
    const overlay = document.getElementById('project-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
    this.isOpen = false;

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
    return screenshots.map(src =>
      `<img src="${src}" alt="Screenshot" class="modal-screenshot-img" loading="lazy" onclick="window.projectModal.openLightbox('${src}')" />`
    ).join('');
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

  openLightbox(src) {
    // Remove existing lightbox if any
    const existing = document.getElementById('screenshot-lightbox');
    if (existing) existing.remove();

    const lightbox = document.createElement('div');
    lightbox.id = 'screenshot-lightbox';
    lightbox.className = 'open';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img src="${src}" alt="Screenshot expanded" />
    `;

    document.body.appendChild(lightbox);
    this.lightboxOpen = true;

    // Push state for back button support
    history.pushState({ lightbox: true }, '');

    // Close on click anywhere
    lightbox.addEventListener('click', () => this.closeLightbox());

    // Prevent closing when clicking on image
    lightbox.querySelector('img').addEventListener('click', (e) => e.stopPropagation());
  }

  closeLightbox(updateHistory = true) {
    const lightbox = document.getElementById('screenshot-lightbox');
    if (lightbox) {
      lightbox.remove();
    }
    this.lightboxOpen = false;

    // Go back in history if we pushed a state (not when handling popstate)
    if (updateHistory) {
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
