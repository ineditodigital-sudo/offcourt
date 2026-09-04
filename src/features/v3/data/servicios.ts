import { Target, Users, Megaphone, TrendingUp, Award } from 'lucide-react';

/**
 * Las siete verticales de Off Court: contenido de las páginas /servicios/:id.
 *
 * Vive fuera del componente porque lo consumen dos sitios: la página en el
 * navegador y el generador del build (vía src/prerender/heroEstatico.tsx), que
 * necesita el título y la descripción de cada vertical para escribir el <head>
 * del HTML de esa ruta. Tenerlo aquí evita que las dos versiones se separen.
 */
export const servicesData = {
  'consulting': {
    title: 'OFF COURT CONSULTING',
    subtitle: 'Estrategia y Desarrollo de Negocio',
    description: 'Auditamos, estructuramos y ejecutamos el plan que convierte tu proyecto deportivo en un activo rentable y escalable. Estrategia de sala de juntas, respaldada por datos.',
    challenge: 'Las decisiones en la industria deportiva suelen basarse en la pasión y no en datos o modelos financieros robustos.',
    keyStat: {
      value: '360°',
      label: 'Visión y Auditoría Corporativa'
    },
    icon: Target,
    image: '/fotos/IMG_015.webp',
    gallery: ['/fotos/IMG_025.webp', '/fotos/IMG_005.webp'],
    benefits: ['Modelaje financiero y proyecciones de ROI', 'Estudios de viabilidad para nuevos mercados', 'Consultoría para instituciones deportivas', 'Auditoría comercial y operativa'],
    salesPitch: 'El deporte es pasión, pero también es un negocio. Asegura la rentabilidad y escalabilidad de tu proyecto con una estrategia blindada.'
  },
  'experiences': {
    title: 'OFF COURT EXPERIENCES',
    subtitle: 'Eventos, Clínicas y Camps Premium',
    description: 'Diseñamos y operamos experiencias de primer nivel con metodologías de clase mundial —incluida nuestra colaboración directa con la Rafa Nadal Academy— para dar acceso a formación de élite.',
    challenge: 'El mercado está saturado de eventos genéricos que no logran fidelizar ni brindar valor real a las marcas patrocinadoras o asistentes.',
    keyStat: {
      value: 'VIP',
      label: 'Experiencias de Formación Internacional'
    },
    icon: Award,
    image: '/fotos/IMG_024.webp',
    gallery: ['/rafa_nadal_academy.png', '/fotos/IMG_017.webp'],
    benefits: ['Alianzas con la Rafa Nadal Academy', 'Operación de clínicas y campamentos', 'Activaciones VIP para corporativos', 'Networking de alto nivel en entornos deportivos'],
    salesPitch: 'Asocia tu marca o capacita a tu talento con metodologías mundiales. Creamos espacios donde el deporte y los negocios se encuentran.'
  },
  'marketing': {
    title: 'OFF COURT MARKETING',
    subtitle: 'Branding Deportivo, Contenido y Patrocinios',
    description: 'Conectamos marcas con las audiencias más apasionadas mediante patrocinios inteligentes y una identidad que se siente. Impacto real, retorno medible.',
    challenge: 'Las marcas gastan millones en patrocinio pasivo y logotipos invisibles sin un retorno claro.',
    keyStat: {
      value: 'ROI',
      label: 'Generación de Valor y Exposición'
    },
    icon: Megaphone,
    image: '/fotos/IMG_003.webp',
    gallery: ['/fotos/IMG_008.webp', '/fotos/IMG_021.webp'],
    benefits: ['Desarrollo de manual de identidad', 'Activaciones y patrocinios estratégicos', 'Contenido digital y storytelling', 'Auditoría de percepción de marca'],
    salesPitch: 'Deja de comprar espacios publicitarios vacíos y comienza a ser parte de la cultura deportiva. Domina la conversación.'
  },
  'athletes': {
    title: 'OFF COURT ATHLETES',
    subtitle: 'Representación Comercial, Marca Personal y Protección Financiera',
    description: 'Somos el brazo corporativo del atleta: gestionamos su imagen, construimos su marca personal, atraemos patrocinios y blindamos su futuro financiero.',
    challenge: 'La carrera deportiva es corta, y la mayoría de los atletas no estructuran un portafolio o marca para cuando esta termine.',
    keyStat: {
      value: '100%',
      label: 'Enfoque en el Legado del Atleta'
    },
    icon: Users,
    image: '/fotos/IMG_023.webp',
    gallery: ['/fotos/IMG_018.webp', '/fotos/IMG_001.webp'],
    benefits: ['Representación comercial exclusiva', 'Estructuración de marca personal', 'Estrategia de patrocinios y PR', 'Asesoría en protección patrimonial'],
    salesPitch: 'Tu talento en la cancha está demostrado. Es momento de capitalizarlo fuera de ella y blindar tu futuro financiero.'
  },
  'creators': {
    title: 'OFF COURT CREATORS',
    subtitle: 'Creadores de Contenido Deportivo',
    description: 'Impulsamos a las nuevas voces del deporte: estructuramos alianzas, optimizamos su monetización y profesionalizamos su imagen para convertirlas en referentes.',
    challenge: 'Muchos creadores tienen la audiencia, pero carecen de la estructura comercial para monetizar y crecer sostenidamente.',
    keyStat: {
      value: 'Top',
      label: 'Posicionamiento y Monetización'
    },
    icon: TrendingUp,
    image: '/fotos/IMG_016.webp',
    gallery: ['/fotos/IMG_014.webp', '/fotos/IMG_020.webp'],
    benefits: ['Gestión comercial de canales', 'Alianzas y brand deals', 'Desarrollo de mercancía y productos', 'Asesoría en crecimiento orgánico'],
    salesPitch: 'Convierte tus vistas en ingresos reales. Te ayudamos a profesionalizar tu contenido y conectarlo con las marcas más grandes.'
  },
  'media': {
    title: 'OFF COURT MEDIA',
    subtitle: 'Producción, Streaming y Medios de Comunicación',
    description: 'Casa productora especializada en deporte: streaming de eventos, contenido original y un medio propio que da alcance mediático a nuestros partners.',
    challenge: 'La atención digital está fragmentada; producir contenido de alta calidad en tiempo real es complejo y costoso.',
    keyStat: {
      value: '4K',
      label: 'Transmisiones y Producción de Calidad'
    },
    icon: Target,
    image: '/fotos/IMG_007.webp',
    gallery: ['/fotos/IMG_015.webp', '/fotos/IMG_025.webp'],
    benefits: ['Transmisión y streaming de torneos', 'Producción de contenido original', 'Distribución en medios propios y externos', 'Cobertura de eventos deportivos'],
    salesPitch: 'Domina la pantalla. Nosotros producimos y distribuimos el contenido para que tu evento o marca sea visto en todo el mundo.'
  },
  'ventures': {
    title: 'OFF COURT VENTURES',
    subtitle: 'Organización de Eventos, Nuevos Proyectos y Alianzas Estratégicas',
    description: 'Exploramos, incubamos y lanzamos nuevos proyectos deportivos —de franquicias internacionales a torneos disruptivos y SportsTech.',
    challenge: 'Las nuevas ideas deportivas requieren capital, red de contactos y una estructuración impecable para penetrar el mercado.',
    keyStat: {
      value: 'Global',
      label: 'Innovación y Escalabilidad'
    },
    icon: TrendingUp,
    image: '/fotos/PADEL.webp',
    gallery: ['/fotos/IMG_004.webp', '/fotos/IMG_021.webp'],
    benefits: ['Incubación de proyectos deportivos', 'Búsqueda de capital y alianzas', 'Gestión de franquicias internacionales', 'Inversiones en SportsTech'],
    salesPitch: 'Si tienes una visión disruptiva para la industria deportiva, nosotros tenemos la estructura y las alianzas para hacerla realidad.'
  }
};
