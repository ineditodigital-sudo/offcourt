/**
 * Cliente de la API del panel (/cms/api.php).
 *
 * Todas las llamadas devuelven el JSON del servidor o lanzan ErrorApi con el
 * mensaje en lenguaje de persona que manda PHP. Si la sesión caduca, además de
 * lanzar se avisa al resto del panel con un evento para volver a la pantalla
 * de acceso sin perder lo que había en memoria.
 */

export class ErrorApi extends Error {
  codigo: number;
  datos: Record<string, unknown>;
  constructor(mensaje: string, codigo: number, datos: Record<string, unknown> = {}) {
    super(mensaje);
    this.codigo = codigo;
    this.datos = datos;
  }
}

let csrf = '';
export function fijarCsrf(token: string) { csrf = token; }

const BASE = '/cms/api.php';

interface Opciones {
  metodo?: 'GET' | 'POST';
  cuerpo?: unknown;
  form?: FormData;
  params?: Record<string, string>;
}

export async function llamar<T = Record<string, unknown>>(accion: string, opciones: Opciones = {}): Promise<T> {
  const params = new URLSearchParams({ accion, ...(opciones.params ?? {}) });
  const metodo = opciones.metodo ?? (opciones.cuerpo !== undefined || opciones.form ? 'POST' : 'GET');
  const cabeceras: Record<string, string> = { 'X-Requested-With': 'oc-panel' };
  if (metodo === 'POST') cabeceras['X-OC-CSRF'] = csrf;
  let body: BodyInit | undefined;
  if (opciones.form) {
    body = opciones.form;
  } else if (opciones.cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json';
    body = JSON.stringify(opciones.cuerpo);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}?${params}`, { method: metodo, headers: cabeceras, body, credentials: 'same-origin' });
  } catch {
    throw new ErrorApi('No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.', 0);
  }

  let datos: Record<string, unknown>;
  try {
    datos = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new ErrorApi('El servidor respondió algo inesperado. Recarga la página.', res.status);
  }

  if (!res.ok || datos.ok === false) {
    if (res.status === 401) window.dispatchEvent(new CustomEvent('oc-sesion-caducada'));
    throw new ErrorApi(String(datos.mensaje ?? 'Algo salió mal.'), res.status, datos);
  }
  return datos as T;
}

export const api = {
  estado: () => llamar<{ instalado: boolean; autenticado: boolean; csrf: string }>('estado'),
  instalar: (codigo: string, password: string) => llamar<{ csrf: string }>('instalar', { cuerpo: { codigo, password } }),
  entrar: (password: string) => llamar<{ csrf: string }>('entrar', { cuerpo: { password } }),
  salir: () => llamar('salir', { metodo: 'POST', cuerpo: {} }),
  cambiarPassword: (actual: string, nueva: string) => llamar('cambiar-password', { cuerpo: { actual, nueva } }),

  borrador: () => llamar<{ documento: unknown; hayBorrador: boolean; borradorEn: string | null; publicadoEn: string | null }>('borrador'),
  publicado: () => llamar<{ documento: unknown; publicadoEn: string | null }>('publicado'),
  guardarBorrador: (documento: unknown) => llamar<{ guardadoEn: string }>('guardar-borrador', { cuerpo: { documento } }),
  publicar: (documento: unknown) => llamar<{ publicadoEn: string }>('publicar', { cuerpo: { documento } }),
  descartar: () => llamar<{ documento: unknown }>('descartar', { metodo: 'POST', cuerpo: {} }),
  versiones: () => llamar<{ versiones: { id: string; fecha: string | null; tamano: number }[] }>('versiones'),
  version: (id: string) => llamar<{ documento: unknown; fecha: string | null }>('version', { params: { id } }),
  restaurar: (id: string) => llamar<{ documento: unknown; guardadoEn: string }>('restaurar', { cuerpo: { id } }),
  importar: (respaldo: unknown) => llamar<{ documento: unknown }>('importar', { cuerpo: { respaldo } }),
  urlExportar: () => `${BASE}?accion=exportar`,

  medios: () => llamar<{ subidos: Medio[]; sitio: Medio[]; gd: boolean; webp: boolean; maximo: number }>('medios'),
  subir: (archivo: File | Blob, nombre: string, alt = '') => {
    const form = new FormData();
    form.append('archivo', archivo, nombre);
    form.append('nombre', nombre.replace(/\.[a-z0-9]+$/i, ''));
    form.append('alt', alt);
    return llamar<{ item: Medio }>('subir', { form });
  },
  reemplazar: (url: string, archivo: File | Blob, nombre: string) => {
    const form = new FormData();
    form.append('url', url);
    form.append('archivo', archivo, nombre);
    return llamar<{ item: Medio; anterior: string }>('reemplazar', { form });
  },
  eliminarMedio: (url: string, forzar = false) => llamar('eliminar-medio', { cuerpo: { url, forzar } }),
  editarMedio: (url: string, cambios: { nombre?: string; alt?: string }) => llamar<{ item: Medio }>('editar-medio', { cuerpo: { url, ...cambios } }),
  usos: (url: string) => llamar<{ usos: { donde: string; ruta: string }[] }>('usos', { params: { url } }),

  mensajes: () => llamar<{ mensajes: Mensaje[]; noLeidos: number }>('mensajes'),
  mensajeLeido: (id: string, leido: boolean) => llamar('mensaje-leido', { cuerpo: { id, leido } }),
  mensajeEliminar: (id: string) => llamar('mensaje-eliminar', { cuerpo: { id } }),
  urlCsv: () => `${BASE}?accion=mensajes-csv`,
};

export interface Medio {
  url: string;
  nombre: string;
  alt: string;
  tipo: 'imagen' | 'documento' | 'video' | 'otro';
  origen: 'sitio' | 'subido';
  tamano: number;
  ancho: number | null;
  alto: number | null;
  fecha: string;
  pesado: boolean;
}

export interface Mensaje {
  id: string;
  fecha: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  leido: boolean;
}

export function formatoPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatoFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
