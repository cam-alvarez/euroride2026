# Euroride 2026 — Trip App (v3 redesign)

The living itinerary + rider toolkit for an 11-day Harley-Davidson trip:
Milan → Splügen → Stelvio → Dolomites → Munich → Alsace → Grimsel → Lake Como → Milan.

Bilingual (EN/ES) · light/dark · offline PWA · rider profiles (username + password, no email)
· personal emergency card · packing checklist · plans/wishlist.

## What's in v3

Complete design + architecture rework of the v2 single-file site:

- **App-like navigation** — bottom tab bar on phones, top nav on desktop.
  Five screens: **Home** (countdown/today brief, stats, route map, essentials),
  **Days** (timeline → full day brief), **SOS** (emergency, reworked),
  **Kit** (packing + plans), **You** (profile & settings).
- **Rider profiles** — username + password only (hashed with PBKDF2/WebCrypto).
  Personal data stays on the device; see `docs/ACCOUNTS-AND-SYNC.md` for the
  cross-device sync upgrade path.
- **Emergency, rethought** — one-tap 112 call, a personal Emergency Card
  (blood type, allergies, meds, insurance, contacts) you can show full-screen,
  send via any app, or copy as text — plus per-country numbers, a crash
  protocol, rental info and required documents. All offline.
- **Modular codebase** — plain ES modules, no build step, no framework,
  still free to host anywhere static.

## Project layout

```
index.html            app shell
css/app.css           design system (all styles)
js/app.js             boot + hash router + theme
js/i18n.js            EN/ES UI strings
js/store.js           localStorage layer (swap point for a future backend)
js/auth.js            local profiles: PBKDF2-hashed passwords
js/ui.js              icons, modals, toast, sparklines
js/map.js             stylized SVG route map
js/data/trip.js       ★ THE ITINERARY — edit this to change trip content
js/data/emergency.js  emergency numbers, crash protocol, rental, documents
js/data/packing.js    packing template + plan suggestions
js/views/*.js         one module per screen
sw.js                 offline service worker (network-first pages)
docs/                 hosting, roadmap, chat assistant, sync, intake form
```

## Editing the trip (for Dad 👋)

Everything riders read lives in `js/data/trip.js`. On GitHub: open the file →
pencil icon → edit → Commit. Live in ~1 minute. Rules:

- Every text appears twice: `{ en: "English", es: "Español" }` — keep both.
- Set `lodging.url` to `null` to show a "find lodging nearby" search instead.
- Emergency content is in `js/data/emergency.js`, packing in `js/data/packing.js`.

## Local development

ES modules need a server (not `file://`):

```
python3 -m http.server 8080   # then open http://localhost:8080
```

## QA checklist (before every release)

- `node --check` every file in `js/` (syntax).
- On a phone: all 5 tabs · open 3 days · create a profile · fill the emergency
  card and share it · check 5 packing items · add a plan · switch ES + dark ·
  airplane-mode reload (after first visit).
- Desktop ≥ 900 px: top nav shows, tab bar hides.

## Roadmap

Phase 4: chat assistant (`docs/CHAT-ASSISTANT.md`) →
Phase 5: shared crew data & sync (`docs/ACCOUNTS-AND-SYNC.md`) →
Phase 6: visual content editor. Full list: `docs/ROADMAP.md`.
