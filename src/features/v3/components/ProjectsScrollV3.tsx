import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar } from '../../../cms/Editable';
import { Icono } from '../../../cms/iconos';

const K = 'paginas.inicio.soluciones';
const KS = 'paginas.servicios.items';

export const ProjectsScrollV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const contenido = useContenido();
  const { datos } = contenido.paginas.inicio.soluciones;

  // Las tarjetas son las verticales de «Servicios». Se conserva el índice
  // original para que la ruta editable apunte al elemento correcto aunque haya
  // verticales ocultas por medio.
  const verticales = contenido.paginas.servicios.items
    .map((item, indice) => ({ item, indice }))
    .filter(({ item }) => item.visible);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.v3-project-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );

        gsap.fromTo('.v3-stat-card',
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 1,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <div
      ref={containerRef}
      id="soluciones"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-gris-oscuro transition-colors duration-300"
    >
      <div className="max-w-[1600px] mx-auto space-y-16 md:space-y-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <Tx k={`${K}.antetitulo`} as="span" className="text-marca uppercase tracking-[0.3em] text-xs font-sarabun font-extrabold" />
            <Tx k={`${K}.titulo`} as="h2" className="font-outfit italic text-4xl sm:text-5xl md:text-6xl uppercase font-extrabold text-negro dark:text-white leading-[1]" />
          </div>
          <Tx k={`${K}.texto`} as="p" className="text-neutral-500 dark:text-gris-claro font-sarabun text-sm md:text-base max-w-sm leading-relaxed font-medium" />
        </div>

        {/* Hard Data / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-black/10 dark:border-white/10 py-12">
          {datos.map((dato, i) => {
            const k = `${K}.datos.${i}`;
            const separador = i === 0 ? '' : ' border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-8 md:pt-0 md:pl-12';
            return (
              <div key={i} className={`v3-stat-card flex flex-col items-center md:items-start text-center md:text-left${separador}`}>
                <Icono clave={dato.icono} data-oc={`${k}.icono`} className="text-marca mb-4" size={32} />
                <Tx k={`${k}.cifra`} as="h3" className="font-outfit italic text-5xl font-extrabold text-negro dark:text-white mb-2" />
                <Tx k={`${k}.texto`} as="p" className="font-sarabun text-sm font-bold text-neutral-500 uppercase tracking-widest" />
              </div>
            );
          })}
        </div>

        {/* Flex Accordion Projects */}
        <div className="flex flex-col lg:flex-row gap-2 w-full h-[1200px] lg:h-[650px]">
          {verticales.map(({ item, indice }) => {
            const k = `${KS}.${indice}`;
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/servicios/${item.id}`)}
                className="v3-project-card group relative overflow-hidden rounded-[24px] cursor-pointer shadow-lg bg-negro flex-1 lg:hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-end"
              >
                <div className="absolute inset-0">
                  <div
                    {...marcar(`${k}.imagenPortada`)}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.imagenPortada.src})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/70 to-transparent z-10 pointer-events-none"></div>
                </div>

                <div className="relative z-20 p-4 md:p-6 flex flex-col justify-end h-full">
                  <div className="mt-auto">
                    <Tx k={`${k}.subtitulo`} as="span" className="text-marca font-sarabun text-[9px] uppercase tracking-[0.2em] font-extrabold mb-2 block whitespace-nowrap overflow-hidden text-ellipsis" />

                    <Tx k={`${k}.titulo`} as="h3" className="font-outfit italic text-lg md:text-xl font-extrabold uppercase mb-2 text-white line-clamp-2" />

                    <Tx k={`${k}.entregablesCorto`} as="p" className="text-[10px] md:text-xs text-gris-claro font-sarabun font-medium mb-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 line-clamp-1" />

                    <div className="grid grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                      <div className="overflow-hidden">
                        <div className="pt-1 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          <Tx k={`${k}.resumen`} as="p" className="font-sarabun text-xs md:text-sm font-medium text-gris-claro mb-4 line-clamp-3" />
                          <div className="flex items-center gap-2 text-white font-sarabun font-bold text-xs uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-marca group-hover:text-negro transition-colors duration-300">
                              <ExternalLink size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
