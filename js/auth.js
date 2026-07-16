/* =====================================================================
   AUTH — username + password rider profiles. No email, no server.

   Passwords are never stored: we keep a PBKDF2-SHA-256 hash with a
   random per-user salt (WebCrypto). Data itself stays on the device;
   the password separates profiles on a shared phone and deters casual
   snooping — it is NOT bank-grade security, and the UI says so.

   Swapping this file + store.js for a real backend enables cross-device
   sync — see docs/ACCOUNTS-AND-SYNC.md for the recommended path.
   ===================================================================== */
import { store, wipeUserData } from './store.js';

const ITERATIONS = 120000;
const USERS_KEY = 'users';
const SESSION_KEY = 'session';

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

/* PBKDF2 via WebCrypto. Needs a secure context (https or localhost) —
   register/login refuse elsewhere rather than fall back to weak hashing. */
async function hashPassword(password, saltB64) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromB64(saltB64), iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return toB64(bits);
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
  return Object.values(getUsers())
    .map(u => u.name)
    .sort((a, b) => a.localeCompare(b));
}

export function currentUser() {
  const session = store.get(SESSION_KEY, null);
  if (!session) return null;
  const rec = getUsers()[normalize(session)];
  return rec ? rec.name : null;
}

export async function register(username, password) {
  if (!crypto.subtle) return { ok: false, error: 'errInsecureContext' };
  const name = String(username || '').trim();
  if (!validUsername(name)) return { ok: false, error: 'errUserInvalid' };
  if (String(password || '').length < 4) return { ok: false, error: 'errPwShort' };
  const users = getUsers();
  const key = normalize(name);
  if (users[key]) return { ok: false, error: 'errUserTaken' };

  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  users[key] = { name, salt, hash, scheme: 'pbkdf2', iterations: ITERATIONS, created: Date.now() };
  setUsers(users);
  store.set(SESSION_KEY, key);
  return { ok: true, name };
}

export async function login(username, password) {
  if (!crypto.subtle) return { ok: false, error: 'errInsecureContext' };
  const users = getUsers();
  const rec = users[normalize(username)];
  if (!rec) return { ok: false, error: 'errLogin' };
  const hash = await hashPassword(password, rec.salt);
  if (hash !== rec.hash) return { ok: false, error: 'errLogin' };
  store.set(SESSION_KEY, normalize(username));
  return { ok: true, name: rec.name };
}

export function logout() {
  store.remove(SESSION_KEY);
}

export async function deleteProfile(username, password) {
  const res = await login(username, password); // re-verify before destructive action
  if (!res.ok) return res;
  const users = getUsers();
  delete users[normalize(username)];
  setUsers(users);
  wipeUserData(username);
  store.remove(SESSION_KEY);
  return { ok: true };
}
