import React, { type CSSProperties } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router-dom';
import { useDocumento } from './ContenidoContext';
import { obtener } from './rutas';
import { aplicarEstilo } from './estilos';
import { sanitizarHtml } from './sanitizar';
import { scrollToSection } from '../lib/smoothScroll';
import type { Boton as BotonValor, Imagen as ImagenValor } from './dsl';

/**
 * Piezas con las que los componentes del sitio pintan contenido editable.
 *
 * Cada una escribe en el DOM la ruta del campo que muestra:
 *
 *   data-oc    = «este elemento se puede seleccionar en el panel». Su valor es
 *                la ruta del campo o, en un botón, la del botón entero.
 *   data-oc-t  = «el texto de dentro es exactamente el valor del campo X».
 *                Lo usa index.php para sustituir los textos del hero que va
 *                pre-renderizado en el HTML, sin esperar a React.
 *   data-oc-h  = igual, pero el contenido es HTML con formato (no se sustituye
 *                en el servidor).
 *
 * También aplican el estilo propio que la persona haya elegido para ese
 * elemento (tamaño, peso, color…), ver estilos.ts.
 */

type Etiqueta = keyof React.JSX.IntrinsicElements;

/** Lee un campo por su ruta. El tipo lo pone quien llama. */
export function useCampo<T = unknown>(ruta: string): T {
  const { doc } = useDocumento();
  return obtener(doc.datos, ruta) as T;
}

/** Atributo para marcar como seleccionable un contenedor cualquiera (fondos, tarjetas). */
export function marcar(ruta: string): { 'data-oc': string } {
  return { 'data-oc': ruta };
}

/**
 * Clases y estilo de un contenedor que agrupa varios textos (un <h1> con dos
 * líneas) y que debe llevar el estilo propio elegido para la ruta dada.
 */
export function useEstiloDe(ruta: string, className: string, style?: CSSProperties): { className: string; style: CSSProperties | undefined } {
  const { doc } = useDocumento();
  return aplicarEstilo(className, doc.estilos[ruta], style);
}

interface TxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Ruta del campo de texto. */
  k: string;
  as?: Etiqueta;
  /**
   * Si el elemento seleccionable es un padre (un botón que contiene este
   * texto), se indica aquí su ruta y este nodo deja de ser seleccionable por
   * sí mismo: solo aporta el texto.
   */
  sel?: string;
  /** Respeta los saltos de línea del texto. */
  multilinea?: boolean;
}

/** Texto plano editable. */
export const Tx: React.FC<TxProps> = ({ k, as = 'span', sel, multilinea, className = '', style, ...rest }) => {
  const { doc } = useDocumento();
  const valor = obtener(doc.datos, k);
  const texto = typeof valor === 'string' ? valor : '';
  const claveEstilo = sel ?? k;
  const cls = multilinea ? `${className} whitespace-pre-line` : className;
  const { className: clase, style: estilo } = aplicarEstilo(cls, doc.estilos[claveEstilo], style);
  const Tag = as as React.ElementType;
  const marcas = sel ? { 'data-oc-t': k } : { 'data-oc': k, 'data-oc-t': k };
  return <Tag {...rest} {...marcas} className={clase} style={estilo}>{texto}</Tag>;
};

interface RicoProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  k: string;
  as?: Etiqueta;
}

/** Texto con formato limitado (negrita, listas, enlaces…), saneado antes de pintarse. */
export const Rico: React.FC<RicoProps> = ({ k, as = 'div', className = '', style, ...rest }) => {
  const { doc } = useDocumento();
  const valor = obtener(doc.datos, k);
  const html = sanitizarHtml(typeof valor === 'string' ? valor : '');
  const { className: clase, style: estilo } = aplicarEstilo(className, doc.estilos[k], style);
  const Tag = as as React.ElementType;
  return <Tag {...rest} data-oc={k} data-oc-h={k} className={clase} style={estilo} dangerouslySetInnerHTML={{ __html: html }} />;
};

