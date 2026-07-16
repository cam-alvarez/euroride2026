/* =====================================================================
   EURORIDE 2026 — crew server (Cloudflare Worker + D1)

   Provides, on the free tier:
     POST   /api/register      { username, authKey } → { token, username }
     POST   /api/login         { username, authKey } → { token, username }
     POST   /api/logout        (Bearer)
     GET    /api/me            (Bearer) → { username }
     GET    /api/data          (Bearer) → { data: { key: value } }
     PUT    /api/data/:key     (Bearer) { value }
     DELETE /api/account       (Bearer) { authKey }
     POST   /api/chat          (Bearer) { messages } → { reply }

   Security model: the client stretches the password (PBKDF2 120k) and
   sends only the derived key over HTTPS; we store SHA-256(salt||key).
   Sessions are opaque random tokens, stored hashed. No email anywhere.

   Deploy guide: ../docs/DEPLOY-SERVER.md
   ===================================================================== */
import Anthropic from '@anthropic-ai/sdk';
import { TRIP_CONTEXT } from './context.js';

const enc = new TextEncoder();
const USERNAME_RE = /^[\p{L}\p{N}_-]{2,20}$/u;
const RESERVED = new Set(['__proto__', 'constructor', 'prototype']);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 90; // 90 days
const MAX_DATA_KEYS = 64;
const MAX_VALUE_BYTES = 32 * 1024;

const SYSTEM_PROMPT = `You are the trip assistant for Euroride 2026, an 11-day Harley-Davidson group
ride through the Alps organized by the Muñecos crew. Answer questions from the riders using the trip
facts below. Be concise, warm, and practical — you are talking to riders planning their days, often
on a phone. Reply in the same language the rider writes in (the crew speaks Spanish and English).
If a question is about something not covered in the trip facts (like live weather, current prices, or
personal bookings), say so honestly and point to what IS in the plan. For anything safety-critical,
remind riders to double-check on the ground. Do not invent facts, dates, or prices that are not in
the trip facts.

Formatting: the app renders simple Markdown only. Use short paragraphs, **bold** for key names or
numbers, and dash bullet lists. Never use tables, images, or nested lists. Keep answers compact —
phone screens.

TRIP FACTS:
${TRIP_CONTEXT}`;

/* ---------- small helpers ---------- */
async function sha256hex(str) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function normalize(username) {
  return String(username || '').trim().toLowerCase();
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Max-Age': '86400'
  };
  if (allowed.includes(origin) || allowed.includes('*')) {
    headers['Access-Control-Allow-Origin'] = allowed.includes('*') ? '*' : origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors }
  });
}

async function readBody(request, maxBytes) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* generic counter-based rate limit; returns the new count */
async function bumpCounter(db, bucket) {
  const row = await db.prepare(
    `INSERT INTO counters (bucket, count) VALUES (?, 1)
     ON CONFLICT(bucket) DO UPDATE SET count = count + 1
     RETURNING count`
  ).bind(bucket).first();
  return row ? row.count : 1;
}

async function authenticate(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token.length < 32) return null;
  const tokenHash = await sha256hex(token);
  const row = await env.DB.prepare(
    'SELECT username, created_at FROM sessions WHERE token_hash = ?'
  ).bind(tokenHash).first();
  if (!row) return null;
  if (Date.now() - row.created_at > SESSION_TTL_MS) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }
  return { username: row.username, tokenHash };
}

async function issueToken(db, username) {
  const token = randomHex(32);
  const tokenHash = await sha256hex(token);
  const now = Date.now();
  await db.prepare(
    'INSERT INTO sessions (token_hash, username, created_at, last_used) VALUES (?, ?, ?, ?)'
  ).bind(tokenHash, username, now, now).run();
  return token;
}

/* ---------- route handlers ---------- */

