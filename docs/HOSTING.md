# Hosting & Delivery

Goal: free, stable, zero-maintenance hosting that 18 riders can rely on in
August 2026, editable by a non-developer.

## Recommendation: GitHub Pages (current setup)

The app is pure static files — no build step, no server. GitHub Pages is the
best fit because the content *editing* workflow (Dad edits `js/data/trip.js`
in the GitHub web UI) and the *hosting* are the same system.

**Setup (one time):**
1. Repo → Settings → Pages → Source: `Deploy from a branch` → `main` / root.
2. The site appears at `https://<user>.github.io/euroride2026/`.
3. Every commit to `main` redeploys automatically in ~1 minute.

**Reliability:** GitHub Pages serves via a global CDN with HTTPS. There is a
soft 100 GB/month bandwidth limit — this app is ~200 KB; a crew of 18 will
never come close. The PWA also keeps working from cache even if hosting has
a hiccup mid-trip.

**Custom domain (optional, ~$10/yr):** add a CNAME in repo settings, e.g.
`euroride2026.com`. Not required — the QR code makes any URL easy.

## Alternatives (all free tiers, all fine)

| Host | Pros | When to prefer |
|---|---|---|
| **Cloudflare Pages** | Fastest CDN, generous limits, pairs with Workers | When the chat assistant lands (Phase 4) — same account hosts the Worker proxy |
| **Netlify** | Drag-and-drop deploys, form handling | If drag-drop deploys appeal |
| **Vercel** | Great DX | If the app ever moves to a framework |

Migration is trivial in every case: upload the same files.

## Things to know

- **HTTPS is required** for the PWA service worker, WebCrypto password
  hashing, and `navigator.share`. All hosts above provide it automatically.
- **The service worker** (`sw.js`) serves pages network-first (with a 4s
  timeout falling back to cache) and refreshes JS/CSS in the background
  (stale-while-revalidate), so published edits appear on riders' phones
  within one or two opens with signal — no stale-cache surprises.
- **Cache version**: for big releases you can still bump
  `CACHE = 'euroride-vN'` in `sw.js` to force a clean re-install of assets;
  routine content edits don't need it.
- **No backend exists** — there is nothing to crash, patch, or pay for. The
  trade-off (personal data is per-device) is documented in
  `ACCOUNTS-AND-SYNC.md` along with the upgrade path.
