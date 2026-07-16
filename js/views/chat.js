/* =====================================================================
   CHAT — the trip assistant. Talks to the crew server's /api/chat,
   which proxies to the Claude API with the whole itinerary as context.

   Three gated states before the real UI:
     1. crew server not configured  → setup explainer
     2. not signed in               → sign-in gate (assistant is crew-only)
     3. offline                     → needs-signal note (banner also shows)

   History is kept per rider on the device (last 40 messages) so the
   conversation survives tab switches and reloads.
   ===================================================================== */
import { remoteEnabled } from '../config.js';
import { api } from '../api.js';
import { tr } from '../i18n.js';
import { esc, icons } from '../ui.js';
import { currentUser } from '../auth.js';
import { userStore } from '../store.js';

const MAX_STORED = 40;   // messages kept on device
const MAX_SENT = 12;     // recent messages sent to the model
let pending = false;

export function renderChat(view) {
  const user = currentUser();

  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('chat.title'))}</h1>
      <p class="view-sub">${esc(tr('chat.sub'))}</p>
    </div>
    <div id="chat-zone"></div>`;

  const zone = view.querySelector('#chat-zone');

  if (!remoteEnabled()) {
    zone.innerHTML = `
      <div class="card gate">
        <div class="gate-icon" aria-hidden="true">🤖</div>
        <p>${esc(tr('chat.needsSetup'))}</p>
      </div>`;
    return;
  }

  if (!user) {
    zone.innerHTML = `
      <div class="card gate">
        <div class="gate-icon" aria-hidden="true">🤖</div>
        <p>${esc(tr('chat.needsSignIn'))}</p>
        <a class="btn" href="#/profile">${icons.user} ${esc(tr('common.signIn'))}</a>
      </div>`;
    return;
  }

  renderThread(zone, user);
}

function getHistory(user) { return userStore(user).get('chat', []); }
function setHistory(user, messages) { userStore(user).set('chat', messages.slice(-MAX_STORED)); }

function renderThread(zone, user) {
  const history = getHistory(user);

  zone.innerHTML = `
    <div class="chat-thread" id="chat-thread" aria-live="polite">
      ${history.length
        ? history.map(bubbleHTML).join('')
        : `<div class="empty">${esc(tr('chat.empty'))}</div>`}
      ${pending ? typingHTML() : ''}
    </div>
    <form class="chat-form" id="chat-form">
      <input type="text" id="chat-input" maxlength="1000" autocomplete="off"
        placeholder="${esc(tr('chat.placeholder'))}" ${pending ? 'disabled' : ''}>
      <button class="btn" type="submit" aria-label="${esc(tr('chat.send'))}" ${pending ? 'disabled' : ''}>${icons.send}</button>
    </form>
    <div class="chat-foot">
      <span>${esc(tr('chat.disclaimer'))}</span>
      ${history.length ? `<button class="chat-clear" id="chat-clear">${esc(tr('chat.clear'))}</button>` : ''}
    </div>`;

  const thread = zone.querySelector('#chat-thread');
  thread.scrollTop = thread.scrollHeight;

  zone.querySelector('#chat-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (pending) return;
    const input = zone.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text) return;

    if (!navigator.onLine) {
      appendSystemNote(zone, user, tr('chat.offline'));
      return;
    }

    const history2 = getHistory(user);
    history2.push({ role: 'user', content: text });
    setHistory(user, history2);
    pending = true;
    renderThread(zone, user);

    try {
      const payload = getHistory(user)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-MAX_SENT)
        .map(m => ({ role: m.role, content: m.content }));
      const res = await api('/api/chat', { method: 'POST', body: { messages: payload } });
      const h = getHistory(user);
      h.push({ role: 'assistant', content: String(res.reply || '').trim() || tr('chat.errGeneric') });
      setHistory(user, h);
    } catch (err) {
      const h = getHistory(user);
      const msg = err.code === 'errRateLimit' ? tr('chat.errRateLimit')
        : err.code === 'errNetwork' ? tr('chat.offline')
        : tr('chat.errGeneric');
      h.push({ role: 'note', content: msg });
      setHistory(user, h);
    } finally {
      pending = false;
      renderThread(zone, user);
    }
  });

  zone.querySelector('#chat-clear')?.addEventListener('click', () => {
    if (!confirm(tr('common.confirmDelete'))) return;
    setHistory(user, []);
    renderThread(zone, user);
  });

  if (!pending) zone.querySelector('#chat-input')?.focus();
}

function appendSystemNote(zone, user, text) {
  const h = getHistory(user);
  h.push({ role: 'note', content: text });
  setHistory(user, h);
  renderThread(zone, user);
}

function bubbleHTML(message) {
  if (message.role === 'note') {
    return `<div class="chat-note">${esc(message.content)}</div>`;
  }
  const who = message.role === 'user' ? 'me' : 'bot';
  return `<div class="chat-bubble chat-${who}">${esc(message.content)}</div>`;
}

function typingHTML() {
  return `<div class="chat-bubble chat-bot chat-typing" aria-label="${esc(tr('chat.thinking'))}">
    <span></span><span></span><span></span>
  </div>`;
}
