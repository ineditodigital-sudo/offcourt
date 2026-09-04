import React, { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Download, Phone, Inbox } from 'lucide-react';
import { api, formatoFecha, ErrorApi, type Mensaje } from './api';
import { Aviso, Boton, Cargando, useConfirmacion } from './ui';

/**
 * Bandeja de los mensajes que llegan del formulario de contacto.
 *
 * sendmail.php sigue enviando el correo; esto es la copia de seguridad, para
 * cuando un correo se pierde o acaba en la carpeta de spam.
 */

export const Mensajes: React.FC<{ onContador?: (n: number) => void }> = ({ onContador }) => {
  const [items, setItems] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'nuevos'>('todos');
  const { confirmar, dialogo } = useConfirmacion();

  const cargar = useCallback(async () => {
    // Sin poner «cargando» aquí: ya arranca encendido y las recargas
    // posteriores actualizan la lista en su sitio, sin parpadeo.
    try {
      const r = await api.mensajes();
      setItems(r.mensajes);
      onContador?.(r.noLeidos);
      setError('');
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudieron cargar los mensajes.');
    } finally {
      setCargando(false);
    }
  }, [onContador]);

  useEffect(() => { void cargar(); }, [cargar]);

  const marcar = async (m: Mensaje, leido: boolean) => {
    setItems((xs) => xs.map((x) => (x.id === m.id ? { ...x, leido } : x)));
    try {
      await api.mensajeLeido(m.id, leido);
      await cargar();
    } catch { /* la vista ya se actualizó; al recargar se corrige */ }
  };

  const eliminar = async (m: Mensaje) => {
    const ok = await confirmar({
      titulo: '¿Eliminar el mensaje?',
      peligro: true,
      confirmar: 'Sí, eliminar',
      texto: <>Se borrará el mensaje de <strong>{m.nombre || 'este contacto'}</strong> de la bandeja. El correo que recibiste no se toca.</>,
    });
    if (!ok) return;
    await api.mensajeEliminar(m.id);
    await cargar();
  };

  const lista = filtro === 'nuevos' ? items.filter((m) => !m.leido) : items;
  const nuevos = items.filter((m) => !m.leido).length;

  if (cargando) return <Cargando texto="Cargando los mensajes…" />;

  return (
    <div className="flex flex-col gap-4">
      {error && <Aviso tipo="error">{error}</Aviso>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <Boton tamano="sm" tipo={filtro === 'todos' ? 'principal' : 'normal'} onClick={() => setFiltro('todos')}>
            Todos ({items.length})
          </Boton>
          <Boton tamano="sm" tipo={filtro === 'nuevos' ? 'principal' : 'normal'} onClick={() => setFiltro('nuevos')}>
            Sin leer ({nuevos})
          </Boton>
        </div>
        {items.length > 0 && (
          <a href={api.urlCsv()} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[13px] font-bold text-negro transition-colors hover:bg-black/[0.04]">
            <Download size={14} /> Descargar en Excel
          </a>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/12 py-16 text-center text-neutral-500">
          <Inbox size={30} />
          <p className="text-sm font-semibold">{filtro === 'nuevos' ? 'No hay mensajes sin leer.' : 'Todavía no ha llegado ningún mensaje.'}</p>
          <p className="max-w-sm text-[13px] leading-snug">
            Aquí aparecerá una copia de todo lo que la gente envíe desde el formulario de contacto del sitio.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {lista.map((m) => (
            <article key={m.id} className={`rounded-xl border bg-white p-4 ${m.leido ? 'border-black/8' : 'border-marca/50 bg-marca/[0.04]'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-bold text-negro">
                    {!m.leido && <span className="h-2 w-2 shrink-0 rounded-full bg-marca" aria-label="Sin leer" />}
                    {m.nombre || 'Sin nombre'}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-neutral-500">{formatoFecha(m.fecha)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => void marcar(m, !m.leido)}
                    title={m.leido ? 'Marcar como sin leer' : 'Marcar como leído'}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-black/5 hover:text-negro"
                  >
                    {m.leido ? <Mail size={15} /> : <MailOpen size={15} />}
                  </button>
                  <button
                    onClick={() => void eliminar(m)}
                    title="Eliminar"
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                {m.email && (
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 font-semibold text-negro hover:text-marca">
                    <Mail size={13} /> {m.email}
                  </a>
                )}
                {m.telefono && (
                  <a href={`tel:${m.telefono.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 font-semibold text-negro hover:text-marca">
                    <Phone size={13} /> {m.telefono}
                  </a>
                )}
              </div>

              <p className="mt-3 whitespace-pre-line rounded-lg bg-black/[0.03] px-3.5 py-3 text-[13.5px] leading-relaxed text-gris-oscuro">
                {m.mensaje}
              </p>
            </article>
          ))}
        </div>
      )}
      {dialogo}
    </div>
  );
};
