/* =====================================================================
   EMERGENCY REFERENCE DATA
   Static, offline-first content for the SOS screen.
   Numbers verified for 2026 — re-check before each trip.
   ===================================================================== */

/* Per-country emergency numbers along the route. */
export const COUNTRY_NUMBERS = [
  {
    code: 'IT', flag: '🇮🇹', name: { en: 'Italy', es: 'Italia' },
    numbers: [
      { label: { en: 'All emergencies', es: 'Todas las emergencias' }, tel: '112' },
      { label: { en: 'Medical', es: 'Médica' }, tel: '118' },
      { label: { en: 'Road assistance (ACI)', es: 'Asistencia vial (ACI)' }, tel: '803116' }
    ]
  },
  {
    code: 'CH', flag: '🇨🇭', name: { en: 'Switzerland', es: 'Suiza' },
    numbers: [
      { label: { en: 'All emergencies', es: 'Todas las emergencias' }, tel: '112' },
      { label: { en: 'Ambulance', es: 'Ambulancia' }, tel: '144' },
      { label: { en: 'Road assistance (TCS)', es: 'Asistencia vial (TCS)' }, tel: '140' },
      { label: { en: 'Air rescue (Rega)', es: 'Rescate aéreo (Rega)' }, tel: '1414' }
    ]
  },
  {
    code: 'AT', flag: '🇦🇹', name: { en: 'Austria', es: 'Austria' },
    numbers: [
      { label: { en: 'All emergencies', es: 'Todas las emergencias' }, tel: '112' },
      { label: { en: 'Ambulance', es: 'Ambulancia' }, tel: '144' },
      { label: { en: 'Road assistance (ÖAMTC)', es: 'Asistencia vial (ÖAMTC)' }, tel: '120' }
    ]
  },
  {
    code: 'DE', flag: '🇩🇪', name: { en: 'Germany', es: 'Alemania' },
    numbers: [
      { label: { en: 'All emergencies', es: 'Todas las emergencias' }, tel: '112' },
      { label: { en: 'Police', es: 'Policía' }, tel: '110' },
      { label: { en: 'Road assistance (ADAC)', es: 'Asistencia vial (ADAC)' }, tel: '+49 89 22 22 22' }
    ]
  },
  {
    code: 'FR', flag: '🇫🇷', name: { en: 'France', es: 'Francia' },
    numbers: [
      { label: { en: 'All emergencies', es: 'Todas las emergencias' }, tel: '112' },
      { label: { en: 'Medical (SAMU)', es: 'Médica (SAMU)' }, tel: '15' },
      { label: { en: 'Police', es: 'Policía' }, tel: '17' }
    ]
  }
];

/* What to do at a crash scene — standard European guidance, kept short. */
export const CRASH_PROTOCOL = [
  {
    en: '<b>Secure the scene.</b> Park bikes ahead of the crash, hazards on, hi-vis vest on, warning triangle ~100 m back (further on fast roads or blind corners).',
    es: '<b>Asegura la escena.</b> Estaciona las motos más adelante del accidente, intermitentes puestos, chaleco reflejante y triángulo a ~100 m (más lejos en vías rápidas o curvas ciegas).'
  },
  {
    en: '<b>Call 112.</b> It works in all five countries, free, with English operators. Say: location (use the map link or km marker), number of injured, and whether anyone is unconscious.',
    es: '<b>Llama al 112.</b> Funciona en los cinco países, gratis, con operadores en inglés. Di: ubicación (usa el enlace del mapa o el kilómetro), número de heridos y si alguien está inconsciente.'
  },
  {
    en: "<b>Don't remove an injured rider's helmet</b> unless they are not breathing and you must open the airway. Keep them still, keep them warm, talk to them.",
    es: '<b>No quites el casco a un herido</b> a menos que no respire y debas abrir la vía aérea. Mantenlo inmóvil, abrigado y háblale.'
  },
  {
    en: '<b>Show their Emergency Card.</b> Every rider should carry one in this app — blood type, allergies, medications, contacts — ready to show medics.',
    es: '<b>Muestra su Tarjeta de Emergencia.</b> Cada piloto debería llenar la suya en esta app — tipo de sangre, alergias, medicamentos, contactos — lista para mostrar a los paramédicos.'
  },
  {
    en: '<b>Document everything.</b> Photos of bikes, road, documents. For any bike damage, fill in the European Accident Statement from the rental papers and call EagleRider before moving the bike.',
    es: '<b>Documenta todo.</b> Fotos de las motos, la vía y los documentos. Si hay daños, llena el Parte Europeo de Accidente que viene con los papeles de la renta y llama a EagleRider antes de mover la moto.'
  }
];

/* Rental company reference card. */
export const RENTAL = {
  name: 'EagleRider Milan',
  note: {
    en: 'Pickup & drop-off point for the bikes. Confirm the exact phone number and after-hours procedure on the rental papers at pickup — save it to your phone on day 1.',
    es: 'Punto de recogida y entrega de las motos. Confirma el teléfono exacto y el procedimiento fuera de horario en los papeles de la renta al recogerlas — guárdalo en tu teléfono el día 1.'
  },
  mapUrl: 'https://www.google.com/maps/search/EagleRider+Milan'
};

/* Documents every rider must carry on the bike. */
export const REQUIRED_DOCS = [
  { en: 'Driver license + International Driving Permit (IDP)', es: 'Licencia de conducir + Permiso Internacional de Conducir (IDP)' },
  { en: 'Passport (and a paper copy stored separately)', es: 'Pasaporte (y una copia en papel guardada aparte)' },
  { en: 'Rental contract & insurance papers', es: 'Contrato de renta y papeles del seguro' },
  { en: 'Travel/medical insurance card with the assistance phone number', es: 'Tarjeta del seguro de viaje/médico con el teléfono de asistencia' }
];
