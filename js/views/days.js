/* =====================================================================
   DAYS — vertical itinerary timeline. Tap a day for the full brief.
   ===================================================================== */
import { TRIP, todayIndex } from '../data/trip.js';
import { t, tr } from '../i18n.js';
import { esc, sparkline } from '../ui.js';

export function renderDays(view) {
  const today = todayIndex();

  const rows = TRIP.map(d => {
    const isToday = today === d.n;
    const km = typeof d.km === 'string' ? d.km : t(d.km);
    return `
    <a class="day-item ${isToday ? 'is-today' : ''}" href="#/day/${d.n}">
      <div class="day-node" aria-hidden="true">${d.n}</div>
      <div class="day-item-main">
        <div class="day-item-date">${esc(t(d.date))} ${isToday ? `<span class="today-flag">${esc(tr('common.today'))}</span>` : ''}</div>
        <div class="day-item-title">${d.flag} ${esc(t(d.title))}</div>
        <div class="day-item-route">${esc(t(d.route))}</div>
      </div>
      <div class="day-item-side">
        <span class="day-item-km">${esc(km)}</span>
        ${sparkline(d.profile)}
      </div>
    </a>`;
  }).join('');

  view.innerHTML = `
    <div class="view-head">
      <h1 class="view-title display">${esc(tr('days.title'))}</h1>
      <p class="view-sub">${esc(tr('days.sub'))}</p>
    </div>
    <div class="day-list">${rows}</div>`;
}
