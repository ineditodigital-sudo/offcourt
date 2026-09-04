import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Eye, Rocket, Undo2, Redo2, Monitor, Smartphone, MousePointerClick,
  LogOut, Check, Loader2, CircleAlert, ExternalLink, HelpCircle, Menu, SlidersHorizontal, RotateCcw,
} from 'lucide-react';
import { api, ErrorApi, fijarCsrf } from './api';
import { ProveedorEstado, useDespachar, useEstado } from './estado';
import { Acceso } from './Acceso';
import { Nodo } from './Campos';
import { Medios } from './Medios';
import { Mensajes } from './Mensajes';
import { Versiones } from './Versiones';
import { PanelEstilo } from './PanelEstilo';
import { Inicio } from './Inicio';
import { BarraLateral, type Modulo } from './BarraLateral';
import { Aviso, Boton, Cargando, Modal, useConfirmacion, useNotas } from './ui';
import { PAGINAS, defDe, entradaDe, paginaDe, SUELTOS, type Entrada } from './navegacion';
import { migas } from '../cms/dsl';
import { definicion } from '../cms/definicion';

/** Raíz del panel: decide entre la pantalla de acceso y el escritorio. */
export const Panel: React.FC = () => {
  const [estado, setEstado] = useState<'cargando' | 'acceso' | 'dentro'>('cargando');
  const [instalado, setInstalado] = useState(true);

  const comprobar = useCallback(async () => {
    // El await asegura que los setState de abajo ocurren fuera del cuerpo del
    // efecto que llama aquí, no en cascada durante el primer render.
    await Promise.resolve();
    try {
      const r = await api.estado();
      fijarCsrf(r.csrf);
      setInstalado(r.instalado);
      setEstado(r.autenticado ? 'dentro' : 'acceso');
    } catch {
      setInstalado(true);
      setEstado('acceso');
    }
  }, []);

  useEffect(() => { void comprobar(); }, [comprobar]);

  useEffect(() => {
    const alCaducar = () => setEstado('acceso');
    window.addEventListener('oc-sesion-caducada', alCaducar);
    return () => window.removeEventListener('oc-sesion-caducada', alCaducar);
  }, []);

  if (estado === 'cargando') return <div className="flex h-full items-center justify-center bg-lienzo"><Cargando /></div>;
  if (estado === 'acceso') return <Acceso instalado={instalado} onEntrar={() => setEstado('dentro')} />;

  return (
    <ProveedorEstado>
      <Escritorio onSalir={() => setEstado('acceso')} />
    </ProveedorEstado>
  );
};

// ---------------------------------------------------------------------------

