/* =====================================================================
   CHAT — the trip assistant. Talks to the crew server's /api/chat,
   which proxies to the Claude API with the whole itinerary as context.

   Three gated states before the real UI:
     1. crew server not configured  → setup explainer
     2. not signed in               → sign-in gate (assistant is crew-only)
     3. offline                     → needs-signal note (banner also shows)

   Conversations: each rider keeps up to MAX_CONVS named threads.
     chats.index          → [{ id, title, created, updated, n }]
     chat.<id>            → that thread's messages (last MAX_STORED)
   Both sync to the crew server per key, so conversations follow the
   rider across devices; deleting one deletes it on the server too.
   The "which thread am I looking at" pointer stays device-local.

   Routes:  #/chat → active thread   ·   #/chat/all → conversation list
   ===================================================================== */
import { remoteEnabled } from '../config.js';
import { api } from '../api.js';
import { tr, getLang } from '../i18n.js';
import { esc, icons } from '../ui.js';
import { md } from '../markdown.js';
import { currentUser } from '../auth.js';
import { store, userStore } from '../store.js';
import { openPlanEditor, detectDay } from '../plan-editor.js';

const MAX_STORED = 30;   // messages kept per conversation
const MAX_SENT = 12;     // recent messages sent to the model
const MAX_CONVS = 20;    // threads per rider (server allows 64 keys total)
const PREFILL_KEY = 'er26.chatPrefill'; // set by day pages ("ask about this day")
let pending = false;

export function renderChat(view, param) {
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

  migrateLegacy(user);
  if (param === 'all') renderList(zone, user);
  else renderThread(zone, user);
}

/* ---------- conversation storage ---------- */
const getIndex = user => userStore(user).get('chats.index', []);
const setIndex = (user, idx) => userStore(user).set('chats.index', idx);
const getMsgs = (user, id) => userStore(user).get('chat.' + id, []);
const setMsgs = (user, id, msgs) => userStore(user).set('chat.' + id, msgs.slice(-MAX_STORED));

const activePtrKey = user => 'chatActive.' + user.toLowerCase();

/* the thread to show: explicit choice if valid, 'new' = fresh empty
   thread, otherwise the most recently touched conversation */
function activeConv(user) {
  const ptr = store.get(activePtrKey(user), null);
  if (ptr === 'new') return null;
  const idx = getIndex(user);
  if (ptr && idx.some(c => c.id === ptr)) return ptr;
  return idx.length ? [...idx].sort((a, b) => b.updated - a.updated)[0].id : null;
}
const setActive = (user, id) => store.set(activePtrKey(user), id);

function createConv(user, firstText) {
  const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const idx = getIndex(user);
  idx.push({
    id,
    title: String(firstText || tr('chat.untitled')).slice(0, 60),
    created: Date.now(), updated: Date.now(), n: 0
  });
  setIndex(user, idx);
  setActive(user, id);
  return id;
}

function touchConv(user, id, n) {
  const idx = getIndex(user);
  const c = idx.find(x => x.id === id);
  if (c) { c.updated = Date.now(); c.n = n; setIndex(user, idx); }
}

function deleteConv(user, id) {
  setIndex(user, getIndex(user).filter(c => c.id !== id));
  userStore(user).remove('chat.' + id); // synced delete — frees the server key
  if (store.get(activePtrKey(user), null) === id) store.remove(activePtrKey(user));
}

/* one-time: fold the pre-conversations single history into a thread */
function migrateLegacy(user) {
  const us = userStore(user);
  const legacy = us.get('chat', []);
  if (!Array.isArray(legacy) || !legacy.length) return;
  if (!getIndex(user).length) {
    const first = legacy.find(m => m.role === 'user');
    const id = createConv(user, first?.content);
    setMsgs(user, id, legacy);
    touchConv(user, id, legacy.length);
  }
  us.remove('chat'); // migrated elsewhere already, or just now — either way retire it
}

