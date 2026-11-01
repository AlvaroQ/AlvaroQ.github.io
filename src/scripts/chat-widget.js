// Chat widget behaviour. Loaded lazily by ChatWidget.astro on the first interaction.
// Markup, strings and styles live in the component; this module only wires it.

const INLINE = /\*\*(.+?)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*\n]+)\*/g;

/** @type {HTMLDialogElement | null} */
let dialog = null;
/** @type {HTMLElement | null} */
let opener = null;
let ready = false;
let busy = false;

/**
 * Build inline nodes for a line: bold, italic, inline code and http(s) links.
 * Text is always inserted as text nodes, so network data is never parsed as HTML.
 * @param {string} line
 * @returns {Node[]}
 */
function inlineNodes(line) {
  /** @type {Node[]} */
  const nodes = [];
  let last = 0;
  for (const match of line.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(document.createTextNode(line.slice(last, index)));
    const [, bold, code, label, href, italic] = match;
    if (bold !== undefined) {
      const el = document.createElement('strong');
      el.textContent = bold;
      nodes.push(el);
    } else if (code !== undefined) {
      const el = document.createElement('code');
      el.textContent = code;
      nodes.push(el);
    } else if (label !== undefined && href !== undefined) {
      const el = document.createElement('a');
      el.textContent = label;
      el.href = href;
      el.rel = 'noopener noreferrer';
      el.target = '_blank';
      nodes.push(el);
    } else if (italic !== undefined) {
      const el = document.createElement('em');
      el.textContent = italic;
      nodes.push(el);
    }
    last = index + match[0].length;
  }
  if (last < line.length) nodes.push(document.createTextNode(line.slice(last)));
  return nodes;
}

/**
 * @param {HTMLElement} container
 * @param {string} text
 */
function renderText(container, text) {
  text.split('\n').forEach((line, i) => {
    if (i > 0) container.append(document.createElement('br'));
    container.append(...inlineNodes(line));
  });
}

/** @param {string} id */
function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`chat: missing #${id}`);
  return el;
}

function setup() {
  if (ready) return;
  const root = /** @type {HTMLDialogElement} */ (byId('chat-dialog'));
  dialog = root;
  const messages = byId('chat-messages');
  const suggestions = byId('chat-suggestions');
  const form = /** @type {HTMLFormElement} */ (byId('chat-form'));
  const input = /** @type {HTMLInputElement} */ (byId('chat-input'));
  const send = /** @type {HTMLButtonElement} */ (byId('chat-send'));
  const fab = byId('chat-fab');
  const { api = '', lang = 'es', typing = '', error = '' } = root.dataset;

  /**
   * @param {'user' | 'assistant'} role
   * @param {string} text
   */
  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    renderText(div, text);
    messages.append(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg-typing';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');
      div.append(dot);
    }
    const label = document.createElement('span');
    label.className = 'vh';
    label.textContent = typing;
    div.append(label);
    messages.append(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  /** @param {string} question */
  async function ask(question) {
    if (busy || !question) return;
    busy = true;
    suggestions.hidden = true;
    input.value = '';
    input.disabled = true;
    send.disabled = true;
    addMessage('user', question);
    const indicator = showTyping();
    try {
      const response = await fetch(`${api}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      indicator.remove();
      addMessage('assistant', typeof data?.answer === 'string' && data.answer ? data.answer : error);
    } catch (err) {
      console.error('[chat] request failed', err);
      indicator.remove();
      addMessage('assistant', error);
    } finally {
      busy = false;
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void ask(input.value.trim());
  });

  suggestions.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button) void ask((button.textContent ?? '').trim());
  });

  // Keep Tab inside the panel (showModal alone can hand focus to the browser UI).
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = [...root.querySelectorAll('button, input, [tabindex="0"]')].filter(
      (el) => !(el instanceof HTMLButtonElement || el instanceof HTMLInputElement) || !el.disabled,
    );
    const visible = items.filter((el) => el.getClientRects().length > 0);
    const first = visible[0];
    const lastItem = visible[visible.length - 1];
    if (!first || !lastItem) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      first.focus();
    }
  });

  byId('chat-close').addEventListener('click', () => root.close());

  // Clicks on the dialog box itself (not its children) land on the backdrop.
  root.addEventListener('click', (event) => {
    if (event.target === root) root.close();
  });

  root.addEventListener('close', () => {
    fab.setAttribute('aria-expanded', 'false');
    if (opener?.isConnected) opener.focus();
    opener = null;
  });

  ready = true;
}

/**
 * Open the chat dialog; focus returns to `trigger` when it closes.
 * @param {HTMLElement | null} [trigger]
 */
export function openChat(trigger = null) {
  setup();
  if (!dialog || dialog.open) return;
  opener = trigger;
  dialog.showModal();
  byId('chat-fab').setAttribute('aria-expanded', 'true');
}
