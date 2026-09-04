import React, { createContext, useContext, useEffect, useState } from 'react';
import { definicion, DOCUMENTO_BASE, type Contenido, type Documento } from './definicion';
import { fusionar } from './dsl';

/**
 * Pone el contenido publicado a disposición de todos los componentes.
 *
 * De dónde sale el contenido, por orden:
 *
 *  1. Del propio HTML. index.php inyecta el JSON publicado en un
 *     <script id="oc-contenido"> al servir la página, así que está disponible
 *     antes de que arranque React y no hay petición extra ni parpadeo.
 *  2. Si no existe ese script (servidor de desarrollo, o el CMS aún no se ha
 *     usado), se usan los valores por defecto compilados en definicion.ts.
 *
 * En cualquiera de los dos casos lo guardado se fusiona con la definición: un
 * campo nuevo que aún no está en el JSON toma su valor por defecto y el sitio
 * nunca se queda con un hueco.
 *
 * Cuando la página corre dentro del panel de administración (en un iframe con
 * ?oc-editor=1), el puente sustituye el documento en caliente con el borrador
 * y activa el modo de edición. Ese código solo se descarga en ese caso.
 */

interface Ctx {
  doc: Documento;
  modoEdicion: boolean;
}

const Contexto = createContext<Ctx>({ doc: DOCUMENTO_BASE, modoEdicion: false });

export function leerDocumentoInicial(): Documento {
  if (typeof document === 'undefined') return DOCUMENTO_BASE;
  const nodo = document.getElementById('oc-contenido');
  if (!nodo?.textContent) return DOCUMENTO_BASE;
  try {
    return normalizarDocumento(JSON.parse(nodo.textContent));
  } catch {
    return DOCUMENTO_BASE;
  }
}

/** Fusiona cualquier cosa que venga del servidor con la definición actual. */
export function normalizarDocumento(bruto: unknown): Documento {
  const obj = (bruto && typeof bruto === 'object' ? bruto : {}) as Partial<Documento>;
  const datos = fusionar(definicion, obj.datos) as Contenido;
  const estilos = obj.estilos && typeof obj.estilos === 'object' ? obj.estilos : {};
  return { version: 1, datos, estilos };
}

export function esModoEditor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.parent !== window && new URLSearchParams(window.location.search).has('oc-editor');
  } catch {
    return false;
  }
}

export const ContenidoProvider: React.FC<{ inicial: Documento; children: React.ReactNode }> = ({ inicial, children }) => {
  const [doc, setDoc] = useState<Documento>(inicial);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Colores y tipografías elegidos en el panel: se aplican como variables CSS
  // sobre <html>, que es donde las lee Tailwind. index.php ya las escribe en
  // el HTML servido; repetirlo aquí cubre el desarrollo y la edición en vivo.
  useEffect(() => { aplicarTema(doc.datos.global.tema); }, [doc.datos.global.tema]);

  useEffect(() => {
    if (!esModoEditor()) return;
    let desconectar: (() => void) | undefined;
    import('./puente').then((m) => { desconectar = m.conectar({ setDoc, setModoEdicion }); });
    return () => desconectar?.();
  }, []);

  return <Contexto.Provider value={{ doc, modoEdicion }}>{children}</Contexto.Provider>;
};

export function useDocumento(): Ctx {
  return useContext(Contexto);
}

export function useContenido(): Contenido {
  return useContext(Contexto).doc.datos;
}

// ------------------------------------------------------------------------ tema

const FUENTES: Record<string, string> = {
  outfit: "'Outfit', sans-serif",
  sarabun: "'Sarabun', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  arial: 'Arial, Helvetica, sans-serif',
};

export function variablesTema(tema: Contenido['global']['tema']): Record<string, string> {
  return {
    '--color-marca': tema.naranja,
    '--color-marca-oscuro': tema.naranjaOscuro,
    '--color-negro': tema.negro,
    '--color-gris-oscuro': tema.grisOscuro,
    '--color-gris-claro': tema.grisClaro,
    '--fuente-titulos': FUENTES[tema.fuenteTitulos] ?? FUENTES.outfit,
    '--fuente-texto': FUENTES[tema.fuenteTexto] ?? FUENTES.sarabun,
  };
}

function aplicarTema(tema: Contenido['global']['tema']) {
  if (typeof document === 'undefined') return;
  const raiz = document.documentElement;
  for (const [k, v] of Object.entries(variablesTema(tema))) raiz.style.setProperty(k, v);
}
