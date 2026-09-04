import React, { useCallback, useEffect, useState } from 'react';
import {
  Rocket, Inbox, Images, History as IconoHistorial, MousePointerClick, ArrowRight,
  CircleCheck, CircleDot, ExternalLink, Type, ImagePlus, Palette, BarChart3,
} from 'lucide-react';
import { api, formatoFecha, ErrorApi } from './api';
import { useEstado } from './estado';
import type { Modulo } from './BarraLateral';
import type { Entrada } from './navegacion';
import { PAGINAS } from './navegacion';

/**
 * Pantalla de bienvenida del panel.
 *
 * Contesta de un vistazo las tres preguntas con las que alguien entra aquí:
 * ¿está publicado lo último que hice?, ¿hay mensajes nuevos?, ¿por dónde
 * empiezo? Lo demás son atajos a las tareas que de verdad se repiten.
 */

interface Props {
  onModulo: (m: Modulo) => void;
  onEntrada: (e: Entrada) => void;
  sinLeer: number;
}

const buscar = (ruta: string): Entrada =>
  PAGINAS.flatMap((p) => p.entradas).find((e) => e.ruta === ruta) ?? PAGINAS[0].entradas[0];

export const Inicio: React.FC<Props> = ({ onModulo, onEntrada, sinLeer }) => {
  const { publicadoEn, hayCambiosSinPublicar, doc } = useEstado();
  const [archivos, setArchivos] = useState<number | null>(null);
  const [versiones, setVersiones] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    // Cifras del encabezado. Si alguna falla, su tarjeta se queda en «—»: es
    // información de contexto, no vale la pena molestar con un error.
    try {
      const m = await api.medios();
      setArchivos(m.subidos.length + m.sitio.length);
    } catch (e) { if (!(e instanceof ErrorApi)) throw e; }
    try {
      const v = await api.versiones();
      setVersiones(v.versiones.length);
    } catch (e) { if (!(e instanceof ErrorApi)) throw e; }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const verticales = doc.datos.paginas.servicios.items.filter((s) => s.visible).length;

  const atajos = [
    { Icono: Type, titulo: 'Cambiar un texto', texto: 'Titulares, descripciones, botones.', ir: () => { onEntrada(buscar('paginas.inicio.hero')); onModulo('contenido'); } },
    { Icono: ImagePlus, titulo: 'Subir una foto', texto: 'Se recorta y optimiza sola.', ir: () => onModulo('medios') },
    { Icono: Palette, titulo: 'Colores y tipografías', texto: 'El aspecto de todo el sitio.', ir: () => { onEntrada(buscar('global.tema')); onModulo('contenido'); } },
    { Icono: BarChart3, titulo: 'Activar Google Analytics', texto: 'Pegando solo el identificador.', ir: () => { onEntrada(buscar('global.integraciones')); onModulo('contenido'); } },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* -------------------------------------------------------- bienvenida */}
      <section className="oc-banner relative overflow-hidden rounded-2xl">
        <div className="oc-banner-malla absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative px-6 py-8 sm:px-9 sm:py-11">
          <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-marca">
            <span className="h-px w-6 bg-marca" aria-hidden="true" />
            Panel de administración
          </span>
          <h1 className="font-outfit text-[1.9rem] font-black italic uppercase leading-[1.05] tracking-tight text-white sm:text-[2.6rem]">
            Este sitio es tuyo.<br className="hidden sm:block" /> Cámbialo cuando quieras.
          </h1>
          <p className="mt-3 max-w-lg font-sarabun text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
            Textos, fotos, colores y secciones. Sin programar y sin depender de nadie:
            lo editas, lo ves al instante y lo publicas cuando esté listo.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => onModulo('contenido')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-marca px-4 py-3 text-[13.5px] font-bold text-negro transition-colors hover:bg-marca-oscuro sm:py-2.5"
            >
              <MousePointerClick size={15} /> Empezar a editar
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-[13.5px] font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10 sm:py-2.5"
            >
              <ExternalLink size={15} /> Ver el sitio
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ estado */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta
          destacada={hayCambiosSinPublicar}
          Icono={hayCambiosSinPublicar ? CircleDot : CircleCheck}
          cifra={hayCambiosSinPublicar ? 'Pendiente' : 'Al día'}
          etiqueta={hayCambiosSinPublicar ? 'Tienes cambios sin publicar' : 'Todo está publicado'}
        />
        <Tarjeta
          Icono={Rocket}
          cifra={publicadoEn ? formatoFecha(publicadoEn).split(',')[0] : 'Nunca'}
          etiqueta="Última publicación"
          onClick={() => onModulo('historial')}
        />
        <Tarjeta
          destacada={sinLeer > 0}
          Icono={Inbox}
          cifra={sinLeer > 0 ? String(sinLeer) : '0'}
          etiqueta={sinLeer === 1 ? 'Mensaje sin leer' : 'Mensajes sin leer'}
          onClick={() => onModulo('mensajes')}
        />
        <Tarjeta
          Icono={Images}
          cifra={archivos === null ? '—' : String(archivos)}
          etiqueta="Fotos y archivos"
          onClick={() => onModulo('medios')}
        />
      </section>

      {/* ----------------------------------------------------------- atajos */}
      <section>
        <h2 className="mb-3 font-outfit text-[15px] font-extrabold uppercase tracking-tight text-negro">Lo que se hace más seguido</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {atajos.map(({ Icono, titulo, texto, ir }) => (
            <button
              key={titulo}
              onClick={ir}
              className="group flex items-center gap-3.5 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-left transition-colors hover:border-marca/60 hover:bg-marca/[0.04]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marca/12 text-marca-oscuro transition-colors group-hover:bg-marca group-hover:text-negro">
                <Icono size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-negro">{titulo}</span>
                <span className="block text-[12.5px] text-neutral-500">{texto}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-neutral-300 transition-colors group-hover:text-marca-oscuro" />
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- así funciona */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-5 lg:col-span-2">
          <h2 className="mb-1 font-outfit text-[15px] font-extrabold uppercase tracking-tight text-negro">Cómo funciona</h2>
          <p className="mb-4 text-[13px] leading-snug text-neutral-500">Siempre el mismo orden. Nada se publica hasta el último paso.</p>
          <ol className="grid gap-2.5 sm:grid-cols-2">
            {[
              ['Haz clic', 'En la vista previa, lo editable se marca en naranja.'],
              ['Escribe', 'El cambio se ve al instante.'],
              ['Revisa', 'Mira también cómo queda en celular.'],
              ['Publica', 'Solo entonces lo ven los visitantes.'],
            ].map(([titulo, texto], i) => (
              <li key={titulo} className="flex gap-3 rounded-lg bg-black/[0.025] px-3 py-2.5">
                <span className="font-outfit text-[15px] font-black italic tabular-nums text-marca">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold text-negro">{titulo}</span>
                  <span className="block text-[12.5px] leading-snug text-neutral-500">{texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="mb-1 font-outfit text-[15px] font-extrabold uppercase tracking-tight text-negro">Tu sitio ahora</h2>
          <p className="mb-4 text-[13px] leading-snug text-neutral-500">Lo que hay publicado en este momento.</p>
          <dl className="flex flex-col gap-2.5 text-[13px]">
            <Dato etiqueta="Verticales visibles" valor={`${verticales} de 7`} />
            <Dato etiqueta="Secciones en la portada" valor={String(doc.datos.paginas.inicio.orden.length)} />
            <Dato etiqueta="Versiones guardadas" valor={versiones === null ? '—' : String(versiones)} />
            <Dato
              etiqueta="Analítica"
              valor={doc.datos.global.integraciones.ga4 ? 'Activa' : 'Sin activar'}
              atenuado={!doc.datos.global.integraciones.ga4}
            />
          </dl>
          <button
            onClick={() => onModulo('historial')}
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-marca-oscuro hover:underline"
          >
            <IconoHistorial size={13} /> Ver el historial
          </button>
        </div>
      </section>
    </div>
  );
};

const Tarjeta: React.FC<{
  Icono: React.ElementType;
  cifra: string;
  etiqueta: string;
  destacada?: boolean;
  onClick?: () => void;
}> = ({ Icono, cifra, etiqueta, destacada, onClick }) => {
  const Elemento = onClick ? 'button' : 'div';
  return (
    <Elemento
      onClick={onClick}
      className={`flex flex-col gap-1.5 rounded-xl border px-4 py-3.5 text-left transition-colors ${
        destacada ? 'border-marca/50 bg-marca/[0.07]' : 'border-black/10 bg-white'
      } ${onClick ? 'hover:border-marca/60 hover:bg-marca/[0.05]' : ''}`}
    >
      <Icono size={16} className={destacada ? 'text-marca-oscuro' : 'text-neutral-400'} />
      <span className="font-outfit text-[1.15rem] font-extrabold leading-none tracking-tight text-negro">{cifra}</span>
      <span className="text-[11.5px] leading-snug text-neutral-500">{etiqueta}</span>
    </Elemento>
  );
};

const Dato: React.FC<{ etiqueta: string; valor: string; atenuado?: boolean }> = ({ etiqueta, valor, atenuado }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-black/6 pb-2 last:border-0 last:pb-0">
    <dt className="text-neutral-500">{etiqueta}</dt>
    <dd className={`font-bold tabular-nums ${atenuado ? 'text-neutral-400' : 'text-negro'}`}>{valor}</dd>
  </div>
);
