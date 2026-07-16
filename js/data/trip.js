/* =====================================================================
   EURORIDE 2026 — TRIP DATA
   =====================================================================
   This is the ONLY file you need to edit to change the itinerary.

   Every piece of text that riders see exists twice:
     { en: "English text", es: "Texto en español" }
   Keep both in sync when you edit.

   Field guide for each day:
     n         day number (1–11)
     iso       calendar date, YYYY-MM-DD
     flag      emoji shown next to the day
     type      'ride' | 'free' | 'flex' | 'dropoff'  (changes the badge)
     date      short display date
     title     the day's name
     route     start → end, in words
     desc      one-paragraph description
     km        distance, e.g. "~185 km"  (or {en,es} text for flexible days)
     time      ride time, e.g. "3.5–4.5 h"
     high      highest point of the day: { m: "2,115 m", name: "Splügen" } or null
     mapUrl    Google Maps route link (null hides the button)
     videoId   YouTube video id only, e.g. "X2HD3TCG4pE" (null hides the button)
     lodging   { name, url, area, nights }
               url: booking/suggestion link — set to null to show a
               "find lodging nearby" search based on `area` instead.
     options   optional list of POIs / optional loops:
               { name, km, url, blurb }
     notes     ride notes: fuel / tolls / road / food (each {en,es})
     profile   elevation sketch, 6–10 numbers 0..1 (visual aid only)
     map       position on the stylized route map (720×470 canvas):
               { x, y, lbl, dx, dy, anchor?, also? }
               `also` lists other day numbers that share this stop.
   ===================================================================== */

export const TRIP_START_ISO = '2026-08-20';

