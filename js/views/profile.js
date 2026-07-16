/* =====================================================================
   PROFILE — rider profiles (username + password, no email), settings,
   data export, privacy. All local to this device by design; see
   docs/ACCOUNTS-AND-SYNC.md for the cross-device upgrade path.
   ===================================================================== */
import { tr, getLang, setLang } from '../i18n.js';
import { esc, icons, toast, openModal, closeModal } from '../ui.js';
import { listProfiles, currentUser, register, login, logout, deleteProfile } from '../auth.js';
import { store, exportUserData } from '../store.js';
import { rerender, setThemePref } from '../app.js';

let mode = null; // 'create' | 'login' — null until the first render picks a default

export function renderProfile(view) {
  const user = currentUser();
  if (user) renderSignedIn(view, user);
  else renderSignedOut(view);
}

/* ================= signed out ================= */
function renderSignedOut(view) {
  const profiles = listProfiles();
  if (mode === null) mode = profiles.length ? 'login' : 'create';

  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('profile.title'))}</h1>
      <p class="view-sub">${esc(tr('profile.heroSub'))}</p>
    </div>

    <div class="seg auth-tabs">
      <button data-mode="login" aria-pressed="${mode === 'login'}">${esc(tr('profile.login'))}</button>
      <button data-mode="create" aria-pressed="${mode === 'create'}">${esc(tr('profile.create'))}</button>
    </div>

    <form class="card card-pad" id="auth-form" style="max-width:440px">
      ${profiles.length && mode === 'login' ? `
        <div class="card-sub" style="margin-bottom:4px">${esc(tr('profile.existing'))}</div>
        <div class="profile-chiprow">
          ${profiles.map(p => `<button type="button" class="profile-chip" data-fill="${esc(p)}">${esc(p)}</button>`).join('')}
        </div>` : ''}
      <label class="field"><span>${esc(tr('profile.username'))}</span>
        <input name="username" autocomplete="username" maxlength="20" required></label>
      <label class="field"><span>${esc(tr('profile.password'))}</span>
        <input name="password" type="password" autocomplete="${mode === 'create' ? 'new-password' : 'current-password'}" required></label>
      ${mode === 'create' ? `
        <label class="field"><span>${esc(tr('profile.password2'))}</span>
          <input name="password2" type="password" autocomplete="new-password" required></label>` : ''}
      <p class="form-err" id="auth-err" role="alert"></p>
      <button class="btn btn-block" type="submit">
        ${icons.user} ${esc(mode === 'create' ? tr('profile.create') : tr('profile.login'))}
      </button>
    </form>

    ${settingsCard()}
    ${privacyCard()}`;

  view.querySelector('.auth-tabs').addEventListener('click', e => {
    const m = e.target.closest('[data-mode]')?.dataset.mode;
    if (m && m !== mode) { mode = m; renderSignedOut(view); }
  });

  view.querySelectorAll('[data-fill]').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = view.querySelector('input[name=username]');
      input.value = chip.dataset.fill;
      view.querySelector('input[name=password]').focus();
    });
  });

  view.querySelector('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const username = String(f.get('username') || '');
    const password = String(f.get('password') || '');
    const err = view.querySelector('#auth-err');
    err.textContent = '';

    let res;
    if (mode === 'create') {
      if (password !== String(f.get('password2') || '')) {
        err.textContent = tr('profile.errPwMatch');
        return;
      }
      res = await register(username, password);
    } else {
      res = await login(username, password);
    }
    if (!res.ok) {
      err.textContent = tr('profile.' + res.error);
      return;
    }
    toast(`${tr('profile.signedInAs')} ${res.name} ✓`);
    rerender();
  });

  bindSettings(view);
}

/* ================= signed in ================= */
function renderSignedIn(view, user) {
  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('profile.title'))}</h1>
    </div>

    <div class="card signed-banner">
      <div class="avatar" aria-hidden="true">${esc(user.slice(0, 2))}</div>
      <div>
        <div class="sb-name">${esc(user)}</div>
        <div class="sb-sub">${esc(tr('profile.signedInAs'))} ${esc(user)}</div>
      </div>
      <button class="btn btn-ghost btn-sm" id="logout-btn">${esc(tr('profile.logout'))}</button>
    </div>

    <div class="card card-pad" style="margin-bottom:14px">
      <div class="card-title">${esc(tr('sos.myCard'))}</div>
      <p class="card-sub">${esc(tr('sos.myCardSub'))}</p>
      <div style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="#/sos">🆘 ${esc(tr('sos.title'))} →</a></div>
    </div>

    ${settingsCard()}

    <h2 class="sec-title display" style="font-size:18px">${esc(tr('profile.myData'))}</h2>
    <div class="card card-pad">
      <div class="setting-row">
        <div>
          <div class="sr-label">${esc(tr('profile.export'))}</div>
          <div class="sr-sub">${esc(tr('profile.exportSub'))}</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="export-btn">${icons.download} JSON</button>
      </div>
      <div class="setting-row">
        <div>
          <div class="sr-label" style="color:var(--danger)">${esc(tr('profile.deleteProfile'))}</div>
        </div>
        <button class="btn btn-soft-danger btn-sm" id="delete-btn">${icons.trash} ${esc(tr('common.delete'))}</button>
      </div>
    </div>

    ${privacyCard()}`;

  view.querySelector('#logout-btn').addEventListener('click', () => {
    logout();
    mode = 'login';
    rerender();
  });

  view.querySelector('#export-btn').addEventListener('click', () => {
    const payload = {
      app: 'euroride2026', version: 3, profile: user,
      exported: new Date().toISOString(),
      data: exportUserData(user)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `euroride2026-${user.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  view.querySelector('#delete-btn').addEventListener('click', () => {
    openModal(`
      <h3>${esc(tr('profile.deleteProfile'))}</h3>
      <p class="modal-sub">${esc(tr('profile.deleteConfirm'))}</p>
      <form id="del-form">
        <label class="field"><span>${esc(tr('profile.password'))}</span>
          <input name="password" type="password" autocomplete="current-password" required></label>
        <p class="form-err" id="del-err" role="alert"></p>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" data-close>${esc(tr('common.cancel'))}</button>
          <button type="submit" class="btn btn-danger">${icons.trash} ${esc(tr('common.delete'))}</button>
        </div>
      </form>`);
    document.getElementById('del-form').addEventListener('submit', async e => {
      e.preventDefault();
      const password = String(new FormData(e.target).get('password') || '');
      const res = await deleteProfile(user, password);
      if (!res.ok) {
        document.getElementById('del-err').textContent = tr('profile.' + res.error);
        return;
      }
      closeModal();
      mode = 'create';
      rerender();
    });
  });

  bindSettings(view);
}

/* ================= shared cards ================= */
function settingsCard() {
  const themePref = store.get('theme', 'auto');
  const themeOpt = (val, label) =>
    `<option value="${val}" ${themePref === val ? 'selected' : ''}>${esc(label)}</option>`;
  return `
    <h2 class="sec-title display" style="font-size:18px">${esc(tr('profile.settings'))}</h2>
    <div class="card card-pad" style="margin-bottom:14px">
      <div class="setting-row">
        <div class="sr-label">${esc(tr('profile.language'))}</div>
        <div class="pill" id="pf-lang">
          <button data-lang="en" aria-pressed="${getLang() === 'en'}">EN</button>
          <button data-lang="es" aria-pressed="${getLang() === 'es'}">ES</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="sr-label">${esc(tr('profile.theme'))}</div>
        <select id="pf-theme" style="font:inherit;padding:7px 10px;border-radius:9px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink)">
          ${themeOpt('auto', tr('profile.themeAuto'))}
          ${themeOpt('light', tr('profile.themeLight'))}
          ${themeOpt('dark', tr('profile.themeDark'))}
        </select>
      </div>
    </div>`;
}

function bindSettings(view) {
  view.querySelector('#pf-lang')?.addEventListener('click', e => {
    const lang = e.target.closest('button')?.dataset.lang;
    if (lang && lang !== getLang()) { setLang(lang); rerender(); }
  });
  view.querySelector('#pf-theme')?.addEventListener('change', e => {
    setThemePref(e.target.value);
  });
}

function privacyCard() {
  return `
    <h2 class="sec-title display" style="font-size:18px">${esc(tr('profile.privacy'))}</h2>
    <div class="card card-pad">
      <p class="card-sub">${esc(tr('profile.privacyBody'))}</p>
      <p class="card-sub" style="margin-top:10px">${esc(tr('profile.aboutBody'))}</p>
    </div>`;
}
