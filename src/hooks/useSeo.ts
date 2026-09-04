import { useEffect } from 'react';

const SITE = 'https://offcourtsports.com.mx';
const DEFAULT_IMAGE = SITE + '/og-image.png';

function setMeta(key: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Fija la URL canónica de la ruta actual.
 *
 * Sin esto, cualquier variante con la que se llegue a una página —parámetros de
 * campaña tipo ?utm_source, una barra final de más— le parece a Google una URL
 * distinta con el mismo contenido, y reparte la autoridad entre todas.
 * Se construye desde el origen fijo del sitio, no desde location.href, para que
 * los parámetros no se cuelen en la canónica.
 */
function setCanonical(pathname: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  const limpia = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  el.setAttribute('href', SITE + limpia);
}

export function useSeo(title: string, description: string, imagen: string = DEFAULT_IMAGE) {
  // La imagen elegida en el panel se guarda como ruta relativa (/media/x.webp);
  // las redes sociales exigen la dirección completa.
  const image = /^https?:\/\//i.test(imagen) ? imagen : SITE + (imagen.startsWith('/') ? imagen : '/' + imagen);
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', SITE + (window.location.pathname === '/' ? '' : window.location.pathname), 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setCanonical(window.location.pathname);
  }, [title, description, image]);
}
