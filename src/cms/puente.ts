import type { Documento } from './definicion';
import { normalizarDocumento } from './ContenidoContext';
import { scrollToElement } from '../lib/smoothScroll';

/**
 * Puente entre el sitio y el panel de administración.
 *
 * El panel abre el sitio real dentro de un iframe (con ?oc-editor=1) y los dos
 * hablan por postMessage, siempre en el mismo origen. Este módulo se descarga
 * SOLO en ese caso: un visitante normal nunca lo recibe.
 *
 * Del panel llegan:   documento (borrador que hay que pintar), modo (activar o
 *                     no la edición en vivo), seleccionar, navegar, recargar.
 * Al panel se envían: listo, clic (la persona pulsó un elemento editable), ruta
 *                     (el sitio cambió de página).
 *
 * En modo edición, los elementos con data-oc se resaltan y su clic se
 * intercepta antes de que llegue a React, para que un botón se seleccione en
 * vez de ejecutarse.
 */

interface Api {
  setDoc: (d: Documento) => void;
  setModoEdicion: (activo: boolean) => void;
}

declare global {
  interface Window {
    __ocNavegar?: (ruta: string) => void;
    __ocAlNavegar?: (ruta: string) => void;
  }
}

const ESTILOS_EDITOR = `
html.oc-editando [data-oc] { cursor: pointer !important; outline: 1px dashed rgba(253,162,17,.55) !important; outline-offset: 3px; }
html.oc-editando [data-oc]:hover { outline: 2px solid #fda211 !important; }
html.oc-editando [data-oc].oc-sel, html.oc-editando [data-oc].oc-sel:hover { outline: 2px solid #fda211 !important; box-shadow: 0 0 0 5px rgba(253,162,17,.28) !important; }
html.oc-editando .oc-ai-ring { animation: none; }
`;

export function conectar(api: Api): () => void {
  const origen = window.location.origin;
  const enviar = (m: Record<string, unknown>) => window.parent.postMessage({ oc: true, ...m }, origen);

  let modo = false;
  let claveSeleccionada: string | null = null;
  let seleccionado: Element | null = null;

  const estilo = document.createElement('style');
  estilo.id = 'oc-editor-css';
  estilo.textContent = ESTILOS_EDITOR;
  document.head.appendChild(estilo);

  function pintarSeleccion(desplazar: boolean) {
    seleccionado?.classList.remove('oc-sel');
    seleccionado = null;
    if (!claveSeleccionada) return;
    const el = document.querySelector(`[data-oc="${CSS_escape(claveSeleccionada)}"]`);
    if (!el) return;
    el.classList.add('oc-sel');
    seleccionado = el;
    if (desplazar) scrollToElement(el as HTMLElement);
  }

  const alMensaje = (e: MessageEvent) => {
    if (e.origin !== origen || !e.data || e.data.oc !== true) return;
    const m = e.data as { tipo: string; documento?: unknown; activo?: boolean; clave?: string | null; desplazar?: boolean; ruta?: string };
    switch (m.tipo) {
      case 'documento':
        api.setDoc(normalizarDocumento(m.documento));
        // React puede reescribir className al repintar y llevarse la marca.
        requestAnimationFrame(() => pintarSeleccion(false));
        break;
      case 'modo':
        modo = !!m.activo;
        api.setModoEdicion(modo);
        document.documentElement.classList.toggle('oc-editando', modo);
        if (!modo) { claveSeleccionada = null; pintarSeleccion(false); }
        break;
      case 'seleccionar':
        claveSeleccionada = m.clave ?? null;
        pintarSeleccion(m.desplazar !== false);
        break;
      case 'navegar':
        if (m.ruta) window.__ocNavegar?.(m.ruta);
        break;
      case 'recargar':
        window.location.reload();
        break;
    }
  };

  const alClic = (e: MouseEvent) => {
    if (!modo) return;
    const objetivo = e.target as Element | null;
    const el = objetivo?.closest?.('[data-oc]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    claveSeleccionada = el.getAttribute('data-oc');
    pintarSeleccion(false);
    enviar({ tipo: 'clic', clave: claveSeleccionada });
  };

  const alTecla = (e: KeyboardEvent) => {
    if (!modo || e.key !== 'Escape') return;
    claveSeleccionada = null;
    pintarSeleccion(false);
    enviar({ tipo: 'clic', clave: null });
  };

  window.addEventListener('message', alMensaje);
  document.addEventListener('click', alClic, true);
  document.addEventListener('keydown', alTecla);
  window.__ocAlNavegar = (ruta) => enviar({ tipo: 'ruta', ruta });

  enviar({ tipo: 'listo', ruta: window.location.pathname });

  return () => {
    window.removeEventListener('message', alMensaje);
    document.removeEventListener('click', alClic, true);
    document.removeEventListener('keydown', alTecla);
    estilo.remove();
    delete window.__ocAlNavegar;
  };
}

function CSS_escape(v: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(v) : v.replace(/["\\]/g, '\\$&');
}