async function handleRegister(request, env, cors) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const minute = Math.floor(Date.now() / 60000);
  if (await bumpCounter(env.DB, `reg:${ip}:${minute}`) > 10) {
    return json({ error: 'rate_limited' }, 429, cors);
  }

  const body = await readBody(request, 4096);
  if (!body) return json({ error: 'bad_request' }, 400, cors);

  /* invite gate: when the INVITE_CODE secret is set, only people who know
     the crew's code can create an account (protects the chat budget) */
  if (env.INVITE_CODE) {
    if (!safeEqual(String(body.invite || ''), String(env.INVITE_CODE))) {
      return json({ error: 'bad_invite' }, 403, cors);
    }
  }

  const name = String(body.username || '').trim();
  const authKey = String(body.authKey || '');
  const key = normalize(name);
  if (!USERNAME_RE.test(name) || RESERVED.has(key)) return json({ error: 'invalid_username' }, 400, cors);
  if (authKey.length < 32 || authKey.length > 128) return json({ error: 'weak_password' }, 400, cors);

  const salt = randomHex(16);
  const keyHash = await sha256hex(salt + '|' + authKey);
  try {
    await env.DB.prepare(
      'INSERT INTO users (username, display_name, salt, key_hash, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(key, name, salt, keyHash, Date.now()).run();
  } catch {
    return json({ error: 'user_taken' }, 409, cors);
  }
  const token = await issueToken(env.DB, key);
  return json({ token, username: name }, 200, cors);
}

async function handleLogin(request, env, cors) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const minute = Math.floor(Date.now() / 60000);
  if (await bumpCounter(env.DB, `login:${ip}:${minute}`) > 20) {
    return json({ error: 'rate_limited' }, 429, cors);
  }

  const body = await readBody(request, 4096);
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  const key = normalize(body.username);
  const authKey = String(body.authKey || '');

  const user = await env.DB.prepare(
    'SELECT username, display_name, salt, key_hash FROM users WHERE username = ?'
  ).bind(key).first();
  if (!user) return json({ error: 'bad_credentials' }, 401, cors);

  const keyHash = await sha256hex(user.salt + '|' + authKey);
  if (!safeEqual(keyHash, user.key_hash)) return json({ error: 'bad_credentials' }, 401, cors);

  const token = await issueToken(env.DB, key);
  return json({ token, username: user.display_name }, 200, cors);
}

async function handleLogout(session, env, cors) {
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();
  return json({ ok: true }, 200, cors);
}

async function handleGetData(session, env, cors) {
  const rows = await env.DB.prepare(
    'SELECT key, value FROM user_data WHERE username = ?'
  ).bind(session.username).all();
  const data = {};
  for (const row of rows.results || []) {
    try { data[row.key] = JSON.parse(row.value); } catch { /* skip corrupt row */ }
  }
  return json({ data }, 200, cors);
}

