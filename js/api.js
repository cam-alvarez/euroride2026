/* =====================================================================
   API — tiny fetch client for the crew server (Cloudflare Worker).
   Only used when config.js has API_BASE set. Every error is normalized
   to { code } where code is an i18n key suffix (profile.errX / chat.errX).
   ===================================================================== */
import { API_BASE } from './config.js';
import { store } from './store.js';

const TOKEN_KEY = 'apiToken';

export function getToken() { return store.get(TOKEN_KEY, null); }
export function setToken(token) { store.set(TOKEN_KEY, token); }
export function clearToken() { store.remove(TOKEN_KEY); }

/* server error string → i18n key suffix */
const ERROR_MAP = {
  user_taken: 'errUserTaken',
  invalid_username: 'errUserInvalid',
  weak_password: 'errPwShort',
  bad_credentials: 'errLogin',
  bad_invite: 'errInvite',
  unauthorized: 'errSession',
  rate_limited: 'errRateLimit'
};

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'content-type': 'application/json' };
  const token = auth ? getToken() : null;
  if (token) headers.authorization = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method, headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    const err = new Error('network'); err.code = 'errNetwork'; throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || String(res.status));
    err.code = ERROR_MAP[data.error] || 'errNetwork';
    err.status = res.status;
    err.detail = data.message;
    throw err;
  }
  return data;
}
