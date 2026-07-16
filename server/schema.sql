-- Euroride 2026 crew server — D1 schema
-- Apply with:  npx wrangler d1 execute euroride --remote --file=schema.sql
-- (use --local instead of --remote when developing)

CREATE TABLE IF NOT EXISTS users (
  username     TEXT PRIMARY KEY,          -- lowercase
  display_name TEXT NOT NULL,
  salt         TEXT NOT NULL,             -- random, server-side
  key_hash     TEXT NOT NULL,             -- SHA-256(salt || client-derived auth key)
  created_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,            -- SHA-256 of the bearer token
  username   TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(username);

CREATE TABLE IF NOT EXISTS user_data (
  username   TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,               -- JSON
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (username, key)
);

-- generic counters for rate limiting (login attempts, chat quota)
CREATE TABLE IF NOT EXISTS counters (
  bucket TEXT PRIMARY KEY,
  count  INTEGER NOT NULL
);
