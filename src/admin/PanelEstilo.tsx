import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, RotateCcw, Type, Minus, Plus } from 'lucide-react';
import type { EstiloElemento } from '../cms/definicion';
import { useDespachar, useEstado } from './estado';

/**
 * Controles de estilo de UN elemento del sitio.
 *
 * Todo va por opciones acotadas a propósito: pasos de tamaño en vez de
 * píxeles, pesos con nombre, la paleta de la marca. Así se puede ajustar el
 * aspecto sin poder romper el diseño ni el comportamiento en móvil (el tamaño
 * se desplaza dentro de la escala responsiva; ver src/cms/estilos.ts).
 *
 * «Automático» significa: como lo dejó el diseño. Cada control puede volver
 * ahí, y el botón de arriba devuelve el elemento entero a su estado original.
 */

const PESOS: { valor: NonNullable<EstiloElemento['peso']>; etiqueta: string }[] = [
  { valor: 'normal', etiqueta: 'Fino' },
  { valor: 'medium', etiqueta: 'Medio' },
  { valor: 'semibold', etiqueta: 'Seminegrita' },
  { valor: 'bold', etiqueta: 'Negrita' },
  { valor: 'extrabold', etiqueta: 'Extra' },
  { valor: 'black', etiqueta: 'Máxima' },
];

const COLORES: { valor: string; etiqueta: string }[] = [
  { valor: '#fda211', etiqueta: 'Naranja de marca' },
  { valor: '#1b1b1b', etiqueta: 'Negro' },
  { valor: '#2e2f30', etiqueta: 'Gris oscuro' },
  { valor: '#e4e4e4', etiqueta: 'Gris claro' },
  { valor: '#ffffff', etiqueta: 'Blanco' },
];

