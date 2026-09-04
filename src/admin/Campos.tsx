import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, Image as IconoImagen, FileText, GripVertical, RotateCcw, ExternalLink } from 'lucide-react';
import { itemPorDefecto, type CampoDef, type Def, type GrupoDef, type ListaDef, type Imagen, type Archivo, type Boton as BotonValor, type Enlace } from '../cms/dsl';
import { obtener, unir } from '../cms/rutas';
import { useDespachar, useEstado } from './estado';
import { EditorTexto } from './EditorTexto';
import { Medios } from './Medios';
import { Boton, Interruptor, useConfirmacion } from './ui';
import { ICONOS, Icono } from '../cms/iconos';
import type { Medio } from './api';

/**
 * Formularios generados a partir del árbol de definicion.ts.
 *
 * Cada tipo de campo tiene su control, y todos comparten la misma estructura:
 * etiqueta en lenguaje de persona, control, y una línea de ayuda cuando hace
 * falta. Nada de esto sabe qué es el contenido: solo lee la definición.
 */

export const Nodo: React.FC<{ def: Def; ruta: string; nivel?: number }> = ({ def, ruta, nivel = 0 }) => {
  if (def._t === 'campo') return <Campo def={def} ruta={ruta} />;
  if (def._t === 'lista') return <Lista def={def} ruta={ruta} nivel={nivel} />;
  return <Grupo def={def} ruta={ruta} nivel={nivel} />;
};

// --------------------------------------------------------------------- grupo

