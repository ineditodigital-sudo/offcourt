import React, { useRef, useEffect, useState } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { cargarGsap } from '../../../lib/gsapLazy';
import { Tx, Im, Btn, useEstiloDe } from '../../../cms/Editable';

const K = 'paginas.inicio.hero';

export const HeroV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // El vídeo pesa 10 MB. Si se descarga junto al resto, es él quien marca el LCP
  // y en 4G deja la portada en negro durante segundos. Lo pedimos solo cuando la
  // página ya pintó, y nunca en móvil o con ahorro de datos: ahí basta el póster.
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const heavyConnectionOk = !conn?.saveData;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktop || !heavyConnectionOk || prefersReducedMotion) return;

    let idleId = 0;
    const start = () => { idleId = window.setTimeout(() => setShowVideo(true), 200); };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }

    return () => {
      window.clearTimeout(idleId);
      window.removeEventListener('load', start);
    };
  }, []);

  /**
   * La entrada del hero (titular, subtítulo, botones, zoom del fondo, velo y
   * retícula) ahora es CSS: está en index.css bajo `oc-hero-*`. El motivo es el
   * LCP — el <h1> es el elemento que Google mide, y esperar a que descargue y
   * ejecute GSAP para poder mostrarlo costaba segundos. Los tiempos y las curvas
   * son los mismos que tenía el timeline.
   *
   * Lo único que sigue necesitando GSAP aquí es el parallax del fondo, y ese no
   * corre hasta que el visitante hace scroll: puede esperar tranquilamente a que
   * la librería llegue en su chunk aparte.
   */
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.to('.v3-hero-parallax', {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        });
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  // El <h1> agrupa dos líneas editables por separado; el estilo propio (tamaño,
  // peso…) se aplica al conjunto bajo la clave de la primera línea.
  const h1 = useEstiloDe(`${K}.titulo`,
    'oc-hero-up font-outfit italic text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tighter uppercase leading-[1.1] text-white pl-2 overflow-visible transition-colors',
    { ['--oc-y' as string]: '40px' });

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen w-full flex flex-col justify-between overflow-hidden bg-gris-claro dark:bg-negro transition-colors duration-300"
    >
      {/* Fondo: el póster pinta de inmediato y el vídeo entra encima al cargar.
          Dos capas a propósito: GSAP mueve la exterior con el scroll y el CSS
          hace el zoom en la interior. Si compartieran elemento, se pisarían la
          propiedad `transform` y el parallax dejaría de funcionar. */}
      <div className="v3-hero-parallax absolute inset-0">
        <div className="oc-hero-zoom absolute inset-0">
          <Im
            k={`${K}.imagenFondo`}
            altFijo=""
            aria-hidden="true"
            fetchPriority="high"
            width="1280"
            height="720"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {showVideo && (
            <video
              src="/hero-offcourt.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
        </div>
      </div>
      {/* Velo que se atenúa al abrir (sustituye al filter animado sobre el vídeo) */}
      <div className="oc-hero-veil absolute inset-0 bg-black pointer-events-none"></div>
      {/* Editorial overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent dark:from-negro dark:via-negro/35 dark:to-negro/20 transition-colors duration-300 pointer-events-none hidden dark:block"></div>

      {/* Tactical Grid Overlay Lines */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
        <div style={{ animationDelay: '0.0s' }} className="v3-tactical-grid-line-v absolute left-[10%] top-0 w-[1px] h-full bg-negro/10 dark:bg-white/10 transition-colors"></div>
        <div style={{ animationDelay: '0.1s' }} className="v3-tactical-grid-line-v absolute left-[50%] top-0 w-[1px] h-full bg-negro/10 dark:bg-white/10 transition-colors"></div>
        <div style={{ animationDelay: '0.2s' }} className="v3-tactical-grid-line-v absolute right-[10%] top-0 w-[1px] h-full bg-negro/10 dark:bg-white/10 transition-colors"></div>
        <div style={{ animationDelay: '0.0s' }} className="v3-tactical-grid-line-h absolute left-0 top-[20%] w-full h-[1px] bg-negro/10 dark:bg-white/10 transition-colors"></div>
        <div style={{ animationDelay: '0.1s' }} className="v3-tactical-grid-line-h absolute left-0 bottom-[120px] w-full h-[1px] bg-negro/10 dark:bg-white/10 transition-colors"></div>
      </div>

      {/* Center content */}
      <div className="flex-grow flex items-center px-6 md:px-12 lg:px-24 relative z-20">
        <div className="max-w-7xl mx-auto w-full pt-28 md:pt-16">
          <Tx k={`${K}.antetitulo`} as="span" className="text-marca uppercase tracking-[0.4em] text-xs font-sarabun font-extrabold block mb-4" />

          <h1 data-oc={`${K}.titulo`} className={h1.className} style={h1.style}>
            <Tx k={`${K}.titulo`} sel={`${K}.titulo`} as="span" /> <br />
            <Tx k={`${K}.tituloDestacado`} as="span" className="text-marca" />
          </h1>

          <Tx
            k={`${K}.bajada`}
            as="p"
            style={{ ['--oc-y' as string]: '30px', animationDelay: '0.15s' }}
            className="oc-hero-up font-sarabun text-sm md:text-base lg:text-sm xl:text-base 2xl:text-lg text-gris-claro mt-6 xl:mt-8 mb-8 xl:mb-10 max-w-2xl font-medium leading-relaxed tracking-wide transition-colors"
          />

          <div
            style={{ ['--oc-y' as string]: '24px', animationDelay: '0.3s' }}
            className="oc-hero-up flex flex-wrap items-center gap-4 font-sarabun"
          >
            <Btn
              k={`${K}.botonWhatsapp`}
              className="oc-pulsable bg-negro dark:bg-white hover:bg-marca dark:hover:bg-marca hover:text-negro text-white dark:text-negro font-bold uppercase tracking-widest text-xs px-10 py-5 rounded-[20px] flex items-center justify-center gap-2 transition-colors duration-200 border border-negro dark:border-white cursor-pointer"
            >
              <WhatsAppIcon size={18} />
            </Btn>
            <Btn
              k={`${K}.botonServicios`}
              className="oc-pulsable border border-black/20 dark:border-white/30 hover:border-marca dark:hover:border-marca hover:text-marca text-negro dark:text-white font-bold uppercase tracking-widest text-xs px-10 py-5 rounded-[20px] inline-flex items-center justify-center transition-colors duration-200 cursor-pointer bg-white/40 dark:bg-negro/40 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
