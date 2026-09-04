/**
 * Mini-lenguaje para describir el contenido editable del sitio.
 *
 * Un solo árbol (ver definicion.ts) produce tres cosas que de otro modo habría
 * que mantener a mano y por separado, y que se desincronizarían tarde o
 * temprano:
 *
 *   1. Los valores por defecto: el contenido con el que se compila el sitio y
 *      al que se vuelve con «Restablecer».
 *   2. El esquema que el panel usa para pintar formularios: etiqueta, tipo de
 *      campo y texto de ayuda de cada cosa, en lenguaje de persona.
 *   3. Los tipos de TypeScript del contenido, inferidos del árbol, para que un
 *      componente no pueda leer un campo que no existe.
 *
 * Al usuario del panel nunca se le enseña nada de esto: solo ve etiquetas.
 */

export type TipoCampo =
  | 'texto'       // una línea
  | 'textoLargo'  // varias líneas, sin formato
  | 'html'        // texto con formato limitado (negrita, cursiva, listas, enlaces)
  | 'imagen'      // { src, alt }
  | 'archivo'     // { src, nombre } — PDF, vídeo
  | 'boton'       // { texto, url, nuevaPestana }
  | 'enlace'      // { url, nuevaPestana }
  | 'booleano'
  | 'color'
  | 'opcion'      // una de varias, con etiquetas
  | 'orden'       // lista ordenable de claves fijas
  | 'oculto';     // valor interno que el panel no muestra (ids, slugs)

export interface Opcion { valor: string; etiqueta: string }

export interface CampoDef<T> {
  readonly _t: 'campo';
  tipo: TipoCampo;
  etiqueta: string;
  ayuda?: string;
  valor: T;
  /** Para tipo 'opcion' y 'orden'. */
  opciones?: Opcion[];
  /** Longitud máxima orientativa para texto y textoLargo. */
  max?: number;
  /** Proporción sugerida al recortar imágenes, p. ej. 16/9. */
  proporcion?: number;
}

export interface GrupoDef<C extends Record<string, Def>> {
  readonly _t: 'grupo';
  etiqueta: string;
  ayuda?: string;
  campos: C;
}

export interface ListaDef<C extends Record<string, Def>> {
  readonly _t: 'lista';
  etiqueta: string;
  ayuda?: string;
  plantilla: C;
  valor: Valores<GrupoDef<C>>[];
  /** ¿Puede el usuario añadir y quitar elementos? Si no, solo edita los que hay. */
  agregar: boolean;
  max?: number;
  /** Cómo se llama un elemento en singular («Vertical», «Valor»). */
  nombreItem: string;
  /** Qué campo del elemento usar como título en la lista del panel. */
  campoTitulo: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Def = CampoDef<any> | GrupoDef<any> | ListaDef<any>;

export type Valores<D> =
  D extends CampoDef<infer T> ? T :
  D extends ListaDef<infer C> ? Valores<GrupoDef<C>>[] :
  D extends GrupoDef<infer C> ? { [K in keyof C]: Valores<C[K]> } :
  never;

export interface Imagen { src: string; alt: string }
export interface Archivo { src: string; nombre: string }
export interface Boton { texto: string; url: string; nuevaPestana: boolean }
export interface Enlace { url: string; nuevaPestana: boolean }

// ------------------------------------------------------------------ constructores

function campo<T>(tipo: TipoCampo, etiqueta: string, valor: T, extra: Partial<CampoDef<T>> = {}): CampoDef<T> {
  return { _t: 'campo', tipo, etiqueta, valor, ...extra };
}

export const texto = (etiqueta: string, valor: string, ayuda?: string, max?: number) =>
  campo<string>('texto', etiqueta, valor, { ayuda, max });

export const textoLargo = (etiqueta: string, valor: string, ayuda?: string, max?: number) =>
  campo<string>('textoLargo', etiqueta, valor, { ayuda, max });

export const html = (etiqueta: string, valor: string, ayuda?: string) =>
  campo<string>('html', etiqueta, valor, { ayuda });

export const imagen = (etiqueta: string, valor: Imagen, ayuda?: string, proporcion?: number) =>
  campo<Imagen>('imagen', etiqueta, valor, { ayuda, proporcion });

export const archivo = (etiqueta: string, valor: Archivo, ayuda?: string) =>
  campo<Archivo>('archivo', etiqueta, valor, { ayuda });

export const boton = (etiqueta: string, valor: Boton, ayuda?: string) =>
  campo<Boton>('boton', etiqueta, valor, { ayuda });

export const enlace = (etiqueta: string, valor: Enlace, ayuda?: string) =>
  campo<Enlace>('enlace', etiqueta, valor, { ayuda });

export const booleano = (etiqueta: string, valor: boolean, ayuda?: string) =>
  campo<boolean>('booleano', etiqueta, valor, { ayuda });

export const color = (etiqueta: string, valor: string, ayuda?: string) =>
  campo<string>('color', etiqueta, valor, { ayuda });

export const opcion = (etiqueta: string, valor: string, opciones: Opcion[], ayuda?: string) =>
  campo<string>('opcion', etiqueta, valor, { opciones, ayuda });

export const orden = (etiqueta: string, valor: string[], opciones: Opcion[], ayuda?: string) =>
  campo<string[]>('orden', etiqueta, valor, { opciones, ayuda });

export const oculto = (valor: string) => campo<string>('oculto', '', valor);

export const grupo = <C extends Record<string, Def>>(etiqueta: string, campos: C, ayuda?: string): GrupoDef<C> =>
  ({ _t: 'grupo', etiqueta, campos, ayuda });

export const lista = <C extends Record<string, Def>>(
  etiqueta: string,
  plantilla: C,
  valor: Valores<GrupoDef<C>>[],
  opts: { agregar?: boolean; max?: number; nombreItem?: string; campoTitulo?: string; ayuda?: string } = {},
): ListaDef<C> => ({
  _t: 'lista',
  etiqueta,
  plantilla,
  valor,
  agregar: opts.agregar ?? true,
  max: opts.max,
  nombreItem: opts.nombreItem ?? 'Elemento',
  campoTitulo: opts.campoTitulo ?? Object.keys(plantilla)[0],
  ayuda: opts.ayuda,
});

// --------------------------------------------------------------------- utilidades

/** Valores por defecto de cualquier nodo del árbol. */
export function valoresPorDefecto<D extends Def>(def: D): Valores<D> {
  if (def._t === 'campo') return clonar(def.valor) as Valores<D>;
  if (def._t === 'lista') return clonar(def.valor) as Valores<D>;
  const out: Record<string, unknown> = {};
  for (const [k, sub] of Object.entries(def.campos as Record<string, Def>)) {
    out[k] = valoresPorDefecto(sub);
  }
  return out as Valores<D>;
}

/** Valores por defecto de UN elemento nuevo de una lista (a partir de su plantilla). */
export function itemPorDefecto<C extends Record<string, Def>>(def: ListaDef<C>): Valores<GrupoDef<C>> {
  return valoresPorDefecto(grupo('', def.plantilla));
}

/**
 * Fusiona lo guardado con los valores por defecto siguiendo el árbol.
 *
 * Protege al sitio de dos situaciones reales: que el código añada un campo
 * nuevo que el JSON guardado aún no tiene (se usa el valor por defecto), y que
 * el JSON traiga algo con un tipo inesperado (se descarta y se usa el defecto).
 * Las listas se toman tal cual del guardado —la persona pudo añadir o quitar
 * elementos— pero cada elemento se fusiona a su vez con la plantilla.
 */
export function fusionar<D extends Def>(def: D, guardado: unknown): Valores<D> {
  if (def._t === 'campo') {
    return (compatible(def, guardado) ? clonar(guardado) : clonar(def.valor)) as Valores<D>;
  }
  if (def._t === 'lista') {
    if (!Array.isArray(guardado)) return clonar(def.valor) as Valores<D>;
    const plantilla = grupo('', def.plantilla);
    return guardado.map((item) => fusionar(plantilla, item)) as Valores<D>;
  }
  const fuente = (guardado && typeof guardado === 'object' ? guardado : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, sub] of Object.entries(def.campos as Record<string, Def>)) {
    out[k] = fusionar(sub, fuente[k]);
  }
  return out as Valores<D>;
}

