import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

/** Piezas de interfaz que se repiten por todo el panel. */

export const Boton: React.FC<{
  onClick?: () => void;
  submit?: boolean;
  tipo?: 'principal' | 'normal' | 'suave' | 'peligro';
  tamano?: 'sm' | 'md';
  disabled?: boolean;
  cargando?: boolean;
  title?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, submit, tipo = 'normal', tamano = 'md', disabled, cargando, title, className = '', children }) => {
  const base = 'oc-pulsable inline-flex items-center justify-center gap-2 rounded-xl font-bold disabled:cursor-not-allowed disabled:opacity-50';
  const medida = tamano === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2.5 text-sm';
  const estilos = {
    principal: 'bg-marca text-negro hover:bg-marca-oscuro shadow-sm',
    normal: 'bg-white text-negro border border-black/10 hover:bg-black/[0.04]',
    suave: 'text-gris-oscuro hover:bg-black/[0.06]',
    peligro: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }[tipo];
  return (
    <button type={submit ? 'submit' : 'button'} onClick={onClick} disabled={disabled || cargando} title={title} className={`${base} ${medida} ${estilos} ${className}`}>
      {cargando ? <Loader2 size={15} className="animate-spin" /> : null}
      {children}
    </button>
  );
};

export const Aviso: React.FC<{ tipo?: 'info' | 'error' | 'ok'; children: React.ReactNode }> = ({ tipo = 'info', children }) => {
  const { Icono, clases } = {
    info: { Icono: Info, clases: 'bg-blue-50 text-blue-900 border-blue-200' },
    error: { Icono: AlertCircle, clases: 'bg-red-50 text-red-800 border-red-200' },
    ok: { Icono: CheckCircle2, clases: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  }[tipo];
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-snug ${clases}`}>
      <Icono size={16} className="mt-px shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export const Modal: React.FC<{
  titulo: string;
  subtitulo?: string;
  ancho?: 'sm' | 'md' | 'lg' | 'xl';
  onCerrar: () => void;
  pie?: React.ReactNode;
  children: React.ReactNode;
}> = ({ titulo, subtitulo, ancho = 'md', onCerrar, pie, children }) => {
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTecla);
    return () => document.removeEventListener('keydown', alTecla);
  }, [onCerrar]);

  const anchos = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[ancho];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="oc-velo absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className={`oc-dialogo relative flex max-h-[88vh] w-full ${anchos} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-outfit text-lg font-extrabold uppercase tracking-tight text-negro">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 text-[13px] text-neutral-500">{subtitulo}</p>}
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="oc-pulsable -mr-1 rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 hover:text-negro">
            <X size={18} />
          </button>
        </div>
        <div className="oc-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie && <div className="flex items-center justify-end gap-2 border-t border-black/8 bg-[#fafaf9] px-5 py-3.5">{pie}</div>}
      </div>
    </div>
  );
};

/** Confirmación con texto en lenguaje de persona. Devuelve una promesa. */
export function useConfirmacion() {
  const [pregunta, setPregunta] = useState<{
    titulo: string; texto: React.ReactNode; confirmar: string; peligro?: boolean;
    resolver: (v: boolean) => void;
  } | null>(null);

  const confirmar = (opts: { titulo: string; texto: React.ReactNode; confirmar?: string; peligro?: boolean }) =>
    new Promise<boolean>((resolver) => {
      setPregunta({ titulo: opts.titulo, texto: opts.texto, confirmar: opts.confirmar ?? 'Sí, continuar', peligro: opts.peligro, resolver });
    });

  const cerrar = (v: boolean) => { pregunta?.resolver(v); setPregunta(null); };

  const dialogo = pregunta ? (
    <Modal
      titulo={pregunta.titulo}
      ancho="sm"
      onCerrar={() => cerrar(false)}
      pie={
        <>
          <Boton onClick={() => cerrar(false)}>Cancelar</Boton>
          <Boton tipo={pregunta.peligro ? 'peligro' : 'principal'} onClick={() => cerrar(true)}>{pregunta.confirmar}</Boton>
        </>
      }
    >
      <div className="text-[14px] leading-relaxed text-gris-oscuro">{pregunta.texto}</div>
    </Modal>
  ) : null;

  return { confirmar, dialogo };
}

/** Mensajes efímeros abajo a la derecha. */
export interface Nota { id: number; texto: string; tipo: 'ok' | 'error' | 'info' }

export function useNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const siguiente = useRef(1);

  const avisar = (texto: string, tipo: Nota['tipo'] = 'ok') => {
    const id = siguiente.current++;
    setNotas((n) => [...n, { id, texto, tipo }]);
    setTimeout(() => setNotas((n) => n.filter((x) => x.id !== id)), tipo === 'error' ? 7000 : 3500);
  };

  const vista = (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[300] flex flex-col gap-2">
      {notas.map((n) => (
        <div
          key={n.id}
          className={`oc-nota pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold shadow-lg ${
            n.tipo === 'error' ? 'bg-red-600 text-white' : n.tipo === 'info' ? 'bg-negro text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {n.tipo === 'error' ? <AlertCircle size={16} className="mt-px shrink-0" /> : <CheckCircle2 size={16} className="mt-px shrink-0" />}
          <span>{n.texto}</span>
        </div>
      ))}
    </div>
  );

  return { avisar, vista };
}

/** Interruptor de encendido/apagado. */
export const Interruptor: React.FC<{ valor: boolean; onCambio: (v: boolean) => void; etiqueta?: string }> = ({ valor, onCambio, etiqueta }) => (
  <button
    type="button"
    role="switch"
    aria-checked={valor}
    aria-label={etiqueta}
    onClick={() => onCambio(!valor)}
    className={`oc-interruptor relative h-6 w-11 shrink-0 rounded-full ${valor ? 'bg-marca' : 'bg-black/15'}`}
  >
    <span className={`oc-interruptor-pomo absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${valor ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

export const Cargando: React.FC<{ texto?: string }> = ({ texto = 'Cargando…' }) => (
  <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-neutral-500">
    <Loader2 size={26} className="animate-spin text-marca" />
    <p className="text-sm font-semibold">{texto}</p>
  </div>
);
