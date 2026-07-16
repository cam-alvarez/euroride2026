# Euroride 2026 — Trip Site (v2)

11-day Harley-Davidson itinerary: Italy → Switzerland → Austria → Germany → France.
Bilingual (EN/ES) · light/dark · offline PWA · date-aware "today" view.

## What's in v2
- New design system: Anton + Barlow type, tappable SVG route map, per-day elevation strips.
- Day navigation rebuilt as a native scroll-snap pager (fixes v1 scroll bugs at the root).
- Auto-opens the current trip day between Aug 20-30, 2026; supports #day-N deep links.

## Files
- index.html — the whole app. Trip content lives in `<script id="trip-data">` (`const TRIP`).
- sw.js — offline. Page loads network-first, so published edits appear immediately.
- manifest.json + icons — Add to Home Screen support.

## Editing
GitHub → index.html → pencil icon → edit inside the TRIP block → Commit. Live in ~1 min.
Keep every en:/es: pair in sync. Set lodging.url to null for "find lodging nearby".

## QA checklist (run before every release)
Automated: HTML parse · JS syntax · EN/ES parity · jsdom smoke suite (pager math,
chip targeting, i18n swap, modals, lodging states).
Manual on a phone: swipe all 11 days · tap 3 random chips · tap 2 map stops ·
toggle ES and dark · open+close a video · airplane-mode reload (after first visit).

## Roadmap
Phase 3 chat assistant → Phase 4 wishlists/packing/emergency/weather → Phase 5 visual editor for Dad.
