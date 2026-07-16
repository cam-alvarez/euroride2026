/* =====================================================================
   APP — boot, hash router, chrome (top bar + tab bar), theme.
   Routes:
     #/home          Home / overview
     #/days          Itinerary list
     #/day/N         Day detail
     #/sos           Emergency
     #/kit           Rider kit (packing | plans)  → #/kit/plans
     #/profile       Rider profile & settings
   Legacy deep links (#day-N) from v2 are redirected.
   ===================================================================== */
import { store } from './store.js';
import { getLang, setLang, tr } from './i18n.js';
import { icons, esc, openShare, closeModal } from './ui.js';
import { initSync } from './sync.js';
import { renderHome } from './views/home.js';
import { renderDays } from './views/days.js';
import { renderDay } from './views/day.js';
import { renderSos } from './views/sos.js';
import { renderChat } from './views/chat.js';
import { renderKit } from './views/kit.js';
import { renderProfile } from './views/profile.js';

const NAV = [
  { id: 'home', hash: '#/home', icon: 'home', label: 'nav.home' },
  { id: 'days', hash: '#/days', icon: 'route', label: 'nav.days' },
  { id: 'sos', hash: '#/sos', icon: 'sos', label: 'nav.sos' },
  { id: 'chat', hash: '#/chat', icon: 'chat', label: 'nav.chat' },
  { id: 'kit', hash: '#/kit', icon: 'kit', label: 'nav.kit' },
  { id: 'profile', hash: '#/profile', icon: 'user', label: 'nav.profile' }
];

const ROUTES = {
  home: { render: renderHome, nav: 'home' },
  days: { render: renderDays, nav: 'days' },
  day: { render: renderDay, nav: 'days' },
  sos: { render: renderSos, nav: 'sos' },
  chat: { render: renderChat, nav: 'chat' },
  kit: { render: renderKit, nav: 'kit' },
  profile: { render: renderProfile, nav: 'profile' }
};

/* ---------- theme ---------- */
export function appliedTheme() {
  const pref = store.get('theme', 'auto');
  if (pref === 'auto') {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}
export function applyTheme() {
  const theme = appliedTheme();
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = theme === 'dark' ? '#0c1014' : '#f2f4f6';
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
}
export function setThemePref(pref) {
  store.set('theme', pref);
  applyTheme();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (store.get('theme', 'auto') === 'auto') applyTheme();
});

/* ---------- chrome ---------- */
function renderChrome() {
  document.getElementById('offline-banner').textContent = tr('app.offline');
  document.querySelector('.brand .b2').textContent = tr('app.tagline');

  const navLinks = active => NAV.map(n => `
    <a href="${n.hash}" class="${n.id === active ? 'active' : ''} ${n.id === 'sos' ? 'tab-sos' : ''}"
       ${n.id === active ? 'aria-current="page"' : ''}>
      ${icons[n.icon]}<span>${esc(tr(n.label))}</span>
    </a>`).join('');

  document.getElementById('top-nav').innerHTML = navLinks(currentNav);
  document.getElementById('tabbar').innerHTML = NAV.map(n => `
    <a href="${n.hash}" class="tab ${n.id === 'sos' ? 'tab-sos' : ''} ${n.id === currentNav ? 'active' : ''}"
       ${n.id === currentNav ? 'aria-current="page"' : ''}>
      ${icons[n.icon]}<span>${esc(tr(n.label))}</span>
    </a>`).join('');

  const langBtns = document.querySelectorAll('#lang-pill button');
  langBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));

  document.querySelector('footer.site-foot .foot-line').textContent =
    'Euroride 2026 · Muñecos Travel Agency';
  document.querySelector('footer.site-foot .v').textContent = tr('app.footTag');
}

/* ---------- router ---------- */
let currentNav = 'home';

function parseHash() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  // legacy v2 deep links: #day-3
  const legacy = raw.match(/^day-(\d+)$/);
  if (legacy) return { name: 'day', param: legacy[1] };
  const [name, param] = raw.split('/');
  return { name: name || 'home', param: param || null };
}

export function router() {
  closeModal();
  document.querySelectorAll('.em-fullscreen').forEach(el => el.remove());
  const { name, param } = parseHash();
  const route = ROUTES[name] || ROUTES.home;
  currentNav = route.nav;
  const view = document.getElementById('view');
  view.innerHTML = '';
  route.render(view, param);
  renderChrome();
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true }); // move focus & announce the new view to AT
}

/** Re-render the current view in place (used after language switches). */
export function rerender() {
  router();
}

/* ---------- boot ---------- */
function boot() {
  document.documentElement.lang = getLang();
  applyTheme();
  initSync();

  document.getElementById('lang-pill').addEventListener('click', e => {
    const lang = e.target.closest('button')?.dataset.lang;
    if (lang && lang !== getLang()) { setLang(lang); rerender(); }
  });
  document.getElementById('theme-btn').addEventListener('click', () => {
    setThemePref(appliedTheme() === 'dark' ? 'light' : 'dark');
  });
  const shareBtn = document.getElementById('share-btn');
  shareBtn.innerHTML = icons.share;
  shareBtn.addEventListener('click', openShare);

  window.addEventListener('hashchange', router);
  router();

  /* offline indicator */
  const setOnline = () => document.body.classList.toggle('is-offline', !navigator.onLine);
  window.addEventListener('online', setOnline);
  window.addEventListener('offline', setOnline);
  setOnline();

  /* service worker */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}

boot();
