import type { CSSProperties } from 'react';
import type { EstiloElemento } from './definicion';

/**
 * Aplica el estilo propio que la persona eligió para un elemento en el panel.
 *
 * Los controles del panel son acotados a propósito —pasos de tamaño, pesos con
 * nombre, paleta de la marca— y aquí se traducen a lo que entiende Tailwind:
 *
 *  - El tamaño NO se escribe como píxeles en línea. Eso rompería el diseño
 *    responsivo, porque cada título tiene un tamaño distinto por ancho de
 *    pantalla (text-4xl md:text-5xl lg:text-7xl). En su lugar, cada clase de
 *    tamaño se desplaza N pasos en la escala de Tailwind, prefijo por prefijo:
 *    +1 convierte «text-4xl md:text-5xl» en «text-5xl md:text-6xl». El diseño
 *    sigue respondiendo al ancho igual que antes.
 *  - Peso, tipografía y cursiva sustituyen la clase equivalente.
 *  - Color, fondo, alineación y espacio van en línea: son valores puntuales.
 *
 * Todas las clases que esto puede producir están en la lista blanca de
 * index.css (@source inline), porque Tailwind solo compila las que ve escritas.
 */

const ESCALA = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
  'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];

const RE_TAMANO = /^((?:sm|md|lg|xl|2xl):)?(text-(?:xs|sm|base|lg|xl|[2-9]xl))$/;
const RE_PESO = /^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;
const RE_FUENTE = /^font-(?:outfit|sarabun)$/;
const RE_CURSIVA = /^(?:italic|not-italic)$/;

const ESPACIO: Record<string, string | undefined> = { menos: '0.35em', mas: '1.75em', normal: undefined };

export function aplicarEstilo(
  className: string,
  estilo: EstiloElemento | undefined,
  styleBase?: CSSProperties,
): { className: string; style: CSSProperties | undefined } {
  if (!estilo || Object.keys(estilo).length === 0) return { className, style: styleBase };

  let tokens = className.split(/\s+/).filter(Boolean);

  if (estilo.tamano) {
    const paso = Math.max(-2, Math.min(2, Math.round(estilo.tamano)));
    tokens = tokens.map((t) => {
      const m = RE_TAMANO.exec(t);
      if (!m) return t;
      const i = ESCALA.indexOf(m[2]);
      if (i === -1) return t;
      const j = Math.max(0, Math.min(ESCALA.length - 1, i + paso));
      return (m[1] ?? '') + ESCALA[j];
    });
  }

  if (estilo.peso) {
    tokens = tokens.filter((t) => !RE_PESO.test(t));
    tokens.push(`font-${estilo.peso}`);
  }

  if (estilo.fuente) {
    tokens = tokens.filter((t) => !RE_FUENTE.test(t));
    tokens.push(`font-${estilo.fuente}`);
  }

  if (estilo.cursiva !== undefined) {
    tokens = tokens.filter((t) => !RE_CURSIVA.test(t));
    tokens.push(estilo.cursiva ? 'italic' : 'not-italic');
  }

  const style: CSSProperties = { ...(styleBase ?? {}) };
  if (estilo.color) style.color = estilo.color;
  if (estilo.fondo) style.backgroundColor = estilo.fondo;
  if (estilo.alineacion) style.textAlign = estilo.alineacion;
  if (estilo.espacio && ESPACIO[estilo.espacio]) style.marginBottom = ESPACIO[estilo.espacio];

  return { className: tokens.join(' '), style: Object.keys(style).length ? style : styleBase };
}

/** Un estilo «vacío» (todo en automático) no merece guardarse. */
export function estiloVacio(e: EstiloElemento | undefined): boolean {
  if (!e) return true;
  return Object.values(e).every((v) => v === undefined || v === null || v === '' || v === 0 || v === 'normal');
}
