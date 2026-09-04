import React, { createContext, useContext, useReducer, type Dispatch } from 'react';
import { DOCUMENTO_BASE, type Documento, type EstiloElemento } from '../cms/definicion';
import { establecer, obtener } from '../cms/rutas';
import { estiloVacio } from '../cms/estilos';
import { normalizarDocumento } from '../cms/ContenidoContext';

/**
 * Estado del panel: el borrador que se edita, su historial para deshacer, y
 * lo que hace falta para sincronizar con el sitio en el iframe.
 *
 * Cada cambio produce un documento nuevo (las funciones de rutas.ts copian
 * solo el camino tocado), así que guardar el historial es guardar referencias.
 * Al teclear, los cambios seguidos sobre el mismo campo se funden en un único
 * paso de deshacer: Ctrl+Z vuelve a la frase anterior, no letra a letra.
 */

export type EstadoGuardado = 'inactivo' | 'pendiente' | 'guardando' | 'guardado' | 'error';

export interface Estado {
  doc: Documento;
  pasado: Documento[];
  futuro: Documento[];
  ultimoCambio: { ruta: string; en: number } | null;

  cargado: boolean;
  guardado: EstadoGuardado;
  guardadoEn: string | null;
  publicadoEn: string | null;
  hayCambiosSinPublicar: boolean;

  seleccion: string | null;
  ruta: string;
  modoEdicion: boolean;
  dispositivo: 'escritorio' | 'movil';
}

export type Accion =
  | { tipo: 'cargar'; doc: unknown; publicadoEn: string | null; guardadoEn: string | null; hayBorrador: boolean }
  | { tipo: 'cambiar'; ruta: string; valor: unknown }
  | { tipo: 'cambiarEstilo'; clave: string; estilo: EstiloElemento | undefined }
  | { tipo: 'reemplazarDoc'; doc: unknown; motivo?: 'restaurar' | 'descartar' | 'importar' }
  | { tipo: 'deshacer' }
  | { tipo: 'rehacer' }
  | { tipo: 'guardado'; estado: EstadoGuardado; en?: string }
  | { tipo: 'publicado'; en: string }
  | { tipo: 'seleccionar'; clave: string | null }
  | { tipo: 'ruta'; ruta: string }
  | { tipo: 'modoEdicion'; activo: boolean }
  | { tipo: 'dispositivo'; dispositivo: 'escritorio' | 'movil' };

const LIMITE_HISTORIAL = 120;
const VENTANA_FUSION_MS = 900;

export const estadoInicial: Estado = {
  doc: DOCUMENTO_BASE,
  pasado: [],
  futuro: [],
  ultimoCambio: null,
  cargado: false,
  guardado: 'inactivo',
  guardadoEn: null,
  publicadoEn: null,
  hayCambiosSinPublicar: false,
  seleccion: null,
  ruta: '/',
  modoEdicion: true,
  dispositivo: 'escritorio',
};

function conCambio(estado: Estado, docNuevo: Documento, ruta: string): Estado {
  const ahora = Date.now();
  const fundir = estado.ultimoCambio
    && estado.ultimoCambio.ruta === ruta
    && ahora - estado.ultimoCambio.en < VENTANA_FUSION_MS;
  const pasado = fundir ? estado.pasado : [...estado.pasado, estado.doc].slice(-LIMITE_HISTORIAL);
  return {
    ...estado,
    doc: docNuevo,
    pasado,
    futuro: [],
    ultimoCambio: { ruta, en: ahora },
    guardado: 'pendiente',
    hayCambiosSinPublicar: true,
  };
}

export function reductor(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case 'cargar':
      return {
        ...estado,
        doc: accion.doc ? normalizarDocumento(accion.doc) : DOCUMENTO_BASE,
        pasado: [],
        futuro: [],
        ultimoCambio: null,
        cargado: true,
        guardado: 'inactivo',
        guardadoEn: accion.guardadoEn,
        publicadoEn: accion.publicadoEn,
        hayCambiosSinPublicar: accion.hayBorrador,
      };

    case 'cambiar': {
      if (obtener(estado.doc.datos, accion.ruta) === accion.valor) return estado;
      const datos = establecer(estado.doc.datos, accion.ruta, accion.valor);
      return conCambio(estado, { ...estado.doc, datos }, accion.ruta);
    }

    case 'cambiarEstilo': {
      const estilos = { ...estado.doc.estilos };
      if (!accion.estilo || estiloVacio(accion.estilo)) delete estilos[accion.clave];
      else estilos[accion.clave] = accion.estilo;
      return conCambio(estado, { ...estado.doc, estilos }, `estilo:${accion.clave}`);
    }

    case 'reemplazarDoc': {
      const doc = normalizarDocumento(accion.doc);
      return {
        ...estado,
        doc,
        pasado: [...estado.pasado, estado.doc].slice(-LIMITE_HISTORIAL),
        futuro: [],
        ultimoCambio: null,
        guardado: accion.motivo === 'descartar' ? 'inactivo' : 'pendiente',
        hayCambiosSinPublicar: accion.motivo !== 'descartar',
      };
    }

    case 'deshacer': {
      if (estado.pasado.length === 0) return estado;
      const anterior = estado.pasado[estado.pasado.length - 1];
      return {
        ...estado,
        doc: anterior,
        pasado: estado.pasado.slice(0, -1),
        futuro: [estado.doc, ...estado.futuro],
        ultimoCambio: null,
        guardado: 'pendiente',
        hayCambiosSinPublicar: true,
      };
    }

    case 'rehacer': {
      if (estado.futuro.length === 0) return estado;
      const [siguiente, ...resto] = estado.futuro;
      return {
        ...estado,
        doc: siguiente,
        pasado: [...estado.pasado, estado.doc],
        futuro: resto,
        ultimoCambio: null,
        guardado: 'pendiente',
        hayCambiosSinPublicar: true,
      };
    }

    case 'guardado':
      return { ...estado, guardado: accion.estado, guardadoEn: accion.en ?? estado.guardadoEn };

    case 'publicado':
      return { ...estado, publicadoEn: accion.en, hayCambiosSinPublicar: false, guardado: 'inactivo' };

    case 'seleccionar':
      return estado.seleccion === accion.clave ? estado : { ...estado, seleccion: accion.clave };

    case 'ruta':
      return estado.ruta === accion.ruta ? estado : { ...estado, ruta: accion.ruta, seleccion: null };

    case 'modoEdicion':
      return { ...estado, modoEdicion: accion.activo, seleccion: accion.activo ? estado.seleccion : null };

    case 'dispositivo':
      return { ...estado, dispositivo: accion.dispositivo };
  }
}

// ------------------------------------------------------------------- contexto

const CtxEstado = createContext<Estado>(estadoInicial);
const CtxDespachar = createContext<Dispatch<Accion>>(() => {});

export const ProveedorEstado: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estado, despachar] = useReducer(reductor, estadoInicial);
  return (
    <CtxEstado.Provider value={estado}>
      <CtxDespachar.Provider value={despachar}>{children}</CtxDespachar.Provider>
    </CtxEstado.Provider>
  );
};

export function useEstado(): Estado {
  return useContext(CtxEstado);
}

export function useDespachar(): Dispatch<Accion> {
  return useContext(CtxDespachar);
}

/** Valor actual de una ruta del contenido. */
export function useValor<T = unknown>(ruta: string): T {
  const { doc } = useEstado();
  return obtener(doc.datos, ruta) as T;
}