async function handlePutData(request, session, env, cors, key) {
  if (!key || key.length > 64 || !/^[\w.-]+$/.test(key)) return json({ error: 'bad_request' }, 400, cors);
  const body = await readBody(request, MAX_VALUE_BYTES + 1024);
  if (!body || !('value' in body)) return json({ error: 'bad_request' }, 400, cors);
  const value = JSON.stringify(body.value);
  if (value.length > MAX_VALUE_BYTES) return json({ error: 'bad_request' }, 400, cors);

  const count = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM user_data WHERE username = ?'
  ).bind(session.username).first();
  if ((count?.n || 0) >= MAX_DATA_KEYS) {
    const exists = await env.DB.prepare(
      'SELECT 1 FROM user_data WHERE username = ? AND key = ?'
    ).bind(session.username, key).first();
    if (!exists) return json({ error: 'bad_request', message: 'too many keys' }, 400, cors);
  }

  await env.DB.prepare(
    `INSERT INTO user_data (username, key, value, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(username, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(session.username, key, value, Date.now()).run();
  return json({ ok: true }, 200, cors);
}

async function handleDeleteData(session, env, cors, key) {
  if (!key || key.length > 64 || !/^[\w.-]+$/.test(key)) return json({ error: 'bad_request' }, 400, cors);
  await env.DB.prepare(
    'DELETE FROM user_data WHERE username = ? AND key = ?'
  ).bind(session.username, key).run();
  return json({ ok: true }, 200, cors);
}

async function handleDeleteAccount(request, session, env, cors) {
  const body = await readBody(request, 4096);
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  const user = await env.DB.prepare(
    'SELECT salt, key_hash FROM users WHERE username = ?'
  ).bind(session.username).first();
  if (!user) return json({ error: 'bad_credentials' }, 401, cors);
  const keyHash = await sha256hex(user.salt + '|' + String(body.authKey || ''));
  if (!safeEqual(keyHash, user.key_hash)) return json({ error: 'bad_credentials' }, 401, cors);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM user_data WHERE username = ?').bind(session.username),
    env.DB.prepare('DELETE FROM sessions WHERE username = ?').bind(session.username),
    env.DB.prepare('DELETE FROM users WHERE username = ?').bind(session.username)
  ]);
  return json({ ok: true }, 200, cors);
}

async function handleChat(request, session, env, cors) {
  const day = new Date().toISOString().slice(0, 10);
  const limit = Number(env.CHAT_DAILY_LIMIT || 40);
  if (await bumpCounter(env.DB, `chat:${session.username}:${day}`) > limit) {
    return json({ error: 'rate_limited' }, 429, cors);
  }

  const body = await readBody(request, 64 * 1024);
  if (!body || !Array.isArray(body.messages)) return json({ error: 'bad_request' }, 400, cors);

  /* sanitize: only user/assistant string messages, cap count & length,
     must start with a user message */
  let messages = body.messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length) return json({ error: 'bad_request' }, 400, cors);

  if (env.DEV_FAKE_CHAT === '1') {
    return json({ reply: '[dev] The assistant is wired up! Last question: ' + messages[messages.length - 1].content }, 200, cors);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'bad_request', message: 'chat not configured: missing ANTHROPIC_API_KEY secret' }, 500, cors);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.CHAT_MODEL || 'claude-opus-4-8';
  /* one language per reply — the model was seen mixing EN/ES because the
     crew is bilingual. The app sends its UI language as the tiebreaker. */
  const appLang = body.lang === 'es' ? 'Spanish' : 'English';
  const langNote = `Write your ENTIRE reply in one language — the language of the rider's most ` +
    `recent message. Never mix English and Spanish in a reply. If the message could be either ` +
    `(a name, a number, an emoji), use ${appLang}, the language the rider's app is set to.`;
  // adaptive thinking exists on Opus 4.6+/Sonnet 4.6+/Sonnet 5/Fable 5 —
  // older tiers (e.g. Haiku 4.5) reject the parameter, so send it only
  // where it is supported
  const supportsAdaptiveThinking = /opus-4-[6-9]|sonnet-4-[6-9]|sonnet-5|fable|mythos/.test(model);
  let response;
  try {
    response = await client.messages.create({
      model,
      max_tokens: 1024, // deliberate cost cap: trip answers are short
      ...(supportsAdaptiveThinking ? { thinking: { type: 'adaptive' } } : {}),
      system: [
        // the big trip context is identical on every call → prompt caching
        // makes repeat questions cost ~10% of the first one
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        // varies per rider → AFTER the cached block so the cache still hits
        { type: 'text', text: langNote }
      ],
      messages
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'rate_limited' }, 429, cors);
    // surface WHY it failed so the admin can act (bad key, no credit, bad model…)
    const detail = 'model error' + (err?.status ? ' ' + err.status : '') + ': ' +
      String(err?.message || 'unknown').slice(0, 300);
    return json({ error: 'chat_failed', message: detail }, 502, cors);
  }

  if (response.stop_reason === 'refusal') {
    return json({ reply: "I can't help with that one — try asking about the route, the days, tolls, lodging or gear." }, 200, cors);
  }
  const reply = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim();
  return json({ reply }, 200, cors);
}

/* ---------- router ---------- */
export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/register' && request.method === 'POST') return await handleRegister(request, env, cors);
      if (path === '/api/login' && request.method === 'POST') return await handleLogin(request, env, cors);

      /* everything below needs a valid session */
      const session = await authenticate(request, env);
      if (!session) {
        if (path.startsWith('/api/')) return json({ error: 'unauthorized' }, 401, cors);
        return json({ error: 'not_found' }, 404, cors);
      }

      if (path === '/api/logout' && request.method === 'POST') return await handleLogout(session, env, cors);
      if (path === '/api/me' && request.method === 'GET') return json({ username: session.username }, 200, cors);
      if (path === '/api/data' && request.method === 'GET') return await handleGetData(session, env, cors);
      if (path.startsWith('/api/data/') && request.method === 'PUT') {
        return await handlePutData(request, session, env, cors, decodeURIComponent(path.slice('/api/data/'.length)));
      }
      if (path.startsWith('/api/data/') && request.method === 'DELETE') {
        return await handleDeleteData(session, env, cors, decodeURIComponent(path.slice('/api/data/'.length)));
      }
      if (path === '/api/account' && request.method === 'DELETE') return await handleDeleteAccount(request, session, env, cors);
      if (path === '/api/chat' && request.method === 'POST') return await handleChat(request, session, env, cors);

      return json({ error: 'not_found' }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: 'bad_request', message: 'internal error' }, 500, cors);
    }
  }
};
