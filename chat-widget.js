/**
 * Portfolio Chat Widget - Floating Overlay Version
 * Connects to Cloudflare Worker RAG API
 */
class PortfolioChatWidget {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://portfolio-chatbot.alvaroq-dev.workers.dev';
    this.lang = options.lang || 'es';
    this.theme = options.theme || 'dark';
    this.isOpen = false;
    this.hasShownSuggestions = false;

    this.translations = {
      es: {
        title: 'Chat con Álvaro',
        placeholder: 'Pregunta sobre mi experiencia...',
        send: 'Enviar',
        thinking: 'Pensando...',
        greeting: '¡Hola! Soy el asistente virtual de Álvaro. Pregúntame sobre su experiencia, proyectos o habilidades.',
        error: 'Error al procesar tu pregunta. Intenta de nuevo.',
        toggle: 'Abrir chat',
        suggestions: [
          '¿Experiencia con Kotlin?',
          '¿Proyectos de IA?',
          '¿Años de experiencia?'
        ]
      },
      en: {
        title: 'Chat with Álvaro',
        placeholder: 'Ask about my experience...',
        send: 'Send',
        thinking: 'Thinking...',
        greeting: "Hi! I'm Álvaro's virtual assistant. Ask me about his experience, projects, or skills.",
        error: 'Error processing your question. Please try again.',
        toggle: 'Open chat',
        suggestions: [
          'Kotlin experience?',
          'AI projects?',
          'Years of experience?'
        ]
      }
    };

