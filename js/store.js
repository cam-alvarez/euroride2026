/* =====================================================================
   STORE — one thin layer over localStorage.
   Everything the app persists goes through here, namespaced under
   "er26.". Per-user data is namespaced again under "er26.u.<name>.".

   This indirection is deliberate: to add cross-device sync later
   (Supabase, Cloudflare Workers, …) only this file and auth.js need
   to change — see docs/ACCOUNTS-AND-SYNC.md.
   ===================================================================== */

const NS = 'er26.';

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); return true; } catch { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* private mode etc. */ }
}

export const store = {
  get(key, fallback = null) {
    const raw = safeGet(NS + key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) {
    return safeSet(NS + key, JSON.stringify(value));
  },
  remove(key) {
    safeRemove(NS + key);
  }
};

/* Optional write hook: the sync layer registers itself here so every
   per-user write can be pushed to the crew server when one is configured.
   The hook must never throw into the caller. */
let writeHook = null;
export function registerWriteHook(fn) { writeHook = fn; }

/** Scoped store for one user's data. */
export function userStore(username) {
  const user = username.toLowerCase();
  const prefix = 'u.' + user + '.';
  return {
    get: (key, fallback = null) => store.get(prefix + key, fallback),
    set: (key, value) => {
      const ok = store.set(prefix + key, value);
      if (writeHook) { try { writeHook(user, key, value); } catch { /* sync must not break the UI */ } }
      return ok;
    },
    remove: (key) => {
      store.remove(prefix + key);
      /* removals sync too (del flag) — otherwise deleted conversations
         would resurrect from the server on the next login */
      if (writeHook) { try { writeHook(user, key, undefined, true); } catch { /* ditto */ } }
    }
  };
}

/** Write a user value WITHOUT triggering the sync hook (used by the sync
    layer itself when hydrating from the server). */
export function writeUserValueRaw(username, key, value) {
  store.set('u.' + username.toLowerCase() + '.' + key, value);
}

/** All localStorage keys belonging to one user (for export / delete). */
export function userKeys(username) {
  const prefix = NS + 'u.' + username.toLowerCase() + '.';
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
  } catch { /* ignore */ }
  return keys;
}

/** Export every stored value for one user as a plain object. */
export function exportUserData(username) {
  const prefix = NS + 'u.' + username.toLowerCase() + '.';
  const out = {};
  for (const k of userKeys(username)) {
    try { out[k.slice(prefix.length)] = JSON.parse(safeGet(k)); } catch { /* skip */ }
  }
  return out;
}

/** Remove every stored value for one user. */
export function wipeUserData(username) {
  for (const k of userKeys(username)) safeRemove(k);
}
