# Euroride 2026 — Trip Site (Phase 1)

11-day Harley-Davidson itinerary: Italy → Switzerland → Austria → Germany → France.
Built for Muñecos Travel Agency. Bilingual (EN/ES), light/dark themes, offline-capable PWA.

## Files
- `index.html` — the whole app. Trip content lives in the clearly-marked
  `<script id="trip-data">` block near the bottom (the future visual editor will target this data).
- `sw.js` — service worker: makes the itinerary work offline once the site is visited once.
- `manifest.json` + `icon-*.png` — lets riders "Add to Home Screen" like a real app.

## Editing content
Open `index.html`, find `const TRIP = [`, edit text inside the `{en:"...", es:"..."}` pairs.
Set `lodging.url` to `null` to show a "find lodging nearby" search link instead of a specific hotel.

## Local preview
Just open `index.html` in a browser. (Offline mode + install prompt only activate
once hosted over HTTPS — service workers don't run from `file://`.)

## Deploy (free)
Cloudflare Pages or GitHub Pages: upload this folder as-is. No build step.

## Roadmap
- Phase 2: deploy to a free host (together, step by step)
- Phase 3: AI chat assistant — "Route Captain" persona, key held server-side (Cloudflare Worker)
- Phase 4: wishlists, packing checklist, emergency page, live weather near the trip dates
- Phase 5: visual content editor for Dad (e.g., Decap CMS) — enabled by the data layer above
