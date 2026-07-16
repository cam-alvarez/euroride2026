# Roadmap & Feature Decisions

How the "agency team" (travel/moto lead → UX → engineering → PM) prioritized
the product. The moto-touring lead set the order; everything serves a rider
standing next to a bike with gloves half on.

## Shipped — v3 (this release)

| Feature | Why it matters on the road | Key decisions |
|---|---|---|
| Day-by-day itinerary | The core artifact of the trip | Vertical timeline (thumb-scrollable), full-brief pages, prev/next |
| Today awareness | Nobody wants to hunt for "what day is it" | Date-aware Home brief + TODAY flags |
| SOS / Emergency | The one screen that must never fail | Offline-first, 112 one tap, personal card show/send/copy |
| Rider profiles | Personal data needs an owner | Username+password only, no email, on-device |
| Packing checklist | Rental trip = forgetting gear is expensive | Curated Alpine-touring template + custom items |
| Plans / wishlist | "Where do we eat?" is a daily question | Personal list + curated suggestions, shareable as text |
| EN/ES | Half the crew reads Spanish first | Every string paired at the data level |
| Offline PWA | The passes have no signal | Full precache; only maps/videos/QR need network |
| QR share | 18 riders need the link fast | Share sheet + QR + copy |

## Phase 4 — Chat assistant

See `CHAT-ASSISTANT.md` for the full design. Summary: a small serverless
proxy (Cloudflare Workers free tier) holding the API key, with trip data
injected as context. Not shipped client-only on purpose: an API key in a
static site is public.

## Phase 5 — Shared crew data

- Cross-device login & sync (see `ACCOUNTS-AND-SYNC.md`)
- Shared wishlist with votes ("12 riders want the Tremola")
- Roll call: who's confirmed, who has bike #, room pairing
- Shared photo album link hub

## Phase 6 — Quality-of-life

- Visual content editor so Dad never touches JS
- Per-day live weather (Open-Meteo, free, no key)
- Expense splitter (fuel/tolls per group)
- GPX export of daily routes for GPS units
- Print-friendly one-page itinerary

## Deliberately NOT building

- Real bookings/payments — links out to Expedia/hotel sites are safer and free.
- Live GPS tracking of riders — privacy + battery + complexity.
- Native app stores — the PWA installs from the browser; no store friction.
