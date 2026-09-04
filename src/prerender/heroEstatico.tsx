import { renderToStaticMarkup } from 'react-dom/server';
import { HeroV3 } from '../features/v3/components/HeroV3';
import { servicesData } from '../features/v3/data/servicios';
import { META, tituloServicio } from '../lib/metaRutas';

/**
 * Genera el HTML del hero en tiempo de compilación.
 *
 * El sitio es una SPA: hasta que el navegador descarga y ejecuta 90 KB de
 * JavaScript no existe ni un solo píxel de contenido. Eso es lo que mantenía el
 * FCP en 2,4 s y el Speed Index en 5,9 s.
 *
 * Se renderiza el MISMO componente que usa React, así que el marcado estático no
 * puede desviarse del real por mucho que cambie el diseño: si alguien edita
 * HeroV3, esto cambia con él. Cuando React monta, sustituye este HTML por su
 * propia versión, que es idéntica, de modo que el relevo no se ve.
 *
 * Los efectos (useEffect) no se ejecutan en este render, así que aquí no hay
 * vídeo ni animaciones de scroll: solo el póster y el texto, que es justo lo que
 * necesita pintarse pronto.
 */
export function render(): string {
  return renderToStaticMarkup(<HeroV3 />);
}

export interface PaginaEstatica {
  /** Ruta pública, tal como la ve el visitante y como irá en la canónica. */
  ruta: string;
  /** Archivo a escribir dentro de dist/, sin barra inicial. */
  archivo: string;
  title: string;
  description: string;
  /** Fuera del índice de buscadores (las versiones antiguas del diseño). */
  noindex?: boolean;
}

/**
 * Todas las páginas que el build escribe con su propio <head>.
 *
 * La portada no está aquí: es dist/index.html, que ya se genera con su hero
 * incrustado y sus metadatos. Las demás salen de esta lista, y sus textos vienen
 * de metaRutas.ts y de servicesData, o sea de las mismas constantes que usa la
 * aplicación en el navegador. No pueden desincronizarse.
 */
export function paginas(): PaginaEstatica[] {
  const servicios = Object.entries(servicesData).map(([id, s]) => ({
    ruta: `/servicios/${id}`,
    archivo: `servicios/${id}.html`,
    title: tituloServicio(s.title),
    description: s.description,
  }));

  return [
    { ruta: '/nosotros', archivo: 'nosotros.html', ...META.nosotros },
    ...servicios,
    { ruta: '/privacidad', archivo: 'privacidad.html', ...META.privacidad },
    { ruta: '/terminos', archivo: 'terminos.html', ...META.terminos },

    // Los dos diseños anteriores siguen accesibles para consulta interna, pero
    // no deben indexarse: son el mismo contenido con otra piel y a ojos de
    // Google eran páginas duplicadas de la portada. El `noindex` va escrito en
    // el HTML servido, no inyectado por JavaScript, para que lo vea cualquier
    // rastreador sin tener que renderizar la página.
    {
      ruta: '/v1',
      archivo: 'v1.html',
      title: 'Diseño V1 (archivo) | Offcourt Sports Group',
      description: 'Versión anterior del sitio, conservada para consulta interna.',
      noindex: true,
    },
    {
      ruta: '/v2',
      archivo: 'v2.html',
      title: 'Diseño V2 (archivo) | Offcourt Sports Group',
      description: 'Versión anterior del sitio, conservada para consulta interna.',
      noindex: true,
    },
  ];
}

/** La portada, para que el generador escriba su <head> con el mismo código. */
export function portada(): PaginaEstatica {
  return { ruta: '/', archivo: 'index.html', ...META.home };
}
