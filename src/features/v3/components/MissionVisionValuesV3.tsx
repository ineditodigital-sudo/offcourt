import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar } from '../../../cms/Editable';

const K = 'paginas.nosotros.mvv';

export const MissionVisionValuesV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mvv = useContenido().paginas.nosotros.mvv;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk (antes esta página lo importaba en seco).
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.mvv-bento-item',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
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
      className="py-12 md:py-24 px-4 md:px-8 lg:px-12 bg-gris-oscuro dark:bg-negro transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto">

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min md:auto-rows-[150px]">

          {/* VISIÓN (Top Left - Spans 8 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-8 row-span-1 md:row-span-3 rounded-[32px] overflow-hidden relative min-h-[400px] md:min-h-0 bg-black">
            <div {...marcar(`${K}.visionImagen`)} className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${mvv.visionImagen.src})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <Tx k={`${K}.visionTitulo`} as="h2" className="font-outfit font-black italic text-6xl sm:text-7xl md:text-[110px] uppercase leading-none text-marca mb-4" />
              <Tx k={`${K}.visionTexto`} as="p" className="font-outfit text-white font-bold text-sm md:text-base leading-tight max-w-xl uppercase" />
            </div>
            {/* Small icon bottom right */}
            <div className="absolute bottom-10 right-10 text-marca font-bold text-4xl hidden md:block">
              <span className="inline-block border-4 border-marca rounded-full w-12 h-12 text-center leading-10">C</span>
            </div>
          </div>

          {/* VALORES (Top Right - Spans 4 cols, 4 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-4 row-span-1 md:row-span-4 rounded-[32px] overflow-hidden relative min-h-[500px] md:min-h-0 bg-black">
            <div {...marcar(`${K}.valoresImagen`)} className="absolute inset-0 bg-cover bg-center opacity-50 grayscale mix-blend-luminosity" style={{ backgroundImage: `url(${mvv.valoresImagen.src})` }}></div>
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div className="border border-marca rounded-full px-8 py-2">
                  <Tx k={`${K}.valoresTitulo`} as="span" className="font-outfit text-marca font-bold uppercase tracking-widest text-lg" />
                </div>
                <div className="w-16 h-16 bg-marca rounded-full"></div>
              </div>

              <ul className="font-outfit font-bold text-white text-2xl md:text-3xl uppercase leading-tight space-y-4 mt-12">
                {mvv.valores.map((_, i) => (
                  <Tx key={i} k={`${K}.valores.${i}.texto`} as="li" />
                ))}
              </ul>
            </div>
          </div>

          {/* Slogan Orange Box (Bottom Left - Spans 3 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-3 row-span-1 md:row-span-3 rounded-[32px] bg-marca p-8 md:p-10 flex flex-col justify-between min-h-[300px] md:min-h-0">
            <Tx k={`${K}.eslogan`} as="h3" multilinea className="font-outfit text-white font-medium text-3xl md:text-4xl leading-tight" />
            <div className="w-14 h-14 border-[3px] border-white rounded-full"></div>
          </div>

          {/* Image Box (Bottom Middle - Spans 5 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-5 row-span-1 md:row-span-3 rounded-[32px] overflow-hidden relative min-h-[300px] md:min-h-0 bg-black">
            <div {...marcar(`${K}.imagenLibre`)} className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${mvv.imagenLibre.src})` }}></div>
          </div>

          {/* MISIÓN (Bottom Right - Spans 4 cols, 2 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-4 row-span-1 md:row-span-2 rounded-[32px] bg-marca p-8 md:p-10 flex flex-col justify-center min-h-[300px] md:min-h-0">
            <Tx k={`${K}.misionTitulo`} as="h2" className="font-outfit font-black italic text-6xl md:text-7xl uppercase text-negro mb-4" />
            <Tx k={`${K}.misionTexto`} as="p" className="font-outfit text-negro font-bold text-sm leading-tight uppercase" />
          </div>

        </div>
      </div>
    </section>
  );
};
