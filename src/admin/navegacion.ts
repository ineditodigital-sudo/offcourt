import { definicion } from '../cms/definicion';
import type { Def, GrupoDef } from '../cms/dsl';

/**
 * El menú del panel.
 *
 * Está escrito a mano en vez de recorrer el árbol de definicion.ts porque el
 * orden y los nombres tienen que ser los que la persona reconoce («Inicio»,
 * «Portada», «Contacto»), no los que resulten de la estructura interna. Cada
 * entrada dice además qué página del sitio hay que mostrar en la vista previa
 * y a qué sección bajar.
 */

export interface Entrada {
  /** Ruta dentro del contenido (paginas.inicio.hero). */
  ruta: string;
  etiqueta: string;
  /** Página del sitio que hay que abrir en la vista previa. */
  web: string;
  /** Id de la sección a la que bajar dentro de esa página, si aplica. */
  ancla?: string;
}

export interface Pagina {
  id: string;
  etiqueta: string;
  web: string;
  entradas: Entrada[];
}

const s = (ruta: string, etiqueta: string, web: string, ancla?: string): Entrada => ({ ruta, etiqueta, web, ancla });

export const PAGINAS: Pagina[] = [
  {
    id: 'inicio',
    etiqueta: 'Inicio',
    web: '/',
    entradas: [
      s('paginas.inicio.hero', 'Portada', '/', 'hero'),
      s('paginas.inicio.adn', 'Problema, solución y ADN', '/'),
      s('paginas.inicio.clientes', '¿A quiénes ayudamos?', '/'),
      s('paginas.inicio.soluciones', 'Soluciones', '/', 'soluciones'),
      s('paginas.inicio.manifiesto', 'Manifiesto', '/', 'manifiesto'),
      s('paginas.inicio.alianza', 'Alianza Rafa Nadal', '/', 'alianza'),
      s('paginas.inicio.contacto', 'Contacto', '/', 'contacto'),
      s('paginas.inicio.orden', 'Orden de las secciones', '/'),
      s('paginas.inicio.seo', 'Google y redes sociales', '/'),
    ],
  },
  {
    id: 'nosotros',
    etiqueta: 'Nosotros',
    web: '/nosotros',
    entradas: [
      s('paginas.nosotros.hero', 'Cabecera', '/nosotros'),
      s('paginas.nosotros.filosofia', 'Filosofía', '/nosotros'),
      s('paginas.nosotros.mvv', 'Visión, valores y misión', '/nosotros'),
      s('paginas.nosotros.mostrarClientes', 'Secciones al final', '/nosotros'),
      s('paginas.nosotros.seo', 'Google y redes sociales', '/nosotros'),
    ],
  },
  {
    id: 'servicios',
    etiqueta: 'Servicios',
    web: '/servicios/consulting',
    entradas: [
      s('paginas.servicios.items', 'Las 7 verticales', '/servicios/consulting'),
      s('paginas.servicios.creadora', 'Creadora destacada', '/servicios/creators'),
      s('paginas.servicios.textos', 'Textos comunes', '/servicios/consulting'),
      s('paginas.servicios.seo', 'Google y redes sociales', '/servicios/consulting'),
    ],
  },
  {
    id: 'legales',
    etiqueta: 'Privacidad y términos',
    web: '/privacidad',
    entradas: [
      s('paginas.privacidad', 'Política de privacidad', '/privacidad'),
      s('paginas.terminos', 'Términos de servicio', '/terminos'),
    ],
  },
  {
    id: 'global',
    etiqueta: 'Todo el sitio',
    web: '/',
    entradas: [
      s('global.contacto', 'Datos de contacto', '/', 'contacto'),
      s('global.redes', 'Redes sociales', '/', 'contacto'),
      s('global.navegacion', 'Menú superior', '/', 'hero'),
      s('global.pie', 'Pie de página', '/'),
      s('global.agenteIA', 'Botón de agente IA', '/'),
      s('global.tema', 'Colores y tipografías', '/'),
      s('global.integraciones', 'Mediciones', '/'),
    ],
  },
];

/** Todas las entradas en una lista plana, de la más específica a la más general. */
const TODAS = PAGINAS.flatMap((p) => p.entradas).sort((a, b) => b.ruta.length - a.ruta.length);

/** ¿A qué entrada del menú pertenece el campo que se pulsó en la vista previa? */
export function entradaDe(rutaCampo: string): Entrada | null {
  return TODAS.find((e) => rutaCampo === e.ruta || rutaCampo.startsWith(e.ruta + '.')) ?? null;
}

export function paginaDe(entrada: Entrada): Pagina | null {
  return PAGINAS.find((p) => p.entradas.includes(entrada)) ?? null;
}

/** Definición del nodo de una entrada, para pintar su formulario. */
export function defDe(ruta: string): Def | null {
  let actual: Def = definicion;
  for (const parte of ruta.split('.')) {
    if (actual._t !== 'grupo') return null;
    const sig: Def | undefined = (actual as GrupoDef<Record<string, Def>>).campos[parte];
    if (!sig) return null;
    actual = sig;
  }
  return actual;
}

/**
 * «Secciones al final» de Nosotros son dos interruptores sueltos, no un grupo.
 * Se listan aparte para poder pintarlos juntos bajo una sola entrada.
 */
export const SUELTOS: Record<string, string[]> = {
  'paginas.nosotros.mostrarClientes': ['paginas.nosotros.mostrarClientes', 'paginas.nosotros.mostrarContacto'],
};
