import React from 'react';
import {
  LayoutDashboard, MousePointerClick, Images, Inbox, History as IconoHistorial,
  Settings, PanelLeftClose, PanelLeftOpen, ChevronDown, X,
} from 'lucide-react';
import { PAGINAS, type Entrada } from './navegacion';

/**
 * Barra lateral con los módulos del panel.
 *
 * Tres formas según el ancho:
 *
 *   Escritorio abierta   rail de 15rem con los nombres.
 *   Escritorio plegada   rail de 4rem solo con iconos; el nombre aparece en un
 *                        globo al pasar el ratón, para no perder orientación.
 *   Móvil                cajón que entra desde la izquierda sobre el contenido,
 *                        con fondo oscurecido; se cierra al elegir algo.
 *
 * «Contenido» es el único módulo que se despliega: dentro están las páginas del
 * sitio y sus secciones. Se abre solo cuando ese módulo está activo, para que
 * la lista larga no compita con el resto cuando no toca.
 */

export type Modulo = 'inicio' | 'contenido' | 'medios' | 'mensajes' | 'historial' | 'ajustes';

const MODULOS: { id: Modulo; etiqueta: string; Icono: React.ElementType }[] = [
  { id: 'inicio', etiqueta: 'Inicio', Icono: LayoutDashboard },
  { id: 'contenido', etiqueta: 'Contenido', Icono: MousePointerClick },
  { id: 'medios', etiqueta: 'Fotos y archivos', Icono: Images },
  { id: 'mensajes', etiqueta: 'Mensajes', Icono: Inbox },
  { id: 'historial', etiqueta: 'Historial', Icono: IconoHistorial },
  { id: 'ajustes', etiqueta: 'Ajustes', Icono: Settings },
];

interface Props {
  modulo: Modulo;
  onModulo: (m: Modulo) => void;
  entrada: Entrada;
  onEntrada: (e: Entrada) => void;
  plegada: boolean;
  onPlegar: (v: boolean) => void;
  /** En móvil la barra es un cajón: este es su estado de apertura. */
  cajonAbierto: boolean;
  onCerrarCajon: () => void;
  sinLeer: number;
}

export const BarraLateral: React.FC<Props> = ({
  modulo, onModulo, entrada, onEntrada, plegada, onPlegar, cajonAbierto, onCerrarCajon, sinLeer,
}) => {
  const contenidoAbierto = modulo === 'contenido' && !plegada;

  const elegirModulo = (m: Modulo) => {
    // Pulsar «Contenido» con la barra plegada la abre: si no, no habría forma
    // de llegar a las páginas.
    if (m === 'contenido' && plegada) onPlegar(false);
    onModulo(m);
    onCerrarCajon();
  };

  const cuerpo = (
    <>
      <nav className="oc-scroll flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {MODULOS.map(({ id, etiqueta, Icono }) => {
          const activo = modulo === id;
          return (
            <div key={id}>
              <button
                onClick={() => elegirModulo(id)}
                aria-current={activo ? 'page' : undefined}
                className={`oc-item relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-bold transition-colors ${
                  activo ? 'bg-marca/15 text-negro' : 'text-gris-oscuro hover:bg-black/[0.05]'
                }`}
              >
                <span className="relative flex shrink-0 items-center">
                  <Icono size={18} className={activo ? 'text-marca-oscuro' : 'text-neutral-500'} />
                  {id === 'mensajes' && sinLeer > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-marca px-1 text-[10px] font-black text-negro">
                      {sinLeer > 9 ? '9+' : sinLeer}
                    </span>
                  )}
                </span>
                <span className="oc-etiqueta-lateral flex-1">{etiqueta}</span>
                {id === 'contenido' && !plegada && (
                  <ChevronDown size={14} className={`shrink-0 text-neutral-400 transition-transform ${contenidoAbierto ? '' : '-rotate-90'}`} />
                )}
                <span className="oc-globo" aria-hidden="true">{etiqueta}</span>
              </button>

              {/* Páginas del sitio, dentro de «Contenido» */}
              {id === 'contenido' && contenidoAbierto && (
                <div className="mb-1 mt-0.5 border-l border-black/10 pl-2 ml-5">
                  {PAGINAS.map((p) => (
                    <div key={p.id} className="mb-2">
                      <p className="px-2 pb-0.5 pt-1 text-[10.5px] font-black uppercase tracking-wider text-neutral-400">{p.etiqueta}</p>
                      {p.entradas.map((e) => (
                        <button
                          key={e.ruta}
                          onClick={() => { onEntrada(e); onCerrarCajon(); }}
                          className={`block w-full truncate rounded-lg px-2 py-1.5 text-left text-[12.5px] font-semibold transition-colors ${
                            entrada.ruta === e.ruta ? 'bg-marca/20 text-negro' : 'text-gris-oscuro/85 hover:bg-black/[0.04]'
                          }`}
                        >
                          {e.etiqueta}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Plegar: solo tiene sentido en escritorio, donde la barra ocupa sitio */}
      <button
        onClick={() => onPlegar(!plegada)}
        title={plegada ? 'Ampliar el menú' : 'Reducir el menú'}
        className="oc-item relative hidden items-center gap-3 border-t border-black/8 px-4 py-3 text-[12.5px] font-bold text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-negro lg:flex"
      >
        {plegada ? <PanelLeftOpen size={17} className="shrink-0" /> : <PanelLeftClose size={17} className="shrink-0" />}
        <span className="oc-etiqueta-lateral">Reducir menú</span>
        <span className="oc-globo" aria-hidden="true">Ampliar el menú</span>
      </button>
    </>
  );

  return (
    <>
      {/* Escritorio */}
      <aside
        data-plegada={plegada}
        className={`oc-lateral hidden shrink-0 flex-col border-r border-black/8 bg-white lg:flex ${plegada ? 'w-16' : 'w-60'}`}
      >
        {cuerpo}
      </aside>

      {/* Móvil: cajón */}
      {cajonAbierto && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCerrarCajon} />
          <aside
            data-plegada="false"
            className="oc-aparece absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
              <img src="/logo_negro.svg" alt="Offcourt" className="h-6 w-auto" />
              <button onClick={onCerrarCajon} aria-label="Cerrar menú" className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 hover:text-negro">
                <X size={18} />
              </button>
            </div>
            {cuerpo}
          </aside>
        </div>
      )}
    </>
  );
};
