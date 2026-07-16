# Accounts & Sync — Current Model and Upgrade Path

> **STATUS: the upgrade path below is BUILT.** The recommended Cloudflare
> Workers + D1 design is implemented in `server/` and the app switches to
> real cross-device accounts when `js/config.js` points at it — see
> `docs/DEPLOY-SERVER.md`. Without it, the device-local model described
> here remains the default.

## What ships today (v3)

**Device-local profiles.** Username + password, no email — exactly as
requested — implemented fully client-side:

- Passwords are never stored: PBKDF2-SHA-256 (120k iterations, per-user salt)
  via WebCrypto. The hash only gates the UI.
- Each profile's data (emergency card, packing, plans) is namespaced in
  `localStorage` under `er26.u.<name>.*`.
- Nothing ever leaves the device. The Profile screen says this honestly and
  offers a JSON export as a backup / manual transfer.

**Being straight about the trade-offs:**

| Property | Status |
|---|---|
| Works with zero hosting cost / zero backend | ✅ |
| Works offline in the mountains | ✅ |
| No email, 10-second signup | ✅ |
| Data private to the device | ✅ (it never uploads) |
| Same profile on phone *and* laptop | ❌ needs a backend (below) |
| Survives clearing browser data | ❌ hence the JSON export button |
| Protects data from someone with full device access | ❌ it's a lock on the door, not a vault — the UI says so |

For a trip app whose personal data is "my packing list, my plans, my medical
card," per-device is a reasonable v1: the emergency card in particular is
most useful *on the phone you carry on the bike*.

## Upgrade path to real cross-device accounts

The app was built so this is a swap, not a rewrite: **all persistence goes
through `js/store.js`**, and all credential logic through `js/auth.js`.
Replace those two modules' internals with API calls and every feature
(emergency card, packing, plans) syncs without touching the views.

### Recommended: Cloudflare Workers + D1 (free tier)

Same account/platform as the Phase-4 chat proxy — one place to manage.

- `POST /register` `{username, password}` → argon2/bcrypt hash in D1, returns
  a session token. **Usernames only — no email required**, matching the spec.
- `GET/PUT /data/:key` with the token → replaces `store.get/set` for `u.*` keys.
- Offline strategy: keep localStorage as the write-through cache; sync when
  online (last-write-wins is fine for single-owner data).
- Free tier: 100k requests/day, 5 GB D1 — orders of magnitude above need.

### Alternative: Supabase free tier

Fastest to stand up (auth + Postgres + row-level security out of the box).
One wrinkle: Supabase auth is email-first; the standard workaround for
username-only is `<username>@euroride.local` synthetic emails with email
confirmation disabled. Works, slightly hacky.

### Alternative: PocketBase

One-binary backend, lovely admin UI, real username auth. Needs a host that
runs a process (Fly.io/Railway free tiers) — more moving parts than Workers.

## What Phase 5 unlocks once sync exists

- Shared crew wishlist with votes
- Roll call / rider status board
- "Send my emergency card to the ride leader" pre-trip
- Admin role for Dad to edit content from the app itself
