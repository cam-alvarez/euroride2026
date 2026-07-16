/* =====================================================================
   KIT — personal packing checklist + plans/wishlist.
   Both are per-profile; the tab gates gently if nobody is signed in.
   Packing state:  { checked: {itemKey: true}, custom: {catId: [{id,label}]} }
   Plans state:    [ {id, title, kind, day, link, done} ]

   Event listeners are attached ONCE per view render (bindEvents);
   renderPacking/renderPlans only rebuild markup.
   ===================================================================== */
import { PACKING_TEMPLATE, PLAN_SUGGESTIONS } from '../data/packing.js';
import { TRIP, getDay } from '../data/trip.js';
import { t, tr } from '../i18n.js';
import { esc, icons, toast, shareText } from '../ui.js';
import { currentUser } from '../auth.js';
import { userStore } from '../store.js';

let section = 'packing'; // 'packing' | 'plans'
const openCats = new Set([PACKING_TEMPLATE[0]?.id]);

export function renderKit(view, param) {
  if (param === 'plans' || param === 'packing') section = param;
  else history.replaceState(null, '', '#/kit/' + section); // keep URL and view in sync
  const user = currentUser();

  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('kit.title'))}</h1>
    </div>
    <div class="seg">
      <button data-sec="packing" aria-pressed="${section === 'packing'}">🧳 ${esc(tr('kit.packing'))}</button>
      <button data-sec="plans" aria-pressed="${section === 'plans'}">📌 ${esc(tr('kit.plans'))}</button>
    </div>
    <div id="kit-body"></div>`;

  const body = view.querySelector('#kit-body');

  view.querySelector('.seg').addEventListener('click', e => {
    const sec = e.target.closest('[data-sec]')?.dataset.sec;
    if (sec && sec !== section) {
      section = sec;
      history.replaceState(null, '', '#/kit/' + sec);
      view.querySelectorAll('.seg [data-sec]').forEach(b =>
        b.setAttribute('aria-pressed', String(b.dataset.sec === section)));
      renderBody(body, currentUser());
    }
  });

  if (user) bindEvents(body, user);
  renderBody(body, user);
}

function renderBody(body, user) {
  if (!user) {
    body.innerHTML = `
      <div class="card gate">
        <div class="gate-icon" aria-hidden="true">${section === 'packing' ? '🧳' : '📌'}</div>
        <p>${esc(tr('kit.gate'))}</p>
        <a class="btn" href="#/profile">${icons.user} ${esc(tr('sos.goProfile'))}</a>
      </div>`;
    return;
  }
  if (section === 'packing') renderPacking(body, user);
  else renderPlans(body, user);
}

/* ---------- one delegated listener set per view ---------- */
function bindEvents(body, user) {
  body.addEventListener('change', e => {
    const packKey = e.target.dataset?.key;
    if (packKey) {
      const d = getPacking(user);
      if (e.target.checked) d.checked[packKey] = true; else delete d.checked[packKey];
      setPacking(user, d);
      renderPacking(body, user);
      return;
    }
    const planId = e.target.dataset?.planCheck;
    if (planId) {
      const plans = getPlans(user);
      const p = plans.find(x => x.id === planId);
      if (p) { p.done = e.target.checked; setPlans(user, plans); renderPlans(body, user); }
    }
  });

  body.addEventListener('click', e => {
    const delKey = e.target.closest('[data-del]')?.dataset.del;
    if (delKey) {
      e.preventDefault();
      const d = getPacking(user);
      const [catId] = delKey.split('/');
      d.custom[catId] = (d.custom[catId] || []).filter(it => itemKey(catId, it.id) !== delKey);
      delete d.checked[delKey];
      setPacking(user, d);
      renderPacking(body, user);
      return;
    }
    if (e.target.closest('#pack-reset')) {
      if (!confirm(tr('kit.resetConfirm'))) return;
      const d = getPacking(user);
      d.checked = {};
      setPacking(user, d);
      renderPacking(body, user);
      return;
    }
    const planDel = e.target.closest('[data-plan-del]')?.dataset.planDel;
    if (planDel) {
      setPlans(user, getPlans(user).filter(p => p.id !== planDel));
      renderPlans(body, user);
      return;
    }
    const sug = e.target.closest('[data-suggest]')?.dataset.suggest;
    if (sug) {
      const s = PLAN_SUGGESTIONS.find(x => x.id === sug);
      if (!s) return;
      const plans = getPlans(user);
      plans.unshift({
        id: uid(), suggestionId: s.id,
        title: t(s.title), kind: s.kind, day: s.day, link: null, done: false
      });
      setPlans(user, plans);
      toast(tr('kit.added'));
      renderPlans(body, user);
      return;
    }
    if (e.target.closest('#plans-share')) {
      shareText(tr('kit.myPlansHeader'), plansAsText(getPlans(user)));
    }
  });

  body.addEventListener('submit', e => {
    e.preventDefault();
    const catId = e.target.dataset?.add;
    if (catId) {
      const input = e.target.querySelector('input');
      const label = input.value.trim();
      if (!label) return;
      const d = getPacking(user);
      d.custom[catId] = d.custom[catId] || [];
      d.custom[catId].push({ id: uid(), label });
      setPacking(user, d);
      openCats.add(catId);
      renderPacking(body, user);
      return;
    }
    if (e.target.id === 'plan-form') {
      const f = new FormData(e.target);
      const title = String(f.get('title') || '').trim();
      if (!title) return;
      const kind = String(f.get('kind'));
      const plans = getPlans(user);
      plans.unshift({
        id: uid(),
        title,
        kind: KINDS.includes(kind) ? kind : 'do',
        day: Number(f.get('day')) || null,
        link: String(f.get('link') || '').trim() || null,
        done: false
      });
      setPlans(user, plans);
      renderPlans(body, user);
    }
  });

  /* remember which categories are open across re-renders */
  body.addEventListener('toggle', e => {
    const det = e.target;
    if (!det.classList?.contains('pack-cat')) return;
    if (det.open) openCats.add(det.dataset.cat); else openCats.delete(det.dataset.cat);
  }, true);
}

let uidCounter = 0;
function uid() {
  return 'i' + Date.now().toString(36) + (uidCounter++).toString(36);
}

/* ================= PACKING ================= */
function getPacking(user) {
  const data = userStore(user).get('packing', null);
  return { checked: data?.checked || {}, custom: data?.custom || {} };
}
function setPacking(user, data) {
  userStore(user).set('packing', data);
}
const itemKey = (catId, itemId) => catId + '/' + itemId;

function packingCounts(data) {
  let total = 0, done = 0;
  for (const cat of PACKING_TEMPLATE) {
    const customs = data.custom[cat.id] || [];
    total += cat.items.length + customs.length;
    for (const it of cat.items) if (data.checked[itemKey(cat.id, it.id)]) done++;
    for (const it of customs) if (data.checked[itemKey(cat.id, it.id)]) done++;
  }
  return { total, done };
}

function renderPacking(body, user) {
  const data = getPacking(user);
  const { total, done } = packingCounts(data);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const catHTML = cat => {
    const customs = data.custom[cat.id] || [];
    const all = [...cat.items, ...customs.map(c => ({ ...c, custom: true }))];
    const catDone = all.filter(it => data.checked[itemKey(cat.id, it.id)]).length;
    const rows = all.map(it => {
      const key = itemKey(cat.id, it.id);
      return `
        <label class="checkrow">
          <input type="checkbox" data-key="${esc(key)}" ${data.checked[key] ? 'checked' : ''}>
          <span class="cr-label">${esc(t(it.label))}</span>
          ${it.custom ? `<button type="button" class="cr-del" data-del="${esc(key)}" aria-label="${esc(tr('common.delete'))}">✕</button>` : ''}
        </label>`;
    }).join('');
    return `
      <details class="card pack-cat" data-cat="${esc(cat.id)}" ${openCats.has(cat.id) ? 'open' : ''}>
        <summary><span aria-hidden="true">${cat.icon}</span> ${esc(t(cat.name))}
          <span class="cat-count ${catDone === all.length && all.length ? 'done' : ''}">${catDone}/${all.length}</span>
        </summary>
        <div class="pack-body">
          ${rows}
          <form class="add-row" data-add="${esc(cat.id)}">
            <input type="text" maxlength="80" placeholder="+ ${esc(tr('kit.addItem'))} — ${esc(tr('kit.itemPlaceholder'))}">
          </form>
        </div>
      </details>`;
  };

  body.innerHTML = `
    <div class="progress-wrap">
      <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <i style="width:${pct}%"></i>
      </div>
      <span class="progress-label">${done}/${total} ${esc(tr('kit.packed'))}</span>
    </div>
    ${PACKING_TEMPLATE.map(catHTML).join('')}
    <div class="kit-toolrow">
      <button class="btn btn-ghost btn-sm" id="pack-reset">${esc(tr('kit.resetChecks'))}</button>
    </div>`;
}

/* ================= PLANS ================= */
function getPlans(user) { return userStore(user).get('plans', []); }
function setPlans(user, plans) { userStore(user).set('plans', plans); }

const KINDS = ['do', 'eat', 'see', 'stay'];
const kindLabel = k => tr('kit.kind' + k[0].toUpperCase() + k.slice(1));

function plansAsText(plans) {
  const lines = [`📌 ${tr('kit.myPlansHeader')}`, ''];
  for (const p of plans) {
    const day = p.day ? `[${tr('common.day')} ${p.day}] ` : '';
    lines.push(`${p.done ? '✅' : '⬜'} ${day}${p.title}${p.link ? ` — ${p.link}` : ''}`);
  }
  return lines.join('\n');
}

function renderPlans(body, user) {
  const plans = getPlans(user);
  const mine = new Set(plans.map(p => p.suggestionId).filter(Boolean));
  const suggestions = PLAN_SUGGESTIONS.filter(s => !mine.has(s.id));

  const planRow = p => {
    const day = p.day ? getDay(p.day) : null;
    const safeKind = KINDS.includes(p.kind) ? p.kind : 'do';
    const safeLink = p.link && /^https?:\/\//i.test(p.link) ? p.link : null;
    return `
      <div class="card plan-item">
        <label class="checkrow" style="padding:0;flex:0 0 auto">
          <input type="checkbox" data-plan-check="${esc(p.id)}" ${p.done ? 'checked' : ''} aria-label="${esc(p.title)}">
        </label>
        <div class="plan-main">
          <div class="plan-title" ${p.done ? 'style="text-decoration:line-through;color:var(--faint)"' : ''}>${esc(p.title)}</div>
          <div class="plan-meta">
            <span class="kind-tag kind-${safeKind}">${esc(kindLabel(safeKind))}</span>
            ${day ? `<a href="#/day/${day.n}" class="badge">${esc(tr('common.day'))} ${day.n} · ${esc(t(day.date))}</a>` : ''}
            ${safeLink ? `<a href="${esc(safeLink)}" target="_blank" rel="noopener">↗ ${esc(tr('kit.linkLabel'))}</a>` : ''}
          </div>
        </div>
        <button class="cr-del" data-plan-del="${esc(p.id)}" aria-label="${esc(tr('common.delete'))}">✕</button>
      </div>`;
  };

  const dayOptions = ['<option value="">' + esc(tr('kit.planAnyDay')) + '</option>']
    .concat(TRIP.map(d => `<option value="${d.n}">${esc(tr('common.day'))} ${d.n} · ${esc(t(d.date))}</option>`))
    .join('');

  body.innerHTML = `
    <p class="view-sub" style="margin-bottom:14px">${esc(tr('kit.plansSub'))}</p>

    <form class="card card-pad" id="plan-form" style="margin-bottom:16px">
      <label class="field"><span>${esc(tr('kit.planTitle'))}</span>
        <input name="title" maxlength="120" required placeholder="${esc(tr('kit.planTitlePh'))}"></label>
      <div class="form-row">
        <label class="field"><span>${esc(tr('kit.planKind'))}</span>
          <select name="kind">${KINDS.map(k => `<option value="${k}">${esc(kindLabel(k))}</option>`).join('')}</select></label>
        <label class="field"><span>${esc(tr('kit.planDay'))}</span>
          <select name="day">${dayOptions}</select></label>
      </div>
      <label class="field"><span>${esc(tr('kit.planLink'))}</span>
        <input name="link" type="url" placeholder="https://…"></label>
      <button class="btn" type="submit">${icons.check} ${esc(tr('kit.addPlan'))}</button>
    </form>

    <div id="plan-list">
      ${plans.length ? plans.map(planRow).join('') : `<div class="empty">${esc(tr('kit.emptyPlans'))}</div>`}
    </div>

    ${plans.length ? `
      <div class="kit-toolrow">
        <button class="btn btn-ghost btn-sm" id="plans-share">${icons.share} ${esc(tr('kit.sharePlans'))}</button>
      </div>` : ''}

    ${suggestions.length ? `
      <h2 class="sec-title display" style="font-size:17px">${esc(tr('kit.suggestions'))}</h2>
      <div class="suggest-row">
        ${suggestions.map(s => `
          <button class="suggest-chip" data-suggest="${esc(s.id)}">
            <span class="sg-day">${esc(tr('common.day'))} ${s.day} · ${esc(kindLabel(s.kind))}</span>
            ${esc(t(s.title))}
          </button>`).join('')}
      </div>` : ''}`;
}
