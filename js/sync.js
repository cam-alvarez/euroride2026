/* =====================================================================
   SYNC — keeps per-user data in step with the crew server (remote mode).

   Strategy: localStorage stays the source the UI reads (fast + offline);
   every write is queued and pushed to the server when there's signal.
   On login the server copy is pulled down and hydrates the local cache.
   Single-owner data → last write wins is fine.
   ===================================================================== */
import { remoteEnabled } from './config.js';
import { api, getToken } from './api.js';
import { store, registerWriteHook, writeUserValueRaw } from './store.js';

const QUEUE_KEY = 'syncq';
let flushing = false;

export function initSync() {
  if (!remoteEnabled()) return;
  registerWriteHook((user, key) => {
    enqueue(user, key);
    flush();
  });
  window.addEventListener('online', flush);
  flush(); // pick up anything left from a previous offline session
}

function getQueue() { return store.get(QUEUE_KEY, []); }
function setQueue(q) { store.set(QUEUE_KEY, q); }

function enqueue(user, key) {
  const q = getQueue();
  if (!q.some(item => item.u === user && item.k === key)) {
    q.push({ u: user, k: key });
    setQueue(q);
  }
}

/** Push queued writes to the server. Safe to call anytime. */
export async function flush() {
  if (!remoteEnabled() || flushing || !navigator.onLine || !getToken()) return;
  flushing = true;
  try {
    let q = getQueue();
    const session = store.get('session', null);
    for (const item of [...q]) {
      if (item.u !== session) {
        // A different user's leftover write — drop it; it re-syncs on their next login.
        q = q.filter(x => x !== item); setQueue(q);
        continue;
      }
      const value = store.get('u.' + item.u + '.' + item.k, null);
      try {
        await api('/api/data/' + encodeURIComponent(item.k), { method: 'PUT', body: { value } });
        q = q.filter(x => !(x.u === item.u && x.k === item.k));
        setQueue(q);
      } catch (e) {
        if (e.code === 'errNetwork') break;       // try again when back online
        if (e.status === 401) break;              // token expired; retry after next login
        q = q.filter(x => !(x.u === item.u && x.k === item.k)); // permanent → drop
        setQueue(q);
      }
    }
  } finally {
    flushing = false;
  }
}

/** Pull the full server copy into the local cache (called after login). */
export async function pullAll(username) {
  const res = await api('/api/data');
  for (const [key, value] of Object.entries(res.data || {})) {
    writeUserValueRaw(username, key, value);
  }
}
