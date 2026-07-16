/* =====================================================================
   MAP — stylized SVG route map (720×470 canvas).
   Zero dependencies, works fully offline. Positions are rough
   geography, not survey data; edit them in js/data/trip.js.
   ===================================================================== */
import { TRIP, MAP_ORDER, MAP_COUNTRIES } from './data/trip.js';
import { esc } from './ui.js';

/** Smooth a polyline with Catmull-Rom → cubic Bézier segments. */
function smoothPath(points) {
  if (points.length < 3) {
    return points.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ');
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${p2.x},${p2.y}`;
  }
  return d;
}
const r = n => Math.round(n * 10) / 10;

/** Build the full route map SVG markup. Stops link to #/day/N. */
export function routeMapSVG(activeDay = null) {
  const stops = TRIP.filter(d => d.map);
  const pathPoints = MAP_ORDER.map(n => TRIP.find(d => d.n === n)?.map).filter(Boolean);
  const d = smoothPath(pathPoints);

  const countryLabels = MAP_COUNTRIES.map(c =>
    `<text class="country" x="${c.x}" y="${c.y}">${esc(c.label)}</text>`).join('');

  const stopMarks = stops.map(day => {
    const m = day.map;
    const days = [day.n, ...(m.also || [])];
    const numTxt = days.join('·');
    const isActive = activeDay != null && days.includes(Number(activeDay));
    const anchor = m.anchor || 'start';
    const radius = 13 + (m.also ? 3 : 0);
    return `<a href="#/day/${day.n}" class="stop${isActive ? ' active' : ''}" aria-label="Day ${numTxt} — ${esc(m.lbl)}">
      <circle cx="${m.x}" cy="${m.y}" r="${radius}"></circle>
      <text class="num" x="${m.x}" y="${m.y}">${numTxt}</text>
      <text class="lbl" x="${m.x + m.dx}" y="${m.y + m.dy}" text-anchor="${anchor}">${esc(m.lbl)}</text>
    </a>`;
  }).join('');

  return `<svg id="routemap" viewBox="0 0 720 470" role="group" aria-label="Route map: Milan, the Alps and back">
    ${countryLabels}
    <path class="leg-under" d="${d}"/>
    <path class="leg" d="${d}"/>
    ${stopMarks}
  </svg>`;
}
