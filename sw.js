/* Euroride 2026 — offline service worker (v3 redesign)
   Strategy:
   - Page navigations: NETWORK FIRST with a short timeout, so published edits
     appear immediately but a flaky 1-bar connection can't hang app launch.
     Only 2xx responses are cached — a mid-deploy 404 can never poison the
     offline copy.
   - App modules & styles: STALE-WHILE-REVALIDATE — served instantly from
     cache, refreshed in the background so the next open picks up updates
     even without a cache version bump.
   - Fonts: cache-first in their own unversioned cache so they survive app
     cache bumps and the app never re-downloads them.
   Everything the app needs is precached: the whole itinerary, SOS screen
   and personal data work with zero signal in the mountains.
*/
const CACHE = 'euroride-v5';
const FONT_CACHE = 'euroride-fonts-v1';
const NAV_TIMEOUT_MS = 4000;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './css/app.css',
  './js/app.js',
  './js/i18n.js',
  './js/store.js',
  './js/auth.js',
  './js/ui.js',
  './js/map.js',
  './js/data/trip.js',
  './js/data/emergency.js',
  './js/data/packing.js',
  './js/views/home.js',
  './js/views/days.js',
  './js/views/day.js',
  './js/views/sos.js',
  './js/views/kit.js',
  './js/views/profile.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

/* Navigations: fresh if the network answers quickly and healthily,
   otherwise the cached shell. */
async function handleNavigation(request) {
  try {
    const res = await fetchWithTimeout(request, NAV_TIMEOUT_MS);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put('./index.html', res.clone());
      return res;
    }
    // 404/5xx (e.g. mid-deploy): prefer the known-good cached shell
    return (await caches.match('./index.html')) || res;
  } catch {
    const hit = await caches.match('./index.html');
    if (hit) return hit;
    return fetch(request); // nothing cached yet — let the browser keep trying
  }
}

/* Own assets: instant from cache, refreshed in the background. */
async function handleAsset(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request).then(res => {
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return hit || refresh.then(res => res || Response.error());
}

/* Google fonts: cache-first, kept across app cache bumps. */
async function handleFont(request) {
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Never intercept video embeds or the QR service.
  if (url.hostname.includes('youtube') || url.hostname.includes('qrserver')) return;

  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(handleNavigation(e.request));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(handleFont(e.request));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(handleAsset(e.request));
  }
});
