/* =====================================================================
   DAY DETAIL — the full brief for one day: route, stats, elevation,
   actions (map / video / weather), options, lodging, ride notes.
   ===================================================================== */
import { TRIP, getDay, todayIndex } from '../data/trip.js';
import { t, tr } from '../i18n.js';
import { esc, icons, elevationStrip, openVideo } from '../ui.js';
import { remoteEnabled } from '../config.js';

const TYPE_LABEL = {
  ride: 'days.typeRide',
  free: 'days.typeFree',
  flex: 'days.typeFlex',
  dropoff: 'days.typeDrop'
};

export function renderDay(view, param) {
  const d = getDay(param);
  if (!d) { location.hash = '#/days'; return; }
  const isToday = todayIndex() === d.n;

  /* --- badges --- */
  const badges = [];
  badges.push(`<span class="badge badge-accent">${esc(tr(TYPE_LABEL[d.type] || TYPE_LABEL.ride))}</span>`);
  if (d.km) badges.push(`<span class="badge">📏 ${esc(t(d.km))}</span>`);
  if (d.time) badges.push(`<span class="badge">⏱ ${esc(t(d.time))} · ${esc(tr('days.rideTime'))}</span>`);
  if (d.high) badges.push(`<span class="badge">▲ ${esc(d.high.m)} · ${esc(t(d.high.name))}</span>`);
  if (d.lodging?.nights > 1) badges.push(`<span class="badge">🛏 ×${d.lodging.nights}</span>`);

  /* --- actions --- */
  const actions = [];
  if (d.mapUrl) actions.push(`<a class="btn" href="${esc(d.mapUrl)}" target="_blank" rel="noopener">${icons.map} ${esc(tr('days.routeMap'))}</a>`);
  if (d.videoId) actions.push(`<button class="btn btn-ghost" data-video="${esc(d.videoId)}">${icons.play} ${esc(tr('days.video'))}</button>`);
  if (d.lodging?.area) {
    const weatherUrl = 'https://www.google.com/search?q=' + encodeURIComponent('weather ' + d.lodging.area);
    actions.push(`<a class="btn btn-ghost" href="${weatherUrl}" target="_blank" rel="noopener">${icons.cloud} ${esc(tr('days.weather'))}</a>`);
  }
  if (remoteEnabled()) {
    actions.push(`<a class="btn btn-ghost" href="#/chat" id="ask-ai">💬 ${esc(tr('days.askAi'))}</a>`);
  }

  /* --- options (POIs / optional loops) --- */
  const optionsBlock = d.options ? `
    <h2 class="sec-title display">${esc(tr('days.optionsTitle'))}</h2>
    ${d.options.map(o => `
      <div class="card opt-row">
        <div>
          <div class="o-name">${esc(t(o.name))}${o.km ? ` <span class="o-km">· ${esc(o.km)}</span>` : ''}</div>
          <div class="o-blurb">${esc(t(o.blurb))}</div>
        </div>
        <a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(tr('days.openMap'))} →</a>
      </div>`).join('')}` : '';

  /* --- lodging --- */
  let lodgingBlock = '';
  if (d.lodging && (d.lodging.url || d.lodging.area)) {
    const link = d.lodging.url
      ? `<a href="${esc(d.lodging.url)}" target="_blank" rel="noopener">${esc(tr('days.lodgingView'))} →</a>`
      : `<a href="https://www.google.com/maps/search/${encodeURIComponent('hotels near ' + d.lodging.area)}" target="_blank" rel="noopener">${esc(tr('days.lodgingNear'))} →</a>`;
    lodgingBlock = `
      <div class="card lodge-card">
        <div>
          <span class="l-tag">${esc(tr('days.lodgingTag'))}</span>
          <div class="l-name">🛏 ${esc(t(d.lodging.name))}</div>
        </div>
        ${link}
      </div>`;
  } else if (d.lodging) {
    lodgingBlock = `<div class="card lodge-card"><div class="l-name">${esc(t(d.lodging.name))}</div></div>`;
  }

  /* --- ride notes --- */
  const noteDefs = [
    ['fuel', '⛽', 'days.nFuel'],
    ['tolls', '🎫', 'days.nTolls'],
    ['road', '🌦', 'days.nRoad'],
    ['food', '🍝', 'days.nFood']
  ];
  const notesBlock = d.notes ? `
    <h2 class="sec-title display">${esc(tr('days.notesTitle'))}</h2>
    <div class="notes-grid">
      ${noteDefs.map(([key, ico, label]) => d.notes[key] ? `
        <div class="card note-card">
          <h5><span aria-hidden="true">${ico}</span> ${esc(tr(label))}</h5>
          <p>${esc(t(d.notes[key]))}</p>
        </div>` : '').join('')}
    </div>` : '';

  /* --- prev / next --- */
  const prev = getDay(d.n - 1);
  const next = getDay(d.n + 1);
  const navFoot = `
    <div class="day-navfoot">
      ${prev ? `<a href="#/day/${prev.n}"><span class="card navfoot-card">
          <span class="nf-dir">← ${esc(tr('days.prevDay'))} · ${esc(tr('common.day'))} ${prev.n}</span>
          <span class="nf-title">${esc(t(prev.title))}</span>
        </span></a>` : '<span class="spacer"></span>'}
      ${next ? `<a href="#/day/${next.n}"><span class="card navfoot-card nf-next">
          <span class="nf-dir">${esc(tr('days.nextDay'))} · ${esc(tr('common.day'))} ${next.n} →</span>
          <span class="nf-title">${esc(t(next.title))}</span>
        </span></a>` : '<span class="spacer"></span>'}
    </div>`;

  view.innerHTML = `
    <div class="day-hero">
      <div class="crumbs">
        <a class="crumb-back" href="#/days">${icons.back} ${esc(tr('common.back'))}</a>
        <div class="day-pager">
          ${prev ? `<a href="#/day/${prev.n}" aria-label="${esc(tr('days.prevDay'))}">${icons.back}</a>`
                 : `<span aria-hidden="true">${icons.back}</span>`}
          ${next ? `<a href="#/day/${next.n}" aria-label="${esc(tr('days.nextDay'))}">${icons.next}</a>`
                 : `<span aria-hidden="true">${icons.next}</span>`}
        </div>
      </div>
      <div class="day-eyebrow">
        ${esc(tr('common.day'))} ${d.n} ${esc(tr('common.of'))} ${TRIP.length} · ${esc(t(d.date))}
        ${isToday ? `<span class="today-flag">${esc(tr('common.today'))}</span>` : ''}
      </div>
      <h1 class="day-title display">${d.flag} ${esc(t(d.title))}</h1>
      <div class="day-route-line">${esc(t(d.route))}</div>
      ${elevationStrip(d.profile, d.high ? `${d.high.m} · ${t(d.high.name)}` : null)}
      <div class="day-badges">${badges.join('')}</div>
      <p class="day-desc">${esc(t(d.desc))}</p>
      ${actions.length ? `<div class="day-actions">${actions.join('')}</div>` : ''}
    </div>
    ${optionsBlock}
    ${lodgingBlock}
    ${notesBlock}
    ${navFoot}`;

  view.querySelector('[data-video]')?.addEventListener('click', e => {
    openVideo(e.currentTarget.dataset.video);
  });

  /* seed the assistant with this day so the rider just finishes the question */
  view.querySelector('#ask-ai')?.addEventListener('click', () => {
    sessionStorage.setItem('er26.chatPrefill', `${tr('days.askSeed')} ${d.n} (${t(d.title)}): `);
  });
}
