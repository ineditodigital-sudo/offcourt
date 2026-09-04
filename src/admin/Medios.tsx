import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Search, Trash2, Pencil, RefreshCw, FileText, Film, ImageOff, AlertTriangle, Check } from 'lucide-react';
import { api, formatoPeso, formatoFecha, ErrorApi, type Medio } from './api';
import { Boton, Modal, Aviso, Cargando, useConfirmacion } from './ui';
import { Recorte } from './Recorte';

/**
 * Biblioteca de medios: galería, subida, recorte, reemplazo y borrado.
 *
 * Se usa de dos maneras:
 *   - Como sección propia del panel (`<Medios />`).
 *   - Como selector, cuando un campo de imagen pide «Elegir de la biblioteca»
 *     (`<Medios seleccionar={...} />`), que añade el botón «Usar esta».
 */

type Filtro = 'todo' | 'imagen' | 'documento' | 'video';

interface Props {
  /** Si se pasa, la galería está en modo selector y devuelve la elección. */
  seleccionar?: (medio: Medio) => void;
  /** Proporción sugerida al recortar lo que se suba desde aquí. */
  proporcion?: number;
  /** Solo mostrar cierto tipo (p. ej. un campo de PDF). */
  soloTipo?: Filtro;
  onCerrar?: () => void;
}

