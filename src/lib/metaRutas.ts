/**
 * Títulos y descripciones de cada ruta, en un único sitio.
 *
 * Los consumen dos actores que antes no se hablaban:
 *
 *  1. Las páginas, vía `useSeo`, para el visitante que navega por el sitio.
 *  2. El generador del build (`scripts/generar-paginas.mjs`), que los escribe
 *     directamente en el <head> del HTML de cada ruta.
 *
 * Lo segundo es el motivo de que este archivo exista. `useSeo` inyecta las
 * etiquetas con JavaScript al montar el componente, y WhatsApp, LinkedIn y
 * Facebook no ejecutan JavaScript: al compartir /nosotros o /servicios/athletes
 * leían el <head> tal cual venía en index.html y mostraban siempre el título y
 * la descripción de la portada. Ahora cada ruta se sirve con su propio <head>.
 *
 * Si se edita un texto aquí, cambia en los dos sitios a la vez. Esa es la idea.
 */

export interface MetaRuta {
  title: string;
  description: string;
}

export const META: Record<
  'home' | 'nosotros' | 'privacidad' | 'terminos' | 'serviciosGenerico',
  MetaRuta
> = {
  home: {
    title: 'Offcourt Sports Group | Agencia Premium de Sports Marketing & Pádel',
    description:
      'Primera agencia premium de pádel en México. Conectamos atletas, marcas e instituciones con estrategias, experiencias y alianzas de alto valor. El verdadero valor sucede fuera de la cancha.',
  },
  nosotros: {
    title: 'Nosotros | Offcourt Sports Group',
    description:
      'Somos la primera agencia premium especializada en pádel de México: un hub integral para todo el ecosistema de negocios del deporte.',
  },
  privacidad: {
    title: 'Política de Privacidad | Offcourt Sports Group',
    description: 'Política de privacidad de Offcourt Sports Group.',
  },
  terminos: {
    title: 'Términos de Servicio | Offcourt Sports Group',
    description: 'Términos de servicio de Offcourt Sports Group.',
  },
  serviciosGenerico: {
    title: 'Servicios | Offcourt Sports Group',
    description: 'Soluciones integrales para el ecosistema de negocios del deporte.',
  },
};

/** Título de la página de una vertical. Misma fórmula en runtime y en el build. */
export function tituloServicio(nombre: string): string {
  return `${nombre} | Offcourt Sports Group`;
}
