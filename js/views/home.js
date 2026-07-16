/* =====================================================================
   HOME — hero, countdown / today brief, stats, route map, essentials.
   ===================================================================== */
import { TRIP_STATS, ESSENTIALS, todayIndex, daysToStart, getDay } from '../data/trip.js';
import { t, tr } from '../i18n.js';
import { esc, icons, openShare } from '../ui.js';
import { routeMapSVG } from '../map.js';

export function renderHome(view) {
  const today = todayIndex();
  const toGo = daysToStart();

  /* Hero context strip: countdown before the trip, today-brief during it. */
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

  const done = !today && toGo <= 0;

  view.innerHTML = `
    <section class="hero">
      <div class="kicker">${esc(tr('home.kicker'))}</div>
      <h1 class="hero-title display">${esc(tr('home.title1'))} <span class="hollow">${esc(tr('home.title2'))}</span></h1>
      <p class="hero-sub">${esc(tr('home.sub'))}</p>
      <div class="stats">${statCards}${countdownCard}</div>
      ${done ? `<p class="hero-sub" style="font-weight:600">🏁 ${esc(tr('home.tripDone'))}</p>` : ''}
      ${contextCard}
    </section>

    <section class="card map-card">
      <div class="map-head">
        <span class="card-title display">${esc(tr('home.theRoute'))}</span>
        <span class="hint">${esc(tr('home.mapHint'))}</span>
      </div>
      ${routeMapSVG(today)}
    </section>

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
