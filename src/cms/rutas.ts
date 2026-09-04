/**
 * Lectura y escritura por ruta con puntos («paginas.inicio.hero.titulo»,
 * «paginas.servicios.items.2.beneficios.0.texto»). Los tramos numéricos
 * indexan listas.
 *
 * `establecer` no muta: devuelve una copia con el cambio, copiando solo el
 * camino tocado. Así React detecta el cambio y el historial de deshacer puede
 * guardar los estados anteriores sin clonar documentos enteros.
 */

export function obtener(objeto: unknown, ruta: string): unknown {
  let actual: unknown = objeto;
  for (const parte of ruta.split('.')) {
    if (parte === '') continue;
    if (actual === null || typeof actual !== 'object') return undefined;
    actual = (actual as Record<string, unknown>)[parte];
  }
  return actual;
}

export function establecer<T>(objeto: T, ruta: string, valor: unknown): T {
  const partes = ruta.split('.').filter((p) => p !== '');
  if (partes.length === 0) return valor as T;
  return asignar(objeto, partes, valor) as T;
}

function asignar(nodo: unknown, partes: string[], valor: unknown): unknown {
  const [cabeza, ...resto] = partes;
  const esIndice = /^\d+$/.test(cabeza);

  if (resto.length === 0) {
    if (Array.isArray(nodo)) {
      const copia = nodo.slice();
      copia[Number(cabeza)] = valor;
      return copia;
    }
    return { ...(nodo as Record<string, unknown>), [cabeza]: valor };
  }

  const hijoActual = nodo && typeof nodo === 'object' ? (nodo as Record<string, unknown>)[cabeza] : undefined;
  const hijoNuevo = asignar(hijoActual ?? (/^\d+$/.test(resto[0]) ? [] : {}), resto, valor);

  if (Array.isArray(nodo)) {
    const copia = nodo.slice();
    copia[Number(cabeza)] = hijoNuevo;
    return copia;
  }
  if (esIndice && nodo === undefined) {
    const arr: unknown[] = [];
    arr[Number(cabeza)] = hijoNuevo;
    return arr;
  }
  return { ...(nodo as Record<string, unknown>), [cabeza]: hijoNuevo };
}

/** Ruta del padre («a.b.c» → «a.b») y última clave. */
export function dividirRuta(ruta: string): { padre: string; clave: string } {
  const i = ruta.lastIndexOf('.');
  return i === -1 ? { padre: '', clave: ruta } : { padre: ruta.slice(0, i), clave: ruta.slice(i + 1) };
}

/** Une tramos ignorando vacíos: unir('a', '', 'b') → 'a.b'. */
export function unir(...tramos: (string | number)[]): string {
  return tramos.map(String).filter((t) => t !== '').join('.');
}
