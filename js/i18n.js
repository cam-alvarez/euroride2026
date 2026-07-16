/* =====================================================================
   I18N — language state + every UI string in EN and ES.
   t(x)   resolves an {en, es} object (or passes strings through).
   tr(k)  looks up a dotted key in STR, e.g. tr('nav.home').
   ===================================================================== */
import { store } from './store.js';

let LANG = store.get('lang', null) ||
  ((navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en');

export function getLang() { return LANG; }

export function setLang(lang) {
  LANG = lang === 'es' ? 'es' : 'en';
  store.set('lang', LANG);
  document.documentElement.lang = LANG;
}

export function t(x) {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  return x[LANG] ?? x.en ?? '';
}

export function tr(key) {
  let node = STR;
  for (const part of key.split('.')) {
    node = node?.[part];
    if (node == null) return key;
  }
  return t(node);
}

export const STR = {
  app: {
    title: { en: 'Euroride 2026', es: 'Euroride 2026' },
    tagline: { en: 'Muñecos Travel Agency', es: 'Muñecos Travel Agency' },
    footTag: { en: 'v3.0 · Ride Safe, Ride Together', es: 'v3.0 · Rueda Seguro, Rueda en Grupo' },
    offline: { en: "You're offline — the itinerary still works. Maps, videos & booking links need signal.", es: 'Sin conexión — el itinerario sigue funcionando. Mapas, videos y reservas necesitan señal.' }
  },
  nav: {
    home: { en: 'Home', es: 'Inicio' },
    days: { en: 'Days', es: 'Días' },
    sos: { en: 'SOS', es: 'SOS' },
    kit: { en: 'Kit', es: 'Kit' },
    profile: { en: 'You', es: 'Tú' }
  },
  common: {
    day: { en: 'Day', es: 'Día' },
    days: { en: 'days', es: 'días' },
    of: { en: 'of', es: 'de' },
    back: { en: 'Back', es: 'Volver' },
    save: { en: 'Save', es: 'Guardar' },
    saved: { en: 'Saved ✓', es: 'Guardado ✓' },
    cancel: { en: 'Cancel', es: 'Cancelar' },
    delete: { en: 'Delete', es: 'Eliminar' },
    edit: { en: 'Edit', es: 'Editar' },
    add: { en: 'Add', es: 'Agregar' },
    close: { en: 'Close', es: 'Cerrar' },
    copy: { en: 'Copy', es: 'Copiar' },
    copied: { en: 'Copied ✓', es: 'Copiado ✓' },
    share: { en: 'Share', es: 'Compartir' },
    optional: { en: 'optional', es: 'opcional' },
    today: { en: 'Today', es: 'Hoy' },
    signIn: { en: 'Sign in', es: 'Entrar' },
    confirmDelete: { en: 'Delete? This cannot be undone.', es: '¿Eliminar? No se puede deshacer.' }
  },
  home: {
    kicker: { en: 'Aug 20 – 30, 2026 · Five Countries · One Crew', es: '20 – 30 Ago 2026 · Cinco Países · Un Solo Grupo' },
    title1: { en: 'Ride the', es: 'Rodar los' },
    title2: { en: 'Alps.', es: 'Alpes.' },
    sub: {
      en: "Eleven days on Harley-Davidsons out of Milan, over the greatest passes in Europe — Splügen, Stelvio, Giau, Grimsel — through Italy, Switzerland, Austria, Germany and France. This is the crew's living itinerary.",
      es: 'Once días en Harley-Davidson desde Milán, sobre los pasos más grandes de Europa — Splügen, Stelvio, Giau, Grimsel — por Italia, Suiza, Austria, Alemania y Francia. Este es el itinerario vivo del grupo.'
    },
    countdown: { en: 'days to rollout', es: 'días para rodar' },
    countdownOne: { en: 'day to rollout', es: 'día para rodar' },
    tripDone: { en: 'Mission accomplished. Until the next one!', es: 'Misión cumplida. ¡Hasta la próxima!' },
    todayBrief: { en: "Today's ride", es: 'La ruta de hoy' },
    openToday: { en: 'Open today', es: 'Ver el día de hoy' },
    theRoute: { en: 'The Route', es: 'La Ruta' },
    mapHint: { en: 'tap a stop to open that day', es: 'toca una parada para abrir ese día' },
    essentials: { en: 'Before You Roll', es: 'Antes de Rodar' },
    essentialsSub: { en: 'The must-knows for riding these five countries. Verified for 2026 — confirm vignette status with EagleRider at pickup.', es: 'Lo indispensable para rodar por estos cinco países. Verificado para 2026 — confirma el estado de las viñetas con EagleRider al recoger las motos.' },
    viewItinerary: { en: 'Full itinerary', es: 'Itinerario completo' },
    shareApp: { en: 'Share the app', es: 'Compartir la app' }
  },
  days: {
    title: { en: 'The Eleven Days', es: 'Los Once Días' },
    sub: { en: 'Milan → the Alps → Milan. Tap any day for the full brief.', es: 'Milán → los Alpes → Milán. Toca un día para ver el plan completo.' },
    rideTime: { en: 'ride time', es: 'en ruta' },
    highPoint: { en: 'high point', es: 'punto alto' },
    typeRide: { en: 'Riding day', es: 'Día de ruta' },
    typeFree: { en: 'Free day', es: 'Día libre' },
    typeFlex: { en: 'Flex day', es: 'Día flexible' },
    typeDrop: { en: 'Drop-off', es: 'Entrega' },
    routeMap: { en: 'Route map', es: 'Mapa de ruta' },
    video: { en: 'Watch the road', es: 'Ver la carretera' },
    weather: { en: 'Weather', es: 'Clima' },
    lodging: { en: 'Lodging', es: 'Hospedaje' },
    lodgingTag: { en: 'Suggested · Not booked', es: 'Sugerencia · Sin reservar' },
    lodgingView: { en: 'View suggestion', es: 'Ver sugerencia' },
    lodgingNear: { en: 'Find lodging nearby', es: 'Buscar hospedaje cerca' },
    optionsTitle: { en: 'Options for the day', es: 'Opciones del día' },
    notesTitle: { en: 'Ride Notes', es: 'Notas de Ruta' },
    nFuel: { en: 'Fuel', es: 'Gasolina' },
    nTolls: { en: 'Tolls & vignettes', es: 'Peajes y viñetas' },
    nRoad: { en: 'Road & weather', es: 'Carretera y clima' },
    nFood: { en: 'Eat & drink', es: 'Comer y beber' },
    prevDay: { en: 'Previous', es: 'Anterior' },
    nextDay: { en: 'Next', es: 'Siguiente' },
    openMap: { en: 'Map', es: 'Mapa' },
    elevation: { en: 'Elevation sketch', es: 'Perfil de elevación' }
  },
  sos: {
    title: { en: 'Emergency', es: 'Emergencia' },
    sub: { en: 'Works offline. Everything you need when it matters.', es: 'Funciona sin conexión. Todo lo necesario cuando importa.' },
    call112: { en: 'Call 112', es: 'Llamar al 112' },
    call112Sub: { en: 'One number — police, medical & fire in all five countries', es: 'Un número — policía, médicos y bomberos en los cinco países' },
    myCard: { en: 'My Emergency Card', es: 'Mi Tarjeta de Emergencia' },
    myCardSub: { en: 'Your medical info, ready to show or send. Stored only on this device.', es: 'Tu información médica, lista para mostrar o enviar. Guardada solo en este dispositivo.' },
    cardEmpty: { en: 'Fill in your card once — show it to medics or send it to the crew in seconds when it counts.', es: 'Llena tu tarjeta una vez — muéstrala a los paramédicos o envíala al grupo en segundos cuando cuente.' },
    createCard: { en: 'Fill in my card', es: 'Llenar mi tarjeta' },
    needProfile: { en: 'The emergency card is personal — create your rider profile first (no email needed).', es: 'La tarjeta de emergencia es personal — primero crea tu perfil de piloto (sin correo).' },
    goProfile: { en: 'Create profile', es: 'Crear perfil' },
    showCard: { en: 'Show full screen', es: 'Ver en pantalla completa' },
    shareCard: { en: 'Send my card', es: 'Enviar mi tarjeta' },
    copyCard: { en: 'Copy as text', es: 'Copiar como texto' },
    fullName: { en: 'Full name', es: 'Nombre completo' },
    dob: { en: 'Date of birth', es: 'Fecha de nacimiento' },
    blood: { en: 'Blood type', es: 'Tipo de sangre' },
    allergies: { en: 'Allergies', es: 'Alergias' },
    meds: { en: 'Medications', es: 'Medicamentos' },
    conditions: { en: 'Medical conditions', es: 'Condiciones médicas' },
    insurer: { en: 'Insurance company', es: 'Aseguradora' },
    policy: { en: 'Policy number', es: 'Número de póliza' },
    insurancePhone: { en: 'Insurance assistance phone', es: 'Teléfono de asistencia del seguro' },
    contacts: { en: 'Emergency contacts', es: 'Contactos de emergencia' },
    contactName: { en: 'Name', es: 'Nombre' },
    contactRel: { en: 'Relation', es: 'Relación' },
    contactPhone: { en: 'Phone (with country code)', es: 'Teléfono (con código de país)' },
    extraNotes: { en: 'Anything else medics should know', es: 'Algo más que los paramédicos deban saber' },
    none: { en: 'None', es: 'Ninguna' },
    notSet: { en: 'not set', es: 'sin llenar' },
    countryNumbers: { en: 'Numbers by Country', es: 'Números por País' },
    crashTitle: { en: 'If There Is a Crash', es: 'Si Hay un Accidente' },
    rentalTitle: { en: 'Bike Rental', es: 'Renta de Motos' },
    docsTitle: { en: 'Carry on the Bike', es: 'Lleva en la Moto' },
    privacyNote: { en: 'Your card lives only in this browser on this device. It is never uploaded anywhere.', es: 'Tu tarjeta vive solo en este navegador y dispositivo. Nunca se sube a ningún lado.' },
    cardShareHeader: { en: 'RIDER EMERGENCY CARD — Euroride 2026', es: 'TARJETA DE EMERGENCIA — Euroride 2026' }
  },
  kit: {
    title: { en: 'Rider Kit', es: 'Kit del Piloto' },
    packing: { en: 'Packing', es: 'Equipaje' },
    plans: { en: 'Plans', es: 'Planes' },
    gate: { en: 'Packing lists and plans are personal. Create your rider profile to start — takes ten seconds, no email.', es: 'El equipaje y los planes son personales. Crea tu perfil de piloto para empezar — diez segundos, sin correo.' },
    packed: { en: 'packed', es: 'listos' },
    resetChecks: { en: 'Uncheck all', es: 'Desmarcar todo' },
    resetConfirm: { en: 'Uncheck every item?', es: '¿Desmarcar todos los artículos?' },
    addItem: { en: 'Add item', es: 'Agregar artículo' },
    itemPlaceholder: { en: 'e.g. spare gloves', es: 'ej. guantes extra' },
    plansSub: { en: 'Things to do, eat and see along the route. Your list — share it with the crew anytime.', es: 'Cosas para hacer, comer y ver en la ruta. Tu lista — compártela con el grupo cuando quieras.' },
    addPlan: { en: 'Add a plan', es: 'Agregar un plan' },
    planTitle: { en: 'What?', es: '¿Qué?' },
    planTitlePh: { en: 'e.g. Espresso in Bellagio', es: 'ej. Espresso en Bellagio' },
    planDay: { en: 'Day', es: 'Día' },
    planAnyDay: { en: 'Any day', es: 'Cualquier día' },
    planKind: { en: 'Type', es: 'Tipo' },
    planLink: { en: 'Link (optional)', es: 'Enlace (opcional)' },
    linkLabel: { en: 'link', es: 'enlace' },
    kindDo: { en: 'Do', es: 'Hacer' },
    kindEat: { en: 'Eat', es: 'Comer' },
    kindSee: { en: 'See', es: 'Ver' },
    kindStay: { en: 'Stay', es: 'Dormir' },
    suggestions: { en: 'Crew suggestions — tap to add', es: 'Sugerencias del grupo — toca para agregar' },
    emptyPlans: { en: 'No plans yet. Add your first idea or grab a suggestion below.', es: 'Aún no hay planes. Agrega tu primera idea o toma una sugerencia de abajo.' },
    sharePlans: { en: 'Share my list', es: 'Compartir mi lista' },
    myPlansHeader: { en: 'MY EURORIDE 2026 PLANS', es: 'MIS PLANES EURORIDE 2026' },
    added: { en: 'Added ✓', es: 'Agregado ✓' }
  },
  profile: {
    title: { en: 'Rider Profile', es: 'Perfil del Piloto' },
    heroSub: { en: 'A profile keeps your emergency card, packing list and plans — username and password only, no email, nothing leaves this device.', es: 'Tu perfil guarda tu tarjeta de emergencia, equipaje y planes — solo usuario y contraseña, sin correo, nada sale de este dispositivo.' },
    username: { en: 'Username', es: 'Usuario' },
    password: { en: 'Password', es: 'Contraseña' },
    password2: { en: 'Repeat password', es: 'Repite la contraseña' },
    create: { en: 'Create profile', es: 'Crear perfil' },
    login: { en: 'Sign in', es: 'Entrar' },
    logout: { en: 'Sign out', es: 'Salir' },
    haveAccount: { en: 'Already have a profile on this device?', es: '¿Ya tienes un perfil en este dispositivo?' },
    newAccount: { en: 'New here?', es: '¿Primera vez?' },
    signedInAs: { en: 'Riding as', es: 'Rodando como' },
    existing: { en: 'Profiles on this device', es: 'Perfiles en este dispositivo' },
    errUserTaken: { en: 'That username is taken on this device.', es: 'Ese usuario ya existe en este dispositivo.' },
    errUserInvalid: { en: '2–20 characters: letters, numbers, - or _', es: '2–20 caracteres: letras, números, - o _' },
    errPwShort: { en: 'Password: at least 4 characters.', es: 'Contraseña: mínimo 4 caracteres.' },
    errPwMatch: { en: "Passwords don't match.", es: 'Las contraseñas no coinciden.' },
    errLogin: { en: 'Wrong username or password.', es: 'Usuario o contraseña incorrectos.' },
    errInsecureContext: { en: 'Profiles need a secure connection (https or localhost). Open the published site to create one.', es: 'Los perfiles requieren una conexión segura (https o localhost). Abre el sitio publicado para crear uno.' },
    language: { en: 'Language', es: 'Idioma' },
    theme: { en: 'Theme', es: 'Tema' },
    themeLight: { en: 'Light', es: 'Claro' },
    themeDark: { en: 'Dark', es: 'Oscuro' },
    themeAuto: { en: 'Auto', es: 'Auto' },
    settings: { en: 'Settings', es: 'Ajustes' },
    myData: { en: 'My Data', es: 'Mis Datos' },
    export: { en: 'Download my data (JSON)', es: 'Descargar mis datos (JSON)' },
    exportSub: { en: 'Everything you saved, as a file — move it to another device or keep a backup.', es: 'Todo lo que guardaste, en un archivo — pásalo a otro dispositivo o guarda un respaldo.' },
    deleteProfile: { en: 'Delete this profile', es: 'Eliminar este perfil' },
    deleteConfirm: { en: 'Delete this profile and ALL its data from this device? This cannot be undone.', es: '¿Eliminar este perfil y TODOS sus datos de este dispositivo? No se puede deshacer.' },
    privacy: { en: 'How your data is stored', es: 'Cómo se guardan tus datos' },
    privacyBody: {
      en: 'Everything lives in this browser on this device — nothing is sent to a server. The password keeps profiles separate on a shared phone; it is not bank-grade security. Clearing the browser data erases it, so use the download button for a backup.',
      es: 'Todo vive en este navegador y dispositivo — nada se envía a un servidor. La contraseña separa los perfiles en un teléfono compartido; no es seguridad bancaria. Borrar los datos del navegador lo elimina, así que usa el botón de descarga como respaldo.'
    },
    about: { en: 'About', es: 'Acerca de' },
    aboutBody: { en: 'Euroride 2026 · v3.0 · Built by the crew, for the crew.', es: 'Euroride 2026 · v3.0 · Hecha por el grupo, para el grupo.' },
    shareTitle: { en: 'Open on Your Phone', es: 'Abrir en tu Celular' },
    shareSub: { en: 'Scan with your camera, or copy the link to share with the crew.', es: 'Escanéalo con la cámara, o copia el enlace para compartirlo con el grupo.' },
    copyLink: { en: 'Copy link', es: 'Copiar enlace' },
    qrNeedsNet: { en: 'QR needs a connection', es: 'El QR necesita conexión' }
  }
};