export const Medios: React.FC<Props> = ({ seleccionar, proporcion, soloTipo = 'todo', onCerrar }) => {
  const [subidos, setSubidos] = useState<Medio[]>([]);
  const [delSitio, setDelSitio] = useState<Medio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>(soloTipo);
  const [origen, setOrigen] = useState<'todo' | 'subido' | 'sitio'>('todo');
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [porRecortar, setPorRecortar] = useState<File | null>(null);
  const [reemplazando, setReemplazando] = useState<string | null>(null);
  const [editando, setEditando] = useState<Medio | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirmar, dialogo } = useConfirmacion();

  const cargar = useCallback(async () => {
    // Sin poner «cargando» aquí: ya arranca encendido y en las recargas la
    // galería se actualiza en su sitio, sin parpadeo.
    try {
      const r = await api.medios();
      setSubidos(r.subidos);
      setDelSitio(r.sitio);
      setError('');
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar la biblioteca.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const subirArchivo = async (archivo: File | Blob, nombre: string) => {
    setSubiendo(true);
    try {
      if (reemplazando) {
        const r = await api.reemplazar(reemplazando, archivo, nombre);
        setReemplazando(null);
        await cargar();
        seleccionar?.(r.item);
      } else {
        const r = await api.subir(archivo, nombre);
        await cargar();
        seleccionar?.(r.item);
      }
      setError('');
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  };

  const recibirArchivos = (archivos: FileList | File[]) => {
    const lista = Array.from(archivos);
    if (lista.length === 0) return;
    const primero = lista[0];
    // Las imágenes pasan por el recorte; lo demás sube directo.
    if (primero.type.startsWith('image/') && primero.type !== 'image/svg+xml' && primero.type !== 'image/gif') {
      setPorRecortar(primero);
    } else {
      void subirArchivo(primero, primero.name);
    }
  };

  const eliminar = async (m: Medio) => {
    try {
      await api.eliminarMedio(m.url);
      await cargar();
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 409) {
        const usos = (e.datos.usos as { donde: string; ruta: string }[]) ?? [];
        const seguir = await confirmar({
          titulo: '¿Quitar de todas formas?',
          peligro: true,
          confirmar: 'Sí, eliminar',
          texto: (
            <>
              <p className="mb-3">Este archivo se está usando en {usos.length === 1 ? '1 sitio' : `${usos.length} sitios`} de la web.
                Si lo eliminas, ahí quedará un hueco hasta que pongas otro.</p>
              <p className="text-[13px] text-neutral-500">Lo más seguro es cambiar primero la imagen donde aparece y eliminarla después.</p>
            </>
          ),
        });
        if (seguir) {
          await api.eliminarMedio(m.url, true);
          await cargar();
        }
      } else {
        setError(e instanceof ErrorApi ? e.message : 'No se pudo eliminar.');
      }
    }
  };

  const lista = [
    ...(origen === 'sitio' ? [] : subidos),
    ...(origen === 'subido' ? [] : delSitio),
  ].filter((m) => {
    if (filtro !== 'todo' && m.tipo !== filtro) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return m.nombre.toLowerCase().includes(q) || m.url.toLowerCase().includes(q);
  });

  const contenido = (
    <div className="flex h-full flex-col gap-4">
      {error && <Aviso tipo="error">{error}</Aviso>}

      {/* Zona de subida */}
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); recibirArchivos(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
          arrastrando ? 'border-marca bg-marca/10' : 'border-black/15 bg-black/[0.02] hover:border-marca/60 hover:bg-marca/5'
        }`}
      >
        <Upload size={22} className={arrastrando ? 'text-marca' : 'text-neutral-400'} />
        <p className="text-sm font-bold text-negro">
          {subiendo ? 'Subiendo…' : reemplazando ? 'Elige el archivo que lo sustituye' : 'Arrastra un archivo aquí o haz clic para elegirlo'}
        </p>
        <p className="text-[12px] text-neutral-500">Fotos (JPG, PNG, WebP), PDF y vídeo MP4. Las fotos se optimizan solas.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => { if (e.target.files) recibirArchivos(e.target.files); e.target.value = ''; }}
        />
      </div>

      {reemplazando && (
        <Aviso tipo="info">
          Vas a sustituir un archivo. Cuando subas el nuevo, se cambiará automáticamente en todas las páginas donde aparece.{' '}
          <button onClick={() => setReemplazando(null)} className="font-bold underline">Cancelar</button>
        </Aviso>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className="oc-campo pl-9"
          />
        </div>
        {soloTipo === 'todo' && (
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} className="oc-campo w-auto">
            <option value="todo">Todo</option>
            <option value="imagen">Fotos</option>
            <option value="documento">Documentos</option>
            <option value="video">Vídeos</option>
          </select>
        )}
        <select value={origen} onChange={(e) => setOrigen(e.target.value as typeof origen)} className="oc-campo w-auto">
          <option value="todo">Todos los archivos</option>
          <option value="subido">Subidos por mí</option>
          <option value="sitio">Los del diseño</option>
        </select>
      </div>

      {/* Galería */}
      {cargando ? (
        <Cargando texto="Cargando la biblioteca…" />
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-neutral-500">
          <ImageOff size={28} />
          <p className="text-sm font-semibold">No hay nada que mostrar aquí.</p>
          <p className="text-[13px]">Prueba a cambiar el filtro o sube un archivo nuevo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {lista.map((m) => (
            <Ficha
              key={m.url}
              medio={m}
              modoSelector={!!seleccionar}
              onUsar={() => seleccionar?.(m)}
              onEditar={() => setEditando(m)}
              onReemplazar={() => { setReemplazando(m.url); inputRef.current?.click(); }}
              onEliminar={() => void eliminar(m)}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {onCerrar ? (
        <Modal
          titulo={seleccionar ? 'Elegir un archivo' : 'Biblioteca de medios'}
          subtitulo={seleccionar ? 'Sube uno nuevo o reutiliza uno que ya está en el sitio.' : 'Todo lo que se usa en la web, en un solo lugar.'}
          ancho="xl"
          onCerrar={onCerrar}
        >
          {contenido}
        </Modal>
      ) : (
        contenido
      )}

      {porRecortar && (
        <Recorte
          archivo={porRecortar}
          proporcion={proporcion}
          onCancelar={() => setPorRecortar(null)}
          onListo={(blob, nombre) => { setPorRecortar(null); void subirArchivo(blob, nombre); }}
        />
      )}

      {editando && (
        <EditarDatos
          medio={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={() => { setEditando(null); void cargar(); }}
        />
      )}

      {dialogo}
    </>
  );
};

// --------------------------------------------------------------------- ficha

const Ficha: React.FC<{
  medio: Medio;
  modoSelector: boolean;
  onUsar: () => void;
  onEditar: () => void;
  onReemplazar: () => void;
  onEliminar: () => void;
}> = ({ medio, modoSelector, onUsar, onEditar, onReemplazar, onEliminar }) => {
  const propio = medio.origen === 'subido';
  return (
    <div className="group relative overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="relative aspect-[4/3] bg-[#f1f1ef]">
        {medio.tipo === 'imagen' ? (
          <img src={medio.url} alt={medio.alt} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-neutral-400">
            {medio.tipo === 'documento' ? <FileText size={26} /> : <Film size={26} />}
            <span className="px-2 text-center text-[11px] font-bold uppercase tracking-wide">{medio.tipo === 'documento' ? 'PDF' : 'Vídeo'}</span>
          </div>
        )}

        {medio.pesado && (
          <span title="Esta imagen pesa bastante y puede ralentizar la página" className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <AlertTriangle size={10} /> Pesada
          </span>
        )}
        {!propio && (
          <span title="Viene con el diseño del sitio: se puede usar, pero no borrar" className="absolute right-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Del diseño
          </span>
        )}

        {/* Acciones */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          {modoSelector && (
            <button onClick={onUsar} className="oc-pulsable rounded-lg bg-marca px-2.5 py-1 text-[12px] font-bold text-negro hover:bg-marca-oscuro">
              <Check size={12} className="mr-1 inline" />Usar esta
            </button>
          )}
          {propio && (
            <>
              <button onClick={onEditar} title="Cambiar nombre y descripción" className="oc-pulsable rounded-lg bg-white/90 p-1.5 text-negro hover:bg-white"><Pencil size={13} /></button>
              <button onClick={onReemplazar} title="Sustituir el archivo" className="oc-pulsable rounded-lg bg-white/90 p-1.5 text-negro hover:bg-white"><RefreshCw size={13} /></button>
              <button onClick={onEliminar} title="Eliminar" className="oc-pulsable rounded-lg bg-white/90 p-1.5 text-red-600 hover:bg-white"><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </div>

      <div className="px-2.5 py-2">
        <p className="truncate text-[12.5px] font-bold text-negro" title={medio.nombre}>{medio.nombre}</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          {formatoPeso(medio.tamano)}
          {medio.ancho ? ` · ${medio.ancho}×${medio.alto}` : ''}
        </p>
      </div>
    </div>
  );
};

// -------------------------------------------------------------- editar datos

const EditarDatos: React.FC<{ medio: Medio; onCerrar: () => void; onGuardado: () => void }> = ({ medio, onCerrar, onGuardado }) => {
  const [nombre, setNombre] = useState(medio.nombre);
  const [alt, setAlt] = useState(medio.alt);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async () => {
    setGuardando(true);
    try {
      await api.editarMedio(medio.url, { nombre, alt });
      onGuardado();
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      titulo="Datos del archivo"
      ancho="sm"
      onCerrar={onCerrar}
      pie={
        <>
          <Boton onClick={onCerrar}>Cancelar</Boton>
          <Boton tipo="principal" onClick={guardar} cargando={guardando}>Guardar</Boton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Aviso tipo="error">{error}</Aviso>}
        {medio.tipo === 'imagen' && (
          <img src={medio.url} alt="" className="max-h-48 w-full rounded-xl object-contain bg-[#f1f1ef]" />
        )}
        <div>
          <label className="oc-etiqueta">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="oc-campo" />
          <p className="oc-ayuda">Solo para encontrarlo en la biblioteca. No se ve en el sitio.</p>
        </div>
        <div>
          <label className="oc-etiqueta">Descripción de la imagen</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="oc-campo" placeholder="Ej.: Jugadora de pádel golpeando de revés" />
          <p className="oc-ayuda">
            Describe brevemente lo que se ve. Lo leen las personas que usan lector de pantalla y también ayuda a que Google entienda la foto.
          </p>
        </div>
        <p className="text-[12px] text-neutral-500">
          {formatoPeso(medio.tamano)}{medio.ancho ? ` · ${medio.ancho}×${medio.alto} px` : ''} · Subida el {formatoFecha(medio.fecha)}
        </p>
      </div>
    </Modal>
  );
};
