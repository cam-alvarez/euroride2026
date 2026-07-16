/* =====================================================================
   PLAN EDITOR — one modal to create or edit a plan, shared by the
   Plans list (Kit tab), the day pages, and the chat assistant's
   "add to plans" buttons. Plans live at userStore('plans'):
     [ {id, title, kind, day, link, done, suggestionId?} ]
   ===================================================================== */
import { TRIP } from './data/trip.js';
import { t, tr } from './i18n.js';
import { esc, icons, toast, openModal, closeModal } from './ui.js';
import { userStore } from './store.js';

export const KINDS = ['do', 'eat', 'see', 'stay'];
export const kindLabel = k => tr('kit.kind' + k[0].toUpperCase() + k.slice(1));

export const getPlans = user => userStore(user).get('plans', []);
export const setPlans = (user, plans) => userStore(user).set('plans', plans);

let uidCounter = 0;
export function uid() {
  return 'i' + Date.now().toString(36) + (uidCounter++).toString(36);
}

/**
 * Open the create/edit modal.
 *   plan      — existing plan object to edit (by id), or null to create
 *   defaults  — prefills for a new plan: {title, kind, day, link}
 *   onSaved   — called after the plans list has been written
 */
export function openPlanEditor(user, { plan = null, defaults = {}, onSaved } = {}) {
  const p = plan || { title: '', kind: 'do', day: null, link: null, ...defaults };

  const dayOptions = ['<option value="">' + esc(tr('kit.planAnyDay')) + '</option>']
    .concat(TRIP.map(d =>
      `<option value="${d.n}" ${Number(p.day) === d.n ? 'selected' : ''}>${esc(tr('common.day'))} ${d.n} · ${esc(t(d.date))}</option>`))
    .join('');

  openModal(`
    <h3>${esc(plan ? tr('kit.editPlan') : tr('kit.addPlan'))}</h3>
    <form id="pe-form">
      <label class="field"><span>${esc(tr('kit.planTitle'))}</span>
        <input name="title" maxlength="120" required value="${esc(p.title)}"></label>
      <div class="form-row">
        <label class="field"><span>${esc(tr('kit.planKind'))}</span>
          <select name="kind">${KINDS.map(k =>
            `<option value="${k}" ${p.kind === k ? 'selected' : ''}>${esc(kindLabel(k))}</option>`).join('')}</select></label>
        <label class="field"><span>${esc(tr('kit.planDay'))}</span>
          <select name="day">${dayOptions}</select></label>
      </div>
      <label class="field"><span>${esc(tr('kit.planLink'))}</span>
        <input name="link" type="url" placeholder="https://…" value="${esc(p.link || '')}"></label>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" data-close>${esc(tr('common.cancel'))}</button>
        <button type="submit" class="btn">${icons.check} ${esc(tr('kit.savePlan'))}</button>
      </div>
    </form>`);

  document.getElementById('pe-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = String(f.get('title') || '').trim();
    if (!title) return;
    const kind = String(f.get('kind'));
    const patch = {
      title,
      kind: KINDS.includes(kind) ? kind : 'do',
      day: Number(f.get('day')) || null,
      link: String(f.get('link') || '').trim() || null
    };

    const plans = getPlans(user);
    if (plan) {
      const existing = plans.find(x => x.id === plan.id);
      if (existing) Object.assign(existing, patch);
      setPlans(user, plans);
      toast(tr('common.saved'));
    } else {
      plans.unshift({ id: uid(), done: false, ...patch });
      setPlans(user, plans);
      toast(tr('kit.added'));
    }
    closeModal();
    onSaved?.();
  });
}

/** Best-effort "which day is this about?" from free text (EN + ES). */
export function detectDay(...texts) {
  for (const text of texts) {
    const m = /\bd(?:ay|ía|ia)\s*(\d{1,2})\b/i.exec(String(text || ''));
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= TRIP.length) return n;
    }
  }
  return null;
}
