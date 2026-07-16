/* =====================================================================
   SOS — the reworked emergency feature.
   Designed around three real moments:
     1. "Something happened NOW"  → giant 112 call button, works offline.
     2. "Medics need my info"     → personal Emergency Card: show big,
        send via any app, or copy as text. Stored only on this device.
     3. "What do I do / who do I call?" → crash protocol, per-country
        numbers, rental + documents reference.
   ===================================================================== */
import { COUNTRY_NUMBERS, CRASH_PROTOCOL, RENTAL, REQUIRED_DOCS } from '../data/emergency.js';
import { t, tr } from '../i18n.js';
import { esc, icons, toast, copyText, shareText } from '../ui.js';
import { currentUser } from '../auth.js';
import { userStore } from '../store.js';

let editing = false;

const CARD_FIELDS = [
  ['fullName', 'sos.fullName'],
  ['dob', 'sos.dob'],
  ['blood', 'sos.blood'],
  ['allergies', 'sos.allergies'],
  ['meds', 'sos.meds'],
  ['conditions', 'sos.conditions'],
  ['insurer', 'sos.insurer'],
  ['policy', 'sos.policy'],
  ['insurancePhone', 'sos.insurancePhone']
];

function getCard(user) {
  return userStore(user).get('emergency', null);
}

function cardAsText(card) {
  const lines = [`🆘 ${tr('sos.cardShareHeader')}`, ''];
  for (const [key, label] of CARD_FIELDS) {
    if (card[key]) lines.push(`${tr(label)}: ${card[key]}`);
  }
  const contacts = (card.contacts || []).filter(c => c.name || c.phone);
  if (contacts.length) {
    lines.push('', tr('sos.contacts') + ':');
    for (const c of contacts) {
      lines.push(`• ${c.name}${c.rel ? ` (${c.rel})` : ''} — ${c.phone}`);
    }
  }
  if (card.notes) lines.push('', card.notes);
  return lines.join('\n');
}

