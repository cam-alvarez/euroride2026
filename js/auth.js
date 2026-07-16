/* =====================================================================
   AUTH — username + password rider profiles. No email, ever.

   Two modes, chosen by js/config.js:

   LOCAL (API_BASE = null): profiles live on this device. Passwords are
   never stored — a PBKDF2-SHA-256 hash with a random per-user salt
   gates the UI. Nothing leaves the device.

   REMOTE (API_BASE set): real accounts on the crew server that work on
   any device. The password is stretched CLIENT-side (PBKDF2, 120k
   iterations, salt derived from the username) and only the derived key
   ever crosses the wire; the server stores a salted hash of that key.
   This keeps heavy hashing off the free-tier server without weakening
   the scheme — an attacker with the database still faces the full KDF.
   ===================================================================== */
import { store, wipeUserData } from './store.js';
import { remoteEnabled } from './config.js';
import { api, setToken, clearToken } from './api.js';
import { pullAll, flush } from './sync.js';

const ITERATIONS = 120000;
const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const REMOTE_NAME_KEY = 'remoteName';

/* ---------- helpers ---------- */
const enc = new TextEncoder();

function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function randomSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return toB64(salt.buffer);
}

async function pbkdf2(password, saltBytes) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return toB64(bits);
}

/* local mode: random salt stored per user */
function hashLocal(password, saltB64) {
  return pbkdf2(password, fromB64(saltB64));
}

/* remote mode: deterministic salt from the username, so any device can
   derive the same auth key without a server round-trip */
function deriveAuthKey(username, password) {
  return pbkdf2(password, enc.encode('euroride2026|' + normalize(username)));
}

function normalize(username) {
  return String(username || '').trim().toLowerCase();
}

const RESERVED = new Set(['__proto__', 'constructor', 'prototype']);

export function validUsername(username) {
  const name = String(username || '').trim();
  return /^[\p{L}\p{N}_-]{2,20}$/u.test(name) && !RESERVED.has(name.toLowerCase());
}

/* Users live in a null-prototype object so record lookups can never hit
   inherited properties (e.g. a "constructor" username). */
function getUsers() {
  const raw = store.get(USERS_KEY, {});
  const users = Object.create(null);
  for (const k of Object.keys(raw)) users[k] = raw[k];
  return users;
}
function setUsers(users) { store.set(USERS_KEY, { ...users }); }

/* ---------- public API ---------- */

export function listProfiles() {
  if (remoteEnabled()) return []; // accounts live on the server, not this device
  return Object.values(getUsers())
    .map(u => u.name)
    .sort((a, b) => a.localeCompare(b));
}

export function currentUser() {
  const session = store.get(SESSION_KEY, null);
  if (!session) return null;
  if (remoteEnabled()) return store.get(REMOTE_NAME_KEY, null) || session;
  const rec = getUsers()[normalize(session)];
  return rec ? rec.name : null;
}

export async function register(username, password, invite = '') {
  if (!crypto.subtle) return { ok: false, error: 'errInsecureContext' };
  const name = String(username || '').trim();
  if (!validUsername(name)) return { ok: false, error: 'errUserInvalid' };
  if (String(password || '').length < 8) return { ok: false, error: 'errPwShort' };

  if (remoteEnabled()) {
    try {
      const authKey = await deriveAuthKey(name, password);
      const res = await api('/api/register', { method: 'POST', auth: false, body: { username: name, authKey, invite } });
      setToken(res.token);
      store.set(SESSION_KEY, normalize(name));
      store.set(REMOTE_NAME_KEY, res.username || name);
      flush(); // push any data created before signing in? (queue is per-user, harmless)
      return { ok: true, name: res.username || name };
    } catch (e) {
      return { ok: false, error: e.code || 'errNetwork', detail: e.detail };
    }
  }

  const users = getUsers();
  const key = normalize(name);
  if (users[key]) return { ok: false, error: 'errUserTaken' };

  const salt = randomSalt();
  const hash = await hashLocal(password, salt);
  users[key] = { name, salt, hash, scheme: 'pbkdf2', iterations: ITERATIONS, created: Date.now() };
  setUsers(users);
  store.set(SESSION_KEY, key);
  return { ok: true, name };
}

export async function login(username, password) {
  if (!crypto.subtle) return { ok: false, error: 'errInsecureContext' };

  if (remoteEnabled()) {
    try {
      const authKey = await deriveAuthKey(username, password);
      const res = await api('/api/login', { method: 'POST', auth: false, body: { username: String(username || '').trim(), authKey } });
      setToken(res.token);
      const key = normalize(username);
      store.set(SESSION_KEY, key);
      store.set(REMOTE_NAME_KEY, res.username || String(username).trim());
      try { await pullAll(key); } catch { /* offline-cached data still works */ }
      flush();
      return { ok: true, name: res.username || String(username).trim() };
    } catch (e) {
      return { ok: false, error: e.code || 'errNetwork', detail: e.detail };
    }
  }

  const users = getUsers();
  const rec = users[normalize(username)];
  if (!rec) return { ok: false, error: 'errLogin' };
  const hash = await hashLocal(password, rec.salt);
  if (hash !== rec.hash) return { ok: false, error: 'errLogin' };
  store.set(SESSION_KEY, normalize(username));
  return { ok: true, name: rec.name };
}

export function logout() {
  if (remoteEnabled()) {
    const session = store.get(SESSION_KEY, null);
    api('/api/logout', { method: 'POST' }).catch(() => {});
    clearToken();
    store.remove(REMOTE_NAME_KEY);
    if (session) wipeUserData(session); // shared-device privacy; server keeps the truth
  }
  store.remove(SESSION_KEY);
}

export async function deleteProfile(username, password) {
  if (remoteEnabled()) {
    try {
      const authKey = await deriveAuthKey(username, password);
      await api('/api/account', { method: 'DELETE', body: { authKey } });
      clearToken();
      store.remove(REMOTE_NAME_KEY);
      wipeUserData(username);
      store.remove(SESSION_KEY);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.code || 'errNetwork', detail: e.detail };
    }
  }

  const res = await login(username, password); // re-verify before destructive action
  if (!res.ok) return res;
  const users = getUsers();
  delete users[normalize(username)];
  setUsers(users);
  wipeUserData(username);
  store.remove(SESSION_KEY);
  return { ok: true };
}
