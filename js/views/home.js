/* =====================================================================
   HOME — hero with greeting, countdown / today brief, quick actions,
   stats and the "before you roll" essentials.
   ===================================================================== */
import { TRIP, TRIP_STATS, ESSENTIALS, todayIndex, daysToStart, getDay } from '../data/trip.js';
import { PACKING_TEMPLATE } from '../data/packing.js';
import { t, tr } from '../i18n.js';
import { esc, icons, openShare } from '../ui.js';
import { currentUser } from '../auth.js';
import { userStore } from '../store.js';

export function renderHome(view) {
  const user = currentUser();
  const today = todayIndex();
  const toGo = daysToStart();
  const done = !today && toGo <= 0;

  /* Hero context: today-brief during the trip. */
  let contextCard = '';
  if (today) {
    const d = getDay(today);
    contextCard = `
      <div class="today-card">
        <div class="tc-kicker">${esc(tr('home.todayBrief'))} · ${esc(t(d.date))}</div>
        <h3>${esc(tr('common.day'))} ${d.n} — ${esc(t(d.title))}</h3>
        <p>${esc(t(d.route))}</p>
        <a class="btn" href="#/day/${d.n}">${icons.next} ${esc(tr('home.openToday'))}</a>
      </div>`;
  }

  /* Quick actions */
  const nextDay = today ? getDay(today) : (toGo > 0 ? getDay(1) : getDay(TRIP.length));
  const nextLabel = today ? tr('home.qaToday') : (toGo > 0 ? tr('home.qaFirstRide') : tr('home.qaLastDay'));

  let packingSub = esc(tr('home.qaPackingSub'));
  let plansSub = esc(tr('home.qaPlansSub'));
  if (user) {
    const packing = userStore(user).get('packing', null);
    if (packing) {
      let total = 0, checked = 0;
      for (const cat of PACKING_TEMPLATE) {
        const customs = (packing.custom || {})[cat.id] || [];
        total += cat.items.length + customs.length;
        for (const it of [...cat.items, ...customs]) {
          if ((packing.checked || {})[cat.id + '/' + it.id]) checked++;
        }
      }
      packingSub = `<b>${checked}/${total}</b> ${esc(tr('kit.packed'))}`;
    }
    const plans = userStore(user).get('plans', []);
    if (plans.length) plansSub = `<b>${plans.length}</b> ${esc(tr('home.qaPlansCount'))}`;
  }

  const quick = `
    <h2 class="sec-title display" style="margin-top:26px">${esc(tr('home.quickTitle'))}</h2>
    <div class="quick-grid">
      <a class="card quick-card" href="#/day/${nextDay.n}">
        <span class="qc-icon">${icons.route}</span>
        <span class="qc-label">${esc(nextLabel)}</span>
        <span class="qc-sub">${esc(tr('common.day'))} ${nextDay.n} · ${esc(t(nextDay.title))}</span>
      </a>
      <a class="card quick-card qc-danger" href="#/sos">
        <span class="qc-icon">${icons.sos}</span>
        <span class="qc-label">${esc(tr('home.qaSos'))}</span>
        <span class="qc-sub">${esc(tr('home.qaSosSub'))}</span>
      </a>
      <a class="card quick-card" href="#/kit/packing">
        <span class="qc-icon">${icons.kit}</span>
        <span class="qc-label">${esc(tr('home.qaPacking'))}</span>
        <span class="qc-sub">${packingSub}</span>
      </a>
      <a class="card quick-card" href="#/kit/plans">
        <span class="qc-icon">${icons.pin}</span>
        <span class="qc-label">${esc(tr('home.qaPlans'))}</span>
        <span class="qc-sub">${plansSub}</span>
      </a>
    </div>`;

  const statCards = TRIP_STATS.map(s =>
    `<div class="stat"><b>${esc(s.value)}</b><span>${esc(t(s.label))}</span></div>`).join('');
  const countdownCard = (toGo > 0)
    ? `<div class="stat stat-accent"><b>${toGo}</b><span>${esc(toGo === 1 ? tr('home.countdownOne') : tr('home.countdown'))}</span></div>`
    : '';

  const essCards = ESSENTIALS.map(e => `
    <div class="card ess">
      <h4><span aria-hidden="true">${e.icon}</span> ${esc(t(e.title))}</h4>
      <p>${t(e.body)}</p>
    </div>`).join('');

  view.innerHTML = `
    <section class="hero">
      ${user ? `<div class="hello">${esc(tr('home.hi'))}, <b>${esc(user)}</b> 👋</div>` : ''}
      <div class="kicker">${esc(tr('home.kicker'))}</div>
      <h1 class="hero-title display">${esc(tr('home.title1'))} <span class="hollow">${esc(tr('home.title2'))}</span></h1>
      <p class="hero-sub">${esc(tr('home.sub'))}</p>
      <div class="stats">${statCards}${countdownCard}</div>
      ${done ? `<p class="hero-sub" style="font-weight:600">🏁 ${esc(tr('home.tripDone'))}</p>` : ''}
      ${contextCard}
    </section>

    ${quick}

    <div class="home-cta">
      <a class="btn" href="#/days">${icons.route} ${esc(tr('home.viewItinerary'))}</a>
      <button class="btn btn-ghost" id="home-share">${icons.share} ${esc(tr('home.shareApp'))}</button>
    </div>

    <section>
      <h2 class="sec-title display">${esc(tr('home.essentials'))}</h2>
      <p class="sec-sub">${esc(tr('home.essentialsSub'))}</p>
      <div class="ess-grid">${essCards}</div>
    </section>`;

  view.querySelector('#home-share').addEventListener('click', openShare);
}
