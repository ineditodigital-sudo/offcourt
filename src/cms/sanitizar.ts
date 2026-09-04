/**
 * Limpia el HTML de los campos «texto con formato» antes de pintarlo.
 *
 * El editor del panel solo ofrece negrita, cursiva, subrayado, listas, títulos
 * y enlaces, pero lo que acaba en el JSON pudo llegar por otras vías (pegar
 * desde Word, un respaldo importado, una edición a mano del archivo). Aquí se
 * deja pasar únicamente esa lista corta de etiquetas y atributos, y se descarta
 * el resto: sin scripts, sin estilos en línea, sin manejadores de eventos.
 *
 * Se usa en los dos extremos —al guardar en el panel y al pintar en el sitio—
 * para que el sitio no dependa de que el panel haya hecho bien su trabajo.
 */

const ETIQUETAS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'A', 'UL', 'OL', 'LI', 'H2', 'H3', 'BLOCKQUOTE']);
const RE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export function sanitizarHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return sanitizarSinDom(html);

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  limpiar(doc.body);
  return doc.body.innerHTML;
}

function limpiar(nodo: Element) {
  for (const hijo of Array.from(nodo.childNodes)) {
    if (hijo.nodeType === Node.COMMENT_NODE) { hijo.remove(); continue; }
    if (hijo.nodeType !== Node.ELEMENT_NODE) continue;
    const el = hijo as Element;

    if (!ETIQUETAS.has(el.tagName)) {
      // Etiqueta no permitida: se conserva su texto y se desecha la etiqueta.
      // Un <div> o un <span> pegado desde otro sitio se vuelve texto plano.
      limpiar(el);
      const frag = el.ownerDocument.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.replaceWith(frag);
      continue;
    }

    for (const atributo of Array.from(el.attributes)) {
      const nombre = atributo.name.toLowerCase();
      if (el.tagName === 'A' && nombre === 'href' && RE_HREF.test(atributo.value.trim())) continue;
      if (el.tagName === 'A' && nombre === 'target' && atributo.value === '_blank') continue;
      el.removeAttribute(atributo.name);
    }
    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }
    limpiar(el);
  }
}

/** Respaldo para el render en servidor, donde no hay DOM: se quita todo lo peligroso. */
function sanitizarSinDom(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*(?!(?:p|br|strong|b|em|i|u|a|ul|ol|li|h2|h3|blockquote)\b)[a-z][^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*"(?!https?:\/\/|mailto:|tel:|\/|#)[^"]*"/gi, 'href="#"');
}

/** Texto plano de un HTML, para vistas previas y títulos de lista en el panel. */
export function textoPlano(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
