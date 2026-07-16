/* =====================================================================
   UI — shared helpers: escaping, icons, toast, modals, sparklines.
   ===================================================================== */
import { tr } from './i18n.js';

/** Escape text for safe interpolation into HTML. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------- inline SVG icon set (24px stroke) ---------- */
const I = (paths, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}${extra}</svg>`;

export const icons = {
  home: I('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/>'),
  route: I('<circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><path d="M7.8 17.2C13.5 15 10.5 9 16.2 6.8"/>'),
  sos: I('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9"/>'),
  kit: I('<path d="M4 6.5h9M4 12h9M4 17.5h6"/><path d="m15.5 16 2 2 4-4.5"/>'),
  user: I('<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  share: I('<path d="M12 14V3.5M12 3.5 8 7.5M12 3.5l4 4"/><path d="M4.5 13v6.5h15V13"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/>'),
  moon: I('<path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z"/>'),
  map: I('<path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z"/><path d="M9 4v14M15 6v14"/>'),
  play: I('<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5v-7Z"/>'),
  cloud: I('<path d="M7 18a4.5 4.5 0 1 1 .8-8.9A6 6 0 0 1 19.5 11 3.7 3.7 0 0 1 18.5 18H7Z"/>'),
  bed: I('<path d="M3 18v-8m0 4h18v4m0-4v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>'),
  phone: I('<path d="M6.5 3.5h3l1.5 4-2 1.5a11.5 11.5 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>'),
  back: I('<path d="M15 5.5 8.5 12l6.5 6.5"/>'),
  next: I('<path d="m9 5.5 6.5 6.5L9 18.5"/>'),
  edit: I('<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>'),
  copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
  download: I('<path d="M12 3.5V15m0 0-4-4m4 4 4-4"/><path d="M4.5 16v4.5h15V16"/>'),
  trash: I('<path d="M5 7h14M9.5 7V4.5h5V7M7 7l1 13h8l1-13"/>'),
  check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  alert: I('<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4.5M12 17.4v.1"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>')
};

/* ---------- toast ---------- */
let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ---------- modal ---------- */
let lastFocus = null;

export function openModal(innerHTML, { extraClass = '' } = {}) {
  closeModal();
  lastFocus = document.activeElement;
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-box ${extraClass}">
        <button class="modal-close" data-close aria-label="${esc(tr('common.close'))}">✕</button>
        ${innerHTML}
      </div>
    </div>`;
  const backdrop = root.firstElementChild;
  /* name the dialog after its heading, if it has one */
  const heading = backdrop.querySelector('h3');
  if (heading) {
    heading.id = heading.id || 'modal-title';
    backdrop.setAttribute('aria-labelledby', heading.id);
  } else {
    backdrop.setAttribute('aria-label', tr('common.close'));
  }
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop || e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', modalKeyListener);
  backdrop.querySelector('.modal-close')?.focus();
  return backdrop;
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.removeEventListener('keydown', modalKeyListener);
  if (lastFocus && document.contains(lastFocus)) { lastFocus.focus?.(); lastFocus = null; }
}

function modalKeyListener(e) {
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key !== 'Tab') return;
  /* keep Tab focus inside the open dialog */
  const box = document.querySelector('.modal-backdrop .modal-box');
  if (!box) return;
  const focusables = [...box.querySelectorAll(
    'button, a[href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !box.contains(active))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (active === last || !box.contains(active))) { e.preventDefault(); first.focus(); }
}

/* ---------- video modal (YouTube, privacy-enhanced domain) ---------- */
export function openVideo(videoId) {
  const id = String(videoId).replace(/[^\w-]/g, '');
  openModal(
    `<iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1"
       allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Route video"></iframe>`,
    { extraClass: 'video-box' }
  );
}

/* ---------- share modal (QR + copy + native share) ---------- */
export function openShare() {
  const url = location.origin + location.pathname;
  const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=380x380&data=' + encodeURIComponent(url);
  const canNative = typeof navigator.share === 'function';
  openModal(`
    <h3>${esc(tr('profile.shareTitle'))}</h3>
    <p class="modal-sub">${esc(tr('profile.shareSub'))}</p>
    <div style="text-align:center">
      <div class="qr-holder"><img src="${qr}" alt="QR code" width="190" height="190"
        onerror="this.closest('.qr-holder').innerHTML='<p style=&quot;color:#333;font-size:13px;padding:20px&quot;>${esc(tr('profile.qrNeedsNet'))}</p>'"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn" data-act="copy">${icons.copy} ${esc(tr('profile.copyLink'))}</button>
      ${canNative ? `<button class="btn btn-ghost" data-act="native">${icons.share} ${esc(tr('common.share'))}</button>` : ''}
    </div>`);
  const box = document.querySelector('.modal-box');
  box.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'copy') copyText(url);
    if (act === 'native') navigator.share({ title: 'Euroride 2026', url }).catch(() => {});
  });
}

export function copyText(text) {
  const done = () => toast(tr('common.copied'));
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch { /* ignore */ }
  ta.remove();
}

/** Share plain text via the native sheet, falling back to copy. */
export function shareText(title, text) {
  if (typeof navigator.share === 'function') {
    navigator.share({ title, text }).catch(err => {
      if (err?.name !== 'AbortError') copyText(text);
    });
  } else {
    copyText(text);
  }
}

/* ---------- elevation sketches ---------- */
function profilePath(profile, W, H, pad = 4) {
  const base = H - 2;
  const pts = profile.map((v, i) => [ (i / (profile.length - 1)) * W, base - v * (H - pad - 4) ]);
  return `M0,${base} L${pts.map(p => p.map(n => Math.round(n * 10) / 10).join(',')).join(' L')} L${W},${base} Z`;
}

/** Small sparkline for day list rows. */
export function sparkline(profile) {
  if (!profile) return '';
  return `<svg class="day-item-spark" viewBox="0 0 72 22" preserveAspectRatio="none" aria-hidden="true">
    <path d="${profilePath(profile, 72, 22)}"/></svg>`;
}

/** Larger elevation strip for the day detail page. */
export function elevationStrip(profile, label) {
  if (!profile) return '';
  const W = 400, H = 56;
  return `<div class="elev">
    ${label ? `<span class="e-label">▲ ${esc(label)}</span>` : ''}
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <line class="e-base" x1="0" y1="${H - 2}" x2="${W}" y2="${H - 2}"/>
      <path class="e-fill" d="${profilePath(profile, W, H)}"/>
    </svg></div>`;
}