export const TRIP = [
{
  n: 1, iso: '2026-08-20', flag: '🇨🇭', type: 'ride',
  date: { en: 'Thu · Aug 20', es: 'Jue · 20 Ago' },
  title: { en: 'Alpine Liftoff', es: 'Despegue Alpino' },
  route: { en: 'EagleRider Milan (IT) → Casti-Wergenstein (CH)', es: 'EagleRider Milán (IT) → Casti-Wergenstein (CH)' },
  desc: {
    en: 'The adventure officially begins. We pick up the Harleys at EagleRider Milan, fire them up, and point straight north — through Italian lake country at Como, up the Chiavenna valley, and over the Splügen Pass into the heart of the Swiss Alps.',
    es: '¡La aventura arranca oficialmente! Recogemos las Harleys en EagleRider Milán, encendemos motores y enfilamos al norte — por la zona de lagos de Como, subiendo el valle de Chiavenna y cruzando el Paso Splügen hasta el corazón de los Alpes suizos.'
  },
  km: '~185 km', time: '3.5–4.5 h', high: { m: '2,115 m', name: 'Splügen' },
  mapUrl: 'https://maps.app.goo.gl/ihCUWDBLDXQidJUh7', videoId: 'X2HD3TCG4pE',
  lodging: { name: { en: 'Guesthouse in Casti-Wergenstein', es: 'Hospedaje en Casti-Wergenstein' }, url: 'https://expe.onelink.me/hnLd/oinpamlf', area: 'Casti-Wergenstein Switzerland', nights: 1 },
  options: null,
  notes: {
    fuel: { en: 'Top off leaving Milan; last easy fuel before the pass is Chiavenna.', es: 'Llena el tanque saliendo de Milán; la última gasolinera fácil antes del paso está en Chiavenna.' },
    tolls: { en: 'Italian A9 toll to Como (a few euros, card OK). The Splügen Pass itself is free — no Swiss vignette needed on the pass road.', es: 'Peaje de la A9 italiana hasta Como (pocos euros, aceptan tarjeta). El Paso Splügen es gratis — no se necesita viñeta suiza en la carretera del paso.' },
    road: { en: 'Splügen has tight, stacked hairpins on the Italian side — first taste of real Alpine riding. Watch for gravel in early corners.', es: 'El Splügen tiene curvas de horquilla cerradas del lado italiano — primera probada de manejo alpino real. Ojo con la gravilla en las primeras curvas.' },
    food: { en: "Coffee stop in Chiavenna's old town before the climb; celebrate arrival with Bündner cuisine up top.", es: 'Parada de café en el centro histórico de Chiavenna antes de subir; celebra la llegada con cocina grisona arriba.' }
  },
  profile: [.05, .08, .15, .3, .55, .85, 1, .72, .55, .45],
  map: { x: 250, y: 318, lbl: 'Casti', dx: 14, dy: -8 }
},
{
  n: 2, iso: '2026-08-21', flag: '🇮🇹', type: 'ride',
  date: { en: 'Fri · Aug 21', es: 'Vie · 21 Ago' },
  title: { en: 'Valleys of the North', es: 'Valles del Norte' },
  route: { en: 'Casti-Wergenstein (CH) → Bormio / Stelvio Region (IT)', es: 'Casti-Wergenstein (CH) → Bormio / Región del Stelvio (IT)' },
  desc: {
    en: "A rolling warm-up through Swiss valleys and the Engadin, crossing back into Italy through high border country. A technical tune-up day — perfect for finding the rhythm of your V-Twin before tomorrow's giant.",
    es: 'Un calentamiento por los valles suizos y la Engadina, cruzando de vuelta a Italia por la frontera alta. Un día de ajuste técnico — ideal para encontrarle el ritmo a tu V-Twin antes del gigante de mañana.'
  },
  km: '~160 km', time: '3.5–4.5 h', high: { m: '2,291 m', name: 'Foscagno' },
  mapUrl: 'https://maps.app.goo.gl/v3uXwUwhrxSWNZcw6', videoId: 'kcNaEX6JpBY',
  lodging: { name: { en: 'UPPS Hotel · Bormio / Stelvio area', es: 'Hotel UPPS · zona Bormio / Stelvio' }, url: 'https://www.upps.it/main/book_rooms.php?hotel_id=1559&range=21-08-2026_22-08-2026&adult=2&child=0&lang=en&cook_land=14&rooms=971&source=mapresults', area: 'Bormio Italy', nights: 1 },
  options: null,
  notes: {
    fuel: { en: 'If the route passes Livigno: duty-free town — cheapest fuel of the whole trip. Fill everything.', es: 'Si la ruta pasa por Livigno: zona libre de impuestos — la gasolina más barata de todo el viaje. Llena todo.' },
    tolls: { en: 'Heads-up: the Munt La Schera tunnel into Livigno charges its own toll (~€17). Entering over the Forcola/Foscagno passes is free.', es: 'Ojo: el túnel Munt La Schera hacia Livigno cobra su propio peaje (~€17). Entrar por los pasos Forcola/Foscagno es gratis.' },
    road: { en: 'High valley riding with fast sweepers; afternoon thunderstorms are common in the Engadin — check the sky after lunch.', es: 'Manejo de valle alto con curvas rápidas; las tormentas de tarde son comunes en la Engadina — revisa el cielo después del almuerzo.' },
    food: { en: 'Pizzoccheri (buckwheat pasta) is the Valtellina specialty waiting in Bormio.', es: 'Los pizzoccheri (pasta de trigo sarraceno) son la especialidad de la Valtellina que te espera en Bormio.' }
  },
  profile: [.45, .5, .62, .55, .75, .95, 1, .7, .4, .32],
  map: { x: 342, y: 352, lbl: 'Bormio', dx: 14, dy: 4 }
},
{
  n: 3, iso: '2026-08-22', flag: '🏔️', type: 'ride',
  date: { en: 'Sat · Aug 22', es: 'Sáb · 22 Ago' },
  title: { en: 'King of the Passes', es: 'El Rey de los Pasos' },
  route: { en: 'Stelvio Pass (IT) → Passo di Giau, Dolomites', es: 'Paso Stelvio (IT) → Passo di Giau, Dolomitas' },
  desc: {
    en: 'The supreme challenge of the trip. We take on the mythical Passo dello Stelvio — 48 numbered hairpins to 2,757 meters — then carve east across the Dolomites to the panoramic Passo di Giau. The day your V-Twin echoes off the peaks.',
    es: 'El reto supremo del viaje. Afrontamos el mítico Passo dello Stelvio — 48 horquillas numeradas hasta 2,757 metros — y luego cruzamos las Dolomitas hacia el panorámico Passo di Giau. El día en que tu V-Twin retumba entre los picos.'
  },
  km: '~190 km', time: '5–6 h', high: { m: '2,757 m', name: 'Stelvio' },
  mapUrl: 'https://maps.app.goo.gl/kbWcwtCSzaFt6ZaF9', videoId: '_Mw3qrvmpjE',
  lodging: { name: { en: 'Mountain hotel · Dolomites', es: 'Hotel de montaña · Dolomitas' }, url: 'https://expe.onelink.me/hnLd/bhhxaut6', area: 'Passo Giau Dolomites', nights: 1 },
  options: null,
  notes: {
    fuel: { en: 'Fill up in Bormio before the climb — nothing reliable until well past the summit.', es: 'Llena en Bormio antes de subir — no hay nada confiable hasta bien pasada la cima.' },
    tolls: { en: 'Stelvio and the Dolomite passes are free public roads.', es: 'El Stelvio y los pasos de las Dolomitas son carreteras públicas gratuitas.' },
    road: { en: 'Leave early — cyclists and buses own the road by 10am. Use engine braking downhill; riding the brakes for 48 hairpins cooks them. 0–10 °C at the top even in August.', es: 'Sal temprano — a las 10am la carretera es de ciclistas y buses. Usa freno de motor en bajada; frenar 48 horquillas seguidas recalienta los frenos. 0–10 °C en la cima aun en agosto.' },
    food: { en: 'Bratwurst and photos at the summit stands — the classic Stelvio ritual. Dinner in the Dolomites means canederli and speck.', es: 'Bratwurst y fotos en los puestos de la cima — el ritual clásico del Stelvio. La cena en las Dolomitas: canederli y speck.' }
  },
  profile: [.3, .65, 1, .9, .6, .68, .78, .7, .82, .75],
  map: { x: 462, y: 322, lbl: 'Giau', dx: 16, dy: -4 }
},
{
  n: 4, iso: '2026-08-23', flag: '🇩🇪', type: 'ride',
  date: { en: 'Sun · Aug 23', es: 'Dom · 23 Ago' },
  title: { en: 'Through the Tyrol', es: 'A Través del Tirol' },
  route: { en: 'Dolomites → Austrian Alps → Munich (DE)', es: 'Dolomitas → Alpes Austríacos → Múnich (DE)' },
  desc: {
    en: "We descend from the Dolomites and flow north through Austria's Tyrol — clean, fast, green alpine roads — arriving in Munich, Bavaria's capital of beer and engineering. Two nights in one hotel: unpack properly for once.",
    es: 'Bajamos de las Dolomitas y fluimos al norte por el Tirol austríaco — carreteras alpinas limpias, rápidas y verdes — hasta llegar a Múnich, la capital bávara de la cerveza y la ingeniería. Dos noches en el mismo hotel: por fin desempaca bien.'
  },
  km: '~300 km', time: '4.5–5.5 h', high: { m: '~1,000 m', name: { en: 'ridges', es: 'crestas' } },
  mapUrl: 'https://maps.app.goo.gl/jURx4MAro1ko59M87', videoId: 'F3hn3wWIObU',
  lodging: { name: { en: 'Hotel in Munich · 2 nights', es: 'Hotel en Múnich · 2 noches' }, url: 'https://expe.onelink.me/hnLd/1vd5tkua', area: 'Munich Germany', nights: 2 },
  options: null,
  notes: {
    fuel: { en: 'Fuel is plentiful; top off before the border anyway — Austrian autobahn stations are pricier.', es: 'Hay gasolina de sobra; aun así llena antes de la frontera — las estaciones de autopista austriacas son más caras.' },
    tolls: { en: 'Austrian motorways need the 10-day digital vignette (€5.10/moto, buy online with the plate). The scenic Achenpass B-road into Bavaria avoids it. Germany: free.', es: 'Las autopistas austriacas requieren la viñeta digital de 10 días (€5.10/moto, se compra en línea con la placa). La carretera escénica del Achenpass hacia Baviera la evita. Alemania: gratis.' },
    road: { en: 'Easiest mountain day of the trip — relax, cruise, enjoy the green. Watch speed cameras in Austrian villages: enforcement is strict.', es: 'El día de montaña más fácil del viaje — relájate, rueda tranquilo y disfruta el verde. Ojo con las cámaras en los pueblos austríacos: son estrictos.' },
    food: { en: "Arrival beer garden is mandatory. Augustiner-Keller or the Chinesischer Turm — dealer's choice.", es: 'El biergarten de llegada es obligatorio. Augustiner-Keller o la Chinesischer Turm — a elección del grupo.' }
  },
  profile: [.75, .6, .55, .45, .5, .35, .25, .15, .1, .08],
  map: { x: 500, y: 128, lbl: 'München', dx: 18, dy: 0, also: [5] }
},
{
  n: 5, iso: '2026-08-24', flag: '🍺', type: 'free',
  date: { en: 'Mon · Aug 24', es: 'Lun · 24 Ago' },
  title: { en: 'Free Day · Munich', es: 'Día Libre · Múnich' },
  route: { en: 'BMW Welt · Allianz Arena · Old Town & Beer Gardens', es: 'BMW Welt · Allianz Arena · Centro Histórico y Biergartens' },
  desc: {
    en: "Bikes rest, riders explore. Pay respects at BMW Welt's temple of engineering, tour FC Bayern's monumental Allianz Arena, wander the Marienplatz old town — or commit fully to the historic beer gardens. All valid choices.",
    es: 'Las motos descansan, los pilotos exploran. Rinde tributo al templo de la ingeniería en BMW Welt, recorre el monumental Allianz Arena del Bayern, pasea por el centro histórico y Marienplatz — o dedícate por completo a los biergartens históricos. Todas son decisiones válidas.'
  },
  km: '~15 km', time: { en: 'local', es: 'local' }, high: null,
  mapUrl: 'https://maps.app.goo.gl/2HPdC94FwjiF3mHq8', videoId: 'J807hA-8DeQ',
  lodging: { name: { en: 'Same hotel in Munich', es: 'Mismo hotel en Múnich' }, url: 'https://expe.onelink.me/hnLd/1vd5tkua', area: 'Munich Germany', nights: 0 },
  options: [
    { name: { en: 'BMW Welt & Museum', es: 'BMW Welt y Museo' }, km: null, url: 'https://maps.app.goo.gl/FHNTqZoraLLU7Swo8', blurb: { en: 'Free entry to BMW Welt; museum ticketed. Moto exhibit included.', es: 'Entrada gratis a BMW Welt; el museo con boleto. Incluye exhibición de motos.' } },
    { name: { en: 'Allianz Arena · FC Bayern', es: 'Allianz Arena · FC Bayern' }, km: null, url: 'https://maps.app.goo.gl/nHwkSaZr9Prt7xGP7', blurb: { en: 'Stadium tour + FC Bayern museum. Book the tour slot ahead.', es: 'Tour del estadio + museo del FC Bayern. Reserva el horario con anticipación.' } },
    { name: { en: 'Old Town, Markets & Beer Gardens', es: 'Centro, Mercados y Biergartens' }, km: null, url: 'https://maps.app.goo.gl/2HPdC94FwjiF3mHq8', blurb: { en: 'Marienplatz, Viktualienmarkt, Hofbräuhaus and the classics.', es: 'Marienplatz, Viktualienmarkt, Hofbräuhaus y los clásicos.' } }
  ],
  notes: {
    fuel: { en: 'Fuel up tonight — tomorrow is the longest day and we roll early.', es: 'Llena hoy en la noche — mañana es el día más largo y salimos temprano.' },
    tolls: { en: "City day, no tolls. Mind Munich's low-emission zone rules if riding into the center.", es: 'Día de ciudad, sin peajes. Ojo con la zona de bajas emisiones si entras al centro en moto.' },
    road: { en: 'Rest the bike, rest the body. Hydrate between liters.', es: 'Descansa la moto, descansa el cuerpo. Hidrátate entre litros.' },
    food: { en: 'Weisswurst before noon (tradition), pretzels always, and a proper Bavarian dinner.', es: 'Weisswurst antes del mediodía (tradición), pretzels siempre, y una cena bávara como debe ser.' }
  },
  profile: null,
  map: null // shares the Munich stop with day 4
},
{
  n: 6, iso: '2026-08-25', flag: '🇫🇷', type: 'ride',
  date: { en: 'Tue · Aug 25', es: 'Mar · 25 Ago' },
  title: { en: 'Magic in Alsace', es: 'Magia en Alsacia' },
  route: { en: 'Munich (DE) → Alsace Wine Country (FR)', es: 'Múnich (DE) → Ruta del Vino de Alsacia (FR)' },
  desc: {
    en: "The long haul west — the trip's biggest transfer day — trading Bavaria for France's fairy-tale Alsace: half-timbered medieval villages, vineyard hills, and wide, spectacular roads. Worth every kilometer.",
    es: 'La gran travesía al oeste — el día de traslado más largo del viaje — cambiando Baviera por la Alsacia de cuento de hadas: pueblos medievales de entramado, colinas de viñedos y carreteras amplias y espectaculares. Vale cada kilómetro.'
  },
  km: '~400 km', time: '5.5–6.5 h', high: null,
  mapUrl: 'https://maps.app.goo.gl/PWo56vE4NTEWVh2M7', videoId: 'f0k3jifsuOY',
  lodging: { name: { en: 'Hotel in Alsace with moto parking', es: 'Hotel en Alsacia con parking para motos' }, url: 'https://expe.onelink.me/hnLd/70wzw150', area: 'Colmar Alsace France', nights: 1 },
  options: null,
  notes: {
    fuel: { en: 'Longest day — plan two fuel stops. German autobahn stations are easy; fill again entering France.', es: 'El día más largo — planea dos paradas de gasolina. Las estaciones de autobahn alemanas son fáciles; llena otra vez entrando a Francia.' },
    tolls: { en: "German autobahn: free. Alsace's A35 and the Route des Vins: toll-free.", es: 'Autobahn alemana: gratis. La A35 de Alsacia y la Ruta del Vino: sin peaje.' },
    road: { en: 'Flat and fast — the risk today is fatigue, not hairpins. Rotate the lead, take real breaks every ~90 minutes.', es: 'Plano y rápido — el riesgo hoy es la fatiga, no las curvas. Rota al líder y haz pausas reales cada ~90 minutos.' },
    food: { en: 'Arrive hungry: tarte flambée, choucroute, and a cold Alsatian riesling for the non-riders of the evening.', es: 'Llega con hambre: tarte flambée, choucroute y un riesling alsaciano frío para los que ya no manejan esa noche.' }
  },
  profile: [.12, .1, .13, .09, .12, .1, .08, .1, .07, .09],
  map: { x: 172, y: 128, lbl: 'Alsace', dx: -14, dy: -10, anchor: 'end' }
},
{
  n: 7, iso: '2026-08-26', flag: '🏔️', type: 'ride',
  date: { en: 'Wed · Aug 26', es: 'Mié · 26 Ago' },
  title: { en: 'Grimsel Pass', es: 'Grimsel Pass' },
  route: { en: 'Alsace (FR) → Grimsel Pass (CH)', es: 'Alsacia (FR) → Grimsel Pass (CH)' },
  desc: {
    en: "Back into Switzerland through the front door: past Basel, along the lakes to Interlaken, then up the mighty Grimsel — one of Europe's most technical and visually stunning roads, carved through granite beside turquoise reservoirs.",
    es: 'De regreso a Suiza por la puerta grande: pasando Basilea, bordeando los lagos hasta Interlaken, y subiendo el imponente Grimsel — una de las carreteras más técnicas y visualmente impactantes de Europa, tallada en granito junto a embalses turquesa.'
  },
  km: '~280 km', time: '5–6 h', high: { m: '2,164 m', name: 'Grimsel' },
  mapUrl: 'https://maps.app.goo.gl/M9MKA446CRSL5bdv5', videoId: '_rX_H9ep0i8',
  lodging: { name: { en: 'Alpine hotel · Grimsel area', es: 'Hotel alpino · zona Grimsel' }, url: 'https://expe.onelink.me/hnLd/6l438r51', area: 'Grimsel Pass Switzerland', nights: 1 },
  options: null,
  notes: {
    fuel: { en: 'Last dependable fuel before the climb: Meiringen / Innertkirchen.', es: 'Última gasolina confiable antes de subir: Meiringen / Innertkirchen.' },
    tolls: { en: 'Swiss motorways from Basel need the CHF 40 vignette — this is the day it matters. The Grimsel pass road itself is free.', es: 'Las autopistas suizas desde Basilea requieren la viñeta de CHF 40 — este es el día en que importa. La carretera del paso Grimsel es gratis.' },
    road: { en: 'Granite walls, tunnels, and off-camber corners — Grimsel demands full attention. Temperatures drop fast after 1,800 m.', es: 'Muros de granito, túneles y curvas peraltadas al revés — el Grimsel exige atención total. La temperatura cae rápido después de los 1,800 m.' },
    food: { en: "Rösti with a reservoir view at a pass-top gasthaus. You've earned it.", es: 'Rösti con vista al embalse en un gasthaus de la cima. Te lo ganaste.' }
  },
  profile: [.1, .12, .15, .2, .28, .4, .6, .85, 1, .95],
  map: { x: 196, y: 302, lbl: 'Grimsel', dx: -16, dy: 6, anchor: 'end' }
},
{
  n: 8, iso: '2026-08-27', flag: '🌊', type: 'ride',
  date: { en: 'Thu · Aug 27', es: 'Jue · 27 Ago' },
  title: { en: 'Descent to the Lakes', es: 'Descenso a los Lagos' },
  route: { en: 'Grimsel (CH) → Lake Como (IT)', es: 'Grimsel (CH) → Lago de Como (IT)' },
  desc: {
    en: 'We begin the return south, descending from icy Swiss summits — with the option of the legendary cobbled Tremola road on the old Gotthard — as the terrain softens into the Mediterranean warmth of Lake Como. Base camp for the final act.',
    es: 'Comenzamos el regreso al sur, bajando de las cumbres heladas suizas — con la opción de la legendaria carretera empedrada Tremola del viejo Gotthard — mientras el terreno se suaviza hacia la calidez mediterránea del Lago de Como. Campamento base para el acto final.'
  },
  km: '~190 km', time: '4–5 h', high: { m: '2,429 m', name: { en: 'Furka (optional)', es: 'Furka (opcional)' } },
  mapUrl: 'https://maps.app.goo.gl/nNYYAPT5uzV83m877', videoId: 'Xi6sQ-GUehk',
  lodging: { name: { en: 'Lakeside lodging · Como area · 2 nights', es: 'Hospedaje junto al lago · zona Como · 2 noches' }, url: null, area: 'Lake Como Italy', nights: 2 },
  options: null,
  notes: {
    fuel: { en: 'Fill at Airolo after the descent; lakeside stations get scarce on small roads.', es: 'Llena en Airolo después de la bajada; junto al lago escasean las gasolineras en carreteras chicas.' },
    tolls: { en: 'Swiss A2 needs the vignette (Gotthard tunnel is covered — but ride the Tremola instead). Final Italian A9 stretch: small booth toll.', es: 'La A2 suiza requiere viñeta (el túnel Gotthard está incluido — pero mejor rueda la Tremola). Tramo final de la A9 italiana: peaje pequeño en cabina.' },
    road: { en: "Optional Furka detour adds the trip's second-highest point. The Tremola's cobbles are slick when wet — skip if raining.", es: 'El desvío opcional por el Furka agrega el segundo punto más alto del viaje. Los adoquines de la Tremola resbalan mojados — evítala si llueve.' },
    food: { en: 'First lakeside aperitivo of the trip. Missoltino (lake fish) for the brave, pizza for the tired.', es: 'Primer aperitivo junto al lago del viaje. Missoltino (pescado de lago) para los valientes, pizza para los cansados.' }
  },
  profile: [1, .88, .7, .5, .34, .22, .15, .1, .08, .06],
  map: { x: 262, y: 408, lbl: 'Como', dx: 16, dy: -2, also: [9, 10] }
},
{
  n: 9, iso: '2026-08-28', flag: '🛋️', type: 'flex',
  date: { en: 'Fri · Aug 28', es: 'Vie · 28 Ago' },
  title: { en: 'Flex Day · Lake Loops', es: 'Día Flexible · Vueltas al Lago' },
  route: { en: 'Optional rides from Lake Como — or a well-earned rest', es: 'Rutas opcionales desde el Lago de Como — o un merecido descanso' },
  desc: {
    en: "Total decompression day — a.k.a. 'rest the saddle sores.' Sleep in, espresso by the water, swim if you dare. Or pick one of the optional loops below: short, unloaded, and purely for the joy of it.",
    es: "Día de descompresión total — alias 'descansar la nalguita.' Duerme tarde, espresso junto al agua, nada si te atreves. O elige una de las vueltas opcionales de abajo: cortas, sin equipaje y puro placer."
  },
  km: { en: 'you choose', es: 'tú eliges' }, time: { en: 'optional', es: 'opcional' }, high: null,
  mapUrl: null, videoId: null,
  lodging: { name: { en: 'Same lakeside lodging', es: 'Mismo hospedaje junto al lago' }, url: null, area: 'Lake Como Italy', nights: 0 },
  options: [
    { name: { en: 'The Ghisallo Classic', es: 'El Clásico del Ghisallo' }, km: '~90 km',
      url: 'https://www.google.com/maps/dir/Como/Bellagio/Madonna+del+Ghisallo/Sormano/Como',
      blurb: { en: "Eastern shore to Bellagio, up to the cyclists' chapel at Madonna del Ghisallo, back over Sormano. Curves + views + espresso.", es: 'Costa este hasta Bellagio, subida a la capilla de los ciclistas en Madonna del Ghisallo, regreso por Sormano. Curvas + vistas + espresso.' } },
    { name: { en: 'Two-Lakes Lugano Loop', es: 'Vuelta de los Dos Lagos · Lugano' }, km: '~120 km',
      url: 'https://www.google.com/maps/dir/Como/Menaggio/Porlezza/Lugano/Como',
      blurb: { en: "Como's west shore to Menaggio, over to Lake Lugano and a Swiss lakeside lunch. Passports in pocket.", es: 'Costa oeste de Como hasta Menaggio, cruce al Lago de Lugano y almuerzo suizo junto al agua. Pasaporte en el bolsillo.' } },
    { name: { en: 'Valsassina Backroads', es: 'Caminos de la Valsassina' }, km: '~110 km',
      url: 'https://www.google.com/maps/dir/Lecco/Ballabio/Introbio/Dervio/Varenna/Lecco',
      blurb: { en: "Inland valley riding behind Lecco's peaks, dropping back to the lake at Dervio, lakefront cruise home via Varenna.", es: 'Valle interior detrás de los picos de Lecco, bajando de nuevo al lago en Dervio y crucero costero de regreso por Varenna.' } }
  ],
  notes: {
    fuel: { en: 'No pressure today. Loops pass plenty of stations.', es: 'Sin presión hoy. Las vueltas pasan por suficientes gasolineras.' },
    tolls: { en: 'All three loops are toll-free (Lugano loop crosses into Switzerland on regular roads — no vignette needed).', es: 'Las tres vueltas son sin peaje (la de Lugano entra a Suiza por carreteras normales — no requiere viñeta).' },
    road: { en: "Ride light, ride short, or don't ride at all. Recovery is strategy.", es: 'Rueda ligero, rueda corto, o no ruedes. Recuperarse también es estrategia.' },
    food: { en: 'Gelato standards are highest in Bellagio. Verify personally.', es: 'El estándar del gelato es máximo en Bellagio. Verifícalo personalmente.' }
  },
  profile: null,
  map: null // shares the Como stop with day 8
},
{
  n: 10, iso: '2026-08-29', flag: '🇮🇹', type: 'flex',
  date: { en: 'Sat · Aug 29', es: 'Sáb · 29 Ago' },
  title: { en: 'Flex Day · Last Trot', es: 'Día Flexible · Último Trote' },
  route: { en: 'Optional morning loop → evening near Milan', es: 'Vuelta opcional en la mañana → noche cerca de Milán' },
  desc: {
    en: 'Last full riding day — flexible by design. Take a morning option below, then make the easy run toward Milan in the afternoon. Evening ritual: fuel the bikes, shake out the saddlebags, and trade the best stories of the trip.',
    es: 'Último día completo de ruta — flexible por diseño. Toma una opción matutina de abajo y haz el tramo fácil hacia Milán en la tarde. Ritual nocturno: llenar tanques, sacudir alforjas e intercambiar las mejores anécdotas del viaje.'
  },
  km: '~85–200 km', time: '1.5–4 h', high: null,
  mapUrl: 'https://www.google.com/maps/dir/Como/Milan', videoId: null,
  lodging: { name: { en: 'Hotel near EagleRider Milan', es: 'Hotel cerca de EagleRider Milán' }, url: null, area: 'Milan Italy', nights: 1 },
  options: [
    { name: { en: 'West Shore Farewell', es: 'Despedida por la Costa Oeste' }, km: '~140 km',
      url: 'https://www.google.com/maps/dir/Como/Argegno/Menaggio/Como/Milan',
      blurb: { en: 'One last lakefront cruise up the Strada Regina and back, then the run to Milan.', es: 'Un último crucero por la Strada Regina y de regreso, luego el tramo a Milán.' } },
    { name: { en: 'Straight & Easy', es: 'Directo y Fácil' }, km: '~85 km',
      url: 'https://www.google.com/maps/dir/Como/Milan',
      blurb: { en: 'Skip the loop, sleep in, roll gently into Milan with time for the city.', es: 'Sin vuelta, duerme tarde y llega tranquilo a Milán con tiempo para la ciudad.' } }
  ],
  notes: {
    fuel: { en: 'Return the bikes FULL tomorrow — fuel tonight near the hotel to avoid morning stress.', es: 'Mañana las motos se devuelven con tanque LLENO — llena hoy cerca del hotel para evitar estrés matutino.' },
    tolls: { en: 'Como→Milan on the A9 has a small booth toll; the old SS35 road is free and slow.', es: 'Como→Milán por la A9 tiene un peaje pequeño; la vieja SS35 es gratis y lenta.' },
    road: { en: "Photo-dump night: collect everyone's shots into the shared album before memories scatter.", es: 'Noche de fotos: junta las fotos de todos en el álbum compartido antes de que se dispersen.' },
    food: { en: 'Farewell dinner in Milan — risotto alla milanese is the closing ceremony.', es: 'Cena de despedida en Milán — el risotto alla milanese es la ceremonia de clausura.' }
  },
  profile: [.15, .28, .2, .12, .08, .06],
  map: null // ends at the Milan stop
},
{
  n: 11, iso: '2026-08-30', flag: '🏁', type: 'dropoff',
  date: { en: 'Sun · Aug 30', es: 'Dom · 30 Ago' },
  title: { en: 'Mission Accomplished', es: 'Misión Cumplida' },
  route: { en: 'Bike drop-off · EagleRider Milan', es: 'Devolución de motos · EagleRider Milán' },
  desc: {
    en: 'End of the ride. We hand the Harleys back at EagleRider Milan in the morning — tanks full, papers ready, hearts heavy. Eleven days, five countries, and a lifetime of shared corners. Until the next one.',
    es: 'Fin del paseo. Entregamos las Harleys en EagleRider Milán por la mañana — tanques llenos, papeles listos, corazones apretados. Once días, cinco países y toda una vida de curvas compartidas. Hasta la próxima.'
  },
  km: { en: 'drop-off', es: 'entrega' }, time: { en: 'morning', es: 'mañana' }, high: null,
  mapUrl: 'https://www.google.com/maps/search/EagleRider+Milan', videoId: null,
  lodging: { name: { en: 'Homeward bound ✈', es: 'Rumbo a casa ✈' }, url: null, area: null, nights: 0 },
  options: null,
  notes: {
    fuel: { en: 'Full tank at return or the rental charges premium refuel rates.', es: 'Tanque lleno al devolver o la renta cobra tarifas premium de gasolina.' },
    tolls: { en: 'Keep toll receipts + vignette confirmations until the rental deposit clears.', es: 'Guarda recibos de peaje y confirmaciones de viñeta hasta que liberen el depósito de la renta.' },
    road: { en: 'Walk around each bike with staff, photograph everything, get the return signed.', es: 'Revisa cada moto con el personal, fotografía todo y pide la firma de devolución.' },
    food: { en: 'One last espresso at the counter, standing, like a local. Arrivederci.', es: 'Un último espresso en la barra, de pie, como local. Arrivederci.' }
  },
  profile: null,
  map: { x: 158, y: 432, lbl: 'Milano', dx: -14, dy: 14, anchor: 'end' }
}
];

