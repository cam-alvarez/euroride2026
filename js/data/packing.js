/* =====================================================================
   PACKING TEMPLATE — long-distance Alpine motorcycle touring
   Curated for this trip: rental Harleys, August in the Alps,
   0–10 °C summits and 30 °C valleys on the same day.
   Each item has a stable id so checked state survives edits.
   ===================================================================== */

export const PACKING_TEMPLATE = [
  {
    id: 'docs', icon: '🪪',
    name: { en: 'Documents & Money', es: 'Documentos y Dinero' },
    items: [
      { id: 'passport',  label: { en: 'Passport', es: 'Pasaporte' } },
      { id: 'license',   label: { en: 'Driver license + IDP', es: 'Licencia de conducir + permiso internacional (IDP)' } },
      { id: 'rental',    label: { en: 'Rental voucher / confirmation', es: 'Comprobante de la renta de motos' } },
      { id: 'insurance', label: { en: 'Travel & medical insurance cards', es: 'Tarjetas de seguro de viaje y médico' } },
      { id: 'cards',     label: { en: 'Two payment cards (kept separately)', es: 'Dos tarjetas de pago (guardadas por separado)' } },
      { id: 'cash',      label: { en: 'Cash: EUR + some CHF', es: 'Efectivo: EUR + algo de CHF' } },
      { id: 'copies',    label: { en: 'Paper + cloud copies of all documents', es: 'Copias en papel y en la nube de todos los documentos' } }
    ]
  },
  {
    id: 'gear', icon: '🪖',
    name: { en: 'Riding Gear', es: 'Equipo de Manejo' },
    items: [
      { id: 'helmet',   label: { en: 'Helmet (ECE approved)', es: 'Casco (homologado ECE)' } },
      { id: 'gloves',   label: { en: 'Gloves ×2 (summer + waterproof)', es: 'Guantes ×2 (verano + impermeables)' } },
      { id: 'jacket',   label: { en: 'Armored jacket', es: 'Chamarra con protecciones' } },
      { id: 'pants',    label: { en: 'Riding pants', es: 'Pantalón de manejo' } },
      { id: 'boots',    label: { en: 'Riding boots', es: 'Botas de manejo' } },
      { id: 'rain',     label: { en: 'Rain suit — within reach, not buried', es: 'Traje de lluvia — a la mano, no enterrado' } },
      { id: 'thermal',  label: { en: 'Thermal mid-layer for the passes', es: 'Capa térmica para los pasos de montaña' } },
      { id: 'buff',     label: { en: 'Neck buff / balaclava', es: 'Bufanda tubular / pasamontañas' } },
      { id: 'earplugs', label: { en: 'Earplugs (+ spares)', es: 'Tapones para oídos (+ repuestos)' } },
      { id: 'visor',    label: { en: 'Sunglasses or dark visor', es: 'Lentes de sol o mica oscura' } },
      { id: 'hivis',    label: { en: 'Hi-vis vest (required in FR/AT/IT breakdowns)', es: 'Chaleco reflejante (obligatorio en averías en FR/AT/IT)' } }
    ]
  },
  {
    id: 'clothes', icon: '👕',
    name: { en: 'Off-Bike Clothing', es: 'Ropa de Calle' },
    items: [
      { id: 'outfits', label: { en: 'Casual outfits (hotels & dinners)', es: 'Ropa casual (hoteles y cenas)' } },
      { id: 'shoes',   label: { en: 'Comfortable walking shoes', es: 'Zapatos cómodos para caminar' } },
      { id: 'swim',    label: { en: 'Swimsuit (Lake Como!)', es: 'Traje de baño (¡Lago de Como!)' } },
      { id: 'warmhat', label: { en: 'Light warm hat for alpine evenings', es: 'Gorro ligero para noches alpinas' } }
    ]
  },
  {
    id: 'tech', icon: '🔌',
    name: { en: 'Tech & Navigation', es: 'Tecnología y Navegación' },
    items: [
      { id: 'mount',    label: { en: 'Phone mount (ask EagleRider what fits)', es: 'Soporte de teléfono (pregunta en EagleRider cuál sirve)' } },
      { id: 'powerbank',label: { en: 'Power bank + cables', es: 'Batería externa + cables' } },
      { id: 'adapter',  label: { en: 'EU power adapter (CH uses its own plug!)', es: 'Adaptador de corriente EU (¡Suiza usa clavija propia!)' } },
      { id: 'intercom', label: { en: 'Helmet intercom + charger', es: 'Intercomunicador de casco + cargador' } },
      { id: 'offline',  label: { en: 'Offline maps downloaded (Google Maps areas)', es: 'Mapas sin conexión descargados (áreas de Google Maps)' } },
      { id: 'camera',   label: { en: 'Action cam + mounts + cards', es: 'Cámara de acción + soportes + memorias' } }
    ]
  },
  {
    id: 'health', icon: '💊',
    name: { en: 'Health', es: 'Salud' },
    items: [
      { id: 'meds',      label: { en: 'Personal medications (in original packaging)', es: 'Medicamentos personales (en su empaque original)' } },
      { id: 'painkiller',label: { en: 'Ibuprofen / paracetamol', es: 'Ibuprofeno / paracetamol' } },
      { id: 'sunscreen', label: { en: 'Sunscreen + lip balm (alpine sun burns)', es: 'Bloqueador + bálsamo labial (el sol alpino quema)' } },
      { id: 'firstaid',  label: { en: 'Small first-aid kit', es: 'Botiquín pequeño' } },
      { id: 'blister',   label: { en: 'Blister plasters / tape', es: 'Parches para ampollas / cinta' } },
      { id: 'emcard',    label: { en: 'Emergency Card filled in (SOS tab)', es: 'Tarjeta de Emergencia llena (pestaña SOS)' } }
    ]
  },
  {
    id: 'bike', icon: '🏍️',
    name: { en: 'Bike & Luggage', es: 'Moto y Equipaje' },
    items: [
      { id: 'drybags',  label: { en: 'Dry bags / saddlebag liners', es: 'Bolsas impermeables / forros de alforja' } },
      { id: 'bungee',   label: { en: 'Bungee cords / cargo net', es: 'Pulpos (cuerdas elásticas) / red de carga' } },
      { id: 'ties',     label: { en: 'Cable ties + duct tape', es: 'Cinchos + cinta americana' } },
      { id: 'multitool',label: { en: 'Compact multi-tool', es: 'Multiherramienta compacta' } },
      { id: 'gauge',    label: { en: 'Tire pressure gauge', es: 'Medidor de presión de llantas' } },
      { id: 'cloth',    label: { en: 'Microfiber cloth + visor cleaner', es: 'Paño de microfibra + limpiador de mica' } },
      { id: 'lock',     label: { en: 'Disc lock or cable lock', es: 'Candado de disco o cable' } }
    ]
  }
];