    this.t = this.translations[this.lang] || this.translations.es;
    this.init();
  }

  init() {
    this.injectStyles();
    this.render();
    this.bindEvents();
  }

  injectStyles() {
    if (document.getElementById('chat-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'chat-widget-styles';
    styles.textContent = `
      #chat-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #chat-toggle-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00FFFF 0%, #FF0080 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
        transition: transform 0.3s, box-shadow 0.3s;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
        }
        50% {
          box-shadow: 0 4px 30px rgba(0, 255, 255, 0.7), 0 0 40px rgba(255, 0, 128, 0.3);
        }
      }

      #chat-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(0, 255, 255, 0.6);
        animation: none;
      }

      #chat-toggle-btn svg {
        width: 28px;
        height: 28px;
        fill: white;
      }

      #chat-panel {
        display: none;
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 360px;
        height: 500px;
        border-radius: 16px;
        overflow: hidden;
        flex-direction: column;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.3s ease;
      }

      #chat-panel.open {
        display: flex;
      }

      #chat-panel.dark {
        background: rgba(10, 10, 20, 0.98);
        border: 1px solid rgba(0, 255, 255, 0.3);
      }

      #chat-panel.light {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 184, 184, 0.4);
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .chat-header {
        background: linear-gradient(135deg, #00FFFF 0%, #FF0080 100%);
        color: white;
        padding: 16px;
        font-weight: 600;
        font-size: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .chat-close:hover {
        opacity: 1;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chat-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 16px;
        line-height: 1.5;
        font-size: 14px;
        word-wrap: break-word;
      }

      .chat-message.user {
        background: linear-gradient(135deg, #00FFFF 0%, #00B8B8 100%);
        color: #0A0A0F;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }

      #chat-panel.dark .chat-message.assistant {
        background: rgba(255, 255, 255, 0.1);
        color: #E0E0E0;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }

      #chat-panel.light .chat-message.assistant {
        background: rgba(0, 0, 0, 0.05);
        color: #1A1A2E;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }

      /* Suggestions */
      .chat-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 12px;
      }

      .chat-suggestion {
        padding: 8px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      #chat-panel.dark .chat-suggestion {
        background: rgba(0, 255, 255, 0.1);
        color: #00FFFF;
        border: 1px solid rgba(0, 255, 255, 0.3);
      }

      #chat-panel.dark .chat-suggestion:hover {
        background: rgba(0, 255, 255, 0.2);
        border-color: rgba(0, 255, 255, 0.5);
      }

      #chat-panel.light .chat-suggestion {
        background: rgba(0, 184, 184, 0.1);
        color: #008080;
        border: 1px solid rgba(0, 184, 184, 0.3);
      }

      #chat-panel.light .chat-suggestion:hover {
        background: rgba(0, 184, 184, 0.2);
        border-color: rgba(0, 184, 184, 0.5);
      }

      .chat-input-container {
        display: flex;
        padding: 12px;
        gap: 8px;
      }

      #chat-panel.dark .chat-input-container {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      #chat-panel.light .chat-input-container {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      .chat-input {
        flex: 1;
        padding: 12px 16px;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      #chat-panel.dark .chat-input {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
        color: #E0E0E0;
      }

      #chat-panel.light .chat-input {
        background: rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(0, 184, 184, 0.4);
        color: #1A1A2E;
      }

      .chat-input:focus {
        border-color: #00FFFF;
      }

      .chat-input::placeholder {
        opacity: 0.6;
      }

      .chat-send {
        background: linear-gradient(135deg, #00FFFF 0%, #FF0080 100%);
        color: white;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
      }

      .chat-send:hover {
        transform: scale(1.05);
      }

      .chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .chat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        border-radius: 16px;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }

      #chat-panel.dark .chat-typing {
        background: rgba(255, 255, 255, 0.1);
      }

      #chat-panel.light .chat-typing {
        background: rgba(0, 0, 0, 0.05);
      }

      .chat-typing span {
        width: 8px;
        height: 8px;
        background: #00FFFF;
        border-radius: 50%;
        animation: typing 1s infinite;
      }

      .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
      .chat-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      /* Mobile responsive */
      @media (max-width: 420px) {
        #chat-panel {
          width: calc(100vw - 40px);
          height: 420px;
          right: -10px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  render() {
    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    container.innerHTML = `
      <div id="chat-panel" class="${this.theme}">
        <div class="chat-header">
          <span>${this.t.title}</span>
          <button class="chat-close" id="chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-suggestions" id="chat-suggestions"></div>
        <div class="chat-input-container">
          <input type="text" class="chat-input" id="chat-input" placeholder="${this.t.placeholder}" autocomplete="off">
          <button class="chat-send" id="chat-send" aria-label="${this.t.send}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
      <button id="chat-toggle-btn" aria-label="${this.t.toggle}">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;
    document.body.appendChild(container);
  }

  bindEvents() {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    toggleBtn.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.close());
    sendBtn.addEventListener('click', () => this.handleSend());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    const panel = document.getElementById('chat-panel');
    panel.classList.add('open');
    this.isOpen = true;

    // Show greeting and suggestions on first open
    const messages = document.getElementById('chat-messages');
    if (messages.children.length === 0) {
      this.addMessage('assistant', this.t.greeting);
      this.showSuggestions();
    }

    document.getElementById('chat-input').focus();
  }

  close() {
    const panel = document.getElementById('chat-panel');
    panel.classList.remove('open');
    this.isOpen = false;
  }

  showSuggestions() {
    if (this.hasShownSuggestions) return;

    const container = document.getElementById('chat-suggestions');
    container.innerHTML = this.t.suggestions.map(s =>
      `<button class="chat-suggestion">${s}</button>`
    ).join('');

    container.querySelectorAll('.chat-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.textContent;
        this.handleSend();
        this.hideSuggestions();
      });
    });
  }

  hideSuggestions() {
    const container = document.getElementById('chat-suggestions');
    container.innerHTML = '';
    this.hasShownSuggestions = true;
  }

  async handleSend() {
    const input = document.getElementById('chat-input');
    const button = document.getElementById('chat-send');
    const question = input.value.trim();

    if (!question) return;

    this.hideSuggestions();
    input.value = '';
    button.disabled = true;

    this.addMessage('user', question);
    this.showTyping();

    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang: this.lang })
      });

      const data = await response.json();
      this.hideTyping();
      this.addMessage('assistant', data.answer || this.t.error);
    } catch (error) {
      console.error('[ChatWidget] Error:', error);
      this.hideTyping();
      this.addMessage('assistant', this.t.error);
    }

    button.disabled = false;
    input.focus();
  }

  addMessage(role, text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    // Parse basic markdown: **bold** and *italic*
    div.innerHTML = this.parseMarkdown(text);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  parseMarkdown(text) {
    // Escape HTML first to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse markdown
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **bold**
      .replace(/\*(.+?)\*/g, '<em>$1</em>')              // *italic*
      .replace(/\n/g, '<br>');                            // line breaks
  }

  showTyping() {
    const messages = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  hideTyping() {
    const typing = document.getElementById('chat-typing');
    if (typing) typing.remove();
  }

  // Update theme dynamically
  setTheme(theme) {
    this.theme = theme;
    const panel = document.getElementById('chat-panel');
    if (panel) {
      panel.classList.remove('dark', 'light');
      panel.classList.add(theme);
    }
  }

  // Update language dynamically
  setLang(lang) {
    this.lang = lang;
    this.t = this.translations[lang] || this.translations.es;
    // Update UI texts
    const header = document.querySelector('.chat-header span');
    const input = document.getElementById('chat-input');
    if (header) header.textContent = this.t.title;
    if (input) input.placeholder = this.t.placeholder;
    // Update suggestions if visible
    if (!this.hasShownSuggestions) {
      this.showSuggestions();
    }
  }

  // Open chat programmatically (for "Try it" button)
  openChat() {
    this.open();
  }
}

// Expose for global use and Kotlin interop
window.PortfolioChatWidget = PortfolioChatWidget;

// Function to open chat from Kotlin
window.openChatWidget = function() {
  if (window.chatWidget) {
    window.chatWidget.openChat();
  }
};