interface ImProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  k: string;
  /** Texto alternativo fijo, si la imagen es decorativa y no debe usar el del campo. */
  altFijo?: string;
}

/** Imagen editable: {src, alt}. */
export const Im: React.FC<ImProps> = ({ k, altFijo, ...rest }) => {
  const { doc } = useDocumento();
  const valor = obtener(doc.datos, k) as ImagenValor | undefined;
  return <img {...rest} data-oc={k} src={valor?.src ?? ''} alt={altFijo ?? valor?.alt ?? ''} />;
};

interface BtnProps {
  k: string;
  className?: string;
  style?: CSSProperties;
  /** Icono u otro contenido que va antes del texto. */
  children?: React.ReactNode;
  /** Contenido que va después del texto. */
  despues?: React.ReactNode;
}

/**
 * Botón o enlace editable: texto + destino.
 *
 * Destinos que entiende:
 *   «whatsapp»   → abre el número de WhatsApp de Datos de contacto
 *   «#seccion»   → baja hasta esa sección (si no estamos en la portada, va a /#seccion)
 *   «/ruta»      → página interna del sitio
 *   «https://…»  → enlace externo, en pestaña nueva si así se marcó
 */
export const Btn: React.FC<BtnProps> = ({ k, className = '', style, children, despues }) => {
  const { doc } = useDocumento();
  const valor = (obtener(doc.datos, k) ?? { texto: '', url: '', nuevaPestana: false }) as BotonValor;
  const enRouter = useInRouterContext();
  const { className: clase, style: estilo } = aplicarEstilo(className, doc.estilos[k], style);
  const contenido = (
    <>
      {children}
      <span data-oc-t={`${k}.texto`}>{valor.texto}</span>
      {despues}
    </>
  );
  const url = (valor.url || '').trim();

  if (url === 'whatsapp') {
    return (
      <a data-oc={k} href={`https://wa.me/${doc.datos.global.contacto.whatsapp}`} target="_blank" rel="noopener noreferrer" className={clase} style={estilo}>
        {contenido}
      </a>
    );
  }

  if (url.startsWith('#')) {
    return <AnclaSeccion k={k} id={url.slice(1)} className={clase} style={estilo} enRouter={enRouter}>{contenido}</AnclaSeccion>;
  }

  if (url.startsWith('/') && enRouter) {
    return <Link data-oc={k} to={url} className={clase} style={estilo}>{contenido}</Link>;
  }

  const externo = /^https?:\/\//i.test(url);
  return (
    <a
      data-oc={k}
      href={url || '#'}
      className={clase}
      style={estilo}
      target={valor.nuevaPestana && externo ? '_blank' : undefined}
      rel={valor.nuevaPestana && externo ? 'noopener noreferrer' : undefined}
    >
      {contenido}
    </a>
  );
};

const AnclaSeccion: React.FC<{ k: string; id: string; className: string; style?: CSSProperties; enRouter: boolean; children: React.ReactNode }> =
  ({ k, id, className, style, enRouter, children }) => {
    // Fuera del router (hero pre-renderizado) no hay useLocation: se asume la portada.
    const EnRouter = enRouter ? ConRuta : SinRuta;
    return <EnRouter k={k} id={id} className={className} style={style}>{children}</EnRouter>;
  };

const SinRuta: React.FC<{ k: string; id: string; className: string; style?: CSSProperties; children: React.ReactNode }> =
  ({ k, id, className, style, children }) => (
    <a
      data-oc={k}
      href={`#${id}`}
      className={className}
      style={style}
      onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
    >
      {children}
    </a>
  );

const ConRuta: React.FC<{ k: string; id: string; className: string; style?: CSSProperties; children: React.ReactNode }> =
  ({ k, id, className, style, children }) => {
    const { pathname } = useLocation();
    if (pathname !== '/') {
      return <Link data-oc={k} to={`/#${id}`} className={className} style={style}>{children}</Link>;
    }
    return <SinRuta k={k} id={id} className={className} style={style}>{children}</SinRuta>;
  };