const Escritorio: React.FC<{ onSalir: () => void }> = ({ onSalir }) => {
  const est = useEstado();
  const despachar = useDespachar();
  const { avisar, vista: notas } = useNotas();
  const { confirmar, dialogo } = useConfirmacion();

  const [modulo, setModulo] = useState<Modulo>('inicio');
  const [entrada, setEntrada] = useState<Entrada>(PAGINAS[0].entradas[0]);
  const [ladoDerecho, setLadoDerecho] = useState<'contenido' | 'aspecto'>('contenido');
  const [publicando, setPublicando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [sinLeer, setSinLeer] = useState(0);
  const [ayuda, setAyuda] = useState(false);
  const [cajon, setCajon] = useState(false);
  // La preferencia de menú plegado se recuerda: es de esas cosas que molesta
  // tener que volver a ajustar en cada visita.
  const [plegada, setPlegada] = useState(() => localStorage.getItem('oc-menu-plegado') === '1');
  // En móvil no caben la vista previa y el formulario a la vez.
  const [vistaMovil, setVistaMovil] = useState<'previa' | 'editar'>('editar');
  const iframe = useRef<HTMLIFrameElement>(null);
  const listoIframe = useRef(false);

  const plegar = (v: boolean) => {
    setPlegada(v);
    localStorage.setItem('oc-menu-plegado', v ? '1' : '0');
  };

  // ------------------------------------------------------------- carga inicial
  useEffect(() => {
    (async () => {
      try {
        const r = await api.borrador();
        despachar({ tipo: 'cargar', doc: r.documento, publicadoEn: r.publicadoEn, guardadoEn: r.borradorEn, hayBorrador: r.hayBorrador });
        if (r.hayBorrador) avisar('Recuperamos los cambios que dejaste sin publicar.', 'info');
      } catch (e) {
        setErrorCarga(e instanceof ErrorApi ? e.message : 'No se pudo cargar el contenido.');
        despachar({ tipo: 'cargar', doc: null, publicadoEn: null, guardadoEn: null, hayBorrador: false });
      }
      if (!localStorage.getItem('oc-visto-recorrido')) setAyuda(true);
    })();
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contador de mensajes sin leer, para la insignia del menú.
  useEffect(() => {
    api.mensajes().then((r) => setSinLeer(r.noLeidos)).catch(() => {});
  }, []);

  // ------------------------------------------------------------- autoguardado
  useEffect(() => {
    if (est.guardado !== 'pendiente') return;
    const t = setTimeout(async () => {
      despachar({ tipo: 'guardado', estado: 'guardando' });
      try {
        const r = await api.guardarBorrador(est.doc);
        despachar({ tipo: 'guardado', estado: 'guardado', en: r.guardadoEn });
      } catch (e) {
        despachar({ tipo: 'guardado', estado: 'error' });
        avisar(e instanceof ErrorApi ? e.message : 'No se pudo guardar el borrador.', 'error');
      }
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [est.doc, est.guardado]);

  // ------------------------------------------- puente con el sitio en el iframe
  const enviar = useCallback((mensaje: Record<string, unknown>) => {
    iframe.current?.contentWindow?.postMessage({ oc: true, ...mensaje }, window.location.origin);
  }, []);

  useEffect(() => {
    const alMensaje = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data || e.data.oc !== true) return;
      const m = e.data as { tipo: string; clave?: string | null; ruta?: string };
      if (m.tipo === 'listo') {
        listoIframe.current = true;
        enviar({ tipo: 'documento', documento: est.doc });
        enviar({ tipo: 'modo', activo: est.modoEdicion });
      } else if (m.tipo === 'clic') {
        despachar({ tipo: 'seleccionar', clave: m.clave ?? null });
        if (m.clave) {
          const ent = entradaDe(m.clave);
          if (ent) setEntrada(ent);
          setLadoDerecho('contenido');
          // En móvil, tocar un elemento lleva directo a su formulario.
          setVistaMovil('editar');
        }
      } else if (m.tipo === 'ruta' && m.ruta) {
        despachar({ tipo: 'ruta', ruta: m.ruta });
      }
    };
    window.addEventListener('message', alMensaje);
    return () => window.removeEventListener('message', alMensaje);
  }, [enviar, est.doc, est.modoEdicion, despachar]);

  // El sitio repinta con cada cambio: es la vista previa en vivo.
  useEffect(() => {
    if (listoIframe.current) enviar({ tipo: 'documento', documento: est.doc });
  }, [est.doc, enviar]);

  useEffect(() => {
    if (listoIframe.current) enviar({ tipo: 'modo', activo: est.modoEdicion });
  }, [est.modoEdicion, enviar]);

  useEffect(() => {
    if (listoIframe.current) enviar({ tipo: 'seleccionar', clave: est.seleccion, desplazar: false });
  }, [est.seleccion, enviar]);

  /** Lleva la vista previa a la página y sección de una entrada del menú. */
  const irA = useCallback((ent: Entrada) => {
    setEntrada(ent);
    setLadoDerecho('contenido');
    setModulo('contenido');
    setVistaMovil('editar');
    despachar({ tipo: 'seleccionar', clave: null });
    if (!listoIframe.current) return;
    enviar({ tipo: 'navegar', ruta: ent.web + (ent.ancla ? '#' + ent.ancla : '') });
  }, [enviar, despachar]);

  // ---------------------------------------------------------------- atajos
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); despachar({ tipo: 'deshacer' }); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); despachar({ tipo: 'rehacer' }); }
      else if (k === 's') { e.preventDefault(); avisar('Los cambios se guardan solos. Pulsa «Publicar» para que se vean en el sitio.', 'info'); }
    };
    document.addEventListener('keydown', alTecla);
    return () => document.removeEventListener('keydown', alTecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const alSalir = (e: BeforeUnloadEvent) => { if (est.hayCambiosSinPublicar) e.preventDefault(); };
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [est.hayCambiosSinPublicar]);

  // --------------------------------------------------------------- acciones
  const publicar = async () => {
    const ok = await confirmar({
      titulo: '¿Publicar los cambios?',
      confirmar: 'Sí, publicar',
      texto: (
        <>
          <p className="mb-3">Todo lo que has editado pasará a verse en <strong>offcourtsports.com.mx</strong> ahora mismo.</p>
          <p className="text-[13px] text-neutral-500">
            La versión que hay publicada se guarda en el historial, así que siempre puedes volver atrás.
          </p>
        </>
      ),
    });
    if (!ok) return;
    setPublicando(true);
    try {
      const r = await api.publicar(est.doc);
      despachar({ tipo: 'publicado', en: r.publicadoEn });
      avisar('¡Publicado! Los cambios ya se ven en el sitio.', 'ok');
    } catch (e) {
      avisar(e instanceof ErrorApi ? e.message : 'No se pudo publicar.', 'error');
    } finally {
      setPublicando(false);
    }
  };

  const descartar = async () => {
    const ok = await confirmar({
      titulo: '¿Descartar los cambios?',
      peligro: true,
      confirmar: 'Sí, descartar',
      texto: <>Se perderá todo lo que has editado desde la última publicación y volverás a lo que se ve ahora en el sitio.</>,
    });
    if (!ok) return;
    try {
      const r = await api.descartar();
      despachar({ tipo: 'reemplazarDoc', doc: r.documento, motivo: 'descartar' });
      enviar({ tipo: 'recargar' });
      avisar('Cambios descartados.', 'ok');
    } catch (e) {
      avisar(e instanceof ErrorApi ? e.message : 'No se pudo descartar.', 'error');
    }
  };

  const salir = async () => {
    if (est.hayCambiosSinPublicar) {
      const ok = await confirmar({
        titulo: '¿Salir con cambios sin publicar?',
        texto: <>Tus cambios quedan guardados como borrador y los encontrarás igual la próxima vez que entres.</>,
        confirmar: 'Salir',
      });
      if (!ok) return;
    }
    await api.salir().catch(() => {});
    onSalir();
  };

  if (!est.cargado) return <div className="flex h-full items-center justify-center bg-lienzo"><Cargando texto="Cargando el contenido del sitio…" /></div>;

  const def = defDe(entrada.ruta);
  const sueltos = SUELTOS[entrada.ruta];
  const pagina = paginaDe(entrada);

  return (
    <div className="flex h-full flex-col bg-lienzo">

      {/* ---------------------------------------------------------- barra superior */}
      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-black/8 bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-4">
        <button
          onClick={() => setCajon(true)}
          aria-label="Abrir el menú"
          className="-ml-1 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-black/5 hover:text-negro lg:hidden"
        >
          <Menu size={19} />
        </button>

        <button onClick={() => setModulo('inicio')} title="Ir al inicio del panel" className="shrink-0">
          <img src="/logo_negro.svg" alt="Offcourt" className="h-6 w-auto sm:h-7" />
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <EstadoGuardado />

          <button onClick={() => setAyuda(true)} title="Cómo funciona el panel" className="hidden rounded-lg p-2 text-neutral-400 transition-colors hover:bg-black/5 hover:text-negro sm:block">
            <HelpCircle size={16} />
          </button>

          {est.hayCambiosSinPublicar && (
            <>
              <Boton tamano="sm" tipo="suave" onClick={() => void descartar()} className="hidden sm:inline-flex">Descartar</Boton>
              {/* En móvil no hay teclado para Ctrl+Z ni sitio para la palabra:
                  el mismo botón, en icono, para no dejar sin salida a quien
                  edita desde el celular. */}
              <button
                onClick={() => void descartar()}
                title="Descartar los cambios sin publicar"
                aria-label="Descartar los cambios sin publicar"
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-black/5 hover:text-negro sm:hidden"
              >
                <RotateCcw size={16} />
              </button>
            </>
          )}

          <a
            href={est.ruta || '/'}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir el sitio publicado en otra pestaña"
            className="hidden items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[13px] font-bold text-negro transition-colors hover:bg-black/[0.04] sm:inline-flex"
          >
            <ExternalLink size={14} /> <span className="hidden md:inline">Ver sitio</span>
          </a>

          <Boton tipo="principal" tamano="sm" onClick={() => void publicar()} cargando={publicando} disabled={!est.hayCambiosSinPublicar}>
            <Rocket size={14} /> Publicar
          </Boton>

          <button onClick={() => void salir()} title="Cerrar sesión" className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-black/5 hover:text-negro">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- cuerpo */}
      <div className="flex min-h-0 flex-1">
        <BarraLateral
          modulo={modulo}
          onModulo={setModulo}
          entrada={entrada}
          onEntrada={irA}
          plegada={plegada}
          onPlegar={plegar}
          cajonAbierto={cajon}
          onCerrarCajon={() => setCajon(false)}
          sinLeer={sinLeer}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {modulo === 'contenido' ? (
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

              {/* Selector de vista, solo en pantallas estrechas */}
              <div className="flex shrink-0 items-center gap-1 border-b border-black/8 bg-white p-1.5 lg:hidden">
                {([['previa', 'Vista previa', Eye], ['editar', 'Editar', SlidersHorizontal]] as const).map(([id, etiqueta, Ico]) => (
                  <button
                    key={id}
                    onClick={() => setVistaMovil(id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold transition-colors ${
                      vistaMovil === id ? 'bg-marca/15 text-negro' : 'text-neutral-500 hover:bg-black/[0.04]'
                    }`}
                  >
                    <Ico size={14} /> {etiqueta}
                  </button>
                ))}
              </div>

              {/* Vista previa */}
              <section className={`relative min-h-0 flex-col bg-[#e9e9e6] lg:flex lg:flex-1 ${vistaMovil === 'previa' ? 'flex flex-1' : 'hidden'}`}>
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/8 bg-white/70 px-3 py-1.5">
                  <span className="hidden truncate text-[12px] font-semibold text-neutral-500 sm:inline">
                    offcourtsports.com.mx<span className="text-neutral-400">{est.ruta}</span>
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => despachar({ tipo: 'modoEdicion', activo: !est.modoEdicion })}
                      title={est.modoEdicion ? 'Desactivar la selección para navegar el sitio' : 'Activar la selección para editar'}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold transition-colors ${
                        est.modoEdicion ? 'bg-marca text-negro' : 'text-neutral-500 hover:bg-black/5'
                      }`}
                    >
                      {est.modoEdicion ? <MousePointerClick size={13} /> : <Eye size={13} />}
                      {est.modoEdicion ? 'Editando' : 'Navegando'}
                    </button>
                    <span className="mx-1 h-4 w-px bg-black/10" />
                    <button onClick={() => despachar({ tipo: 'dispositivo', dispositivo: 'escritorio' })} title="Ver como en computadora"
                      className={`rounded-lg p-1.5 transition-colors ${est.dispositivo === 'escritorio' ? 'bg-black/[0.08] text-negro' : 'text-neutral-400 hover:text-negro'}`}>
                      <Monitor size={14} />
                    </button>
                    <button onClick={() => despachar({ tipo: 'dispositivo', dispositivo: 'movil' })} title="Ver como en celular"
                      className={`rounded-lg p-1.5 transition-colors ${est.dispositivo === 'movil' ? 'bg-black/[0.08] text-negro' : 'text-neutral-400 hover:text-negro'}`}>
                      <Smartphone size={14} />
                    </button>
                    <span className="mx-1 h-4 w-px bg-black/10" />
                    <button onClick={() => despachar({ tipo: 'deshacer' })} disabled={est.pasado.length === 0} title="Deshacer (Ctrl+Z)"
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-negro disabled:opacity-25">
                      <Undo2 size={14} />
                    </button>
                    <button onClick={() => despachar({ tipo: 'rehacer' })} disabled={est.futuro.length === 0} title="Rehacer (Ctrl+Shift+Z)"
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-negro disabled:opacity-25">
                      <Redo2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-3">
                  <div className={`mx-auto h-full bg-white shadow-lg transition-all ${est.dispositivo === 'movil' ? 'w-[390px] max-w-full rounded-[26px] ring-8 ring-negro/85' : 'w-full rounded-lg'}`}>
                    <iframe
                      ref={iframe}
                      src="/?oc-editor=1"
                      title="Vista previa del sitio"
                      className={`h-full min-h-[28rem] w-full border-0 ${est.dispositivo === 'movil' ? 'rounded-[18px]' : 'rounded-lg'}`}
                    />
                  </div>
                </div>
              </section>

              {/* Formulario */}
              <aside className={`oc-scroll min-h-0 shrink-0 overflow-y-auto border-black/8 bg-lienzo lg:block lg:w-[22rem] lg:border-l ${vistaMovil === 'editar' ? 'block flex-1' : 'hidden'}`}>
                <div className="sticky top-0 z-10 border-b border-black/8 bg-white/95 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">{pagina?.etiqueta}</p>
                  <h2 className="font-outfit text-[17px] font-extrabold uppercase leading-tight tracking-tight text-negro">{entrada.etiqueta}</h2>
                  {est.seleccion && (
                    <div className="mt-2 flex items-center gap-1 rounded-lg bg-black/[0.04] p-0.5">
                      {(['contenido', 'aspecto'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setLadoDerecho(t)}
                          className={`flex-1 rounded-md px-2 py-1 text-[12px] font-bold transition-colors ${
                            ladoDerecho === t ? 'bg-white text-negro shadow-sm' : 'text-neutral-500 hover:text-negro'
                          }`}
                        >
                          {t === 'contenido' ? 'Contenido' : 'Aspecto'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-4">
                  {errorCarga && <div className="mb-4"><Aviso tipo="error">{errorCarga}</Aviso></div>}

                  {ladoDerecho === 'aspecto' && est.seleccion ? (
                    <>
                      <p className="mb-3 rounded-lg bg-white px-3 py-2 text-[12px] leading-snug text-neutral-500">
                        Estás cambiando el aspecto de: <strong className="text-negro">{migas(definicion, est.seleccion).slice(-2).join(' › ')}</strong>
                      </p>
                      <PanelEstilo clave={est.seleccion} />
                    </>
                  ) : sueltos ? (
                    <div className="flex flex-col gap-4">
                      {sueltos.map((r) => { const d = defDe(r); return d ? <Nodo key={r} def={d} ruta={r} /> : null; })}
                    </div>
                  ) : def ? (
                    <Nodo def={def} ruta={entrada.ruta} />
                  ) : (
                    <Aviso tipo="error">No se encontró esta sección.</Aviso>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="oc-scroll min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7">
                {modulo === 'inicio' && <Inicio onModulo={setModulo} onEntrada={irA} onAyuda={() => setAyuda(true)} sinLeer={sinLeer} />}
                {modulo === 'medios' && <Cabecera titulo="Fotos y archivos" texto="Todo lo que se usa en el sitio, en un solo lugar."><Medios /></Cabecera>}
                {modulo === 'mensajes' && <Cabecera titulo="Mensajes" texto="Copia de lo que llega por el formulario de contacto."><Mensajes onContador={setSinLeer} /></Cabecera>}
                {modulo === 'historial' && <Cabecera titulo="Historial y respaldos" texto="Vuelve a cualquier versión anterior del sitio."><Versiones onAviso={avisar} /></Cabecera>}
                {modulo === 'ajustes' && <Cabecera titulo="Ajustes" texto="Tu contraseña y qué hacer si algo se tuerce."><Ajustes onAviso={avisar} /></Cabecera>}
              </div>
            </div>
          )}
        </main>
      </div>

      {ayuda && <Recorrido onCerrar={() => { setAyuda(false); localStorage.setItem('oc-visto-recorrido', '1'); }} />}
      {dialogo}
      {notas}
    </div>
  );
};

const Cabecera: React.FC<{ titulo: string; texto: string; children: React.ReactNode }> = ({ titulo, texto, children }) => (
  <>
    <div className="mb-5">
      <h1 className="font-outfit text-[1.45rem] font-extrabold uppercase leading-tight tracking-tight text-negro">{titulo}</h1>
      <p className="mt-0.5 text-[13.5px] text-neutral-500">{texto}</p>
    </div>
    {children}
  </>
);

// -------------------------------------------------------------- estado guardado

const EstadoGuardado: React.FC = () => {
  const { guardado, hayCambiosSinPublicar } = useEstado();
  if (guardado === 'guardando') return <Etiqueta icono={<Loader2 size={13} className="animate-spin" />} texto="Guardando…" />;
  if (guardado === 'error') return <Etiqueta icono={<CircleAlert size={13} />} texto="No se pudo guardar" color="text-red-600" />;
  if (guardado === 'pendiente') return <Etiqueta icono={<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />} texto="Sin guardar" />;
  if (hayCambiosSinPublicar) return <Etiqueta icono={<Check size={13} />} texto="Guardado, sin publicar" />;
  return <Etiqueta icono={<Check size={13} />} texto="Todo publicado" color="text-emerald-600" />;
};

const Etiqueta: React.FC<{ icono: React.ReactNode; texto: string; color?: string }> = ({ icono, texto, color = 'text-neutral-500' }) => (
  <span className={`hidden items-center gap-1.5 text-[12px] font-semibold md:flex ${color}`}>{icono}{texto}</span>
);

// -------------------------------------------------------------------- ajustes

const Ajustes: React.FC<{ onAviso: (t: string, tipo?: 'ok' | 'error' | 'info') => void }> = ({ onAviso }) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [cargando, setCargando] = useState(false);

  const cambiar = async () => {
    if (nueva !== repetir) { onAviso('Las dos contraseñas nuevas no coinciden.', 'error'); return; }
    setCargando(true);
    try {
      await api.cambiarPassword(actual, nueva);
      setActual(''); setNueva(''); setRepetir('');
      onAviso('Contraseña cambiada.', 'ok');
    } catch (e) {
      onAviso(e instanceof ErrorApi ? e.message : 'No se pudo cambiar la contraseña.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex max-w-lg flex-col gap-5">
      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="mb-1 text-[15px] font-bold text-negro">Cambiar la contraseña</h2>
        <p className="mb-4 text-[13px] leading-snug text-neutral-500">
          Si crees que alguien más la conoce, cámbiala aquí. Necesitas saber la actual.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="oc-etiqueta">Contraseña actual</label>
            <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" className="oc-campo" />
          </div>
          <div>
            <label className="oc-etiqueta">Contraseña nueva</label>
            <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" className="oc-campo" />
            <p className="oc-ayuda">Mínimo 10 caracteres.</p>
          </div>
          <div>
            <label className="oc-etiqueta">Repite la nueva</label>
            <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" className="oc-campo" />
          </div>
          <Boton tipo="principal" onClick={() => void cambiar()} cargando={cargando} disabled={!actual || !nueva} className="self-start">
            Cambiar contraseña
          </Boton>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="mb-1 text-[15px] font-bold text-negro">Si algo se rompe</h2>
        <p className="text-[13px] leading-relaxed text-neutral-500">
          Nada de lo que hagas aquí puede romper el sitio: solo cambias textos, fotos y colores dentro de los
          límites del diseño. Si aun así algo no se ve bien, ve a <strong className="text-negro">Historial</strong> y
          recupera una versión anterior. Y si te quedas fuera del panel, quien desarrolló el sitio puede volver a
          darte acceso.
        </p>
      </section>
    </div>
  );
};

// ------------------------------------------------------------------- recorrido

const PASOS = [
  {
    titulo: 'Bienvenida a tu panel',
    texto: 'Desde aquí administras todo lo que se ve en offcourtsports.com.mx. No hace falta saber de programación: solo escribir, elegir fotos y pulsar Publicar.',
  },
  {
    titulo: 'Haz clic en lo que quieras cambiar',
    texto: 'Entra en Contenido y verás tu sitio en el centro. Pasa el ratón por encima: lo que se puede editar se marca con un borde naranja. Haz clic y sus opciones aparecen al lado.',
  },
  {
    titulo: 'Lo que ves es lo que queda',
    texto: 'Cada cambio se refleja al instante en la vista previa. Puedes verlo también como se vería en un celular con el botón del teléfono.',
  },
  {
    titulo: 'Nada se pierde',
    texto: 'Tus cambios se guardan solos como borrador, pero el sitio no cambia hasta que pulsas Publicar. Y siempre puedes deshacer con Ctrl+Z o recuperar una versión anterior desde Historial.',
  },
];

const Recorrido: React.FC<{ onCerrar: () => void }> = ({ onCerrar }) => {
  const [paso, setPaso] = useState(0);
  const ultimo = paso === PASOS.length - 1;
  return (
    <Modal
      titulo={PASOS[paso].titulo}
      ancho="sm"
      onCerrar={onCerrar}
      pie={
        <>
          <span className="mr-auto text-[12px] font-semibold text-neutral-400">{paso + 1} de {PASOS.length}</span>
          {paso > 0 && <Boton onClick={() => setPaso((p) => p - 1)}>Atrás</Boton>}
          <Boton tipo="principal" onClick={() => (ultimo ? onCerrar() : setPaso((p) => p + 1))}>
            {ultimo ? 'Empezar' : 'Siguiente'}
          </Boton>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-gris-oscuro">{PASOS[paso].texto}</p>
    </Modal>
  );
};