/* ---------- conversation list (#/chat/all) ---------- */
function renderList(zone, user) {
  const idx = [...getIndex(user)].sort((a, b) => b.updated - a.updated);
  const dateFmt = ts => new Date(ts).toLocaleDateString(
    getLang() === 'es' ? 'es' : 'en', { month: 'short', day: 'numeric' });

  zone.innerHTML = `
    <div class="chat-bar">
      <a class="chat-bar-btn" href="#/chat">${icons.back} ${esc(tr('chat.title'))}</a>
      <div class="chat-bar-title">${esc(tr('chat.convs'))}</div>
      <button class="chat-bar-btn" id="conv-new">+ ${esc(tr('chat.newConv'))}</button>
    </div>
    ${idx.length ? idx.map(c => `
      <div class="card conv-row">
        <button class="conv-open" data-open="${esc(c.id)}">
          <span class="conv-title">${esc(c.title)}</span>
          <span class="conv-sub">${esc(dateFmt(c.updated))} · ${c.n} ${esc(tr('chat.msgs'))}</span>
        </button>
        <button class="conv-act" data-rename="${esc(c.id)}" aria-label="${esc(tr('chat.renameQ'))}">✎</button>
        <button class="conv-act conv-del" data-del="${esc(c.id)}" aria-label="${esc(tr('common.delete'))}">${icons.trash}</button>
      </div>`).join('')
    : `<div class="empty">${esc(tr('chat.noConvs'))}</div>`}`;

  zone.querySelector('#conv-new').addEventListener('click', () => {
    if (getIndex(user).length >= MAX_CONVS) { alert(tr('chat.convLimit')); return; }
    setActive(user, 'new');
    location.hash = '#/chat';
  });

  zone.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    setActive(user, b.dataset.open);
    location.hash = '#/chat';
  }));

  zone.querySelectorAll('[data-rename]').forEach(b => b.addEventListener('click', () => {
    const idx2 = getIndex(user);
    const c = idx2.find(x => x.id === b.dataset.rename);
    if (!c) return;
    const name = prompt(tr('chat.renameQ'), c.title);
    if (name === null) return;
    c.title = name.trim().slice(0, 60) || c.title;
    setIndex(user, idx2);
    renderList(zone, user);
  }));

  zone.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (!confirm(tr('common.confirmDelete'))) return;
    deleteConv(user, b.dataset.del);
    renderList(zone, user);
  }));
}

/* ---------- active thread (#/chat) ---------- */
function presetsHTML() {
  const qs = [tr('chat.preset1'), tr('chat.preset2'), tr('chat.preset3'), tr('chat.preset4')];
  return `
    <div class="empty">${esc(tr('chat.empty'))}</div>
    <div class="chat-presets" aria-label="${esc(tr('chat.tryAsking'))}">
      ${qs.map(q => `<button type="button" class="chat-preset" data-q="${esc(q)}">${esc(q)}</button>`).join('')}
    </div>`;
}