/* ---------- render ---------- */
export function renderSos(view) {
  editing = false; // arriving at the view always shows the card, not a stale form
  const user = currentUser();
  const card = user ? getCard(user) : null;

  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('sos.title'))}</h1>
      <p class="view-sub">${esc(tr('sos.sub'))}</p>
    </div>

    <a class="sos-call" href="tel:112">
      <span class="sc-num">112</span>
      <span>
        <span class="sc-label">${esc(tr('sos.call112'))}</span>
        <span class="sc-sub" style="display:block">${esc(tr('sos.call112Sub'))}</span>
      </span>
      ${icons.phone}
    </a>

    <section id="em-card-zone"></section>

    <h2 class="sec-title display">${esc(tr('sos.crashTitle'))}</h2>
    <div class="proto-list">
      ${CRASH_PROTOCOL.map(step => `<div class="card proto-item"><p>${t(step)}</p></div>`).join('')}
    </div>

    <h2 class="sec-title display">${esc(tr('sos.countryNumbers'))}</h2>
    <div class="country-grid">
      ${COUNTRY_NUMBERS.map(c => `
        <div class="card country-card">
          <h4><span aria-hidden="true">${c.flag}</span> ${esc(t(c.name))}</h4>
          ${c.numbers.map(n => `
            <div class="num-row">
              <span>${esc(t(n.label))}</span>
              <a href="tel:${esc(n.tel.replace(/\s/g, ''))}">${esc(n.tel)}</a>
            </div>`).join('')}
        </div>`).join('')}
    </div>

    <h2 class="sec-title display">${esc(tr('sos.rentalTitle'))}</h2>
    <div class="card card-pad">
      <div class="card-title">🏍 ${esc(RENTAL.name)}</div>
      <p class="card-sub">${esc(t(RENTAL.note))}</p>
      <div style="margin-top:12px">
        <a class="btn btn-ghost btn-sm" href="${esc(RENTAL.mapUrl)}" target="_blank" rel="noopener">${icons.map} ${esc(tr('days.openMap'))}</a>
      </div>
    </div>

    <h2 class="sec-title display">${esc(tr('sos.docsTitle'))}</h2>
    <div class="card card-pad">
      <ul class="doc-list">
        ${REQUIRED_DOCS.map(doc => `<li>${esc(t(doc))}</li>`).join('')}
      </ul>
    </div>`;

  renderCardZone(view.querySelector('#em-card-zone'), user, card);
}

/* ---------- emergency card zone ---------- */
function renderCardZone(zone, user, card) {
  if (!user) {
    zone.innerHTML = `
      <div class="card gate">
        <div class="gate-icon" aria-hidden="true">🪪</div>
        <div class="card-title">${esc(tr('sos.myCard'))}</div>
        <p>${esc(tr('sos.needProfile'))}</p>
        <a class="btn" href="#/profile">${icons.user} ${esc(tr('sos.goProfile'))}</a>
      </div>`;
    return;
  }

  if (editing) { renderCardForm(zone, user, card); return; }

  if (!card) {
    zone.innerHTML = `
      <div class="card gate">
        <div class="gate-icon" aria-hidden="true">🪪</div>
        <div class="card-title">${esc(tr('sos.myCard'))}</div>
        <p>${esc(tr('sos.cardEmpty'))}</p>
        <button class="btn" id="em-create">${icons.edit} ${esc(tr('sos.createCard'))}</button>
        <p style="margin-top:12px;font-size:12px;color:var(--faint)">${esc(tr('sos.privacyNote'))}</p>
      </div>`;
    zone.querySelector('#em-create').addEventListener('click', () => {
      editing = true;
      renderCardZone(zone, user, card);
    });
    return;
  }

  const contacts = (card.contacts || []).filter(c => c.name || c.phone);
  zone.innerHTML = `
    <div class="em-card">
      <div class="em-head">
        <div>
          <h3>🆘 ${esc(tr('sos.myCard'))}</h3>
          <p>${esc(tr('sos.myCardSub'))}</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="em-edit">${icons.edit} ${esc(tr('common.edit'))}</button>
      </div>
      <div class="em-body">
        <div class="em-grid">${cardFieldsHTML(card)}</div>
        ${contacts.length ? `
          <div class="em-contacts">
            <div class="em-field" style="margin-bottom:6px"><span>${esc(tr('sos.contacts'))}</span></div>
            ${contacts.map(c => `
              <div class="em-contact">
                <span class="c-who"><b>${esc(c.name)}</b>${c.rel ? `<span>${esc(c.rel)}</span>` : ''}</span>
                <a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>
              </div>`).join('')}
          </div>` : ''}
        ${card.notes ? `<p style="margin-top:12px;font-size:13.5px;color:var(--muted)">${esc(card.notes)}</p>` : ''}
      </div>
      <div class="em-actions">
        <button class="btn" id="em-show">${icons.alert} ${esc(tr('sos.showCard'))}</button>
        <button class="btn btn-ghost" id="em-share">${icons.share} ${esc(tr('sos.shareCard'))}</button>
        <button class="btn btn-ghost" id="em-copy">${icons.copy} ${esc(tr('sos.copyCard'))}</button>
      </div>
    </div>
    <p style="margin:8px 4px 0;font-size:12px;color:var(--faint)">${esc(tr('sos.privacyNote'))}</p>`;

  zone.querySelector('#em-edit').addEventListener('click', () => {
    editing = true;
    renderCardZone(zone, user, card);
  });
  zone.querySelector('#em-share').addEventListener('click', () =>
    shareText(tr('sos.cardShareHeader'), cardAsText(card)));
  zone.querySelector('#em-copy').addEventListener('click', () => copyText(cardAsText(card)));
  zone.querySelector('#em-show').addEventListener('click', () => showFullscreen(card));
}

function cardFieldsHTML(card) {
  return CARD_FIELDS.map(([key, label]) => `
    <div class="em-field">
      <span>${esc(tr(label))}</span>
      ${card[key] ? `<b>${esc(card[key])}</b>` : `<b class="em-missing">${esc(tr('sos.notSet'))}</b>`}
    </div>`).join('');
}

/* ---------- fullscreen card (show to medics) ---------- */
function showFullscreen(card) {
  const overlay = document.createElement('div');
  overlay.className = 'em-fullscreen';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', tr('sos.cardShareHeader'));
  const contacts = (card.contacts || []).filter(c => c.name || c.phone);
  overlay.innerHTML = `
    <div class="em-fs-inner">
      <button class="modal-close" aria-label="${esc(tr('common.close'))}" style="position:fixed;top:14px;right:14px">✕</button>
      <div class="em-fs-title">🆘 ${esc(tr('sos.cardShareHeader'))}</div>
      <div class="em-grid">${cardFieldsHTML(card)}</div>
      ${contacts.length ? `
        <div class="em-contacts">
          <div class="em-field" style="margin-bottom:6px"><span>${esc(tr('sos.contacts'))}</span></div>
          ${contacts.map(c => `
            <div class="em-contact">
              <span class="c-who"><b>${esc(c.name)}</b>${c.rel ? `<span>${esc(c.rel)}</span>` : ''}</span>
              <a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>
            </div>`).join('')}
        </div>` : ''}
      ${card.notes ? `<p style="margin-top:14px;font-size:15px;color:var(--muted)">${esc(card.notes)}</p>` : ''}
    </div>`;
  document.body.appendChild(overlay);
  const opener = document.activeElement;
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    if (opener && document.contains(opener)) opener.focus?.();
  };
  const onKey = e => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // keep focus inside the overlay
      const focusables = overlay.querySelectorAll('button, a[href]');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  overlay.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  overlay.querySelector('.modal-close').focus();
}

/* ---------- edit form ---------- */
function renderCardForm(zone, user, card) {
  const v = key => esc(card?.[key] || '');
  const contacts = card?.contacts || [];
  const contactRow = i => {
    const c = contacts[i] || {};
    return `
      <div class="form-row" style="grid-template-columns:1fr 1fr">
        <label class="field"><span>${esc(tr('sos.contactName'))} ${i + 1}</span>
          <input name="c${i}name" value="${esc(c.name || '')}" autocomplete="off"></label>
        <label class="field"><span>${esc(tr('sos.contactRel'))}</span>
          <input name="c${i}rel" value="${esc(c.rel || '')}" autocomplete="off"></label>
      </div>
      <label class="field"><span>${esc(tr('sos.contactPhone'))}</span>
        <input name="c${i}phone" type="tel" value="${esc(c.phone || '')}" autocomplete="off" placeholder="+1 …"></label>`;
  };

  zone.innerHTML = `
    <div class="em-card">
      <div class="em-head"><div><h3>🆘 ${esc(tr('sos.myCard'))}</h3><p>${esc(tr('sos.privacyNote'))}</p></div></div>
      <form class="em-body" id="em-form">
        <label class="field"><span>${esc(tr('sos.fullName'))}</span><input name="fullName" value="${v('fullName')}" autocomplete="name"></label>
        <div class="form-row">
          <label class="field"><span>${esc(tr('sos.dob'))}</span><input name="dob" value="${v('dob')}" placeholder="1962-05-14" autocomplete="bday"></label>
          <label class="field"><span>${esc(tr('sos.blood'))}</span>
            <select name="blood">
              ${['', 'O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'].map(b =>
                `<option value="${b}" ${card?.blood === b ? 'selected' : ''}>${b || '—'}</option>`).join('')}
            </select></label>
        </div>
        <label class="field"><span>${esc(tr('sos.allergies'))}</span><input name="allergies" value="${v('allergies')}" placeholder="${esc(tr('sos.none'))}…"></label>
        <label class="field"><span>${esc(tr('sos.meds'))}</span><input name="meds" value="${v('meds')}"></label>
        <label class="field"><span>${esc(tr('sos.conditions'))}</span><input name="conditions" value="${v('conditions')}"></label>
        <div class="form-row">
          <label class="field"><span>${esc(tr('sos.insurer'))}</span><input name="insurer" value="${v('insurer')}"></label>
          <label class="field"><span>${esc(tr('sos.policy'))}</span><input name="policy" value="${v('policy')}"></label>
        </div>
        <label class="field"><span>${esc(tr('sos.insurancePhone'))}</span><input name="insurancePhone" type="tel" value="${v('insurancePhone')}"></label>
        <div class="em-field" style="margin:8px 0 10px"><span>${esc(tr('sos.contacts'))}</span></div>
        ${contactRow(0)}${contactRow(1)}
        <label class="field"><span>${esc(tr('sos.extraNotes'))}</span><textarea name="notes">${esc(card?.notes || '')}</textarea></label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="submit" class="btn">${icons.check} ${esc(tr('common.save'))}</button>
          <button type="button" class="btn btn-ghost" id="em-cancel">${esc(tr('common.cancel'))}</button>
        </div>
      </form>
    </div>`;

  zone.querySelector('#em-cancel').addEventListener('click', () => {
    editing = false;
    renderCardZone(zone, user, card);
  });

  zone.querySelector('#em-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const g = name => String(f.get(name) || '').trim();
    const newCard = {
      fullName: g('fullName'), dob: g('dob'), blood: g('blood'),
      allergies: g('allergies'), meds: g('meds'), conditions: g('conditions'),
      insurer: g('insurer'), policy: g('policy'), insurancePhone: g('insurancePhone'),
      contacts: [0, 1].map(i => ({ name: g(`c${i}name`), rel: g(`c${i}rel`), phone: g(`c${i}phone`) }))
        .filter(c => c.name || c.phone),
      notes: g('notes'),
      updated: Date.now()
    };
    userStore(user).set('emergency', newCard);
    editing = false;
    toast(tr('common.saved'));
    renderCardZone(zone, user, newCard);
  });
}