function compatible(def: CampoDef<unknown>, v: unknown): boolean {
  if (v === undefined || v === null) return false;
  switch (def.tipo) {
    case 'texto': case 'textoLargo': case 'html': case 'color': case 'oculto':
      return typeof v === 'string';
    case 'opcion':
      return typeof v === 'string' && (!def.opciones || def.opciones.some((o) => o.valor === v));
    case 'booleano':
      return typeof v === 'boolean';
    case 'orden':
      return Array.isArray(v) && v.every((x) => typeof x === 'string');
    case 'imagen':
      return typeof v === 'object' && typeof (v as Imagen).src === 'string';
    case 'archivo':
      return typeof v === 'object' && typeof (v as Archivo).src === 'string';
    case 'boton':
      return typeof v === 'object' && typeof (v as Boton).texto === 'string' && typeof (v as Boton).url === 'string';
    case 'enlace':
      return typeof v === 'object' && typeof (v as Enlace).url === 'string';
  }
}

/** Busca la definición de un nodo por su ruta con puntos («paginas.inicio.hero.titulo»). */
export function definicionEn(raiz: Def, ruta: string): Def | null {
  let actual: Def = raiz;
  for (const parte of ruta.split('.').filter(Boolean)) {
    if (actual._t === 'grupo') {
      const sig = (actual.campos as Record<string, Def>)[parte];
      if (!sig) return null;
      actual = sig;
    } else if (actual._t === 'lista') {
      // Un índice numérico entra en el elemento; la plantilla describe cualquiera.
      if (!/^\d+$/.test(parte)) return null;
      actual = grupo(actual.nombreItem, actual.plantilla);
    } else {
      return null;
    }
  }
  return actual;
}

/** Etiquetas legibles de cada tramo de la ruta, para migas y títulos del panel. */
export function migas(raiz: Def, ruta: string): string[] {
  const out: string[] = [];
  let actual: Def = raiz;
  for (const parte of ruta.split('.').filter(Boolean)) {
    if (actual._t === 'grupo') {
      const sig = (actual.campos as Record<string, Def>)[parte];
      if (!sig) break;
      actual = sig;
      out.push(actual.etiqueta);
    } else if (actual._t === 'lista') {
      out.push(`${actual.nombreItem} ${Number(parte) + 1}`);
      actual = grupo(actual.nombreItem, actual.plantilla);
    } else {
      break;
    }
  }
  return out;
}

export function clonar<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
}
