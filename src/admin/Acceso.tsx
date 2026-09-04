import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { api, ErrorApi, fijarCsrf } from './api';
import { Aviso, Boton } from './ui';

/**
 * Pantalla de acceso. Dos caras según el estado del servidor:
 *
 *  - Primera vez (no hay contraseña todavía): pide el código de instalación
 *    que imprimió el despliegue y deja crear la contraseña.
 *  - Uso normal: pide la contraseña.
 */

export const Acceso: React.FC<{ instalado: boolean; onEntrar: () => void }> = ({ instalado, onEntrar }) => {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!instalado && password !== repetir) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      const r = instalado ? await api.entrar(password) : await api.instalar(codigo.trim(), password);
      fijarCsrf(r.csrf);
      onEntrar();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo entrar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-lienzo px-4 py-10">
      <div className="oc-aparece w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <img src="/logo_negro.svg" alt="Offcourt Sports Group" className="h-11 w-auto" />
          <div>
            <h1 className="font-outfit text-xl font-extrabold uppercase tracking-tight text-negro">
              {instalado ? 'Administrar el sitio' : 'Configurar el panel'}
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-neutral-500">
              {instalado
                ? 'Escribe tu contraseña para entrar.'
                : 'Es la primera vez que entras. Crea aquí tu contraseña.'}
            </p>
          </div>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          {error && <Aviso tipo="error">{error}</Aviso>}

          {!instalado && (
            <>
              <Aviso tipo="info">
                El código de instalación te lo entregó quien desarrolló el sitio. Es de un solo uso: en cuanto crees
                tu contraseña, deja de servir.
              </Aviso>
              <div>
                <label className="oc-etiqueta">Código de instalación</label>
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="OFFCOURT-XXXX-XXXX"
                  autoComplete="off"
                  autoFocus
                  className="oc-campo font-mono tracking-wide"
                />
              </div>
            </>
          )}

          <div>
            <label className="oc-etiqueta">{instalado ? 'Contraseña' : 'Tu contraseña nueva'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={instalado ? 'current-password' : 'new-password'}
              autoFocus={instalado}
              className="oc-campo"
            />
            {!instalado && (
              <p className="oc-ayuda">
                Mínimo 10 caracteres. Una frase que recuerdes fácil —tres o cuatro palabras seguidas— es más segura
                que una palabra con símbolos raros.
              </p>
            )}
          </div>

          {!instalado && (
            <div>
              <label className="oc-etiqueta">Repite la contraseña</label>
              <input
                type="password"
                value={repetir}
                onChange={(e) => setRepetir(e.target.value)}
                autoComplete="new-password"
                className="oc-campo"
              />
            </div>
          )}

          <Boton submit tipo="principal" cargando={cargando} className="mt-1 w-full py-3">
            {instalado ? <><KeyRound size={16} /> Entrar</> : <><ShieldCheck size={16} /> Crear contraseña y entrar</>}
          </Boton>
        </form>

        <p className="mt-5 text-center text-[12px] leading-snug text-neutral-400">
          Este panel administra el contenido de offcourtsports.com.mx.
        </p>
      </div>
    </div>
  );
};