const Grupo: React.FC<{ def: GrupoDef<Record<string, Def>>; ruta: string; nivel: number }> = ({ def, ruta, nivel }) => {
  const [abierto, setAbierto] = useState(nivel < 1);
  const hijos = Object.entries(def.campos);

  if (nivel === 0) {
    return (
      <div className="flex flex-col gap-5">
        {def.ayuda && <p className="text-[13px] leading-snug text-tinta-suave">{def.ayuda}</p>}
        {hijos.map(([clave, sub]) => <Nodo key={clave} def={sub} ruta={unir(ruta, clave)} nivel={nivel + 1} />)}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-borde bg-panel">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="oc-pulsable flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-tinta/[0.03]"
      >
        <span className="text-[14px] font-bold text-tinta">{def.etiqueta}</span>
        {abierto ? <ChevronUp size={16} className="shrink-0 text-tinta-tenue" /> : <ChevronDown size={16} className="shrink-0 text-tinta-tenue" />}
      </button>
      {abierto && (
        <div className="flex flex-col gap-4 border-t border-borde px-4 py-4">
          {def.ayuda && <p className="-mt-1 text-[12.5px] leading-snug text-tinta-suave">{def.ayuda}</p>}
          {hijos.map(([clave, sub]) => <Nodo key={clave} def={sub} ruta={unir(ruta, clave)} nivel={nivel + 1} />)}
        </div>
      )}
    </section>
  );
};

// --------------------------------------------------------------------- lista

const Lista: React.FC<{ def: ListaDef<Record<string, Def>>; ruta: string; nivel: number }> = ({ def, ruta, nivel }) => {
  const { doc } = useEstado();
  const despachar = useDespachar();
  const { confirmar, dialogo } = useConfirmacion();
  const items = (obtener(doc.datos, ruta) as Record<string, unknown>[]) ?? [];
  const [abierto, setAbierto] = useState<number | null>(items.length === 1 ? 0 : null);

  const escribir = (nuevos: unknown[]) => despachar({ tipo: 'cambiar', ruta, valor: nuevos });

  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copia = items.slice();
    [copia[i], copia[j]] = [copia[j], copia[i]];
    escribir(copia);
    setAbierto(j);
  };

  const agregar = () => {
    escribir([...items, itemPorDefecto(def)]);
    setAbierto(items.length);
  };

  const quitar = async (i: number) => {
    const titulo = String(items[i]?.[def.campoTitulo] ?? '');
    const ok = await confirmar({
      titulo: `¿Eliminar ${def.nombreItem.toLowerCase()}?`,
      peligro: true,
      confirmar: 'Sí, eliminar',
      texto: <>Se quitará <strong>{titulo || `${def.nombreItem} ${i + 1}`}</strong> del sitio. Puedes deshacerlo con Ctrl+Z si te arrepientes.</>,
    });
    if (!ok) return;
    escribir(items.filter((_, k) => k !== i));
    setAbierto(null);
  };

  return (
    <section className="rounded-xl border border-borde bg-panel">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-tinta">{def.etiqueta}</p>
          {def.ayuda && <p className="mt-0.5 text-[12.5px] leading-snug text-tinta-suave">{def.ayuda}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-tinta/[0.06] px-2 py-0.5 text-[11px] font-bold text-tinta-suave">{items.length}</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-borde px-3 py-3">
        {items.map((item, i) => {
          const titulo = String(item?.[def.campoTitulo] ?? '') || `${def.nombreItem} ${i + 1}`;
          const estaAbierto = abierto === i;
          return (
            <div key={i} className="overflow-hidden rounded-lg border border-borde bg-panel-alto">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <GripVertical size={14} className="shrink-0 text-tinta-tenue" />
                <button
                  type="button"
                  onClick={() => setAbierto(estaAbierto ? null : i)}
                  className="oc-pulsable min-w-0 flex-1 truncate py-1 text-left text-[13.5px] font-semibold text-tinta"
                  title={titulo}
                >
                  {titulo}
                </button>
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} title="Subir" className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-tinta/5 hover:text-tinta disabled:opacity-25">
                  <ChevronUp size={14} />
                </button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} title="Bajar" className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-tinta/5 hover:text-tinta disabled:opacity-25">
                  <ChevronDown size={14} />
                </button>
                {def.agregar && (
                  <button type="button" onClick={() => void quitar(i)} title={`Eliminar ${def.nombreItem.toLowerCase()}`} className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
                <button type="button" onClick={() => setAbierto(estaAbierto ? null : i)} className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-tinta/5 hover:text-tinta">
                  {estaAbierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
              {estaAbierto && (
                <div className="flex flex-col gap-4 border-t border-borde px-3 py-3">
                  {Object.entries(def.plantilla).map(([clave, sub]) => (
                    <Nodo key={clave} def={sub} ruta={unir(ruta, i, clave)} nivel={nivel + 2} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {def.agregar && (!def.max || items.length < def.max) && (
          <Boton tipo="suave" tamano="sm" onClick={agregar} className="self-start">
            <Plus size={15} /> Añadir {def.nombreItem.toLowerCase()}
          </Boton>
        )}
      </div>
      {dialogo}
    </section>
  );
};

// --------------------------------------------------------------------- campo

const Campo: React.FC<{ def: CampoDef<unknown>; ruta: string }> = ({ def, ruta }) => {
  const { doc } = useEstado();
  const despachar = useDespachar();
  const valor = obtener(doc.datos, ruta);
  const escribir = (v: unknown) => despachar({ tipo: 'cambiar', ruta, valor: v });
  const porDefecto = def.valor;
  const cambiado = JSON.stringify(valor) !== JSON.stringify(porDefecto);

  if (def.tipo === 'oculto') return null;

  const encabezado = (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-[13px] font-bold text-tinta">{def.etiqueta}</label>
      {cambiado && (
        <button
          type="button"
          onClick={() => escribir(structuredClone(porDefecto))}
          title="Volver al texto original"
          className="oc-pulsable flex shrink-0 items-center gap-1 text-[11px] font-semibold text-tinta-tenue hover:text-marca"
        >
          <RotateCcw size={11} /> Original
        </button>
      )}
    </div>
  );

  const ayuda = def.ayuda ? <p className="oc-ayuda">{def.ayuda}</p> : null;

  const contador = (texto: string) =>
    def.max ? (
      <span className={`ml-auto text-[11px] tabular-nums ${texto.length > def.max ? 'font-bold text-amber-600' : 'text-tinta-tenue'}`}>
        {texto.length}/{def.max}
      </span>
    ) : null;

  switch (def.tipo) {
    case 'texto': {
      const v = String(valor ?? '');
      return (
        <div>
          {encabezado}
          <input value={v} onChange={(e) => escribir(e.target.value)} className="oc-campo" />
          <div className="flex items-start gap-2">{ayuda}{contador(v)}</div>
        </div>
      );
    }

    case 'textoLargo': {
      const v = String(valor ?? '');
      return (
        <div>
          {encabezado}
          <textarea value={v} onChange={(e) => escribir(e.target.value)} rows={4} className="oc-campo resize-y leading-relaxed" />
          <div className="flex items-start gap-2">{ayuda}{contador(v)}</div>
        </div>
      );
    }

    case 'html':
      return (
        <div>
          {encabezado}
          <EditorTexto valor={String(valor ?? '')} onCambio={escribir} />
          {ayuda}
        </div>
      );

    case 'booleano':
      return (
        <div className="flex items-start justify-between gap-4 rounded-xl bg-tinta/[0.03] px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-tinta">{def.etiqueta}</p>
            {def.ayuda && <p className="mt-1 text-[12px] leading-snug text-tinta-suave">{def.ayuda}</p>}
          </div>
          <Interruptor valor={!!valor} onCambio={escribir} etiqueta={def.etiqueta} />
        </div>
      );

    case 'color':
      return (
        <div>
          {encabezado}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(String(valor)) ? String(valor) : '#000000'}
              onChange={(e) => escribir(e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-borde bg-panel p-1"
              aria-label={def.etiqueta}
            />
            <div className="flex flex-wrap gap-1.5">
              {['#fda211', '#e5920f', '#1b1b1b', '#2e2f30', '#e4e4e4', '#ffffff'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => escribir(c)}
                  title={c}
                  className={`h-8 w-8 rounded-lg border transition-transform hover:scale-110 ${String(valor).toLowerCase() === c ? 'border-marca ring-2 ring-marca/40' : 'border-black/15'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          {ayuda}
        </div>
      );

    case 'opcion': {
      // Los iconos se eligen viéndolos, no por su nombre en una lista.
      const esIcono = def.opciones?.every((o) => o.valor in ICONOS);
      if (esIcono) {
        return (
          <div>
            {encabezado}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marca text-tinta">
                <Icono clave={String(valor)} size={20} />
              </div>
              <div className="oc-scroll grid max-h-32 flex-1 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-borde bg-panel p-1.5 sm:grid-cols-10">
                {def.opciones!.map((o) => (
                  <button
                    key={o.valor}
                    type="button"
                    title={o.etiqueta}
                    onClick={() => escribir(o.valor)}
                    className={`oc-pulsable flex aspect-square items-center justify-center rounded-lg ${
                      valor === o.valor ? 'bg-marca text-tinta' : 'text-tinta-suave hover:bg-tinta/[0.06] hover:text-tinta'
                    }`}
                  >
                    <Icono clave={o.valor} size={16} />
                  </button>
                ))}
              </div>
            </div>
            {ayuda}
          </div>
        );
      }
      return (
        <div>
          {encabezado}
          <select value={String(valor ?? '')} onChange={(e) => escribir(e.target.value)} className="oc-campo">
            {def.opciones?.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
          {ayuda}
        </div>
      );
    }

    case 'orden':
      return <CampoOrden def={def} valor={(valor as string[]) ?? []} escribir={escribir} />;

    case 'imagen':
      return <CampoImagen def={def} valor={(valor as Imagen) ?? { src: '', alt: '' }} escribir={escribir} encabezado={encabezado} ayuda={ayuda} />;

    case 'archivo':
      return <CampoArchivo def={def} valor={(valor as Archivo) ?? { src: '', nombre: '' }} escribir={escribir} encabezado={encabezado} ayuda={ayuda} />;

    case 'boton':
      return <CampoBoton def={def} valor={(valor as BotonValor) ?? { texto: '', url: '', nuevaPestana: false }} escribir={escribir} encabezado={encabezado} ayuda={ayuda} />;

    case 'enlace':
      return <CampoEnlace def={def} valor={(valor as Enlace) ?? { url: '', nuevaPestana: true }} escribir={escribir} encabezado={encabezado} ayuda={ayuda} />;

    default:
      return null;
  }
};

// ------------------------------------------------------------ campos ricos

const CampoOrden: React.FC<{ def: CampoDef<unknown>; valor: string[]; escribir: (v: unknown) => void }> = ({ def, valor, escribir }) => {
  const etiquetas = new Map(def.opciones?.map((o) => [o.valor, o.etiqueta]));
  // Si el código añadió una sección nueva, aparece al final aunque no esté guardada.
  const lista = [...valor.filter((v) => etiquetas.has(v)), ...(def.opciones ?? []).map((o) => o.valor).filter((v) => !valor.includes(v))];

  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= lista.length) return;
    const copia = lista.slice();
    [copia[i], copia[j]] = [copia[j], copia[i]];
    escribir(copia);
  };

  return (
    <div>
      <label className="oc-etiqueta">{def.etiqueta}</label>
      <div className="flex flex-col gap-1.5 rounded-xl border border-borde bg-panel p-2">
        {lista.map((clave, i) => (
          <div key={clave} className="flex items-center gap-2 rounded-lg bg-tinta/[0.03] px-2.5 py-2">
            <span className="w-5 shrink-0 text-center text-[11px] font-bold text-tinta-tenue tabular-nums">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-tinta">{etiquetas.get(clave) ?? clave}</span>
            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} title="Subir" className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-tinta/5 hover:text-tinta disabled:opacity-25"><ChevronUp size={14} /></button>
            <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} title="Bajar" className="oc-pulsable rounded p-1 text-tinta-tenue hover:bg-tinta/5 hover:text-tinta disabled:opacity-25"><ChevronDown size={14} /></button>
          </div>
        ))}
      </div>
      {def.ayuda && <p className="oc-ayuda">{def.ayuda}</p>}
    </div>
  );
};

const CampoImagen: React.FC<{
  def: CampoDef<unknown>; valor: Imagen; escribir: (v: unknown) => void;
  encabezado: React.ReactNode; ayuda: React.ReactNode;
}> = ({ def, valor, escribir, encabezado, ayuda }) => {
  const [galeria, setGaleria] = useState(false);
  return (
    <div>
      {encabezado}
      <div className="flex gap-3 rounded-xl border border-borde bg-panel p-2.5">
        <button
          type="button"
          onClick={() => setGaleria(true)}
          className="oc-pulsable relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-lienzo hover:opacity-80"
        >
          {valor.src ? (
            <img src={valor.src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-tinta-tenue"><IconoImagen size={20} /></span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <Boton tamano="sm" onClick={() => setGaleria(true)} className="self-start">
            {valor.src ? 'Cambiar imagen' : 'Elegir imagen'}
          </Boton>
          <input
            value={valor.alt}
            onChange={(e) => escribir({ ...valor, alt: e.target.value })}
            placeholder="Describe la foto en pocas palabras"
            className="oc-campo py-1.5 text-[13px]"
          />
        </div>
      </div>
      {ayuda}
      {galeria && (
        <Medios
          soloTipo="imagen"
          proporcion={def.proporcion}
          onCerrar={() => setGaleria(false)}
          seleccionar={(m: Medio) => {
            escribir({ src: m.url, alt: valor.alt || m.alt });
            setGaleria(false);
          }}
        />
      )}
    </div>
  );
};

const CampoArchivo: React.FC<{
  def: CampoDef<unknown>; valor: Archivo; escribir: (v: unknown) => void;
  encabezado: React.ReactNode; ayuda: React.ReactNode;
}> = ({ valor, escribir, encabezado, ayuda }) => {
  const [galeria, setGaleria] = useState(false);
  const esVideo = /\.(mp4|webm)$/i.test(valor.src);
  return (
    <div>
      {encabezado}
      <div className="flex items-center gap-3 rounded-xl border border-borde bg-panel p-2.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lienzo text-tinta-tenue">
          {esVideo ? <ExternalLink size={18} /> : <FileText size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-tinta">{valor.nombre || valor.src || 'Sin archivo'}</p>
          {valor.src && <p className="truncate text-[11.5px] text-tinta-tenue">{valor.src}</p>}
        </div>
        <Boton tamano="sm" onClick={() => setGaleria(true)}>{valor.src ? 'Cambiar' : 'Elegir'}</Boton>
      </div>
      {ayuda}
      {galeria && (
        <Medios
          onCerrar={() => setGaleria(false)}
          seleccionar={(m: Medio) => {
            escribir({ src: m.url, nombre: m.nombre });
            setGaleria(false);
          }}
        />
      )}
    </div>
  );
};

const DESTINOS = [
  { valor: 'whatsapp', etiqueta: 'Abrir WhatsApp' },
  { valor: '#soluciones', etiqueta: 'Bajar a: Soluciones' },
  { valor: '#alianza', etiqueta: 'Bajar a: Proyectos / Alianza' },
  { valor: '#manifiesto', etiqueta: 'Bajar a: Manifiesto' },
  { valor: '#contacto', etiqueta: 'Bajar a: Contacto' },
  { valor: '/nosotros', etiqueta: 'Ir a la página Nosotros' },
  { valor: '__otro', etiqueta: 'Otra dirección…' },
];

const CampoBoton: React.FC<{
  def: CampoDef<unknown>; valor: BotonValor; escribir: (v: unknown) => void;
  encabezado: React.ReactNode; ayuda: React.ReactNode;
}> = ({ valor, escribir, encabezado, ayuda }) => {
  const conocido = DESTINOS.some((d) => d.valor === valor.url);
  const [otro, setOtro] = useState(!conocido && valor.url !== '');
  return (
    <div>
      {encabezado}
      <div className="flex flex-col gap-2.5 rounded-xl border border-borde bg-panel p-3">
        <div>
          <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Texto del botón</label>
          <input value={valor.texto} onChange={(e) => escribir({ ...valor, texto: e.target.value })} className="oc-campo" />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-tinta-tenue">Al pulsarlo</label>
          <select
            value={otro ? '__otro' : valor.url}
            onChange={(e) => {
              if (e.target.value === '__otro') { setOtro(true); return; }
              setOtro(false);
              escribir({ ...valor, url: e.target.value });
            }}
            className="oc-campo"
          >
            {DESTINOS.map((d) => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}
          </select>
        </div>
        {otro && (
          <div>
            <input
              value={valor.url}
              onChange={(e) => escribir({ ...valor, url: e.target.value })}
              placeholder="https://…  ·  /nosotros  ·  #contacto"
              className="oc-campo"
            />
            <label className="mt-2 flex items-center gap-2 text-[12.5px] font-semibold text-tinta">
              <input type="checkbox" checked={valor.nuevaPestana} onChange={(e) => escribir({ ...valor, nuevaPestana: e.target.checked })} className="accent-marca" />
              Abrir en una pestaña nueva
            </label>
          </div>
        )}
      </div>
      {ayuda}
    </div>
  );
};

const CampoEnlace: React.FC<{
  def: CampoDef<unknown>; valor: Enlace; escribir: (v: unknown) => void;
  encabezado: React.ReactNode; ayuda: React.ReactNode;
}> = ({ valor, escribir, encabezado, ayuda }) => {
  const invalido = valor.url.trim() !== '' && !/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(valor.url.trim());
  return (
    <div>
      {encabezado}
      <input
        value={valor.url}
        onChange={(e) => escribir({ ...valor, url: e.target.value })}
        placeholder="https://…"
        className={`oc-campo ${invalido ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200' : ''}`}
      />
      {invalido && <p className="mt-1.5 text-[12px] font-semibold text-amber-600">Empieza la dirección por https:// para que el enlace funcione.</p>}
      {ayuda}
    </div>
  );
};
