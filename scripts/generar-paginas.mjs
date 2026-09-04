/**
 * Cierre del build. Hace dos cosas sobre dist/:
 *
 *   1. Incrusta el hero pre-renderizado dentro de <div id="root"> en la portada.
 *   2. Escribe un archivo HTML por cada ruta del sitio, con SU título, SU
 *      descripción, SUS Open Graph y SU canónica ya escritos en el <head>.
 *
 * Lo primero venía de antes (era inyectar-hero.mjs) y ataca el FCP: hasta que
 * el navegador ejecutaba el JavaScript no había ni un píxel de contenido.
 *
 * Lo segundo es nuevo y arregla un fallo distinto. useSeo.ts pone las etiquetas
 * con JavaScript al montar el componente, y los rastreadores de WhatsApp,
 * LinkedIn y Facebook no ejecutan JavaScript: leían el <head> tal cual venía en
 * index.html, así que compartir /nosotros o /servicios/athletes mostraba
 * siempre la ficha de la portada. Ahora cada ruta se sirve con el suyo.
 *
 * El .htaccess mapea /nosotros -> nosotros.html y /servicios/x -> servicios/x.html
 * ANTES del salto a index.html. Si estos archivos faltaran, esa regla no casa y
 * todo vuelve al comportamiento de siempre: el sitio no se rompe.
 *
 * El hero va en #root a propósito: cuando React arranca con createRoot() vacía
 * ese contenedor y pinta lo suyo. Como el HTML estático salió del mismo
 * componente, el reemplazo es visualmente idéntico y el relevo no se percibe.
 */
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const MODULO = resolve(RAIZ, '.prerender/heroEstatico.js');
const DIST = resolve(RAIZ, 'dist');
const HTML = resolve(DIST, 'index.html');
const SITIO = 'https://offcourtsports.com.mx';

const kb = (n) => (n / 1024).toFixed(1);
const fallar = (msg) => { console.error('  [prerender] ' + msg); process.exit(1); };

if (!existsSync(MODULO)) fallar('falta .prerender/heroEstatico.js — ¿corrió el build SSR?');

const { render, paginas, portada } = await import(pathToFileURL(MODULO).href);

// ---------------------------------------------------------------- 1. el hero

const marcado = render();
if (!marcado || marcado.length < 500) {
  fallar('el marcado del hero salió sospechosamente corto; aborto para no romper el HTML');
}

let html = readFileSync(HTML, 'utf8');
if (!html.includes('<div id="root"></div>')) {
  fallar('no encontré <div id="root"></div> en dist/index.html');
}

const RAIZ_VACIA = '<div id="root"></div>';
const plantilla = html; // sin hero: la base de las páginas secundarias
html = html.replace(RAIZ_VACIA, `<div id="root">${marcado}</div>`);

console.log(`  [prerender] hero incrustado: ${kb(marcado.length)} KB de HTML`);

// ------------------------------------------------------- 2. el <head> por ruta

const MARCA_INICIO = '<!-- SEO:INICIO';
const MARCA_FIN = '<!-- SEO:FIN -->';

if (!plantilla.includes(MARCA_INICIO) || !plantilla.includes(MARCA_FIN)) {
  fallar('no encontré los marcadores SEO:INICIO / SEO:FIN en index.html');
}

/** Escapa lo que va dentro de un atributo HTML. Los títulos llevan & y comillas. */
const attr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Escapa lo que va dentro de <title>. */
const texto = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cabecera({ ruta, title, description, noindex }) {
  const url = SITIO + (ruta === '/' ? '' : ruta);
  const t = attr(title);
  const d = attr(description);
  return [
    '<!-- Generado por scripts/generar-paginas.mjs. No editar a mano: se',
    '         reescribe en cada build a partir de src/lib/metaRutas.ts. -->',
    `    <title>${texto(title)}</title>`,
    `    <meta name="description" content="${d}" />`,
    noindex ? '    <meta name="robots" content="noindex, nofollow" />' : null,
    `    <meta property="og:title" content="${t}" />`,
    `    <meta property="og:description" content="${d}" />`,
    '    <meta property="og:type" content="website" />',
    '    <meta property="og:site_name" content="Offcourt Sports Group" />',
    '    <meta property="og:locale" content="es_MX" />',
    `    <meta property="og:image" content="${SITIO}/og-image.png" />`,
    `    <meta property="og:url" content="${url}" />`,
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${t}" />`,
    `    <meta name="twitter:description" content="${d}" />`,
    `    <meta name="twitter:image" content="${SITIO}/og-image.png" />`,
    `    <link rel="canonical" href="${url}" />`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Sustituye el bloque entre marcadores por el <head> de esta ruta. */
function conCabecera(base, pagina) {
  const i = base.indexOf(MARCA_INICIO);
  const j = base.indexOf(MARCA_FIN);
  if (i === -1 || j === -1) fallar('marcadores SEO ausentes en la plantilla');
  return base.slice(0, i) + cabecera(pagina) + base.slice(j + MARCA_FIN.length);
}

// La portada conserva el hero; las demás arrancan con #root vacío, igual que
// antes de este cambio. Aquí solo se toca el <head>.
writeFileSync(HTML, conCabecera(html, portada()));

const lista = paginas();
for (const p of lista) {
  const destino = resolve(DIST, p.archivo);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conCabecera(plantilla, p));
}

console.log(`  [prerender] ${lista.length + 1} páginas con <head> propio:`);
console.log(`  [prerender]   / (portada, con hero)`);
for (const p of lista) {
  console.log(`  [prerender]   ${p.ruta}${p.noindex ? '  [noindex]' : ''}`);
}

// El bundle SSR es material intermedio: no debe acabar en dist ni en el repo.
//
// En Windows el borrado falla de vez en cuando con ENOTEMPTY aunque la carpeta
// esté ya vacía: el antivirus o el propio explorador conservan un descriptor
// abierto unos milisegundos después de que Vite suelte los archivos. Se
// reintenta un momento y, si aun así no se puede, se avisa y se sigue: la
// carpeta está en .gitignore y el build ya terminó su trabajo. Antes esto
// tumbaba el build entero DESPUÉS de haber generado bien todas las páginas.
function limpiarTemporal(dir, intentos = 5) {
  for (let i = 0; i < intentos; i++) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      return true;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
    }
  }
  return false;
}

if (!limpiarTemporal(resolve(RAIZ, '.prerender'))) {
  console.warn('  [prerender] aviso: no se pudo borrar .prerender/ (está en .gitignore).');
}

console.log(`  [prerender] index.html ahora: ${kb(readFileSync(HTML).length)} KB`);