export const PanelEstilo: React.FC<{ clave: string }> = ({ clave }) => {
  const { doc } = useEstado();
  const despachar = useDespachar();
  const estilo = doc.estilos[clave] ?? {};
  const hayAlgo = Object.keys(estilo).length > 0;

  const cambiar = (parcial: Partial<EstiloElemento>) => {
    const nuevo: EstiloElemento = { ...estilo, ...parcial };
    for (const k of Object.keys(nuevo) as (keyof EstiloElemento)[]) {
      if (nuevo[k] === undefined) delete nuevo[k];
    }
    despachar({ tipo: 'cambiarEstilo', clave, estilo: nuevo });
  };

  const restablecer = () => despachar({ tipo: 'cambiarEstilo', clave, estilo: undefined });

  const paso = estilo.tamano ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-tinta">Aspecto de este elemento</p>
        {hayAlgo && (
          <button
            type="button"
            onClick={restablecer}
            className="oc-pulsable flex items-center gap-1 text-[11.5px] font-semibold text-tinta-tenue hover:text-marca"
          >
            <RotateCcw size={11} /> Restablecer
          </button>
        )}
      </div>

      {/* Tamaño */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Tamaño</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cambiar({ tamano: Math.max(-2, paso - 1) || undefined })}
            disabled={paso <= -2}
            title="Más pequeño"
            className="oc-pulsable flex h-9 w-9 items-center justify-center rounded-lg border border-borde bg-panel text-tinta hover:bg-tinta/[0.04] disabled:opacity-30"
          >
            <Minus size={15} />
          </button>
          <span className="min-w-[5.5rem] text-center text-[13px] font-bold text-tinta">
            {paso === 0 ? 'Original' : paso > 0 ? `+${paso} más grande` : `${paso} más chico`}
          </span>
          <button
            type="button"
            onClick={() => cambiar({ tamano: Math.min(2, paso + 1) || undefined })}
            disabled={paso >= 2}
            title="Más grande"
            className="oc-pulsable flex h-9 w-9 items-center justify-center rounded-lg border border-borde bg-panel text-tinta hover:bg-tinta/[0.04] disabled:opacity-30"
          >
            <Plus size={15} />
          </button>
        </div>
        <p className="oc-ayuda">El tamaño se ajusta solo en celular y computadora; esto lo sube o baja un escalón en todas las pantallas.</p>
      </div>

      {/* Grosor */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Grosor de la letra</label>
        <div className="flex flex-wrap gap-1.5">
          <Pastilla activo={!estilo.peso} onClick={() => cambiar({ peso: undefined })}>Automático</Pastilla>
          {PESOS.map((p) => (
            <Pastilla key={p.valor} activo={estilo.peso === p.valor} onClick={() => cambiar({ peso: p.valor })}>{p.etiqueta}</Pastilla>
          ))}
        </div>
      </div>

      {/* Tipografía y cursiva */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Tipografía</label>
        <div className="flex flex-wrap gap-1.5">
          <Pastilla activo={!estilo.fuente} onClick={() => cambiar({ fuente: undefined })}>Automática</Pastilla>
          <Pastilla activo={estilo.fuente === 'outfit'} onClick={() => cambiar({ fuente: 'outfit' })}>Títulos</Pastilla>
          <Pastilla activo={estilo.fuente === 'sarabun'} onClick={() => cambiar({ fuente: 'sarabun' })}>Texto</Pastilla>
          <Pastilla activo={estilo.cursiva === true} onClick={() => cambiar({ cursiva: estilo.cursiva === true ? undefined : true })}>
            <Type size={12} className="mr-1 inline italic" />Cursiva
          </Pastilla>
        </div>
      </div>

      {/* Color del texto */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Color del texto</label>
        <Paleta valor={estilo.color} onCambio={(c) => cambiar({ color: c })} />
      </div>

      {/* Fondo */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Color de fondo</label>
        <Paleta valor={estilo.fondo} onCambio={(c) => cambiar({ fondo: c })} />
      </div>

      {/* Alineación */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Alineación</label>
        <div className="flex gap-1.5">
          <Pastilla activo={!estilo.alineacion} onClick={() => cambiar({ alineacion: undefined })}>Automática</Pastilla>
          {([['left', AlignLeft, 'Izquierda'], ['center', AlignCenter, 'Centrado'], ['right', AlignRight, 'Derecha']] as const).map(([v, Ico, t]) => (
            <button
              key={v}
              type="button"
              title={t}
              onClick={() => cambiar({ alineacion: v })}
              className={`oc-pulsable flex h-8 w-9 items-center justify-center rounded-lg border ${
                estilo.alineacion === v ? 'border-marca bg-marca text-tinta' : 'border-borde bg-panel text-tinta-suave hover:bg-tinta/[0.04]'
              }`}
            >
              <Ico size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Espacio inferior */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Espacio debajo</label>
        <div className="flex gap-1.5">
          <Pastilla activo={!estilo.espacio} onClick={() => cambiar({ espacio: undefined })}>Automático</Pastilla>
          <Pastilla activo={estilo.espacio === 'menos'} onClick={() => cambiar({ espacio: 'menos' })}>Menos</Pastilla>
          <Pastilla activo={estilo.espacio === 'mas'} onClick={() => cambiar({ espacio: 'mas' })}>Más</Pastilla>
        </div>
      </div>
    </div>
  );
};

const Pastilla: React.FC<{ activo: boolean; onClick: () => void; children: React.ReactNode }> = ({ activo, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`oc-pulsable rounded-lg border px-2.5 py-1.5 text-[12px] font-bold ${
      activo ? 'border-marca bg-marca text-tinta' : 'border-borde bg-panel text-tinta hover:bg-tinta/[0.04]'
    }`}
  >
    {children}
  </button>
);

const Paleta: React.FC<{ valor?: string; onCambio: (c: string | undefined) => void }> = ({ valor, onCambio }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <button
      type="button"
      onClick={() => onCambio(undefined)}
      title="Como lo dejó el diseño"
      className={`oc-pulsable rounded-lg border px-2.5 py-1.5 text-[12px] font-bold ${
        !valor ? 'border-marca bg-marca text-tinta' : 'border-borde bg-panel text-tinta hover:bg-tinta/[0.04]'
      }`}
    >
      Automático
    </button>
    {COLORES.map((c) => (
      <button
        key={c.valor}
        type="button"
        title={c.etiqueta}
        onClick={() => onCambio(c.valor)}
        className={`h-8 w-8 rounded-lg border transition-transform hover:scale-110 ${
          valor?.toLowerCase() === c.valor ? 'border-marca ring-2 ring-marca/40' : 'border-borde-fuerte'
        }`}
        style={{ background: c.valor }}
      />
    ))}
    <label className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-borde-fuerte" title="Otro color">
      <span className="pointer-events-none absolute inset-0 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" />
      <input
        type="color"
        value={valor && /^#[0-9a-f]{6}$/i.test(valor) ? valor : '#000000'}
        onChange={(e) => onCambio(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Elegir otro color"
      />
    </label>
  </div>
);