function renderThread(zone, user) {
  const convId = activeConv(user);
  const conv = getIndex(user).find(c => c.id === convId) || null;
  const history = conv ? getMsgs(user, conv.id) : [];
  const total = getIndex(user).length;

  zone.innerHTML = `
    <div class="chat-bar">
      <a class="chat-bar-btn" href="#/chat/all">${icons.back} ${esc(tr('chat.allChats'))}${total ? ` (${total})` : ''}</a>
      <div class="chat-bar-title">${esc(conv ? conv.title : tr('chat.untitled'))}</div>
      <button class="chat-bar-btn" id="chat-new" ${conv ? '' : 'disabled'}>+ ${esc(tr('chat.newConv'))}</button>
    </div>
    <div class="chat-thread" id="chat-thread" aria-live="polite">
      ${history.length ? history.map(bubbleHTML).join('') : presetsHTML()}
      ${pending ? typingHTML() : ''}
    </div>
    <form class="chat-form" id="chat-form">
      <input type="text" id="chat-input" maxlength="1000" autocomplete="off"
        placeholder="${esc(tr('chat.placeholder'))}" ${pending ? 'disabled' : ''}>
      <button class="btn" type="submit" aria-label="${esc(tr('chat.send'))}" ${pending ? 'disabled' : ''}>${icons.send}</button>
    </form>
    <div class="chat-foot">
      <span>${esc(tr('chat.disclaimer'))}</span>
      ${conv ? `<button class="chat-clear" id="chat-del">${esc(tr('chat.deleteConv'))}</button>` : ''}
    </div>`;

  const thread = zone.querySelector('#chat-thread');
  thread.scrollTop = thread.scrollHeight;

  async function send(text) {
    if (pending || !text) return;

    /* find-or-create the thread this message belongs to */
    let id = activeConv(user);
    if (!id) {
      if (getIndex(user).length >= MAX_CONVS) { alert(tr('chat.convLimit')); return; }
      id = createConv(user, text);
    }

    const push = msg => {
      const msgs = getMsgs(user, id);
      msgs.push(msg);
      setMsgs(user, id, msgs);
      touchConv(user, id, Math.min(msgs.length, MAX_STORED));
    };

    if (!navigator.onLine) {
      push({ role: 'note', content: tr('chat.offline') });
      renderThread(zone, user);
      return;
    }

    push({ role: 'user', content: text });
    pending = true;
    renderThread(zone, user);

    try {
      const payload = getMsgs(user, id)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-MAX_SENT)
        .map(m => ({ role: m.role, content: m.content }));
      const res = await api('/api/chat', { method: 'POST', body: { messages: payload, lang: getLang() } });
      push({ role: 'assistant', content: String(res.reply || '').trim() || tr('chat.errGeneric') });
    } catch (err) {
      /* err.status set → the server answered (show its reason, not "no signal");
         no status → the request never got through (offline / blocked) */
      const msg = err.code === 'errRateLimit' ? tr('chat.errRateLimit')
        : err.status ? (err.detail || tr('chat.errGeneric'))
        : tr('chat.offline');
      push({ role: 'note', content: msg });
    } finally {
      pending = false;
      renderThread(zone, user);
    }
  }

  zone.querySelector('#chat-form').addEventListener('submit', e => {
    e.preventDefault();
    send(zone.querySelector('#chat-input').value.trim());
  });

  zone.querySelectorAll('.chat-preset').forEach(btn => {
    btn.addEventListener('click', () => send(btn.dataset.q));
  });

  zone.querySelector('#chat-new')?.addEventListener('click', () => {
    if (pending) return;
    setActive(user, 'new');
    renderThread(zone, user);
  });

  zone.querySelector('#chat-del')?.addEventListener('click', () => {
    if (!confirm(tr('common.confirmDelete'))) return;
    deleteConv(user, conv.id);
    setActive(user, 'new');
    renderThread(zone, user);
  });

  /* "+" on a list item in an assistant reply → save that option as a plan */
  thread.addEventListener('click', e => {
    const btn = e.target.closest('.li-save');
    if (!btn) return;
    const item = btn.closest('li');
    const title = (item.querySelector('.li-text')?.textContent || '').trim().slice(0, 120);
    if (!title) return;
    const link = item.querySelector('a[href^="http"]')?.href || null;
    const bubbleText = btn.closest('.chat-bubble')?.textContent || '';
    openPlanEditor(user, {
      defaults: {
        title,
        link,
        day: detectDay(title, bubbleText, conv?.title)
      }
    });
  });

  if (!pending) {
    const input = zone.querySelector('#chat-input');
    /* a day page may have queued an "ask about this day" starter */
    const prefill = sessionStorage.getItem(PREFILL_KEY);
    if (prefill) {
      sessionStorage.removeItem(PREFILL_KEY);
      input.value = prefill;
      input.setSelectionRange(input.value.length, input.value.length);
    }
    input?.focus();
  }
}

/* ---------- bubbles ---------- */
function bubbleHTML(message) {
  if (message.role === 'note') {
    return `<div class="chat-note">${esc(message.content)}</div>`;
  }
  if (message.role === 'user') {
    return `<div class="chat-bubble chat-me">${esc(message.content)}</div>`;
  }
  /* assistant replies arrive as Markdown → render the safe subset;
     list items get a "+" so any suggested option can become a plan */
  return `<div class="chat-bubble chat-bot chat-md">${md(message.content, { saveLabel: tr('chat.addPlan') })}</div>`;
}

function typingHTML() {
  return `<div class="chat-bubble chat-bot chat-typing" aria-label="${esc(tr('chat.thinking'))}">
    <span></span><span></span><span></span>
  </div>`;
}
