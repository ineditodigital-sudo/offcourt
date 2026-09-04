import React, { useCallback, useEffect, useState } from 'react';
import { History, RotateCcw, Download, Upload } from 'lucide-react';
import { api, formatoFecha, ErrorApi } from './api';
import { Aviso, Boton, Cargando, useConfirmacion } from './ui';
import { useDespachar } from './estado';

/**
 * Historial y respaldos.
 *
 * Cada vez que se publica, lo que estaba publicado antes pasa al historial. Se
 * guardan las 30 últimas. Recuperar una versión NO la publica: la deja como
 * borrador para revisarla y decidir.
 */

export const Versiones: React.FC<{ onAviso: (t: string, tipo?: 'ok' | 'error' | 'info') => void }> = ({ onAviso }) => {
  const [items, setItems] = useState<{ id: string; fecha: string | null; tamano: number }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [trabajando, setTrabajando] = useState('');
  const despachar = useDespachar();
  const { confirmar, dialogo } = useConfirmacion();

  const cargar = useCallback(async () => {
    // Sin poner «cargando» aquí: ya arranca encendido y las recargas
    // posteriores actualizan la lista en su sitio, sin parpadeo.
    try {
      const r = await api.versiones();
      setItems(r.versiones);
      setError('');
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el historial.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const restaurar = async (id: string, fecha: string | null) => {
    const ok = await confirmar({
      titulo: '¿Recuperar esta versión?',
      confirmar: 'Sí, recuperarla',
      texto: (
        <>
          <p className="mb-3">Se traerá el contenido de <strong>{formatoFecha(fecha)}</strong> para que lo revises.</p>
          <p className="text-[13px] text-tinta-suave">
            El sitio no cambia todavía: quedará como borrador y solo se verá cuando pulses «Publicar».
            Lo que tengas ahora sin publicar se perderá.
          </p>
        </>
      ),
    });
    if (!ok) return;
    setTrabajando(id);
    try {
      const r = await api.restaurar(id);
      despachar({ tipo: 'reemplazarDoc', doc: r.documento, motivo: 'restaurar' });
      onAviso('Versión recuperada. Revísala y publica si te convence.', 'ok');
    } catch (e) {
      onAviso(e instanceof ErrorApi ? e.message : 'No se pudo recuperar.', 'error');
    } finally {
      setTrabajando('');
    }
  };

  const importar = async (archivo: File) => {
    try {
      const texto = await archivo.text();
      const respaldo = JSON.parse(texto);
      const ok = await confirmar({
        titulo: '¿Cargar este respaldo?',
        confirmar: 'Sí, cargarlo',
        texto: (
          <>
            <p className="mb-3">Se cargará el contenido del archivo como borrador.</p>
            <p className="text-[13px] text-tinta-suave">El sitio no cambia hasta que publiques. Lo que tengas sin publicar se perderá.</p>
          </>
        ),
      });
      if (!ok) return;
      const r = await api.importar(respaldo);
      despachar({ tipo: 'reemplazarDoc', doc: r.documento, motivo: 'importar' });
      onAviso('Respaldo cargado. Revísalo y publica si está bien.', 'ok');
    } catch (e) {
      onAviso(e instanceof ErrorApi ? e.message : 'Ese archivo no parece un respaldo válido.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {error && <Aviso tipo="error">{error}</Aviso>}

      <section className="rounded-xl border border-borde bg-panel p-4">
        <h3 className="mb-1 text-[14px] font-bold text-tinta">Respaldo completo</h3>
        <p className="mb-3.5 text-[13px] leading-snug text-tinta-suave">
          Descarga un archivo con todos los textos del sitio. Guárdalo donde quieras; si algún día hace falta,
          se puede volver a cargar desde aquí.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={api.urlExportar()}
            className="oc-pulsable inline-flex items-center gap-2 rounded-xl bg-marca px-4 py-2.5 text-sm font-bold text-tinta hover:bg-marca-oscuro"
          >
            <Download size={15} /> Descargar respaldo
          </a>
          <label className="oc-pulsable inline-flex cursor-pointer items-center gap-2 rounded-xl border border-borde bg-panel px-4 py-2.5 text-sm font-bold text-tinta hover:bg-tinta/[0.04]">
            <Upload size={15} /> Cargar un respaldo
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void importar(f); e.target.value = ''; }}
            />
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-1 flex items-center gap-2 text-[14px] font-bold text-tinta">
          <History size={15} className="text-tinta-tenue" /> Versiones anteriores
        </h3>
        <p className="mb-3 text-[13px] leading-snug text-tinta-suave">
          Cada vez que publicas, la versión anterior se guarda aquí. Se conservan las 30 últimas.
        </p>

        {cargando ? (
          <Cargando texto="Cargando el historial…" />
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-borde px-4 py-10 text-center text-[13px] text-tinta-suave">
            Todavía no hay versiones anteriores. Aparecerán en cuanto publiques por segunda vez.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-panel px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-tinta">{formatoFecha(v.fecha)}</p>
                  <p className="text-[12px] text-tinta-tenue">{(v.tamano / 1024).toFixed(0)} KB</p>
                </div>
                <Boton tamano="sm" onClick={() => void restaurar(v.id, v.fecha)} cargando={trabajando === v.id}>
                  <RotateCcw size={13} /> Recuperar
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </section>
      {dialogo}
    </div>
  );
};
