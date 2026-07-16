# Deploying the Crew Server (~15 minutes, free)

The app works two ways:

- **Without the server** (how it ships): everything works except that
  profiles live per-device and the Chat tab shows a setup note.
- **With the server**: real sign-in that works across devices, data sync
  (emergency card, packing, plans follow the rider), and the **trip
  assistant** chat. This guide turns that on.

The server is a single Cloudflare Worker + a D1 database — both free at
this scale — plus an Anthropic API key for the assistant (a few dollars
for the whole trip; set a budget cap).

## One-time setup

Prereqs: [Node.js](https://nodejs.org) installed, a free
[Cloudflare account](https://dash.cloudflare.com/sign-up), and an
[Anthropic API key](https://console.anthropic.com) (add ~$5 credit and set
a spend limit).

```bash
cd server
npm install

# 1. Log in to Cloudflare (opens a browser)
npx wrangler login

# 2. Create the database, then paste the printed database_id
#    into wrangler.toml (replacing REPLACE_WITH_YOUR_DATABASE_ID)
npx wrangler d1 create euroride

# 3. Create the tables
npx wrangler d1 execute euroride --remote --file=schema.sql

# 4. Allow your site to call the API: edit ALLOWED_ORIGINS in wrangler.toml,
#    e.g.  ALLOWED_ORIGINS = "https://<your-user>.github.io"

# 5. Store the Anthropic key as a secret (never in code)
npx wrangler secret put ANTHROPIC_API_KEY

# 6. Ship it
npx wrangler deploy
```

`deploy` prints your API URL, e.g. `https://euroride-api.<you>.workers.dev`.

## Point the app at it

Edit **`js/config.js`** (one line):

```js
export const API_BASE = 'https://euroride-api.<you>.workers.dev';
```

Commit → GitHub Pages redeploys → the Profile screen now creates real
accounts, and the Chat tab comes alive. That's it.

## Knobs (wrangler.toml)

| Var | Default | Meaning |
|---|---|---|
| `CHAT_MODEL` | `claude-opus-4-8` | The model behind the assistant. `claude-haiku-4-5` is the cheaper/faster option if costs matter more than answer quality. |
| `CHAT_DAILY_LIMIT` | `40` | Questions per rider per day (protects your API budget). |
| `ALLOWED_ORIGINS` | localhost | Comma-separated origins allowed to call the API. |

Cost notes: the Worker and D1 free tiers cover this crew hundreds of times
over. Chat cost is dominated by the model; the trip context is served from
Anthropic's prompt cache after the first question of each burst, so typical
questions cost fractions of a cent (Haiku) to a few cents (Opus).

## When the itinerary changes

The assistant's knowledge is generated from the same file the app uses.
After editing `js/data/trip.js`:

```bash
node tools/gen-context.mjs   # refreshes server/src/context.js
cd server && npx wrangler deploy
```

## Local development

```bash
cd server
npx wrangler d1 execute euroride --local --file=schema.sql   # once
npx wrangler dev --local --var DEV_FAKE_CHAT:1               # API on :8787
```

`DEV_FAKE_CHAT=1` makes `/api/chat` return a canned reply so you can test
the whole flow without an API key. Set `API_BASE = 'http://localhost:8787'`
in `js/config.js` while testing (localhost is already in `ALLOWED_ORIGINS`).

## Security model (what your dad can tell the crew)

- No email, no personal data required — username + password only.
- Passwords never leave the phone: the app derives a scrambled key
  (PBKDF2, 120k rounds) and only that crosses the wire over HTTPS; the
  server stores a salted hash of it.
- Sessions are random tokens, stored hashed, valid 90 days.
- The Anthropic key lives only in Cloudflare's encrypted secrets, and only
  signed-in crew members can use the assistant (rate-limited per rider).
