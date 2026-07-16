# Chat Assistant — Design (Phase 4)

The requested feature: a trip assistant on the site that answers questions
like *"How cold is Stelvio?"*, *"What's the toll situation on day 7?"*,
*"Where do we sleep on the 23rd?"*.

## The one hard constraint

LLM APIs require a secret key. **A static site cannot hold a secret** — any
key shipped to the browser is public within minutes and will be abused.
So a chat assistant needs one tiny server-side piece, no matter the vendor.
Everything else can stay exactly as it is.

## Recommended architecture

```
Browser (this app)
   │  POST /chat  { messages: [...] }
   ▼
Cloudflare Worker  (free tier: 100k requests/day)
   │  adds system prompt = trip data (from js/data/trip.js)
   │  holds ANTHROPIC_API_KEY as an encrypted secret
   ▼
Claude API (Haiku-class model — cheap, fast, plenty for Q&A)
```

- **Cost:** the Worker is free at this scale. Model usage for a crew of 18
  asking trip questions is a few dollars for the whole month, using a small
  model. Prompt caching keeps the per-question cost near-zero because the
  trip context is identical every call.
- **Rate limiting:** the Worker checks a per-IP counter (e.g., 30 msgs/day)
  so a leaked URL can't run up a bill. Cloudflare KV/Durable Objects handle
  this on the free tier.
- **Trip context:** generate the system prompt from `js/data/trip.js` at
  deploy time so the assistant always matches the published itinerary, plus
  the essentials/emergency data. It should answer in EN or ES matching the
  user's message.
- **Offline behavior:** the chat tab shows a friendly "needs signal" state;
  everything else in the app keeps working.

## Worker sketch

```js
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('nope', { status: 405 });
    const { messages } = await req.json();          // validate + cap length
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: TRIP_SYSTEM_PROMPT,                  // generated from trip.js
        messages: messages.slice(-12)                // short memory is fine
      })
    });
    return new Response(r.body, {
      headers: { 'content-type': 'application/json',
                 'access-control-allow-origin': 'https://<your-pages-domain>' }
    });
  }
}
```

## Alternatives considered

| Option | Verdict |
|---|---|
| Key in the client, "hidden" | ❌ Never. Public within minutes. |
| Gemini free tier via proxy | ✔ Works the same way; still needs the proxy. Pick by taste. |
| No LLM: local FAQ search over trip data | ✔ Zero cost, works offline. Good fallback, already easy with the structured trip data — but it isn't the "ask anything" experience Dad asked for. |
| Full backend (Node server) | ❌ Overkill; something to maintain and pay for. |

## Why it's Phase 4, not now

It is the only feature that requires an account with a payment method and a
deployed secret. That setup is a 1-hour job, but it belongs to the site owner
(you), so it ships as its own phase with its own checklist:

1. Create Cloudflare account → `wrangler init euroride-chat`.
2. `wrangler secret put ANTHROPIC_API_KEY`.
3. Paste Worker (above), generate the system prompt from `trip.js`, deploy.
4. Add the chat UI screen (a `views/chat.js` module + a tab) pointing at the
   Worker URL — the app's view architecture already accommodates it.
