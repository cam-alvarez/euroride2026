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
let rerun = false; // a write landed while a flush was in-flight

export function initSync() {
  if (!remoteEnabled()) return;
  registerWriteHook((user, key, _value, del) => {
    enqueue(user, key, del);
    flush();
  });
  window.addEventListener('online', flush);
  flush(); // pick up anything left from a previous offline session
}

function getQueue() { return store.get(QUEUE_KEY, []); }
function setQueue(q) { store.set(QUEUE_KEY, q); }

let seq = 0;
const stamp = () => Date.now().toString(36) + '.' + (seq++);

function enqueue(user, key, del) {
  /* latest op per key wins: a set after a pending delete (or vice versa)
     replaces it, so the server always converges on the newest intent.
     Each item carries a unique stamp so flush can drop exactly the item
     it processed — never a newer one enqueued for the same key. */
  const q = getQueue().filter(item => !(item.u === user && item.k === key));
  q.push(del ? { u: user, k: key, s: stamp(), d: 1 } : { u: user, k: key, s: stamp() });
  setQueue(q);
}

/* Every queue mutation re-reads localStorage first: flush must never hold
   a stale copy, or it would clobber items enqueued while a request was
   in flight (that exact bug ate deletions once). */
const dropItem = item => setQueue(getQueue().filter(x => x.s !== item.s));

/** Push queued writes to the server. Safe to call anytime. Writes that
    arrive while a flush is running are picked up by a follow-up pass —
    without this they would idle in the queue until the next write. */
export async function flush() {
  if (!remoteEnabled() || !navigator.onLine || !getToken()) return;
  if (flushing) { rerun = true; return; }
  flushing = true;
  try {
    /* items persisted by an older app version have no stamp — give them one */
    const q0 = getQueue();
    if (q0.some(i => !i.s)) setQueue(q0.map(i => (i.s ? i : { ...i, s: stamp() })));

    let halted = false;
    do {
      rerun = false;
      const session = store.get('session', null);
      for (const item of getQueue()) {
        if (item.u !== session) {
          // A different user's leftover write — drop it; it re-syncs on their next login.
          dropItem(item);
          continue;
        }
        try {
          if (item.d) {
            await api('/api/data/' + encodeURIComponent(item.k), { method: 'DELETE' });
          } else {
            const value = store.get('u.' + item.u + '.' + item.k, null);
            await api('/api/data/' + encodeURIComponent(item.k), { method: 'PUT', body: { value } });
          }
          dropItem(item);
        } catch (e) {
          if (e.code === 'errNetwork' || e.status >= 500 || e.status === 401) {
            halted = true; break; // retryable — keep the queue, stop this round
          }
          dropItem(item); // permanent → drop
        }
      }
    } while (!halted && (rerun || getQueue().length));
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
