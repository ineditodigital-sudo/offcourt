import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar } from '../../../cms/Editable';
import { Icono } from '../../../cms/iconos';

const K = 'paginas.inicio.clientes';

/**
 * Tamaño de cada mosaico según su posición. El primero es el grande; el diseño
 * depende de que sean exactamente siete, por eso la lista no permite añadir.
 *
 *   Escritorio (3 columnas):        Móvil (2 columnas):
 *     [1: 2×2] [2: 1×2]               [1: ancho completo]
 *     [3: 2×1] [4]                    [2] [3]
 *     [5] [6] [7]                     [4] [5] · [6] [7]
 */
const DISPOSICION = [
  { escritorio: 'md:col-span-2 md:row-span-2', movil: 'col-span-2' },
  { escritorio: 'md:col-span-1 md:row-span-2', movil: 'col-span-1' },
  { escritorio: 'md:col-span-2 md:row-span-1', movil: 'col-span-1' },
  { escritorio: 'md:col-span-1 md:row-span-1', movil: 'col-span-1' },
  { escritorio: 'md:col-span-1 md:row-span-1', movil: 'col-span-1' },
  { escritorio: 'md:col-span-1 md:row-span-1', movil: 'col-span-1' },
  { escritorio: 'md:col-span-1 md:row-span-1', movil: 'col-span-1' },
];

export const IdealClientV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { items } = useContenido().paginas.inicio.clientes;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.bento-card',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            }
          }
        );
      }, sectionRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 px-4 sm:px-6 md:px-12 lg:px-24 bg-negro transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <Tx k={`${K}.antetitulo`} as="span" className="text-marca uppercase tracking-[0.3em] text-xs font-sarabun font-extrabold mb-3 block" />
          <h2 data-oc={`${K}.titulo`} className="font-outfit italic text-4xl sm:text-5xl md:text-6xl uppercase font-black text-white tracking-tighter leading-tight">
            <Tx k={`${K}.titulo`} sel={`${K}.titulo`} as="span" /><br />
            <Tx k={`${K}.tituloLinea2`} as="span" />
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[170px] sm:auto-rows-[190px] md:auto-rows-[200px] gap-3">
          {items.map((item, idx) => {
            const k = `${K}.items.${idx}`;
            const disp = DISPOSICION[idx] ?? DISPOSICION[DISPOSICION.length - 1];
            return (
              <div
                key={idx}
                className={`bento-card group relative overflow-hidden rounded-2xl bg-[#111111] border border-white/10 hover:border-marca/50 transition-colors duration-500 flex flex-col justify-end ${disp.movil} ${disp.escritorio}`}
              >
                {/* Background image */}
                <div
                  {...marcar(`${k}.imagen`)}
                  className="oc-crece-hover absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-[opacity,transform] duration-700"
                  style={{ backgroundImage: `url(${item.imagen.src})` }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 p-4 md:p-5">
                  <div data-oc={`${k}.icono`} className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-marca/20 border border-marca/40 flex items-center justify-center mb-2.5 group-hover:bg-marca/30 transition-colors duration-300">
                    <Icono clave={item.icono} size={15} className="text-marca" />
                  </div>
                  <Tx k={`${k}.titulo`} as="h3" className="font-outfit font-extrabold text-sm sm:text-base md:text-[15px] uppercase text-white leading-tight tracking-tight" />
                  <div className="overflow-hidden max-h-0 group-hover:max-h-16 transition-[max-height] duration-500 ease-out">
                    <Tx k={`${k}.texto`} as="p" className="font-sarabun text-xs text-white/50 mt-1.5 leading-snug" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