/* Order of stops the route line follows on the stylized map (out of Milan and back). */
export const MAP_ORDER = [11, 1, 2, 3, 4, 6, 7, 8, 11];

/* Country labels drawn faintly on the map canvas. */
export const MAP_COUNTRIES = [
  { x: 480, y: 80,  label: 'Deutschland' },
  { x: 120, y: 95,  label: 'France' },
  { x: 150, y: 285, label: 'Schweiz' },
  { x: 470, y: 235, label: 'Österreich' },
  { x: 420, y: 430, label: 'Italia' }
];

/* Headline stats for the Home screen. */
export const TRIP_STATS = [
  { value: '11',       label: { en: 'days', es: 'días' } },
  { value: '5',        label: { en: 'countries', es: 'países' } },
  { value: '~1,900',   label: { en: 'km total', es: 'km en total' } },
  { value: '2,757 m',  label: { en: 'Stelvio summit', es: 'cima Stelvio' } }
];

/* "Before you roll" essentials, shown on Home. */
export const ESSENTIALS = [
  {
    icon: '🇨🇭', title: { en: 'Switzerland', es: 'Suiza' },
    body: {
      en: 'Motorways need the annual vignette — <b>CHF 40</b>, no short-term option. E-vignette is plate-bound: ask EagleRider if the bikes carry one; if not, buy at via.admin.ch. Fine without it: CHF 200. Mountain passes themselves are free.',
      es: 'Las autopistas requieren la viñeta anual — <b>CHF 40</b>, no hay opción corta. La e-viñeta va ligada a la placa: pregunta en EagleRider si las motos ya la tienen; si no, cómprala en via.admin.ch. Multa sin ella: CHF 200. Los pasos de montaña son gratis.'
    }
  },
  {
    icon: '🇦🇹', title: { en: 'Austria', es: 'Austria' },
    body: {
      en: "Motorways need a vignette — the <b>10-day digital, €5.10</b> for motorcycles, bought online against the plate. Back roads (like the scenic Achenpass) don't need one. The Brenner A13 charges its own separate toll.",
      es: 'Las autopistas requieren viñeta — la <b>digital de 10 días, €5.10</b> para motos, comprada en línea con la placa. Las carreteras secundarias (como el escénico Achenpass) no la necesitan. La A13 del Brennero cobra un peaje aparte.'
    }
  },
  {
    icon: '🇮🇹', title: { en: 'Italy · Germany · France', es: 'Italia · Alemania · Francia' },
    body: {
      en: 'Italy: pay-per-use autostrada tolls at booths — keep a card handy. Germany: <b>free</b> for motorcycles. Alsace, France: the A35 and wine-route roads are toll-free.',
      es: 'Italia: peajes de autostrada que se pagan en cabinas — ten una tarjeta a mano. Alemania: <b>gratis</b> para motos. Alsacia, Francia: la A35 y la ruta del vino no tienen peaje.'
    }
  },
  {
    icon: '🧊', title: { en: 'Mountain Weather', es: 'Clima de Montaña' },
    body: {
      en: 'Even in August, expect <b>0–10 °C</b> at the top of Stelvio and Grimsel. Pack a warm mid-layer and rain gear within reach, not buried in the saddlebag.',
      es: 'Aun en agosto, espera <b>0–10 °C</b> en la cima del Stelvio y Grimsel. Lleva una capa térmica e impermeable a la mano, no enterrados en la alforja.'
    }
  },
  {
    icon: '🛏️', title: { en: 'Lodging Philosophy', es: 'Filosofía de Hospedaje' },
    body: {
      en: 'With 18 riders, plans flex. All lodging here is a <b>suggestion, not a booking</b> — each stop also has a "find lodging nearby" option for when the road decides otherwise.',
      es: 'Con 18 personas, los planes se adaptan. Todo hospedaje aquí es una <b>sugerencia, no una reserva</b> — cada parada tiene también la opción "buscar hospedaje cerca" para cuando la ruta decida otra cosa.'
    }
  }
];

/* ---------- date helpers ---------- */
const DAY_MS = 86400000;
const tripStart = new Date(TRIP_START_ISO + 'T00:00:00');

/** Day number (1..11) if today falls inside the trip, else null. */
export function todayIndex() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((now - tripStart) / DAY_MS);
  return (diff >= 0 && diff < TRIP.length) ? diff + 1 : null;
}

/** Whole days until the trip starts (0 on day 1, negative once started). */
export function daysToStart() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((tripStart - now) / DAY_MS);
}

export function getDay(n) {
  return TRIP.find(d => d.n === Number(n)) || null;
}