/* Starter ideas for the Plans list — one-tap add. */
export const PLAN_SUGGESTIONS = [
  { id: 'sg-bratwurst', kind: 'eat', day: 3,  title: { en: 'Bratwurst at the Stelvio summit stands', es: 'Bratwurst en los puestos de la cima del Stelvio' } },
  { id: 'sg-bmw',       kind: 'see', day: 5,  title: { en: 'BMW Welt & Museum', es: 'BMW Welt y Museo' } },
  { id: 'sg-allianz',   kind: 'see', day: 5,  title: { en: 'Allianz Arena tour (book ahead)', es: 'Tour del Allianz Arena (reservar antes)' } },
  { id: 'sg-biergarten',kind: 'eat', day: 4,  title: { en: 'Arrival beer garden: Augustiner-Keller', es: 'Biergarten de llegada: Augustiner-Keller' } },
  { id: 'sg-tarte',     kind: 'eat', day: 6,  title: { en: 'Tarte flambée in an Alsace village', es: 'Tarte flambée en un pueblo de Alsacia' } },
  { id: 'sg-rosti',     kind: 'eat', day: 7,  title: { en: 'Rösti with a reservoir view on Grimsel', es: 'Rösti con vista al embalse en el Grimsel' } },
  { id: 'sg-tremola',   kind: 'do',  day: 8,  title: { en: 'Ride the cobbled Tremola (if dry)', es: 'Rodar la Tremola empedrada (si está seca)' } },
  { id: 'sg-gelato',    kind: 'eat', day: 9,  title: { en: 'Gelato quality inspection in Bellagio', es: 'Inspección de calidad del gelato en Bellagio' } },
  { id: 'sg-risotto',   kind: 'eat', day: 10, title: { en: 'Farewell risotto alla milanese', es: 'Risotto alla milanese de despedida' } }
];
