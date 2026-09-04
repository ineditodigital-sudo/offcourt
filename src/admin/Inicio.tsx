import React, { useCallback, useEffect, useState } from 'react';
import {
  Rocket, Inbox, Images, MousePointerClick, ArrowRight, ChevronRight, ExternalLink,
  Type, ImagePlus, Palette, BarChart3, Share2, Search, HelpCircle,
} from 'lucide-react';
import { api, tiempoRelativo, ErrorApi } from './api';
import { useEstado } from './estado';
import type { Modulo } from './BarraLateral';
import type { Entrada } from './navegacion';
import { PAGINAS } from './navegacion';

/**
 * Pantalla de inicio del panel.
 *
 * El banner es un saludo, no una portada: dice quién eres, en qué estado está
 * el sitio y ofrece las tres acciones de siempre. Todo en una franja corta,
 * porque esto se ve muchas veces al día y una cabecera alta acaba estorbando.
 *
 * Debajo, solo lo que aporta: lo que falta por configurar (si falta algo), los
 * atajos a lo que de verdad se repite y cuatro cifras del sitio.
 */

interface Props {
  onModulo: (m: Modulo) => void;
  onEntrada: (e: Entrada) => void;
  onAyuda: () => void;
  sinLeer: number;
}

const buscar = (ruta: string): Entrada =>
  PAGINAS.flatMap((p) => p.entradas).find((e) => e.ruta === ruta) ?? PAGINAS[0].entradas[0];

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export const Inicio: React.FC<Props> = ({ onModulo, onEntrada, onAyuda, sinLeer }) => {
  const { publicadoEn, guardadoEn, hayCambiosSinPublicar, doc } = useEstado();
  const [archivos, setArchivos] = useState<number | null>(null);
  const [versiones, setVersiones] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    // Cifras de contexto. Si alguna falla, su hueco queda en «—»: no vale la
    // pena interrumpir a nadie por esto.
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

  const { global, paginas } = doc.datos;
  const verticales = paginas.servicios.items.filter((s) => s.visible).length;

  // Estado del sitio, en una sola frase. Tres casos, y el tercero importa: si
  // nunca se ha publicado desde el panel, decir «todo está publicado» sería
  // engañoso —el sitio muestra el contenido con el que se construyó—.
  const estado = hayCambiosSinPublicar
    ? {
        punto: 'bg-amber-400',
        texto: 'Tienes cambios sin publicar.',
        cola: guardadoEn ? ` · Guardado ${tiempoRelativo(guardadoEn)}` : ' · Se guardan solos mientras editas',
      }
    : publicadoEn
      ? {
          punto: 'bg-emerald-400',
          texto: 'Todo lo que ves en tu sitio está publicado.',
          cola: ` · Última publicación ${tiempoRelativo(publicadoEn)}`,
        }
      : {
          punto: 'bg-white/50',
          texto: 'Tu sitio muestra su contenido original.',
          cola: ' · Todavía no has publicado nada desde aquí',
        };

  // Lo que queda por configurar. Solo aparece si de verdad falta algo.
  const redesVacias = !global.redes.mostrar
    || ![global.redes.instagram, global.redes.linkedin, global.redes.facebook, global.redes.tiktok, global.redes.youtube].some((r) => r.url.trim());
  const pendientes = [
    redesVacias && {
      Icono: Share2,
      texto: 'Faltan tus redes sociales: por ahora los iconos no se muestran en el sitio.',
      ir: () => { onEntrada(buscar('global.redes')); },
    },
    !global.integraciones.ga4 && {
      Icono: Search,
      texto: 'No estás midiendo visitas: pega tu identificador de Google Analytics.',
      ir: () => { onEntrada(buscar('global.integraciones')); },
    },
  ].filter(Boolean) as { Icono: React.ElementType; texto: string; ir: () => void }[];

  const atajos = [
    { Icono: Type, titulo: 'Cambiar un texto', texto: 'Titulares, descripciones, botones.', ir: () => onEntrada(buscar('paginas.inicio.hero')) },
    { Icono: ImagePlus, titulo: 'Subir una foto', texto: 'Se recorta y optimiza sola.', ir: () => onModulo('medios') },
    { Icono: Palette, titulo: 'Colores y tipografías', texto: 'El aspecto de todo el sitio.', ir: () => onEntrada(buscar('global.tema')) },
    { Icono: BarChart3, titulo: 'Google y redes', texto: 'Cómo se ve al compartir el enlace.', ir: () => onEntrada(buscar('paginas.inicio.seo')) },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* -------------------------------------------------------- bienvenida */}
      <section className="oc-banner relative overflow-hidden rounded-2xl">
        {/* Marca de agua: el propio logotipo, grande y muy tenue. */}
        <img
          src="/logo_blanco.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 hidden h-[150%] w-auto -translate-y-1/2 opacity-[0.055] sm:block"
        />
        <div className="oc-banner-malla absolute inset-0 opacity-60" aria-hidden="true" />

        <div className="relative px-5 py-5 sm:px-7 sm:py-6">
          <h1 className="font-outfit text-[1.35rem] font-extrabold italic uppercase tracking-tight text-white sm:text-[1.6rem]">
            {saludo()}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sarabun text-[13px] text-white/70 sm:text-[13.5px]">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${estado.punto}`} aria-hidden="true" />
            <span>{estado.texto}</span>
            <span className="text-white/45">{estado.cola}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onModulo('contenido')}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold text-negro transition-colors hover:bg-white/90"
            >
              <MousePointerClick size={14} /> Editar mi sitio
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10"
            >
              <ExternalLink size={14} /> Ver mi sitio
            </a>
            <button
              onClick={onAyuda}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10"
            >
              <HelpCircle size={14} /> Recorrido rápido
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- pendientes */}
      {pendientes.length > 0 && (
        <section className="rounded-xl border border-black/10 bg-white px-4 py-3.5">
          <h2 className="mb-2 text-[13.5px] font-bold text-negro">Para dejarlo redondo</h2>
          <ul className="flex flex-col">
            {pendientes.map(({ Icono, texto, ir }) => (
              <li key={texto}>
                <button
                  onClick={ir}
                  className="group flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-marca/[0.06]"
                >
                  <Icono size={15} className="shrink-0 text-marca-oscuro" />
                  <span className="min-w-0 flex-1 text-[13px] leading-snug text-gris-oscuro">{texto}</span>
                  <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-neutral-400 transition-colors group-hover:text-marca-oscuro">
                    Ir <ChevronRight size={13} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------- atajos */}
      <section>
        <h2 className="mb-3 font-outfit text-[15px] font-extrabold uppercase tracking-tight text-negro">Todo lo que puedes cambiar</h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {atajos.map(({ Icono, titulo, texto, ir }) => (
            <button
              key={titulo}
              onClick={ir}
              className="group flex items-center gap-3.5 rounded-xl border border-black/10 bg-white px-4 py-3 text-left transition-colors hover:border-marca/60 hover:bg-marca/[0.04]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marca/12 text-marca-oscuro transition-colors group-hover:bg-marca group-hover:text-negro">
                <Icono size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-negro">{titulo}</span>
                <span className="block text-[12.5px] text-neutral-500">{texto}</span>
              </span>
              <ArrowRight size={15} className="shrink-0 text-neutral-300 transition-colors group-hover:text-marca-oscuro" />
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ tu sitio hoy */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Cifra
          Icono={Inbox}
          valor={String(sinLeer)}
          etiqueta={sinLeer === 1 ? 'Mensaje sin leer' : 'Mensajes sin leer'}
          destacada={sinLeer > 0}
          onClick={() => onModulo('mensajes')}
        />
        <Cifra Icono={Images} valor={archivos === null ? '—' : String(archivos)} etiqueta="Fotos y archivos" onClick={() => onModulo('medios')} />
        <Cifra Icono={Rocket} valor={versiones === null ? '—' : String(versiones)} etiqueta="Versiones guardadas" onClick={() => onModulo('historial')} />
        <Cifra Icono={MousePointerClick} valor={`${verticales} de 7`} etiqueta="Verticales visibles" onClick={() => onEntrada(buscar('paginas.servicios.items'))} />
      </section>
    </div>
  );
};

const Cifra: React.FC<{
  Icono: React.ElementType;
  valor: string;
  etiqueta: string;
  destacada?: boolean;
  onClick: () => void;
}> = ({ Icono, valor, etiqueta, destacada, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
      destacada ? 'border-marca/50 bg-marca/[0.07] hover:bg-marca/[0.11]' : 'border-black/10 bg-white hover:border-marca/50 hover:bg-marca/[0.04]'
    }`}
  >
    <Icono size={16} className={`shrink-0 ${destacada ? 'text-marca-oscuro' : 'text-neutral-400'}`} />
    <span className="min-w-0">
      <span className="block font-outfit text-[1.05rem] font-extrabold leading-none tracking-tight text-negro">{valor}</span>
      <span className="mt-0.5 block text-[11.5px] leading-snug text-neutral-500">{etiqueta}</span>
    </span>
  </button>
);
