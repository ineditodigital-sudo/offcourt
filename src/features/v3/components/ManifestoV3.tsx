import React, { useEffect, useRef, useState } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { Download, Play, X } from 'lucide-react';
import { PdfLink } from './PdfLink';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, Im, Btn, marcar } from '../../../cms/Editable';

const K = 'paginas.inicio.alianza';

export const ManifestoV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const alianza = useContenido().paginas.inicio.alianza;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.v3-manifesto-content > *',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <section
      id="alianza"
      ref={containerRef}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-gris-claro dark:bg-negro flex items-center justify-center transition-colors duration-300"
    >
      <div className="max-w-7xl w-full mx-auto relative z-20 flex flex-col md:flex-row items-stretch gap-12 bg-white dark:bg-gris-oscuro rounded-[48px] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5">

        {/* Left Side Content */}
        <div className="v3-manifesto-content w-full md:w-1/2 p-8 md:p-16 flex flex-col items-start space-y-8">

          <Tx k={`${K}.etiqueta`} as="span" className="text-marca uppercase tracking-[0.3em] text-xs font-sarabun font-extrabold inline-block px-4 py-1 border border-marca/30 rounded-full bg-marca/10" />

          <div className="w-64 md:w-80 h-auto py-2">
            <Im
              k={`${K}.logo`}
              loading="lazy" decoding="async" width="320" height="90"
              className="w-full h-auto object-contain drop-shadow-lg invert dark:invert-0"
            />
          </div>

          <Tx k={`${K}.titulo`} as="h2" className="font-outfit italic text-3xl sm:text-4xl md:text-5xl uppercase font-extrabold leading-tight text-negro dark:text-white" />

          <Tx k={`${K}.texto`} as="p" className="font-sarabun text-sm md:text-base text-gris-oscuro dark:text-gris-claro font-medium leading-relaxed max-w-lg" />

          <div className="pt-6 w-full space-y-5">
            <Btn
              k={`${K}.botonContacto`}
              className="bg-marca hover:bg-marca-oscuro text-negro font-sarabun font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-[20px] inline-flex items-center justify-center gap-3 transition-colors duration-300 shadow-lg cursor-pointer"
            />

            {alianza.presentaciones.length > 0 && (
              <div>
                <Tx k={`${K}.tituloPresentaciones`} as="p" className="text-xs uppercase tracking-[0.2em] font-extrabold text-neutral-500 mb-3 font-sarabun" />
                <div className="flex flex-col sm:flex-row gap-3">
                  {alianza.presentaciones.map((p, i) => (
                    <PdfLink
                      key={i}
                      href={p.archivo.src}
                      {...marcar(`${K}.presentaciones.${i}`)}
                      className="border-2 border-marca text-marca hover:bg-marca hover:text-negro font-sarabun font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-[16px] inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      <Download size={16} /> <Tx k={`${K}.presentaciones.${i}.texto`} sel={`${K}.presentaciones.${i}`} as="span" />
                    </PdfLink>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side Image */}
        <div className="w-full md:w-1/2 min-h-[400px] md:min-h-[600px] relative group overflow-hidden">
          <div
            {...marcar(`${K}.imagen`)}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-105"
            style={{ backgroundImage: `url(${alianza.imagen.src})` }}
          ></div>
          <div className="absolute inset-0 bg-black/25 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-gris-oscuro md:w-32 hidden md:block z-10 pointer-events-none"></div>

          {/* Botón reproducir video */}
          {alianza.video.src && (
            <button
              onClick={() => setVideoOpen(true)}
              aria-label="Reproducir video"
              {...marcar(`${K}.video`)}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full bg-marca/40 animate-ping"></span>
                <span className="relative w-20 h-20 rounded-full bg-marca flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                  <Play className="text-negro ml-1" size={32} fill="currentColor" />
                </span>
              </span>
              <Tx k={`${K}.textoVideo`} as="span" className="mt-5 font-sarabun text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm" />
            </button>
          )}
        </div>

      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative z-10 w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVideoOpen(false)} aria-label="Cerrar" className="absolute -top-10 right-0 text-white/80 hover:text-white z-20 cursor-pointer">
              <X size={28} />
            </button>
            <video
              src={alianza.video.src}
              poster={alianza.imagen.src}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            ></video>
          </div>
        </div>
      )}
    </section>
  );
};
